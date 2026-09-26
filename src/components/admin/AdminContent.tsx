import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

export type FieldKind = "text" | "textarea" | "number" | "switch";

export type FieldDef = {
  key: string;
  label: string;
  kind?: FieldKind;
  required?: boolean;
};

type Row = Record<string, unknown> & { id: string };

export function AdminContent({
  table,
  title,
  description,
  fields,
  order = "position",
  primaryKeyField = "name",
  invalidate = [],
}: {
  table: "categories" | "services" | "testimonials" | "features";
  title: string;
  description: string;
  fields: FieldDef[];
  order?: string;
  primaryKeyField?: string;
  invalidate?: string[];
}) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});

  const list = useQuery({
    queryKey: ["admin", table],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .order(order, { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as Row[];
    },
  });

  function refresh() {
    qc.invalidateQueries({ queryKey: ["admin", table] });
    for (const key of invalidate) qc.invalidateQueries({ queryKey: [key] });
  }

  function openNew() {
    setEditing(null);
    const blank: Record<string, unknown> = {};
    for (const f of fields) blank[f.key] = f.kind === "switch" ? true : f.kind === "number" ? 0 : "";
    setForm(blank);
    setOpen(true);
  }

  function openEdit(row: Row) {
    setEditing(row);
    const next: Record<string, unknown> = {};
    for (const f of fields) next[f.key] = row[f.key] ?? (f.kind === "switch" ? false : "");
    setForm(next);
    setOpen(true);
  }

  const save = useMutation({
    mutationFn: async () => {
      const payload: Record<string, unknown> = {};
      for (const f of fields) {
        const value = form[f.key];
        payload[f.key] =
          f.kind === "number"
            ? Number(value) || 0
            : f.kind === "switch"
              ? Boolean(value)
              : value === ""
                ? null
                : value;
      }
      if (table === "categories" && !payload["slug"]) {
        payload["slug"] = String(payload["name"] ?? "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
      }
      if (editing) {
        const { error } = await supabase
          .from(table)
          .update(payload as never)
          .eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from(table).insert(payload as never);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Saved");
      refresh();
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message || "Could not save"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Deleted");
      refresh();
    },
    onError: () => toast.error("Could not delete"),
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Button onClick={openNew}>
          <Plus className="mr-1 size-4" /> Add
        </Button>
      </div>

      <div className="card-surface divide-y">
        {(list.data ?? []).map((row) => (
          <div key={row.id} className="flex items-start justify-between gap-4 p-4">
            <div>
              <p className="font-medium">
                {String(row[primaryKeyField] ?? "Untitled")}
                {"published" in row && !row["published"] ? (
                  <Badge variant="outline" className="ml-2">Hidden</Badge>
                ) : null}
                {"is_demo" in row && row["is_demo"] ? (
                  <Badge variant="outline" className="ml-2">Demo</Badge>
                ) : null}
              </p>
              {"description" in row && row["description"] ? (
                <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                  {String(row["description"])}
                </p>
              ) : null}
              {"review" in row && row["review"] ? (
                <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                  {String(row["review"])}
                </p>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center">
              <Button size="sm" variant="ghost" aria-label="Edit" onClick={() => openEdit(row)}>
                <Pencil className="size-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                aria-label="Delete"
                onClick={() => {
                  if (confirm("Delete this item?")) remove.mutate(row.id);
                }}
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
        {list.data?.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">Nothing here yet.</p>
        ) : null}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? `Edit ${title.toLowerCase()}` : `Add ${title.toLowerCase()}`}</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              save.mutate();
            }}
          >
            {fields.map((f) => (
              <div key={f.key} className="space-y-1.5">
                {f.kind === "switch" ? (
                  <div className="flex items-center gap-3">
                    <Switch
                      id={f.key}
                      checked={Boolean(form[f.key])}
                      onCheckedChange={(v) => setForm((s) => ({ ...s, [f.key]: v }))}
                    />
                    <Label htmlFor={f.key}>{f.label}</Label>
                  </div>
                ) : (
                  <>
                    <Label htmlFor={f.key}>{f.label}</Label>
                    {f.kind === "textarea" ? (
                      <Textarea
                        id={f.key}
                        rows={4}
                        required={f.required}
                        value={String(form[f.key] ?? "")}
                        onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
                      />
                    ) : (
                      <Input
                        id={f.key}
                        type={f.kind === "number" ? "number" : "text"}
                        required={f.required}
                        value={String(form[f.key] ?? "")}
                        onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
                      />
                    )}
                  </>
                )}
              </div>
            ))}
            <div className="flex justify-end gap-2 border-t pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={save.isPending}>
                {save.isPending ? "Saving…" : "Save"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
