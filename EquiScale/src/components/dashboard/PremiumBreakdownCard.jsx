import { Info, ShieldCheck } from "lucide-react";
import { formatInr, formatInrHeadline } from "../../lib/formatters";

/**
 * @param {object|null|undefined} pricing — subset of /price JSON
 */
export default function PremiumBreakdownCard({ pricing }) {
  const p = pricing;

  if (!p) {
    return (
      <div className="flex flex-col h-full min-h-[200px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-10 text-center">
        <p className="text-sm font-medium text-slate-600">No premium breakdown</p>
        <p className="text-xs text-slate-400 mt-2">
          Run pricing to populate pure premium, VaR, entropy load, and opex from the API.
        </p>
      </div>
    );
  }

  const purePremium = p.pure_premium;
  const varMargin = p.VaR;
  const entropyLoading = p.entropy_load;
  const opex = p.opex;
  const total = p.premium;
  const entropyScore = p.entropy_eta;

  const components = [
    {
      label: "Pure Premium",
      value: purePremium,
      desc: "Actuarially fair cost of expected loss.",
    },
    {
      label: "VaR Margin (α)",
      value: varMargin,
      desc: "Tail buffer from discrete loss PMF at confidence α.",
    },
    {
      label: "Entropy Loading",
      value: entropyLoading,
      desc: "λ·η·pure premium; η from Shannon entropy of π̄.",
    },
    {
      label: "Operational Cost",
      value: opex,
      desc: "Fixed platform cost (₹).",
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Calculated Weekly Premium
        </span>
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <h2 className="text-2xl sm:text-3xl font-black !text-black tracking-tight leading-none tabular-nums break-words">
            {formatInrHeadline(total)}
          </h2>
          <span className="text-sm font-medium text-slate-500 shrink-0">/ week</span>
        </div>
        <p className="text-[10px] text-slate-400 font-mono mt-1 tabular-nums">
          {formatInr(total)}
        </p>
        {entropyScore != null && (
          <p className="text-[10px] text-slate-400 mt-1 font-mono">
            η = {Number(entropyScore).toFixed(4)}
          </p>
        )}
      </div>

      <div className="flex-1 space-y-6">
        {components.map((item, idx) => (
          <div
            key={idx}
            className="relative border-l-2 border-slate-100 pl-4 py-1 hover:border-cyan-500 transition-colors"
          >
            <div className="flex justify-between items-start mb-1 gap-2">
              <div className="space-y-1 min-w-0">
                <p className="text-sm font-black !text-black flex items-center gap-2 tracking-tight uppercase italic">
                  {item.label}
                  <Info className="w-3 h-3 text-slate-400 opacity-50 shrink-0" />
                </p>
              </div>
              <span className="text-sm sm:text-base font-black !text-black tabular-nums tracking-tight leading-none text-right max-w-[55%] break-words">
                {formatInr(item.value)}
              </span>
            </div>
            <p className="text-[10px] leading-relaxed text-slate-500 font-medium italic max-w-[240px]">
              {item.desc}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="w-4 h-4 text-slate-600" />
          <span className="text-xs font-bold text-slate-700 tracking-tight">
            Layer 4: Co-insurance (ρ)
          </span>
        </div>
        <p className="text-[10px] text-slate-500 italic leading-snug">
          Insured losses are in <code className="font-mono">L_ins</code> (from{" "}
          <code className="font-mono">L</code>, deductible, and ρ in the pricing request).
        </p>
      </div>
    </div>
  );
}
