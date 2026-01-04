import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Star, Truck, Shield, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import homeHeader from "./home header.png";
import supabase from "@/supabase";

export default function HomePage() {
  const categoryImages: Record<string, string> = {
    "Lungi": "https://xbvetfrhcvuxjvmooyvk.supabase.co/storage/v1/object/public/products/home%20page/lungi.png",
    "Dhoti": "https://xbvetfrhcvuxjvmooyvk.supabase.co/storage/v1/object/public/products/home%20page/Dhoti.png",
    "Cotton": "https://xbvetfrhcvuxjvmooyvk.supabase.co/storage/v1/object/public/products/home%20page/Cotton.png",
    "Pure Cotton": "https://xbvetfrhcvuxjvmooyvk.supabase.co/storage/v1/object/public/products/home%20page/Cotton_1.png",
  };

  const [topGroups, setTopGroups] = useState<
    Array<{
      key: string;
      name: string;
      type: "category" | "material";
      count: number;
    }>
  >([]);
  const [loadingTopGroups, setLoadingTopGroups] = useState(true);

  useEffect(() => {
    let alive = true;
    const fetchTopGroups = async () => {
      setLoadingTopGroups(true);
      try {
        const { data, error } = await supabase
          .from("products")
          .select("category,material")
          .eq("is_active", true);

        if (!alive) return;
        if (error) {
          setTopGroups([]);
          return;
        }

        const categoryCounts = new Map<string, number>();
        const materialCounts = new Map<string, number>();

        const rows = Array.isArray(data) ? data : [];
        for (const row of rows as any[]) {
          const rawCategory = row?.category;
          const rawMaterial = row?.material;

          const category = typeof rawCategory === "string" ? rawCategory.trim() : "";
          const material = typeof rawMaterial === "string" ? rawMaterial.trim() : "";

          if (category.length > 0) {
            categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1);
          }
          if (material.length > 0) {
            materialCounts.set(material, (materialCounts.get(material) ?? 0) + 1);
          }
        }

        const combined: Array<{ key: string; name: string; type: "category" | "material"; count: number }> = [];
        for (const [name, count] of categoryCounts.entries()) {
          combined.push({ key: `category:${name}`, name, type: "category", count });
        }
        for (const [name, count] of materialCounts.entries()) {
          combined.push({ key: `material:${name}`, name, type: "material", count });
        }

        combined.sort((a, b) => b.count - a.count);
        setTopGroups(combined.slice(0, 4));
      } catch {
        if (!alive) return;
        setTopGroups([]);
      } finally {
        if (!alive) return;
        setLoadingTopGroups(false);
      }
    };

    fetchTopGroups();

    return () => {
      alive = false;
    };
  }, []);

  const renderedTopGroups = useMemo(() => {
    return topGroups;
  }, [topGroups]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-hero overflow-hidden">
        <div className="container mx-auto px-4 py-16 md:py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                Premium Quality Since 1985
              </span>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Comfort <span className="gradient-text">Starts Here</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg">
                Discover our exquisite collection of handcrafted lungis. 
                Where traditional craftsmanship meets modern comfort.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/shop">
                  <Button size="lg" className="btn-hero gap-2 w-full sm:w-auto">
                    Shop Collection
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/about">
                  <Button size="lg" variant="outline" className="btn-outline w-full sm:w-auto">
                    Our Story
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative animate-fade-in stagger-2">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 overflow-hidden">
                <img
                  src={homeHeader}
                  alt="Premium Lungi Collection"
                  className="w-full h-full object-cover animate-float"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-card rounded-2xl p-4 shadow-lg animate-scale-in stagger-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Star className="w-6 h-6 text-primary fill-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-lg">4.9/5</p>
                    <p className="text-sm text-muted-foreground">10k+ Reviews</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Truck, title: "Free Shipping", desc: "On orders above ₹999" },
              { icon: Shield, title: "Quality Assured", desc: "Handpicked fabrics" },
              { icon: RefreshCw, title: "Easy Returns", desc: "7-day return policy" },
              { icon: Star, title: "Premium Quality", desc: "Crafted with care" },
            ].map((feature, i) => (
              <div
                key={feature.title}
                className="flex flex-col items-center text-center p-4 animate-fade-in"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <feature.icon className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-semibold text-sm">{feature.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="section-title">Shop by Category</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              Explore our diverse range of premium lungis crafted for every occasion
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {!loadingTopGroups &&
              renderedTopGroups.map((item, i) => (
                <Link
                  key={item.key}
                  to={item.type === "category" ? `/shop?category=${encodeURIComponent(item.name)}` : `/shop?material=${encodeURIComponent(item.name)}`}
                  className="group relative overflow-hidden rounded-2xl aspect-[4/5] animate-fade-in"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <img
                    src={categoryImages[item.name] ?? "/placeholder.svg"}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                    <h3 className="font-display text-lg md:text-xl font-semibold text-cream">
                      {item.name}
                    </h3>
                    <p className="text-cream/70 text-sm mt-1">
                      {item.count} Products
                    </p>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-charcoal">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-cream mb-4">
            Ready to Experience Premium Comfort?
          </h2>
          <p className="text-cream/70 max-w-xl mx-auto mb-8">
            Join thousands of satisfied customers who have discovered the Edmund Lungi's difference.
          </p>
          <Link to="/shop">
            <Button size="lg" className="btn-hero gap-2">
              Shop Now
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
