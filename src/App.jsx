import React, { useState } from 'react';
import { CORRIDOR_NAME, PROJECTS_DATA } from './data';
import { 
  Building2, 
  MapPin, 
  ShieldCheck, 
  AlertTriangle, 
  Calendar, 
  Bell, 
  CheckCircle2 
} from 'lucide-react';

export default function App() {
  const [selectedProject, setSelectedProject] = useState(PROJECTS_DATA[0]);
  const [alertPhone, setAlertPhone] = useState('');
  const [alertSuccess, setAlertSuccess] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (alertPhone.length === 10) {
      setAlertSuccess(true);
      setTimeout(() => setAlertSuccess(false), 5000);
      setAlertPhone('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-emerald-900/40">
            BR
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
              BhoomiRadar <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded font-mono">PILOT</span>
            </h1>
            <p className="text-xs text-slate-400">{CORRIDOR_NAME}</p>
          </div>
        </div>

        <button 
          onClick={() => document.getElementById('watch-section')?.scrollIntoView({ behavior: 'smooth' })}
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-md flex items-center gap-1.5 shadow-sm transition"
        >
          <Bell className="w-3.5 h-3.5" /> Watch Corridor
        </button>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-5 flex flex-col gap-3">
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              Corridor Timeline & Projects ({PROJECTS_DATA.length})
            </h2>
            <span className="text-xs text-emerald-400 font-medium">● Live Tracking</span>
          </div>

          <div className="flex flex-col gap-2.5">
            {PROJECTS_DATA.map((proj) => {
              const isSelected = selectedProject.id === proj.id;
              return (
                <div
                  key={proj.id}
                  onClick={() => setSelectedProject(proj)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition text-left ${
                    isSelected 
                      ? 'bg-slate-800/90 border-emerald-500 shadow-lg shadow-emerald-950/20' 
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                      {proj.category}
                    </span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded flex items-center gap-1 ${
                      proj.statusBadge === 'GREEN' 
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800' 
                        : 'bg-amber-950/80 text-amber-400 border border-amber-800'
                    }`}>
                      {proj.statusBadge === 'GREEN' ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                      {proj.stage}
                    </span>
                  </div>

                  <h3 className="font-semibold text-white mt-2 text-sm">{proj.name}</h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-slate-500" /> {proj.location}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Est. Delivery: <strong className="text-slate-200">{proj.targetQuarter}</strong></span>
                    <span className="text-emerald-400 font-medium">{proj.inventory.length} units</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="md:col-span-7 flex flex-col gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">{selectedProject.category}</span>
                <h2 className="text-xl font-bold text-white mt-0.5">{selectedProject.name}</h2>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" /> {selectedProject.location} • By <strong className="text-slate-300">{selectedProject.developer}</strong>
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Completion Target</span>
                <span className="text-sm font-semibold text-slate-200 flex items-center gap-1 justify-end">
                  <Calendar className="w-3.5 h-3.5 text-emerald-500" /> {selectedProject.targetQuarter}
                </span>
              </div>
            </div>

            <div className="mt-4 p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Statutory Records Audit
                </span>
                <span className="text-[11px] font-mono text-slate-400">ID: {selectedProject.reraId}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded border border-slate-800/80">
                {selectedProject.statusNote}
              </p>
              <span className="text-[10px] text-slate-500 italic">
                *Verified against public MahaRERA / Municipal Council Gazette records. Formal title opinion by an advocate recommended.
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
              <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-800/60">
                <span className="text-[10px] text-slate-400 block uppercase">Govt. Ready Reckoner</span>
                <span className="text-xs font-bold text-slate-200 mt-0.5 block">{selectedProject.readyReckonerRate}</span>
              </div>
              <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-800/60">
                <span className="text-[10px] text-slate-400 block uppercase">Prevailing Market Rate</span>
                <span className="text-xs font-bold text-emerald-400 mt-0.5 block">{selectedProject.marketRate}</span>
              </div>
              <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-800/60 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-400 block uppercase">Road Approach</span>
                <span className="text-xs font-semibold text-slate-200 mt-0.5 block">{selectedProject.roadWidth}</span>
              </div>
            </div>

            <div className="mt-5">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-400" /> Active Verified Inventory
              </h4>
              
              {selectedProject.inventory.length === 0 ? (
                <div className="p-4 bg-slate-950/40 border border-slate-800/60 rounded-lg text-center text-xs text-slate-500">
                  Public infrastructure project. No private commercial/residential units available.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {selectedProject.inventory.map((unit, idx) => (
                    <div key={idx} className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-white block">{unit.type}</span>
                        <span className="text-[11px] text-slate-400">{unit.area} • Verified {unit.verified}</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-400">{unit.price}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div id="watch-section" className="bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-800/50 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-600/20 border border-emerald-500/30 rounded-lg text-emerald-400">
                <Bell className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-white">Watch Bhigwan Road ➔ Jalochi Corridor</h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Get instant WhatsApp alerts whenever a new RERA project is registered or a DP road widening tender is approved in this area.
                </p>

                {alertSuccess ? (
                  <div className="mt-3 p-2 bg-emerald-900/60 border border-emerald-600 rounded text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> You're on the list! You will receive new corridor alerts on WhatsApp.
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe} className="mt-3 flex gap-2">
                    <input 
                      type="tel" 
                      placeholder="Enter 10-digit Mobile Number" 
                      value={alertPhone}
                      onChange={(e) => setAlertPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="bg-slate-950 border border-slate-700 text-xs text-white px-3 py-2 rounded-lg flex-1 focus:outline-none focus:border-emerald-500 font-mono"
                      required
                    />
                    <button 
                      type="submit" 
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition"
                    >
                      Subscribe Free
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-800 text-center py-4 text-xs text-slate-500">
        BhoomiRadar © 2026 • Hyper-Local Development Intelligence • Baramati Pilot
      </footer>
    </div>
  );
}