import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { Filter, Grid2x2, List, SlidersHorizontal, X } from "lucide-react";

import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { VehicleCard, VehicleCardSkeleton } from "@/components/site/VehicleCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  bodyTypes,
  conditions,
  fetchMakes,
  fetchVehicles,
  fuelTypes,
  transmissions,
  type VehicleFilters,
} from "@/lib/vehicles";
import { cn } from "@/lib/utils";

const searchSchema = z.object({
  make: z.string().optional(),
  model: z.string().optional(),
  bodyType: z.string().optional(),
  fuelType: z.string().optional(),
  transmission: z.string().optional(),
  condition: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  minYear: z.coerce.number().optional(),
  maxMileage: z.coerce.number().optional(),
  sort: z.string().optional(),
  page: z.coerce.number().optional(),
});

export type CarsSearch = z.infer<typeof searchSchema>;

export const Route = createFileRoute("/cars/")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Cars for Sale — TNL Motor Inventory" },
      {
        name: "description",
        content:
          "Search the full TNL Motor inventory: SUVs, sedans, pickups and more. Filter by make, budget, fuel type and transmission.",
      },
      { property: "og:title", content: "Cars for Sale — TNL Motor" },
      {
        property: "og:description",
        content: "Search inspected cars by make, budget, body type and transmission.",
      },
    ],
  }),
  component: CarsPage,
});

const PER_PAGE = 9;

function CarsPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/cars" });
  const [view, setView] = useState<"grid" | "list">("grid");

  const makes = useQuery({ queryKey: ["makes"], queryFn: fetchMakes });

  const filters: VehicleFilters = { ...search, perPage: PER_PAGE, page: search.page ?? 1 };
  const list = useQuery({
    queryKey: ["vehicles", filters],
    queryFn: () => fetchVehicles(filters),
    placeholderData: keepPreviousData,
  });

  const total = list.data?.count ?? 0;
  const page = search.page ?? 1;
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));

  function update(patch: Partial<CarsSearch>) {
    navigate({
      search: (prev) => {
        const next: Record<string, unknown> = { ...prev, ...patch, page: 1 };
        for (const key of Object.keys(next)) {
          if (next[key] === "" || next[key] === undefined) delete next[key];
        }
        return next as CarsSearch;
      },
    });
  }

  const activeCount = Object.entries(search).filter(
    ([k, v]) => k !== "page" && k !== "sort" && v !== undefined && v !== "",
  ).length;

  const filterPanel = (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>Make</Label>
        <Select value={search.make ?? "any"} onValueChange={(v) => update({ make: v === "any" ? undefined : v })}>
          <SelectTrigger>
            <SelectValue placeholder="Any make" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any make</SelectItem>
            {(makes.data ?? []).map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="model">Model</Label>
        <Input
          id="model"
          defaultValue={search.model ?? ""}
          placeholder="e.g. Harrier"
          onBlur={(e) => update({ model: e.target.value || undefined })}
          onKeyDown={(e) => {
            if (e.key === "Enter") update({ model: (e.target as HTMLInputElement).value || undefined });
          }}
        />
      </div>

      {[
        { label: "Body type", key: "bodyType" as const, options: bodyTypes },
        { label: "Fuel type", key: "fuelType" as const, options: fuelTypes },
        { label: "Transmission", key: "transmission" as const, options: transmissions },
        { label: "Condition", key: "condition" as const, options: conditions },
      ].map((group) => (
        <div key={group.key} className="space-y-2">
          <Label>{group.label}</Label>
          <Select
            value={search[group.key] ?? "any"}
            onValueChange={(v) => update({ [group.key]: v === "any" ? undefined : v })}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Any ${group.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any {group.label.toLowerCase()}</SelectItem>
              {group.options.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="minPrice">Min price</Label>
          <Input
            id="minPrice"
            type="number"
            defaultValue={search.minPrice ?? ""}
            onBlur={(e) => update({ minPrice: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxPrice">Max price</Label>
          <Input
            id="maxPrice"
            type="number"
            defaultValue={search.maxPrice ?? ""}
            onBlur={(e) => update({ maxPrice: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="minYear">Year from</Label>
          <Input
            id="minYear"
            type="number"
            defaultValue={search.minYear ?? ""}
            onBlur={(e) => update({ minYear: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxMileage">Max mileage</Label>
          <Input
            id="maxMileage"
            type="number"
            defaultValue={search.maxMileage ?? ""}
            onBlur={(e) =>
              update({ maxMileage: e.target.value ? Number(e.target.value) : undefined })
            }
          />
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full"
        onClick={() => navigate({ search: {} as CarsSearch })}
      >
        <X className="mr-1 size-4" /> Clear filters
      </Button>
    </div>
  );

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Inventory"
        title="Cars for sale"
        description="Every vehicle is inspected, documented and ready to view at our yard."
      />

      <section className="section">
        <div className="container-page grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="hidden lg:block">
            <div className="card-surface sticky top-24 p-6">
              <h2 className="mb-5 flex items-center gap-2 font-display text-lg font-bold">
                <SlidersHorizontal className="size-4 text-accent" /> Filters
              </h2>
              {filterPanel}
            </div>
          </aside>

          <div>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                {list.isLoading ? "Loading cars…" : `${total} ${total === 1 ? "car" : "cars"} found`}
              </p>

              <div className="flex items-center gap-2">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="lg:hidden">
                      <Filter className="mr-1 size-4" /> Filters
                      {activeCount ? ` (${activeCount})` : ""}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[88vw] overflow-y-auto sm:max-w-sm">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="px-4 pb-8">{filterPanel}</div>
                  </SheetContent>
                </Sheet>

                <Select
                  value={search.sort ?? "newest"}
                  onValueChange={(v) => update({ sort: v === "newest" ? undefined : v })}
                >
                  <SelectTrigger className="w-[170px]" aria-label="Sort">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest first</SelectItem>
                    <SelectItem value="price-asc">Price: low to high</SelectItem>
                    <SelectItem value="price-desc">Price: high to low</SelectItem>
                    <SelectItem value="mileage">Lowest mileage</SelectItem>
                    <SelectItem value="year">Newest year</SelectItem>
                  </SelectContent>
                </Select>

                <div className="hidden rounded-md border sm:flex">
                  <button
                    type="button"
                    aria-label="Grid view"
                    onClick={() => setView("grid")}
                    className={cn("p-2", view === "grid" && "bg-secondary text-accent")}
                  >
                    <Grid2x2 className="size-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="List view"
                    onClick={() => setView("list")}
                    className={cn("p-2", view === "list" && "bg-secondary text-accent")}
                  >
                    <List className="size-4" />
                  </button>
                </div>
              </div>
            </div>

            {list.isError ? (
              <p className="text-sm text-destructive">
                We couldn't load the inventory. Please refresh and try again.
              </p>
            ) : null}

            <div
              className={cn(
                "grid gap-6",
                view === "grid" ? "sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1",
              )}
            >
              {list.isLoading
                ? Array.from({ length: 6 }).map((_, i) => <VehicleCardSkeleton key={i} view={view} />)
                : (list.data?.vehicles ?? []).map((v) => (
                    <VehicleCard key={v.id} vehicle={v} view={view} />
                  ))}
            </div>

            {!list.isLoading && total === 0 ? (
              <div className="card-surface p-10 text-center">
                <h3 className="font-display text-lg font-bold">No cars match those filters</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Try widening your budget or clearing a filter.
                </p>
                <Button className="mt-5" onClick={() => navigate({ search: {} as CarsSearch })}>
                  Clear filters
                </Button>
              </div>
            ) : null}

            {pages > 1 ? (
              <div className="mt-10 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => navigate({ search: (p) => ({ ...p, page: page - 1 }) })}
                >
                  Previous
                </Button>
                <span className="px-3 text-sm text-muted-foreground">
                  Page {page} of {pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pages}
                  onClick={() => navigate({ search: (p) => ({ ...p, page: page + 1 }) })}
                >
                  Next
                </Button>
              </div>
            ) : null}

            <p className="mt-10 text-center text-sm text-muted-foreground">
              Can't find what you need?{" "}
              <Link to="/contact" className="font-semibold text-accent hover:underline">
                Tell us what you're looking for
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
