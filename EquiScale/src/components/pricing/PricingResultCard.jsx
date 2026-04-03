import { ShieldCheck, Info, TrendingUp, BarChart3, ArrowUpRight, Zap } from "lucide-react";

/**
 * PricingResultCard - Layer 3 & 4 Strategic Output
 * Visualizes the final premium and actuarial safety margins.
 */
export default function PricingResultCard({ result }) {
  // RECTIFIED: Unicode symbols instead of LaTeX
  const FORMULAS = {
    expLoss: "E[L] = n · π̄ · L",
    loading: "(1 + λη)",
    var: "VaR₀.₉₅"
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500 transition-all hover:shadow-cyan-900/5">
      <div className="grid grid-cols-1 md:grid-cols-3">
        
        {/* 1. PRIMARY QUOTE: High-Authority Dark Section */}
        <div className="p-10 bg-slate-950 text-white md:col-span-1 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Glow Background */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/10 blur-[100px] rounded-full" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-cyan-500 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                <ShieldCheck className="w-5 h-5 text-slate-950" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">
                Finalized Quote
              </span>
            </div>
            
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-3">
              Total Weekly Premium
            </p>
            <div className="flex items-baseline gap-3">
              <h2 className="text-6xl font-black tracking-tighter italic !text-white">
                ₹{(result.premium || 0).toLocaleString()}
              </h2>
              <span className="text-cyan-500 font-mono text-xs font-black tracking-widest uppercase">INR</span>
            </div>
          </div>

          <div className="mt-12 relative z-10">
            <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">
              <span>Risk Coverage (VaR)</span>
              <span className="text-cyan-400">95% Confidence</span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden p-[1px] border border-white/5">
              <div className="bg-gradient-to-r from-cyan-600 to-cyan-400 h-full rounded-full w-[95%] shadow-[0_0_10px_rgba(6,182,212,0.4)]" />
            </div>
          </div>

          <TrendingUp className="absolute -right-12 -bottom-12 w-48 h-48 text-white/[0.03] rotate-12 pointer-events-none" />
        </div>

        {/* 2. ACTUARIAL BREAKDOWN: High-Density Workspace */}
        <div className="p-10 md:col-span-2 space-y-10 bg-white">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
            
            {/* Expected Loss Component */}
            <div className="space-y-3 group">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-slate-400 group-hover:text-cyan-500 transition-colors" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Base Risk (E[L])</span>
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-black !text-black italic tracking-tighter tabular-nums">
                  ₹{(result.expectedLoss || 0).toLocaleString()}
                </p>
                <div className="inline-flex items-center px-2 py-1 bg-cyan-50 border border-cyan-100/50 rounded-lg">
                  <code className="text-[10px] font-black font-mono text-cyan-700 tracking-tighter">
                    {FORMULAS.expLoss}
                  </code>
                </div>
              </div>
            </div>

            {/* VaR Margin Component */}
            <div className="space-y-3 group">
              <div className="flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tail Margin (VaR)</span>
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-black !text-black italic tracking-tighter tabular-nums">
                  ₹{(result.varMargin || (result.premium - result.expectedLoss)).toFixed(2)}
                </p>
                <div className="inline-flex items-center px-2 py-1 bg-indigo-50 border border-indigo-100/50 rounded-lg">
                  <code className="text-[10px] font-black font-mono text-indigo-700 tracking-tighter">
                    {FORMULAS.var}
                  </code>
                </div>
              </div>
            </div>
          </div>

          <div className="h-[1px] bg-slate-100 w-full" />

          {/* 3. UNDERWRITING INSIGHTS: Informational Footer */}
          <div className="flex items-start gap-6 bg-slate-50 p-6 rounded-3xl border border-slate-100 group hover:border-slate-200 transition-all">
            <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-200 shrink-0 group-hover:rotate-12 transition-transform">
              <Zap className="w-5 h-5 text-amber-500" />
            </div>
            <div className="space-y-2">
              <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest italic">
                Underwriting Intelligence
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Premium includes a safety loading of <span className="font-bold text-slate-700">{FORMULAS.loading}</span> derived from the Shannon Entropy of the current Markov trajectory. 
                This accounts for historical volatility <span className="font-bold text-slate-700 font-mono">(σ̂ᵢ)</span> detected within the ingested <span className="font-bold text-slate-700">S₀</span> record set.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}