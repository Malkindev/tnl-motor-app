import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/useAuth";
import { useSettings, whatsappLink } from "@/hooks/useSettings";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact TNL Motor — Visit, Call or Message Us" },
      {
        name: "description",
        content: "Get in touch with TNL Motor by phone, WhatsApp or email, or visit our yard.",
      },
      { property: "og:title", content: "Contact TNL Motor" },
      { property: "og:description", content: "Call, WhatsApp, email or visit our yard." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const { settings } = useSettings();
  const { user } = useSession();
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

  const send = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("enquiries").insert({
        user_id: user?.id ?? null,
        name: form.name,
        email: form.email,
        phone: form.phone,
        message: form.message,
        kind: "general",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Message sent. We'll be in touch shortly.");
      setForm({ name: "", email: "", phone: "", message: "" });
    },
    onError: () => toast.error("We couldn't send that message. Please try again."),
  });

  const details = [
    { icon: Phone, label: "Phone", value: settings.phone, href: `tel:${settings.phone}` },
    { icon: Mail, label: "Email", value: settings.email, href: `mailto:${settings.email}` },
    {
      icon: MessageCircle,
      label: "WhatsApp",
      value: settings.whatsapp,
      href: whatsappLink(settings.whatsapp),
    },
    { icon: MapPin, label: "Address", value: settings.address },
    { icon: Clock, label: "Opening hours", value: settings.opening_hours },
  ].filter((d) => d.value);

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Contact"
        title="Talk to us"
        description="Call, message or drop by. We answer every enquiry."
      />

      <section className="section">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-4">
            {details.map((d) => (
              <div key={d.label} className="card-surface flex gap-4 p-5">
                <d.icon className="size-5 shrink-0 text-accent" />
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{d.label}</p>
                  {d.href ? (
                    <a
                      href={d.href}
                      target={d.href.startsWith("http") ? "_blank" : undefined}
                      rel="noreferrer"
                      className="font-semibold hover:text-accent"
                    >
                      {d.value}
                    </a>
                  ) : (
                    <p className="font-semibold">{d.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <form
            className="card-surface space-y-4 p-6 md:p-8"
            onSubmit={(e) => {
              e.preventDefault();
              if (!form.name || !form.phone) {
                toast.error("Please add your name and phone number");
                return;
              }
              send.mutate();
            }}
          >
            <h2 className="font-display text-xl font-bold">Send us a message</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="c-name">Name</Label>
                <Input id="c-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="c-phone">Phone</Label>
                <Input id="c-phone" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-email">Email</Label>
              <Input id="c-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-message">Message</Label>
              <Textarea id="c-message" rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            </div>
            <Button type="submit" disabled={send.isPending}>
              Send message
            </Button>
          </form>
        </div>
      </section>
    </SiteLayout>
  );
}
