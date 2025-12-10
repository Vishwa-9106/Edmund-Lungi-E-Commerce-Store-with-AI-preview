import { ChartCard } from "@/components/ChartCard";
import { StatCard } from "@/components/StatCard";
import { DollarSign, ShoppingBag, TrendingUp, Users } from "lucide-react";
import {
  dailySalesData,
  monthlySalesData,
  productRevenueData,
  bestSellingProducts,
  kpiData,
} from "@/data/salesData";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

const COLORS = ["hsl(24, 80%, 50%)", "hsl(40, 90%, 55%)", "hsl(150, 20%, 50%)", "hsl(20, 20%, 40%)"];

export default function SalesAnalysisPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Sales Analysis</h1>
        <p className="text-muted-foreground">Detailed insights into your sales performance</p>
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

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Daily Sales Chart */}
        <ChartCard title="Daily Sales" subtitle="Sales trend for this week">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailySalesData}>
                <defs>
                  <linearGradient id="dailyGradient" x1="0" y1="0" x2="0" y2="1">
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
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, "Sales"]}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="hsl(24, 80%, 50%)"
                  strokeWidth={2}
                  fill="url(#dailyGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Monthly Sales Chart */}
        <ChartCard title="Monthly Revenue" subtitle="Revenue trend for this year">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlySalesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(35, 20%, 88%)" />
                <XAxis dataKey="month" stroke="hsl(20, 10%, 45%)" fontSize={12} />
                <YAxis stroke="hsl(20, 10%, 45%)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(0, 0%, 100%)",
                    border: "1px solid hsl(35, 20%, 88%)",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [`₹${(value / 1000).toFixed(0)}K`, "Revenue"]}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(24, 80%, 50%)"
                  strokeWidth={2}
                  dot={{ fill: "hsl(24, 80%, 50%)", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Product Revenue Distribution (Pie Chart) */}
        <ChartCard title="Revenue by Category" subtitle="Distribution of revenue across categories">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={productRevenueData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {productRevenueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${value}%`, "Share"]}
                  contentStyle={{
                    backgroundColor: "hsl(0, 0%, 100%)",
                    border: "1px solid hsl(35, 20%, 88%)",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {productRevenueData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index] }}
                />
                <span className="text-sm text-muted-foreground">{item.name}</span>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Best Selling Products (Bar Chart) */}
        <ChartCard title="Best Selling Products" subtitle="Top products by sales volume">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bestSellingProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(35, 20%, 88%)" />
                <XAxis type="number" stroke="hsl(20, 10%, 45%)" fontSize={12} />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="hsl(20, 10%, 45%)"
                  fontSize={11}
                  width={100}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(0, 0%, 100%)",
                    border: "1px solid hsl(35, 20%, 88%)",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [value.toLocaleString(), "Units Sold"]}
                />
                <Bar dataKey="sales" fill="hsl(24, 80%, 50%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
