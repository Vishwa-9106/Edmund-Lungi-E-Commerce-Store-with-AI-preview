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
  role: string | null;
  created_at: string;
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

    const fetchCustomers = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await supabase
          .from("users")
          .select("id, name, email, phone, address, no_of_orders, role, created_at")
          .neq("role", "admin");

        if (!alive) return;

        if (fetchError) {
          setError(fetchError.message || "Failed to load customers");
          return;
        }

        setCustomers(data as CustomerRow[]);
      } catch (err: any) {
        if (!alive) return;
        setError(err.message || "An unexpected error occurred");
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetchCustomers();

    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden">
      <div className="container mx-auto px-4 py-6">
        <div className="bg-card rounded-2xl shadow-lg">
          <div className="p-4">
            <h1 className="text-2xl font-bold mb-6">Customers</h1>

            {loading ? (
              <div className="text-sm text-muted-foreground py-10 text-center">Loading customers...</div>
            ) : (
              <>
                {error ? (
                  <div className="pb-4 text-sm text-destructive">{error}</div>
                ) : null}

                {customers.length === 0 ? (
                  <div className="text-sm text-muted-foreground py-10 text-center border rounded-xl">
                    No customers found
                  </div>
                ) : (
                  <>
                    {/* Mobile View */}
                    <div className="grid gap-3 md:hidden">
                      {customers.map((c) => (
                        <div key={c.id} className="rounded-xl border bg-background p-4 shadow-sm">
                          <div className="font-medium truncate">{c.name || "N/A"}</div>
                          <div className="text-sm text-muted-foreground mt-1 truncate">{c.email}</div>
                          
                          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                            <div className="min-w-0">
                              <div className="text-muted-foreground">Phone</div>
                              <div className="truncate">{c.phone || "N/A"}</div>
                            </div>
                            <div className="min-w-0">
                              <div className="text-muted-foreground">Orders</div>
                              <div>{c.no_of_orders}</div>
                            </div>
                          </div>
                          <div className="mt-2 text-sm">
                            <div className="text-muted-foreground">Address</div>
                            <div className="truncate">{c.address || "N/A"}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Desktop View */}
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
                                  <TableCell className="p-2 lg:p-4 font-medium">{c.name || "N/A"}</TableCell>
                                  <TableCell className="p-2 lg:p-4">{c.email}</TableCell>
                                  <TableCell className="p-2 lg:p-4">{c.phone || "N/A"}</TableCell>
                                  <TableCell className="p-2 lg:p-4 max-w-[300px] truncate">{c.address || "N/A"}</TableCell>
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
