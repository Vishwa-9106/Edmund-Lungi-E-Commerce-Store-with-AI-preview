import { useEffect, useMemo, useRef, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/data/products";
import { Button } from "@/components/ui/button";

const colors = ["All", "Maroon", "Blue", "Gold", "White", "Green", "Navy", "Multi", "Cream"];
const materials = ["All", "Pure Silk", "100% Cotton", "Cotton", "Silk Blend", "Silk Cotton", "Cotton Blend"];
const priceRanges = [
  { label: "All", min: 0, max: Infinity },
  { label: "Under ₹500", min: 0, max: 500 },
  { label: "₹500 - ₹1000", min: 500, max: 1000 },
  { label: "₹1000 - ₹2500", min: 1000, max: 2500 },
  { label: "₹2500 - ₹5000", min: 2500, max: 5000 },
  { label: "Above ₹5000", min: 5000, max: Infinity },
];

export default function ShopPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedColor, setSelectedColor] = useState("All");
  const [selectedMaterial, setSelectedMaterial] = useState("All");
  const [selectedPriceRange, setSelectedPriceRange] = useState(priceRanges[0]);
  const [showFilters, setShowFilters] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const didFetchRef = useRef(false);

  useEffect(() => {
    let alive = true;
    if (didFetchRef.current) return;
    didFetchRef.current = true;

    setLoading(true);

    (async () => {
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
        if (!supabaseUrl || !supabaseAnonKey) {
          setProducts([]);
          return;
        }

        let origin = supabaseUrl;
        try {
          origin = new URL(supabaseUrl).origin;
        } catch {
          // ignore
        }

        const url = `${origin}/rest/v1/products?select=id,name,price,original_price,image_url,category,material,sizes,stock_quantity,is_active,description,color&is_active=eq.true`;
        const res = await fetch(url, {
          headers: {
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${supabaseAnonKey}`,
          },
        });

        if (!alive) return;
        if (!res.ok) {
          setProducts([]);
          return;
        }

        const data = (await res.json()) as unknown;
        const rows = Array.isArray(data) ? data : [];
        const mapped: Product[] = rows.map((row: any) => {
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

        setProducts(mapped);
      } catch {
        if (!alive) return;
        setProducts([]);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description ?? "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesColor = selectedColor === "All" || product.color === selectedColor;
      const matchesMaterial = selectedMaterial === "All" || product.material === selectedMaterial;
      const matchesPrice = product.price >= selectedPriceRange.min && product.price <= selectedPriceRange.max;

      return matchesSearch && matchesColor && matchesMaterial && matchesPrice;
    });
  }, [products, searchQuery, selectedColor, selectedMaterial, selectedPriceRange]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedColor("All");
    setSelectedMaterial("All");
    setSelectedPriceRange(priceRanges[0]);
  };

  const hasActiveFilters = searchQuery || selectedColor !== "All" || selectedMaterial !== "All" || selectedPriceRange.label !== "All";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-hero py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="section-title">Our Collection</h1>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            Explore our handpicked selection of premium lungis
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside
            className={`lg:w-64 flex-shrink-0 ${
              showFilters ? "fixed inset-0 z-50 bg-background p-6 overflow-auto lg:static lg:p-0" : "hidden lg:block"
            }`}
          >
            <div className="flex items-center justify-between lg:hidden mb-6">
              <h2 className="font-semibold text-lg">Filters</h2>
              <button onClick={() => setShowFilters(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-field w-full pl-10"
                  />
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium mb-2">Price Range</label>
                <div className="space-y-2">
                  {priceRanges.map((range) => (
                    <button
                      key={range.label}
                      onClick={() => setSelectedPriceRange(range)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedPriceRange.label === range.label
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary hover:bg-secondary/80"
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium mb-2">Color</label>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                        selectedColor === color
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary hover:bg-secondary/80"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Material */}
              <div>
                <label className="block text-sm font-medium mb-2">Material</label>
                <div className="space-y-2">
                  {materials.map((material) => (
                    <button
                      key={material}
                      onClick={() => setSelectedMaterial(material)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedMaterial === material
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary hover:bg-secondary/80"
                      }`}
                    >
                      {material}
                    </button>
                  ))}
                </div>
              </div>

              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters} className="w-full">
                  Clear All Filters
                </Button>
              )}
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Mobile Filter Toggle */}
            <div className="flex items-center justify-between mb-6 lg:hidden">
              <p className="text-sm text-muted-foreground">
                {filteredProducts.length} products
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(true)}
                className="gap-2"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </Button>
            </div>

            {/* Desktop Results Count */}
            <div className="hidden lg:flex items-center justify-between mb-6">
              <p className="text-muted-foreground">
                Showing {filteredProducts.length} of {products.length} products
              </p>
            </div>

            {/* Products */}
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : products.length === 0 ? (
              <div className="text-sm text-muted-foreground">No products available</div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {filteredProducts.map((product, i) => (
                  <div
                    key={product.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-xl font-semibold mb-2">No products found</p>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your filters or search query
                </p>
                <Button onClick={clearFilters}>Clear Filters</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
