#!/usr/bin/env node
/**
 * PLAT-010 smoke test: browser -> Ingress -> storefront/API -> PostgreSQL.
 *
 * Deliberately dependency-free (no test runner, no HTTP client) so it can run
 * against any deployed environment:
 *   BASE_URL=http://localhost:8080 node scripts/smoke-test.mjs
 */

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:8080';
const email = `smoke-${Date.now()}@example.com`;
const password = 'correct horse battery staple';

let failures = 0;
let cookie = '';

const check = (name, condition, detail = '') => {
  if (condition) {
    console.log(`  ok    ${name}`);
  } else {
    failures += 1;
    console.error(`  FAIL  ${name}${detail ? ` — ${detail}` : ''}`);
  }
};

async function call(path, { method = 'GET', body } = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      ...(body ? { 'content-type': 'application/json' } : {}),
      ...(cookie ? { cookie } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    redirect: 'manual',
  });

  const setCookie = response.headers.get('set-cookie');
  if (setCookie) cookie = setCookie.split(';')[0];

  const text = await response.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* HTML responses from the storefront are expected */
  }
  return { status: response.status, json, text, headers: response.headers };
}

async function main() {
  console.log(`smoke test against ${BASE_URL}\n`);

  console.log('storefront reachable through the Ingress');
  const home = await call('/');
  check('GET / returns 200', home.status === 200, `got ${home.status}`);
  check('GET / renders the storefront', home.text.includes('MVP Storefront'));

  console.log('\nAPI reachable through the Ingress on the same origin');
  const health = await call('/health');
  check('GET /health returns 200', health.status === 200, `got ${health.status}`);
  const ready = await call('/ready');
  check('GET /ready reports the database is up', ready.json?.checks?.database === 'ok');

  console.log('\nregistration -> authenticated request -> logout');
  const register = await call('/api/v1/auth/register', {
    method: 'POST',
    body: { email, password, displayName: 'Smoke Test' },
  });
  check('register returns 201', register.status === 201, `got ${register.status}`);
  check('register sets an HttpOnly cookie', /HttpOnly/i.test(register.headers.get('set-cookie') ?? ''));

  const me = await call('/api/v1/auth/me');
  check('GET /auth/me returns the new user', me.json?.user?.email === email);

  const protectedRoute = await call('/api/v1/protected/example');
  check('protected route accepts the session', protectedRoute.status === 200);

  const logout = await call('/api/v1/auth/logout', { method: 'POST' });
  check('logout returns 200', logout.status === 200);

  const afterLogout = await call('/api/v1/auth/me');
  check('session is invalid after logout', afterLogout.status === 401, `got ${afterLogout.status}`);

  console.log('\nlogin with the same credentials');
  cookie = '';
  const login = await call('/api/v1/auth/login', { method: 'POST', body: { email, password } });
  check('login returns 200', login.status === 200, `got ${login.status}`);
  const meAgain = await call('/api/v1/auth/me');
  check('the new session works', meAgain.json?.user?.email === email);

  console.log('\nanonymous access is rejected');
  cookie = '';
  const anonymous = await call('/api/v1/auth/me');
  check('GET /auth/me without a cookie returns 401', anonymous.status === 401);
  check('error body carries a request id', Boolean(anonymous.json?.error?.requestId));

  console.log('\nfeature flags drive the routes');
  const products = await call('/products');
  check('disabled catalog shows Coming Soon', products.text.includes('Not built yet'));
  const checkout = await call('/checkout');
  check('checkout configured as not-found returns 404', checkout.status === 404, `got ${checkout.status}`);

  console.log(failures === 0 ? '\nall smoke checks passed' : `\n${failures} smoke check(s) failed`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error(`smoke test could not run: ${error.message}`);
  process.exit(1);
});
