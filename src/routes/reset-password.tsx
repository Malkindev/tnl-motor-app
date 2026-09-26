import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Set a New Password — TNL Motor" },
      { name: "description", content: "Choose a new password for your TNL Motor account." },
      { property: "og:title", content: "Set a New Password — TNL Motor" },
      { property: "og:description", content: "Choose a new password for your account." },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password updated");
    navigate({ to: "/account", replace: true });
  }

  return (
    <SiteLayout>
      <section className="section">
        <div className="container-page max-w-md">
          <div className="card-surface p-8">
            <h1 className="font-display text-2xl font-extrabold">Set a new password</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Open this page from the reset link we emailed you.
            </p>
            <form className="mt-6 space-y-4" onSubmit={submit}>
              <div className="space-y-1.5">
                <Label htmlFor="pw">New password</Label>
                <Input
                  id="pw"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pw2">Confirm password</Label>
                <Input
                  id="pw2"
                  type="password"
                  required
                  minLength={8}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={busy}>
                Update password
              </Button>
            </form>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
