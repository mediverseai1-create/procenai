import { supabase } from "./supabase";

export type Card = {
  type: string; title: string;
  fields?: { label: string; value: string; kind?: "fact" | "estimate" | "assumption" }[];
  columns?: string[]; rows?: string[][]; notes?: string[];
  sources?: { name: string; title?: string; url: string; accessed?: string }[];
};
export type Attachment = { name: string; mime: string; data: string };

async function call<T>(action: string, body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke("ai", { body: { action, ...body } });
  if (error) {
    let msg = error.message;
    try { const j = await (error as any).context?.json?.(); if (j?.error) msg = j.error; } catch { /* ignore */ }
    throw new Error(msg);
  }
  if ((data as any)?.error) throw new Error((data as any).error);
  return data as T;
}

export const aiChat = (p: { conversationId: string | null; text: string; productUrl?: string; attachments: Attachment[]; research: boolean; kind: "workspace" | "sourcing" }) =>
  call<{ conversationId: string; assistant: { id: string; content: string; cards: Card[] } }>("chat", p);
export const aiCopy = (p: Record<string, unknown>) => call<{ variations: string[] }>("copy", p);
export const aiRefine = (p: { text: string; action: string; tone: string }) => call<{ text: string }>("refine", p);
export const aiImage = (p: Record<string, unknown>) => call<{ image: string; prompt: string }>("image", p);
export const aiExplain = (p: { text: string }) => call<{ text: string }>("explain", p);

export const fileToAttachment = (f: File) =>
  new Promise<Attachment>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res({ name: f.name, mime: f.type || "application/octet-stream", data: String(r.result).split(",")[1] ?? "" });
    r.onerror = rej; r.readAsDataURL(f);
  });

export async function saveItem(kind: string, title: string, content: unknown, extra: { subtitle?: string; imagePath?: string; sourceUrl?: string; conversationId?: string } = {}) {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) throw new Error("Please sign in.");
  const { error } = await supabase.from("saved_items").insert({
    user_id: u.user.id, kind, title: title.slice(0, 200), subtitle: extra.subtitle ?? null, content,
    image_path: extra.imagePath ?? null, source_url: extra.sourceUrl ?? null, conversation_id: extra.conversationId ?? null,
  });
  if (error) throw error;
}
