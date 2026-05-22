/** API base URL — empty string uses same origin (Vite proxy locally, Vercel /api in production). */
export const API_BASE = import.meta.env.VITE_API_URL || '';

export async function parseJsonResponse(response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { error: text.slice(0, 200) };
  }
}

export function formatApiError(data, response) {
  const raw = data?.error || data?.message || '';

  if (!response) {
    return 'Cannot reach the server. Check your internet connection. If testing locally, run "npm run server" in a second terminal.';
  }

  if (response.status === 503 || /database|postgres|POSTGRES|ECONNREFUSED|connect/i.test(raw)) {
    return raw.includes('POSTGRES')
      ? raw
      : 'Database connection failed. On Vercel: add POSTGRES_URL under Project Settings → Environment Variables, then redeploy. Locally: run npm run server (SQLite) or configure .env.local with Postgres.';
  }

  if (response.status >= 500) {
    return raw || 'Server error. Please try again in a moment.';
  }

  return raw || `Request failed (${response.status})`;
}

export async function apiPost(path, body) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error(formatApiError(null, null));
  }

  const data = await parseJsonResponse(response);
  if (!response.ok) {
    throw new Error(formatApiError(data, response));
  }
  return data;
}
