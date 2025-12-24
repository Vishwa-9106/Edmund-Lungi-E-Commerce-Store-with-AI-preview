import { useEffect, useRef, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

console.log("[AdminCustomers] Module loaded (CustomersPage)");

type CustomerRow = {
  id: string;
  email?: string | null;
  role?: string | null;
  created_at?: string | null;
  name?: string | null;
  mobile?: string | null;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const didFetchRef = useRef(false);

  const normalizedRole = (role: string | null | undefined) => (role ?? "").trim().toLowerCase();

  useEffect(() => {
    let alive = true;
    if (didFetchRef.current) return;
    didFetchRef.current = true;

    setLoading(true);
    setError(null);

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
    if (!supabaseUrl || !supabaseAnonKey) {
      const msg = "Supabase env vars missing: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY";
      console.error(msg);
      setError(msg);
      setCustomers([]);
      setLoading(false);
      console.log("[AdminCustomers] Loading stopped (missing env)");
      return;
    }

    let origin = supabaseUrl;
    try {
      origin = new URL(supabaseUrl).origin;
    } catch {
      // ignore
    }

    const startedAt = Date.now();
    console.log("[AdminCustomers] Fetch start", { at: new Date(startedAt).toISOString(), origin });

    (async () => {
      console.log("[AdminCustomers] REST request start", { at: new Date().toISOString() });
      try {
        const url = `${origin}/rest/v1/users?select=*`;
        const res = await fetch(url, {
          headers: {
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${supabaseAnonKey}`,
          },
        });

        const endedAt = Date.now();
        console.log("[AdminCustomers] REST response", {
          at: new Date(endedAt).toISOString(),
          ms: endedAt - startedAt,
          status: res.status,
          ok: res.ok,
        });

        if (!alive) return;

        if (!res.ok) {
          const body = await res.text().catch(() => "");
          console.error("[AdminCustomers] REST error body:", body);
          setError(body || `Request failed (${res.status})`);
          setCustomers([]);
          return;
        }

        const data = (await res.json()) as unknown;
        const rows = Array.isArray(data) ? (data as CustomerRow[]) : [];
        setCustomers(rows);
      } catch (e: any) {
        if (!alive) return;
        console.error("[AdminCustomers] REST fetch failed:", e);
        setError(e?.message || "Failed to load customers");
        setCustomers([]);
      } finally {
        console.log("[AdminCustomers] REST finally", { at: new Date().toISOString() });
        if (!alive) return;
        setLoading(false);
        console.log("[AdminCustomers] Loading stopped");
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
            ) : error ? (
              <div className="text-sm text-destructive">{error}</div>
            ) : customers.length === 0 ? (
              <div className="text-sm text-muted-foreground">No customers found</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>Created At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(() => {
                    const groups = customers.reduce<Record<string, CustomerRow[]>>((acc, c) => {
                      const key = normalizedRole(c.role) || "unknown";
                      (acc[key] ??= []).push(c);
                      return acc;
                    }, {});

                    const roles = Object.keys(groups);
                    roles.sort((a, b) => {
                      const rank = (r: string) => (r === "admin" ? 0 : r === "user" ? 1 : 2);
                      const ra = rank(a);
                      const rb = rank(b);
                      return ra !== rb ? ra - rb : a.localeCompare(b);
                    });

                    const roleLabel = (r: string) =>
                      r === "admin" ? "Admin" : r === "user" ? "User" : r === "unknown" ? "Unknown" : r;

                    return roles.flatMap((roleKey) => {
                      const rows = groups[roleKey] ?? [];
                      if (rows.length === 0) return [];

                      return [
                        <TableRow key={`role-${roleKey}`}>
                          <TableCell colSpan={6}>{roleLabel(roleKey)}</TableCell>
                        </TableRow>,
                        ...rows.map((c) => (
                          <TableRow key={c.id}>
                            <TableCell className="max-w-[220px] truncate">{c.id}</TableCell>
                            <TableCell className="max-w-[260px] truncate">{c.email ?? ""}</TableCell>
                            <TableCell>{c.role ?? ""}</TableCell>
                            <TableCell className="max-w-[220px] truncate">{c.name ?? ""}</TableCell>
                            <TableCell className="max-w-[180px] truncate">{c.mobile ?? ""}</TableCell>
                            <TableCell className="max-w-[220px] truncate">{c.created_at ?? ""}</TableCell>
                          </TableRow>
                        )),
                      ];
                    });
                  })()}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
