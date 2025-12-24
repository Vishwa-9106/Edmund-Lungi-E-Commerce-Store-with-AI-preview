import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  // Avoid throwing to not break build; runtime will fail clearly when used
  // eslint-disable-next-line no-console
  console.warn("Supabase env vars missing: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
}

const missingEnv = !supabaseUrl || !supabaseAnonKey;

if (!missingEnv) {
  let origin = supabaseUrl;
  try {
    origin = new URL(supabaseUrl).origin;
  } catch {
    // ignore
  }
  // eslint-disable-next-line no-console
  console.log("[Supabase] configured", {
    origin,
    anonKeyLength: supabaseAnonKey?.length || 0,
  });
}

function createInstrumentedFetch() {
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    const startedAt = Date.now();

    // eslint-disable-next-line no-console
    console.log("[SupabaseFetch] start", {
      at: new Date(startedAt).toISOString(),
      method: init?.method || "GET",
      url,
    });

    try {
      const res = await fetch(input, init);
      const endedAt = Date.now();
      // eslint-disable-next-line no-console
      console.log("[SupabaseFetch] end", {
        at: new Date(endedAt).toISOString(),
        ms: endedAt - startedAt,
        status: res.status,
        ok: res.ok,
        url,
      });
      return res;
    } catch (err) {
      const endedAt = Date.now();
      // eslint-disable-next-line no-console
      console.error("[SupabaseFetch] error", {
        at: new Date(endedAt).toISOString(),
        ms: endedAt - startedAt,
        url,
        error: err,
      });
      throw err;
    }
  };
}

export const supabase = missingEnv
  ? createClient("http://localhost", "invalid-anon-key", {
      global: {
        fetch: async () => {
          throw new Error("Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
        },
      },
    })
  : createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage,
      },
      global: {
        fetch: createInstrumentedFetch(),
      },
    });

export default supabase;
