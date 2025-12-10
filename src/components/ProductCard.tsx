import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { Product } from "@/data/products";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Link to={`/product/${product.id}`} className="card-product block">
      <div className="relative overflow-hidden aspect-square bg-secondary">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {product.bestseller && (
          <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
            Bestseller
          </span>
        )}
        {discount > 0 && (
          <span className="absolute top-3 right-3 bg-destructive text-destructive-foreground text-xs font-semibold px-3 py-1 rounded-full">
            -{discount}%
          </span>
        )}
      </div>

      <div className="p-4 space-y-2">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">
          {product.category}
        </p>
        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
          {product.name}
        </h3>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-amber text-amber" />
            <span className="text-sm font-medium">{product.rating}</span>
          </div>
          <span className="text-sm text-muted-foreground">
            ({product.reviews} reviews)
          </span>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <span className="text-lg font-bold text-primary">₹{product.price.toLocaleString()}</span>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              ₹{product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
