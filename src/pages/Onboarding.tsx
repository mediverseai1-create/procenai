import { Navigate, useNavigate } from "react-router-dom";
import { Logo } from "../components/Logo";
import { ProfileForm } from "../components/ProfileForm";
import { useAuth } from "../lib/auth";

export default function Onboarding() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <Logo />
      <h1 className="mt-8 text-4xl font-semibold">Tell ProcenAI about your business</h1>
      <p className="mb-8 mt-2 text-muted-foreground">This profile is reused on every product project so recommendations, cost estimates and copy match how your business actually buys and sells.</p>
      <ProfileForm onboarding onDone={() => navigate("/workspace")} />
    </div>
  );
}
