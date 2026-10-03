import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth";

const list = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);
const BUSINESS_TYPES = ["E-commerce company", "Retail or consumer brand", "Import and distribution", "Private-label business", "Wholesale", "Procurement team", "Other"];

type F = Record<string, string>;
type Ctx = { f: F; set: (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void };
const FormCtx = createContext<Ctx>({ f: {}, set: () => () => {} });
function Field({ k, label, hint, area }: { k: string; label: string; hint?: string; area?: boolean }) {
  const { f, set } = useContext(FormCtx);
  return (
    <div>
      <label className="label">{label}</label>
      {area ? <textarea className="input min-h-20" value={f[k] ?? ""} onChange={set(k)} placeholder={hint} /> : <input className="input" value={f[k] ?? ""} onChange={set(k)} placeholder={hint} />}
    </div>
  );
}
const empty: F = {
  business_name: "", business_type: BUSINESS_TYPES[0], selling_countries: "", sourcing_countries: "", product_categories: "",
  target_customers: "", order_budget: "", preferred_order_quantity: "", shipping_methods: "", target_gross_margin: "",
  warehouse_address: "", tone_of_voice: "", brand_description: "", brand_colors: "", visual_style: "", logo_url: "",
};

export function ProfileForm({ onboarding = false, onDone }: { onboarding?: boolean; onDone?: () => void }) {
  const { profile, refreshProfile } = useAuth();
  const [f, setF] = useState<F>(empty);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!profile) return;
    const j = (a: string[] | null) => (a ?? []).join(", ");
    setF({
      business_name: profile.business_name ?? "", business_type: profile.business_type ?? BUSINESS_TYPES[0],
      selling_countries: j(profile.selling_countries), sourcing_countries: j(profile.sourcing_countries),
      product_categories: j(profile.product_categories), target_customers: profile.target_customers ?? "",
      order_budget: profile.order_budget ?? "", preferred_order_quantity: profile.preferred_order_quantity ?? "",
      shipping_methods: j(profile.shipping_methods), target_gross_margin: profile.target_gross_margin?.toString() ?? "",
      warehouse_address: profile.warehouse_address ?? "", tone_of_voice: profile.tone_of_voice ?? "",
      brand_description: profile.brand_description ?? "", brand_colors: j(profile.brand_colors),
      visual_style: profile.visual_style ?? "", logo_url: profile.logo_url ?? "",
    });
  }, [profile]);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF((p) => ({ ...p, [k]: e.target.value }));

  async function save(e: React.FormEvent) {
    e.preventDefault(); setBusy(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) { toast.error("Please sign in again."); setBusy(false); return; }
    const { error } = await supabase.from("profiles").upsert({
      user_id: u.user.id, business_name: f.business_name.trim() || null, business_type: f.business_type,
      selling_countries: list(f.selling_countries), sourcing_countries: list(f.sourcing_countries),
      product_categories: list(f.product_categories), target_customers: f.target_customers.trim() || null,
      order_budget: f.order_budget.trim() || null, preferred_order_quantity: f.preferred_order_quantity.trim() || null,
      shipping_methods: list(f.shipping_methods), target_gross_margin: f.target_gross_margin ? Number(f.target_gross_margin) : null,
      warehouse_address: f.warehouse_address.trim() || null, tone_of_voice: f.tone_of_voice.trim() || null,
      brand_description: f.brand_description.trim() || null, brand_colors: list(f.brand_colors),
      visual_style: f.visual_style.trim() || null, logo_url: f.logo_url.trim() || null, onboarded: true,
    }, { onConflict: "user_id" });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    await refreshProfile(); toast.success("Saved."); onDone?.();
  }

  return (
    <FormCtx.Provider value={{ f, set }}>
    <form onSubmit={save} className="space-y-6">
      <section className="panel space-y-4 p-5">
        <h2 className="text-lg font-semibold">Business</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field k="business_name" label="Business name" />
          <div><label className="label">Business type</label>
            <select className="input" value={f.business_type} onChange={set("business_type")}>{BUSINESS_TYPES.map((t) => <option key={t}>{t}</option>)}</select></div>
          <Field k="selling_countries" label="Selling countries" hint="Comma separated" />
          <Field k="sourcing_countries" label="Sourcing countries" hint="Comma separated" />
          <Field k="product_categories" label="Product categories" hint="e.g. home, beauty, electronics" />
          <Field k="target_customers" label="Target customers" />
        </div>
      </section>
      <section className="panel space-y-4 p-5">
        <h2 className="text-lg font-semibold">Buying preferences</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field k="order_budget" label="Order budget" hint="e.g. $10,000 per order" />
          <Field k="preferred_order_quantity" label="Preferred order quantity" />
          <Field k="shipping_methods" label="Shipping methods" hint="e.g. sea freight, air freight" />
          <Field k="target_gross_margin" label="Target gross margin (%)" />
        </div>
        <Field k="warehouse_address" label="Warehouse address" area />
      </section>
      <section className="panel space-y-4 p-5">
        <h2 className="text-lg font-semibold">Brand profile</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field k="tone_of_voice" label="Tone of voice" hint="e.g. confident, warm, premium" />
          <Field k="visual_style" label="Visual style" />
          <Field k="brand_colors" label="Brand colors" hint="Comma separated hex codes" />
          <Field k="logo_url" label="Logo URL" />
        </div>
        <Field k="brand_description" label="Brand description" area />
      </section>
      <button className="btn btn-primary btn-lg" disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}{onboarding ? "Save and open workspace" : "Save settings"}</button>
    </form>
    </FormCtx.Provider>
  );
}
