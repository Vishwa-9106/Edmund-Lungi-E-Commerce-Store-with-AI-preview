import { Heart } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useWishlist } from "@/contexts/WishlistContext";
import { useToast } from "@/hooks/use-toast";

export function WishlistHeart({ productId }: { productId: string }) {
  const { wishlist, toggle, isUpdating } = useWishlist();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const pid = String(productId ?? "").trim();
  const active = pid.length > 0 && wishlist.has(pid);
  const disabled = pid.length === 0 || isUpdating(pid);

  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();

        void (async () => {
          const res = await toggle(pid);
          if (!res.ok) {
            if ("needsLogin" in res && res.needsLogin) {
              const redirect = `${location.pathname}${location.search}`;
              navigate(`/login?redirect=${encodeURIComponent(redirect)}`);
              return;
            }

            toast({
              title: "Wishlist",
              description: (res as any).error || "Failed to update wishlist",
              variant: "destructive",
            });
          }
        })();
      }}
      className="p-2 rounded-full bg-background/80 hover:bg-background transition-colors"
    >
      <Heart className={active ? "w-5 h-5 fill-primary text-primary" : "w-5 h-5"} />
    </button>
  );
}
