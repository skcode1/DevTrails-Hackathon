import { TrendingUp, TrendingDown, Minus } from "lucide-react";

/**
 * @param {"up" | "down" | "neutral" | "bad"} [trendType]
 * @param {"up" | "down" | "neutral" | "bad"} [type] — alias for trendType (Dashboard legacy)
 */
export default function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  trendType,
  type,
  description,
  desc,
}) {
  const subtext = description ?? desc;
  const variant = trendType ?? type ?? "neutral";

  const trendStyles = {
    up: "text-emerald-600 bg-emerald-50 border-emerald-100",
    down: "text-blue-600 bg-blue-50 border-blue-100",
    bad: "text-rose-600 bg-rose-50 border-rose-100",
    neutral: "text-slate-600 bg-slate-50 border-slate-100",
  };

  const TrendIcon =
    variant === "up" || variant === "bad"
      ? TrendingUp
      : variant === "down"
        ? TrendingDown
        : Minus;

  return (
    <div className="group flex min-h-[140px] flex-col bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="p-2.5 bg-slate-50 rounded-lg group-hover:bg-cyan-50 transition-colors duration-200 shrink-0">
          {Icon && (
            <Icon className="w-5 h-5 text-slate-600 group-hover:text-cyan-600" />
          )}
        </div>
        {trend ? (
          <div
            className={`flex shrink-0 items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold ${trendStyles[variant] ?? trendStyles.neutral}`}
          >
            <TrendIcon className="w-3 h-3 shrink-0" />
            <span className="max-w-[5.5rem] truncate sm:max-w-none">{trend}</span>
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex flex-1 flex-col gap-1">
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </p>
        <p className="text-xl font-bold text-slate-900 tracking-tight tabular-nums break-words sm:text-2xl">
          {value}
        </p>
        {subtext ? (
          <p className="text-[11px] text-slate-400 font-medium leading-snug mt-auto pt-2">
            {subtext}
          </p>
        ) : null}
      </div>
    </div>
  );
}
