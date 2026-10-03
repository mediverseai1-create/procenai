import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Calculator, Globe, Loader2, PenLine, Palette, Plus, Sparkles } from "lucide-react";
import { PageHeader } from "../components/AppShell";
import { Composer, type ComposerValue } from "../components/Composer";
import { ResultCard } from "../components/ResultCard";
import { aiChat, aiExplain, saveItem, type Card } from "../lib/ai";
import { supabase } from "../lib/supabase";
import { computeLanded, defaultLanded, landedToMarkdown, money, type LandedInputs } from "../lib/landed";

type Msg = { id: string; role: "user" | "assistant"; content: string; cards: Card[] };
type Thread = { id: string; title: string; updated_at: string };

const prompts = [
  "Analyse landed costs for a 500-unit order from China to the EU",
  "Review supplier risks for this category before we commit budget",
  "Compare these supplier quotations and recommend a negotiation position",
  "Draft a purchase specification our QC team can inspect against",
];

export default function Workspace() {
  const navigate = useNavigate();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [convId, setConvId] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [busy, setBusy] = useState(false);
  const [research, setResearch] = useState(false);
  const [calc, setCalc] = useState(false);
  const [pending, setPending] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  async function loadThreads() {
    const { data } = await supabase.from("conversations").select("id, title, updated_at").order("updated_at", { ascending: false }).limit(40);
    setThreads((data as Thread[]) ?? []);
  }
  async function openThread(id: string) {
    setConvId(id);
    const { data } = await supabase.from("messages").select("id, role, content, cards").eq("conversation_id", id).order("created_at");
    setMsgs(((data as Msg[]) ?? []).map((m) => ({ ...m, cards: Array.isArray(m.cards) ? m.cards : [] })));
  }
  useEffect(() => {
    void loadThreads();
    try { const p = sessionStorage.getItem("procenai:pending"); if (p) { setPending(p); sessionStorage.removeItem("procenai:pending"); } } catch { /* ignore */ }
  }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, busy]);

  async function send(v: ComposerValue) {
    const shown = [v.text, v.productUrl].filter(Boolean).join("\n");
    setMsgs((m) => [...m, { id: crypto.randomUUID(), role: "user", content: shown, cards: [] }]);
    setBusy(true);
    try {
      const r = await aiChat({ conversationId: convId, text: v.text, productUrl: v.productUrl, attachments: v.attachments, research, kind: "workspace" });
      setConvId(r.conversationId);
      setMsgs((m) => [...m, { id: r.assistant.id, role: "assistant", content: r.assistant.content, cards: r.assistant.cards }]);
      void loadThreads();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Something went wrong."); }
    finally { setBusy(false); }
  }

  function handoff(to: "copywriter" | "design-studio", content: string) {
    try { localStorage.setItem("procenai:context", content); } catch { /* ignore */ }
    toast.success(to === "copywriter" ? "Sent to the AI Copywriter." : "Sent to the AI Design Studio.");
    navigate(`/${to}`);
  }

  async function explain(text: string) {
    const prompt = `Explain and pressure-test this landed-cost scenario computed by the ProcenAI calculator. Do not recalculate the arithmetic — comment on the drivers, risks and what we should confirm.\n\n${text}`;
    setCalc(false);
    await send({ text: prompt, attachments: [] });
  }

  return (
    <>
      <PageHeader title="AI Workspace" sub="One workspace for research, supplier analysis, quotes, costs and shipping."
        actions={<div className="flex gap-2">
          <button className="btn btn-outline" onClick={() => setCalc((c) => !c)}><Calculator className="h-4 w-4" /> Landed cost calculator</button>
          <button className="btn btn-outline" onClick={() => { setConvId(null); setMsgs([]); }}><Plus className="h-4 w-4" /> New thread</button>
        </div>} />
      {calc && <Calculator_ onExplain={explain} conversationId={convId} />}
      <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
        <div className="min-w-0">
          <div className="space-y-5">
            {msgs.length === 0 && (
              <div className="panel p-8 text-center">
                <Sparkles className="mx-auto h-6 w-6 text-primary" />
                <h2 className="mt-3 text-2xl font-semibold">What should the team look into?</h2>
                <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">Type or dictate a question, attach supplier quotes, specifications, spreadsheets or product photos, or paste a marketplace link. ProcenAI asks for the details it needs instead of guessing.</p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {prompts.map((p) => <button key={p} onClick={() => setPending(p)} className="rounded-full border bg-card px-3.5 py-1.5 text-xs hover:border-primary hover:text-primary">{p}</button>)}
                </div>
              </div>
            )}
            {msgs.map((m) => (
              <div key={m.id} className={m.role === "user" ? "flex justify-end" : ""}>
                {m.role === "user" ? (
                  <div className="max-w-[85%] whitespace-pre-wrap rounded-xl bg-primary px-4 py-2.5 text-sm text-primary-foreground">{m.content}</div>
                ) : (
                  <div className="max-w-full">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">{m.content}</div>
                    {m.cards.map((c, i) => <ResultCard key={i} card={c} conversationId={convId} />)}
                    <div className="mt-3 flex gap-2">
                      <button className="btn btn-outline !py-1.5 !text-xs" onClick={() => handoff("copywriter", [m.content, ...m.cards.map((c) => c.title)].join("\n"))}><PenLine className="h-3.5 w-3.5" /> Write copy</button>
                      <button className="btn btn-outline !py-1.5 !text-xs" onClick={() => handoff("design-studio", [m.content, ...m.cards.map((c) => c.title)].join("\n"))}><Palette className="h-3.5 w-3.5" /> Create visuals</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {busy && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Working through your request…</div>}
            <div ref={endRef} />
          </div>
          <div className="sticky bottom-4 mt-6 space-y-2">
            <label className="flex w-fit cursor-pointer items-center gap-2 text-xs text-muted-foreground">
              <input type="checkbox" checked={research} onChange={(e) => setResearch(e.target.checked)} className="accent-[var(--primary)]" />
              <Globe className="h-3.5 w-3.5" /> Online research with cited sources
            </label>
            <Composer key={pending} initial={pending} busy={busy} onSubmit={send} placeholder="Ask about a category, supplier, quotation, cost structure or shipping plan…" />
          </div>
        </div>
        <aside className="order-first lg:order-none">
          <div className="eyebrow mb-2 text-muted-foreground">Threads</div>
          <div className="space-y-1">
            {threads.length === 0 && <p className="text-sm text-muted-foreground">Your team's threads appear here.</p>}
            {threads.map((t) => (
              <button key={t.id} onClick={() => void openThread(t.id)}
                className={`block w-full truncate rounded-md px-3 py-2 text-left text-sm hover:bg-muted ${t.id === convId ? "bg-secondary font-medium text-secondary-foreground" : ""}`}>{t.title}</button>
            ))}
          </div>
        </aside>
      </div>
    </>
  );
}

const numFields: { k: keyof LandedInputs; label: string }[] = [
  { k: "units", label: "Units" }, { k: "unitPrice", label: "Unit price" }, { k: "toolingCost", label: "Tooling / setup" },
  { k: "inspectionCost", label: "Inspection / QC" }, { k: "freightCost", label: "Freight" }, { k: "insuranceCost", label: "Insurance" },
  { k: "dutyRate", label: "Duty rate (%)" }, { k: "vatRate", label: "VAT / import tax (%)" }, { k: "customsClearance", label: "Customs clearance" },
  { k: "lastMilePerUnit", label: "Last mile per unit" }, { k: "otherCosts", label: "Other costs" }, { k: "targetMargin", label: "Target margin (%)" },
];

function Calculator_({ onExplain, conversationId }: { onExplain: (t: string) => void; conversationId: string | null }) {
  const [name, setName] = useState("");
  const [inp, setInp] = useState<LandedInputs>(defaultLanded);
  const r = computeLanded(inp);
  const md = landedToMarkdown(name, inp, r);
  const m = (v: number) => money(v, inp.currency);

  async function save() {
    try { await saveItem("cost", name || "Landed cost scenario", { markdown: md, inputs: inp, result: r }, { subtitle: "Landed cost calculation", conversationId: conversationId ?? undefined }); toast.success("Saved to your library."); }
    catch { toast.error("Could not save."); }
  }
  return (
    <div className="panel mb-6 p-5">
      <h2 className="text-lg font-semibold">Landed cost inputs</h2>
      <p className="mb-4 mt-1 text-xs text-muted-foreground">Every figure below is computed in the app, not written by the AI, so results are reproducible. Duty and tax rates are your assumptions — confirm them with your customs broker.</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2"><label className="label">Scenario name</label><input className="input" value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div><label className="label">Currency</label>
          <select className="input" value={inp.currency} onChange={(e) => setInp({ ...inp, currency: e.target.value })}>{["USD", "EUR", "GBP", "NGN", "CNY", "AED", "CAD"].map((c) => <option key={c}>{c}</option>)}</select></div>
        <div />
        {numFields.map((f) => (
          <div key={f.k}><label className="label">{f.label}</label>
            <input className="input" type="number" min={0} value={inp[f.k] as number} onChange={(e) => setInp({ ...inp, [f.k]: Number(e.target.value) })} /></div>
        ))}
      </div>
      <div className="mt-5 rounded-lg bg-surface p-4">
        <div className="eyebrow mb-3 text-muted-foreground">Computed result</div>
        <div className="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <Row l="Goods value" v={m(r.goodsValue)} /><Row l="Freight + insurance" v={m(r.freightTotal)} /><Row l="Duty" v={m(r.duty)} />
          <Row l="VAT / import tax" v={m(r.vat)} /><Row l="Fixed costs" v={m(r.otherFixed)} /><Row l="Last mile total" v={m(r.lastMileTotal)} />
          <Row l="Total landed cost" v={m(r.totalLandedCost)} strong /><Row l="Landed cost per unit" v={m(r.landedCostPerUnit)} strong />
          <Row l={`Suggested retail @ ${inp.targetMargin}%`} v={m(r.suggestedRetail)} strong />
          <Row l="Gross profit per unit" v={m(r.grossProfitPerUnit)} /><Row l="Break-even units" v={r.breakEvenUnits?.toString() ?? "n/a"} />
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <button className="btn btn-primary" onClick={() => onExplain(md)}><Sparkles className="h-4 w-4" /> Explain with AI</button>
        <button className="btn btn-outline" onClick={() => void save()}>Save scenario</button>
        <button className="btn btn-outline" onClick={() => { void navigator.clipboard.writeText(md); toast.success("Copied."); }}>Copy</button>
      </div>
    </div>
  );
}
const Row = ({ l, v, strong }: { l: string; v: string; strong?: boolean }) => (
  <div className="flex justify-between gap-3 border-b border-dashed py-1"><span className="text-muted-foreground">{l}</span><span className={strong ? "font-semibold" : ""}>{v}</span></div>
);

export { aiExplain };
