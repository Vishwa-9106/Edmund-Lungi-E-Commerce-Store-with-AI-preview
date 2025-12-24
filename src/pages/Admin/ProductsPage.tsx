import { useEffect, useRef, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

console.log("[AdminProducts] Module loaded (ProductsPage)");

type ProductRow = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  category: string | null;
  material: string | null;
  color: string | null;
  sizes: string[] | null;
  stock_quantity: number;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const didFetchRef = useRef(false);

  useEffect(() => {
    let alive = true;
    if (didFetchRef.current) return;
    didFetchRef.current = true;

    setLoading(true);
    setError(null);

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
    if (!supabaseUrl || !supabaseAnonKey) {
      const msg = "Supabase env vars missing: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY";
      console.error(msg);
      setError(msg);
      setProducts([]);
      setLoading(false);
      console.log("[AdminProducts] Loading stopped (missing env)");
      return;
    }

    let origin = supabaseUrl;
    try {
      origin = new URL(supabaseUrl).origin;
    } catch {
      // ignore
    }

    const startedAt = Date.now();
    console.log("[AdminProducts] Fetch start", { at: new Date(startedAt).toISOString(), origin });

    (async () => {
      console.log("[AdminProducts] REST request start", { at: new Date().toISOString() });
      try {
        const url = `${origin}/rest/v1/products?select=*`;
        const res = await fetch(url, {
          headers: {
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${supabaseAnonKey}`,
          },
        });

        const endedAt = Date.now();
        console.log("[AdminProducts] REST response", {
          at: new Date(endedAt).toISOString(),
          ms: endedAt - startedAt,
          status: res.status,
          ok: res.ok,
        });

        if (!alive) return;

        if (!res.ok) {
          const body = await res.text().catch(() => "");
          console.error("[AdminProducts] REST error body:", body);
          setError(body || `Request failed (${res.status})`);
          setProducts([]);
          return;
        }

        const data = (await res.json()) as unknown;
        const rows = Array.isArray(data) ? (data as ProductRow[]) : [];
        setProducts(rows);
      } catch (e: any) {
        if (!alive) return;
        console.error("[AdminProducts] REST fetch failed:", e);
        setError(e?.message || "Failed to load products");
        setProducts([]);
      } finally {
        console.log("[AdminProducts] REST finally", { at: new Date().toISOString() });
        if (!alive) return;
        setLoading(false);
        console.log("[AdminProducts] Loading stopped");
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6">
        <div className="bg-card rounded-2xl shadow-lg">
          <div className="p-4">
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : error ? (
              <div className="text-sm text-destructive">{error}</div>
            ) : products.length === 0 ? (
              <div className="text-sm text-muted-foreground">No products found</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Original Price</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Material</TableHead>
                    <TableHead>Color</TableHead>
                    <TableHead>Sizes</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Image URL</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead>Created At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="max-w-[220px] truncate">{p.id}</TableCell>
                      <TableCell className="max-w-[220px] truncate">{p.name}</TableCell>
                      <TableCell className="max-w-[320px] truncate">{p.description ?? ""}</TableCell>
                      <TableCell>{p.price}</TableCell>
                      <TableCell>{p.original_price ?? ""}</TableCell>
                      <TableCell>{p.category ?? ""}</TableCell>
                      <TableCell>{p.material ?? ""}</TableCell>
                      <TableCell>{p.color ?? ""}</TableCell>
                      <TableCell>{p.sizes?.join(", ") ?? ""}</TableCell>
                      <TableCell>{p.stock_quantity}</TableCell>
                      <TableCell className="max-w-[260px] truncate">{p.image_url ?? ""}</TableCell>
                      <TableCell>{p.is_active ? "true" : "false"}</TableCell>
                      <TableCell className="max-w-[220px] truncate">{p.created_at}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
