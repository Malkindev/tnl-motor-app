import { Link } from "@tanstack/react-router";
import { Fuel, Gauge, Heart, MapPin, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatMileage, formatPrice, vehicleTitle } from "@/lib/format";
import { useImageUrl } from "@/lib/media";
import { primaryImagePath, type VehicleWithImages } from "@/lib/vehicles";
import { useToggleWishlist, useWishlistIds } from "@/hooks/useWishlist";

export function VehicleCardSkeleton({ view = "grid" }: { view?: "grid" | "list" }) {
  return (
    <div className={cn("card-surface overflow-hidden", view === "list" && "sm:flex")}>
      <Skeleton className={cn("aspect-[16/10] w-full", view === "list" && "sm:w-72")} />
      <div className="space-y-3 p-5">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-9 w-full" />
      </div>
    </div>
  );
}

export function VehicleCard({
  vehicle,
  view = "grid",
}: {
  vehicle: VehicleWithImages;
  view?: "grid" | "list";
}) {
  const path = primaryImagePath(vehicle);
  const { data: imageUrl, isLoading } = useImageUrl(path);
  const { data: savedIds } = useWishlistIds();
  const toggle = useToggleWishlist();
  const saved = (savedIds ?? []).includes(vehicle.id);

  return (
    <article
      className={cn(
        "card-surface group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]",
        view === "list" && "sm:flex",
      )}
    >
      <div className={cn("relative overflow-hidden bg-secondary", view === "list" && "sm:w-80 sm:shrink-0")}>
        <Link
          to="/cars/$vehicleId"
          params={{ vehicleId: vehicle.id }}
          className="block aspect-[16/10] w-full"
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={vehicleTitle(vehicle)}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : isLoading ? (
            <Skeleton className="h-full w-full" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Photo coming soon
            </div>
          )}
        </Link>

        <div className="pointer-events-none absolute left-3 top-3 flex gap-2">
          {vehicle.featured ? <Badge className="bg-accent text-accent-foreground">Featured</Badge> : null}
          {vehicle.status === "sold" ? <Badge variant="destructive">Sold</Badge> : null}
          {vehicle.status === "reserved" ? <Badge variant="secondary">Reserved</Badge> : null}
        </div>

        <button
          type="button"
          aria-label={saved ? "Remove from saved cars" : "Save this car"}
          onClick={() => toggle.mutate({ vehicleId: vehicle.id, saved })}
          className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-card/90 text-foreground shadow-sm transition-colors hover:text-accent"
        >
          <Heart className={cn("size-4", saved && "fill-accent text-accent")} />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {vehicle.body_type} · {vehicle.condition}
        </p>
        <h3 className="mt-1 text-lg font-bold leading-snug">
          <Link
            to="/cars/$vehicleId"
            params={{ vehicleId: vehicle.id }}
            className="transition-colors hover:text-accent"
          >
            {vehicleTitle(vehicle)}
          </Link>
        </h3>

        <dl className="mt-4 grid grid-cols-2 gap-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Gauge className="size-4 text-accent" />
            {formatMileage(vehicle.mileage)}
          </div>
          <div className="flex items-center gap-2">
            <Fuel className="size-4 text-accent" />
            {vehicle.fuel_type}
          </div>
          <div className="flex items-center gap-2">
            <Settings2 className="size-4 text-accent" />
            {vehicle.transmission}
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="size-4 text-accent" />
            {vehicle.location ?? "—"}
          </div>
        </dl>

        <div className="mt-5 flex items-end justify-between gap-3 border-t pt-4">
          <p className="font-display text-xl font-extrabold">{formatPrice(vehicle.price)}</p>
          <Button asChild size="sm">
            <Link to="/cars/$vehicleId" params={{ vehicleId: vehicle.id }}>
              View Details
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
