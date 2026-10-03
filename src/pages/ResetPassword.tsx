import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Logo } from "../components/Logo";
import { supabase } from "../lib/supabase";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Password updated."); navigate("/dashboard");
  }
  return (
    <div className="grid min-h-screen place-items-center px-5">
      <form onSubmit={submit} className="panel w-full max-w-sm space-y-4 p-7">
        <div className="flex justify-center"><Logo /></div>
        <h1 className="text-center text-2xl font-semibold">Set a new password</h1>
        <div><label className="label">New password</label><input className="input" type="password" minLength={6} required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        <button className="btn btn-primary w-full" disabled={busy}>Update password</button>
      </form>
    </div>
  );
}
