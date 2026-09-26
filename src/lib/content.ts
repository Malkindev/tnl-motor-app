import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Service = Database["public"]["Tables"]["services"]["Row"];
export type Testimonial = Database["public"]["Tables"]["testimonials"]["Row"];
export type Feature = Database["public"]["Tables"]["features"]["Row"];

export async function fetchCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("position", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Category[];
}

export async function fetchServices() {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("published", true)
    .order("position", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Service[];
}

export async function fetchTestimonials() {
  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Testimonial[];
}

export async function fetchFeatures() {
  const { data, error } = await supabase
    .from("features")
    .select("*")
    .order("position", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Feature[];
}
