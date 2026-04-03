import { Info, ShieldCheck, Percent, Layers } from "lucide-react";

/**
 * PremiumBreakdownCard - Layer 3 & 4 Visualization
 * Displays the actuarial components of the weekly premium.
 */
export default function PremiumBreakdownCard() {
  // Mock data representing a rider's calculated premium components
  const pricingData = {
    purePremium: 120.50,
    varMargin: 45.20,
    entropyLoading: 16.30,
    opex: 10.00,
    total: 192.00,
    retention: 40.00, // Amount rider pays (Deductible + Co-ins)
    entropyScore: 0.24, // η (0 to 1)
  };

  const components = [
    { 
      label: "Pure Premium", 
      value: pricingData.purePremium, 
      
      desc: "Actuarially fair cost of expected loss." 
    },
    { 
      label: "VaR Margin (95%)", 
      value: pricingData.varMargin, 
    
      desc: "Buffer for tail-risk solvency." 
    },
    { 
      label: "Entropy Loading", 
      value: pricingData.entropyLoading, 
  
      desc: "Surcharge for Markov model uncertainty." 
    },
    { 
      label: "Operational Cost", 
      value: pricingData.opex, 
     
      desc: "Platform and processing fees." 
    },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Total Premium Display */}
      <div className="mb-6">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Calculated Weekly Premium</span>
        <div className="flex items-baseline gap-1">
        <h2 className="text-4xl font-black !text-black opacity-100 tracking-tighter leading-none">
  ₹{pricingData.total.toFixed(2)}</h2>
          <span className="text-sm font-medium text-slate-500">/ week</span>
        </div>
      </div>

      {/* Breakdown List */}
     <div className="flex-1 space-y-6">
  {components.map((item, idx) => (
    <div key={idx} className="relative border-l-2 border-slate-100 pl-4 py-1 hover:border-cyan-500 transition-colors">
      <div className="flex justify-between items-start mb-1">
        <div className="space-y-1">
          {/* Main Label: Deep Black */}
          <p className="text-sm font-black !text-black flex items-center gap-2 tracking-tight uppercase italic">
            {item.label}
            <Info className="w-3 h-3 text-slate-400 opacity-50" />
          </p>
          
          {/* Actuarial Formula: Professional Mono */}
          <div className="flex items-center gap-2">
            <code className="text-[10px] font-bold font-mono text-cyan-700 bg-cyan-50/50 px-1.5 py-0.5 rounded border border-cyan-100/50">
              {item.formula}
            </code>
          </div>
        </div>

        {/* Value: High Contrast Black */}
        <span className="text-base font-black !text-black tabular-nums tracking-tighter leading-none">
          ₹{item.value.toFixed(2)}
        </span>
      </div>

      {/* RECTIFIED: Static Description (No longer on hover) */}
      <p className="text-[10px] leading-relaxed text-slate-500 font-medium italic max-w-[240px]">
        {item.desc}
      </p>
    </div>
  ))}
</div>

      {/* Layer 4: Retention Insight */}
      <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="w-4 h-4 text-slate-600" />
          <span className="text-xs font-bold text-slate-700 tracking-tight">Layer 4: Co-Insurance Impact</span>
        </div>
        <div className="flex justify-between text-[11px] mb-1">
          <span className="text-slate-500 font-medium text-left">Rider Retention ρ</span>
          <span className="font-bold text-slate-900">₹{pricingData.retention.toFixed(2)}</span>
        </div>
        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
          <div 
            className="bg-slate-400 h-full transition-all duration-500" 
            style={{ width: `${(pricingData.retention / (pricingData.total + pricingData.retention)) * 100}%` }} 
          />
        </div>
        <p className="mt-2 text-[10px] text-slate-400 italic leading-snug">
          Retention reduces premium by capping severe-state ($s_3$) insurer payout.
        </p>
      </div>
    </div>
  );
}