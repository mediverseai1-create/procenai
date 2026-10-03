import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Logo } from "../components/Logo";
import { supabase, supabaseConfigured } from "../lib/supabase";
import { useAuth } from "../lib/auth";

export default function Auth() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">(params.get("mode") === "signup" ? "signup" : "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { setMode(params.get("mode") === "signup" ? "signup" : "signin"); }, [params]);
  if (!loading && user) return <Navigate to="/dashboard" replace />;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabaseConfigured) { toast.error("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."); return; }
    setBusy(true);
    if (mode === "forgot") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
      setBusy(false);
      if (error) toast.error(error.message); else toast.success("Check your email for a reset link.");
      return;
    }
    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/dashboard` } });
      setBusy(false);
      if (error) { toast.error(error.message); return; }
      if (data.session) navigate("/onboarding"); else toast.success("Account created. Check your email to confirm, then sign in.");
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) toast.error(error.message); else navigate("/dashboard");
  }

  return (
    <div className="relative grid min-h-screen place-items-center px-5">
      <div className="bg-grid absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
      <div className="panel relative w-full max-w-sm p-7">
        <Link to="/" className="flex justify-center"><Logo /></Link>
        <h1 className="mt-6 text-center text-2xl font-semibold">
          {mode === "signup" ? "Create your business workspace" : mode === "forgot" ? "Forgot your password?" : "Sign in to ProcenAI"}
        </h1>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div><label className="label">Work email</label><input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          {mode !== "forgot" && (
            <div><label className="label">Password</label><input className="input" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          )}
          <button className="btn btn-primary w-full" disabled={busy}>
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "signup" ? "Create account" : mode === "forgot" ? "Send reset link" : "Sign in"}
          </button>
        </form>
        <div className="mt-5 space-y-2 text-center text-sm text-muted-foreground">
          {mode === "signin" && <button className="block w-full hover:text-foreground" onClick={() => setMode("forgot")}>Forgot your password?</button>}
          {mode === "forgot" && <button className="block w-full hover:text-foreground" onClick={() => setMode("signin")}>Back to sign in</button>}
          {mode === "signin" && <button className="block w-full text-primary" onClick={() => setMode("signup")}>Create account</button>}
          {mode === "signup" && <button className="block w-full text-primary" onClick={() => setMode("signin")}>Already have an account? Sign in</button>}
        </div>
      </div>
    </div>
  );
}
