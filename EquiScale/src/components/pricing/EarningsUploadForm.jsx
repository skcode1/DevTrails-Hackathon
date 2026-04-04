import { useState, useMemo } from "react";
import { UploadCloud, AlertCircle, CheckCircle2, Coins } from "lucide-react";

export default function EarningsUploadForm({
  onSubmit,
  isLoading,
  requiredRecords = 14,
  defaultsReady = true,
}) {
  const [inputValue, setInputValue] = useState("");

  const parsedData = useMemo(() => {
    return inputValue
      .split(",")
      .map((val) => val.trim())
      .filter((val) => val !== "" && !isNaN(val))
      .map(Number);
  }, [inputValue]);

  const recordCount = parsedData.length;
  const isComplete = recordCount === requiredRecords;

  const handleAction = () => {
    if (isComplete && !isLoading && defaultsReady) {
      onSubmit(parsedData);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-slate-800 min-w-0">
          <Coins className="w-4 h-4 text-cyan-600 shrink-0" />
          <span className="text-sm font-bold tracking-tight truncate">
            S₀ daily earnings
          </span>
        </div>
        <div
          className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold transition-colors ${
            isComplete
              ? "bg-emerald-50 text-emerald-600"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          {isComplete ? (
            <CheckCircle2 className="w-3 h-3" />
          ) : (
            <ActivityIndicator />
          )}
          {recordCount} / {requiredRecords} days
        </div>
      </div>

      <div className="relative group">
        <textarea
          className={`w-full border-2 rounded-xl p-4 text-sm font-mono transition-all outline-none min-h-[120px] resize-none text-black placeholder:text-slate-400 caret-slate-900 ${
            isComplete
              ? "border-emerald-300 bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
              : "border-slate-200 bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
          }`}
          placeholder={`${requiredRecords} comma-separated values (₹)`}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={isLoading || !defaultsReady}
        />

        {inputValue === "" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-40">
            <UploadCloud className="w-8 h-8 mb-2 text-slate-300" />
            <p className="text-xs text-slate-400">Paste comma-separated earnings</p>
          </div>
        )}
      </div>

      {!isComplete && inputValue !== "" && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-100 text-amber-700">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <p className="text-[11px] leading-relaxed font-medium">
            {recordCount < requiredRecords
              ? `Exactly ${requiredRecords} S₀ daily earnings are required. Add ${requiredRecords - recordCount} more value(s).`
              : `Too many values (${recordCount}). Use exactly ${requiredRecords} comma-separated numbers.`}
          </p>
        </div>
      )}

      <div className="pt-1 shrink-0">
        <button
          type="button"
          onClick={handleAction}
          disabled={!isComplete || isLoading || !defaultsReady}
          aria-label={`Submit ${requiredRecords} S₀ daily earnings for pricing`}
          className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md ${
            isComplete && !isLoading && defaultsReady
              ? "bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.98] shadow-slate-900/20"
              : "bg-slate-200 text-slate-500 cursor-not-allowed shadow-none"
          }`}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Computing…
            </span>
          ) : (
            "Initialize underwriting"
          )}
        </button>
        <p className="text-[10px] text-center text-slate-400 mt-2 font-medium">
          Sends POST /price with exactly {requiredRecords} values (from API defaults)
        </p>
      </div>
    </div>
  );
}

function ActivityIndicator() {
  return <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" />;
}
