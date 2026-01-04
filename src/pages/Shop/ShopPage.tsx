import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/data/products";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import supabase from "@/supabase";

const colors = ["All","Blue","Sandal","Grey","Maroon","Black","Green","White","Yellow","Orange","Brown"];

const materials = ["All", "Cotton Mixed", "Cotton", "Lungi", "Pure Cotton", "Dhoti"];
const priceRanges = [
  { label: "All", min: 0, max: Infinity },
  { label: "Under ₹500", min: 0, max: 500 },
  { label: "₹500 - ₹1000", min: 500, max: 1000 },
  { label: "₹1000 - ₹2500", min: 1000, max: 2500 },
  { label: "₹2500 - ₹5000", min: 2500, max: 5000 },
  { label: "Above ₹5000", min: 5000, max: Infinity },
];

const PRODUCTS_PER_PAGE = 12;

export default function ShopPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedColor, setSelectedColor] = useState("All");
  const [selectedMaterial, setSelectedMaterial] = useState("All");
  const [selectedPriceRange, setSelectedPriceRange] = useState(priceRanges[0]);
  const [showFilters, setShowFilters] = useState(false);

  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(totalCount / PRODUCTS_PER_PAGE));
  }, [totalCount]);

  const updateUrlQuery = (next: {
    page?: number;
    q?: string;
    category?: string;
    color?: string;
    material?: string;
    price?: string;
  }) => {
    const params = new URLSearchParams(location.search);

    const nextPage = next.page ?? page;
    params.set("page", String(nextPage));

    const setOrDelete = (key: string, value: string | undefined) => {
      if (value == null || value.length === 0) params.delete(key);
      else params.set(key, value);
    };

    setOrDelete("q", next.q ?? searchQuery);
    setOrDelete("category", next.category ?? selectedCategory);
    setOrDelete("color", next.color ?? selectedColor);
    setOrDelete("material", next.material ?? selectedMaterial);
    setOrDelete("price", next.price ?? selectedPriceRange.label);

    navigate({ pathname: location.pathname, search: params.toString() ? `?${params.toString()}` : "" }, { replace: true });
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    const q = params.get("q") ?? "";
    const category = params.get("category") ?? "All";
    const color = params.get("color") ?? "All";
    const material = params.get("material") ?? "All";
    const priceLabel = params.get("price") ?? "All";

    const parsedPageRaw = Number(params.get("page") ?? "1");
    const parsedPage = Number.isFinite(parsedPageRaw) && parsedPageRaw > 0 ? Math.floor(parsedPageRaw) : 1;

    const nextPriceRange = priceRanges.find((r) => r.label === priceLabel) ?? priceRanges[0];

    setSearchQuery(q);
    setSelectedCategory(category);
    setSelectedColor(color);
    setSelectedMaterial(material);
    setSelectedPriceRange(nextPriceRange);
    setPage(parsedPage);
  }, [location.search]);

  useEffect(() => {
    if (page <= totalPages) return;
    const nextPage = Math.max(1, totalPages);
    setPage(nextPage);
    updateUrlQuery({ page: nextPage });
  }, [page, totalPages]);

  useEffect(() => {
    let alive = true;
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const safePage = Math.max(1, page);
        const offset = (safePage - 1) * PRODUCTS_PER_PAGE;
        const from = offset;
        const to = offset + PRODUCTS_PER_PAGE - 1;

        let query = supabase
          .from("products")
          .select(
            "id,name,price,original_price,image_url,category,material,sizes,stock_quantity,is_active,description,color",
            { count: "exact" },
          )
          .eq("is_active", true);

        if (selectedCategory !== "All") {
          query = query.eq("category", selectedCategory);
        }

        if (selectedColor !== "All") {
          query = query.eq("color", selectedColor);
        }

        if (selectedMaterial !== "All") {
          query = query.or(`material.eq.${selectedMaterial},category.eq.${selectedMaterial}`);
        }

        if (selectedPriceRange.min > 0) {
          query = query.gte("price", selectedPriceRange.min);
        }
        if (Number.isFinite(selectedPriceRange.max) && selectedPriceRange.max !== Infinity) {
          query = query.lte("price", selectedPriceRange.max);
        }

        const trimmedQ = searchQuery.trim();
        if (trimmedQ.length > 0) {
          const escaped = trimmedQ.replace(/%/g, "\\%").replace(/_/g, "\\_");
          query = query.or(`name.ilike.%${escaped}%,description.ilike.%${escaped}%`);
        }

        const { data, error, count } = await query.order("id", { ascending: true }).range(from, to);

        if (!alive) return;
        if (error) {
          setProducts([]);
          setTotalCount(0);
          return;
        }

        setTotalCount(count ?? 0);

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
        setTotalCount(0);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    };

    fetchProducts();

    return () => {
      alive = false;
    };
  }, [page, searchQuery, selectedCategory, selectedColor, selectedMaterial, selectedPriceRange]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedColor("All");
    setSelectedMaterial("All");
    setSelectedPriceRange(priceRanges[0]);
    setPage(1);
    updateUrlQuery({ page: 1, q: "", category: "All", color: "All", material: "All", price: "All" });
  };

  const hasActiveFilters = searchQuery || selectedCategory !== "All" || selectedColor !== "All" || selectedMaterial !== "All" || selectedPriceRange.label !== "All";

  const showPagination = !loading && totalCount > PRODUCTS_PER_PAGE;

  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);

    const set = new Set<number>();
    set.add(1);
    set.add(totalPages);
    set.add(page);
    set.add(page - 1);
    set.add(page + 1);

    return Array.from(set)
      .filter((p) => p >= 1 && p <= totalPages)
      .sort((a, b) => a - b);
  }, [page, totalPages]);

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
                    onChange={(e) => {
                      const nextQ = e.target.value;
                      setSearchQuery(nextQ);
                      setPage(1);
                      updateUrlQuery({ page: 1, q: nextQ });
                    }}
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
                      onClick={() => {
                        setSelectedPriceRange(range);
                        setPage(1);
                        updateUrlQuery({ page: 1, price: range.label });
                      }}
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
                      onClick={() => {
                        setSelectedColor(color);
                        setPage(1);
                        updateUrlQuery({ page: 1, color });
                      }}
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
                      onClick={() => {
                        setSelectedMaterial(material);
                        setPage(1);
                        updateUrlQuery({ page: 1, material });
                      }}
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
                {products.length} products
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
                Showing {products.length} of {totalCount} products
              </p>
            </div>

            {/* Products */}
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : products.length === 0 ? (
              hasActiveFilters ? (
                <div className="text-center py-16">
                  <p className="text-xl font-semibold mb-2">No products found</p>
                  <p className="text-muted-foreground mb-6">
                    Try adjusting your filters or search query
                  </p>
                  <Button onClick={clearFilters}>Clear Filters</Button>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No products available</div>
              )
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {products.map((product, i) => (
                  <div
                    key={product.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            )}

            {showPagination && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => {
                    const nextPage = Math.max(1, page - 1);
                    setPage(nextPage);
                    updateUrlQuery({ page: nextPage });
                  }}
                >
                  Previous
                </Button>

                <div className="flex items-center gap-2">
                  {pageNumbers.map((p, idx) => {
                    const prev = idx > 0 ? pageNumbers[idx - 1] : null;
                    const showEllipsis = prev != null && p - prev > 1;

                    return (
                      <div key={p} className="flex items-center gap-2">
                        {showEllipsis && <span className="px-1 text-muted-foreground">…</span>}
                        <Button
                          variant={p === page ? "default" : "outline"}
                          onClick={() => {
                            setPage(p);
                            updateUrlQuery({ page: p });
                          }}
                        >
                          {p}
                        </Button>
                      </div>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => {
                    const nextPage = Math.min(totalPages, page + 1);
                    setPage(nextPage);
                    updateUrlQuery({ page: nextPage });
                  }}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
