import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const VEHICLE_BUCKET = "vehicle-images";
export const SELL_BUCKET = "sell-photos";

const ONE_HOUR = 60 * 60;
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_UPLOAD_IMAGES = 12;

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

export function validateImageFiles(files: File[], maxFiles = MAX_UPLOAD_IMAGES): string | null {
  if (files.length > maxFiles) return `Please select no more than ${maxFiles} images.`;
  for (const file of files) {
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      return `${file.name} is not a supported image. Use JPG, PNG, WebP or AVIF.`;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return `${file.name} is too large. Each image must be 10 MB or less.`;
    }
  }
  return null;
}

/**
 * Vehicle photos live in a private bucket, so stored paths are turned into
 * time-limited links. Absolute URLs are passed through untouched.
 */
export async function resolveImageUrl(
  path: string | null | undefined,
  bucket: string = VEHICLE_BUCKET,
): Promise<string | null> {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, ONE_HOUR);
  if (error) return null;
  return data?.signedUrl ?? null;
}

export async function resolveImageUrls(
  paths: (string | null | undefined)[],
  bucket: string = VEHICLE_BUCKET,
): Promise<string[]> {
  const resolved = await Promise.all(paths.map((p) => resolveImageUrl(p, bucket)));
  return resolved.filter((u): u is string => Boolean(u));
}

export function useImageUrl(path: string | null | undefined, bucket: string = VEHICLE_BUCKET) {
  return useQuery({
    queryKey: ["image-url", bucket, path],
    queryFn: () => resolveImageUrl(path, bucket),
    enabled: Boolean(path),
    staleTime: 30 * 60 * 1000,
  });
}

export function useImageUrls(paths: (string | null | undefined)[], bucket: string = VEHICLE_BUCKET) {
  return useQuery({
    queryKey: ["image-urls", bucket, paths],
    queryFn: () => resolveImageUrls(paths, bucket),
    enabled: paths.length > 0,
    staleTime: 30 * 60 * 1000,
  });
}
