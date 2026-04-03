import { 
  Search, 
  Bell, 
  Settings, 
  ChevronDown, 
  Activity,
  Info
} from "lucide-react";

export default function Navbar() {
  // In a real app, these would come from your 'usePricing' hook or Global Store
  const currentRider = "ID-99283 (R. Chen)";
  const systemStatus = "Operational";

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
      
      {/* Left Section: Contextual Search & Breadcrumb */}
      <div className="flex items-center gap-6 flex-1">
        <div className="relative w-72">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </span>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
            placeholder="Search rider ID or claim..."
          />
        </div>
        
        <div className="h-4 w-px bg-slate-200 hidden md:block" />
        
        <div className="hidden md:flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active Context:</span>
          <div className="flex items-center gap-2 px-2 py-1 bg-slate-100 rounded text-sm font-semibold text-slate-700">
            <Activity className="w-3.5 h-3.5 text-cyan-600" />
            {currentRider}
          </div>
        </div>
      </div>

      {/* Right Section: System Actions & Status */}
      <div className="flex items-center gap-4">
        
        {/* Layer 4 Ruin Control Alert (Subtle Indicator) */}
        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>

        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
          <Settings className="w-5 h-5" />
        </button>

        <div className="h-8 w-px bg-slate-200 mx-2" />

        {/* System Health / API Status */}
        <div className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-full bg-white shadow-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-medium text-slate-600">{systemStatus}</span>
          <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
        </div>
        
        {/* Org Selector (SaaS Standard) */}
        <button className="flex items-center gap-2 ml-2 hover:opacity-80 transition-opacity text-slate-700">
          <div className="w-7 h-7 bg-indigo-600 rounded flex items-center justify-center text-[10px] font-bold text-white uppercase">
            GW
          </div>
          <span className="text-sm font-medium hidden lg:block">Guidewire Dev</span>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </button>
      </div>
    </header>
  );
}