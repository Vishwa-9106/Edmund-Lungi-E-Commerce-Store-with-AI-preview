import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/supabase";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type OrderStatus = "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";

type OrderRow = {
  id: string;
  user_id: string;
  order_number: string;
  status: string | null;
  total: number | string | null;
  currency: string | null;
  items: unknown;
  created_at: string;
};

type UserEmailById = Record<string, string>;

const ALL_STATUSES: OrderStatus[] = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

function normalizeStatus(status: string | null | undefined): OrderStatus {
  if (!status) return "Pending";
  const normalized = status.trim().toLowerCase();
  const match = ALL_STATUSES.find((s) => s.toLowerCase() === normalized);
  return match ?? "Pending";
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

function formatMoney(total: number | string | null, currency: string | null) {
  const n = typeof total === "string" ? Number(total) : total;
  if (typeof n !== "number" || Number.isNaN(n)) return "-";
  if (!currency) return n.toFixed(2);
  return `${n.toFixed(2)}`;
}

function statusBadgeVariant(status: OrderStatus): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "Delivered":
      return "default";
    case "Shipped":
      return "secondary";
    case "Processing":
      return "outline";
    case "Cancelled":
      return "destructive";
    case "Pending":
    default:
      return "outline";
  }
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingOrderIds, setUpdatingOrderIds] = useState<Set<string>>(new Set());
  const [userEmails, setUserEmails] = useState<UserEmailById>({});

  const userIds = useMemo(() => {
    const ids = new Set<string>();
    for (const o of orders) {
      if (o.user_id) ids.add(o.user_id);
    }
    return Array.from(ids);
  }, [orders]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from("orders")
          .select("id, user_id, order_number, status, total, currency, items, created_at")
          .order("created_at", { ascending: false });

        if (!alive) return;
        if (fetchError) {
          setOrders([]);
          setError(fetchError.message || "Failed to load orders");
          return;
        }

        const rows = Array.isArray(data) ? (data as OrderRow[]) : [];
        setOrders(rows);
      } catch (e: any) {
        if (!alive) return;
        setOrders([]);
        setError(e?.message || "Failed to load orders");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    if (userIds.length === 0) return;

    (async () => {
      try {
        const { data, error: usersError } = await supabase
          .from("users")
          .select("id, email")
          .in("id", userIds);

        if (!alive) return;
        if (usersError) return;

        const map: UserEmailById = {};
        for (const row of Array.isArray(data) ? (data as any[]) : []) {
          if (row?.id && row?.email) map[String(row.id)] = String(row.email);
        }
        setUserEmails((prev) => ({ ...prev, ...map }));
      } catch {
        // Intentionally ignore; we can fall back to user_id.
      }
    })();

    return () => {
      alive = false;
    };
  }, [userIds]);

  const handleStatusChange = async (orderId: string, next: OrderStatus) => {
    if (updatingOrderIds.has(orderId)) return;

    const prev = orders.find((o) => o.id === orderId);
    const prevStatus = normalizeStatus(prev?.status);

    setUpdatingOrderIds((s) => new Set(s).add(orderId));
    setOrders((curr) => curr.map((o) => (o.id === orderId ? { ...o, status: next } : o)));

    try {
      const { error: updateError } = await supabase
        .from("orders")
        .update({ status: next })
        .eq("id", orderId);

      if (updateError) {
        setOrders((curr) => curr.map((o) => (o.id === orderId ? { ...o, status: prevStatus } : o)));
        toast({ title: "Update failed", description: updateError.message || "Could not update order status" });
        return;
      }
    } catch (e: any) {
      setOrders((curr) => curr.map((o) => (o.id === orderId ? { ...o, status: prevStatus } : o)));
      toast({ title: "Update failed", description: e?.message || "Could not update order status" });
      return;
    } finally {
      setUpdatingOrderIds((s) => {
        const nextSet = new Set(s);
        nextSet.delete(orderId);
        return nextSet;
      });
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
        <p className="text-sm text-muted-foreground">View and manage all customer orders.</p>
      </div>

      {loading ? (
        <div className="min-h-[240px] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="rounded-md border border-border bg-background p-4">
          <div className="text-sm font-medium">Failed to load orders</div>
          <div className="text-sm text-muted-foreground">{error}</div>
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-md border border-border bg-background p-8 text-center">
          <div className="text-sm font-medium">No orders found</div>
          <div className="text-sm text-muted-foreground">Orders will appear here once customers place them.</div>
        </div>
      ) : (
        <div className="rounded-md border border-border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order Number</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Items</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const status = normalizeStatus(order.status);
                const updating = updatingOrderIds.has(order.id);
                const userLabel = userEmails[order.user_id] || order.user_id;

                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.order_number || "-"}</TableCell>
                    <TableCell className="max-w-[260px] truncate" title={userLabel}>
                      {userLabel}
                    </TableCell>
                    <TableCell>{formatMoney(order.total, order.currency)}</TableCell>
                    <TableCell>{order.currency || "-"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={statusBadgeVariant(status)}>{status}</Badge>
                        <div className="w-[190px]">
                          <Select
                            value={status}
                            onValueChange={(v) => handleStatusChange(order.id, v as OrderStatus)}
                            disabled={updating}
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              {ALL_STATUSES.map((s) => (
                                <SelectItem key={s} value={s}>
                                  {s}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{formatDateTime(order.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button type="button" variant="outline" size="sm">
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle>Order Items</DialogTitle>
                            <DialogDescription>Order #{order.order_number || order.id}</DialogDescription>
                          </DialogHeader>
                          <pre className="max-h-[60vh] overflow-auto rounded-md bg-muted p-4 text-xs">
                            {JSON.stringify(order.items ?? null, null, 2)}
                          </pre>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
