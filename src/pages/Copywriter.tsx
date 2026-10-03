import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Bookmark, Copy, Download, Loader2, Wand2 } from "lucide-react";
import { PageHeader } from "../components/AppShell";
import { aiCopy, aiRefine, saveItem } from "../lib/ai";

const TYPES = ["Product listing", "Product description", "Marketplace bullet points", "Email campaign", "Social caption", "Video / UGC script", "Landing page section"];
const TONES = ["Professional", "Friendly", "Premium", "Playful", "Direct", "Persuasive"];
const LENGTHS = ["Short", "Medium", "Long"];
const REFINE = ["Shorter", "Longer", "More persuasive", "More premium", "Simpler"];

export default function Copywriter() {
  const [type, setType] = useState(TYPES[1]);
  const [product, setProduct] = useState("");
  const [platform, setPlatform] = useState("");
  const [customer, setCustomer] = useState("");
  const [instructions, setInstructions] = useState("");
  const [tone, setTone] = useState(TONES[0]);
  const [length, setLength] = useState(LENGTHS[1]);
  const [cta, setCta] = useState("");
  const [variations, setVariations] = useState(2);
  const [context, setContext] = useState<string | null>(null);
  const [out, setOut] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [refining, setRefining] = useState<number | null>(null);

  useEffect(() => { try { const c = localStorage.getItem("procenai:context"); if (c) { setContext(c); localStorage.removeItem("procenai:context"); } } catch { /* ignore */ } }, []);

  async function generate() {
    setBusy(true);
    try {
      const r = await aiCopy({ contentType: type, instructions, product: product || null, platform: platform || null, customer: customer || null, tone, length, cta: cta || null, variations, context });
      setOut(r.variations);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Could not generate copy."); }
    finally { setBusy(false); }
  }
  async function refine(i: number, action: string) {
    setRefining(i);
    try { const r = await aiRefine({ text: out[i], action, tone }); setOut((o) => o.map((t, j) => (j === i ? r.text : t))); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Could not refine."); }
    finally { setRefining(null); }
  }
  async function save(i: number) {
    try { await saveItem("product", `${type} — ${product || "Untitled"}`, { text: out[i], type }, { subtitle: "Copy" }); toast.success("Saved to your library."); }
    catch { toast.error("Could not save."); }
  }
  function download(i: number) {
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([out[i]], { type: "text/plain" })); a.download = `${type.toLowerCase().replace(/\W+/g, "-")}.txt`; a.click();
  }

  return (
    <>
      <PageHeader title="AI Copywriter" sub="Commerce copy written from your approved product facts and brand profile. Nothing is invented — unconfirmed points are listed for your team to verify before publishing." />
      {context && <div className="panel mb-4 border-primary/40 bg-primary/5 px-4 py-2.5 text-sm">Using saved product information from the AI Workspace.</div>}
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <div className="panel space-y-4 self-start p-5">
          <div><label className="label">Content type</label><select className="input" value={type} onChange={(e) => setType(e.target.value)}>{TYPES.map((t) => <option key={t}>{t}</option>)}</select></div>
          <div><label className="label">Product</label><input className="input" value={product} onChange={(e) => setProduct(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Platform</label><input className="input" placeholder="Amazon, Shopify…" value={platform} onChange={(e) => setPlatform(e.target.value)} /></div>
            <div><label className="label">Customer</label><input className="input" value={customer} onChange={(e) => setCustomer(e.target.value)} /></div>
          </div>
          <div><label className="label">Instructions</label><textarea className="input min-h-24" value={instructions} onChange={(e) => setInstructions(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Tone</label><select className="input" value={tone} onChange={(e) => setTone(e.target.value)}>{TONES.map((t) => <option key={t}>{t}</option>)}</select></div>
            <div><label className="label">Length</label><select className="input" value={length} onChange={(e) => setLength(e.target.value)}>{LENGTHS.map((t) => <option key={t}>{t}</option>)}</select></div>
            <div><label className="label">Call to action</label><input className="input" value={cta} onChange={(e) => setCta(e.target.value)} /></div>
            <div><label className="label">Variations</label><select className="input" value={variations} onChange={(e) => setVariations(Number(e.target.value))}>{[1, 2, 3].map((n) => <option key={n}>{n}</option>)}</select></div>
          </div>
          <button className="btn btn-primary w-full" disabled={busy} onClick={() => void generate()}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />} Generate copy</button>
        </div>
        <div className="space-y-4">
          {out.length === 0 && !busy && <div className="panel grid place-items-center p-12 text-center text-sm text-muted-foreground">Your generated variations appear here. Each one can be refined, saved to your library, copied or exported.</div>}
          {busy && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Writing variations…</div>}
          {out.map((t, i) => (
            <div key={i} className="panel p-5">
              <div className="eyebrow mb-2 text-primary">Variation {i + 1}</div>
              <div className="whitespace-pre-wrap text-sm leading-relaxed">{refining === i ? "Refining…" : t}</div>
              <div className="mt-4 flex flex-wrap gap-2 border-t pt-3">
                {REFINE.map((r) => <button key={r} className="rounded-full border px-3 py-1 text-xs hover:border-primary hover:text-primary" onClick={() => void refine(i, r)}>{r}</button>)}
                <span className="flex-1" />
                <button className="btn btn-outline !py-1 !text-xs" onClick={() => void save(i)}><Bookmark className="h-3.5 w-3.5" /> Save</button>
                <button className="btn btn-outline !py-1 !text-xs" onClick={() => { void navigator.clipboard.writeText(t); toast.success("Copied."); }}><Copy className="h-3.5 w-3.5" /></button>
                <button className="btn btn-outline !py-1 !text-xs" onClick={() => download(i)}><Download className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
