import { Link, useNavigate } from "react-router-dom";
import {
  BarChart3, Check, ClipboardCheck, Coins, FileText, FolderKanban, Gauge, History, Layers, LayoutGrid, MessagesSquare,
  PackageSearch, Rocket, ScanSearch, ShieldCheck, Sparkles, Stamp, Users, Boxes, Download, Building2, Lock, UserCheck, Route, Scale, Activity, FileCheck2,
} from "lucide-react";
import { Logo } from "../components/Logo";
import { Composer } from "../components/Composer";
import { useAuth } from "../lib/auth";

const chips = [
  "Evaluate a new product category", "Compare supplier quotations", "Analyse landed costs", "Build a procurement specification",
  "Review supplier risks", "Plan an international shipment", "Coordinate a product launch", "Generate launch assets",
];
const audiences = [
  "E-commerce companies", "Retail and consumer brands", "Import and distribution companies", "Private-label businesses",
  "Procurement teams", "Multi-brand commerce operators", "Product-development teams", "Wholesale businesses",
];
const steps = [
  { icon: ScanSearch, t: "Centralize product requirements", d: "Capture business requirements, specifications, quotations, images and supporting documents." },
  { icon: BarChart3, t: "Analyse commercial viability", d: "Evaluate costs, margins, supplier terms, shipping complexity and commercial risks." },
  { icon: Scale, t: "Standardize procurement decisions", d: "Compare suppliers, generate purchase specifications and maintain documented approval records." },
  { icon: Rocket, t: "Coordinate product launches", d: "Transform approved product information into pricing, positioning, sales content and launch assets." },
];
const platform = [
  { icon: Users, t: "Multi-user business workspaces", d: "Company workspaces where sourcing, procurement, finance and marketing work from the same records." },
  { icon: Lock, t: "Team roles and permissions", d: "Role-based access so each team sees and edits only what its responsibilities require." },
  { icon: FolderKanban, t: "Product-project portfolios", d: "Track every product project across categories, stages and business units in one portfolio view." },
  { icon: FileText, t: "Supplier and quotation records", d: "Structured supplier profiles and quotation records extracted from your uploaded documents." },
  { icon: ClipboardCheck, t: "Approval workflows", d: "Human approval checkpoints before a product, supplier or cost baseline is treated as confirmed." },
  { icon: Layers, t: "Shared procurement documents", d: "Briefs, specifications, inspection checklists and negotiation drafts stored with the project." },
  { icon: History, t: "Decision history and audit trail", d: "Every analysis, revision and approval is recorded so decisions remain traceable over time." },
  { icon: MessagesSquare, t: "Team comments and assignments", d: "Discuss quotations and assign follow-up work in context instead of across email threads." },
  { icon: Stamp, t: "Standardized purchase specifications", d: "One consistent specification format across categories, suppliers and buying teams." },
  { icon: Boxes, t: "Centralized business knowledge", d: "Company-level cost assumptions, supplier terms and product learnings reused on every project." },
  { icon: Download, t: "Exportable management reports", d: "Export cost, supplier and procurement records for leadership review and financial planning." },
  { icon: Building2, t: "Multiple brands and business units", d: "Separate brands, regions and business units while keeping shared standards and reporting." },
];
const teams = [
  { t: "Product teams", d: "Evaluate new categories, define specifications and manage product projects end to end." },
  { t: "Procurement teams", d: "Compare quotations, document supplier terms and standardize purchasing decisions." },
  { t: "Finance teams", d: "Review landed-cost models, margin scenarios and payment milestones before approval." },
  { t: "Logistics teams", d: "Assess shipping complexity, incoterms, documentation gaps and shipment planning." },
  { t: "Marketing teams", d: "Turn approved product data into positioning, pricing narrative and launch assets." },
  { t: "Business leadership", d: "See portfolio-level status, cost exposure and decision history in exportable reports." },
];
const controls = [
  { icon: Lock, t: "Secure document storage" }, { icon: UserCheck, t: "Role-based permissions" },
  { icon: ClipboardCheck, t: "Human approval checkpoints" }, { icon: Route, t: "Traceable AI recommendations" },
  { icon: Scale, t: "Clearly separated facts and estimates" }, { icon: FileCheck2, t: "Exportable procurement records" },
  { icon: Activity, t: "Usage and activity monitoring" },
];
const plans = [
  { name: "FREE TRIAL", price: "$0", per: "/one product project", blurb: "Test ProcenAI on a single product project.", cta: "Start free trial", href: "/auth?mode=signup",
    features: ["1 product project", "1 workspace member", "AI workspace with text, voice and image input", "Basic landed-cost estimates"] },
  { name: "BUSINESS STARTER", price: "$47", per: "/workspace / month", blurb: "For small commerce teams.", cta: "Choose Business Starter", href: (import.meta.env.VITE_PAYMENT_LINK_STARTER as string) ?? "https://selar.com/47plan?currency=USD",
    features: ["Up to 3 team members", "10 product projects", "Supplier and quotation records", "Procurement briefs & specifications", "Shared procurement documents"] },
  { name: "BUSINESS GROWTH", price: "$57", per: "/workspace / month", blurb: "For companies managing active procurement.", cta: "Choose Business Growth", href: (import.meta.env.VITE_PAYMENT_LINK_GROWTH as string) ?? "https://selar.com/57plan?currency=USD", popular: true,
    features: ["Up to 10 team members", "Unlimited product projects", "Approval workflows & audit trail", "Advanced margin & pricing scenarios", "Team comments and assignments"] },
  { name: "BUSINESS SCALE", price: "$97", per: "/workspace / month", blurb: "For multi-brand and high-volume operations.", cta: "Choose Business Scale", href: (import.meta.env.VITE_PAYMENT_LINK_SCALE as string) ?? "https://selar.com/97plan?currency=USD",
    features: ["Up to 25 team members", "Multiple brands and business units", "Portfolio-level cost analysis", "Exportable management reports", "Full Product Launch Studio"] },
  { name: "ENTERPRISE", price: "Custom", per: "/annual agreement", blurb: "Custom users, permissions, security and support.", cta: "Contact Sales", href: "mailto:sales@procenai.digital?subject=ProcenAI%20Enterprise%20enquiry",
    features: ["Unlimited team members", "Custom roles and permission models", "Security and data-handling review", "Onboarding and dedicated support", "Usage and activity monitoring"] },
];

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const go = () => navigate(user ? "/dashboard" : "/auth?mode=signup");

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
          <Link to="/"><Logo /></Link>
          <nav className="hidden gap-8 text-sm text-muted-foreground md:flex">
            <a href="#workspace" className="hover:text-foreground">How it works</a>
            <a href="#platform" className="hover:text-foreground">Platform</a>
            <a href="#teams" className="hover:text-foreground">Teams</a>
            <a href="#pricing" className="hover:text-foreground">Pricing</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to={user ? "/dashboard" : "/auth"} className="text-sm font-medium">{user ? "Open app" : "Sign in"}</Link>
            <Link to="/auth?mode=signup" className="btn btn-primary !py-2 text-xs sm:text-sm">Start for your business</Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="bg-grid absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
        <div className="absolute left-1/2 top-0 h-80 w-[40rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative mx-auto max-w-4xl px-5 pb-16 pt-16 text-center">
          <span className="eyebrow inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-primary">
            <Sparkles className="h-3 w-3" /> AI-native procurement and commerce intelligence
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-5xl font-semibold leading-[1.05] sm:text-6xl">The AI procurement platform for modern commerce businesses.</h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            ProcenAI helps e-commerce companies, retail brands, distributors and procurement teams evaluate products, compare suppliers, control landed costs and coordinate product launches from one intelligent workspace.
          </p>
          <div className="mx-auto mt-10 max-w-3xl">
            <Composer onSubmit={(v) => { try { sessionStorage.setItem("procenai:pending", v.text); } catch { /* ignore */ } go(); }} />
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {chips.map((c) => (
                <button key={c} onClick={() => { try { sessionStorage.setItem("procenai:pending", c); } catch { /* ignore */ } go(); }}
                  className="rounded-full border bg-card/70 px-3.5 py-1.5 text-xs transition hover:border-primary hover:text-primary">{c}</button>
              ))}
            </div>
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link to="/auth?mode=signup" className="btn btn-primary btn-lg">Start for your business</Link>
            <a href="#demo" className="btn btn-outline btn-lg">Book a product demo</a>
          </div>
          <p className="mx-auto mt-6 max-w-xl text-xs text-muted-foreground">Text, voice, product images, links, quotations and shipping documents. Every projected figure is clearly labelled as an estimate.</p>
        </div>
      </section>

      <section className="border-y bg-surface py-10">
        <div className="mx-auto max-w-6xl px-5 text-center">
          <p className="eyebrow text-muted-foreground">Built for businesses that source, move and launch physical products</p>
          <div className="mt-5 flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm font-medium">
            {audiences.map((a) => <span key={a}>{a}</span>)}
          </div>
        </div>
      </section>

      <section id="workspace" className="mx-auto max-w-6xl scroll-mt-16 px-5 py-20">
        <h2 className="max-w-2xl text-4xl font-semibold">One AI workspace for your entire commerce operation.</h2>
        <p className="mt-4 max-w-2xl text-muted-foreground">Give sourcing, procurement, finance and marketing teams a shared system for evaluating products, reviewing suppliers, controlling costs and coordinating launches.</p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <div key={s.t} className="panel p-5">
              <div className="flex items-center justify-between"><s.icon className="h-5 w-5 text-primary" /><span className="font-mono text-xs text-muted-foreground">0{i + 1}</span></div>
              <h3 className="mt-6 text-lg font-semibold leading-snug">{s.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="platform" className="scroll-mt-16 border-y bg-surface py-20">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="max-w-2xl text-4xl font-semibold">Turn fragmented commerce operations into one intelligent system.</h2>
          <p className="mt-4 max-w-2xl text-muted-foreground">Replace disconnected spreadsheets, supplier conversations, cost calculations and launch documents with a centralized AI-powered workspace built for cross-functional business teams.</p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {platform.map((p) => (
              <div key={p.t} className="panel p-5">
                <p.icon className="h-5 w-5 text-primary" />
                <h3 className="mt-5 text-base font-semibold">{p.t}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="teams" className="mx-auto max-w-6xl scroll-mt-16 px-5 py-20">
        <h2 className="max-w-2xl text-4xl font-semibold">Built for cross-functional teams</h2>
        <p className="mt-4 max-w-2xl text-muted-foreground">Each team works in the same product record, with the analysis and permissions relevant to its role.</p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((t) => (
            <div key={t.t} className="rounded-xl border-l-4 border-l-primary bg-card p-5 shadow-sm ring-1 ring-border">
              <h3 className="text-lg font-semibold">{t.t}</h3><p className="mt-2 text-sm text-muted-foreground">{t.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-sidebar py-20 text-sidebar-foreground">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 lg:grid-cols-2">
          <div>
            <p className="eyebrow text-primary">Business controls</p>
            <h2 className="mt-3 text-4xl font-semibold text-white">Documented, reviewable decisions.</h2>
            <p className="mt-4 max-w-md opacity-80">ProcenAI is designed for teams that need documented, reviewable decisions — not unattributed AI output. Facts and estimates are always presented separately.</p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {controls.map((c) => (
              <li key={c.t} className="flex items-center gap-3 rounded-lg border border-sidebar-border bg-white/5 px-4 py-3 text-sm">
                <c.icon className="h-4 w-4 text-primary" /> {c.t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-6xl scroll-mt-16 px-5 py-20">
        <h2 className="max-w-2xl text-4xl font-semibold">Plans built for growing commerce teams.</h2>
        <p className="mt-4 max-w-2xl text-muted-foreground">Start with one product project, then scale team members, portfolios and procurement workflows as your operation grows. Pricing is per workspace, per month.</p>
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {plans.map((p) => {
            const ext = p.href.startsWith("http") || p.href.startsWith("mailto");
            return (
              <div key={p.name} className={`panel relative flex flex-col p-6 ${p.popular ? "!border-primary ring-1 ring-primary/40" : ""}`}>
                {p.popular && <span className="absolute -top-3 left-5 rounded-full bg-primary px-2.5 py-0.5 font-mono text-[10px] font-medium text-primary-foreground">MOST POPULAR</span>}
                <div className="eyebrow text-muted-foreground">{p.name}</div>
                <div className="mt-3 flex items-baseline gap-1"><span className="font-display text-4xl font-semibold">{p.price}</span><span className="text-xs text-muted-foreground">{p.per}</span></div>
                <p className="mt-2 text-sm text-muted-foreground">{p.blurb}</p>
                <ul className="mt-5 flex-1 space-y-2 text-sm">
                  {p.features.map((f) => <li key={f} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{f}</li>)}
                </ul>
                {ext
                  ? <a href={p.href} target={p.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className={`btn mt-6 ${p.popular ? "btn-primary" : "btn-outline"}`}>{p.cta}</a>
                  : <Link to={p.href} className={`btn mt-6 ${p.popular ? "btn-primary" : "btn-outline"}`}>{p.cta}</Link>}
              </div>
            );
          })}
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">Paid plans check out securely through our payment provider. The free trial needs no payment details.</p>
      </section>

      <section id="demo" className="mx-auto max-w-6xl scroll-mt-16 px-5 pb-20">
        <div className="relative overflow-hidden rounded-2xl bg-sidebar px-6 py-16 text-center text-white">
          <div className="absolute left-1/2 top-0 h-60 w-[30rem] -translate-x-1/2 rounded-full bg-primary/30 blur-3xl" />
          <h2 className="relative mx-auto max-w-2xl text-4xl font-semibold">Build a more intelligent product and procurement operation.</h2>
          <p className="relative mx-auto mt-4 max-w-xl opacity-80">Give your team one AI-native platform for product evaluation, supplier comparison, procurement planning, cost intelligence and coordinated product launches.</p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/auth?mode=signup" className="btn btn-primary btn-lg">Create a business workspace</Link>
            <a href="mailto:sales@procenai.digital?subject=ProcenAI%20demo%20request" className="btn btn-lg border border-white/30 text-white hover:bg-white/10">Book a demo</a>
          </div>
        </div>
      </section>

      <footer className="border-t py-8 text-center text-xs text-muted-foreground">
        <Logo /><p className="mt-2">© {new Date().getFullYear()} ProcenAI. AI procurement and commerce intelligence.</p>
      </footer>
    </div>
  );
}
