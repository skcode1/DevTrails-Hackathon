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
  Database,
  AlertTriangle,
  TrendingUp
} from "lucide-react";
import MetricCard from "../components/dashboard/MetricCard";
import RiskDistributionChart from "../components/dashboard/RiskDistributionChart";
import PremiumBreakdownCard from "../components/dashboard/PremiumBreakdownCard";

const DASHBOARD_DATA = {
  metrics: [
    { 
      title: "Active Risk Pool", 
      value: "12,480", 
      trend: "+12.5%", 
      type: "up", 
      icon: Users, 
      desc: "Insured gig-economy workers" 
    },
    { 
      title: "Avg. Volatility (σ̂)", 
      value: "₹1,240", 
      trend: "-2.4%", 
      type: "down", 
      icon: Activity, 
      desc: "Deviation from income baseline" 
    },
    { 
      title: "Systemic Ruin Risk", 
      value: "0.04%", 
      trend: "Stable", 
      type: "neutral", 
      icon: TrendingDown, 
      desc: "Probability of pool insolvency" 
    },
    { 
      title: "High-Risk Flags", 
      value: "74", 
      trend: "+5", 
      type: "bad", 
      icon: ShieldAlert, 
      desc: "Urgent forensic reviews" 
    },
  ],
  alerts: [
    { id: "CLAIM-7721", status: "Λ < 0.3 (Critical)", severity: "critical", type: "State Fabrication" },
    { id: "CLAIM-8042", status: "Z̃ > 3.5 (High)", severity: "warning", type: "Amount Inflation" },
    { id: "CLAIM-9102", status: "Λ < 0.5 (Moderate)", severity: "warning", type: "Behavioral Shift" }
  ]
};

export default function Dashboard() {
  return (
    // 1. Root wrapper must be full width to fill space next to the Sidebar
    <div className="flex flex-col w-full min-h-screen bg-slate-50">
      
      {/* EXECUTIVE HEADER - Standardized to w-full */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200 w-full">
        <div className="px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-black !text-black opacity-100 tracking-tight leading-none uppercase italic">
  Risk Operations Center
</h1>
              <p className="text-slate-500 text-[10px] font-bold mt-1 uppercase tracking-widest leading-none">
                Real-time actuarial engine • Layers 1-5 monitoring
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 transition-all uppercase tracking-tight">
              <Download className="inline w-3 h-3 mr-2" /> Export Reports
            </button>
            <button className="px-4 py-2 text-xs font-bold text-white bg-slate-950 rounded-xl shadow-lg hover:bg-black transition-all uppercase tracking-widest">
              <RefreshCw className="inline w-3 h-3 mr-2" /> Sync Data
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="p-8 space-y-8 w-full">
        
        {/* EXECUTIVE METRICS GRID */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 w-full">
          {/* Mapping your MetricCards here */}
        </section>

        {/* CORE ANALYTICS GRID - Adjusted for full horizontal stretch */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
          
          {/* State Probability Distribution (Left 8/12) */}
          <div className="lg:col-span-8 bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/60 shadow-xl flex flex-col overflow-hidden">
            <div className="p-8 border-b border-slate-200/50 flex items-center justify-between">
              <div>
               <h3 className="text-xl font-black !text-black opacity-100 italic tracking-tight leading-none">
  State Probability Distribution (pi-bar)
</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Markov Week-Averaged Vector</p>
              </div>
            </div>
            <div className="p-8 h-[400px]">
              <RiskDistributionChart />
            </div>
          </div>

          {/* Premium Engine (Right 4/12) */}
          <div className="lg:col-span-4 bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/60 shadow-xl flex flex-col overflow-hidden group">
            <div className="p-8 border-b border-slate-200/50 bg-gradient-to-r from-amber-50/50 to-transparent flex items-center gap-4">
              <div className="p-3 bg-amber-500 rounded-2xl shadow-lg text-white group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <div>
               <h3 className="text-xl font-black !text-black opacity-100 tracking-tight leading-none">
  Premium Engine (η)
</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Entropy-Adjusted</p>
              </div>
            </div>
            <div className="p-8 flex-1 overflow-visible">
              <PremiumBreakdownCard />
            </div>
          </div>
        </section>

        {/* FORENSIC COMMAND CENTER - Full Stretch Rectified */}
        <section className="w-full bg-slate-950 rounded-[2.5rem] overflow-hidden relative border border-slate-800 shadow-2xl group py-12 px-10">
          <div 
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
              backgroundSize: '40px 40px'
            }}
          />
          <div className="relative z-10 w-full">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-12 border-b border-white/5 pb-8">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-rose-600 rounded-3xl shadow-[0_0_40px_rgba(225,29,72,0.3)] text-white shrink-0 border-2 border-white/10">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-white tracking-tighter italic uppercase">Forensic Command</h3>
                  <p className="text-slate-400 text-sm mt-2 max-w-2xl font-medium leading-relaxed">
                    Intercepting anomalies via <span className="text-rose-400 font-mono">Z̃</span> and <span className="text-rose-400 font-mono">Λ</span> gates.
                  </p>
                </div>
              </div>
              <button className="flex items-center gap-3 px-8 py-4 bg-white text-slate-950 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-xl active:scale-95">
                Audit Ledger <ArrowUpRight className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 w-full">
              {DASHBOARD_DATA.alerts.map((alert, idx) => (
                <div key={alert.id} className={`group/card p-8 rounded-[2rem] border-2 transition-all duration-500 cursor-pointer backdrop-blur-xl relative overflow-hidden flex flex-col justify-between ${alert.severity === 'critical' ? 'bg-rose-500/[0.03] border-rose-500/20 hover:border-rose-500/60' : 'bg-white/[0.02] border-white/10 hover:border-white/40'}`}>
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-[10px] font-mono font-bold text-slate-500 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 uppercase tracking-widest">{alert.id}</span>
                      <div className={`w-2 h-2 rounded-full animate-pulse ${alert.severity === 'critical' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                    </div>
                    <h4 className="text-white font-black text-xl mb-3 uppercase italic tracking-tight">{alert.type}</h4>
                    <p className="text-slate-400 text-[10px] font-mono font-bold uppercase tracking-tight">Gate: {alert.status}</p>
                  </div>
                  <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between font-mono text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                    <span>Priority-0{idx + 1}</span>
                    <span className="italic">14:22:05</span>
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