/**
 * @param {number[] | null | undefined} piBar — [p0..p3] from /price
 */
export default function RiskDistributionChart({ piBar }) {
  const template = [
    {
      state: "S₀",
      label: "Normal",
      color: "bg-emerald-500",
      loss: "₹0",
      interval: "≥ μ − 0.5σ",
    },
    {
      state: "S₁",
      label: "Mild",
      color: "bg-amber-400",
      loss: "1.0σ",
      interval: "μ − 1.5σ",
    },
    {
      state: "S₂",
      label: "Major",
      color: "bg-orange-500",
      loss: "2.0σ",
      interval: "μ − 2.5σ",
    },
    {
      state: "S₃",
      label: "Severe",
      color: "bg-rose-600",
      loss: "3.0σ",
      interval: "< μ − 2.5σ",
    },
  ];

  const hasData = Array.isArray(piBar) && piBar.length === 4;

  if (!hasData) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-16 text-center">
        <p className="text-sm font-medium text-slate-600">No π̄ data yet</p>
        <p className="text-xs text-slate-400 mt-2 max-w-xs">
          Run <span className="font-mono">POST /price</span> from Premium Pricing to chart state weights.
        </p>
      </div>
    );
  }

  const distributionData = template.map((row, i) => {
    const pct = Math.round(Number(piBar[i]) * 1000) / 10;
    return { ...row, value: Math.min(100, Math.max(0, pct)) };
  });

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="space-y-5">
        {distributionData.map((item) => (
          <div key={item.state} className="relative">
            <div className="flex items-end justify-between gap-4 mb-2">
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-black text-white shadow-md ${item.color} italic uppercase`}
                >
                  {item.state}
                </span>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-black !text-black uppercase tracking-tight italic truncate">
                    {item.label} disruption
                  </span>
                  <span className="text-[9px] font-bold font-mono text-slate-400 uppercase tracking-widest mt-0.5 truncate">
                    Gate: {item.interval}
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-base font-black !text-black tabular-nums leading-none block">
                  {item.value}%
                </span>
                <span className="text-[10px] font-bold text-slate-400 italic mt-0.5 block">
                  {item.loss}
                </span>
              </div>
            </div>

            <div className="relative h-2.5 w-full rounded-full bg-slate-100 border border-slate-200/80 overflow-hidden">
              <div
                className={`absolute left-0 top-0 h-full rounded-full transition-all duration-700 ease-out ${item.color}`}
                style={{ width: `${item.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-200 w-fit ml-auto">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse shrink-0" />
          <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">
            Live π̄ (API)
          </span>
        </div>
      </div>
    </div>
  );
}
