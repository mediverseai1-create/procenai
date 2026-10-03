import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export type Profile = {
  business_name: string | null; business_type: string | null; selling_countries: string[] | null;
  sourcing_countries: string[] | null; product_categories: string[] | null; target_customers: string | null;
  order_budget: string | null; preferred_order_quantity: string | null; shipping_methods: string[] | null;
  target_gross_margin: number | null; warehouse_address: string | null; tone_of_voice: string | null;
  brand_description: string | null; brand_colors: string[] | null; visual_style: string | null;
  logo_url: string | null; onboarded: boolean | null; plan: string | null;
};

type Ctx = { session: Session | null; user: User | null; profile: Profile | null; loading: boolean; refreshProfile: () => Promise<void> };
const AuthCtx = createContext<Ctx>({ session: null, user: null, profile: null, loading: true, refreshProfile: async () => {} });
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  async function load(uid?: string) {
    if (!uid) { setProfile(null); return; }
    const { data } = await supabase.from("profiles").select("*").eq("user_id", uid).maybeSingle();
    setProfile((data as Profile) ?? null);
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session); await load(data.session?.user.id); setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => { setSession(s); void load(s?.user.id); });
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <AuthCtx.Provider value={{ session, user: session?.user ?? null, profile, loading, refreshProfile: () => load(session?.user.id) }}>
      {children}
    </AuthCtx.Provider>
  );
}
