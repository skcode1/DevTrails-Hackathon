/** Full Indian-style grouping for INR display */
export function formatInr(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "—";
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

/** Shorter headline when values are huge (e.g. premiums) */
export function formatInrHeadline(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "—";
  const abs = Math.abs(n);
  if (abs >= 1e7) {
    return `₹${(n / 1e7).toLocaleString("en-IN", { maximumFractionDigits: 2 })} Cr`;
  }
  if (abs >= 1e5) {
    return `₹${(n / 1e5).toLocaleString("en-IN", { maximumFractionDigits: 2 })} L`;
  }
  return formatInr(n);
}
