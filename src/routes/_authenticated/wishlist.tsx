import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { VehicleCard, VehicleCardSkeleton } from "@/components/site/VehicleCard";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { VehicleWithImages } from "@/lib/vehicles";

export const Route = createFileRoute("/_authenticated/wishlist")({
  head: () => ({
    meta: [
      { title: "Saved Cars — TNL Motor" },
      { name: "description", content: "The cars you have saved from the TNL Motor inventory." },
      { property: "og:title", content: "Saved Cars — TNL Motor" },
      { property: "og:description", content: "Your saved vehicles at TNL Motor." },
    ],
  }),
  component: Wishlist,
});

function Wishlist() {
  const saved = useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wishlists")
        .select("vehicle_id, vehicles(*, vehicle_images(*))")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? [])
        .map((row) => row.vehicles as unknown as VehicleWithImages | null)
        .filter(Boolean) as VehicleWithImages[];
    },
  });

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Your account"
        title="Saved cars"
        description="Cars you've shortlisted. We'll keep them here until you remove them."
      />

      <section className="section">
        <div className="container-page">
          {saved.isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <VehicleCardSkeleton key={i} />
              ))}
            </div>
          ) : (saved.data ?? []).length === 0 ? (
            <div className="card-surface p-12 text-center">
              <h2 className="font-display text-xl font-bold">Nothing saved yet</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Tap the heart on any car to keep it here.
              </p>
              <Button asChild className="mt-6">
                <Link to="/cars">Browse inventory</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {(saved.data ?? []).map((v) => (
                <VehicleCard key={v.id} vehicle={v} />
              ))}
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
