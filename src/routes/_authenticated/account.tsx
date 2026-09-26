import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Heart, LogOut } from "lucide-react";

import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { formatDate, formatPrice, statusLabel } from "@/lib/format";
import { useSession } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({
    meta: [
      { title: "My Account — TNL Motor" },
      { name: "description", content: "Manage your TNL Motor profile, enquiries and requests." },
      { property: "og:title", content: "My Account — TNL Motor" },
      { property: "og:description", content: "Your profile, enquiries and requests." },
    ],
  }),
  component: Account,
});

function Account() {
  const { user } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [profile, setProfile] = useState({ full_name: "", phone: "", email: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", next: "" });

  const profileQuery = useQuery({
    queryKey: ["profile", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (profileQuery.data) {
      setProfile({
        full_name: profileQuery.data.full_name ?? "",
        phone: profileQuery.data.phone ?? "",
        email: profileQuery.data.email ?? user?.email ?? "",
      });
    }
  }, [profileQuery.data, user]);

  const enquiries = useQuery({
    queryKey: ["my-enquiries", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("enquiries")
        .select("*, vehicles(make, model, year)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const sellRequests = useQuery({
    queryKey: ["my-sell-requests", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sell_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const financing = useQuery({
    queryKey: ["my-financing", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financing_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: profile.full_name, phone: profile.phone })
      .eq("id", user!.id);
    setSavingProfile(false);
    if (error) {
      toast.error("Could not save your details");
      return;
    }
    toast.success("Details saved");
    profileQuery.refetch();
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({
      password: passwords.next,
      // @ts-expect-error current_password is accepted by Lovable Cloud auth
      current_password: passwords.current,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password updated");
    setPasswords({ current: "", next: "" });
  }

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <SiteLayout>
      <PageHeader eyebrow="Your account" title={profile.full_name || "My account"} description={user?.email ?? ""} />

      <section className="section">
        <div className="container-page">
          <div className="mb-6 flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link to="/wishlist">
                <Heart className="mr-1 size-4" /> Saved cars
              </Link>
            </Button>
            <Button variant="outline" onClick={signOut}>
              <LogOut className="mr-1 size-4" /> Sign out
            </Button>
          </div>

          <Tabs defaultValue="details">
            <TabsList className="flex flex-wrap">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="enquiries">Enquiries</TabsTrigger>
              <TabsTrigger value="sell">Sell requests</TabsTrigger>
              <TabsTrigger value="financing">Financing</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="mt-6 grid gap-6 lg:grid-cols-2">
              <form className="card-surface space-y-4 p-6" onSubmit={saveProfile}>
                <h2 className="font-display text-lg font-bold">Your details</h2>
                <div className="space-y-1.5">
                  <Label htmlFor="a-name">Full name</Label>
                  <Input id="a-name" value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="a-phone">Phone</Label>
                  <Input id="a-phone" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="a-email">Email</Label>
                  <Input id="a-email" value={profile.email} disabled />
                </div>
                <Button type="submit" disabled={savingProfile}>
                  Save changes
                </Button>
              </form>

              <form className="card-surface space-y-4 p-6" onSubmit={changePassword}>
                <h2 className="font-display text-lg font-bold">Change password</h2>
                <div className="space-y-1.5">
                  <Label htmlFor="a-current">Current password</Label>
                  <Input id="a-current" type="password" required value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="a-next">New password</Label>
                  <Input id="a-next" type="password" required minLength={8} value={passwords.next} onChange={(e) => setPasswords({ ...passwords, next: e.target.value })} />
                </div>
                <Button type="submit">Update password</Button>
              </form>
            </TabsContent>

            <TabsContent value="enquiries" className="mt-6 space-y-3">
              {(enquiries.data ?? []).length === 0 ? (
                <EmptyState text="You haven't made any enquiries yet." />
              ) : (
                (enquiries.data ?? []).map((e) => (
                  <div key={e.id} className="card-surface flex flex-wrap items-center justify-between gap-3 p-5">
                    <div>
                      <p className="font-semibold">
                        {e.vehicles
                          ? `${e.vehicles.year} ${e.vehicles.make} ${e.vehicles.model}`
                          : "General enquiry"}
                      </p>
                      <p className="text-sm text-muted-foreground">{e.message || "—"}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{formatDate(e.created_at)}</p>
                    </div>
                    <Badge variant="secondary">{statusLabel(e.status)}</Badge>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="sell" className="mt-6 space-y-3">
              {(sellRequests.data ?? []).length === 0 ? (
                <EmptyState text="No sell requests yet." />
              ) : (
                (sellRequests.data ?? []).map((r) => (
                  <div key={r.id} className="card-surface flex flex-wrap items-center justify-between gap-3 p-5">
                    <div>
                      <p className="font-semibold">
                        {r.year} {r.make} {r.model}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Expected {formatPrice(r.expected_price)} · {formatDate(r.created_at)}
                      </p>
                    </div>
                    <Badge variant="secondary">{statusLabel(r.status)}</Badge>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="financing" className="mt-6 space-y-3">
              {(financing.data ?? []).length === 0 ? (
                <EmptyState text="No financing applications yet." />
              ) : (
                (financing.data ?? []).map((f) => (
                  <div key={f.id} className="card-surface flex flex-wrap items-center justify-between gap-3 p-5">
                    <div>
                      <p className="font-semibold">{f.vehicle_interest || "Financing application"}</p>
                      <p className="text-sm text-muted-foreground">
                        Deposit {formatPrice(f.deposit)} · {f.payment_period} · {formatDate(f.created_at)}
                      </p>
                    </div>
                    <Badge variant="secondary">{statusLabel(f.status)}</Badge>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </SiteLayout>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="card-surface p-10 text-center text-sm text-muted-foreground">{text}</div>
  );
}
