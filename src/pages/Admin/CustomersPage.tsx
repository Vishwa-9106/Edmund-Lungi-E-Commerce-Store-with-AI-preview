import { useEffect, useRef, useState } from "react";
import { supabase } from "@/supabase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type UserRow = {
  id: string;
  name: string | null;
  email: string | null;
  mobile: string | null;
  addresses: unknown;
  no_of_orders: number | null;
};

export default function CustomersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const didFetchRef = useRef(false);

  useEffect(() => {
    let alive = true;
    if (didFetchRef.current) return;
    didFetchRef.current = true;

    setLoading(true);

    (async () => {
      try {
        if (!alive) return;

        const { data, error } = await supabase
          .from("users")
          .select("id, name, email, mobile, addresses, no_of_orders")
          .neq("role", "admin");

        if (!alive) return;
        if (error) {
          setUsers([]);
          return;
        }

        const rows = Array.isArray(data) ? (data as UserRow[]) : [];
        setUsers(rows);
      } catch {
        if (!alive) return;
        setUsers([]);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const formatAddress = (addresses: unknown): string => {
    if (!addresses) return "";
    if (Array.isArray(addresses) && addresses.length > 0) {
      const addr = addresses[0];
      if (typeof addr === "object" && addr !== null) {
        const parts: string[] = [];
        const a = addr as Record<string, unknown>;
        if (a.street) parts.push(String(a.street));
        if (a.city) parts.push(String(a.city));
        if (a.state) parts.push(String(a.state));
        if (a.zip) parts.push(String(a.zip));
        if (a.country) parts.push(String(a.country));
        return parts.join(", ");
      }
      return String(addr);
    }
    if (typeof addresses === "object" && addresses !== null) {
      const a = addresses as Record<string, unknown>;
      const parts: string[] = [];
      if (a.street) parts.push(String(a.street));
      if (a.city) parts.push(String(a.city));
      if (a.state) parts.push(String(a.state));
      if (a.zip) parts.push(String(a.zip));
      if (a.country) parts.push(String(a.country));
      return parts.join(", ");
    }
    return String(addresses);
  };

  return (
    <div className="min-h-screen overflow-x-hidden">
      <div className="container mx-auto px-4 py-6">
        <div className="bg-card rounded-2xl shadow-lg">
          <div className="p-4">
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : users.length === 0 ? (
              <div className="text-sm text-muted-foreground">No customers found</div>
            ) : (
              <>
                <div className="grid gap-3 md:hidden">
                  {users.map((u) => (
                    <div key={u.id} className="rounded-xl border bg-background p-4 shadow-sm">
                      <div className="font-medium truncate">{u.name ?? ""}</div>
                      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                        <div className="min-w-0">
                          <div className="text-muted-foreground">Email</div>
                          <div className="truncate">{u.email ?? ""}</div>
                        </div>
                        <div className="min-w-0">
                          <div className="text-muted-foreground">Phone</div>
                          <div className="truncate">{u.mobile ?? ""}</div>
                        </div>
                        <div className="min-w-0 col-span-2">
                          <div className="text-muted-foreground">Address</div>
                          <div className="truncate">{formatAddress(u.addresses)}</div>
                        </div>
                        <div className="min-w-0">
                          <div className="text-muted-foreground">No. of Orders</div>
                          <div className="truncate">{u.no_of_orders ?? 0}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="hidden md:block">
                  <div className="w-full overflow-x-auto overscroll-x-contain [scrollbar-gutter:stable]">
                    <div className="min-w-max">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="p-2 lg:p-4">Name</TableHead>
                            <TableHead className="p-2 lg:p-4">Email</TableHead>
                            <TableHead className="p-2 lg:p-4">Phone</TableHead>
                            <TableHead className="p-2 lg:p-4">Address</TableHead>
                            <TableHead className="p-2 lg:p-4">No. of Orders</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users.map((u) => (
                            <TableRow key={u.id}>
                              <TableCell className="max-w-[220px] truncate p-2 lg:p-4">{u.name ?? ""}</TableCell>
                              <TableCell className="max-w-[220px] truncate p-2 lg:p-4">{u.email ?? ""}</TableCell>
                              <TableCell className="p-2 lg:p-4">{u.mobile ?? ""}</TableCell>
                              <TableCell className="max-w-[320px] truncate p-2 lg:p-4">{formatAddress(u.addresses)}</TableCell>
                              <TableCell className="p-2 lg:p-4">{u.no_of_orders ?? 0}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
