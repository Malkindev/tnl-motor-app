import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/useAuth";

export function useWishlistIds() {
  const { user } = useSession();
  return useQuery({
    queryKey: ["wishlist-ids", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase.from("wishlists").select("vehicle_id");
      if (error) throw error;
      return (data ?? []).map((r) => r.vehicle_id);
    },
  });
}

export function useToggleWishlist() {
  const { user } = useSession();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ vehicleId, saved }: { vehicleId: string; saved: boolean }) => {
      if (!user) throw new Error("not-signed-in");
      if (saved) {
        const { error } = await supabase
          .from("wishlists")
          .delete()
          .eq("vehicle_id", vehicleId)
          .eq("user_id", user.id);
        if (error) throw error;
        return false;
      }
      const { error } = await supabase
        .from("wishlists")
        .insert({ vehicle_id: vehicleId, user_id: user.id });
      if (error) throw error;
      return true;
    },
    onSuccess: (nowSaved) => {
      qc.invalidateQueries({ queryKey: ["wishlist-ids"] });
      qc.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success(nowSaved ? "Saved to your list" : "Removed from your list");
    },
    onError: (error: Error) => {
      if (error.message === "not-signed-in") {
        toast.error("Sign in to save cars to your account");
        return;
      }
      toast.error("Could not update your saved cars");
    },
  });
}
