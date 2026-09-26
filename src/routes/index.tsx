import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  Car,
  MessageCircle,
  Phone,
  Quote,
  Search,
  ShieldCheck,
  Star,
} from "lucide-react";

import heroImage from "@/assets/hero-showroom.jpg";
import { SiteLayout } from "@/components/site/SiteLayout";
import { VehicleCard, VehicleCardSkeleton } from "@/components/site/VehicleCard";
import { ServiceIcon } from "@/components/site/ServiceIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchFeaturedVehicles, fetchMakes, bodyTypes } from "@/lib/vehicles";
import { fetchCategories, fetchServices, fetchTestimonials } from "@/lib/content";
import { useSettings, whatsappLink } from "@/hooks/useSettings";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TNL Motor — Quality Cars for Sale, Financing & Trade-Ins" },
      {
        name: "description",
        content:
          "Browse inspected cars, SUVs and pickups at TNL Motor. Transparent pricing, flexible financing and a fair price for your current car.",
      },
      { property: "og:title", content: "TNL Motor — Quality Cars for Sale" },
      {
        property: "og:description",
        content: "Inspected vehicles, transparent pricing and flexible financing.",
      },
    ],
  }),
  component: Home,
});

const trust = [
  { icon: ShieldCheck, title: "Inspected & verified", copy: "Every car passes a documented multi-point inspection before it reaches the floor." },
  { icon: Banknote, title: "Honest pricing", copy: "One clear price with no hidden add-ons, and financing figures explained up front." },
  { icon: BadgeCheck, title: "Clean paperwork", copy: "Logbook transfer, valuation and registration handled by our in-house team." },
  { icon: Car, title: "We buy cars too", copy: "Sell or trade in your current car and get a same-day offer from our buyers." },
];

function Home() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [make, setMake] = useState("");
  const [body, setBody] = useState("");
  const [budget, setBudget] = useState("");
  const [keyword, setKeyword] = useState("");

  const featured = useQuery({ queryKey: ["featured-vehicles"], queryFn: () => fetchFeaturedVehicles(6) });
  const makes = useQuery({ queryKey: ["makes"], queryFn: fetchMakes });
  const categories = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const services = useQuery({ queryKey: ["services"], queryFn: fetchServices });
  const testimonials = useQuery({ queryKey: ["testimonials"], queryFn: fetchTestimonials });

  function runSearch() {
    navigate({
      to: "/cars",
      search: {
        ...(make ? { make } : {}),
        ...(body ? { bodyType: body } : {}),
        ...(budget ? { maxPrice: Number(budget) } : {}),
        ...(keyword ? { model: keyword } : {}),
      },
    });
  }

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-ink text-ink-foreground">
        <img
          src={heroImage}
          alt=""
          width={1920}
          height={1088}
          className="absolute inset-0 -z-10 h-full w-full object-cover opacity-70"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/90 to-ink/30" />
        <div className="container-page py-20 md:py-32">
          <p className="eyebrow text-accent">{settings.company_name}</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-[1.05] md:text-6xl">
            {settings.hero_heading}
          </h1>
          <p className="mt-5 max-w-xl text-base text-ink-muted md:text-lg">
            {settings.hero_description}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/cars">
                Browse inventory <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-ink-muted/40 bg-transparent text-ink-foreground hover:bg-ink-foreground/10">
              <Link to="/sell">Sell your car</Link>
            </Button>
          </div>

          {/* Quick search */}
          <div className="mt-12 rounded-2xl border border-ink-muted/20 bg-card p-4 text-foreground shadow-[var(--shadow-lift)] md:p-5">
            <div className="grid gap-3 md:grid-cols-5">
              <Select value={make} onValueChange={setMake}>
                <SelectTrigger aria-label="Make">
                  <SelectValue placeholder="Any make" />
                </SelectTrigger>
                <SelectContent>
                  {(makes.data ?? []).map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={body} onValueChange={setBody}>
                <SelectTrigger aria-label="Body type">
                  <SelectValue placeholder="Any body type" />
                </SelectTrigger>
                <SelectContent>
                  {bodyTypes.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={budget} onValueChange={setBudget}>
                <SelectTrigger aria-label="Maximum budget">
                  <SelectValue placeholder="Any budget" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2000000">Up to 2M</SelectItem>
                  <SelectItem value="4000000">Up to 4M</SelectItem>
                  <SelectItem value="6000000">Up to 6M</SelectItem>
                  <SelectItem value="10000000">Up to 10M</SelectItem>
                </SelectContent>
              </Select>

              <Input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runSearch()}
                placeholder="Model keyword"
                aria-label="Model keyword"
              />

              <Button onClick={runSearch} size="lg">
                <Search className="mr-1 size-4" /> Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="section">
        <div className="container-page grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {trust.map((item) => (
            <div key={item.title} className="card-surface p-6">
              <item.icon className="size-7 text-accent" />
              <h3 className="mt-4 text-base font-bold">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.copy}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="section bg-secondary/40">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">In stock now</p>
              <h2 className="mt-2 text-2xl font-extrabold md:text-4xl">Featured vehicles</h2>
            </div>
            <Button asChild variant="outline">
              <Link to="/cars">
                View all cars <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featured.isLoading
              ? Array.from({ length: 6 }).map((_, i) => <VehicleCardSkeleton key={i} />)
              : (featured.data ?? []).map((v) => <VehicleCard key={v.id} vehicle={v} />)}
          </div>
          {featured.isError ? (
            <p className="mt-6 text-sm text-destructive">We couldn't load the inventory. Please refresh.</p>
          ) : null}
        </div>
      </section>

      {/* Categories */}
      <section className="section">
        <div className="container-page">
          <p className="eyebrow">Shop by type</p>
          <h2 className="mt-2 text-2xl font-extrabold md:text-4xl">Find the shape that fits you</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(categories.data ?? []).map((c) => (
              <Link
                key={c.id}
                to="/cars"
                search={{ bodyType: c.body_type ?? undefined }}
                className="card-surface group flex items-center justify-between p-5 transition-colors hover:border-accent"
              >
                <span className="font-display text-lg font-bold">{c.name}</span>
                <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-accent" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="section bg-secondary/40">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">What we do</p>
              <h2 className="mt-2 text-2xl font-extrabold md:text-4xl">Services</h2>
            </div>
            <Button asChild variant="outline">
              <Link to="/services">All services</Link>
            </Button>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {(services.data ?? []).slice(0, 4).map((s) => (
              <div key={s.id} className="card-surface p-6">
                <ServiceIcon name={s.icon} className="size-7 text-accent" />
                <h3 className="mt-4 text-base font-bold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {(testimonials.data ?? []).length > 0 ? (
        <section className="section">
          <div className="container-page">
            <p className="eyebrow">Customer stories</p>
            <h2 className="mt-2 text-2xl font-extrabold md:text-4xl">What buyers say</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {(testimonials.data ?? []).map((t) => (
                <figure key={t.id} className="card-surface p-6">
                  <Quote className="size-6 text-accent" />
                  <div className="mt-3 flex gap-0.5">
                    {Array.from({ length: t.rating ?? 5 }).map((_, i) => (
                      <Star key={i} className="size-4 fill-accent text-accent" />
                    ))}
                  </div>
                  <blockquote className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {t.review}
                  </blockquote>
                  <figcaption className="mt-4 text-sm font-semibold">
                    {t.name}
                    {t.location ? (
                      <span className="font-normal text-muted-foreground"> · {t.location}</span>
                    ) : null}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* CTA */}
      <section className="bg-ink py-16 text-ink-foreground md:py-24">
        <div className="container-page flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div>
            <h2 className="max-w-xl text-2xl font-extrabold md:text-4xl">{settings.cta_heading}</h2>
            <p className="mt-3 max-w-lg text-ink-muted">
              Talk to our team about stock, financing or selling your current car.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {settings.phone ? (
              <Button asChild size="lg">
                <a href={`tel:${settings.phone}`}>
                  <Phone className="mr-1 size-4" /> Call us
                </a>
              </Button>
            ) : null}
            {settings.whatsapp ? (
              <Button asChild size="lg" variant="outline" className="border-ink-muted/40 bg-transparent text-ink-foreground hover:bg-ink-foreground/10">
                <a href={whatsappLink(settings.whatsapp)} target="_blank" rel="noreferrer">
                  <MessageCircle className="mr-1 size-4" /> WhatsApp
                </a>
              </Button>
            ) : null}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
