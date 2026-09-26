import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Mail, MapPin, MessageCircle, Phone, Twitter, Youtube } from "lucide-react";
import { Logo } from "@/components/site/Logo";
import { useSettings, whatsappLink } from "@/hooks/useSettings";

export function Footer() {
  const { settings } = useSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ink text-ink-foreground">
      <div className="container-page grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <Logo tone="dark" />
          <p className="max-w-xs text-sm text-ink-muted">{settings["footer_text"]}</p>
          <div className="flex gap-3">
            {[
              { href: settings["facebook"], icon: Facebook, label: "Facebook" },
              { href: settings["instagram"], icon: Instagram, label: "Instagram" },
              { href: settings["twitter"], icon: Twitter, label: "X" },
              { href: settings["youtube"], icon: Youtube, label: "YouTube" },
            ]
              .filter((s) => s.href)
              .map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="flex size-9 items-center justify-center rounded-md bg-sidebar-accent text-ink-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <Icon className="size-4" />
                </a>
              ))}
          </div>
        </div>

        <div>
          <h4 className="font-display text-sm font-bold uppercase tracking-[0.18em] text-accent">
            Navigate
          </h4>
          <ul className="mt-4 space-y-2 text-sm text-ink-muted">
            {[
              { to: "/", label: "Home" },
              { to: "/cars", label: "Cars" },
              { to: "/services", label: "Services" },
              { to: "/about", label: "About" },
              { to: "/sell", label: "Sell Your Car" },
              { to: "/financing", label: "Financing" },
              { to: "/contact", label: "Contact" },
            ].map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="transition-colors hover:text-accent">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm font-bold uppercase tracking-[0.18em] text-accent">
            Customer
          </h4>
          <ul className="mt-4 space-y-2 text-sm text-ink-muted">
            <li>
              <Link to="/account" className="transition-colors hover:text-accent">
                My Account
              </Link>
            </li>
            <li>
              <Link to="/wishlist" className="transition-colors hover:text-accent">
                Wishlist
              </Link>
            </li>
            <li>
              <Link to="/account" className="transition-colors hover:text-accent">
                My Enquiries
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm font-bold uppercase tracking-[0.18em] text-accent">
            Contact
          </h4>
          <ul className="mt-4 space-y-3 text-sm text-ink-muted">
            {settings["phone"] ? (
              <li className="flex items-start gap-2">
                <Phone className="mt-0.5 size-4 text-accent" />
                <a href={`tel:${settings["phone"]}`} className="hover:text-accent">
                  {settings["phone"]}
                </a>
              </li>
            ) : null}
            {settings["whatsapp"] ? (
              <li className="flex items-start gap-2">
                <MessageCircle className="mt-0.5 size-4 text-accent" />
                <a
                  href={whatsappLink(settings["whatsapp"])}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-accent"
                >
                  WhatsApp us
                </a>
              </li>
            ) : null}
            {settings["email"] ? (
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 size-4 text-accent" />
                <a href={`mailto:${settings["email"]}`} className="hover:text-accent">
                  {settings["email"]}
                </a>
              </li>
            ) : null}
            {settings["address"] ? (
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 text-accent" />
                <span>{settings["address"]}</span>
              </li>
            ) : null}
          </ul>
        </div>
      </div>

      <div className="border-t border-sidebar-border">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {settings["company_name"]}. All rights reserved.
          </p>
          <p>Quality vehicles · Transparent pricing · Trusted service</p>
        </div>
      </div>
    </footer>
  );
}
