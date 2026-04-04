import { ShieldAlert, ShieldCheck, Fingerprint, BarChart3, DollarSign } from "lucide-react";

function normalizeOverall(overall, status) {
  const s = String(overall ?? status ?? "")
    .toUpperCase()
    .trim();
  if (s === "FLAG" || s === "FLAGGED") return "FLAG";
  if (s === "PASS" || s === "PASSED") return "PASS";
  if (s === "REVIEW") return "REVIEW";
  return s || "REVIEW";
}

export default function ClaimReviewCard({ claim }) {
  const isPlaceholder = !claim;

  const data = claim || {
    id: "Preview",
    rider: "Run an adjudication to load API results",
    claimedState: "—",
    claimedAmount: 0,
    zScore: null,
    lambdaRatio: null,
    overall: "REVIEW",
    status: "REVIEW",
  };

  const getAvatarCode = (id) => {
    if (!id || typeof id !== "string") return "??";
    const parts = id.split("-");
    const target = parts[1] || parts[0];
    return target.substring(0, 2).toUpperCase();
  };

  const overall = normalizeOverall(data.overall, data.status);
  const isAmountFlagged =
    !isPlaceholder && Number(data.zScore) > 3.5;
  const isStateFlagged =
    !isPlaceholder && Number(data.lambdaRatio) < 0.3;

  const badgeRose =
    overall === "FLAG"
      ? "bg-rose-50 text-rose-600 border-rose-100"
      : overall === "PASS"
        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
        : "bg-amber-50 text-amber-600 border-amber-100";

  const zDisplay =
    data.zScore != null && Number.isFinite(Number(data.zScore))
      ? Number(data.zScore).toFixed(2)
      : "—";
  const lambdaDisplay =
    data.lambdaRatio != null && Number.isFinite(Number(data.lambdaRatio))
      ? Number(data.lambdaRatio).toFixed(2)
      : "—";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden flex flex-col min-h-[320px]">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/40 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-xs shrink-0">
            {getAvatarCode(data.id)}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-black !text-black tracking-tight truncate">
              {data.id}
            </h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">
              {data.rider}
            </p>
          </div>
        </div>
        <div
          className={`flex shrink-0 items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase ${badgeRose}`}
        >
          {overall === "FLAG" ? (
            <ShieldAlert className="w-3 h-3" />
          ) : (
            <ShieldCheck className="w-3 h-3" />
          )}
          {overall}
        </div>
      </div>

      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6 relative flex-1">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div
              className={`p-1.5 rounded-md ${isAmountFlagged ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-400"}`}
            >
              <DollarSign className="w-4 h-4" />
            </div>
            <span className="text-xs font-black !text-black uppercase tracking-tight italic">
              Step 1: Amount test
            </span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex justify-between items-baseline mb-2 gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">
                Z̃-Score
              </span>
              <span
                className={`text-lg font-mono font-bold tabular-nums ${isAmountFlagged ? "text-rose-600" : "text-slate-900"}`}
              >
                {zDisplay}
              </span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-2">
              <div
                className={`h-full transition-all duration-1000 ${isAmountFlagged ? "bg-rose-500" : "bg-emerald-500"}`}
                style={{
                  width: `${isPlaceholder ? 0 : Math.min((Number(data.zScore || 0) / 5) * 100, 100)}%`,
                }}
              />
            </div>
            <p className="text-[10px] font-bold text-slate-500 italic mt-2 min-h-[2rem]">
              {isPlaceholder
                ? "Submit the form above to compute Z̃ from the pricing engine."
                : (data.amountDecision ?? "—")}
            </p>
          </div>
          {isAmountFlagged && (
            <p className="text-[10px] text-rose-500 font-bold leading-relaxed italic">
              * Amount gate triggered (Z̃ &gt; 3.5).
            </p>
          )}
        </div>

        <div className="space-y-3 md:border-l md:border-slate-100 md:pl-6">
          <div className="flex items-center gap-2">
            <div
              className={`p-1.5 rounded-md ${isStateFlagged ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-400"}`}
            >
              <BarChart3 className="w-4 h-4" />
            </div>
            <span className="text-xs font-black !text-black uppercase tracking-tight italic">
              Step 2: State test
            </span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex justify-between items-baseline mb-2 gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">
                Λ ratio
              </span>
              <span
                className={`text-lg font-mono font-bold tabular-nums ${isStateFlagged ? "text-rose-600" : "text-slate-900"}`}
              >
                {lambdaDisplay}
              </span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-2 rotate-180">
              <div
                className={`h-full transition-all duration-1000 ${isStateFlagged ? "bg-rose-500" : "bg-emerald-500"}`}
                style={{
                  width: `${isPlaceholder ? 0 : (1 - Number(data.lambdaRatio || 0)) * 100}%`,
                }}
              />
            </div>
            <p className="text-[10px] font-bold text-slate-500 italic mt-2 min-h-[2rem]">
              {isPlaceholder
                ? "Λ compares π̄ to the stationary distribution for the claimed state."
                : (data.stateDecision ?? "—")}
            </p>
          </div>
          {isStateFlagged && (
            <p className="text-[10px] text-rose-500 font-bold leading-relaxed italic">
              * Claimed state {data.claimedState} flagged (Λ &lt; 0.3).
            </p>
          )}
        </div>

        <Fingerprint className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 text-slate-900/[0.02] pointer-events-none" />
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-auto">
        <p className="text-[10px] text-slate-500 font-mono">
          {isPlaceholder
            ? "No claim selected"
            : `Claim ${data.claimedState} · ₹${Number(data.claimedAmount || 0).toLocaleString("en-IN")}`}
        </p>
        <div className="flex flex-wrap gap-2 justify-end">
          <button
            type="button"
            className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase"
          >
            Dismiss alert
          </button>
          <button
            type="button"
            className="px-5 py-2 bg-slate-950 text-white text-xs font-black rounded-lg hover:bg-black shadow-md transition-all uppercase tracking-widest"
          >
            Trigger evidence request
          </button>
        </div>
      </div>
    </div>
  );
}
