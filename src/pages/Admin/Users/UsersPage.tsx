import { useState } from "react";
import { Search, Mail, User } from "lucide-react";
import { customers } from "@/data/salesData";

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-muted-foreground">Manage customer accounts</p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-field w-full pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">Total Users</p>
          <p className="text-2xl font-bold">{customers.length}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">Total Orders</p>
          <p className="text-2xl font-bold">
            {customers.reduce((sum, c) => sum + c.orders, 0)}
          </p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">Avg. Order Value</p>
          <p className="text-2xl font-bold">
            ₹{Math.round(
              customers.reduce((sum, c) => sum + c.totalSpent, 0) /
                customers.reduce((sum, c) => sum + c.orders, 0)
            ).toLocaleString()}
          </p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">Total Revenue</p>
          <p className="text-2xl font-bold">
            ₹{(customers.reduce((sum, c) => sum + c.totalSpent, 0) / 1000).toFixed(0)}K
          </p>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((customer) => (
          <div
            key={customer.id}
            className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{customer.name}</h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Mail className="w-3 h-3" />
                  {customer.email}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
              <div>
                <p className="text-xs text-muted-foreground">Orders</p>
                <p className="font-semibold">{customer.orders}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Spent</p>
                <p className="font-semibold">₹{(customer.totalSpent / 1000).toFixed(1)}K</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Joined</p>
                <p className="font-semibold text-xs">{customer.joinDate}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
