import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ImagePlus, Pencil, Plus, Star, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice, vehicleTitle } from "@/lib/format";
import { useImageUrl, VEHICLE_BUCKET } from "@/lib/media";
import { fetchFeatures } from "@/lib/content";
import {
  bodyTypes,
  conditions,
  driveTypes,
  fuelTypes,
  transmissions,
  vehicleStatuses,
  type Vehicle,
  type VehicleImage,
  type VehicleWithImages,
} from "@/lib/vehicles";

type FormState = Record<string, string | boolean>;

const emptyForm: FormState = {
  make: "",
  model: "",
  variant: "",
  year: String(new Date().getFullYear()),
  price: "",
  mileage: "0",
  condition: "Used",
  body_type: "SUV",
  fuel_type: "Petrol",
  transmission: "Automatic",
  drive_type: "",
  engine: "",
  engine_size: "",
  doors: "4",
  seats: "5",
  exterior_color: "",
  interior_color: "",
  location: "",
  stock_number: "",
  description: "",
  status: "available",
  featured: false,
};

export function AdminVehicles() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<VehicleWithImages | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  const vehicles = useQuery({
    queryKey: ["admin-vehicles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*, vehicle_images(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as VehicleWithImages[];
    },
  });

  const features = useQuery({ queryKey: ["features"], queryFn: fetchFeatures });

  function openNew() {
    setEditing(null);
    setForm(emptyForm);
    setSelectedFeatures([]);
    setOpen(true);
  }

  async function openEdit(v: VehicleWithImages) {
    setEditing(v);
    setForm({
      make: v.make,
      model: v.model,
      variant: v.variant ?? "",
      year: String(v.year),
      price: String(v.price),
      mileage: String(v.mileage),
      condition: v.condition,
      body_type: v.body_type,
      fuel_type: v.fuel_type,
      transmission: v.transmission,
      drive_type: v.drive_type ?? "",
      engine: v.engine ?? "",
      engine_size: v.engine_size != null ? String(v.engine_size) : "",
      doors: String(v.doors ?? 4),
      seats: String(v.seats ?? 5),
      exterior_color: v.exterior_color ?? "",
      interior_color: v.interior_color ?? "",
      location: v.location ?? "",
      stock_number: v.stock_number ?? "",
      description: v.description ?? "",
      status: v.status,
      featured: v.featured,
    });
    const { data } = await supabase
      .from("vehicle_features")
      .select("feature_id")
      .eq("vehicle_id", v.id);
    setSelectedFeatures((data ?? []).map((r) => r.feature_id));
    setOpen(true);
  }

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        make: String(form["make"]),
        model: String(form["model"]),
        variant: String(form["variant"]) || null,
        year: Number(form["year"]),
        price: Number(form["price"]),
        mileage: Number(form["mileage"]),
        condition: String(form["condition"]),
        body_type: String(form["body_type"]),
        fuel_type: String(form["fuel_type"]),
        transmission: String(form["transmission"]),
        drive_type: String(form["drive_type"]) || null,
        engine: String(form["engine"]) || null,
        engine_size: form["engine_size"] ? Number(form["engine_size"]) : null,
        doors: Number(form["doors"]) || null,
        seats: Number(form["seats"]) || null,
        exterior_color: String(form["exterior_color"]) || null,
        interior_color: String(form["interior_color"]) || null,
        location: String(form["location"]) || null,
        stock_number: String(form["stock_number"]) || null,
        description: String(form["description"]) || null,
        status: String(form["status"]) as Vehicle["status"],
        featured: Boolean(form["featured"]),
      };

      let vehicleId = editing?.id;
      if (editing) {
        const { error } = await supabase.from("vehicles").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("vehicles").insert(payload).select("id").single();
        if (error) throw error;
        vehicleId = data.id;
      }

      if (vehicleId) {
        await supabase.from("vehicle_features").delete().eq("vehicle_id", vehicleId);
        if (selectedFeatures.length) {
          const { error } = await supabase
            .from("vehicle_features")
            .insert(selectedFeatures.map((feature_id) => ({ vehicle_id: vehicleId!, feature_id })));
          if (error) throw error;
        }
      }
      return vehicleId;
    },
    onSuccess: () => {
      toast.success(editing ? "Vehicle updated" : "Vehicle added");
      qc.invalidateQueries({ queryKey: ["admin-vehicles"] });
      qc.invalidateQueries({ queryKey: ["vehicles"] });
      qc.invalidateQueries({ queryKey: ["featured-vehicles"] });
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message || "Could not save the vehicle"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("vehicles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Vehicle deleted");
      qc.invalidateQueries({ queryKey: ["admin-vehicles"] });
      qc.invalidateQueries({ queryKey: ["vehicles"] });
    },
    onError: () => toast.error("Could not delete that vehicle"),
  });

  function set(key: string, value: string | boolean) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold">Vehicles</h2>
          <p className="text-sm text-muted-foreground">
            {vehicles.data?.length ?? 0} listings in the system
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}>
              <Plus className="mr-1 size-4" /> Add vehicle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit vehicle" : "Add vehicle"}</DialogTitle>
            </DialogHeader>

            <form
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                save.mutate();
              }}
            >
              <div className="grid gap-4 sm:grid-cols-3">
                <TextField label="Make" value={form["make"]} onChange={(v) => set("make", v)} required />
                <TextField label="Model" value={form["model"]} onChange={(v) => set("model", v)} required />
                <TextField label="Variant" value={form["variant"]} onChange={(v) => set("variant", v)} />
                <TextField label="Year" type="number" value={form["year"]} onChange={(v) => set("year", v)} required />
                <TextField label="Price" type="number" value={form["price"]} onChange={(v) => set("price", v)} required />
                <TextField label="Mileage (km)" type="number" value={form["mileage"]} onChange={(v) => set("mileage", v)} />
                <SelectField label="Condition" value={form["condition"]} options={conditions} onChange={(v) => set("condition", v)} />
                <SelectField label="Body type" value={form["body_type"]} options={bodyTypes} onChange={(v) => set("body_type", v)} />
                <SelectField label="Fuel" value={form["fuel_type"]} options={fuelTypes} onChange={(v) => set("fuel_type", v)} />
                <SelectField label="Transmission" value={form["transmission"]} options={transmissions} onChange={(v) => set("transmission", v)} />
                <SelectField label="Drive" value={form["drive_type"]} options={driveTypes} onChange={(v) => set("drive_type", v)} />
                <SelectField label="Status" value={form["status"]} options={[...vehicleStatuses]} onChange={(v) => set("status", v)} />
                <TextField label="Engine" value={form["engine"]} onChange={(v) => set("engine", v)} />
                <TextField label="Engine size (L)" type="number" value={form["engine_size"]} onChange={(v) => set("engine_size", v)} />
                <TextField label="Doors" type="number" value={form["doors"]} onChange={(v) => set("doors", v)} />
                <TextField label="Seats" type="number" value={form["seats"]} onChange={(v) => set("seats", v)} />
                <TextField label="Exterior colour" value={form["exterior_color"]} onChange={(v) => set("exterior_color", v)} />
                <TextField label="Interior colour" value={form["interior_color"]} onChange={(v) => set("interior_color", v)} />
                <TextField label="Location" value={form["location"]} onChange={(v) => set("location", v)} />
                <TextField label="Stock number" value={form["stock_number"]} onChange={(v) => set("stock_number", v)} />
              </div>

              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea
                  rows={4}
                  value={String(form["description"] ?? "")}
                  onChange={(e) => set("description", e.target.value)}
                />
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  id="featured"
                  checked={Boolean(form["featured"])}
                  onCheckedChange={(v) => set("featured", v)}
                />
                <Label htmlFor="featured">Feature on the home page</Label>
              </div>

              <div>
                <Label>Features</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(features.data ?? []).map((f) => {
                    const on = selectedFeatures.includes(f.id);
                    return (
                      <button
                        type="button"
                        key={f.id}
                        onClick={() =>
                          setSelectedFeatures((prev) =>
                            on ? prev.filter((id) => id !== f.id) : [...prev, f.id],
                          )
                        }
                        className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                          on ? "border-accent bg-accent text-accent-foreground" : "hover:border-accent"
                        }`}
                      >
                        {f.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {editing ? <VehicleImages vehicle={editing} /> : null}

              <div className="flex justify-end gap-2 border-t pt-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={save.isPending}>
                  {save.isPending ? "Saving…" : "Save vehicle"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="card-surface overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vehicle</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Photos</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(vehicles.data ?? []).map((v) => (
              <TableRow key={v.id}>
                <TableCell className="font-medium">
                  {vehicleTitle(v)}
                  {v.is_demo ? <Badge variant="outline" className="ml-2">Demo</Badge> : null}
                  {v.featured ? <Star className="ml-2 inline size-3.5 fill-accent text-accent" /> : null}
                </TableCell>
                <TableCell>{v.stock_number ?? "—"}</TableCell>
                <TableCell>{formatPrice(v.price)}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{v.status}</Badge>
                </TableCell>
                <TableCell>{v.vehicle_images?.length ?? 0}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(v)} aria-label="Edit">
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label="Delete"
                    onClick={() => {
                      if (confirm(`Delete ${vehicleTitle(v)}? This cannot be undone.`)) {
                        remove.mutate(v.id);
                      }
                    }}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function VehicleImages({ vehicle }: { vehicle: VehicleWithImages }) {
  const qc = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const images = useQuery({
    queryKey: ["vehicle-images", vehicle.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicle_images")
        .select("*")
        .eq("vehicle_id", vehicle.id)
        .order("position", { ascending: true });
      if (error) throw error;
      return (data ?? []) as VehicleImage[];
    },
  });

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    try {
      const existing = images.data ?? [];
      let position = existing.length;
      for (const file of Array.from(files)) {
        const path = `${vehicle.id}/${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
        const { error: upErr } = await supabase.storage.from(VEHICLE_BUCKET).upload(path, file);
        if (upErr) throw upErr;
        const { error } = await supabase.from("vehicle_images").insert({
          vehicle_id: vehicle.id,
          url: path,
          position,
          is_primary: existing.length === 0 && position === 0,
        });
        if (error) throw error;
        position += 1;
      }
      toast.success("Photos uploaded");
      qc.invalidateQueries({ queryKey: ["vehicle-images", vehicle.id] });
      qc.invalidateQueries({ queryKey: ["admin-vehicles"] });
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function makePrimary(id: string) {
    await supabase.from("vehicle_images").update({ is_primary: false }).eq("vehicle_id", vehicle.id);
    await supabase.from("vehicle_images").update({ is_primary: true }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["vehicle-images", vehicle.id] });
    qc.invalidateQueries({ queryKey: ["admin-vehicles"] });
    toast.success("Main photo set");
  }

  async function move(image: VehicleImage, direction: -1 | 1) {
    const list = [...(images.data ?? [])];
    const index = list.findIndex((i) => i.id === image.id);
    const swap = index + direction;
    if (swap < 0 || swap >= list.length) return;
    const other = list[swap]!;
    await supabase.from("vehicle_images").update({ position: other.position }).eq("id", image.id);
    await supabase.from("vehicle_images").update({ position: image.position }).eq("id", other.id);
    qc.invalidateQueries({ queryKey: ["vehicle-images", vehicle.id] });
  }

  async function remove(image: VehicleImage) {
    await supabase.storage.from(VEHICLE_BUCKET).remove([image.url]);
    await supabase.from("vehicle_images").delete().eq("id", image.id);
    qc.invalidateQueries({ queryKey: ["vehicle-images", vehicle.id] });
    qc.invalidateQueries({ queryKey: ["admin-vehicles"] });
    toast.success("Photo removed");
  }

  return (
    <div className="border-t pt-4">
      <Label>Photos</Label>
      <label
        htmlFor="vehicle-photos"
        className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed p-5 text-sm text-muted-foreground hover:border-accent hover:text-accent"
      >
        <ImagePlus className="size-4" /> {uploading ? "Uploading…" : "Upload photos"}
      </label>
      <input
        id="vehicle-photos"
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={(e) => upload(e.target.files)}
      />

      <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
        {(images.data ?? []).map((img) => (
          <AdminThumb
            key={img.id}
            image={img}
            onPrimary={() => makePrimary(img.id)}
            onRemove={() => remove(img)}
            onLeft={() => move(img, -1)}
            onRight={() => move(img, 1)}
          />
        ))}
      </div>
    </div>
  );
}

function AdminThumb({
  image,
  onPrimary,
  onRemove,
  onLeft,
  onRight,
}: {
  image: VehicleImage;
  onPrimary: () => void;
  onRemove: () => void;
  onLeft: () => void;
  onRight: () => void;
}) {
  const { data: url } = useImageUrl(image.url);
  return (
    <div className="relative overflow-hidden rounded-lg border">
      {url ? <img src={url} alt="" className="aspect-[4/3] w-full object-cover" /> : <div className="aspect-[4/3] w-full bg-secondary" />}
      {image.is_primary ? (
        <Badge className="absolute left-1 top-1 bg-accent text-accent-foreground">Main</Badge>
      ) : null}
      <div className="flex items-center justify-between gap-1 p-1">
        <button type="button" onClick={onLeft} aria-label="Move left" className="px-1 text-xs">←</button>
        <button type="button" onClick={onPrimary} aria-label="Set as main photo" className="text-xs hover:text-accent">
          <Star className="size-3.5" />
        </button>
        <button type="button" onClick={onRight} aria-label="Move right" className="px-1 text-xs">→</button>
        <button type="button" onClick={onRemove} aria-label="Remove photo" className="text-destructive">
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string | boolean | undefined;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input
        type={type}
        required={required}
        value={String(value ?? "")}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string | boolean | undefined;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Select value={String(value ?? "")} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
