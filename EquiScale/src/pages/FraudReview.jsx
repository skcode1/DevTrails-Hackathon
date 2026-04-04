import { useMemo, useState } from "react";
import {
  ShieldAlert,
  Search,
  Filter,
  ArrowUpDown,
  FileText,
  Activity,
  AlertCircle,
  CheckCircle2,
  MoreHorizontal,
} from "lucide-react";
import ClaimReviewCard from "../components/fraud/ClaimReviewCard";
import { useActuarial } from "../context/useActuarial";
import { postPriceAndFraud } from "../lib/api";
import { overallToRowStatus } from "../lib/pricingDefaults";

export default function FraudReview() {
  const { lastPriceRequest, adjudications, addAdjudication } = useActuarial();
  const [claimAmount, setClaimAmount] = useState("");
  const [claimedState, setClaimedState] = useState("3");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const hasSession = Boolean(lastPriceRequest);

  const rows = useMemo(() => {
    return adjudications.map((a) => ({
      id: a.id,
      rider: a.rider_id,
      amount: a.claim_amount,
      state: `S${a.claimed_state}`,
      zScore: a.fraud.Z_tilde,
      lambda: a.fraud.Lambda,
      status: overallToRowStatus(a.fraud.overall),
      raw: a,
    }));
  }, [adjudications]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.id.toLowerCase().includes(q) ||
        String(r.rider).toLowerCase().includes(q),
    );
  }, [rows, query]);

  const selected =
    adjudications.find((a) => a.id === selectedId) ?? adjudications[0];

  async function runAdjudication() {
    if (!lastPriceRequest) {
      setError("Run Premium Pricing first so a rider payload exists.");
      return;
    }
    const amt = Number(claimAmount);
    const st = Number(claimedState);
    if (!Number.isFinite(amt) || amt <= 0) {
      setError("Claim amount must be a positive number.");
      return;
    }
    if (![0, 1, 2, 3].includes(st)) {
      setError("Claimed state must be 0–3.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const body = {
        ...lastPriceRequest,
        claim_amount: amt,
        claimed_state: st,
      };
      const res = await postPriceAndFraud(body);
      const id = `ADJ-${Date.now()}`;
      const entry = {
        id,
        rider_id: body.rider_id,
        claim_amount: amt,
        claimed_state: st,
        fraud: res.fraud,
      };
      addAdjudication(entry);
      setSelectedId(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  const flagCount = adjudications.filter(
    (a) => a.fraud?.overall === "FLAG",
  ).length;

  return (
    <div className="min-h-full bg-[#f8fafc] p-4 sm:p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto w-full animate-in fade-in duration-700">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-200 pb-10">
        <div className="space-y-2">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-rose-500 rounded-xl shadow-lg shadow-rose-200">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              POST /price-and-fraud
            </span>
          </div>
          <h1 className="text-4xl font-black !text-black tracking-tighter italic uppercase">
            Claims <span className="text-slate-400">Adjudication</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium italic">
            Uses the same rider payload as pricing (last session or defaults) plus
            claim amount and claimed state.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white p-3 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100">
          <header className="px-4 py-1 border-r border-slate-100">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
              FLAG count
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black !text-black italic tracking-tighter">
                {flagCount}
              </span>
              <span className="flex h-2 w-2 rounded-full bg-rose-500" />
            </div>
          </header>
          <header className="px-4 py-1">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
              Total runs
            </p>
            <span className="text-xl font-black text-slate-600 italic tracking-tighter">
              {adjudications.length}
            </span>
          </header>
        </div>
      </header>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-md space-y-5">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          New adjudication
        </p>
        <div className="flex flex-col lg:flex-row gap-5 lg:items-end lg:justify-between">
          <label className="flex-1 text-xs font-bold text-slate-600">
            Claim amount (₹)
            <input
              type="number"
              min="1"
              step="1"
              value={claimAmount}
              onChange={(e) => setClaimAmount(e.target.value)}
              disabled={!hasSession}
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-mono text-sm disabled:opacity-50"
            />
          </label>
          <label className="flex-1 text-xs font-bold text-slate-600">
            Claimed state (0–3)
            <select
              value={claimedState}
              onChange={(e) => setClaimedState(e.target.value)}
              disabled={!hasSession}
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm bg-white disabled:opacity-50"
            >
              <option value="0">0 — S₀ normal</option>
              <option value="1">1 — S₁ mild</option>
              <option value="2">2 — S₂ major</option>
              <option value="3">3 — S₃ severe</option>
            </select>
          </label>
          <button
            type="button"
            onClick={runAdjudication}
            disabled={loading || !hasSession}
            className="rounded-xl bg-slate-950 px-6 lg:px-8 py-3 text-xs font-black uppercase tracking-widest text-white shadow-md hover:bg-black disabled:opacity-50 w-full lg:w-auto shrink-0"
          >
            {loading ? "Calling API…" : "Run /price-and-fraud"}
          </button>
        </div>
        {error && (
          <p className="text-xs font-medium text-rose-600">{error}</p>
        )}
        <p className="text-[10px] text-slate-400">
          {hasSession ? (
            <>
              Rider context:{" "}
              <span className="font-mono text-slate-600">
                {lastPriceRequest.rider_id}
              </span>
              , {lastPriceRequest.s0_earnings?.length ?? 0} S₀ earnings (last pricing run).
            </>
          ) : (
            <span className="text-amber-700 font-medium">
              Complete Premium Pricing first — fraud checks reuse that POST /price body.
            </span>
          )}
        </p>
      </div>

      <div className="flex flex-col xl:flex-row gap-4 xl:gap-6 items-stretch xl:items-center justify-between bg-white border border-slate-200 p-4 sm:p-5 rounded-2xl shadow-sm">
        <div className="relative w-full xl:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by adjudication ID or rider…"
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-3 w-full xl:w-auto">
          <ControlBtn icon={<Filter />} label="Client-side" />
          <ControlBtn icon={<ArrowUpDown />} label="Newest first" />
          <button
            type="button"
            className="p-3.5 bg-slate-900 text-white rounded-2xl hover:bg-black transition-colors shadow-lg"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 xl:gap-8 items-stretch">
        <div className="xl:col-span-7 flex flex-col min-h-0 group">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden flex-1 flex flex-col min-h-[360px]">
            <table className="w-full text-left border-collapse flex-1">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Forensic identity
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                    Gate trigger
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                    Magnitude
                  </th>
                  <th className="px-8 py-5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-8 py-12 text-center text-sm text-slate-500"
                    >
                      No adjudications yet. Run{" "}
                      <code className="font-mono">/price-and-fraud</code> above.
                    </td>
                  </tr>
                ) : (
                  filtered.map((claim) => (
                    <tr
                      key={claim.id}
                      onClick={() => setSelectedId(claim.raw.id)}
                      className={`group/row hover:bg-slate-50/80 transition-all cursor-pointer ${selectedId === claim.raw.id || (!selectedId && claim.raw.id === adjudications[0]?.id) ? "bg-cyan-50/40" : ""}`}
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm group-hover/row:scale-110 transition-transform">
                            <FileText className="w-5 h-5 text-slate-400 group-hover/row:text-slate-900 transition-colors" />
                          </div>
                          <div>
                            <p className="text-sm font-black !text-black italic tracking-tighter uppercase">
                              {claim.id}
                            </p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                              {claim.rider}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex justify-center">
                          <StatusBadge status={claim.status} score={claim.zScore} />
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <p className="text-sm font-black !text-black tabular-nums">
                          ₹{claim.amount.toLocaleString()}
                        </p>
                        <span className="text-[10px] font-mono font-bold text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-100 uppercase tracking-tighter">
                          State: {claim.state}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button
                          type="button"
                          className="p-2.5 text-slate-300 hover:text-slate-900 hover:bg-white rounded-xl border border-transparent hover:border-slate-100 transition-all"
                        >
                          <Activity className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="xl:col-span-5 flex flex-col gap-6 min-h-0">
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h3 className="text-[11px] font-black text-slate-600 uppercase tracking-[0.2em]">
              Investigation panel
            </h3>
            <span className="flex items-center gap-2 text-[10px] font-bold text-cyan-700 uppercase">
              <span className="h-1.5 w-1.5 bg-cyan-500 rounded-full animate-pulse shrink-0" />
              API response
            </span>
          </div>

          <div className="flex-1 min-h-0">
            <ClaimReviewCard claim={selected ? mapToCardClaim(selected) : null} />
          </div>

          <div className="p-6 sm:p-8 bg-slate-950 rounded-2xl shadow-lg relative overflow-hidden group shrink-0">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <AlertCircle className="w-32 h-32 text-white" />
            </div>
            <div className="relative z-10">
              <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-4">
                Protocol: next steps
              </h4>
              <div className="space-y-4">
                <ProtocolItem text={selected?.fraud?.amount_action} />
                <ProtocolItem text={selected?.fraud?.state_action} />
                <ProtocolItem text={`Overall: ${selected?.fraud?.overall ?? "—"}`} />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function mapToCardClaim(entry) {
  if (!entry) return null;
  const { fraud } = entry;
  return {
    id: entry.id,
    rider: entry.rider_id,
    claimedState: `S${entry.claimed_state}`,
    claimedAmount: entry.claim_amount,
    zScore: fraud.Z_tilde,
    lambdaRatio: fraud.Lambda,
    overall: fraud.overall,
    status: fraud.overall,
    amountDecision: fraud.amount_decision,
    stateDecision: fraud.state_decision,
  };
}

function ControlBtn({ icon, label }) {
  return (
    <button
      type="button"
      className="flex items-center gap-3 px-6 py-3.5 text-[10px] font-black !text-black bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all uppercase tracking-widest shadow-sm"
    >
      {icon} {label}
    </button>
  );
}

function StatusBadge({ status, score }) {
  const configs = {
    flag: {
      bg: "bg-rose-50",
      text: "text-rose-600",
      border: "border-rose-100",
      icon: <ShieldAlert className="w-3 h-3" />,
      label: "Flagged",
    },
    pass: {
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      border: "border-emerald-100",
      icon: <CheckCircle2 className="w-3 h-3" />,
      label: "Passed",
    },
    review: {
      bg: "bg-amber-50",
      text: "text-amber-600",
      border: "border-amber-100",
      icon: <Activity className="w-3 h-3" />,
      label: "Review",
    },
  };
  const config = configs[status] || configs.review;

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${config.bg} ${config.text} ${config.border} text-[9px] font-black uppercase tracking-tighter shadow-sm`}
    >
      {config.icon}
      {config.label}
      {score != null && Number.isFinite(score) && (
        <span className="font-mono opacity-70">Z̃{Number(score).toFixed(2)}</span>
      )}
    </div>
  );
}

function ProtocolItem({ text }) {
  if (!text) return null;
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
