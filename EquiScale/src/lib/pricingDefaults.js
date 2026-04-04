/**
 * Build POST /price JSON from API-provided template (GET /pricing-defaults)
 * plus 14 S₀ earnings. No embedded business constants.
 */
export function buildPriceRequest(s0_earnings, template, overrides = {}) {
  if (!template || typeof template !== "object") {
    throw new Error("Pricing template is not loaded");
  }
  const ft = template.features_today;
  if (!ft || typeof ft !== "object") {
    throw new Error("Pricing template.features_today is missing");
  }
  return {
    rider_id: overrides.rider_id ?? template.rider_id,
    s0_earnings,
    features_today: {
      ...ft,
      ...(overrides.features_today || {}),
    },
    current_state: overrides.current_state ?? template.current_state,
    n_working_days: overrides.n_working_days ?? template.n_working_days,
    lam: overrides.lam ?? template.lam,
    alpha: overrides.alpha ?? template.alpha,
    opex: overrides.opex ?? template.opex,
    deductible_pct: overrides.deductible_pct ?? template.deductible_pct,
    rho: overrides.rho ?? template.rho,
  };
}

export function normalizePriceResponse(apiRes) {
  return {
    ...apiRes,
    expectedLoss: apiRes.pure_premium,
    varMargin: apiRes.VaR,
    pMatrix: apiRes.P_adjusted,
  };
}

export function overallToRowStatus(overall) {
  const u = String(overall || "").toUpperCase();
  if (u === "FLAG") return "flag";
  if (u === "PASS") return "pass";
  return "review";
}
