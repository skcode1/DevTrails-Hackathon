import { ShieldAlert, Search, Filter, ArrowUpDown, FileText, Activity, AlertCircle, CheckCircle2, MoreHorizontal } from "lucide-react";
import ClaimReviewCard from "../components/fraud/ClaimReviewCard";

const MOCK_CLAIMS = [
  { id: "CLM-99283-X", rider: "R. Smith", amount: 4200, state: "S3", zScore: 4.20, lambda: 0.22, status: "flag" },
  { id: "CLM-99284-A", rider: "J. Doe", amount: 1500, state: "S1", zScore: 1.10, lambda: 0.85, status: "pass" },
  { id: "CLM-99285-B", rider: "L. Wayne", amount: 2800, state: "S2", zScore: 2.90, lambda: 0.45, status: "review" },
  { id: "CLM-99286-C", rider: "S. Parker", amount: 5500, state: "S3", zScore: 5.10, lambda: 0.15, status: "flag" },
];

export default function FraudReview() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-10 space-y-10 animate-in fade-in duration-700">
      
      {/* 1. ENTERPRISE HEADER */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-200 pb-10">
        <div className="space-y-2">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-rose-500 rounded-xl shadow-lg shadow-rose-200">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Risk Mitigation Cluster v4.2
            </span>
          </div>
          <h1 className="text-4xl font-black !text-black tracking-tighter italic uppercase">
            Claims <span className="text-slate-400">Adjudication</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium italic">
            Reviewing Layer 5 anomalies detected via Z̃ (Amount) and Λ (Behavioral) statistical gates.
          </p>
        </div>

        {/* Global Risk Metrics Dashboard */}
        <div className="flex items-center gap-4 bg-white p-3 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100">
          <header className="px-4 py-1 border-r border-slate-100">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Detection Rate</p>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black !text-black italic tracking-tighter">4.28%</span>
              <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
            </div>
          </header>
          <header className="px-4 py-1">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Alerts</p>
            <span className="text-xl font-black text-rose-600 italic tracking-tighter">12 Active</span>
          </header>
        </div>
      </header>

      {/* 2. COMMAND CONTROL BAR */}
      <div className="flex flex-col xl:flex-row gap-6 items-center justify-between bg-white/60 backdrop-blur-md p-5 rounded-3xl border border-white shadow-xl shadow-slate-200/30">
        <div className="relative w-full xl:w-[450px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search forensic ledger by Claim ID or Rider Name..." 
            className="w-full pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-[1.25rem] text-sm font-medium outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all shadow-inner"
          />
        </div>
        <div className="flex items-center gap-3 w-full xl:w-auto">
          <ControlBtn icon={<Filter />} label="Filter by Trigger" />
          <ControlBtn icon={<ArrowUpDown />} label="Sort by Z̃-Score" />
          <button className="p-3.5 bg-slate-900 text-white rounded-2xl hover:bg-black transition-colors shadow-lg">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 3. MAIN INVESTIGATION WORKSPACE */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
        
        {/* LEDGER LIST (7/12) */}
        <div className="xl:col-span-7 group">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden transition-all duration-500">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Forensic Identity</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Gate Trigger</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Magnitude</th>
                  <th className="px-8 py-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {MOCK_CLAIMS.map((claim) => (
                  <tr key={claim.id} className="group/row hover:bg-slate-50/80 transition-all cursor-pointer">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm group-hover/row:scale-110 transition-transform">
                          <FileText className="w-5 h-5 text-slate-400 group-hover/row:text-slate-900 transition-colors" />
                        </div>
                        <div>
                          <p className="text-sm font-black !text-black italic tracking-tighter uppercase">{claim.id}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{claim.rider}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-center">
                         <StatusBadge status={claim.status} score={claim.zScore} />
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <p className="text-sm font-black !text-black tabular-nums">₹{claim.amount.toLocaleString()}</p>
                      <span className="text-[10px] font-mono font-bold text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-100 uppercase tracking-tighter">
                         State: {claim.state}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <button className="p-2.5 text-slate-300 hover:text-slate-900 hover:bg-white rounded-xl border border-transparent hover:border-slate-100 transition-all">
                          <Activity className="w-4 h-4" />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* DETAILED FORENSIC SIDEBAR (5/12) */}
        <aside className="xl:col-span-5 space-y-8 sticky top-10">
          <div className="px-4 flex justify-between items-end">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">Forensic Investigation</h3>
            <span className="flex items-center gap-2 text-[10px] font-bold text-cyan-600 uppercase italic">
              
            </span>
          </div>
          
          <ClaimReviewCard claim={MOCK_CLAIMS[0]} />
          
          {/* Action Protocol Card */}
          <div className="p-8 bg-slate-950 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <AlertCircle className="w-32 h-32 text-white" />
             </div>
             <div className="relative z-10">
                <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-4">Protocol: Next Steps</h4>
                <div className="space-y-4">
                   <ProtocolItem text="Request 14-day GPS platform logs for behavioral Λ verification." />
                   <ProtocolItem text="Provisional account freeze (Premium recalculation suspended)." />
                   <ProtocolItem text="Cross-reference claims via Z̃ magnitude pool median." />
                </div>
             </div>
          </div>
        </aside>

      </div>
    </div>
  );
}

// HELPER COMPONENTS
function ControlBtn({ icon, label }) {
  return (
    <button className="flex items-center gap-3 px-6 py-3.5 text-[10px] font-black !text-black bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all uppercase tracking-widest shadow-sm">
      {icon} {label}
    </button>
  );
}

function StatusBadge({ status, score }) {
  const configs = {
    flag: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100', icon: <ShieldAlert className="w-3 h-3"/>, label: 'Flagged' },
    pass: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', icon: <CheckCircle2 className="w-3 h-3"/>, label: 'Passed' },
    review: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', icon: <Activity className="w-3 h-3"/>, label: 'Review' }
  };
  const config = configs[status] || configs.review;
  
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${config.bg} ${config.text} ${config.border} text-[9px] font-black uppercase tracking-tighter shadow-sm`}>
      {config.icon}
      {config.label}
    </div>
  );
}

function ProtocolItem({ text }) {
  return (
    <div className="flex gap-4 group/item">
       <div className="h-5 w-5 bg-white/5 rounded-full flex items-center justify-center shrink-0 mt-0.5 border border-white/10 group-hover/item:border-indigo-500/50 transition-colors">
          <div className="h-1.5 w-1.5 bg-indigo-500 rounded-full" />
       </div>
       <p className="text-[11px] text-slate-300 font-medium leading-relaxed italic opacity-80 group-hover/item:opacity-100 transition-opacity">
          {text}
       </p>
    </div>
  );
}