import { useState } from "react";
import { Bookmark, Check, Copy, Download, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { saveItem, type Card } from "../lib/ai";

const TYPE_LABEL: Record<string, string> = {
  research_result: "Research", supplier_comparison: "Supplier comparison", quote_analysis: "Quotation analysis",
  cost_analysis: "Cost analysis", sourcing_brief: "Sourcing brief", specification: "Purchase specification",
  shipping_plan: "Shipping plan", product_evaluation: "Product evaluation", risk_review: "Supplier risk review",
};
const KIND_STYLE = {
  fact: { label: "Fact", cls: "bg-verified text-verified-foreground" },
  estimate: { label: "Estimate", cls: "bg-estimate text-estimate-foreground" },
  assumption: { label: "Assumption", cls: "bg-muted text-muted-foreground" },
} as const;
const SAVE_KIND: Record<string, string> = {
  research_result: "research", supplier_comparison: "research", risk_review: "research", quote_analysis: "quote",
  cost_analysis: "cost", sourcing_brief: "brief", specification: "spec", shipping_plan: "shipping", product_evaluation: "product",
};

export function cardToMarkdown(c: Card) {
  const t = [`# ${c.title}`, `_${TYPE_LABEL[c.type] ?? c.type}_`, ""];
  for (const f of c.fields ?? []) t.push(`- **${f.label}:** ${f.value}${f.kind === "estimate" ? " _(estimate)_" : ""}`);
  if (c.columns && c.rows) {
    t.push("", `| ${c.columns.join(" | ")} |`, `| ${c.columns.map(() => "---").join(" | ")} |`);
    for (const r of c.rows) t.push(`| ${r.join(" | ")} |`);
  }
  if (c.notes?.length) t.push("", "## Notes", ...c.notes.map((n) => `- ${n}`));
  if (c.sources?.length) t.push("", "## Sources", ...c.sources.map((s) => `- ${s.name}${s.title ? " — " + s.title : ""}: ${s.url}`));
  return t.join("\n");
}

export function ResultCard({ card, conversationId }: { card: Card; conversationId?: string | null }) {
  const [saved, setSaved] = useState(false);
  const md = cardToMarkdown(card);

  async function save() {
    try {
      await saveItem(SAVE_KIND[card.type] ?? "research", card.title, card, { subtitle: TYPE_LABEL[card.type], conversationId: conversationId ?? undefined });
      setSaved(true); toast.success("Saved to your library.");
    } catch { toast.error("Could not save this item."); }
  }
  function download() {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([md], { type: "text/markdown" }));
    a.download = `${card.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.md`; a.click();
  }

  return (
    <div className="panel mt-3 overflow-hidden">
      <div className="flex items-start justify-between gap-3 border-b bg-surface px-4 py-3">
        <div>
          <div className="eyebrow text-primary">{TYPE_LABEL[card.type] ?? card.type.replace(/_/g, " ")}</div>
          <h3 className="mt-0.5 text-base font-semibold">{card.title}</h3>
        </div>
        <div className="flex gap-1">
          <button className="btn btn-outline !px-2.5 !py-1.5 !text-xs" onClick={save} disabled={saved}>{saved ? <Check className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />} {saved ? "Saved" : "Save"}</button>
          <button className="btn btn-outline !px-2.5 !py-1.5 !text-xs" onClick={() => { void navigator.clipboard.writeText(md); toast.success("Copied."); }}><Copy className="h-3.5 w-3.5" /></button>
          <button className="btn btn-outline !px-2.5 !py-1.5 !text-xs" onClick={download}><Download className="h-3.5 w-3.5" /></button>
        </div>
      </div>
      <div className="space-y-4 p-4 text-sm">
        {!!card.fields?.length && (
          <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {card.fields.map((f, i) => {
              const k = KIND_STYLE[f.kind ?? "fact"] ?? KIND_STYLE.fact;
              return (
                <div key={i}>
                  <dt className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">{f.label}
                    <span className={`rounded px-1.5 py-0.5 font-mono text-[10px] uppercase ${k.cls}`}>{k.label}</span></dt>
                  <dd className="mt-0.5">{f.value}</dd>
                </div>
              );
            })}
          </dl>
        )}
        {card.columns && card.rows && (
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted"><tr>{card.columns.map((c, i) => <th key={i} className="px-3 py-2 font-semibold">{c}</th>)}</tr></thead>
              <tbody>{card.rows.map((r, i) => <tr key={i} className="border-t">{r.map((c, j) => <td key={j} className="px-3 py-2 align-top">{c}</td>)}</tr>)}</tbody>
            </table>
          </div>
        )}
        {!!card.notes?.length && <ul className="list-disc space-y-1 pl-5 text-muted-foreground">{card.notes.map((n, i) => <li key={i}>{n}</li>)}</ul>}
        {!!card.sources?.length && (
          <div className="border-t pt-3">
            <div className="eyebrow mb-2 text-muted-foreground">Sources</div>
            <ul className="space-y-1">
              {card.sources.map((s, i) => (
                <li key={i}><a href={s.url} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1 text-primary hover:underline">
                  {s.name}{s.title ? ` — ${s.title}` : ""} <ExternalLink className="h-3 w-3" /></a></li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
