import { Routes, Route } from "react-router-dom";

// FIXED: Changed ../ to ./ because these folders are inside the same src directory
import Sidebar from "./components/layout/Sidebar";
import Navbar from "./components/layout/Navbar";
import Dashboard from "./pages/Dashboard";
import Pricing from "./pages/Pricing";
import FraudReview from "./pages/FraudReview";
import RiderProfile from "./pages/RiderProfile";

// src/App.jsx
export default function App() {
  return (
    /* REMOVE: 'container', 'mx-auto', or any max-width classes (like 'max-w-7xl')
       ADD: 'w-full' and 'h-screen'
    */
    <div className="flex h-screen w-full bg-slate-950 overflow-hidden">
      
      {/* Sidebar - Remains fixed at its width (e.g., w-64) */}
      <Sidebar />

      {/* Main Content Area - 'flex-1' and 'w-full' forces it to touch the right edge */}
      <div className="flex flex-col flex-1 w-full bg-slate-50 min-w-0">
        <Navbar />
        
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/fraud" element={<FraudReview />} />
            <Route path="/profile" element={<RiderProfile />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}