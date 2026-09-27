import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Award, HeartHandshake, Users, Wrench } from "lucide-react";

import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/useSettings";
import { fetchTestimonials } from "@/lib/content";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About TNL Motors — Who We Are" },
      {
        name: "description",
        content:
          "TNL Motors is a vehicle dealership built on inspected stock, honest pricing and paperwork handled properly.",
      },
      { property: "og:title", content: "About TNL Motors" },
      { property: "og:description", content: "Inspected stock, honest pricing, paperwork done right." },
    ],
  }),
  component: About,
});

const values = [
  { icon: Award, title: "Quality first", copy: "Cars are sourced, inspected and reconditioned before they are listed." },
  { icon: HeartHandshake, title: "Straight talk", copy: "We show the faults as well as the features so you buy with open eyes." },
  { icon: Wrench, title: "After the sale", copy: "Service advice, parts sourcing and support long after you drive away." },
  { icon: Users, title: "People, not units", copy: "One point of contact from first enquiry to logbook transfer." },
];

function About() {
  const { settings } = useSettings();
  const testimonials = useQuery({ queryKey: ["testimonials"], queryFn: fetchTestimonials });

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="About us"
        title={`Meet ${settings.company_name}`}
        description="A dealership built around inspected vehicles, clear pricing and paperwork handled properly."
      />

      <section className="section">
        <div className="container-page grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-extrabold md:text-3xl">Our story</h2>
            <div className="mt-4 space-y-4 leading-relaxed text-muted-foreground">
              <p>
                {settings.company_name} started with a simple frustration: buying a used car meant
                guessing. Guessing about mileage, about accident history, about whether the price
                included things it shouldn't.
              </p>
              <p>
                We built the opposite of that. Every car on our floor arrives with an inspection
                record, a documented history and one price. If something is wrong with a car, you
                will hear it from us before you find it yourself.
              </p>
              <p>
                Today we sell, buy, trade and finance vehicles, and handle the registration work
                in-house so our customers do not spend their week in queues.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/cars">See our stock</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/contact">Visit the yard</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {values.map((v) => (
              <div key={v.title} className="card-surface p-6">
                <v.icon className="size-7 text-accent" />
                <h3 className="mt-4 font-bold">{v.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{v.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {(testimonials.data ?? []).length ? (
        <section className="section bg-secondary/40">
          <div className="container-page">
            <h2 className="font-display text-2xl font-extrabold">In our customers' words</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-3">
              {(testimonials.data ?? []).map((t) => (
                <figure key={t.id} className="card-surface p-6">
                  <blockquote className="text-sm leading-relaxed text-muted-foreground">
                    "{t.review}"
                  </blockquote>
                  <figcaption className="mt-4 text-sm font-semibold">{t.name}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </SiteLayout>
  );
}
