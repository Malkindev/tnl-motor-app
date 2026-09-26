import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { formatDateTime, formatPrice, statusLabel } from "@/lib/format";
import { useImageUrls, SELL_BUCKET } from "@/lib/media";

const statuses = [
  "new",
  "contacted",
  "viewing_scheduled",
  "negotiating",
  "reviewing",
  "accepted",
  "rejected",
  "completed",
  "closed",
] as const;

type Row = Record<string, unknown> & { id: string; status: string; created_at: string };

type TableName = "enquiries" | "sell_requests" | "financing_requests";

export function AdminRequests({
  table,
  title,
  description,
}: {
  table: TableName;
  title: string;
  description: string;
}) {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["admin", table],
    queryFn: async () => {
      const select =
        table === "enquiries" ? "*, vehicles(make, model, year)" : "*";
      const { data, error } = await supabase
        .from(table)
        .select(select)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Row[];
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from(table)
        .update({ status: status as never })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Status updated");
      qc.invalidateQueries({ queryKey: ["admin", table] });
    },
    onError: () => toast.error("Could not update the status"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin", table] });
    },
    onError: () => toast.error("Could not delete that request"),
  });

  const rows = query.data ?? [];

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display text-xl font-bold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      {rows.length === 0 ? (
        <p className="card-surface p-8 text-center text-sm text-muted-foreground">
          Nothing here yet.
        </p>
      ) : (
        <Accordion type="single" collapsible className="card-surface divide-y">
          {rows.map((row) => (
            <AccordionItem key={row.id} value={row.id} className="border-b-0 px-4">
              <AccordionTrigger className="gap-3 text-left">
                <span className="flex flex-1 flex-wrap items-center gap-3">
                  <span className="font-medium">{String(row["name"] ?? "Unnamed")}</span>
                  <span className="text-sm text-muted-foreground">{String(row["phone"] ?? "")}</span>
                  <Badge variant="secondary">{statusLabel(String(row["status"]))}</Badge>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {formatDateTime(row.created_at)}
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pb-5">
                <RequestDetails table={table} row={row} />
                <div className="flex flex-wrap items-center gap-3">
                  <Select
                    value={String(row["status"])}
                    onValueChange={(status) => update.mutate({ id: row.id, status })}
                  >
                    <SelectTrigger className="w-56">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((s) => (
                        <SelectItem key={s} value={s}>
                          {statusLabel(s)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm("Delete this request?")) remove.mutate(row.id);
                    }}
                  >
                    <Trash2 className="mr-1 size-4 text-destructive" /> Delete
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}

function RequestDetails({ table, row }: { table: TableName; row: Row }) {
  const photos = (row["photos"] as string[] | undefined) ?? [];
  const { data: photoUrls } = useImageUrls(photos, SELL_BUCKET);

  const items: Array<[string, string]> = [["Email", String(row["email"] ?? "—")]];

  if (table === "enquiries") {
    const vehicle = row["vehicles"] as { make: string; model: string; year: number } | null;
    items.push(["Type", String(row["kind"] ?? "enquiry")]);
    items.push([
      "Vehicle",
      vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : "General enquiry",
    ]);
    items.push(["Message", String(row["message"] ?? "—")]);
  }

  if (table === "sell_requests") {
    items.push(["Car", `${row["year"] ?? ""} ${row["make"]} ${row["model"]}`.trim()]);
    items.push(["Mileage", `${row["mileage"] ?? "—"} km`]);
    items.push(["Transmission", String(row["transmission"] ?? "—")]);
    items.push(["Fuel", String(row["fuel_type"] ?? "—")]);
    items.push([
      "Expected price",
      row["expected_price"] ? formatPrice(Number(row["expected_price"])) : "—",
    ]);
    items.push(["Location", String(row["location"] ?? "—")]);
    items.push(["Notes", String(row["description"] ?? "—")]);
  }

  if (table === "financing_requests") {
    items.push(["Vehicle of interest", String(row["vehicle_interest"] ?? "—")]);
    items.push(["Employment", String(row["employment_status"] ?? "—")]);
    items.push([
      "Monthly income",
      row["monthly_income"] ? formatPrice(Number(row["monthly_income"])) : "—",
    ]);
    items.push(["Deposit", row["deposit"] ? formatPrice(Number(row["deposit"])) : "—"]);
    items.push(["Payment period", String(row["payment_period"] ?? "—")]);
  }

  return (
    <div className="space-y-4">
      <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
        {items.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      {photoUrls?.length ? (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {photoUrls.map((url, i) =>
            url ? (
              <img key={i} src={url} alt="" className="aspect-[4/3] w-full rounded-md object-cover" />
            ) : null,
          )}
        </div>
      ) : null}
    </div>
  );
}
