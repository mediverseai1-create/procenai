// Supabase Edge Function: all Gemini calls happen here so the API key never reaches the browser.
// Deploy:  supabase functions deploy ai   |   Secret: supabase secrets set GEMINI_API_KEY=...
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GEMINI_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";
const TEXT_MODEL = Deno.env.get("GEMINI_TEXT_MODEL") ?? "gemini-2.5-flash";
const IMAGE_MODEL = Deno.env.get("GEMINI_IMAGE_MODEL") ?? "gemini-2.5-flash-image";
const API = "https://generativelanguage.googleapis.com/v1beta/models";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...cors, "Content-Type": "application/json" } });

const SYSTEM = `You are ProcenAI, an AI procurement and commerce-intelligence assistant for e-commerce companies, retail brands, distributors and procurement teams.
Rules:
- Never invent suppliers, certifications, prices, regulations or sources. If you do not know, say so and ask for the missing details.
- Clearly separate FACTS (from the user's documents or cited sources), ESTIMATES (projected figures) and ASSUMPTIONS. Label every projected figure as an estimate.
- Ask concise clarifying questions when key details (quantity, destination, spec, budget) are missing.
- Be practical, structured and decision-oriented. Recommend human approval before any supplier, product or cost baseline is treated as confirmed.
Return JSON: {"content": string (markdown reply), "cards": Card[]} where Card = {"type": one of research_result|supplier_comparison|quote_analysis|cost_analysis|sourcing_brief|specification|shipping_plan|product_evaluation|risk_review, "title": string, "fields": [{"label","value","kind": "fact"|"estimate"|"assumption"}], "columns": string[]?, "rows": string[][]?, "notes": string[]?, "sources": [{"name","title","url"}]?}.
Use cards for structured deliverables; "cards" may be empty for conversational replies.`;

type Part = Record<string, unknown>;

async function gemini(model: string, body: Record<string, unknown>) {
  const r = await fetch(`${API}/${model}:generateContent?key=${GEMINI_KEY}`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j?.error?.message ?? `Gemini error ${r.status}`);
  return j;
}
const textOf = (j: any) => (j?.candidates?.[0]?.content?.parts ?? []).map((p: Part) => (p.text as string) ?? "").join("");
function parseJson(t: string) {
  const s = t.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  try { return JSON.parse(s); } catch { const m = s.match(/\{[\s\S]*\}/); if (m) try { return JSON.parse(m[0]); } catch { /* fallthrough */ } }
  return null;
}
const attParts = (a: { mime: string; data: string }[] = []): Part[] => a.slice(0, 5).map((x) => ({ inlineData: { mimeType: x.mime, data: x.data } }));

function profileBlock(p: any) {
  if (!p) return "";
  const bits = [
    p.business_name && `Business: ${p.business_name} (${p.business_type ?? "n/a"})`,
    p.selling_countries?.length && `Sells in: ${p.selling_countries.join(", ")}`,
    p.sourcing_countries?.length && `Sources from: ${p.sourcing_countries.join(", ")}`,
    p.product_categories?.length && `Categories: ${p.product_categories.join(", ")}`,
    p.target_customers && `Target customers: ${p.target_customers}`,
    p.order_budget && `Order budget: ${p.order_budget}`,
    p.preferred_order_quantity && `Preferred order quantity: ${p.preferred_order_quantity}`,
    p.shipping_methods?.length && `Shipping methods: ${p.shipping_methods.join(", ")}`,
    p.target_gross_margin != null && `Target gross margin: ${p.target_gross_margin}%`,
    p.tone_of_voice && `Brand tone: ${p.tone_of_voice}`,
    p.brand_description && `Brand: ${p.brand_description}`,
    p.brand_colors?.length && `Brand colors: ${p.brand_colors.join(", ")}`,
    p.visual_style && `Visual style: ${p.visual_style}`,
  ].filter(Boolean);
  return bits.length ? `\n\nBusiness profile:\n${bits.join("\n")}` : "";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    if (!GEMINI_KEY) return json({ error: "GEMINI_API_KEY is not configured on the server." }, 500);
    const auth = req.headers.get("Authorization") ?? "";
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
    const { data: u } = await sb.auth.getUser();
    if (!u.user) return json({ error: "Please sign in." }, 401);
    const uid = u.user.id;
    const { data: profile } = await sb.from("profiles").select("*").eq("user_id", uid).maybeSingle();
    const body = await req.json();
    const ctx = profileBlock(profile);

    switch (body.action) {
      case "chat": {
        let convId: string | null = body.conversationId ?? null;
        if (!convId) {
          const title = String(body.text || body.productUrl || "New thread").slice(0, 60);
          const { data, error } = await sb.from("conversations").insert({ user_id: uid, title, kind: body.kind ?? "workspace" }).select("id").single();
          if (error) throw error; convId = data.id;
        }
        const userContent = [body.text, body.productUrl].filter(Boolean).join("\n");
        await sb.from("messages").insert({ conversation_id: convId, user_id: uid, role: "user", content: userContent });

        const { data: hist } = await sb.from("messages").select("role, content").eq("conversation_id", convId).order("created_at").limit(30);
        const contents = (hist ?? []).map((m: any, i: number, arr: any[]) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }, ...(i === arr.length - 1 && m.role === "user" ? attParts(body.attachments) : [])],
        }));
        const research = !!body.research;
        const req2: Record<string, unknown> = {
          systemInstruction: { parts: [{ text: SYSTEM + ctx + (body.productUrl ? `\n\nThe user shared this link — treat its contents as unverified until confirmed: ${body.productUrl}` : "") }] },
          contents,
        };
        if (research) {
          req2.tools = [{ google_search: {} }];
          (req2.systemInstruction as any).parts[0].text += "\n\nUse Google Search and cite real sources. Reply with ONLY the JSON object.";
        } else req2.generationConfig = { responseMimeType: "application/json" };

        const g = await gemini(TEXT_MODEL, req2);
        const parsed = parseJson(textOf(g));
        const content: string = parsed?.content ?? textOf(g);
        const cards = Array.isArray(parsed?.cards) ? parsed.cards : [];
        if (research) {
          const chunks = g?.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
          const sources = chunks.filter((c: any) => c.web?.uri).map((c: any) => ({ name: c.web.title ?? new URL(c.web.uri).hostname, url: c.web.uri, accessed: new Date().toISOString().slice(0, 10) }));
          if (sources.length) {
            if (cards.length) cards[0].sources = sources;
            else cards.push({ type: "research_result", title: "Sources", sources });
          }
        }
        const { data: saved, error } = await sb.from("messages").insert({ conversation_id: convId, user_id: uid, role: "assistant", content, cards }).select("id").single();
        if (error) throw error;
        await sb.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", convId);
        return json({ conversationId: convId, assistant: { id: saved.id, content, cards } });
      }

      case "copy": {
        const n = Math.min(3, Math.max(1, Number(body.variations) || 2));
        const prompt = `Write ${n} distinct variations of: ${body.contentType}.
Product: ${body.product ?? "n/a"}\nPlatform: ${body.platform ?? "n/a"}\nTarget customer: ${body.customer ?? "n/a"}\nTone: ${body.tone}\nLength: ${body.length}\nCall to action: ${body.cta ?? "none"}\nInstructions: ${body.instructions || "none"}
${body.context ? `\nApproved product information:\n${body.context}` : ""}
Use only facts supplied above. Do NOT invent specifications, certifications, statistics or claims. After each variation, add a line starting "Verify before publishing:" listing any unconfirmed points (or "none").
Return JSON: {"variations": string[]} with exactly ${n} items.`;
        const g = await gemini(TEXT_MODEL, {
          systemInstruction: { parts: [{ text: "You are ProcenAI's commerce copywriter." + ctx }] },
          contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json" },
        });
        const parsed = parseJson(textOf(g));
        return json({ variations: Array.isArray(parsed?.variations) ? parsed.variations.map(String) : [textOf(g)] });
      }

      case "refine": {
        const g = await gemini(TEXT_MODEL, {
          systemInstruction: { parts: [{ text: "You edit commerce copy. Return only the revised copy. Never add new factual claims." + ctx }] },
          contents: [{ role: "user", parts: [{ text: `Make this copy: ${body.action}. Tone: ${body.tone}.\n\n${body.text}` }] }],
        });
        return json({ text: textOf(g).trim() });
      }

      case "image": {
        const prompt = `Create a ${body.assetType} concept for ${body.product || "a commerce product"}. Style: ${body.style}. Aspect ratio: ${body.ratio}. ${body.notes ?? ""}${body.context ? `\nApproved product info: ${String(body.context).slice(0, 1200)}` : ""}${profile?.brand_colors?.length ? `\nBrand colors: ${profile.brand_colors.join(", ")}` : ""}${profile?.visual_style ? `\nBrand visual style: ${profile.visual_style}` : ""}
No fake text, logos, badges or certifications. Keep any supplied product photo accurate.`;
        const g = await gemini(IMAGE_MODEL, {
          contents: [{ role: "user", parts: [{ text: prompt }, ...attParts(body.references)] }],
          generationConfig: { responseModalities: ["IMAGE", "TEXT"] },
        });
        const img = (g?.candidates?.[0]?.content?.parts ?? []).find((p: any) => p.inlineData);
        if (!img) return json({ error: "The model did not return an image. Try adjusting your notes." }, 422);
        return json({ image: `data:${img.inlineData.mimeType};base64,${img.inlineData.data}`, prompt });
      }

      case "explain": {
        const g = await gemini(TEXT_MODEL, {
          systemInstruction: { parts: [{ text: SYSTEM + ctx }] },
          contents: [{ role: "user", parts: [{ text: String(body.text) }] }],
        });
        return json({ text: textOf(g) });
      }
      default: return json({ error: "Unknown action." }, 400);
    }
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Unexpected error." }, 500);
  }
});
