import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";

import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice, vehicleTitle } from "@/lib/format";
import { fetchVehicle } from "@/lib/vehicles";
import { useSession } from "@/hooks/useAuth";

const searchSchema = z.object({ vehicle: z.string().optional() });

export const Route = createFileRoute("/financing")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Car Financing — Estimate Repayments | TNL Motors" },
      {
        name: "description",
        content:
          "Estimate your monthly car repayment and apply for financing through TNL Motors' lending partners.",
      },
      { property: "og:title", content: "Car Financing — TNL Motors" },
      { property: "og:description", content: "Estimate repayments and apply for vehicle financing." },
    ],
  }),
  component: Financing,
});

const RATE = 0.14; // indicative annual rate used for the estimate only

function Financing() {
  const search = Route.useSearch();
  const { user } = useSession();

  const vehicleQuery = useQuery({
    queryKey: ["vehicle", search.vehicle],
    enabled: Boolean(search.vehicle),
    queryFn: () => fetchVehicle(search.vehicle!),
  });

  const [price, setPrice] = useState(3000000);
  const [deposit, setDeposit] = useState(600000);
  const [months, setMonths] = useState(36);

  const effectivePrice = vehicleQuery.data ? Number(vehicleQuery.data.price) : price;

  const monthly = useMemo(() => {
    const principal = Math.max(effectivePrice - deposit, 0);
    const r = RATE / 12;
    if (principal === 0) return 0;
    return (principal * r) / (1 - Math.pow(1 + r, -months));
  }, [effectivePrice, deposit, months]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    employment_status: "",
    monthly_income: "",
  });

  const apply = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("financing_requests").insert({
        user_id: user?.id ?? null,
        vehicle_id: vehicleQuery.data?.id ?? null,
        name: form.name,
        email: form.email,
        phone: form.phone,
        vehicle_interest: vehicleQuery.data ? vehicleTitle(vehicleQuery.data) : null,
        employment_status: form.employment_status || null,
        monthly_income: form.monthly_income ? Number(form.monthly_income) : null,
        deposit,
        payment_period: `${months} months`,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Application received. A finance advisor will call you.");
      setForm({ name: "", email: "", phone: "", employment_status: "", monthly_income: "" });
    },
    onError: () => toast.error("We couldn't submit that application. Please try again."),
  });

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Financing"
        title="Spread the cost of your next car"
        description="Use the calculator for an indicative monthly figure, then apply and we'll match you with a lender."
      />

      <section className="section">
        <div className="container-page grid gap-10 lg:grid-cols-2">
          {/* Calculator */}
          <div className="card-surface p-6 md:p-8">
            <h2 className="font-display text-xl font-bold">Repayment estimator</h2>

            {vehicleQuery.data ? (
              <p className="mt-2 text-sm text-muted-foreground">
                Based on the {vehicleTitle(vehicleQuery.data)} at{" "}
                {formatPrice(vehicleQuery.data.price)}.
              </p>
            ) : (
              <div className="mt-6 space-y-2">
                <Label>Car price: {formatPrice(price)}</Label>
                <Slider
                  value={[price]}
                  min={500000}
                  max={15000000}
                  step={50000}
                  onValueChange={([v]) => setPrice(v ?? price)}
                />
              </div>
            )}

            <div className="mt-6 space-y-2">
              <Label>Deposit: {formatPrice(deposit)}</Label>
              <Slider
                value={[deposit]}
                min={0}
                max={Math.max(effectivePrice - 100000, 100000)}
                step={25000}
                onValueChange={([v]) => setDeposit(v ?? deposit)}
              />
            </div>

            <div className="mt-6 space-y-2">
              <Label>Repayment period: {months} months</Label>
              <Slider
                value={[months]}
                min={12}
                max={72}
                step={6}
                onValueChange={([v]) => setMonths(v ?? months)}
              />
            </div>

            <div className="mt-8 rounded-xl bg-ink p-6 text-ink-foreground">
              <p className="eyebrow text-accent">Estimated monthly payment</p>
              <p className="mt-2 font-display text-3xl font-extrabold">{formatPrice(monthly)}</p>
              <p className="mt-2 text-xs text-ink-muted">
                Indicative only, at {Math.round(RATE * 100)}% per year. Final terms come from the
                lender.
              </p>
            </div>
          </div>

          {/* Application */}
          <form
            className="card-surface space-y-4 p-6 md:p-8"
            onSubmit={(e) => {
              e.preventDefault();
              if (!form.name || !form.phone) {
                toast.error("Please add your name and phone number");
                return;
              }
              apply.mutate();
            }}
          >
            <h2 className="font-display text-xl font-bold">Apply for financing</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="f-name">Full name</Label>
                <Input id="f-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="f-phone">Phone</Label>
                <Input id="f-phone" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="f-email">Email</Label>
              <Input id="f-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Employment status</Label>
                <Select
                  value={form.employment_status}
                  onValueChange={(v) => setForm({ ...form, employment_status: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Employed">Employed</SelectItem>
                    <SelectItem value="Self-employed">Self-employed</SelectItem>
                    <SelectItem value="Business owner">Business owner</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="f-income">Monthly income</Label>
                <Input
                  id="f-income"
                  type="number"
                  value={form.monthly_income}
                  onChange={(e) => setForm({ ...form, monthly_income: e.target.value })}
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Deposit {formatPrice(deposit)} over {months} months — estimated {formatPrice(monthly)}{" "}
              per month.
            </p>
            <Button type="submit" disabled={apply.isPending}>
              Submit application
            </Button>
          </form>
        </div>
      </section>
    </SiteLayout>
  );
}
