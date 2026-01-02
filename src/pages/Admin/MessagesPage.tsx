import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/supabase";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type MessageStatus = "unread" | "read" | string;

type MessageRow = {
  id: string;
  sender_name: string | null;
  sender_email: string | null;
  subject: string | null;
  message: string | null;
  created_at: string;
  read_status: MessageStatus | null;
};

function formatDateTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

function normalizeStatus(status: MessageStatus | null | undefined) {
  const s = String(status ?? "").trim().toLowerCase();
  return s === "read" ? "read" : "unread";
}

export default function MessagesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [selected, setSelected] = useState<MessageRow | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const displayError = (msg: string) => {
    const m = String(msg ?? "");
    const normalized = m.toLowerCase();
    const missingTableHint =
      normalized.includes("could not find the table") ||
      normalized.includes("schema cache") ||
      normalized.includes("relation") ||
      normalized.includes("does not exist");

    setError(
      missingTableHint
        ? "Database table missing: create `public.messages` in Supabase (or refresh PostgREST schema cache), then reload."
        : m || "Failed to load messages"
    );
  };

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from("messages")
          .select("id,sender_name,sender_email,subject,message,created_at,read_status")
          .order("created_at", { ascending: false });

        if (!alive) return;
        if (error) {
          displayError(error.message);
          setMessages([]);
          return;
        }

        setMessages((data as MessageRow[]) ?? []);
      } catch (e: any) {
        if (!alive) return;
        displayError(e?.message);
        setMessages([]);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const unreadCount = useMemo(
    () => messages.filter((m) => normalizeStatus(m.read_status) === "unread").length,
    [messages]
  );

  const openMessage = (msg: MessageRow) => {
    setSelected(msg);
    setDetailOpen(true);

    if (normalizeStatus(msg.read_status) === "read") return;

    setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, read_status: "read" } : m)));
    void (async () => {
      try {
        await supabase.from("messages").update({ read_status: "read" }).eq("id", msg.id);
      } catch {
        setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, read_status: "unread" } : m)));
      }
    })();
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Messages</h1>
        <p className="text-sm text-muted-foreground">View contact form messages from customers.</p>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <Badge variant={unreadCount > 0 ? "default" : "secondary"}>Unread: {unreadCount}</Badge>
      </div>

      {error && <div className="text-sm text-destructive mb-4">{error}</div>}

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sender Name</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Date &amp; Time</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : messages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-muted-foreground">
                  No messages yet.
                </TableCell>
              </TableRow>
            ) : (
              messages.map((m) => {
                const status = normalizeStatus(m.read_status);
                return (
                  <TableRow
                    key={m.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => openMessage(m)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") openMessage(m);
                    }}
                    className={cn(status === "unread" && "bg-muted/40")}
                  >
                    <TableCell className={cn(status === "unread" && "font-semibold")}>{m.sender_name || "-"}</TableCell>
                    <TableCell className={cn(status === "unread" && "font-semibold")}>{m.subject || "-"}</TableCell>
                    <TableCell>{formatDateTime(m.created_at)}</TableCell>
                    <TableCell>
                      <Badge variant={status === "unread" ? "default" : "secondary"}>
                        {status === "unread" ? "Unread" : "Read"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selected?.subject || "Message"}</DialogTitle>
            <DialogDescription>{selected?.created_at ? formatDateTime(selected.created_at) : ""}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1">
              <div className="text-sm font-medium">Sender Name</div>
              <div className="text-sm text-muted-foreground">{selected?.sender_name || "-"}</div>
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium">Email</div>
              {selected?.sender_email ? (
                <a className="text-sm underline" href={`mailto:${selected.sender_email}`}>
                  {selected.sender_email}
                </a>
              ) : (
                <div className="text-sm text-muted-foreground">-</div>
              )}
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium">Subject</div>
              <div className="text-sm text-muted-foreground">{selected?.subject || "-"}</div>
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium">Message</div>
              <div className="text-sm text-muted-foreground whitespace-pre-wrap">{selected?.message || "-"}</div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
