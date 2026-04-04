import {
  ShieldCheck,
  TrendingUp,
  BarChart3,
  ArrowUpRight,
  Zap,
} from "lucide-react";
import { formatInr, formatInrHeadline } from "../../lib/formatters";

export default function PricingResultCard({ result }) {
  const FORMULAS = {
    expLoss: "E[L] = n · π̄ · L_ins",
    loading: "(1 + λη)",
    var: "VaR @ α",
  };

  const premium = result.premium || 0;
  const expLoss = result.expectedLoss ?? result.pure_premium ?? 0;
  const varPart = result.varMargin ?? result.VaR ?? 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-5">
        <div className="p-8 lg:p-10 bg-slate-950 text-white lg:col-span-2 flex flex-col justify-between relative overflow-hidden min-h-[280px]">
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/10 blur-[100px] rounded-full" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-cyan-500 rounded-xl shadow-lg shadow-cyan-500/20">
                <ShieldCheck className="w-5 h-5 text-slate-950" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">
                Finalized quote
              </span>
            </div>

            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">
              Total weekly premium
            </p>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h2 className="text-3xl sm:text-4xl xl:text-5xl font-black tracking-tight italic !text-white tabular-nums leading-none break-all">
                {formatInrHeadline(premium)}
              </h2>
              <span className="text-cyan-500 font-mono text-[10px] font-black tracking-widest uppercase shrink-0">
                INR
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono mt-2 tabular-nums">
              {formatInr(premium)}
            </p>
          </div>

          <div className="mt-8 relative z-10">
            <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">
              <span>Risk coverage (VaR)</span>
              <span className="text-cyan-400">α from request</span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-white/5">
              <div className="bg-gradient-to-r from-cyan-600 to-cyan-400 h-full rounded-full w-[92%]" />
            </div>
          </div>

          <TrendingUp className="absolute -right-8 -bottom-8 w-40 h-40 text-white/[0.04] rotate-12 pointer-events-none" />
        </div>

        <div className="p-8 lg:p-10 lg:col-span-3 space-y-8 bg-white">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-slate-400" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Base risk (pure premium)
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-black !text-black italic tracking-tight tabular-nums break-words">
                {formatInr(expLoss)}
              </p>
              <code className="inline-block text-[10px] font-mono font-bold text-cyan-700 bg-cyan-50 border border-cyan-100/80 rounded-lg px-2 py-1">
                {FORMULAS.expLoss}
              </code>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Tail margin (VaR)
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-black !text-black italic tracking-tight tabular-nums break-words">
                {formatInr(varPart)}
              </p>
              <code className="inline-block text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-100/80 rounded-lg px-2 py-1">
                {FORMULAS.var}
              </code>
            </div>
          </div>

          <div className="h-px bg-slate-100 w-full" />

          <div className="flex items-start gap-5 bg-slate-50 p-5 rounded-2xl border border-slate-100">
            <div className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-200 shrink-0">
              <Zap className="w-5 h-5 text-amber-500" />
            </div>
            <div className="space-y-1.5 min-w-0">
              <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">
                Underwriting note
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Premium includes loading{" "}
                <span className="font-semibold font-mono">{FORMULAS.loading}</span>{" "}
                from entropy of π̄, using volatility σ̂ from the S₀ series.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
