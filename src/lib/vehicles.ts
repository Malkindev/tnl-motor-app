import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Vehicle = Database["public"]["Tables"]["vehicles"]["Row"];
export type VehicleImage = Database["public"]["Tables"]["vehicle_images"]["Row"];
export type VehicleWithImages = Vehicle & { vehicle_images: VehicleImage[] };

export const bodyTypes = [
  "SUV",
  "Sedan",
  "Hatchback",
  "Pickup",
  "Luxury",
  "Sports",
  "Electric",
  "Commercial",
  "Van",
  "Coupe",
];
export const fuelTypes = ["Petrol", "Diesel", "Hybrid", "Electric"];
export const transmissions = ["Automatic", "Manual"];
export const driveTypes = ["FWD", "RWD", "AWD", "4WD"];
export const conditions = ["New", "Used", "Certified"];
export const vehicleStatuses = ["available", "reserved", "sold", "draft"] as const;

export type VehicleFilters = {
  make?: string;
  model?: string;
  minPrice?: number;
  maxPrice?: number;
  year?: number;
  minYear?: number;
  maxMileage?: number;
  bodyType?: string;
  fuelType?: string;
  transmission?: string;
  driveType?: string;
  condition?: string;
  location?: string;
  sort?: string;
  page?: number;
  perPage?: number;
};

export function primaryImagePath(v: { vehicle_images?: VehicleImage[] | null }): string | null {
  const images = [...(v.vehicle_images ?? [])].sort(
    (a, b) => Number(b.is_primary) - Number(a.is_primary) || a.position - b.position,
  );
  return images[0]?.url ?? null;
}

export async function fetchVehicles(filters: VehicleFilters = {}) {
  const perPage = filters.perPage ?? 9;
  const page = filters.page ?? 1;
  let query = supabase
    .from("vehicles")
    .select("*, vehicle_images(*)", { count: "exact" })
    .neq("status", "draft");

  if (filters.make) query = query.ilike("make", filters.make);
  if (filters.model) query = query.ilike("model", `%${filters.model}%`);
  if (filters.minPrice) query = query.gte("price", filters.minPrice);
  if (filters.maxPrice) query = query.lte("price", filters.maxPrice);
  if (filters.year) query = query.eq("year", filters.year);
  if (filters.minYear) query = query.gte("year", filters.minYear);
  if (filters.maxMileage) query = query.lte("mileage", filters.maxMileage);
  if (filters.bodyType) query = query.eq("body_type", filters.bodyType);
  if (filters.fuelType) query = query.eq("fuel_type", filters.fuelType);
  if (filters.transmission) query = query.eq("transmission", filters.transmission);
  if (filters.driveType) query = query.eq("drive_type", filters.driveType);
  if (filters.condition) query = query.eq("condition", filters.condition);
  if (filters.location) query = query.ilike("location", `%${filters.location}%`);

  switch (filters.sort) {
    case "price-asc":
      query = query.order("price", { ascending: true });
      break;
    case "price-desc":
      query = query.order("price", { ascending: false });
      break;
    case "mileage":
      query = query.order("mileage", { ascending: true });
      break;
    case "year":
      query = query.order("year", { ascending: false });
      break;
    default:
      query = query.order("featured", { ascending: false }).order("created_at", {
        ascending: false,
      });
  }

  const from = (page - 1) * perPage;
  const { data, error, count } = await query.range(from, from + perPage - 1);
  if (error) throw error;
  return { vehicles: (data ?? []) as VehicleWithImages[], count: count ?? 0 };
}

export async function fetchVehicle(id: string) {
  const { data, error } = await supabase
    .from("vehicles")
    .select("*, vehicle_images(*), vehicle_features(feature_id, features(name))")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as
    | (VehicleWithImages & {
        vehicle_features: { feature_id: string; features: { name: string } | null }[];
      })
    | null;
}

export async function fetchFeaturedVehicles(limit = 6) {
  const { data, error } = await supabase
    .from("vehicles")
    .select("*, vehicle_images(*)")
    .neq("status", "draft")
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as VehicleWithImages[];
}

export async function fetchMakes() {
  const { data, error } = await supabase.from("vehicles").select("make").neq("status", "draft");
  if (error) throw error;
  return Array.from(new Set((data ?? []).map((r) => r.make))).sort();
}
