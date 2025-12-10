import { DollarSign, ShoppingBag, Users, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { ChartCard } from "@/components/ChartCard";
import { kpiData, dailySalesData, recentOrders } from "@/data/salesData";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AdminDashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Dashboard Overview</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={`₹${(kpiData.totalRevenue / 100000).toFixed(1)}L`}
          change={kpiData.revenueGrowth}
          icon={DollarSign}
        />
        <StatCard
          title="Orders Today"
          value={kpiData.ordersToday}
          change={kpiData.orderGrowth}
          icon={ShoppingBag}
        />
        <StatCard
          title="Top Product"
          value={kpiData.topProduct}
          icon={TrendingUp}
        />
        <StatCard
          title="Total Customers"
          value={kpiData.totalCustomers.toLocaleString()}
          icon={Users}
        />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <ChartCard title="Weekly Sales" subtitle="Sales performance this week">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailySalesData}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(24, 80%, 50%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(24, 80%, 50%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(35, 20%, 88%)" />
                <XAxis dataKey="day" stroke="hsl(20, 10%, 45%)" fontSize={12} />
                <YAxis stroke="hsl(20, 10%, 45%)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(0, 0%, 100%)",
                    border: "1px solid hsl(35, 20%, 88%)",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="hsl(24, 80%, 50%)"
                  strokeWidth={2}
                  fill="url(#salesGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Recent Orders */}
        <ChartCard title="Recent Orders" subtitle="Latest orders placed">
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {recentOrders.slice(0, 5).map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-sm">{order.customer}</p>
                  <p className="text-xs text-muted-foreground">{order.product}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm">₹{order.amount}</p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
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
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
