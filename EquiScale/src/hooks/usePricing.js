import { useState, useCallback } from "react";
import { postPrice } from "../lib/api";
import {
  buildPriceRequest,
  normalizePriceResponse,
} from "../lib/pricingDefaults";
import { useActuarial } from "../context/useActuarial";

export function usePricing() {
  const { recordPricing, appDefaults, defaultsLoading, defaultsError } =
    useActuarial();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const template = appDefaults?.template;
  const s0Count = appDefaults?.s0_record_count;

  const calculatePremium = useCallback(
    async (earnings) => {
      if (defaultsLoading) {
        setError("Loading pricing defaults…");
        return;
      }
      if (!template) {
        setError(
          defaultsError ||
            "Pricing template unavailable. Start the API or provide public/defaults.json.",
        );
        return;
      }
      const need = typeof s0Count === "number" ? s0Count : 14;
      if (!earnings || earnings.length !== need) {
        setError(`Provide exactly ${need} comma-separated S₀ daily earnings (₹).`);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const body = buildPriceRequest(earnings, template);
        const raw = await postPrice(body);
        recordPricing(body, raw);
        setResult(normalizePriceResponse(raw));
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Pricing request failed.",
        );
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [
      defaultsLoading,
      template,
      s0Count,
      defaultsError,
      recordPricing,
    ],
  );

  return { result, calculatePremium, loading, error };
}
