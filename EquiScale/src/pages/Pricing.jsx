import {
  Calculator,
  History,
  Zap,
  ShieldCheck,
  Info,
  ArrowRight,
  Activity,
  Cpu,
} from "lucide-react";
import EarningsUploadForm from "../components/pricing/EarningsUploadForm";
import PricingResultCard from "../components/pricing/PricingResultCard";
import MarkovStateTable from "../components/pricing/MarkovStateTable";
import { usePricing } from "../hooks/usePricing";
import { useActuarial } from "../context/useActuarial";

const COPY = {
  headerDesc:
    "Premiums from μ, σ on S₀ earnings and the engine’s Markov-adjusted transition model.",
  markovNote: "Row-stochastic P adjusted from rider features (API).",
};

export default function Pricing() {
  const { appDefaults, defaultsLoading, defaultsError } = useActuarial();
  const { result, calculatePremium, loading, error } = usePricing();

  const template = appDefaults?.template;
  const s0Count = appDefaults?.s0_record_count ?? 14;
  const lam = template?.lam;
  const alpha = template?.alpha;
  const versionLine = appDefaults?.ui?.appVersion?.trim();

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 lg:p-8 space-y-8 lg:space-y-10 animate-in fade-in duration-700 max-w-[1600px] mx-auto w-full">
      <header className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 pb-10 border-b border-slate-200/60">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
            {versionLine ? (
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                {versionLine}
              </span>
            ) : (
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Pricing workspace
              </span>
            )}
          </div>
          <h1 className="text-4xl font-black !text-black tracking-tighter italic uppercase">
            Premium <span className="text-slate-400">Underwriting</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium max-w-xl">{COPY.headerDesc}</p>
        </div>

        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-200/50">
          <StatusPill color="bg-emerald-500" label="S₀ Verified" />
          <div className="h-4 w-[1px] bg-slate-200" />
          <StatusPill color="bg-cyan-500" label="π̄ Active" />
        </div>
      </header>

      {!defaultsLoading && !appDefaults ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          Could not load pricing defaults. Start the API (GET /pricing-defaults) or fix{" "}
          <code className="font-mono text-xs">public/defaults.json</code>.
          {defaultsError ? (
            <span className="block text-xs mt-2 font-mono opacity-90">{defaultsError}</span>
          ) : null}
        </div>
      ) : null}

      {defaultsLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
          Loading defaults from API…
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
        <div className="lg:col-span-4 flex flex-col gap-6">
          <section className="group relative bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden transition-shadow hover:shadow-xl flex flex-col shrink-0">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-200">
                  <History className="w-4 h-4 text-slate-600" />
                </div>
                <h3 className="font-black !text-black text-xs uppercase tracking-widest">
                  Data Ingestion
                </h3>
              </div>
              <Info className="w-4 h-4 text-slate-300 hover:text-cyan-500 transition-colors cursor-help" />
            </div>

            <div className="p-6 sm:p-8 flex flex-col gap-0">
              {error && (
                <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-800">
                  {error}
                </div>
              )}
              <EarningsUploadForm
                onSubmit={calculatePremium}
                isLoading={loading}
                requiredRecords={s0Count}
                defaultsReady={Boolean(appDefaults?.template)}
              />

              <div className="mt-6 p-4 bg-slate-900 rounded-xl relative overflow-hidden shrink-0">
                <div className="relative z-10 flex items-start gap-3">
                  <Activity className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-slate-300 font-mono leading-relaxed">
                    Exactly {s0Count} undisrupted (S₀) daily earnings (₹) — matches POST /price.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <div className="p-6 sm:p-8 bg-slate-950 rounded-2xl text-white shadow-lg relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 flex flex-col flex-1 min-h-[200px]">
            <Cpu className="absolute -right-4 -top-4 w-32 h-32 text-white/[0.03]" />
            <div className="relative z-10 space-y-6">
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-2">
                  Engine State
                </h4>
                <p className="text-xl font-bold tracking-tight leading-tight">
                  Entropy Loading: Enabled
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <ParamBadge
                  label={
                    lam != null ? `λ = ${lam}` : "λ = —"
                  }
                />
                <ParamBadge
                  label={
                    alpha != null ? `α = ${alpha}` : "α = —"
                  }
                />
                <ParamBadge label="GATE: ACTIVE" />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 flex flex-col gap-6 lg:gap-8 min-h-[520px]">
          {loading ? (
            <LoadingState />
          ) : result ? (
            <div className="space-y-6 lg:space-y-8 animate-in zoom-in-95 duration-500 flex flex-col flex-1">
              <PricingResultCard result={result} />

              <section className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden flex-1 flex flex-col min-h-0">
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-50/50 shrink-0">
                  <div>
                    <h3 className="text-xl font-black !text-black italic tracking-tighter uppercase">
                      Markov Transition Matrix
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 tracking-widest mt-1 uppercase">
                      {COPY.markovNote}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">
                      Verified
                    </span>
                  </div>
                </div>
                <div className="p-4 sm:p-6 overflow-x-auto custom-scrollbar flex-1">
                  <MarkovStateTable data={result.pMatrix} />
                </div>
              </section>
            </div>
          ) : (
            <EmptyStatePlaceholder />
          )}
        </div>
      </div>
    </div>
  );
}

function StatusPill({ color, label }) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-2 bg-white rounded-xl text-[10px] font-black !text-black uppercase tracking-wider group transition-all hover:bg-slate-50">
      <div
        className={`w-2 h-2 rounded-full ${color} shadow-[0_0_10px_rgba(0,0,0,0.1)]`}
      />
      {label}
    </div>
  );
}

function ParamBadge({ label }) {
  return (
    <div className="px-3 py-1.5 bg-white/5 backdrop-blur-md rounded-lg border border-white/10 text-[10px] font-mono font-bold tracking-tighter text-indigo-200">
      {label}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="h-full min-h-[480px] flex-1 bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center p-10 shadow-inner">
      <div className="relative mb-8">
        <div className="w-20 h-20 border-[6px] border-slate-100 rounded-full" />
        <div className="absolute top-0 w-20 h-20 border-[6px] border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-cyan-500 animate-pulse" />
      </div>
      <h3 className="text-2xl font-black !text-black italic uppercase tracking-tighter">
        Solving Markov Chain
      </h3>
      <p className="text-slate-400 text-[10px] mt-4 font-black font-mono text-center max-w-xs uppercase tracking-[0.2em]">
        Iterating π₀ · Pⁿ across horizon
      </p>
    </div>
  );
}

function EmptyStatePlaceholder() {
  return (
    <div className="h-full min-h-[480px] flex-1 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-10 text-center group transition-all hover:border-cyan-200 hover:bg-cyan-50/10">
      <div className="w-24 h-24 bg-white rounded-[2rem] shadow-xl border border-slate-100 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
        <Calculator className="w-10 h-10 text-slate-300 group-hover:text-cyan-500 transition-colors" />
      </div>
      <h3 className="text-3xl font-black !text-black italic uppercase tracking-tighter">
        Awaiting Actuarial Data
      </h3>
      <p className="text-slate-500 text-sm max-w-sm mt-4 leading-relaxed font-medium">
        Submit S₀ earnings to run the pricing engine.
      </p>
      <div className="mt-8 flex items-center gap-2 text-cyan-600 font-bold text-xs uppercase tracking-widest">
        Inlet Ready <ArrowRight className="w-4 h-4" />
      </div>
    </div>
  );
}
