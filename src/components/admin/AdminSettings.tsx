import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { settingsDefaults } from "@/hooks/useSettings";

const groups: Array<{ title: string; fields: Array<{ key: string; label: string; long?: boolean }> }> = [
  {
    title: "Company",
    fields: [
      { key: "company_name", label: "Company name" },
      { key: "phone", label: "Phone number" },
      { key: "whatsapp", label: "WhatsApp number" },
      { key: "email", label: "Email address" },
      { key: "address", label: "Address", long: true },
      { key: "opening_hours", label: "Opening hours", long: true },
    ],
  },
  {
    title: "Home page copy",
    fields: [
      { key: "hero_heading", label: "Hero heading" },
      { key: "hero_description", label: "Hero description", long: true },
      { key: "cta_heading", label: "Call-to-action heading" },
      { key: "footer_text", label: "Footer text", long: true },
    ],
  },
  {
    title: "Social links",
    fields: [
      { key: "facebook", label: "Facebook URL" },
      { key: "instagram", label: "Instagram URL" },
      { key: "twitter", label: "X / Twitter URL" },
      { key: "tiktok", label: "TikTok URL" },
    ],
  },
];

export function AdminSettings() {
  const qc = useQueryClient();
  const [values, setValues] = useState<Record<string, string>>({});

  const settings = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("website_settings").select("key, value");
      if (error) throw error;
      return data ?? [];
    },
  });

  useEffect(() => {
    if (!settings.data) return;
    const next: Record<string, string> = {};
    for (const row of settings.data) next[row.key] = row.value ?? "";

    // Keep the official TNL Motors contact details visible in the admin panel.
    next.company_name = settingsDefaults.company_name;
    next.phone = settingsDefaults.phone;
    next.whatsapp = settingsDefaults.whatsapp;
    next.email = settingsDefaults.email;
    setValues(next);
  }, [settings.data]);

  const save = useMutation({
    mutationFn: async () => {
      const rows = Object.entries({
        ...values,
        company_name: settingsDefaults.company_name,
        phone: settingsDefaults.phone,
        whatsapp: settingsDefaults.whatsapp,
        email: settingsDefaults.email,
      }).map(([key, value]) => ({ key, value }));
      const { error } = await supabase.from("website_settings").upsert(rows, { onConflict: "key" });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Settings saved");
      qc.invalidateQueries({ queryKey: ["admin-settings"] });
      qc.invalidateQueries({ queryKey: ["settings"] });
    },
    onError: (e: Error) => toast.error(e.message || "Could not save the settings"),
  });

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display text-xl font-bold">Website settings</h2>
        <p className="text-sm text-muted-foreground">
          These details appear across the site — nothing is hard coded.
        </p>
      </div>

      <form
        className="space-y-8"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        {groups.map((group) => (
          <section key={group.title} className="card-surface p-5">
            <h3 className="mb-4 font-display text-base font-semibold">{group.title}</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {group.fields.map((f) => (
                <div key={f.key} className={`space-y-1.5 ${f.long ? "sm:col-span-2" : ""}`}>
                  <Label htmlFor={f.key}>{f.label}</Label>
                  {f.long ? (
                    <Textarea
                      id={f.key}
                      rows={2}
                      value={values[f.key] ?? ""}
                      disabled={["company_name", "phone", "whatsapp", "email"].includes(f.key)}
                      onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                    />
                  ) : (
                    <Input
                      id={f.key}
                      value={values[f.key] ?? ""}
                      onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                    />
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}

        <Button type="submit" disabled={save.isPending}>
          {save.isPending ? "Saving…" : "Save settings"}
        </Button>
      </form>
    </div>
  );
}
