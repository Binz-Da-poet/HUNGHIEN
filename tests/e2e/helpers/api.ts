const API_URL = 'http://localhost:3001';

export async function apiGet(path: string): Promise<any> {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json();
}

export async function apiPost(path: string, body: unknown): Promise<any> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
  return res.json();
}

export async function apiPatch(path: string, body: unknown): Promise<any> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PATCH ${path} failed: ${res.status}`);
  return res.json();
}

const adminCookies: string[] = [];

export async function loginAdmin(): Promise<void> {
  const res = await fetch(`${API_URL}/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: process.env.ADMIN_USERNAME || 'admin',
      password: process.env.ADMIN_PASSWORD || 'admin',
    }),
  });
  const setCookie = res.headers.get('set-cookie');
  if (setCookie) {
    adminCookies.push(setCookie);
  }
}

export function getAdminHeaders(): Record<string, string> {
  return adminCookies.length > 0
    ? { 'Content-Type': 'application/json', Cookie: adminCookies.join('; ') }
    : { 'Content-Type': 'application/json' };
}

export async function adminApiGet(path: string): Promise<any> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: getAdminHeaders(),
  });
  if (!res.ok) throw new Error(`ADMIN GET ${path} failed: ${res.status}`);
  return res.json();
}

export async function adminApiPost(path: string, body: unknown): Promise<any> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: getAdminHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`ADMIN POST ${path} failed: ${res.status}`);
  return res.json();
}

export async function adminApiPatch(path: string, body: unknown): Promise<any> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'PATCH',
    headers: getAdminHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`ADMIN PATCH ${path} failed: ${res.status}`);
  return res.json();
}
