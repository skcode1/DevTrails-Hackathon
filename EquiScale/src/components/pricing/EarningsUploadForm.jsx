import { useState, useMemo } from "react";
import { UploadCloud, AlertCircle, CheckCircle2, Coins } from "lucide-react";

const MIN_RECORDS = 14;

export default function EarningsUploadForm({ onSubmit, isLoading }) {
  const [inputValue, setInputValue] = useState("");

  // Layer 1 Logic: Parse and validate the comma-separated strings
  const parsedData = useMemo(() => {
    return inputValue
      .split(",")
      .map((val) => val.trim())
      .filter((val) => val !== "" && !isNaN(val))
      .map(Number);
  }, [inputValue]);

  const recordCount = parsedData.length;
  const isComplete = recordCount >= MIN_RECORDS;

  const handleAction = () => {
    if (isComplete && !isLoading) {
      onSubmit(parsedData);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Requirement Tracker */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-800">
          <Coins className="w-4 h-4 text-cyan-600" />
          <span className="text-sm font-bold tracking-tight">Dataset: S₀ Records</span>
        </div>
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold transition-colors ${
          isComplete ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
        }`}>
          {isComplete ? <CheckCircle2 className="w-3 h-3" /> : <ActivityIndicator />}
          {recordCount} / {MIN_RECORDS} WEEKS
        </div>
      </div>

      {/* Textarea Input Container */}
      <div className="relative group">
        <textarea
          className={`w-full bg-slate-50 border-2 rounded-xl p-4 text-sm font-mono transition-all outline-none min-h-[120px] resize-none ${
            isComplete 
            ? "border-emerald-100 focus:border-emerald-500 bg-emerald-50/10" 
            : "border-slate-100 focus:border-cyan-500 focus:bg-white"
          }`}
          placeholder="Enter weekly totals: 12400, 13100, 11950..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={isLoading}
        />
        
        {/* Visual Overlay for Empty State */}
        {inputValue === "" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-40">
            <UploadCloud className="w-8 h-8 mb-2 text-slate-300" />
            <p className="text-xs text-slate-400">Paste comma-separated earnings</p>
          </div>
        )}
      </div>

      {/* Validation Warning */}
      {!isComplete && inputValue !== "" && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-100 text-amber-700">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
         <p className="text-[11px] leading-relaxed font-medium">
  Insufficient data for Layer 1 (σ̂ᵢ) stability. 
  Please provide at least {MIN_RECORDS - recordCount} more records.
</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleAction}
        disabled={!isComplete || isLoading}
        className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/10 ${
          isComplete && !isLoading
            ? "bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.98]"
            : "bg-slate-200 text-slate-400 cursor-not-allowed"
        }`}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Computing Layer 1-5...
          </span>
        ) : (
          "Initialize Underwriting"
        )}
      </button>
    </div>
  );
}

// Micro-component for the tracker indicator
function ActivityIndicator() {
  return <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" />;
}