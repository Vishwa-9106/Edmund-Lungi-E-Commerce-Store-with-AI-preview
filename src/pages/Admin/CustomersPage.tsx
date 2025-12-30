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

type CustomerRow = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  no_of_orders: number;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const didFetchRef = useRef(false);

  useEffect(() => {
    let alive = true;
    if (didFetchRef.current) return;
    didFetchRef.current = true;

    setLoading(true);
    setError(null);

    (async () => {
      try {
        if (!alive) return;

        const { data, error } = await supabase
          .from("users")
          .select("id, name, email, phone, address, no_of_orders")
          .neq("role", "admin");

        if (!alive) return;
        if (error) {
          setError(error.message || "Failed to load customers");
          setCustomers([]);
          return;
        }

        const rows = Array.isArray(data) ? (data as CustomerRow[]) : [];
        setCustomers(rows);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message || "Failed to load customers");
        setCustomers([]);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden">
      <div className="container mx-auto px-4 py-6">
        <div className="bg-card rounded-2xl shadow-lg">
          <div className="p-4">
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : (
              <>
                {error ? <div className="pb-4 text-sm text-destructive">{error}</div> : null}

                {customers.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No customers found</div>
                ) : (
                  <>
                    <div className="grid gap-3 md:hidden">
                      {customers.map((c) => (
                        <div key={c.id} className="rounded-xl border bg-background p-4 shadow-sm">
                          <div className="font-medium truncate">{c.name ?? ""}</div>
                          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                            <div className="min-w-0">
                              <div className="text-muted-foreground">Email</div>
                              <div className="truncate">{c.email ?? ""}</div>
                            </div>
                            <div className="min-w-0">
                              <div className="text-muted-foreground">Phone</div>
                              <div className="truncate">{c.phone ?? ""}</div>
                            </div>
                            <div className="min-w-0">
                              <div className="text-muted-foreground">Address</div>
                              <div className="truncate">{c.address ?? ""}</div>
                            </div>
                            <div className="min-w-0">
                              <div className="text-muted-foreground">No. of Orders</div>
                              <div className="truncate">{c.no_of_orders}</div>
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
                              {customers.map((c) => (
                                <TableRow key={c.id}>
                                  <TableCell className="max-w-[220px] truncate p-2 lg:p-4">{c.name ?? ""}</TableCell>
                                  <TableCell className="max-w-[220px] truncate p-2 lg:p-4">{c.email ?? ""}</TableCell>
                                  <TableCell className="p-2 lg:p-4">{c.phone ?? ""}</TableCell>
                                  <TableCell className="max-w-[320px] truncate p-2 lg:p-4">{c.address ?? ""}</TableCell>
                                  <TableCell className="p-2 lg:p-4">{c.no_of_orders}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
