import { ArrowRight, Info } from "lucide-react";

export default function MarkovStateTable({ data }) {
  if (
    !data ||
    !Array.isArray(data) ||
    data.length !== 4 ||
    !data.every((row) => Array.isArray(row) && row.length === 4)
  ) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-12 text-center">
        <p className="text-sm font-medium text-slate-600">
          No transition matrix in the last API response.
        </p>
        <p className="text-xs text-slate-400 mt-2">
          Run pricing successfully to populate <code className="font-mono">P_adjusted</code>.
        </p>
      </div>
    );
  }

  const matrix = data;

  const stateLabels = [
    { id: "s0", name: "Normal" },
    { id: "s1", name: "Mild" },
    { id: "s2", name: "Major" },
    { id: "s3", name: "Severe" },
  ];

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
                <th
                  key={label.id}
                  className="p-4 bg-slate-50 border-b border-slate-200 text-center"
                >
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
                  <p className="text-[9px] text-slate-400 font-medium uppercase">
                    {stateLabels[rowIndex].name}
                  </p>
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

      <div className="p-4 bg-slate-50/50 flex items-start gap-3 border-t border-slate-200">
        <Info className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
        <p className="text-[10px] text-slate-500 leading-relaxed italic">
          Values come from the pricing engine response (<code className="font-mono">P_adjusted</code>
          ).
        </p>
      </div>
    </div>
  );
}
