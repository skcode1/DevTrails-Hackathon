import {
  MapPin,
  Calendar,
  TrendingUp,
  History,
  Info,
  Mail,
  Phone,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { cloneElement } from "react";
import MetricCard from "../components/dashboard/MetricCard";
import RiskDistributionChart from "../components/dashboard/RiskDistributionChart";
import { useActuarial } from "../context/useActuarial";

const EMPTY = {
  id: "—",
  metrics: {
    mu: "—",
    sigma: "—",
    stability: "—",
    lastPremium: "—",
  },
  history: [],
};

export default function RiderProfile() {
  const { lastPriceRequest, lastPriceResponse } = useActuarial();

  const live = Boolean(lastPriceResponse && lastPriceRequest);
  const riderId = lastPriceRequest?.rider_id ?? EMPTY.id;
  const earnings = lastPriceRequest?.s0_earnings ?? EMPTY.history;

  const metrics = live
    ? {
        mu: `₹${Number(lastPriceResponse.mu).toLocaleString()}`,
        sigma: `₹${Number(lastPriceResponse.sigma).toLocaleString()}`,
        stability: "API",
        lastPremium: `₹${Number(lastPriceResponse.premium).toFixed(2)}`,
      }
    : EMPTY.metrics;

  const initials = riderId
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 2)
    .toUpperCase() || "??";

  return (
    <div className="min-h-full bg-[#f8fafc] p-4 sm:p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto w-full animate-in fade-in duration-700">
      <header className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-2xl shadow-slate-200/40 flex flex-col lg:flex-row gap-10 items-start lg:items-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50" />

        <div className="relative group">
          <div className="w-28 h-28 bg-slate-900 rounded-[2rem] flex items-center justify-center text-white text-4xl font-black shadow-2xl group-hover:rotate-3 transition-transform duration-500 italic uppercase">
            {initials}
          </div>
          <div className="absolute -bottom-2 -right-2 bg-emerald-500 border-4 border-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
        </div>

        <div className="flex-1 space-y-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-black !text-black tracking-tighter uppercase italic">
                {live ? riderId : "No session"}
              </h1>
              <span className="px-3 py-1 bg-slate-900 text-white text-[9px] font-black rounded-full uppercase tracking-[0.15em]">
                {live ? "Session bound" : "No session"}
              </span>
            </div>
            <p className="text-slate-400 font-bold font-mono text-xs uppercase tracking-widest flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Rider ID • {riderId}
            </p>
          </div>

          <div className="flex flex-wrap gap-6 text-[11px] font-black text-slate-500 uppercase tracking-wider">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-300" /> —
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-300" />{" "}
              {live ? "Last /price payload" : "—"}
            </div>
            <div className="flex items-center gap-2 text-emerald-600 font-black">
              <Zap className="w-4 h-4" /> Risk Pool: Active
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <ContactBtn icon={<Mail />} />
          <ContactBtn icon={<Phone />} />
          <button
            type="button"
            className="px-8 py-4 bg-slate-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all active:scale-95"
          >
            Modify Parameters
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <aside className="lg:col-span-4 space-y-8">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-2">
            Layer 1 baselines
          </h3>

          <div className="space-y-6">
            <MetricCard
              title="Sample mean (μ̂ᵢ)"
              value={metrics.mu}
              description="From pricing engine fit_rider"
            />
            <MetricCard
              title="Sample std dev (σ̂ᵢ)"
              value={metrics.sigma}
              description="Volatility on 14 S₀ days"
            />

            <div className="p-8 bg-slate-950 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
              <TrendingUp className="absolute -right-6 -bottom-6 w-32 h-32 text-white/[0.03] group-hover:scale-110 transition-transform duration-700" />
              <div className="relative z-10">
                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-4">
                  Underwriting ledger
                </p>
                <h4 className="text-3xl font-black italic tracking-tighter mb-4 text-white">
                  {metrics.lastPremium}{" "}
                  <span className="text-xs text-slate-500 font-mono tracking-normal opacity-60">
                    / week
                  </span>
                </h4>
                <div className="pt-4 border-t border-white/10">
                  <p className="text-[10px] text-slate-400 font-medium italic leading-relaxed">
                    Values reflect the latest successful{" "}
                    <code className="font-mono text-indigo-300">POST /price</code>{" "}
                    in this browser session.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div className="lg:col-span-8 space-y-10">
          <section className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-2xl shadow-slate-200/40">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-xl font-black !text-black italic tracking-tighter uppercase leading-none">
                  Income state distribution
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                  π̄ from last pricing response
                </p>
              </div>
              <ActivityIndicator live={live} />
            </div>
            <div className="h-auto">
              <RiskDistributionChart piBar={lastPriceResponse?.pi_bar} />
            </div>
          </section>

          <section className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-2xl shadow-slate-200/40">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <History className="w-5 h-5 text-slate-400" />
                </div>
                <h3 className="text-sm font-black !text-black italic uppercase tracking-widest">
                  S₀ record audit ledger
                </h3>
              </div>
              <Info className="w-5 h-5 text-slate-200 hover:text-slate-900 transition-colors cursor-help" />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <th className="px-10 py-5">Index sequence</th>
                    <th className="px-10 py-5">State status</th>
                    <th className="px-10 py-5 text-right">Raw earnings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {(earnings.length ? earnings : Array(14).fill(null)).map(
                    (val, idx) => (
                      <tr
                        key={idx}
                        className="group hover:bg-slate-50/80 transition-all cursor-pointer"
                      >
                        <td className="px-10 py-5">
                          <span className="text-[11px] font-black text-slate-300 group-hover:text-slate-900 transition-colors uppercase tracking-tighter">
                            D-{14 - idx}
                          </span>
                        </td>
                        <td className="px-10 py-5">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                            <span className="text-[10px] font-black text-emerald-600 uppercase italic">
                              Undisrupted (S₀)
                            </span>
                          </div>
                        </td>
                        <td className="px-10 py-5 text-right font-black !text-black tabular-nums italic text-sm">
                          {val != null
                            ? `₹${Number(val).toLocaleString()}`
                            : "—"}
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function ContactBtn({ icon }) {
  return (
    <button
      type="button"
      className="p-4 bg-white border border-slate-200 text-slate-400 rounded-[1.25rem] shadow-sm hover:text-slate-900 hover:border-slate-900 transition-all active:scale-95"
    >
      {cloneElement(icon, { size: 18 })}
    </button>
  );
}

function ActivityIndicator({ live }) {
  return (
    <div className="flex items-center gap-3 px-5 py-2.5 bg-white rounded-2xl border border-slate-200 shadow-sm">
      <div
        className={`w-2 h-2 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)] ${live ? "bg-emerald-500" : "bg-slate-300"}`}
      />
      <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest italic">
        {live ? "Live /price" : "Awaiting pricing"}
      </span>
    </div>
  );
}
