import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Calendar,
  Check,
  Fuel,
  Gauge,
  Heart,
  MapPin,
  MessageCircle,
  Palette,
  Phone,
  Settings2,
  ShieldCheck,
} from "lucide-react";

import { SiteLayout } from "@/components/site/SiteLayout";
import { VehicleCard } from "@/components/site/VehicleCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { formatMileage, formatNumber, formatPrice, statusLabel, vehicleTitle } from "@/lib/format";
import { useImageUrls } from "@/lib/media";
import { fetchVehicle, fetchVehicles } from "@/lib/vehicles";
import { useSession } from "@/hooks/useAuth";
import { useSettings, whatsappLink } from "@/hooks/useSettings";
import { useToggleWishlist, useWishlistIds } from "@/hooks/useWishlist";

export const Route = createFileRoute("/cars/$vehicleId")({
  head: () => ({
    meta: [
      { title: "Vehicle Details — TNL Motors" },
      {
        name: "description",
        content: "Full specification, photos, features and pricing for this vehicle at TNL Motors.",
      },
      { property: "og:title", content: "Vehicle Details — TNL Motors" },
      {
        property: "og:description",
        content: "Photos, specification and pricing for this inspected vehicle.",
      },
    ],
  }),
  component: VehicleDetails,
});

function VehicleDetails() {
  const { vehicleId } = Route.useParams();
  const { settings } = useSettings();
  const { user } = useSession();
  const { data: savedIds } = useWishlistIds();
  const toggle = useToggleWishlist();
  const [active, setActive] = useState(0);

  const vehicleQuery = useQuery({
    queryKey: ["vehicle", vehicleId],
    queryFn: () => fetchVehicle(vehicleId),
  });
  const vehicle = vehicleQuery.data;

  const paths = [...(vehicle?.vehicle_images ?? [])]
    .sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.position - b.position)
    .map((i) => i.url);
  const { data: imageUrls } = useImageUrls(paths);

  const similar = useQuery({
    queryKey: ["similar", vehicle?.body_type, vehicle?.id],
    enabled: Boolean(vehicle),
    queryFn: () => fetchVehicles({ bodyType: vehicle!.body_type, perPage: 4 }),
  });

  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  useEffect(() => {
    if (user?.email) setForm((f) => ({ ...f, email: f.email || user.email! }));
  }, [user]);

  const enquiry = useMutation({
    mutationFn: async (kind: string) => {
      const { error } = await supabase.from("enquiries").insert({
        vehicle_id: vehicleId,
        user_id: user?.id ?? null,
        name: form.name,
        email: form.email,
        phone: form.phone,
        message: form.message,
        kind,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Enquiry sent. Our team will call you shortly.");
      setForm({ name: "", email: user?.email ?? "", phone: "", message: "" });
    },
    onError: () => toast.error("We couldn't send that enquiry. Please try again."),
  });

  function submit(e: React.FormEvent, kind: string) {
    e.preventDefault();
    if (!form.name || !form.phone) {
      toast.error("Please add your name and phone number");
      return;
    }
    enquiry.mutate(kind);
  }

  if (vehicleQuery.isLoading) {
    return (
      <SiteLayout>
        <div className="container-page section space-y-6">
          <Skeleton className="aspect-[16/9] w-full rounded-2xl" />
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-40 w-full" />
        </div>
      </SiteLayout>
    );
  }

  if (!vehicle) {
    return (
      <SiteLayout>
        <div className="container-page section text-center">
          <h1 className="font-display text-3xl font-extrabold">Vehicle not found</h1>
          <p className="mt-3 text-muted-foreground">
            This car may have been sold or removed from the inventory.
          </p>
          <Button asChild className="mt-6">
            <Link to="/cars">Back to inventory</Link>
          </Button>
        </div>
      </SiteLayout>
    );
  }

  const saved = (savedIds ?? []).includes(vehicle.id);
  const title = vehicleTitle(vehicle);
  const features = (vehicle.vehicle_features ?? [])
    .map((f) => f.features?.name)
    .filter(Boolean) as string[];

  const specs = [
    { icon: Calendar, label: "Year", value: String(vehicle.year) },
    { icon: Gauge, label: "Mileage", value: formatMileage(vehicle.mileage) },
    { icon: Fuel, label: "Fuel", value: vehicle.fuel_type },
    { icon: Settings2, label: "Transmission", value: vehicle.transmission },
    { icon: ShieldCheck, label: "Drive", value: vehicle.drive_type ?? "—" },
    { icon: Palette, label: "Colour", value: vehicle.exterior_color ?? "—" },
    { icon: MapPin, label: "Location", value: vehicle.location ?? "—" },
    { icon: Check, label: "Condition", value: vehicle.condition },
  ];

  return (
    <SiteLayout>
      <div className="container-page py-8">
        <Link
          to="/cars"
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-accent"
        >
          <ArrowLeft className="size-4" /> Back to inventory
        </Link>
      </div>

      <div className="container-page grid gap-10 pb-20 lg:grid-cols-[1.6fr_1fr]">
        <div>
          {/* Gallery */}
          <div className="overflow-hidden rounded-2xl border bg-secondary">
            {imageUrls?.[active] ? (
              <img
                src={imageUrls[active]}
                alt={title}
                width={1280}
                height={800}
                className="aspect-[16/10] w-full object-cover"
              />
            ) : (
              <div className="flex aspect-[16/10] w-full items-center justify-center text-sm text-muted-foreground">
                Photos coming soon
              </div>
            )}
          </div>
          {(imageUrls ?? []).length > 1 ? (
            <div className="mt-3 grid grid-cols-5 gap-3">
              {(imageUrls ?? []).map((url, i) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => setActive(i)}
                  className={cn(
                    "overflow-hidden rounded-lg border",
                    i === active && "ring-2 ring-accent",
                  )}
                >
                  <img src={url} alt="" className="aspect-[4/3] w-full object-cover" />
                </button>
              ))}
            </div>
          ) : null}

          {/* Specs */}
          <section className="mt-10">
            <h2 className="font-display text-xl font-bold">Specification</h2>
            <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {specs.map((s) => (
                <div key={s.label} className="card-surface p-4">
                  <s.icon className="size-5 text-accent" />
                  <dt className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">
                    {s.label}
                  </dt>
                  <dd className="text-sm font-semibold">{s.value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
              <p>Stock number: <span className="font-semibold text-foreground">{vehicle.stock_number}</span></p>
              {vehicle.engine_size ? <p>Engine: <span className="font-semibold text-foreground">{vehicle.engine_size}</span></p> : null}
              {vehicle.seats ? <p>Seats: <span className="font-semibold text-foreground">{formatNumber(vehicle.seats)}</span></p> : null}
            </div>
          </section>

          {vehicle.description ? (
            <section className="mt-10">
              <h2 className="font-display text-xl font-bold">About this car</h2>
              <p className="mt-3 whitespace-pre-line leading-relaxed text-muted-foreground">
                {vehicle.description}
              </p>
            </section>
          ) : null}

          {features.length ? (
            <section className="mt-10">
              <h2 className="font-display text-xl font-bold">Features</h2>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="size-4 text-accent" /> {f}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="card-surface sticky top-24 p-6">
            <div className="flex flex-wrap items-center gap-2">
              {vehicle.featured ? <Badge className="bg-accent text-accent-foreground">Featured</Badge> : null}
              <Badge variant={vehicle.status === "available" ? "secondary" : "destructive"}>
                {statusLabel(vehicle.status)}
              </Badge>
              {vehicle.is_demo ? <Badge variant="outline">Demo listing</Badge> : null}
            </div>
            <h1 className="mt-3 font-display text-2xl font-extrabold leading-tight">{title}</h1>
            <p className="mt-2 font-display text-3xl font-extrabold text-accent">
              {formatPrice(vehicle.price)}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {settings.phone ? (
                <Button asChild className="flex-1">
                  <a href={`tel:${settings.phone}`}>
                    <Phone className="mr-1 size-4" /> Call
                  </a>
                </Button>
              ) : null}
              {settings.whatsapp ? (
                <Button asChild variant="outline" className="flex-1">
                  <a
                    href={whatsappLink(settings.whatsapp, `Hi, I'm interested in the ${title} (${vehicle.stock_number})`)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageCircle className="mr-1 size-4" /> WhatsApp
                  </a>
                </Button>
              ) : null}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => toggle.mutate({ vehicleId: vehicle.id, saved })}
              >
                <Heart className={cn("mr-1 size-4", saved && "fill-accent text-accent")} />
                {saved ? "Saved" : "Save this car"}
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link to="/financing" search={{ vehicle: vehicle.id }}>
                  Apply for financing
                </Link>
              </Button>
            </div>

            <form className="mt-6 space-y-3 border-t pt-6" onSubmit={(e) => submit(e, "enquiry")}>
              <h2 className="font-display text-base font-bold">Enquire about this car</h2>
              <div className="space-y-1.5">
                <Label htmlFor="name">Your name</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  rows={3}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder={`I'd like more details about the ${title}.`}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={enquiry.isPending}>
                  Send enquiry
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={enquiry.isPending}
                  onClick={(e) => submit(e, "test_drive")}
                >
                  Book test drive
                </Button>
              </div>
            </form>
          </div>
        </aside>
      </div>

      {(similar.data?.vehicles ?? []).filter((v) => v.id !== vehicle.id).length ? (
        <section className="section bg-secondary/40">
          <div className="container-page">
            <h2 className="font-display text-2xl font-extrabold">Similar vehicles</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {(similar.data?.vehicles ?? [])
                .filter((v) => v.id !== vehicle.id)
                .slice(0, 3)
                .map((v) => (
                  <VehicleCard key={v.id} vehicle={v} />
                ))}
            </div>
          </div>
        </section>
      ) : null}
    </SiteLayout>
  );
}
