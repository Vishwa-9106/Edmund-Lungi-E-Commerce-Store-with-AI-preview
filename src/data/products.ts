export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  category: string;
  color: string;
  material: string;
  sizes: string[];
  rating: number;
  reviews: number;
  images: string[];
  featured?: boolean;
  bestseller?: boolean;
}

export const products: Product[] = [
  {
    id: "1",
    name: "Royal Silk Lungi",
    price: 2499,
    originalPrice: 2999,
    description: "Premium handwoven silk lungi with intricate gold thread border. Perfect for special occasions and festivities.",
    category: "Silk",
    color: "Maroon",
    material: "Pure Silk",
    sizes: ["Free Size", "Large", "Extra Large"],
    rating: 4.8,
    reviews: 124,
    images: ["/placeholder.svg"],
    featured: true,
    bestseller: true,
  },
  {
    id: "2",
    name: "Classic Cotton Comfort",
    price: 799,
    description: "Breathable cotton lungi for everyday comfort. Soft texture and durable stitching.",
    category: "Cotton",
    color: "Blue",
    material: "100% Cotton",
    sizes: ["Free Size", "Large"],
    rating: 4.5,
    reviews: 89,
    images: ["/placeholder.svg"],
    featured: true,
  },
  {
    id: "3",
    name: "Heritage Zari Border",
    price: 3499,
    originalPrice: 3999,
    description: "Traditional lungi with authentic zari border work. A masterpiece of craftsmanship.",
    category: "Silk",
    color: "Gold",
    material: "Silk Blend",
    sizes: ["Free Size", "Large", "Extra Large"],
    rating: 4.9,
    reviews: 67,
    images: ["/placeholder.svg"],
    featured: true,
    bestseller: true,
  },
  {
    id: "4",
    name: "Summer Breeze Lungi",
    price: 599,
    description: "Lightweight cotton lungi perfect for hot summer days. Quick-dry fabric.",
    category: "Cotton",
    color: "White",
    material: "Cotton",
    sizes: ["Free Size"],
    rating: 4.3,
    reviews: 156,
    images: ["/placeholder.svg"],
  },
  {
    id: "5",
    name: "Festive Collection",
    price: 1899,
    originalPrice: 2299,
    description: "Vibrant colors and premium finish for celebrations. Stand out in any gathering.",
    category: "Premium",
    color: "Green",
    material: "Silk Cotton",
    sizes: ["Free Size", "Large"],
    rating: 4.6,
    reviews: 98,
    images: ["/placeholder.svg"],
    featured: true,
  },
  {
    id: "6",
    name: "Everyday Essential",
    price: 449,
    description: "Your daily companion for ultimate comfort. Soft, durable, and affordable.",
    category: "Cotton",
    color: "Navy",
    material: "Cotton",
    sizes: ["Free Size", "Large", "Extra Large"],
    rating: 4.4,
    reviews: 234,
    images: ["/placeholder.svg"],
  },
  {
    id: "7",
    name: "Designer Print Lungi",
    price: 1299,
    description: "Contemporary designs meet traditional comfort. Modern patterns for the style-conscious.",
    category: "Designer",
    color: "Multi",
    material: "Cotton Blend",
    sizes: ["Free Size", "Large"],
    rating: 4.7,
    reviews: 78,
    images: ["/placeholder.svg"],
  },
  {
    id: "8",
    name: "Temple Collection",
    price: 4999,
    originalPrice: 5999,
    description: "Sacred designs inspired by temple architecture. Perfect for religious ceremonies.",
    category: "Silk",
    color: "Cream",
    material: "Pure Silk",
    sizes: ["Free Size", "Large", "Extra Large"],
    rating: 5.0,
    reviews: 45,
    images: ["/placeholder.svg"],
    bestseller: true,
  },
];

export const categories = [
  { id: "silk", name: "Silk Collection", count: 24, image: "/placeholder.svg" },
  { id: "cotton", name: "Cotton Comfort", count: 48, image: "/placeholder.svg" },
  { id: "premium", name: "Premium Range", count: 12, image: "/placeholder.svg" },
  { id: "designer", name: "Designer Prints", count: 18, image: "/placeholder.svg" },
];

export const testimonials = [
  {
    id: "1",
    name: "Rajesh Kumar",
    location: "Chennai",
    rating: 5,
    comment: "The quality of Edmund Lungi's is unmatched. I've been a customer for 3 years now and every purchase has been exceptional.",
    avatar: "/placeholder.svg",
  },
  {
    id: "2",
    name: "Mohammed Ali",
    location: "Kerala",
    rating: 5,
    comment: "Best lungis I've ever owned. The silk collection is absolutely premium and worth every penny.",
    avatar: "/placeholder.svg",
  },
  {
    id: "3",
    name: "Suresh Menon",
    location: "Karnataka",
    rating: 4,
    comment: "Great variety and fast delivery. The cotton lungis are perfect for daily wear. Highly recommend!",
    avatar: "/placeholder.svg",
  },
];
