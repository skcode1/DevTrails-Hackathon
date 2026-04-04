import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ShieldCheck,
  Calculator,
  UserCircle,
  TrendingUp,
} from "lucide-react";
import { useActuarial } from "../../context/useActuarial";

const navItems = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Premium Pricing", path: "/pricing", icon: Calculator },
  { name: "Fraud Review", path: "/fraud", icon: ShieldCheck },
  { name: "Rider Profile", path: "/profile", icon: UserCircle },
];

function initialsFromName(name) {
  if (!name || typeof name !== "string") return "—";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "—";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Sidebar() {
  const location = useLocation();
  const { modelsLoaded, healthOk, appDefaults } = useActuarial();
  const ui = appDefaults?.ui ?? {};
  const stabilityPct =
    healthOk === false ? 0 : modelsLoaded ? 100 : healthOk ? 40 : 0;

  const showUser = Boolean(ui.userName?.trim() || ui.userRole?.trim());

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col h-screen sticky top-0 left-0">
      <div className="p-6 border-b border-slate-800 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex flex-col">
            {ui.appName?.trim() ? (
              <span className="text-white font-bold tracking-tight text-lg truncate">
                {ui.appName.trim()}
              </span>
            ) : null}
            {ui.appVersion?.trim() ? (
              <span className="text-cyan-500 text-[10px] font-mono uppercase opacity-70">
                {ui.appVersion.trim()}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-4 px-2">
            Insurance Core
          </p>
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group border ${
                    isActive
                      ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                      : "text-slate-400 border-transparent hover:bg-slate-900 hover:text-slate-100"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${isActive ? "text-cyan-400" : "group-hover:text-cyan-300"}`}
                  />
                  <span className="text-sm font-semibold">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="px-2">
          <div className="bg-slate-900/40 rounded-xl p-4 border border-slate-800/50">
            <div className="flex items-center gap-2 mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <TrendingUp className="w-3 h-3 text-emerald-500" />
              <span>Model Stability</span>
            </div>
            <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full transition-all duration-700"
                style={{ width: `${stabilityPct}%` }}
              />
            </div>
          </div>
        </div>
      </nav>

      {showUser ? (
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 backdrop-blur-md">
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 flex items-center justify-center text-[10px] font-bold text-white shadow-inner shrink-0">
              {initialsFromName(ui.userName)}
            </div>
            <div className="flex-1 min-w-0">
              {ui.userName?.trim() ? (
                <p className="text-xs font-bold text-white truncate uppercase tracking-tight">
                  {ui.userName.trim()}
                </p>
              ) : null}
              {ui.userRole?.trim() ? (
                <p className="text-[10px] text-slate-500 truncate font-medium">
                  {ui.userRole.trim()}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </aside>
  );
}
