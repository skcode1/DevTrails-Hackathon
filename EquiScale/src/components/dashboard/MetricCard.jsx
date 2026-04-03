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

      <div className="mt-4 space-y-1">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
            {value}
          </h3>
        </div>
        
        {description && (
          <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}