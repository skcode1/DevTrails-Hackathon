import {
  Users,
  TrendingDown,
  ShieldAlert,
  Activity,
  BarChart3,
  Zap,
  ArrowUpRight,
  Download,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import MetricCard from "../components/dashboard/MetricCard";
import RiskDistributionChart from "../components/dashboard/RiskDistributionChart";
import PremiumBreakdownCard from "../components/dashboard/PremiumBreakdownCard";
import { useActuarial } from "../context/useActuarial";
import { formatInr } from "../lib/formatters";

const STATIC_METRICS = [
  {
    title: "Active Risk Pool",
    value: "—",
    trend: "Run pricing",
    trendType: "neutral",
    icon: Users,
    desc: "Connect API and run Premium Pricing for live μ, σ",
  },
  {
    title: "Avg. Volatility (σ̂)",
    value: "—",
    trend: "",
    trendType: "neutral",
    icon: Activity,
    desc: "From last pricing response",
  },
  {
    title: "Weekly Premium",
    value: "—",
    trend: "",
    trendType: "neutral",
    icon: TrendingDown,
    desc: "Last POST /price premium",
  },
  {
    title: "Fraud adjudications",
    value: "0",
    trend: "Fraud page",
    trendType: "neutral",
    icon: ShieldAlert,
    desc: "POST /price-and-fraud results",
  },
];

export default function Dashboard() {
  const {
    lastPriceResponse,
    adjudications,
    refreshHealth,
    healthOk,
    modelsLoaded,
  } = useActuarial();

  const metrics = lastPriceResponse
    ? [
        {
          title: "Baseline (μ̂)",
          value: formatInr(lastPriceResponse.mu),
          trend: "Live",
          trendType: "up",
          icon: Activity,
          desc: "Sample mean — 14 S₀ daily earnings",
        },
        {
          title: "Volatility (σ̂)",
          value: formatInr(lastPriceResponse.sigma),
          trend: "Live",
          trendType: "neutral",
          icon: TrendingUp,
          desc: "Sample std. dev. of S₀ series",
        },
        {
          title: "Weekly Premium",
          value: formatInr(lastPriceResponse.premium),
          trend: "Synced",
          trendType: "up",
          icon: BarChart3,
          desc: "Pure + entropy load + VaR + opex",
        },
        {
          title: "Entropy η",
          value: String(lastPriceResponse.entropy_eta),
          trend: "π̄",
          trendType: "neutral",
          icon: Zap,
          desc: "Normalized Shannon entropy of π̄",
        },
      ]
    : STATIC_METRICS;

  const flagCount = adjudications.filter(
    (a) => a.fraud?.overall === "FLAG",
  ).length;

  const metricsWithFraud = metrics.map((m, i) =>
    i === 3 && !lastPriceResponse
      ? {
          ...m,
          value: String(adjudications.length),
          trend: flagCount ? `${flagCount} FLAG` : "—",
          trendType: flagCount ? "bad" : "neutral",
        }
      : m,
  );

  const alerts =
    adjudications.length > 0
      ? adjudications.slice(0, 6).map((a) => ({
          id: a.id,
          status: `Z̃=${a.fraud.Z_tilde} · Λ=${a.fraud.Lambda}`,
          severity:
            a.fraud.overall === "FLAG"
              ? "critical"
              : a.fraud.overall === "REVIEW"
                ? "warning"
                : "warning",
          type: `${a.fraud.overall} · ${a.fraud.amount_decision} / ${a.fraud.state_decision}`,
        }))
      : [
          {
            id: "—",
            status: "No adjudications yet",
            severity: "warning",
            type: "Open Fraud Review and run /price-and-fraud",
          },
        ];

  /* Full-bleed in padded main: negative margin alone does not widen a 100%-width child. */
  return (
    <div
      className={
        "flex flex-col min-h-full max-w-none bg-slate-50 " +
        "w-[calc(100%+2rem)] -mx-4 sm:w-[calc(100%+3rem)] sm:-mx-6 lg:w-[calc(100%+4rem)] lg:-mx-8"
      }
    >
      <header className="relative w-full min-w-0 border-b border-slate-200 bg-white shadow-none [box-shadow:none]">
        <div className="px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-5 max-w-[1600px] mx-auto w-full min-w-0">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center shrink-0 border border-white/25">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl lg:text-2xl font-black !text-black tracking-tight leading-tight uppercase italic">
                Risk Operations Center
              </h1>
              <p className="text-slate-500 text-[10px] font-bold mt-1.5 uppercase tracking-widest leading-relaxed">
                Live metrics from{" "}
                <span className="font-mono text-cyan-700">/price</span> and{" "}
                <span className="font-mono text-cyan-700">/price-and-fraud</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors uppercase tracking-tight"
            >
              <Download className="inline w-3 h-3 mr-2" /> Export Reports
            </button>
            <button
              type="button"
              onClick={() => refreshHealth()}
              className="px-4 py-2.5 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors uppercase tracking-widest"
            >
              <RefreshCw className="inline w-3 h-3 mr-2" />
              Refresh health
            </button>
            <span
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold ${
                healthOk && modelsLoaded
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : healthOk === false
                    ? "border-rose-200 bg-rose-50 text-rose-800"
                    : "border-amber-200 bg-amber-50 text-amber-900"
              }`}
            >
              {healthOk === null
                ? "Checking API…"
                : healthOk && modelsLoaded
                  ? "Models ready"
                  : healthOk
                    ? "API up · models loading"
                    : "API unreachable"}
            </span>
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 lg:px-8 pt-6 lg:pt-8 pb-8 space-y-8 w-full max-w-[1600px] mx-auto">
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 w-full">
          {metricsWithFraud.map((m) => (
            <MetricCard key={m.title} {...m} />
          ))}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 w-full items-stretch">
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-lg flex flex-col min-h-[420px] overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-lg font-black !text-black italic tracking-tight">
                  State probability (π̄)
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  From last pricing response
                </p>
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col min-h-0">
              <RiskDistributionChart piBar={lastPriceResponse?.pi_bar} />
            </div>
          </div>

          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-lg flex flex-col min-h-[420px] overflow-hidden group">
            <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-amber-50/60 to-transparent flex items-center gap-4 shrink-0">
              <div className="p-3 bg-amber-500 rounded-xl shadow-md text-white group-hover:scale-105 transition-transform">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black !text-black tracking-tight">
                  Premium engine (η)
                </h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                  Entropy-adjusted
                </p>
              </div>
            </div>
            <div className="p-6 flex-1 overflow-auto">
              <PremiumBreakdownCard pricing={lastPriceResponse} />
            </div>
          </div>
        </section>

        <section className="w-full bg-slate-950 rounded-2xl overflow-hidden relative border border-slate-800 shadow-xl py-10 px-6 lg:px-10">
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
            }}
          />
          <div className="relative z-10 w-full">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10 border-b border-white/5 pb-8">
              <div className="flex items-center gap-5">
                <div className="p-3.5 bg-rose-600 rounded-2xl shadow-lg text-white shrink-0 border border-white/10">
                  <ShieldAlert className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tight italic uppercase">
                    Forensic command
                  </h3>
                  <p className="text-slate-400 text-sm mt-2 max-w-2xl font-medium leading-relaxed">
                    Recent{" "}
                    <span className="text-rose-400 font-mono">/price-and-fraud</span>{" "}
                    outcomes.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="flex items-center gap-2 px-6 py-3 bg-white text-slate-950 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-rose-50 transition-all shadow-md"
              >
                Audit ledger <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
              {alerts.map((alert, idx) => (
                <div
                  key={alert.id + String(idx)}
                  className={`group/card p-6 rounded-2xl border transition-all duration-300 backdrop-blur-xl flex flex-col justify-between min-h-[160px] ${
                    alert.severity === "critical"
                      ? "bg-rose-500/[0.06] border-rose-500/25 hover:border-rose-500/50"
                      : "bg-white/[0.03] border-white/10 hover:border-white/25"
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[10px] font-mono font-bold text-slate-500 bg-black/40 px-2.5 py-1 rounded-lg border border-white/5 uppercase tracking-widest truncate max-w-[70%]">
                        {alert.id}
                      </span>
                      <div
                        className={`w-2 h-2 rounded-full shrink-0 animate-pulse ${alert.severity === "critical" ? "bg-rose-500" : "bg-amber-500"}`}
                      />
                    </div>
                    <h4 className="text-white font-black text-lg mb-2 uppercase italic tracking-tight leading-snug">
                      {alert.type}
                    </h4>
                    <p className="text-slate-400 text-[10px] font-mono font-bold uppercase tracking-tight leading-relaxed">
                      Gate: {alert.status}
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between font-mono text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                    <span>P-{String(idx + 1).padStart(2, "0")}</span>
                    <span className="italic">Session</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
