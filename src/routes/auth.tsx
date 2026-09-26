import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { SiteLayout } from "@/components/site/SiteLayout";
import { Logo } from "@/components/site/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useSession } from "@/hooks/useAuth";

const searchSchema = z.object({
  mode: z.enum(["signin", "signup"]).optional(),
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign In or Create an Account — TNL Motor" },
      {
        name: "description",
        content:
          "Sign in to your TNL Motor account to save cars, track enquiries and manage your details.",
      },
      { property: "og:title", content: "Sign In — TNL Motor" },
      { property: "og:description", content: "Access your TNL Motor customer account." },
    ],
  }),
  component: AuthPage,
});

function safePath(value: string | undefined): string {
  if (!value) return "/account";
  if (!value.startsWith("/") || value.startsWith("//")) return "/account";
  return value;
}

function AuthPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { user, loading } = useSession();
  const [busy, setBusy] = useState(false);
  const target = safePath(search.redirect);
  const siteOrigin = (import.meta.env["VITE_SITE_URL"] || "https://tnl-motor-app.vercel.app").replace(/\/$/, "");

  useEffect(() => {
    if (loading || !user) return;

    let active = true;
    void supabase.rpc("is_admin").then(({ data, error }) => {
      if (!active) return;
      const destination = !error && data === true ? "/admin" : target;
      navigate({ to: destination, replace: true });
    });

    return () => {
      active = false;
    };
  }, [loading, user, navigate, target]);

  const [signIn, setSignIn] = useState({ email: "", password: "" });
  const [signUp, setSignUp] = useState({ name: "", email: "", phone: "", password: "" });
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const email = signIn.email.trim().toLowerCase();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: signIn.password,
    });
    setBusy(false);
    if (error) {
      toast.error(
        error.message === "Invalid login credentials"
          ? "The production account rejected these credentials. Check the email/password, or use the secure email sign-in link below."
          : error.message,
      );
      return;
    }
    const { data: isAdmin, error: roleError } = await supabase.rpc("is_admin");
    const destination = !roleError && isAdmin === true ? "/admin" : target;
    toast.success(
      destination === "/admin" ? "Welcome to the TNL Motor Admin Panel" : "Welcome back",
    );
    navigate({ to: destination, replace: true });
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: signUp.email,
      password: signUp.password,
      options: {
        emailRedirectTo: `${siteOrigin}${target}`,
        data: { full_name: signUp.name, phone: signUp.phone },
      },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (!data.session) {
      toast.success("Check your email to confirm your account");
      return;
    }
    toast.success("Account created");
    navigate({ to: target, replace: true });
  }

  async function handleGoogle() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${siteOrigin}/auth${search.redirect ? `?redirect=${encodeURIComponent(target)}` : ""}`,
    });
    if (result.error) {
      toast.error("Google sign-in is unavailable right now");
      return;
    }
    if (result.redirected) return;
    navigate({ to: target, replace: true });
  }

  async function handleEmailLoginLink() {
    const email = signIn.email.trim().toLowerCase();
    if (!email) {
      toast.error("Enter your email address first");
      return;
    }

    setLoginLinkBusy(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${siteOrigin}${target}`,
      },
    });
    setLoginLinkBusy(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Secure sign-in link sent. Check your email inbox.");
  }

  async function handleReset() {
    if (!signIn.email) {
      toast.error("Enter your email address first");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(signIn.email, {
      redirectTo: `${siteOrigin}/reset-password`,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password reset link sent to your email");
  }

  return (
    <SiteLayout>
      <section className="section">
        <div className="container-page max-w-md">
          <div className="card-surface p-8">
            <Logo className="mb-6" />
            <Tabs defaultValue={search.mode === "signup" ? "signup" : "signin"}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign in</TabsTrigger>
                <TabsTrigger value="signup">Create account</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form className="mt-6 space-y-4" onSubmit={handleSignIn}>
                  <div className="space-y-1.5">
                    <Label htmlFor="si-email">Email</Label>
                    <Input
                      id="si-email"
                      type="email"
                      required
                      value={signIn.email}
                      onChange={(e) => setSignIn({ ...signIn, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="si-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="si-password"
                        type={showSignInPassword ? "text" : "password"}
                        required
                        value={signIn.password}
                        onChange={(e) => setSignIn({ ...signIn, password: e.target.value })}
                        className="pr-11"
                      />
                      <button
                        type="button"
                        aria-label={showSignInPassword ? "Hide password" : "Show password"}
                        onClick={() => setShowSignInPassword((visible) => !visible)}
                        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground hover:text-foreground"
                      >
                        {showSignInPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={busy}>
                    {busy ? <Loader2 className="mr-1 size-4 animate-spin" /> : null} Sign in
                  </Button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="w-full text-sm text-muted-foreground hover:text-accent"
                  >
                    Forgot your password?
                  </button>
                  {search.redirect === "/admin" ? (
                    <button
                      type="button"
                      onClick={handleEmailLoginLink}
                      disabled={loginLinkBusy}
                      className="w-full text-sm font-medium text-accent hover:underline disabled:opacity-60"
                    >
                      {loginLinkBusy ? "Sending secure sign-in link…" : "Sign in to Admin with an email link"}
                    </button>
                  ) : null}
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form className="mt-6 space-y-4" onSubmit={handleSignUp}>
                  <div className="space-y-1.5">
                    <Label htmlFor="su-name">Full name</Label>
                    <Input
                      id="su-name"
                      required
                      value={signUp.name}
                      onChange={(e) => setSignUp({ ...signUp, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="su-email">Email</Label>
                    <Input
                      id="su-email"
                      type="email"
                      required
                      value={signUp.email}
                      onChange={(e) => setSignUp({ ...signUp, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="su-phone">Phone</Label>
                    <Input
                      id="su-phone"
                      value={signUp.phone}
                      onChange={(e) => setSignUp({ ...signUp, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="su-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="su-password"
                        type={showSignUpPassword ? "text" : "password"}
                        required
                        minLength={8}
                        value={signUp.password}
                        onChange={(e) => setSignUp({ ...signUp, password: e.target.value })}
                        className="pr-11"
                      />
                      <button
                        type="button"
                        aria-label={showSignUpPassword ? "Hide password" : "Show password"}
                        onClick={() => setShowSignUpPassword((visible) => !visible)}
                        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground hover:text-foreground"
                      >
                        {showSignUpPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={busy}>
                    {busy ? <Loader2 className="mr-1 size-4 animate-spin" /> : null} Create account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
              <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
            </div>
            <Button variant="outline" className="w-full" onClick={handleGoogle}>
              Continue with Google
            </Button>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              By continuing you agree to be contacted about your enquiries.{" "}
              <Link to="/contact" className="text-accent hover:underline">
                Questions?
              </Link>
            </p>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
