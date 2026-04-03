import { TrendingUp, TrendingDown, Minus } from "lucide-react";

/**
 * @param {LucideIcon} icon - The Lucide icon component to display
 * @param {string} trend - The percentage or string to show (e.g., "+12%")
 * @param {string} trendType - 'up' | 'down' | 'neutral' | 'bad'
 * @param {string} description - Subtext for accessibility and context
 */
export default function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendType = "neutral", 
  description 
}) {
  
  // Mapping semantic trend types to Tailwind colors
  const trendStyles = {
    up: "text-emerald-600 bg-emerald-50 border-emerald-100",
    down: "text-blue-600 bg-blue-50 border-blue-100",
    bad: "text-rose-600 bg-rose-50 border-rose-100", // For rising fraud/risk
    neutral: "text-slate-600 bg-slate-50 border-slate-100"
  };

  const TrendIcon = trendType === "up" || trendType === "bad" ? TrendingUp : 
                    trendType === "down" ? TrendingDown : Minus;

  return (
    <div className="group bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200">
      <div className="flex items-start justify-between">
        {/* Icon Wrapper */}
        <div className="p-2.5 bg-slate-50 rounded-lg group-hover:bg-cyan-50 transition-colors duration-200">
          {Icon && <Icon className="w-5 h-5 text-slate-600 group-hover:text-cyan-600" />}
        </div>

        {/* Trend Badge */}
        {trend && (
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-bold ${trendStyles[trendType]}`}>
            <TrendIcon className="w-3 h-3" />
            {trend}
          </div>
        )}
      </div>


   


      <div className="group relative p-6 bg-white rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-500 overflow-hidden">
  {/* Subtle background accent for the forensic look */}
  <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full blur-3xl -mr-12 -mt-12 opacity-50 group-hover:bg-emerald-50 transition-colors" />

  <div className="relative z-10 space-y-3">
    {/* 1. Header: Label with extreme tracking */}
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] leading-none">
      {title}
    </p>

    {/* 2. Value: High contrast, italic, black */}
    <div className="flex items-baseline gap-2">
      <h3 className="text-3xl font-black !text-black italic tracking-tighter tabular-nums leading-none">
        {value}
      </h3>
      {/* Visual indicator for "Live/Synced" status */}
      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] mb-1" />
    </div>

    {/* 3. Description: Smaller, cleaner, muted */}
    {description && (
      <div className="pt-2 border-t border-slate-50">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide leading-relaxed italic opacity-70">
          {description}
        </p>
      </div>
    )}
  </div>
</div>
    </div>
  );
}