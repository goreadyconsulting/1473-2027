// Isolated LARP portal JSON gateway. No admin secrets or service keys are sent to browsers.
// The service key is injected by Supabase into the Edge Function's environment.
const TRUSTED_ORIGINS = new Set([
  "https://goreadyconsulting.github.io",
  "http://localhost:8080",
  "http://127.0.0.1:8080",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
]);
function originHeaders(origin: string | null) {
  const trusted = origin && TRUSTED_ORIGINS.has(origin) ? origin : "https://goreadyconsulting.github.io";
  return {
    "Access-Control-Allow-Origin": trusted,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Max-Age": "86400",
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Vary": "Origin",
  };
}
function reply(status: number, payload: Record<string, unknown>, origin: string | null) {
  return new Response(JSON.stringify(payload), { status, headers: originHeaders(origin) });
}
function serverSecrets() {
  let modern: Record<string, string> = {};
  try {
    modern = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}");
  } catch { /* Legacy fallback */ }
  const secret = modern.default || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!secret) throw new Error("Supabase internal secret unavailable");
  return secret;
}
async function rpc(name: "larp_portal_state" | "larp_portal_control", args: Record<string, string | null> = {}) {
  const endpoint = Deno.env.get("SUPABASE_URL");
  if (!endpoint) throw new Error("Supabase URL unavailable");
  const key = serverSecrets();
  const headers: Record<string, string> = {
    "apikey": key,
    "content-type": "application/json",
    "accept": "application/json",
  };
  // New sb_secret_* API keys are NOT JWTs; only legacy service_role keys go on Authorization.
  if (!key.startsWith("sb_secret_")) headers.Authorization = "Bearer " + key;
  const result = await fetch(endpoint + "/rest/v1/rpc/" + name, {
    method: "POST",
    headers,
    body: JSON.stringify(args),
    signal: AbortSignal.timeout(9000),
  });
  const data = await result.json().catch(() => ({}));
  if (!result.ok) {
    const denied = String(data.message || "").includes("Access denied");
    throw Object.assign(new Error(denied ? "Incorrect access code" : "Backend unavailable"), {
      code: denied ? 401 : result.status,
    });
  }
  return data;
}
Deno.serve(async (request: Request) => {
  const origin = request.headers.get("origin");
  if (origin && !TRUSTED_ORIGINS.has(origin)) return reply(403, { ok:false, error:"Origin rejected" }, origin);
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: originHeaders(origin) });
  try {
    if (request.method === "GET") {
      const state = await rpc("larp_portal_state");
      return reply(200, { ok: true, ...state }, origin);
    }
    if (request.method !== "POST") return reply(405,{ ok:false,error:"Method not allowed" },origin);
    const raw = await request.text();
    if (raw.length > 4096) return reply(413,{ ok:false,error:"Request too large" },origin);
    const body = JSON.parse(raw);
    if (!body || body.action !== "admin" || typeof body.secret !== "string") {
      return reply(400,{ok:false,error:"Invalid request"},origin);
    }
    if (!/^(login|start|pause|resume|restore|eliminate|reset_scene|reset)$/.test(body.command || "")) {
      return reply(400,{ok:false,error:"Unknown command"},origin);
    }
    if (body.secret.length < 12 || body.secret.length > 128) {
      return reply(401,{ok:false,error:"Incorrect access code"},origin);
    }
    const state = await rpc("larp_portal_control",{
      p_secret: body.secret,
      p_command: body.command,
      p_item_id: typeof body.item_id === "string" ? body.item_id.slice(0,64) : null,
    });
    return reply(200,{ok:true,...state},origin);
  } catch(error) {
    const status = Number((error as {code?:number}).code) || 503;
    return reply(status === 401 ? 401 : 503,{
      ok:false,error: status === 401 ? "Incorrect access code" : "Connection temporarily unavailable",
    },origin);
  }
});
