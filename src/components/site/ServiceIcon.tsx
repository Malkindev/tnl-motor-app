import {
  BadgeCheck,
  Banknote,
  Car,
  ClipboardCheck,
  FileText,
  Handshake,
  LifeBuoy,
  RefreshCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Truck,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const icons: Record<string, LucideIcon> = {
  car: Car,
  search: Search,
  shield: ShieldCheck,
  "shield-check": ShieldCheck,
  wrench: Wrench,
  truck: Truck,
  banknote: Banknote,
  finance: Banknote,
  handshake: Handshake,
  "file-text": FileText,
  paperwork: FileText,
  inspection: ClipboardCheck,
  "clipboard-check": ClipboardCheck,
  "badge-check": BadgeCheck,
  warranty: BadgeCheck,
  "refresh-ccw": RefreshCcw,
  tradein: RefreshCcw,
  "trade-in": RefreshCcw,
  support: LifeBuoy,
  sparkles: Sparkles,
};

export function ServiceIcon({ name, className }: { name?: string | null; className?: string }) {
  const Icon = icons[(name ?? "").toLowerCase()] ?? Sparkles;
  return <Icon className={className} />;
}
