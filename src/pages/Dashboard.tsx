import { Link } from "react-router-dom";
import { ArrowRight, MessagesSquare, PenLine, Palette } from "lucide-react";
import { PageHeader } from "../components/AppShell";
import { useAuth } from "../lib/auth";
import { supabase } from "../lib/supabase";
import { useQuery } from "./useQuery";

type Saved = { id: string; title: string; subtitle: string | null; kind: string; created_at: string };
type Order = { id: string; reference: string; product_name: string; stage: string; payment_status: string };

export default function Dashboard() {
  const { profile } = useAuth();
  const { data } = useQuery(async () => {
    const [products, costs, orders] = await Promise.all([
      supabase.from("saved_items").select("id, title, subtitle, kind, created_at").eq("kind", "product").order("created_at", { ascending: false }).limit(5),
      supabase.from("saved_items").select("id, title, subtitle, kind, created_at").eq("kind", "cost").order("created_at", { ascending: false }).limit(5),
      supabase.from("orders").select("id, reference, product_name, stage, payment_status").order("created_at", { ascending: false }).limit(5),
    ]);
    return { products: (products.data as Saved[]) ?? [], costs: (costs.data as Saved[]) ?? [], orders: (orders.data as Order[]) ?? [] };
  });

  return (
    <>
      <PageHeader title={profile?.business_name ? `${profile.business_name}` : "Overview"} sub="Your sourcing overview" />
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {[
          { to: "/workspace", icon: MessagesSquare, t: "AI Workspace", d: "Research, supplier analysis, quotes, costs and shipping." },
          { to: "/copywriter", icon: PenLine, t: "AI Copywriter", d: "Listings, descriptions, emails and scripts." },
          { to: "/design-studio", icon: Palette, t: "AI Design Studio", d: "Banners, lifestyle and packaging concepts." },
        ].map((c) => (
          <Link key={c.to} to={c.to} className="panel group p-5 transition hover:border-primary">
            <c.icon className="h-5 w-5 text-primary" />
            <h3 className="mt-4 text-lg font-semibold">{c.t}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{c.d}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary">Open <ArrowRight className="h-3 w-3 transition group-hover:translate-x-1" /></span>
          </Link>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <List title="Products" empty="Nothing saved yet." items={data?.products.map((p) => ({ k: p.id, a: p.title, b: p.subtitle ?? "" }))} />
        <List title="Cost estimates" empty="No estimates saved yet." items={data?.costs.map((p) => ({ k: p.id, a: p.title, b: p.subtitle ?? "" }))} />
        <List title="Orders" empty="No orders recorded yet." items={data?.orders.map((o) => ({ k: o.id, a: `${o.reference} · ${o.product_name}`, b: `${o.stage} · ${o.payment_status}` }))} />
      </div>
      <div className="mt-8"><Link to="/workspace" className="btn btn-primary">Ask the AI guide</Link></div>
    </>
  );
}

function List({ title, items, empty }: { title: string; items?: { k: string; a: string; b: string }[]; empty: string }) {
  return (
    <div className="panel p-5">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="mt-3 space-y-2">
        {(!items || items.length === 0) && <p className="text-sm text-muted-foreground">{empty}</p>}
        {items?.map((i) => <div key={i.k} className="border-b pb-2 text-sm last:border-0"><div className="font-medium">{i.a}</div><div className="text-xs text-muted-foreground">{i.b}</div></div>)}
      </div>
    </div>
  );
}
