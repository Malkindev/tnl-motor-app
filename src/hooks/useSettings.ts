import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type SiteSettings = Record<string, string>;

export const settingsDefaults: SiteSettings = {
  company_name: "TNL Motor",
  phone: "",
  whatsapp: "",
  email: "",
  address: "",
  opening_hours: "",
  hero_heading: "Find Your Next Car With TNL Motor",
  hero_description: "Quality vehicles. Transparent pricing. A better way to buy and sell cars.",
  cta_heading: "Ready to Find Your Next Car?",
  footer_text: "",
};

export async function fetchSettings(): Promise<SiteSettings> {
  const { data, error } = await supabase.from("website_settings").select("key, value");
  if (error) throw error;
  const map: SiteSettings = { ...settingsDefaults };
  for (const row of data ?? []) {
    if (row.value != null) map[row.key] = row.value;
  }
  return map;
}

export function useSettings() {
  const query = useQuery({
    queryKey: ["website-settings"],
    queryFn: fetchSettings,
    staleTime: 5 * 60 * 1000,
  });
  return { settings: query.data ?? settingsDefaults, ...query };
}

export function whatsappLink(number: string | undefined, message?: string) {
  const digits = (number ?? "").replace(/[^\d]/g, "");
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${text}`;
}
