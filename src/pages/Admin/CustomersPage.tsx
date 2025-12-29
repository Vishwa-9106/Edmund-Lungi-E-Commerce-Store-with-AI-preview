import { useEffect, useRef, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/supabase";

type CustomerRow = {
  id: string;
  email?: string | null;
  created_at?: string | null;
  name?: string | null;
  mobile?: string | null;
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
        const { data, error } = await supabase
          .from("users")
          .select("id,name,email,mobile,created_at")
          .eq("role", "user");

        if (!alive) return;

        if (error) {
          setError(null);
          setCustomers([]);
          return;
        }

        const rows = Array.isArray(data) ? (data as CustomerRow[]) : [];
        setError(null);
        setCustomers(rows);
      } catch (e: any) {
        if (!alive) return;
        setError(null);
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
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6">
        <div className="bg-card rounded-2xl shadow-lg">
          <div className="p-4">
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : customers.length === 0 ? (
              <div className="text-sm text-muted-foreground">No customers found</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>Created At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="max-w-[220px] truncate">{c.id}</TableCell>
                      <TableCell className="max-w-[260px] truncate">{c.email ?? ""}</TableCell>
                      <TableCell className="max-w-[220px] truncate">{c.name ?? ""}</TableCell>
                      <TableCell className="max-w-[180px] truncate">{c.mobile ?? ""}</TableCell>
                      <TableCell className="max-w-[220px] truncate">{c.created_at ?? ""}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
