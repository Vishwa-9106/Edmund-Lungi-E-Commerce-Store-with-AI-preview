import { useState, useEffect, useMemo, type FormEvent } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/supabase";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/InputField";
import { useToast } from "@/hooks/use-toast";
import { ShoppingBag, MapPin, CreditCard, ChevronRight, Loader2 } from "lucide-react";

type Address = {
  id: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  createdAt: string;
};

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [addressLoading, setAddressLoading] = useState(true);

  const [addressForm, setAddressForm] = useState({
    fullName: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  });
  const [savingAddress, setSavingAddress] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchAddresses();
    }
  }, [isAuthenticated, user?.id]);

  const normalizeAddress = (x: any): Address | null => {
    if (!x || typeof x !== "object") return null;
    const id = String(x.id ?? "");
    if (!id) return null;

    return {
      id,
      fullName: String(x.fullName ?? x.full_name ?? ""),
      phone: String(x.phone ?? x.mobile ?? ""),
      line1: String(x.line1 ?? x.address_line ?? ""),
      line2: x.line2 == null ? undefined : String(x.line2),
      city: String(x.city ?? ""),
      state: String(x.state ?? ""),
      postalCode: String(x.postalCode ?? x.pincode ?? ""),
      country: x.country == null ? undefined : String(x.country),
      createdAt: String(x.createdAt ?? x.created_at ?? new Date().toISOString()),
    };
  };

  const fetchAddresses = async () => {
    try {
      setAddressLoading(true);
      const { data, error } = await supabase
        .from("users")
        .select("addresses")
        .eq("id", user?.id)
        .single();

      if (error) {
        // If the user row doesn't exist yet, treat it as "no addresses".
        setAddresses([]);
        setSelectedAddressId(null);
        return;
      }

      const raw = (data as any)?.addresses;
      const list: Address[] = Array.isArray(raw)
        ? (raw as any[])
            .map((x) => normalizeAddress(x))
            .filter(Boolean) as Address[]
        : [];
      setAddresses(list);
      if (list.length > 0) {
        setSelectedAddressId(list[0].id);
      }
    } catch (error: any) {
      console.error("Error fetching addresses:", error);
      toast({
        title: "Error",
        description: "Failed to load saved addresses.",
        variant: "destructive",
      });
    } finally {
      setAddressLoading(false);
    }
  };

  const handleAddAddress = async (e: FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      setSavingAddress(true);

      const newAddress: Address = {
        id: crypto.randomUUID(),
        fullName: addressForm.fullName,
        phone: addressForm.phone,
        line1: addressForm.line1,
        line2: addressForm.line2 || undefined,
        city: addressForm.city,
        state: addressForm.state,
        postalCode: addressForm.postalCode,
        country: addressForm.country || "India",
        createdAt: new Date().toISOString(),
      };

      // Read the latest addresses from DB to prevent overwriting with stale local state.
      const { data: existingRow, error: existingError } = await supabase
        .from("users")
        .select("addresses")
        .eq("id", user.id)
        .maybeSingle();

      if (existingError) throw existingError;

      const rawExisting = (existingRow as any)?.addresses;
      const existing: Address[] = Array.isArray(rawExisting)
        ? (rawExisting as any[])
            .map((x) => normalizeAddress(x))
            .filter(Boolean) as Address[]
        : [];

      if (!existingRow) {
        throw new Error(
          "Your account profile is missing in the database, so we can't save addresses. Please contact support or re-login after your profile is created."
        );
      }

      const merged = [...existing, newAddress];

      // Important: use UPDATE (PATCH) instead of UPSERT (POST) to avoid requiring INSERT RLS.
      const { data: savedRows, error: saveError } = await supabase
        .from("users")
        .update({ addresses: merged })
        .eq("id", user.id)
        .select("addresses")
        .limit(1);

      // If 0 rows were updated (row missing or UPDATE blocked by RLS), PostgREST can return 406
      // when using `.single()`. We avoid `.single()` and handle the "no returned row" case.
      if (saveError) throw saveError;

      const savedRaw = Array.isArray(savedRows) && savedRows.length > 0 ? (savedRows[0] as any)?.addresses : undefined;
      if (!Array.isArray(savedRaw)) {
        throw new Error(
          "We couldn't save your address because your profile row couldn't be updated. This is usually caused by missing RLS UPDATE permissions or a missing users row."
        );
      }

      const saved: Address[] = Array.isArray(savedRaw)
        ? (savedRaw as any[]).map((x) => normalizeAddress(x)).filter(Boolean) as Address[]
        : [];

      setAddresses(saved);
      setSelectedAddressId(newAddress.id);
      setIsAddingAddress(false);
      toast({
        title: "Success",
        description: "Address added successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add address.",
        variant: "destructive",
      });
    } finally {
      setSavingAddress(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!user?.id || items.length === 0) return;
    if (!selectedAddressId) {
      toast({
        title: "Address Required",
        description: "Please select or add a delivery address.",
        variant: "destructive",
      });
      return;
    }

    const address = addresses.find((a) => a.id === selectedAddressId);
    if (!address) return;

        try {
          setIsPlacingOrder(true);

          const orderData = {
            user_id: user.id,
            order_number: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            items: [
              ...items.map((item) => ({
                name: item.product.name,
                qty: item.quantity,
                price: item.product.price,
                size: item.size,
              })),
              {
                _metadata: true,
                type: "delivery_address",
                address: address
              },
              {
                _metadata: true,
                type: "payment_info",
                method: "COD"
              }
            ],
            total: totalPrice,
            currency: "INR",
            status: "placed",
            created_at: new Date().toISOString(),
          };

          const { error } = await supabase.from("orders").insert(orderData);

      if (error) throw error;

      clearCart();
      navigate("/order-success");
    } catch (error: any) {
      toast({
        title: "Order Failed",
        description: error.message || "Something went wrong while placing your order.",
        variant: "destructive",
      });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login?redirect=/checkout" />;
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mb-6" />
        <h1 className="text-2xl font-bold mb-2">Your Cart is Empty</h1>
        <Button onClick={() => navigate("/shop")} className="btn-primary mt-4">
          Go to Shop
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 md:py-12 bg-background">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-8">
          Check<span className="gradient-text">out</span>
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address Section */}
            <div className="bg-secondary rounded-xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <MapPin className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold">Delivery Address</h2>
              </div>

              {addressLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : addresses.length > 0 && !isAddingAddress ? (
                <div className="space-y-4">
                  <div className="grid gap-4">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedAddressId === addr.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">{addr.fullName}</p>
                            <p className="text-sm text-muted-foreground">{addr.phone}</p>
                            <p className="text-sm mt-1">{addr.line1}</p>
                            {addr.line2 && <p className="text-sm">{addr.line2}</p>}
                            <p className="text-sm">
                              {addr.city}, {addr.state} - {addr.postalCode}
                            </p>
                          </div>
                          {selectedAddressId === addr.id && (
                            <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setIsAddingAddress(true)}
                  >
                    Add New Address
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleAddAddress} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <InputField
                      label="Full Name"
                      value={addressForm.fullName}
                      onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                      required
                    />
                    <InputField
                      label="Mobile Number"
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                      required
                    />
                  </div>
                  <InputField
                    label="Address Line"
                    value={addressForm.line1}
                    onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })}
                    placeholder="House No, Street, Landmark"
                    required
                  />
                  <div className="grid sm:grid-cols-3 gap-4">
                    <InputField
                      label="City"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      required
                    />
                    <InputField
                      label="State"
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                      required
                    />
                    <InputField
                      label="Pincode"
                      value={addressForm.postalCode}
                      onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                      required
                    />
                  </div>
                  <div className="flex gap-4">
                    <Button type="submit" className="flex-1 btn-primary">
                      Save & Select
                    </Button>
                    {addresses.length > 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsAddingAddress(false)}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              )}
            </div>

            {/* Payment Method Section */}
            <div className="bg-secondary rounded-xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <CreditCard className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold">Payment Method</h2>
              </div>
              <div className="p-4 rounded-lg border-2 border-primary bg-primary/5 flex items-center justify-between">
                <div>
                  <p className="font-semibold">Cash on Delivery (COD)</p>
                  <p className="text-sm text-muted-foreground">Pay when your order is delivered</p>
                </div>
                <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-secondary rounded-xl p-6 sticky top-24">
              <h2 className="font-display text-xl font-bold mb-6">Order Summary</h2>
              
              <div className="max-h-60 overflow-y-auto mb-6 pr-2 custom-scrollbar">
                {items.map((item) => (
                  <div key={`${item.product.id}-${item.size}`} className="flex justify-between items-center mb-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium line-clamp-1">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Qty: {item.quantity} | Size: {item.size}
                      </p>
                    </div>
                    <p className="text-sm font-semibold ml-4">
                      ₹{(item.product.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-4 border-t border-border">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>₹{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery Charge</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="border-t border-border pt-3 mt-3">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total Amount</span>
                    <span className="gradient-text">₹{totalPrice.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <Button
                className="w-full btn-primary mt-8 py-6 text-lg"
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder || items.length === 0}
              >
                {isPlacingOrder ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  <>
                    Place Order
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
              <p className="text-[10px] text-center text-muted-foreground mt-4 uppercase tracking-wider">
                Secure SSL Encrypted Checkout
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
