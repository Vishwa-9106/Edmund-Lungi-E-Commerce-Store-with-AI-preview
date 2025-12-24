import { Package, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function CustomerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/", { replace: true });
    void logout();
  };

  const orders = [
    { id: "ORD-001", product: "Royal Silk Lungi", date: "2024-01-15", status: "Delivered", amount: 2499 },
    { id: "ORD-002", product: "Classic Cotton Comfort", date: "2024-01-10", status: "Shipped", amount: 799 },
    { id: "ORD-003", product: "Heritage Zari Border", date: "2024-01-05", status: "Delivered", amount: 3499 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="bg-gradient-hero rounded-2xl p-8 mb-8">
          <h1 className="font-display text-2xl md:text-3xl font-bold mb-2">
            Welcome back, {user?.name || "Customer"}!
          </h1>
          <p className="text-muted-foreground">
            Manage your orders and profile from here.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* My Orders */}
          <div className="md:col-span-2">
            <div className="card-elevated p-6">
              <div className="flex items-center gap-3 mb-6">
                <Package className="w-6 h-6 text-primary" />
                <h2 className="font-semibold text-xl">My Orders</h2>
              </div>

              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl"
                  >
                    <div>
                      <p className="font-medium">{order.product}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.id} • {order.date}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{order.amount.toLocaleString()}</p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          order.status === "Delivered"
                            ? "bg-sage/20 text-sage"
                            : "bg-amber/20 text-amber"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Profile */}
          <div className="space-y-6">
            <div className="card-elevated p-6">
              <div className="flex items-center gap-3 mb-6">
                <User className="w-6 h-6 text-primary" />
                <h2 className="font-semibold text-xl">Profile</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{user?.name || "Customer"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user?.email || "customer@email.com"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Member Since</p>
                  <p className="font-medium">January 2024</p>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
