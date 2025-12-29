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

type UserRow = {
  id: string;
  name: string | null;
  email: string | null;
  mobile: string | null;
  role: string | null;
  created_at: string | null;
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
          const { data, error } = await supabase
            .from("users")
            .select("id, name, email, mobile, role, created_at")
            .eq("role", "user");

          if (!alive) return;

        if (error) {
          setUsers([]);
          return;
        }

        const rows = Array.isArray(data) ? (data as UserRow[]) : [];
        setUsers(rows);
      } catch (e: any) {
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

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6">
        <div className="bg-card rounded-2xl shadow-lg">
          <div className="p-4">
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
              ) : users.length === 0 ? (
                <div className="text-sm text-muted-foreground">No customers found</div>
              ) : (
              <div className="w-full overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Mobile</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Created At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="max-w-[200px] truncate">
                          {u.name ?? ""}
                        </TableCell>
                        <TableCell className="max-w-[250px] truncate">
                          {u.email ?? ""}
                        </TableCell>
                        <TableCell className="max-w-[150px] truncate">
                          {u.mobile ?? ""}
                        </TableCell>
                        <TableCell className="max-w-[100px] truncate">
                          {u.role ?? ""}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {u.created_at ?? ""}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
