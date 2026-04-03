import { ShieldAlert, ShieldCheck, Fingerprint, BarChart3, DollarSign } from "lucide-react";

/**
 * ClaimReviewCard - Layer 5 Fraud Detection UI
 */
export default function ClaimReviewCard({ claim }) {
  // 1. Fallback handling to prevent "undefined" errors
  const data = claim || {
    id: "CLM-99283-X",
    rider: "R. Smith (ID-442)",
    claimedState: "S3",
    claimedAmount: 4200,
    expectedAmount: 1240,
    zScore: 4.2,
    lambdaRatio: 0.22,
    status: "flagged"
  };

  // 2. Safe ID parsing to prevent the crash
  const getAvatarCode = (id) => {
    if (!id || typeof id !== 'string') return "??";
    const parts = id.split('-');
    // Safely get the second part if it exists, otherwise use the first
    const target = parts[1] || parts[0];
    return target.substring(0, 2).toUpperCase();
  };

  const isAmountFlagged = (data.zScore || 0) > 3.5;
  const isStateFlagged = (data.lambdaRatio || 0) < 0.3;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500">
      
      {/* Card Header */}
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-xs">
            {getAvatarCode(data.id)}
          </div>
          <div>
            <h3 className="text-sm font-black !text-black tracking-tight">{data.id}</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{data.rider}</p>
          </div>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase ${
          data.status === 'flagged' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
        }`}>
          {data.status === 'flagged' ? <ShieldAlert className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
          {data.status}
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 relative">
        
        {/* Step 1: Amount Inflation Test */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-md ${isAmountFlagged ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-400'}`}>
              <DollarSign className="w-4 h-4" />
            </div>
            <span className="text-xs font-black !text-black uppercase tracking-tight italic">Step 1: Amount Test</span>
          </div>
          
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Z̃-Score Output</span>
              <span className={`text-lg font-mono font-bold ${isAmountFlagged ? 'text-rose-600' : 'text-slate-900'}`}>
                {(data.zScore || 0).toFixed(2)}
              </span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-2">
              <div 
                className={`h-full transition-all duration-1000 ${isAmountFlagged ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                style={{ width: `${Math.min(((data.zScore || 0) / 5) * 100, 100)}%` }} 
              />
            </div>
            <p className="text-[10px] font-bold text-slate-500 italic mt-2">
              Z̃ = 0.6745 × (Actual − Median) / MAD
            </p>
          </div>
          {isAmountFlagged && (
            <p className="text-[10px] text-rose-500 font-bold leading-relaxed italic">
              * Significant deviation from median loss. Request documentation.
            </p>
          )}
        </div>

        {/* Step 2: State Fabrication Test */}
        <div className="space-y-4 border-l border-slate-100 pl-8">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-md ${isStateFlagged ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-400'}`}>
              <BarChart3 className="w-4 h-4" />
            </div>
            <span className="text-xs font-black !text-black uppercase tracking-tight italic">Step 2: State Test</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Lambda Λ Ratio</span>
              <span className={`text-lg font-mono font-bold ${isStateFlagged ? 'text-rose-600' : 'text-slate-900'}`}>
                {(data.lambdaRatio || 0).toFixed(2)}
              </span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-2 rotate-180">
              <div 
                className={`h-full transition-all duration-1000 ${isStateFlagged ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                style={{ width: `${(1 - (data.lambdaRatio || 0)) * 100}%` }} 
              />
            </div>
            <p className="text-[10px] font-bold text-slate-500 italic mt-2">
              Λ = Predicted State Prob. / Observed Trace
            </p>
          </div>
          {isStateFlagged && (
            <p className="text-[10px] text-rose-500 font-bold leading-relaxed italic">
              * Claimed state {data.claimedState} implausible via Markov Gate. Verify logs.
            </p>
          )}
        </div>

        <Fingerprint className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 text-slate-900/[0.02] pointer-events-none" />
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
        <button className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase">
          Dismiss Alert
        </button>
        <button className="px-6 py-2 bg-slate-950 text-white text-xs font-black rounded-lg hover:bg-black shadow-md transition-all uppercase tracking-widest">
          Trigger Evidence Request
        </button>
      </div>
    </div>
  );
}