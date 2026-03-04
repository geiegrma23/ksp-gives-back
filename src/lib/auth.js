// Admin auth check — verifies Cloudflare Access JWT presence

export function isAdmin(request, env) {
  const cfAccessAud = env.CF_ACCESS_AUD;
  if (!cfAccessAud) return true; // No Access configured = allow (dev)
  const jwt = request.headers.get('Cf-Access-Jwt-Assertion');
  return !!jwt;
}
