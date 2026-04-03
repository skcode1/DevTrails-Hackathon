import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  ShieldCheck, 
  Calculator, 
  UserCircle, 
  TrendingUp 
} from "lucide-react";

const navItems = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Premium Pricing", path: "/pricing", icon: Calculator },
  { name: "Fraud Review", path: "/fraud", icon: ShieldCheck },
  { name: "Rider Profile", path: "/profile", icon: UserCircle },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    /* FIX: Removed redundant background classes and ensured 
       the border acts as the only separator. 
    */
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col h-screen sticky top-0 left-0">
      
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center font-bold text-slate-900">
            G
          </div>
          <span className="text-white font-bold tracking-tight text-lg">
            GigGuard <span className="text-cyan-500 text-[10px] font-mono ml-1 uppercase opacity-70">v1.0</span>
          </span>
        </div>
      </div>

      {/* Navigation */}
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
                  <Icon className={`w-4 h-4 ${isActive ? "text-cyan-400" : "group-hover:text-cyan-300"}`} />
                  <span className="text-sm font-semibold">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="px-2">
          <div className="bg-slate-900/40 rounded-xl p-4 border border-slate-800/50">
            <div className="flex items-center gap-2 mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <TrendingUp className="w-3 h-3 text-emerald-500" />
              <span>Model Stability</span>
            </div>
            <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full w-[94%] transition-all duration-1000" />
            </div>
          </div>
        </div>
      </nav>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 flex items-center justify-center text-[10px] font-bold text-white shadow-inner">
            JD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate uppercase tracking-tight">John Doe</p>
            <p className="text-[10px] text-slate-500 truncate font-medium">Actuarial Analyst</p>
          </div>
        </div>
      </div>
    </aside>
  );
}