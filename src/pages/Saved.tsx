import { useState } from "react";
import { useQuery } from "./useQuery";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { PageHeader } from "../components/AppShell";
import { ResultCard } from "../components/ResultCard";
import { supabase } from "../lib/supabase";

const KINDS = [
  { k: "all", l: "All" }, { k: "product", l: "Products" }, { k: "research", l: "Supplier research" }, { k: "quote", l: "Quotes" },
  { k: "cost", l: "Cost analyses" }, { k: "brief", l: "Sourcing briefs" }, { k: "spec", l: "Specifications" }, { k: "shipping", l: "Shipping plans" },
];
type Item = { id: string; kind: string; title: string; subtitle: string | null; content: any; created_at: string };

export default function Saved() {
  const [kind, setKind] = useState("all");
  const { data, loading, refetch } = useQuery<Item[]>(async () => {
    let q = supabase.from("saved_items").select("*").order("created_at", { ascending: false });
    if (kind !== "all") q = q.eq("kind", kind);
    const { data } = await q; return (data as Item[]) ?? [];
  }, [kind]);

  async function remove(id: string) {
    const { error } = await supabase.from("saved_items").delete().eq("id", id);
    if (error) toast.error(error.message); else refetch();
  }

  return (
    <>
      <PageHeader title="Saved" sub="Your library of research, quotations, cost analyses, briefs and specifications." />
      <div className="mb-5 flex flex-wrap gap-2">
        {KINDS.map((k) => (
          <button key={k.k} onClick={() => setKind(k.k)} className={`rounded-full border px-3.5 py-1.5 text-xs ${kind === k.k ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-primary"}`}>{k.l}</button>
        ))}
      </div>
      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {!loading && data?.length === 0 && <div className="panel p-10 text-center text-sm text-muted-foreground">Nothing saved yet.</div>}
      <div className="space-y-4">
        {data?.map((it) => (
          <div key={it.id}>
            {it.content?.type && it.content?.title ? <ResultCard card={it.content} /> : (
              <div className="panel p-5">
                <div className="eyebrow text-primary">{it.subtitle ?? it.kind}</div>
                <h3 className="mt-1 font-semibold">{it.title}</h3>
                {it.content?.image && <img src={it.content.image} alt={it.title} className="mt-3 max-h-80 rounded-md" />}
                <div className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{it.content?.markdown ?? it.content?.text ?? it.content?.prompt}</div>
              </div>
            )}
            <button className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive" onClick={() => void remove(it.id)}><Trash2 className="h-3 w-3" /> Remove</button>
          </div>
        ))}
      </div>
    </>
  );
}
