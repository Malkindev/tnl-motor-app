import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { ServiceIcon } from "@/components/site/ServiceIcon";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchServices } from "@/lib/content";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Sales, Financing, Trade-Ins & Support | TNL Motor" },
      {
        name: "description",
        content:
          "Vehicle sourcing, inspections, financing, trade-ins, registration and after-sales support from TNL Motor.",
      },
      { property: "og:title", content: "Services — TNL Motor" },
      {
        property: "og:description",
        content: "Sourcing, inspections, financing, trade-ins and registration support.",
      },
    ],
  }),
  component: Services,
});

function Services() {
  const services = useQuery({ queryKey: ["services"], queryFn: fetchServices });

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Services"
        title="Everything around the car, handled"
        description="From finding the right vehicle to transferring the logbook, our team covers the whole journey."
      />

      <section className="section">
        <div className="container-page grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-44 w-full rounded-2xl" />
              ))
            : (services.data ?? []).map((s) => (
                <div key={s.id} className="card-surface p-6">
                  <ServiceIcon name={s.icon} className="size-8 text-accent" />
                  <h2 className="mt-4 font-display text-lg font-bold">{s.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {s.description}
                  </p>
                </div>
              ))}
        </div>

        <div className="container-page mt-12 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/contact">Talk to our team</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/financing">Check financing</Link>
          </Button>
        </div>
      </section>
    </SiteLayout>
  );
}
