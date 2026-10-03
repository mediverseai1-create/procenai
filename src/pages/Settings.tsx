import { PageHeader } from "../components/AppShell";
import { ProfileForm } from "../components/ProfileForm";
import { useAuth } from "../lib/auth";

export default function SettingsPage() {
  const { profile } = useAuth();
  return (
    <>
      <PageHeader title="Settings" sub="Your business profile and brand guidance. Used by the workspace, copywriter and design studio." />
      <div className="panel mb-6 flex items-center justify-between p-4 text-sm">
        <span>Current plan</span><span className="rounded-full bg-secondary px-3 py-1 font-mono text-xs uppercase text-secondary-foreground">{profile?.plan ?? "free trial"}</span>
      </div>
      <ProfileForm />
    </>
  );
}
