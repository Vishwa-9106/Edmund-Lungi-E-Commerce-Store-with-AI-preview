import { Outlet, Link, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  BarChart3,
  Users,
  Settings,
  Menu,
  X,
  LogOut,
  Bell,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const sidebarLinks = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Sales Analysis", href: "/admin/sales", icon: BarChart3 },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-sidebar transform transition-transform duration-300 lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-sidebar-border">
            <Link to="/" className="flex items-center gap-2">
              <span className="font-display text-xl font-semibold text-sidebar-primary">
                Edmund Lungi's
              </span>
            </Link>
            <p className="text-xs text-sidebar-foreground/60 mt-1">Admin Dashboard</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {sidebarLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className={cn(
                    "sidebar-item",
                    isActive && "sidebar-item-active"
                  )}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <link.icon className="w-5 h-5" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User & Logout */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-sidebar-primary flex items-center justify-center">
                <span className="text-sidebar-primary-foreground font-semibold">
                  {user?.name?.charAt(0) || "A"}
                </span>
              </div>
              <div>
                <p className="font-medium text-sidebar-foreground text-sm">{user?.name || "Admin"}</p>
                <p className="text-xs text-sidebar-foreground/60">{user?.email || "admin@email.com"}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={logout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="flex items-center justify-between px-4 md:px-6 h-16">
            <button
              className="lg:hidden p-2 hover:bg-secondary rounded-lg transition-colors"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="hidden lg:block">
              <h1 className="font-semibold text-lg">
                {sidebarLinks.find((l) => l.href === location.pathname)?.name || "Dashboard"}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <button className="relative p-2 hover:bg-secondary rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
              </button>

              <Link to="/" className="hidden md:block">
                <Button variant="outline" size="sm">
                  View Store
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
