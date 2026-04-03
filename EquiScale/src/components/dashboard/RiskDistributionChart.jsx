/**
 * Data-driven State Distribution Chart
 * Visualizes the week-averaged probability (π̄) across the 4 Markov states.
 */
export default function RiskDistributionChart() {
  const distributionData = [
    { state: "S₀", label: "Normal", value: 60, color: "bg-emerald-500", loss: "₹0", interval: "≥ μ − 0.5σ" },
    { state: "S₁", label: "Mild", value: 22, color: "bg-amber-400", loss: "1.0σ", interval: "μ − 1.5σ" },
    { state: "S₂", label: "Major", value: 12, color: "bg-orange-500", loss: "2.0σ", interval: "μ − 2.5σ" },
    { state: "S₃", label: "Severe", value: 6, color: "bg-rose-600", loss: "3.0σ", interval: "< μ − 2.5σ" },
  ];

  return (
    <div className="w-full space-y-8 p-2">
      <div className="space-y-7">
        {distributionData.map((item) => (
          <div key={item.state} className="relative">
            <div className="flex items-end justify-between mb-3">
              <div className="flex items-center gap-3">
                {/* State Badge: High Contrast */}
                <span className={`flex items-center justify-center w-7 h-7 rounded-lg text-[10px] font-black text-white shadow-lg ${item.color} italic uppercase`}>
                  {item.state}
                </span>
                
                <div className="flex flex-col">
                  <span className="text-sm font-black !text-black uppercase tracking-tight italic">
                    {item.label} Disruption
                  </span>
                  {/* Interval: Now Static and Bold */}
                  <span className="text-[9px] font-bold font-mono text-slate-400 uppercase tracking-widest mt-0.5">
                    Gate: {item.interval}
                  </span>
                </div>
              </div>

              <div className="text-right flex flex-col items-end">
                <span className="text-lg font-black !text-black tabular-nums leading-none">
                  {item.value}%
                </span>
                <span className="text-[10px] font-bold text-slate-400 italic mt-1">
                  Magnitude: {item.loss}
                </span>
              </div>
            </div>

            {/* Production Grade Progress Track */}
            <div className="relative w-full h-3 bg-slate-100 rounded-full border border-slate-200/50 p-[2px]">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ease-out shadow-sm ${item.color}`}
                style={{ width: `${item.value}%` }} 
              />
              {/* Optional: Subtle 50% marker for scale */}
              <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-slate-200/50 z-0" />
            </div>
          </div>
        ))}
      </div>

      {/* Actuarial Legend / Footer */}
      <div className="pt-6 border-t border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <p className="text-[10px] text-slate-500 font-bold leading-relaxed max-w-sm uppercase tracking-tight">
        
        </p>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-200">
           <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
           <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest italic">
             ROC Vector Synced
           </span>
        </div>
      </div>
    </div>
  );
}