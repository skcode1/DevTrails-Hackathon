export function getApiBase() {
  const fromEnv = import.meta.env.VITE_API_URL;
  if (fromEnv && String(fromEnv).trim()) return String(fromEnv).trim();
  if (import.meta.env.DEV) return "http://localhost:8000";
  return "";
}

async function parseJsonOrText(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { detail: text || res.statusText };
  }
}

export async function fetchHealth() {
  const base = getApiBase();
  if (!base) return { ok: false, status: 0, data: { detail: "VITE_API_URL not set" } };
  const res = await fetch(`${base}/health`);
  const data = await parseJsonOrText(res);
  return { ok: res.ok, status: res.status, data };
}

/** GET /pricing-defaults — canonical template; falls back to caller using /defaults.json */
export async function fetchPricingDefaultsFromApi() {
  const base = getApiBase();
  if (!base) {
    throw new Error("API base URL is not configured (set VITE_API_URL)");
  }
  const res = await fetch(`${base}/pricing-defaults`);
  const data = await parseJsonOrText(res);
  if (!res.ok) {
    const msg =
      typeof data?.detail === "string"
        ? data.detail
        : JSON.stringify(data?.detail ?? data);
    throw new Error(msg || `HTTP ${res.status}`);
  }
  return data;
}

export async function fetchPricingDefaultsFromPublic() {
  const res = await fetch("/defaults.json");
  if (!res.ok) throw new Error(`defaults.json HTTP ${res.status}`);
  return res.json();
}

export async function postPrice(body) {
  const base = getApiBase();
  if (!base) throw new Error("API base URL is not configured (set VITE_API_URL)");
  const res = await fetch(`${base}/price`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await parseJsonOrText(res);
  if (!res.ok) {
    const msg =
      typeof data?.detail === "string"
        ? data.detail
        : JSON.stringify(data?.detail ?? data);
    throw new Error(msg || `HTTP ${res.status}`);
  }
  return data;
}

export async function postPriceAndFraud(body) {
  const base = getApiBase();
  if (!base) throw new Error("API base URL is not configured (set VITE_API_URL)");
  const res = await fetch(`${base}/price-and-fraud`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await parseJsonOrText(res);
  if (!res.ok) {
    const msg =
      typeof data?.detail === "string"
        ? data.detail
        : JSON.stringify(data?.detail ?? data);
    throw new Error(msg || `HTTP ${res.status}`);
  }
  return data;
}
