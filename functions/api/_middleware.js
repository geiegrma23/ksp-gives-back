// Cloudflare Pages Functions middleware
// - All GET requests are public (read content)
// - All other methods require Cloudflare Access JWT

export async function onRequest(context) {
  const { request } = context;

  // Allow all GET requests (public reads)
  if (request.method === 'GET') {
    return context.next();
  }

  // For local development, skip auth if no CF Access config
  const cfAccessAud = context.env.CF_ACCESS_AUD;
  if (!cfAccessAud) {
    // Local dev — allow writes
    return context.next();
  }

  // Verify Cloudflare Access JWT
  const jwt = request.headers.get('Cf-Access-Jwt-Assertion');
  if (!jwt) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // In production, Cloudflare Access validates the JWT at the edge
  // before the request reaches this function. The presence of the
  // header means the user passed Access authentication.
  // For extra security, you can verify the JWT signature against
  // your Access team's public certs, but it's not strictly required
  // when Access is configured on the route.

  return context.next();
}
