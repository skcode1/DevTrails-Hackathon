import { useContext } from "react";
import { ActuarialContext } from "./actuarialContext";

export function useActuarial() {
  const ctx = useContext(ActuarialContext);
  if (!ctx) {
    throw new Error("useActuarial must be used within ActuarialProvider");
  }
  return ctx;
}
