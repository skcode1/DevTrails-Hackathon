import { ShieldCheck, ShieldAlert, AlertCircle, Fingerprint } from "lucide-react";

/**
 * FraudSignalBadge - Layer 5 Status Indicator
 * @param {string} type - 'pass' | 'review' | 'flag'
 * @param {string} trigger - 'amount' | 'state' | 'both' (The statistical gate that failed)
 */
export default function FraudSignalBadge({ type = "pass", trigger = null }) {
  
  // Configuration for different fraud states
  const statusConfig = {
    pass: {
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: ShieldCheck,
      label: "Verified",
      description: "Statistical thresholds met."
    },
    review: {
      color: "bg-amber-50 text-amber-700 border-amber-200",
      icon: AlertCircle,
      label: "Review",
      description: "Minor variance detected."
    },
    flag: {
      color: "bg-rose-50 text-rose-700 border-rose-200",
      icon: ShieldAlert,
      label: "Flagged",
      description: "Critical threshold breach."
    }
  };

  const current = statusConfig[type] || statusConfig.pass;
  const Icon = current.icon;

  // LaTeX-safe trigger labels
  const getTriggerLabel = () => {
    if (trigger === 'amount') return String.raw`$\tilde{Z} > 3.5$`;
    if (trigger === 'state') return String.raw`$\Lambda < 0.3$`;
    if (trigger === 'both') return String.raw`$\tilde{Z} \cap \Lambda$`;
    return null;
  };

  return (
    <div className="inline-flex items-center gap-2 group relative">
      {/* Main Badge */}
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-tight transition-all ${current.color}`}>
        <Icon className="w-3 h-3" />
        {current.label}
        
        {/* Sub-indicator for specific statistical gate */}
        {trigger && (
          <span className="ml-1 pl-1.5 border-l border-current opacity-70 font-mono lowercase">
            {getTriggerLabel()}
          </span>
        )}
      </div>

      {/* Hover Tooltip: Contextual Evidence */}
      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 p-3 bg-slate-900 text-white rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
        <div className="flex items-start gap-2">
          <Fingerprint className="w-4 h-4 text-cyan-400 shrink-0" />
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase text-slate-400">Forensic Context</p>
            <p className="text-[10px] leading-relaxed text-slate-200 italic">
              {current.description} {trigger && String.raw`Triggered by Layer 5 ${getTriggerLabel()} logic.`}
            </p>
          </div>
        </div>
        {/* Tooltip Tail */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900" />
      </div>
    </div>
  );
}