import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users } from "lucide-react";
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
  mobile: string | null;
  no_of_orders: number | null;
  created_at: string;
  role?: string | null;
};

type WhatsappCustomerRow = {
  id: string;
  name: string | null;
  email: string | null;
  mobile: string;
  addresses: unknown;
  wishlist: unknown;
  total_orders: number | null;
  created_at: string;
};

type LooseRow = Record<string, unknown>;

const PAGE_SIZE = 10;

function formatDateTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

function getJsonCount(value: unknown) {
  if (Array.isArray(value)) return value.length;
  if (value && typeof value === "object") return Object.keys(value as Record<string, unknown>).length;
  return 0;
}

function paginate<T>(rows: T[], page: number) {
  const start = (page - 1) * PAGE_SIZE;
  return rows.slice(start, start + PAGE_SIZE);
}

function stringValue(value: unknown, fallback = "") {
  return value == null ? fallback : String(value);
}

function nullableString(value: unknown) {
  return value == null || value === "" ? null : String(value);
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function normalizeWhatsappCustomer(row: LooseRow): WhatsappCustomerRow {
  const id = row?.id ?? row?.user_id ?? row?.mobile ?? row?.phone ?? row?.phone_number ?? crypto.randomUUID();
  const mobile = row?.mobile ?? row?.user_mobile ?? row?.phone ?? row?.phone_number ?? row?.whatsapp_number ?? "";

  return {
    id: String(id),
    name: nullableString(row?.name ?? row?.customer_name ?? row?.full_name),
    email: nullableString(row?.email),
    mobile: String(mobile),
    addresses: row?.addresses ?? row?.address ?? [],
    wishlist: row?.wishlist ?? [],
    total_orders: Number.isFinite(Number(row?.total_orders ?? row?.no_of_orders))
      ? Number(row?.total_orders ?? row?.no_of_orders)
      : null,
    created_at: stringValue(row?.created_at ?? row?.inserted_at),
  };
}

function PaginationControls({
  page,
  total,
  onPageChange,
}: {
  page: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  if (total <= PAGE_SIZE) return null;

  return (
    <div className="flex items-center justify-between gap-3 pt-4">
      <p className="text-xs text-muted-foreground">
        Page {page} of {totalPages}
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(Math.max(1, page - 1))}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [whatsappCustomers, setWhatsappCustomers] = useState<WhatsappCustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [whatsappLoading, setWhatsappLoading] = useState(true);
  const [whatsappError, setWhatsappError] = useState<string | null>(null);
  const [whatsappSearch, setWhatsappSearch] = useState("");
  const [whatsappPage, setWhatsappPage] = useState(1);
  const fetchIdRef = useRef(0);
  const whatsappFetchIdRef = useRef(0);

  const fetchCustomers = useCallback(async () => {
    const fetchId = ++fetchIdRef.current;
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, name, email, mobile, no_of_orders, created_at, role")
        .ilike("role", "user")
        .order("created_at", { ascending: false });

      if (fetchId !== fetchIdRef.current) return;

      if (error) {
        setCustomers([]);
        setError(error.message || "Failed to load customers");
        return;
      }

      setCustomers((Array.isArray(data) ? (data as CustomerRow[]) : []) ?? []);
    } catch (e: unknown) {
      if (fetchId !== fetchIdRef.current) return;
      setCustomers([]);
      setError(errorMessage(e, "Failed to load customers"));
    } finally {
      if (fetchId === fetchIdRef.current) setLoading(false);
    }
  }, []);

  const fetchWhatsappCustomers = useCallback(async () => {
    const fetchId = ++whatsappFetchIdRef.current;
    setWhatsappLoading(true);
    setWhatsappError(null);

    try {
      const { data, error } = await supabase
        .from("whatsapp_users")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchId !== whatsappFetchIdRef.current) return;

      if (error) {
        setWhatsappCustomers([]);
        setWhatsappError(error.message || "Failed to load WhatsApp customers");
        return;
      }

      setWhatsappCustomers((Array.isArray(data) ? data.map((row) => normalizeWhatsappCustomer(row as LooseRow)) : []) ?? []);
    } catch (e: unknown) {
      if (fetchId !== whatsappFetchIdRef.current) return;
      setWhatsappCustomers([]);
      setWhatsappError(errorMessage(e, "Failed to load WhatsApp customers"));
    } finally {
      if (fetchId === whatsappFetchIdRef.current) setWhatsappLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCustomers();
    void fetchWhatsappCustomers();
  }, [fetchCustomers, fetchWhatsappCustomers]);

  useEffect(() => {
    const channel = supabase
      .channel("admin-customers-users")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "users", filter: "role=ilike.user" },
        () => {
          void fetchCustomers();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "whatsapp_users" },
        () => {
          void fetchWhatsappCustomers();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [fetchCustomers, fetchWhatsappCustomers]);

  useEffect(() => {
    setWhatsappPage(1);
  }, [whatsappSearch]);

  const filteredWhatsappCustomers = useMemo(() => {
    const query = whatsappSearch.trim().toLowerCase();
    if (!query) return whatsappCustomers;

    return whatsappCustomers.filter((c) => {
      return [c.name, c.mobile, c.email].some((value) => String(value ?? "").toLowerCase().includes(query));
    });
  }, [whatsappCustomers, whatsappSearch]);

  const pagedWhatsappCustomers = useMemo(() => {
    return paginate(filteredWhatsappCustomers, whatsappPage);
  }, [filteredWhatsappCustomers, whatsappPage]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden pb-[calc(env(safe-area-inset-bottom)+100px)]">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="bg-card rounded-2xl shadow-lg md:border border-border">
          <div className="p-0 md:p-6">
            <div className="px-4 py-6 md:px-0 md:py-0 md:pb-6 md:border-b border-border md:mb-6">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight">Customers</h1>
              <p className="text-[10px] md:text-sm text-muted-foreground uppercase font-medium md:normal-case md:font-normal">View all registered customers</p>
            </div>

            <Tabs defaultValue="website" className="px-4 md:px-0">
              <TabsList className="mb-4 w-full justify-start md:w-auto">
                <TabsTrigger value="website">Website Customers</TabsTrigger>
                <TabsTrigger value="whatsapp">WhatsApp Customers</TabsTrigger>
              </TabsList>

              <TabsContent value="website" className="mt-0">
                {loading ? (
                  <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-muted-foreground animate-pulse">Loading customers...</p>
                  </div>
                ) : error ? (
                  <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center space-y-3">
                    <div className="text-sm font-semibold text-destructive">Failed to load customers</div>
                    <p className="text-xs text-muted-foreground">{error}</p>
                    <Button variant="outline" size="sm" onClick={() => void fetchCustomers()}>Retry</Button>
                  </div>
                ) : customers.length === 0 ? (
                  <div className="min-h-[40vh] flex flex-col items-center justify-center text-center space-y-4 rounded-3xl border border-dashed border-border p-12">
                    <Users className="h-12 w-12 text-muted-foreground opacity-20" />
                    <div className="space-y-1">
                      <p className="text-sm font-semibold">No customers found</p>
                      <p className="text-xs text-muted-foreground">New customers will appear here once they sign up.</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col gap-3 md:hidden">
                      {customers.map((c) => (
                        <div
                          key={c.id}
                          className="flex items-center w-full min-h-[72px] p-4 rounded-2xl border border-border bg-card shadow-sm active:scale-[0.98] transition-transform"
                        >
                          <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="text-base font-bold text-primary">
                              {(c.name || "U")[0].toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 flex flex-col justify-center ml-3 overflow-hidden">
                            <div className="font-bold text-sm leading-snug truncate">
                              {c.name || "Unknown User"}
                            </div>
                            <div className="text-xs text-muted-foreground truncate opacity-70">
                              {c.email || "No email provided"}
                            </div>
                          </div>
                          <div className="shrink-0 ml-3 flex items-center justify-center min-w-[52px] h-7 rounded-full bg-secondary text-[10px] font-bold uppercase tracking-wide">
                            {c.no_of_orders ?? 0} Orders
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="hidden md:block rounded-xl border border-border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="font-bold">Name</TableHead>
                            <TableHead className="font-bold">Email</TableHead>
                            <TableHead className="font-bold">Mobile</TableHead>
                            <TableHead className="font-bold text-center">Orders</TableHead>
                            <TableHead className="font-bold">Member Since</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {customers.map((c) => (
                            <TableRow key={c.id} className="hover:bg-muted/30 transition-colors">
                              <TableCell className="font-semibold py-4">{c.name || "-"}</TableCell>
                              <TableCell className="py-4">{c.email || "-"}</TableCell>
                              <TableCell className="py-4">{c.mobile || "-"}</TableCell>
                              <TableCell className="text-center py-4">
                                <span className="inline-flex items-center justify-center min-w-[2.5rem] h-8 rounded-lg bg-primary/5 text-primary font-bold">
                                  {c.no_of_orders ?? 0}
                                </span>
                              </TableCell>
                              <TableCell className="py-4 text-muted-foreground">
                                {c.created_at ? formatDateTime(c.created_at) : "-"}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </>
                )}
              </TabsContent>

              <TabsContent value="whatsapp" className="mt-0 space-y-4">
                <Input
                  value={whatsappSearch}
                  onChange={(event) => setWhatsappSearch(event.target.value)}
                  placeholder="Search WhatsApp customers..."
                  className="max-w-md"
                />

                {whatsappLoading ? (
                  <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-muted-foreground animate-pulse">Loading WhatsApp customers...</p>
                  </div>
                ) : whatsappError ? (
                  <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center space-y-3">
                    <div className="text-sm font-semibold text-destructive">Failed to load WhatsApp customers</div>
                    <p className="text-xs text-muted-foreground">{whatsappError}</p>
                    <Button variant="outline" size="sm" onClick={() => void fetchWhatsappCustomers()}>Retry</Button>
                  </div>
                ) : filteredWhatsappCustomers.length === 0 ? (
                  <div className="min-h-[40vh] flex flex-col items-center justify-center text-center space-y-4 rounded-3xl border border-dashed border-border p-12">
                    <Users className="h-12 w-12 text-muted-foreground opacity-20" />
                    <div className="space-y-1">
                      <p className="text-sm font-semibold">No WhatsApp customers found</p>
                      <p className="text-xs text-muted-foreground">WhatsApp customers will appear here once they log in.</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col gap-3 md:hidden">
                      {pagedWhatsappCustomers.map((c) => (
                        <div
                          key={c.id}
                          className="flex items-center w-full min-h-[72px] p-4 rounded-2xl border border-border bg-card shadow-sm active:scale-[0.98] transition-transform"
                        >
                          <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="text-base font-bold text-primary">
                              {(c.name || "W")[0].toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 flex flex-col justify-center ml-3 overflow-hidden">
                            <div className="font-bold text-sm leading-snug truncate">
                              {c.name || "WhatsApp User"}
                            </div>
                            <div className="text-xs text-muted-foreground truncate opacity-70">
                              {c.mobile}
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              {getJsonCount(c.addresses)} addresses | {getJsonCount(c.wishlist)} wishlist
                            </div>
                          </div>
                          <div className="shrink-0 ml-3 flex items-center justify-center min-w-[52px] h-7 rounded-full bg-secondary text-[10px] font-bold uppercase tracking-wide">
                            {c.total_orders ?? 0} Orders
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="hidden md:block rounded-xl border border-border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="font-bold">Customer Name</TableHead>
                            <TableHead className="font-bold">Mobile Number</TableHead>
                            <TableHead className="font-bold">Email</TableHead>
                            <TableHead className="font-bold text-center">Total Orders</TableHead>
                            <TableHead className="font-bold text-center">Address Count</TableHead>
                            <TableHead className="font-bold text-center">Wishlist Count</TableHead>
                            <TableHead className="font-bold">Created Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pagedWhatsappCustomers.map((c) => (
                            <TableRow key={c.id} className="hover:bg-muted/30 transition-colors">
                              <TableCell className="font-semibold py-4">{c.name || "WhatsApp User"}</TableCell>
                              <TableCell className="py-4">{c.mobile}</TableCell>
                              <TableCell className="py-4">{c.email || "-"}</TableCell>
                              <TableCell className="text-center py-4">
                                <span className="inline-flex items-center justify-center min-w-[2.5rem] h-8 rounded-lg bg-primary/5 text-primary font-bold">
                                  {c.total_orders ?? 0}
                                </span>
                              </TableCell>
                              <TableCell className="text-center py-4">{getJsonCount(c.addresses)}</TableCell>
                              <TableCell className="text-center py-4">{getJsonCount(c.wishlist)}</TableCell>
                              <TableCell className="py-4 text-muted-foreground">{formatDateTime(c.created_at)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <PaginationControls
                      page={whatsappPage}
                      total={filteredWhatsappCustomers.length}
                      onPageChange={setWhatsappPage}
                    />
                  </>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
