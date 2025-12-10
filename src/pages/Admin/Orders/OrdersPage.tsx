import { useState } from "react";
import { Search, Eye } from "lucide-react";
import { recentOrders } from "@/data/salesData";

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const statuses = ["All", "Pending", "Processing", "Shipped", "Delivered"];

  const filteredOrders = recentOrders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.product.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-muted-foreground">Manage and track customer orders</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field w-full pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === status
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary hover:bg-secondary/80"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Order ID
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Product
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-4 font-medium">{order.id}</td>
                  <td className="px-4 py-4">{order.customer}</td>
                  <td className="px-4 py-4 text-muted-foreground">{order.product}</td>
                  <td className="px-4 py-4 font-medium">₹{order.amount.toLocaleString()}</td>
                  <td className="px-4 py-4 text-muted-foreground">{order.date}</td>
                  <td className="px-4 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.status === "Delivered"
                          ? "bg-sage/20 text-sage"
                          : order.status === "Shipped"
                          ? "bg-primary/20 text-primary"
                          : order.status === "Processing"
                          ? "bg-amber/20 text-amber"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
