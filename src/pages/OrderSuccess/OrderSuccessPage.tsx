import { Link } from "react-router-dom";
import { CheckCircle, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OrderSuccessPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-500">
        <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
      </div>
      
      <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
        Order Placed <span className="gradient-text">Successfully!</span>
      </h1>
      
      <p className="text-muted-foreground max-w-md mb-10 text-lg">
        Thank you for your purchase. Your order has been received and is being processed. 
        You will receive a confirmation email shortly.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <Link to="/dashboard" className="flex-1">
          <Button className="w-full btn-primary gap-2 py-6">
            View Orders
            <ShoppingBag className="w-4 h-4" />
          </Button>
        </Link>
        <Link to="/shop" className="flex-1">
          <Button variant="outline" className="w-full gap-2 py-6">
            Continue Shopping
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
