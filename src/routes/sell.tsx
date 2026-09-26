import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ClipboardCheck, Handshake, Search, Upload, X } from "lucide-react";

import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { SELL_BUCKET, validateImageFiles } from "@/lib/media";
import { fuelTypes, transmissions } from "@/lib/vehicles";
import { useSession } from "@/hooks/useAuth";

export const Route = createFileRoute("/sell")({
  head: () => ({
    meta: [
      { title: "Sell Your Car — Get a Valuation | TNL Motor" },
      {
        name: "description",
        content:
          "Tell us about your car and get a same-day valuation from TNL Motor. We buy outright or take trade-ins.",
      },
      { property: "og:title", content: "Sell Your Car — TNL Motor" },
      { property: "og:description", content: "Get a same-day valuation for your car." },
    ],
  }),
  component: Sell,
});

const steps = [
  { icon: ClipboardCheck, title: "Tell us about it", copy: "Share the details and a few photos — it takes two minutes." },
  { icon: Search, title: "We value it", copy: "Our buyers check the market and come back with a figure." },
  { icon: Handshake, title: "You get paid", copy: "Accept the offer, we handle transfer and payment the same day." },
];

function Sell() {
  const { user } = useSession();
  const [files, setFiles] = useState<File[]>([]);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    make: "",
    model: "",
    year: "",
    mileage: "",
    transmission: "",
    fuel_type: "",
    expected_price: "",
    location: "",
    description: "",
  });

  const submit = useMutation({
    mutationFn: async () => {
      let photos: string[] = [];
      if (files.length && user) {
        const validationError = validateImageFiles(files);
        if (validationError) throw new Error(validationError);
        const uploads = await Promise.all(
          files.map(async (file) => {
            const path = `${user.id}/${crypto.randomUUID()}-${file.name.replace(/[^\w.-]/g, "_")}`;
            const { error } = await supabase.storage.from(SELL_BUCKET).upload(path, file);
            if (error) throw error;
            return path;
          }),
        );
        photos = uploads;
      }

      const { error } = await supabase.from("sell_requests").insert({
        user_id: user?.id ?? null,
        name: form.name,
        phone: form.phone,
        email: form.email,
        make: form.make,
        model: form.model,
        year: form.year ? Number(form.year) : null,
        mileage: form.mileage ? Number(form.mileage) : null,
        transmission: form.transmission || null,
        fuel_type: form.fuel_type || null,
        expected_price: form.expected_price ? Number(form.expected_price) : null,
        location: form.location || null,
        description: form.description || null,
        photos,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Received. A buyer will contact you with a valuation.");
      setFiles([]);
      setForm({
        name: "",
        phone: "",
        email: "",
        make: "",
        model: "",
        year: "",
        mileage: "",
        transmission: "",
        fuel_type: "",
        expected_price: "",
        location: "",
        description: "",
      });
    },
    onError: (error: Error) => toast.error(error.message || "We couldn't submit that request. Please try again."),
  });

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Sell your car"
        title="Get a fair price, without the hassle"
        description="We buy outright or take your car in part-exchange against anything on our floor."
      />

      <section className="section">
        <div className="container-page grid gap-4 sm:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.title} className="card-surface p-6">
              <span className="eyebrow text-accent">Step {i + 1}</span>
              <s.icon className="mt-3 size-7 text-accent" />
              <h2 className="mt-3 font-bold">{s.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{s.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section pt-0">
        <div className="container-page max-w-3xl">
          <form
            className="card-surface space-y-5 p-6 md:p-8"
            onSubmit={(e) => {
              e.preventDefault();
              if (!form.name || !form.phone || !form.make || !form.model) {
                toast.error("Please fill in your contact details and the car's make and model");
                return;
              }
              submit.mutate();
            }}
          >
            <h2 className="font-display text-xl font-bold">Your car</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="s-make" label="Make" value={form.make} onChange={(v) => setForm({ ...form, make: v })} required />
              <Field id="s-model" label="Model" value={form.model} onChange={(v) => setForm({ ...form, model: v })} required />
              <Field id="s-year" label="Year" type="number" value={form.year} onChange={(v) => setForm({ ...form, year: v })} />
              <Field id="s-mileage" label="Mileage (km)" type="number" value={form.mileage} onChange={(v) => setForm({ ...form, mileage: v })} />
              <div className="space-y-1.5">
                <Label>Transmission</Label>
                <Select value={form.transmission} onValueChange={(v) => setForm({ ...form, transmission: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {transmissions.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Fuel type</Label>
                <Select value={form.fuel_type} onValueChange={(v) => setForm({ ...form, fuel_type: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {fuelTypes.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Field id="s-price" label="Expected price" type="number" value={form.expected_price} onChange={(v) => setForm({ ...form, expected_price: v })} />
              <Field id="s-location" label="Location" value={form.location} onChange={(v) => setForm({ ...form, location: v })} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="s-desc">Anything we should know?</Label>
              <Textarea id="s-desc" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="s-photos">Photos</Label>
              {user ? (
                <>
                  <label
                    htmlFor="s-photos"
                    className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-sm text-muted-foreground hover:border-accent hover:text-accent"
                  >
                    <Upload className="size-4" /> Add photos of your car
                  </label>
                  <input
                    id="s-photos"
                    type="file"
                    accept="image/*"
                    multiple
                    className="sr-only"
                    onChange={(e) => {
                      const selected = Array.from(e.target.files ?? []);
                      const validationError = validateImageFiles([...files, ...selected]);
                      if (validationError) {
                        toast.error(validationError);
                        e.currentTarget.value = "";
                        return;
                      }
                      setFiles([...files, ...selected]);
                      e.currentTarget.value = "";
                    }}
                  />
                  {files.length ? (
                    <ul className="space-y-1 text-sm">
                      {files.map((f, i) => (
                        <li key={`${f.name}-${i}`} className="flex items-center justify-between rounded bg-secondary px-3 py-1.5">
                          <span className="truncate">{f.name}</span>
                          <button
                            type="button"
                            aria-label={`Remove ${f.name}`}
                            onClick={() => setFiles(files.filter((_, idx) => idx !== i))}
                          >
                            <X className="size-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </>
              ) : (
                <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                  <Link to="/auth" search={{ redirect: "/sell" }} className="font-semibold text-accent hover:underline">
                    Sign in
                  </Link>{" "}
                  to attach photos — you can still send the details without them.
                </p>
              )}
            </div>

            <h2 className="font-display text-xl font-bold">Your details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="s-name" label="Full name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
              <Field id="s-phone" label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} required />
            </div>
            <Field id="s-email" label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />

            <Button type="submit" size="lg" disabled={submit.isPending}>
              {submit.isPending ? "Sending…" : "Request my valuation"}
            </Button>
          </form>
        </div>
      </section>
    </SiteLayout>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} required={required} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
