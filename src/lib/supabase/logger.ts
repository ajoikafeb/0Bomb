const DEBUG = false;

export function supabaseLogger(...args: unknown[]) {
  if (DEBUG) console.log("[Supabase]", ...args);
}
