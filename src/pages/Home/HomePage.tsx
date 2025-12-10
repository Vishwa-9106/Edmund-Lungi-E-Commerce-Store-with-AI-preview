import { Link } from "react-router-dom";
import { ArrowRight, Star, Truck, Shield, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { products, categories, testimonials } from "@/data/products";

export default function HomePage() {
  const featuredProducts = products.filter((p) => p.featured);

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
                  src="/placeholder.svg"
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
            {categories.map((category, i) => (
              <Link
                key={category.id}
                to={`/shop?category=${category.id}`}
                className="group relative overflow-hidden rounded-2xl aspect-[4/5] animate-fade-in"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                  <h3 className="font-display text-lg md:text-xl font-semibold text-cream">
                    {category.name}
                  </h3>
                  <p className="text-cream/70 text-sm mt-1">
                    {category.count} Products
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-4">
            <div>
              <h2 className="section-title">Featured Collection</h2>
              <p className="text-muted-foreground mt-3">
                Handpicked selections from our finest range
              </p>
            </div>
            <Link to="/shop">
              <Button variant="outline" className="btn-outline gap-2">
                View All
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {featuredProducts.slice(0, 4).map((product, i) => (
              <div
                key={product.id}
                className="animate-fade-in"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="section-title">What Our Customers Say</h2>
            <p className="text-muted-foreground mt-3">
              Trusted by thousands of happy customers
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <div
                key={testimonial.id}
                className="card-elevated p-6 animate-fade-in"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-amber fill-amber" />
                  ))}
                </div>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  "{testimonial.comment}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-secondary overflow-hidden">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                  </div>
                </div>
              </div>
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
