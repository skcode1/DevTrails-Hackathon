import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchHealth,
  fetchPricingDefaultsFromApi,
  fetchPricingDefaultsFromPublic,
} from "../lib/api";
import { ActuarialContext } from "./actuarialContext";

export function ActuarialProvider({ children }) {
  const [healthOk, setHealthOk] = useState(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [appDefaults, setAppDefaults] = useState(null);
  const [defaultsLoading, setDefaultsLoading] = useState(true);
  const [defaultsError, setDefaultsError] = useState(null);
  const [lastPriceRequest, setLastPriceRequest] = useState(null);
  const [lastPriceResponse, setLastPriceResponse] = useState(null);
  const [adjudications, setAdjudications] = useState([]);

  const loadDefaults = useCallback(async () => {
    setDefaultsLoading(true);
    setDefaultsError(null);
    try {
      const data = await fetchPricingDefaultsFromApi();
      setAppDefaults(data);
    } catch (e1) {
      try {
        const data = await fetchPricingDefaultsFromPublic();
        setAppDefaults(data);
        setDefaultsError(
          e1 instanceof Error ? e1.message : "API defaults unavailable; using /defaults.json",
        );
      } catch (e2) {
        setAppDefaults(null);
        setDefaultsError(
          [e1, e2]
            .map((x) => (x instanceof Error ? x.message : String(x)))
            .join(" · "),
        );
      }
    } finally {
      setDefaultsLoading(false);
    }
  }, []);

  const refreshHealth = useCallback(async () => {
    try {
      const { ok, data } = await fetchHealth();
      setHealthOk(ok);
      setModelsLoaded(Boolean(data?.models_loaded));
    } catch {
      setHealthOk(false);
      setModelsLoaded(false);
    }
  }, []);

  useEffect(() => {
    void loadDefaults();
  }, [loadDefaults]);

  useEffect(() => {
    const t0 = setTimeout(() => {
      void refreshHealth();
    }, 0);
    const id = setInterval(() => {
      void refreshHealth();
    }, 30_000);
    return () => {
      clearTimeout(t0);
      clearInterval(id);
    };
  }, [refreshHealth]);

  const recordPricing = useCallback((requestBody, response) => {
    setLastPriceRequest(requestBody);
    setLastPriceResponse(response);
  }, []);

  const addAdjudication = useCallback((entry) => {
    setAdjudications((prev) => [entry, ...prev]);
  }, []);

  const value = useMemo(
    () => ({
      healthOk,
      modelsLoaded,
      appDefaults,
      defaultsLoading,
      defaultsError,
      reloadDefaults: loadDefaults,
      lastPriceRequest,
      lastPriceResponse,
      adjudications,
      refreshHealth,
      recordPricing,
      addAdjudication,
    }),
    [
      healthOk,
      modelsLoaded,
      appDefaults,
      defaultsLoading,
      defaultsError,
      loadDefaults,
      lastPriceRequest,
      lastPriceResponse,
      adjudications,
      refreshHealth,
      recordPricing,
      addAdjudication,
    ],
  );

  return (
    <ActuarialContext.Provider value={value}>
      {children}
    </ActuarialContext.Provider>
  );
}
