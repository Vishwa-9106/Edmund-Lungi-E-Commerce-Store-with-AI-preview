import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { InputField } from "@/components/InputField";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/supabase";
import { useCart } from "@/contexts/CartContext";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/data/products";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

export default function CustomerDashboard() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const { addToCart } = useCart();

  type Address = {
    id: string;
    fullName: string;
    phone: string;
    line1: string;
    line2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [addressesSaving, setAddressesSaving] = useState(false);
  const [addressesError, setAddressesError] = useState<string | null>(null);
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState<Omit<Address, "id">>({
    fullName: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  });

  type OrderItem = {
    name: string;
    qty: number;
    price: number;
  };

  type OrderRow = {
    id: string;
    order_number: string | null;
    created_at: string | null;
    status: string | null;
    total: number | null;
    currency: string | null;
    items: unknown;
  };

  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderRow | null>(null);
  const [selectedTrackingOrderId, setSelectedTrackingOrderId] = useState<string | null>(null);

  type WishlistItemRow = {
    id: string;
    user_id: string;
    product_id: string;
    created_at: string | null;
  };

  const [wishlistItems, setWishlistItems] = useState<Array<{ item: WishlistItemRow; product: Product }>>([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistSaving, setWishlistSaving] = useState(false);
  const [wishlistError, setWishlistError] = useState<string | null>(null);

  const removeWishlistItem = async (productId: string, wishlistItemId: string) => {
    if (!user?.id) return;
    setWishlistSaving(true);
    setWishlistError(null);
    try {
      const { error } = await supabase
        .from("wishlist_items")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", productId);

      if (error) {
        setWishlistError(error.message || "Failed to update wishlist");
        return;
      }

      setWishlistItems((prev) => prev.filter((x) => x.item.id !== wishlistItemId));
    } catch (e: any) {
      setWishlistError(e?.message || "Failed to update wishlist");
    } finally {
      setWishlistSaving(false);
    }
  };

  const menu = useMemo(
    () => [
      { key: "profile", label: "My Profile" },
      { key: "orders", label: "My Orders" },
      { key: "addresses", label: "Addresses" },
      { key: "wishlist", label: "Wishlist" },
      { key: "tracking", label: "Order Tracking" },
    ],
    []
  );

  const [activeKey, setActiveKey] = useState<(typeof menu)[number]["key"]>("profile");
  const activeLabel = menu.find((m) => m.key === activeKey)?.label ?? "My Profile";

  useEffect(() => {
    let alive = true;
    if (activeKey !== "orders" && activeKey !== "tracking") return;
    if (!user?.id) return;

    setOrdersLoading(true);
    setOrdersError(null);

    (async () => {
      try {
        const { data, error } = await supabase
          .from("orders")
          .select("id, order_number, created_at, status, total, currency, items")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (!alive) return;
        if (error) {
          setOrders([]);
          setOrdersError(error.message || "Failed to load orders");
          return;
        }

        const rows = Array.isArray(data) ? (data as OrderRow[]) : [];
        setOrders(rows);

        if (activeKey === "tracking") {
          const existing = selectedTrackingOrderId;
          const hasExisting = existing && rows.some((r) => r.id === existing);
          if (!hasExisting) {
            setSelectedTrackingOrderId(rows[0]?.id ?? null);
          }
        }
      } catch (e: any) {
        if (!alive) return;
        setOrders([]);
        setOrdersError(e?.message || "Failed to load orders");
      } finally {
        if (!alive) return;
        setOrdersLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [activeKey, user?.id, selectedTrackingOrderId]);

  useEffect(() => {
    let alive = true;
    if (activeKey !== "addresses") return;
    if (!user?.id) return;

    setAddressesLoading(true);
    setAddressesError(null);

    (async () => {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("addresses")
          .eq("id", user.id)
          .single();

        if (!alive) return;
        if (error) {
          setAddresses([]);
          setAddressesError(error.message || "Failed to load addresses");
          return;
        }

        const raw = (data as any)?.addresses;
        const list: Address[] = Array.isArray(raw)
          ? (raw as any[])
              .filter((x) => x && typeof x === "object")
              .map((x) => ({
                id: String((x as any).id ?? ""),
                fullName: String((x as any).fullName ?? ""),
                phone: String((x as any).phone ?? ""),
                line1: String((x as any).line1 ?? ""),
                line2: String((x as any).line2 ?? ""),
                city: String((x as any).city ?? ""),
                state: String((x as any).state ?? ""),
                postalCode: String((x as any).postalCode ?? ""),
                country: String((x as any).country ?? ""),
              }))
              .filter((x) => x.id.length > 0)
          : [];

        setAddresses(list);
      } catch (e: any) {
        if (!alive) return;
        setAddresses([]);
        setAddressesError(e?.message || "Failed to load addresses");
      } finally {
        if (!alive) return;
        setAddressesLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [activeKey, user?.id]);

  useEffect(() => {
    let alive = true;
    if (activeKey !== "wishlist") return;
    if (!user?.id) return;

    setWishlistLoading(true);
    setWishlistError(null);

    (async () => {
      try {
        const { data: itemRows, error: itemsError } = await supabase
          .from("wishlist_items")
          .select("id, user_id, product_id, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (!alive) return;

        if (itemsError) {
          setWishlistItems([]);
          setWishlistError(itemsError.message || "Failed to load wishlist");
          return;
        }

        const items = Array.isArray(itemRows) ? (itemRows as WishlistItemRow[]) : [];
        const productIds = items.map((r) => r.product_id).filter((id) => typeof id === "string" && id.length > 0);

        if (productIds.length === 0) {
          setWishlistItems([]);
          return;
        }

        const { data: productRows, error: productsError } = await supabase
          .from("products")
          .select("id,name,price,original_price,image_url,category,material,sizes,color,description")
          .in("id", productIds);

        if (!alive) return;

        if (productsError) {
          setWishlistItems([]);
          setWishlistError(productsError.message || "Failed to load wishlist products");
          return;
        }

        const mappedProducts: Product[] = (Array.isArray(productRows) ? productRows : []).map((row: any) => {
          const imageUrl = typeof row.image_url === "string" && row.image_url.length > 0 ? row.image_url : "/placeholder.svg";
          const sizes = Array.isArray(row.sizes) ? (row.sizes as string[]) : [];

          return {
            id: String(row.id),
            name: String(row.name ?? ""),
            price: Number(row.price ?? 0),
            originalPrice: row.original_price == null ? undefined : Number(row.original_price),
            description: String(row.description ?? ""),
            category: String(row.category ?? ""),
            color: String(row.color ?? ""),
            material: String(row.material ?? ""),
            sizes,
            rating: 0,
            reviews: 0,
            images: [imageUrl],
          };
        });

        const productMap = new Map(mappedProducts.map((p) => [p.id, p] as const));
        const merged = items
          .map((it) => {
            const p = productMap.get(it.product_id);
            return p ? { item: it, product: p } : null;
          })
          .filter(Boolean) as Array<{ item: WishlistItemRow; product: Product }>;

        setWishlistItems(merged);
      } catch (e: any) {
        if (!alive) return;
        setWishlistItems([]);
        setWishlistError(e?.message || "Failed to load wishlist");
      } finally {
        if (!alive) return;
        setWishlistLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [activeKey, user?.id]);

  const createdAtLabel = useMemo(() => {
    if (!user?.createdAt) return "—";
    const dt = new Date(user.createdAt);
    if (Number.isNaN(dt.getTime())) return "—";
    return dt.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  }, [user?.createdAt]);

  const orderDateLabel = (iso: string | null) => {
    if (!iso) return "—";
    const dt = new Date(iso);
    if (Number.isNaN(dt.getTime())) return "—";
    return dt.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  };

  const orderTotalLabel = (total: number | null, currency: string | null) => {
    const value = typeof total === "number" && Number.isFinite(total) ? total : 0;
    const curr = (currency || "INR").toUpperCase();
    if (curr === "INR") return `₹${value.toLocaleString()}`;
    return `${curr} ${value.toLocaleString()}`;
  };

  const normalizedItems = useMemo(() => {
    const raw = selectedOrder?.items;
    if (!Array.isArray(raw)) return [] as OrderItem[];
    return (raw as any[])
      .filter((x) => x && typeof x === "object" && !(x as any)._metadata)
      .map((x) => ({
        name: String((x as any).name ?? ""),
        qty: Number((x as any).qty ?? 0),
        price: Number((x as any).price ?? 0),
      }))
      .filter((x) => x.name.length > 0);
  }, [selectedOrder?.items]);

  const deliveryAddress = useMemo(() => {
    const raw = selectedOrder?.items;
    if (!Array.isArray(raw)) return null;
    const meta = (raw as any[]).find((x) => x?._metadata && x?.type === "delivery_address");
    return meta?.address || null;
  }, [selectedOrder?.items]);

  const paymentMethod = useMemo(() => {
    const raw = selectedOrder?.items;
    if (!Array.isArray(raw)) return null;
    const meta = (raw as any[]).find((x) => x?._metadata && x?.type === "payment_info");
    return meta?.method || "COD";
  }, [selectedOrder?.items]);

  const trackingSteps = useMemo(
    () => [
      { key: "placed", label: "Placed" },
      { key: "confirmed", label: "Confirmed" },
      { key: "shipped", label: "Shipped" },
      { key: "delivered", label: "Delivered" },
    ],
    []
  );

  const trackingOrder = useMemo(() => {
    if (!selectedTrackingOrderId) return null;
    return orders.find((o) => o.id === selectedTrackingOrderId) ?? null;
  }, [orders, selectedTrackingOrderId]);

  const trackingStageIndex = (status: string | null) => {
    const s = (status || "").trim().toLowerCase();
    if (s === "delivered" || s === "completed") return 3;
    if (s === "shipped") return 2;
    if (s === "confirmed" || s === "processing") return 1;
    if (s === "placed" || s === "pending") return 0;
    if (s === "cancelled" || s === "canceled") return 0;
    return 0;
  };

  const trackingStatusClass = (status: string | null) => {
    const s = (status || "Pending").toString().toLowerCase();
    if (s === "delivered" || s === "completed") return "bg-sage/20 text-sage";
    if (s === "cancelled" || s === "canceled") return "bg-destructive/10 text-destructive";
    return "bg-amber/20 text-amber";
  };

  const resetAddressForm = () => {
    setAddressForm({
      fullName: "",
      phone: "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India",
    });
    setEditingAddressId(null);
    setIsAddressFormOpen(false);
  };

  const openAddAddress = () => {
    setEditingAddressId(null);
    setAddressForm({
      fullName: "",
      phone: "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India",
    });
    setIsAddressFormOpen(true);
  };

  const persistAddresses = async (next: Address[]) => {
    if (!user?.id) return;
    setAddressesSaving(true);
    setAddressesError(null);
    try {
      const { error } = await supabase
        .from("users")
        .update({ addresses: next })
        .eq("id", user.id);

      if (error) {
        setAddressesError(error.message || "Failed to save addresses");
      }
    } catch (e: any) {
      setAddressesError(e?.message || "Failed to save addresses");
    } finally {
      setAddressesSaving(false);
    }
  };

  const openEditAddress = (addr: Address) => {
    setEditingAddressId(addr.id);
    setAddressForm({
      fullName: addr.fullName,
      phone: addr.phone,
      line1: addr.line1,
      line2: addr.line2,
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      country: addr.country,
    });
    setIsAddressFormOpen(true);
  };

  const saveAddress = (e: FormEvent) => {
    e.preventDefault();

    if (editingAddressId) {
      const next = addresses.map((a) => (a.id === editingAddressId ? { id: a.id, ...addressForm } : a));
      setAddresses(next);
      void persistAddresses(next);
      toast({ title: "Address updated", description: "Your address has been updated." });
      resetAddressForm();
      return;
    }

    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const next = [{ id, ...addressForm }, ...addresses];
    setAddresses(next);
    void persistAddresses(next);
    toast({ title: "Address added", description: "Your new address has been saved." });
    resetAddressForm();
  };

  const deleteAddress = (id: string) => {
    const next = addresses.filter((a) => a.id !== id);
    setAddresses(next);
    void persistAddresses(next);
    toast({ title: "Address deleted", description: "The address has been removed." });
    if (editingAddressId === id) resetAddressForm();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-[260px_1fr]">
          <aside className="card-elevated p-4 h-fit">
            <div className="space-y-2">
              {menu.map((item) => {
                const isActive = item.key === activeKey;
                return (
                  <Button
                    key={item.key}
                    type="button"
                    variant={isActive ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setActiveKey(item.key)}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </div>
          </aside>

          <section className="card-elevated p-6">
            {activeKey === "profile" ? (
              <div className="space-y-8">
                <div>
                  <h1 className="section-title">My Profile</h1>
                  <p className="text-muted-foreground mt-3 max-w-xl">
                    View and manage your account details.
                  </p>
                </div>

                {loading ? (
                  <div className="card-elevated p-6">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-6 w-64" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-6 w-80" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-6 w-48" />
                      </div>
                    </div>
                  </div>
                ) : !user ? (
                  <div className="card-elevated p-6">
                    <h2 className="font-semibold text-xl">Profile</h2>
                    <p className="text-muted-foreground mt-2">We couldn't load your profile information.</p>
                  </div>
                ) : (
                  <div className="card-elevated p-6">
                    <h2 className="font-semibold text-xl">Profile</h2>
                    <div className="mt-6 space-y-5">
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="font-medium">{user.name || "—"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{user.email || "—"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Account Created</p>
                        <p className="font-medium">{createdAtLabel}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : activeKey === "orders" ? (
              <div className="space-y-8">
                <div>
                  <h1 className="section-title">My Orders</h1>
                  <p className="text-muted-foreground mt-3 max-w-xl">
                    Track your recent purchases and view order details.
                  </p>
                </div>

                {ordersError && (
                  <div className="card-elevated p-6">
                    <p className="text-sm text-destructive">{ordersError}</p>
                  </div>
                )}

                {ordersLoading ? (
                  <div className="space-y-4">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="card-elevated p-6">
                        <div className="flex items-start justify-between gap-6">
                          <div className="space-y-2">
                            <Skeleton className="h-5 w-48" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                          <Skeleton className="h-9 w-28" />
                        </div>
                        <div className="mt-6 grid sm:grid-cols-3 gap-4">
                          <Skeleton className="h-4 w-28" />
                          <Skeleton className="h-4 w-28" />
                          <Skeleton className="h-4 w-28" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : orders.length === 0 ? (
                  <div className="card-elevated p-6">
                    <h2 className="font-semibold text-xl">No orders yet</h2>
                    <p className="text-muted-foreground mt-2">
                      Once you place an order, it will show up here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((o) => {
                      const idLabel = o.order_number || o.id;
                      const status = (o.status || "Pending").toString();
                      const statusTone = status.toLowerCase();
                      const statusClass =
                        statusTone === "delivered" || statusTone === "completed"
                          ? "bg-sage/20 text-sage"
                          : statusTone === "cancelled" || statusTone === "canceled"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-amber/20 text-amber";

                      return (
                        <div key={o.id} className="card-elevated p-6">
                          <div className="flex items-start justify-between gap-6 flex-wrap">
                            <div>
                              <h3 className="font-semibold text-lg">Order {idLabel}</h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                {orderDateLabel(o.created_at)}
                              </p>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className={`text-xs px-2 py-1 rounded-full ${statusClass}`}>{status}</span>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedOrder(o);
                                  setOrderDialogOpen(true);
                                }}
                              >
                                View Details
                              </Button>
                            </div>
                          </div>

                          <div className="mt-6 grid sm:grid-cols-3 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Order ID</p>
                              <p className="font-medium truncate">{idLabel}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Status</p>
                              <p className="font-medium">{status}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Total</p>
                              <p className="font-medium">{orderTotalLabel(o.total, o.currency)}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {selectedOrder?.order_number
                          ? `Order ${selectedOrder.order_number}`
                          : selectedOrder
                            ? `Order ${selectedOrder.id}`
                            : "Order"}
                      </DialogTitle>
                      <DialogDescription>
                        {selectedOrder ? `Placed on ${orderDateLabel(selectedOrder.created_at)}` : ""}
                      </DialogDescription>
                    </DialogHeader>

                    {selectedOrder && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Status</p>
                            <p className="font-medium">{selectedOrder.status || "Pending"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Total</p>
                            <p className="font-medium">
                              {orderTotalLabel(selectedOrder.total, selectedOrder.currency)}
                            </p>
                          </div>
                        </div>

                          {normalizedItems.length > 0 ? (
                            <div className="space-y-3">
                              <p className="text-sm font-medium">Items</p>
                              <div className="space-y-2">
                                {normalizedItems.map((it, idx) => (
                                  <div key={`${it.name}-${idx}`} className="flex items-center justify-between bg-secondary/50 rounded-xl p-3">
                                    <div>
                                      <p className="font-medium">{it.name}</p>
                                      <p className="text-sm text-muted-foreground">Qty: {it.qty}</p>
                                    </div>
                                    <p className="font-semibold">{orderTotalLabel(it.price * it.qty, selectedOrder.currency)}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : null}

                          {deliveryAddress && (
                            <div className="bg-secondary/30 rounded-xl p-4 border border-border">
                              <p className="text-sm font-medium mb-2">Delivery Address</p>
                              <div className="text-sm text-muted-foreground space-y-1">
                                <p className="font-semibold text-foreground">{deliveryAddress.fullName}</p>
                                <p>{deliveryAddress.line1}</p>
                                {deliveryAddress.line2 && <p>{deliveryAddress.line2}</p>}
                                <p>{deliveryAddress.city}, {deliveryAddress.state} - {deliveryAddress.postalCode}</p>
                                <p>Phone: {deliveryAddress.phone}</p>
                              </div>
                            </div>
                          )}

                          <div className="bg-secondary/30 rounded-xl p-4 border border-border">
                            <p className="text-sm font-medium mb-1">Payment Method</p>
                            <p className="text-sm text-muted-foreground">{paymentMethod === "COD" ? "Cash on Delivery" : paymentMethod}</p>
                          </div>

                {isAddressFormOpen && (
                  <div className="card-elevated p-6">
                    <h2 className="font-semibold text-xl">
                      {editingAddressId ? "Edit Address" : "Add Address"}
                    </h2>

                    <form onSubmit={saveAddress} className="mt-6 space-y-5">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <InputField
                          id="address-fullName"
                          label="Full Name"
                          value={addressForm.fullName}
                          onChange={(e) => setAddressForm((p) => ({ ...p, fullName: e.target.value }))}
                          placeholder="John Doe"
                          required
                        />
                        <InputField
                          id="address-phone"
                          label="Phone"
                          value={addressForm.phone}
                          onChange={(e) => setAddressForm((p) => ({ ...p, phone: e.target.value }))}
                          placeholder="+91 98765 43210"
                          required
                        />
                      </div>

                      <InputField
                        id="address-line1"
                        label="Address Line 1"
                        value={addressForm.line1}
                        onChange={(e) => setAddressForm((p) => ({ ...p, line1: e.target.value }))}
                        placeholder="House no, Street"
                        required
                      />

                      <InputField
                        id="address-line2"
                        label="Address Line 2 (Optional)"
                        value={addressForm.line2}
                        onChange={(e) => setAddressForm((p) => ({ ...p, line2: e.target.value }))}
                        placeholder="Apartment, Landmark"
                      />

                      <div className="grid sm:grid-cols-2 gap-4">
                        <InputField
                          id="address-city"
                          label="City"
                          value={addressForm.city}
                          onChange={(e) => setAddressForm((p) => ({ ...p, city: e.target.value }))}
                          placeholder="Chennai"
                          required
                        />
                        <InputField
                          id="address-state"
                          label="State"
                          value={addressForm.state}
                          onChange={(e) => setAddressForm((p) => ({ ...p, state: e.target.value }))}
                          placeholder="Tamil Nadu"
                          required
                        />
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <InputField
                          id="address-postal"
                          label="Postal Code"
                          value={addressForm.postalCode}
                          onChange={(e) => setAddressForm((p) => ({ ...p, postalCode: e.target.value }))}
                          placeholder="600001"
                          required
                        />
                        <InputField
                          id="address-country"
                          label="Country"
                          value={addressForm.country}
                          onChange={(e) => setAddressForm((p) => ({ ...p, country: e.target.value }))}
                          placeholder="India"
                          required
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button type="submit" className="btn-primary w-full sm:w-auto" disabled={addressesSaving}>
                          {editingAddressId ? "Save Changes" : "Save Address"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full sm:w-auto"
                          onClick={resetAddressForm}
                          disabled={addressesSaving}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </div>
                )}

                {!addressesLoading && addresses.length === 0 ? (
                  <div className="card-elevated p-6">
                    <h2 className="font-semibold text-xl">No addresses yet</h2>
                    <p className="text-muted-foreground mt-2">
                      Add an address to save it for faster checkout later.
                    </p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {addresses.map((addr) => (
                      <div key={addr.id} className="card-elevated p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-lg">{addr.fullName}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{addr.phone}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={() => openEditAddress(addr)}>
                              Edit
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteAddress(addr.id)}
                              disabled={addressesSaving}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>

                        <div className="mt-5 space-y-1">
                          <p className="text-sm text-muted-foreground">
                            {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {addr.city}, {addr.state} {addr.postalCode}
                          </p>
                          <p className="text-sm text-muted-foreground">{addr.country}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : activeKey === "tracking" ? (
              <div className="space-y-8">
                <div>
                  <h1 className="section-title">Order Tracking</h1>
                  <p className="text-muted-foreground mt-3 max-w-xl">
                    Select an order to view its delivery progress.
                  </p>
                </div>

                {ordersError && (
                  <div className="card-elevated p-6">
                    <p className="text-sm text-destructive">{ordersError}</p>
                  </div>
                )}

                {ordersLoading ? (
                  <div className="card-elevated p-6">
                    <div className="space-y-4">
                      <Skeleton className="h-6 w-52" />
                      <Skeleton className="h-4 w-72" />
                      <Skeleton className="h-4 w-56" />
                    </div>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="card-elevated p-6">
                    <h2 className="font-semibold text-xl">No orders to track</h2>
                    <p className="text-muted-foreground mt-2">
                      Place an order to start tracking delivery status.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="card-elevated p-6">
                      <label htmlFor="tracking-order" className="block text-sm font-medium text-foreground mb-2">
                        Select Order
                      </label>
                      <select
                        id="tracking-order"
                        className="input-field w-full"
                        value={selectedTrackingOrderId ?? ""}
                        onChange={(e) => setSelectedTrackingOrderId(e.target.value || null)}
                      >
                        {orders.map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.order_number ? `Order ${o.order_number}` : `Order ${o.id}`}
                          </option>
                        ))}
                      </select>
                    </div>

                    {trackingOrder && (
                      <div className="card-elevated p-6">
                        <div className="flex items-start justify-between gap-6 flex-wrap">
                          <div>
                            <h2 className="font-semibold text-xl">
                              {trackingOrder.order_number
                                ? `Order ${trackingOrder.order_number}`
                                : `Order ${trackingOrder.id}`}
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">
                              {orderDateLabel(trackingOrder.created_at)}
                            </p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${trackingStatusClass(trackingOrder.status)}`}>
                            {(trackingOrder.status || "Pending").toString()}
                          </span>
                        </div>

                        <div className="mt-8">
                          <div className="grid gap-4 sm:grid-cols-4">
                            {trackingSteps.map((step, idx) => {
                              const current = trackingStageIndex(trackingOrder.status);
                              const isCompleted = idx < current;
                              const isCurrent = idx === current;

                              const badgeClass = isCompleted
                                ? "bg-sage/20 text-sage"
                                : isCurrent
                                  ? "bg-amber/20 text-amber"
                                  : "bg-secondary/50 text-muted-foreground";

                              return (
                                <div key={step.key} className="flex flex-col items-start">
                                  <div className="flex items-center gap-3 w-full">
                                    <span className={`text-xs px-2 py-1 rounded-full ${badgeClass}`}>{step.label}</span>
                                    {idx < trackingSteps.length - 1 && (
                                      <div className="hidden sm:block flex-1 h-px bg-border" />
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : activeKey === "wishlist" ? (
              <div className="space-y-8">
                <div>
                  <h1 className="section-title">Wishlist</h1>
                  <p className="text-muted-foreground mt-3 max-w-xl">
                    Saved items you can move to your cart anytime.
                  </p>
                </div>

                {wishlistError && (
                  <div className="card-elevated p-6">
                    <p className="text-sm text-destructive">{wishlistError}</p>
                  </div>
                )}

                {wishlistLoading ? (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className="card-product overflow-hidden">
                        <Skeleton className="aspect-square w-full" />
                        <div className="p-4 space-y-3">
                          <Skeleton className="h-3 w-20" />
                          <Skeleton className="h-5 w-40" />
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-5 w-24" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : wishlistItems.length === 0 ? (
                  <div className="card-elevated p-6">
                    <h2 className="font-semibold text-xl">No saved items</h2>
                    <p className="text-muted-foreground mt-2">
                      Save products to your wishlist and they’ll appear here.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {wishlistItems.map(({ item, product }) => {
                      const defaultSize = product.sizes?.[0] || "Free Size";

                      return (
                        <div key={item.id} className="space-y-3">
                          <ProductCard product={product} />
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              className="btn-primary flex-1"
                              disabled={wishlistSaving}
                              onClick={() => {
                                addToCart(product, defaultSize, 1);
                                void removeWishlistItem(product.id, item.id);
                                toast({ title: "Moved to cart", description: "Item added to your cart." });
                              }}
                            >
                              Move to Cart
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              disabled={wishlistSaving}
                              onClick={() => {
                                void removeWishlistItem(product.id, item.id);
                                toast({ title: "Removed", description: "Item removed from your wishlist." });
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <h1 className="font-display text-2xl md:text-3xl font-bold">{activeLabel}</h1>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
