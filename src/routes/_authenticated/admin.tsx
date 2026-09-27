import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Car,
  FileText,
  Gauge,
  HandCoins,
  LayoutGrid,
  MessageSquare,
  Quote,
  Settings,
  Tags,
  Users,
  Wrench,
} from "lucide-react";

import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/useAuth";
import { formatPrice } from "@/lib/format";
import { AdminVehicles } from "@/components/admin/AdminVehicles";
import { AdminRequests } from "@/components/admin/AdminRequests";
import { AdminCustomers } from "@/components/admin/AdminCustomers";
import { AdminContent } from "@/components/admin/AdminContent";
import { AdminSettings } from "@/components/admin/AdminSettings";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin — TNL Motors" },
      { name: "description", content: "Manage TNL Motors inventory, enquiries and website content." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin — TNL Motors" },
      { property: "og:description", content: "TNL Motors administration." },
    ],
  }),
  component: AdminPage,
});

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: Gauge },
  { id: "vehicles", label: "Vehicles", icon: Car },
  { id: "categories", label: "Categories", icon: LayoutGrid },
  { id: "features", label: "Features", icon: Tags },
  { id: "enquiries", label: "Enquiries", icon: MessageSquare },
  { id: "sell", label: "Sell requests", icon: FileText },
  { id: "financing", label: "Financing", icon: HandCoins },
  { id: "customers", label: "Customers", icon: Users },
  { id: "services", label: "Services", icon: Wrench },
  { id: "testimonials", label: "Testimonials", icon: Quote },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

type TabId = (typeof tabs)[number]["id"];

function AdminPage() {
  const { isAdmin, loading } = useIsAdmin();
  const [tab, setTab] = useState<TabId>("dashboard");

  if (loading) {
    return (
      <SiteLayout>
        <div className="container-page py-24 text-center text-muted-foreground">Checking access…</div>
      </SiteLayout>
    );
  }

  if (!isAdmin) {
    return (
      <SiteLayout>
        <div className="container-page py-24 text-center">
          <h1 className="font-display text-2xl font-bold">Admins only</h1>
          <p className="mt-2 text-muted-foreground">
            This area is restricted to TNL Motors staff accounts.
          </p>
          <Button asChild className="mt-6">
            <Link to="/">Back to the site</Link>
          </Button>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="container-page py-10">
        <h1 className="font-display text-3xl font-bold">TNL Motors admin</h1>
        <p className="mt-1 text-muted-foreground">Manage inventory, requests and site content.</p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[220px_1fr]">
          <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                  tab === t.id
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <t.icon className="size-4" />
                {t.label}
              </button>
            ))}
          </nav>

          <div className="min-w-0">
            {tab === "dashboard" ? <Dashboard /> : null}
            {tab === "vehicles" ? <AdminVehicles /> : null}
            {tab === "categories" ? (
              <AdminContent
                table="categories"
                title="Categories"
                description="Body-type categories shown on the home page."
                invalidate={["categories"]}
                fields={[
                  { key: "name", label: "Name", required: true },
                  { key: "slug", label: "Slug" },
                  { key: "body_type", label: "Body type" },
                  { key: "position", label: "Position", kind: "number" },
                ]}
              />
            ) : null}
            {tab === "features" ? (
              <AdminContent
                table="features"
                title="Features"
                description="The feature list you can tick on each vehicle."
                invalidate={["features"]}
                fields={[
                  { key: "name", label: "Name", required: true },
                  { key: "position", label: "Position", kind: "number" },
                ]}
              />
            ) : null}
            {tab === "enquiries" ? (
              <AdminRequests
                table="enquiries"
                title="Enquiries"
                description="Vehicle enquiries, test drive requests and contact messages."
              />
            ) : null}
            {tab === "sell" ? (
              <AdminRequests
                table="sell_requests"
                title="Sell requests"
                description="Cars people want to sell to TNL Motors."
              />
            ) : null}
            {tab === "financing" ? (
              <AdminRequests
                table="financing_requests"
                title="Financing applications"
                description="Finance enquiries submitted from the website."
              />
            ) : null}
            {tab === "customers" ? <AdminCustomers /> : null}
            {tab === "services" ? (
              <AdminContent
                table="services"
                title="Services"
                description="Services listed on the services page."
                invalidate={["services"]}
                primaryKeyField="title"
                fields={[
                  { key: "title", label: "Title", required: true },
                  { key: "description", label: "Description", kind: "textarea", required: true },
                  { key: "icon", label: "Icon name" },
                  { key: "position", label: "Position", kind: "number" },
                  { key: "published", label: "Published", kind: "switch" },
                ]}
              />
            ) : null}
            {tab === "testimonials" ? (
              <AdminContent
                table="testimonials"
                title="Testimonials"
                description="Customer reviews shown on the home and about pages."
                order="created_at"
                invalidate={["testimonials"]}
                fields={[
                  { key: "name", label: "Customer name", required: true },
                  { key: "location", label: "Location" },
                  { key: "rating", label: "Rating (1-5)", kind: "number" },
                  { key: "review", label: "Review", kind: "textarea", required: true },
                  { key: "vehicle_purchased", label: "Vehicle purchased" },
                  { key: "published", label: "Published", kind: "switch" },
                ]}
              />
            ) : null}
            {tab === "settings" ? <AdminSettings /> : null}
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}

function Dashboard() {
  const stats = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [vehicles, available, sold, enquiries, sell, financing, customers, values] =
        await Promise.all([
          supabase.from("vehicles").select("id", { count: "exact", head: true }),
          supabase
            .from("vehicles")
            .select("id", { count: "exact", head: true })
            .eq("status", "available"),
          supabase.from("vehicles").select("id", { count: "exact", head: true }).eq("status", "sold"),
          supabase
            .from("enquiries")
            .select("id", { count: "exact", head: true })
            .eq("status", "new"),
          supabase
            .from("sell_requests")
            .select("id", { count: "exact", head: true })
            .eq("status", "new"),
          supabase
            .from("financing_requests")
            .select("id", { count: "exact", head: true })
            .eq("status", "new"),
          supabase.from("profiles").select("id", { count: "exact", head: true }),
          supabase.from("vehicles").select("price").eq("status", "available"),
        ]);

      const stockValue = (values.data ?? []).reduce((sum, v) => sum + Number(v.price ?? 0), 0);

      return {
        vehicles: vehicles.count ?? 0,
        available: available.count ?? 0,
        sold: sold.count ?? 0,
        enquiries: enquiries.count ?? 0,
        sell: sell.count ?? 0,
        financing: financing.count ?? 0,
        customers: customers.count ?? 0,
        stockValue,
      };
    },
  });

  const cards = [
    { label: "Vehicles", value: stats.data?.vehicles ?? 0 },
    { label: "Available", value: stats.data?.available ?? 0 },
    { label: "Sold", value: stats.data?.sold ?? 0 },
    { label: "Customers", value: stats.data?.customers ?? 0 },
    { label: "New enquiries", value: stats.data?.enquiries ?? 0 },
    { label: "New sell requests", value: stats.data?.sell ?? 0 },
    { label: "New finance requests", value: stats.data?.financing ?? 0 },
  ];

  return (
    <div>
      <h2 className="font-display text-xl font-bold">Dashboard</h2>
      <p className="text-sm text-muted-foreground">A quick view of the business today.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="card-surface p-5">
            <p className="text-sm text-muted-foreground">{c.label}</p>
            <p className="mt-1 font-display text-3xl font-bold">{c.value}</p>
          </div>
        ))}
        <div className="card-surface p-5 sm:col-span-2">
          <p className="text-sm text-muted-foreground">Value of available stock</p>
          <p className="mt-1 font-display text-3xl font-bold">
            {formatPrice(stats.data?.stockValue ?? 0)}
          </p>
        </div>
      </div>
    </div>
  );
}
