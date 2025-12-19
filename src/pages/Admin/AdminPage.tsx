import { useMemo, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AdminMenuItem =
  | "Dashboard"
  | "Sales Analytics"
  | "Orders"
  | "Products"
  | "Customers"
  | "Marketing";

export default function AdminPage() {
  const items = useMemo<Array<{ label: AdminMenuItem; to: string }>>(
    () => [
      { label: "Dashboard", to: "/admin/dashboard" },
      { label: "Sales Analytics", to: "/admin/sales-analytics" },
      { label: "Orders", to: "/admin/orders" },
      { label: "Products", to: "/admin/products" },
      { label: "Customers", to: "/admin/customers" },
      { label: "Marketing", to: "/admin/marketing" },
    ],
    []
  );

  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <aside
          className={cn(
            "shrink-0 border-r border-border bg-background transition-[width] duration-200",
            collapsed ? "w-16" : "w-64"
          )}
        >
          <div className="h-16 flex items-center justify-between px-3">
            <div className={cn("min-w-0", collapsed && "sr-only")}> </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed((v) => !v)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight /> : <ChevronLeft />}
            </Button>
          </div>

          <nav className="px-2 pb-4">
            <div className="flex flex-col gap-1">
              {items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  title={item.label}
                  className={({ isActive }) =>
                    cn(
                      "h-10 w-full rounded-md px-3 text-sm font-medium transition-colors",
                      "flex items-center",
                      collapsed ? "justify-center" : "justify-start",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-accent hover:text-accent-foreground"
                    )
                  }
                >
                  <span className={cn("truncate", collapsed && "sr-only")}>{item.label}</span>
                  {collapsed && <span aria-hidden className="text-sm">{item.label[0]}</span>}
                </NavLink>
              ))}
            </div>
          </nav>
        </aside>

        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
