import { ArrowRight, Info } from "lucide-react";

/**
 * MarkovStateTable - Layer 2 Transition Visualization
 * Renders the 4x4 matrix P where P_ij is the probability of moving from state i to j.
 */
export default function MarkovStateTable({ data }) {
  // Mock data for the 4x4 matrix if none provided (Layer 2)
  // Rows: From State (s0-s3) | Cols: To State (s0-s3)
  const matrix = data || [
    [0.85, 0.10, 0.04, 0.01],
    [0.30, 0.50, 0.15, 0.05],
    [0.10, 0.30, 0.45, 0.15],
    [0.05, 0.15, 0.30, 0.50],
  ];

  const stateLabels = [
    { id: "s0", name: "Normal" },
    { id: "s1", name: "Mild" },
    { id: "s2", name: "Major" },
    { id: "s3", name: "Severe" },
  ];

  // Helper to determine heatmap intensity based on probability value
  const getHeatmapClass = (val) => {
    if (val > 0.7) return "bg-cyan-500 text-white";
    if (val > 0.4) return "bg-cyan-100 text-cyan-800";
    if (val > 0.2) return "bg-cyan-50 text-cyan-700";
    return "bg-white text-slate-400";
  };

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-4 bg-slate-50 border-b border-slate-200">
                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                  From <ArrowRight className="w-3 h-3" /> To
                </div>
              </th>
              {stateLabels.map((label) => (
                <th key={label.id} className="p-4 bg-slate-50 border-b border-slate-200 text-center">
                  <span className="text-xs font-bold text-slate-600">{label.id}</span>
                  <p className="text-[9px] text-slate-400 font-medium uppercase">{label.name}</p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, rowIndex) => (
              <tr key={rowIndex} className="group hover:bg-slate-50 transition-colors">
                <td className="p-4 border-b border-slate-100 bg-slate-50/30">
                  <span className="text-xs font-bold text-slate-600">{stateLabels[rowIndex].id}</span>
                  <p className="text-[9px] text-slate-400 font-medium uppercase">{stateLabels[rowIndex].name}</p>
                </td>
                {row.map((cell, colIndex) => (
                  <td 
                    key={colIndex} 
                    className={`p-4 border border-slate-100 text-center transition-all duration-300 ${getHeatmapClass(cell)}`}
                  >
                    <span className="text-sm font-mono font-bold">
                      {(cell * 100).toFixed(0)}%
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Actuarial Caption */}
      <div className="p-4 bg-slate-50/50 flex items-start gap-3 border-t border-slate-200">
        <Info className="w-4 h-4 text-slate-400 mt-0.5" />
        <p className="text-[10px] text-slate-500 leading-relaxed italic">
          {String.raw`The transition matrix $P$ is estimated via Maximum Likelihood (MLE) from regional platform data, adjusted by a softmax sharpness parameter $\alpha_P$. High diagonal values (top-left to bottom-right) indicate disruption persistence.`}
        </p>
      </div>
    </div>
  );
}