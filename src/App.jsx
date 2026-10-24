// src/App.jsx
import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  MapPin, 
  ShieldCheck, 
  Compass, 
  PhoneCall, 
  FileCheck2, 
  Printer, 
  PlusCircle, 
  X, 
  Search,
  Navigation,
  CheckCircle,
  Clock,
  Sparkles,
  Calendar,
  MessageCircle,
  ExternalLink,
  Info
} from 'lucide-react';
import { INITIAL_PROJECTS } from './data';

// Distance calculation using Haversine Formula (in km)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1);
}

export default function App() {
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [selectedProject, setSelectedProject] = useState(INITIAL_PROJECTS[0]);
  const [selectedCity, setSelectedCity] = useState('All');
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showBuilderModal, setShowBuilderModal] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);

  // Buyer Form State
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [visitSlot, setVisitSlot] = useState('Morning (10:30 AM - 1:00 PM)');
  const [generatedPassData, setGeneratedPassData] = useState(null);

  // Builder Self-Listing Form State
  const [newProject, setNewProject] = useState({
    title: '',
    developer: '',
    developerDirectPhone: '',
    signatoryName: '',
    advocateName: '',
    city: 'Baramati',
    corridor: 'Bhigwan Road Corridor',
    gatNo: '',
    latitude: 18.1640,
    longitude: 74.5880,
    categoryLabel: 'Commercial + Residential',
    marketRate: '₹3,400/sq.ft',
    preLaunchDiscountRate: '₹3,100/sq.ft',
    readyReckonerRate: '₹2,800/sq.ft',
    roadApproach: '15m DP Road Frontage',
    auditId: 'MahaRERA: Application Submitted',
    auditStatus: 'Sanctioned CC and NA-44 verified by promoter advocate.',
    titleClearanceStatus: '30-Year Search Report Cleared (Advocate Signed)'
  });

  // GPS Near Me Trigger
  const handleGetLocation = () => {
    setLocating(true);
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        });
        setLocating(false);
      },
      () => {
        alert("Location access denied. You can still browse all corridors manually.");
        setLocating(false);
      }
    );
  };

  // Filter & Proximity Sorting
  const filteredProjects = useMemo(() => {
    let list = projects.filter((p) => {
      const matchCity = selectedCity === 'All' || p.city === selectedCity;
      const matchSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.gatNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.corridor.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCity && matchSearch;
    });

    if (userLocation) {
      list = list.map((p) => ({
        ...p,
        distanceKm: calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          p.latitude,
          p.longitude
        )
      })).sort((a, b) => parseFloat(a.distanceKm) - parseFloat(b.distanceKm));
    }

    return list;
  }, [projects, selectedCity, searchQuery, userLocation]);

  // Handle Builder Submission
  const handleCreateProject = (e) => {
    e.preventDefault();
    const created = {
      ...newProject,
      id: `proj-${Date.now()}`,
      status: 'Under Construction',
      statusColor: 'emerald',
      completionTarget: 'Q4 2027',
      unitsCount: 'Direct Launch',
      inventory: [
        { type: 'Direct Pre-Launch Unit', area: 'On Request', price: 'Pre-Launch Rate', verified: 'Builder Verified' }
      ]
    };
    setProjects([created, ...projects]);
    setSelectedProject(created);
    setShowBuilderModal(false);
    alert('Project successfully registered on BhoomiRadar Direct Registry!');
  };

  // Handle Buyer Appointment Submission
  const handleGeneratePass = (e) => {
    e.preventDefault();
    const pass = {
      passId: `BR-${Math.floor(100000 + Math.random() * 900000)}`,
      issueDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      buyerName,
      buyerPhone,
      visitDate,
      visitSlot,
      project: selectedProject
    };
    setGeneratedPassData(pass);
    setShowPassModal(true);
  };

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation */}
      <header className="border-b border-slate-800/80 bg-[#0c1322]/80 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
              <Compass className="w-5 h-5 text-emerald-400 animate-spin-slow" />
              BhoomiRadar
            </span>
            <span className="text-[10px] font-bold tracking-widest bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase">
              Pilot
            </span>
          </div>
          <span className="hidden sm:inline-block text-slate-500 text-xs">|</span>
          <span className="text-xs text-slate-400 font-medium hidden sm:inline-block">
            Bhigwan Road ➔ Jalochi Growth Corridor (Baramati)
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Proximity Radar Button */}
          <button
            onClick={handleGetLocation}
            disabled={locating}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition border ${
              userLocation
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                : 'bg-slate-800/80 border-slate-700/80 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <Navigation className={`w-3.5 h-3.5 ${locating ? 'animate-spin' : ''}`} />
            {userLocation ? 'GPS Radar Active' : locating ? 'Locating...' : 'Projects Near Me'}
          </button>

          {/* Builder Add Project Button */}
          <button
            onClick={() => setShowBuilderModal(true)}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-900/40 transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            + List Project (No Broker)
          </button>
        </div>
      </header>

      {/* Main Dual-Column Content */}
      <main className="flex-1 p-4 lg:p-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Project Feed */}
        <section className="lg:col-span-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              Corridor Timeline & Projects ({filteredProjects.length})
            </h2>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Tracking
            </div>
          </div>

          {/* Search & City Filter */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search Gat No, Project, Corridor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-slate-900/90 border border-slate-800 rounded-lg text-xs px-2.5 text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="All">All Regions</option>
              <option value="Baramati">Baramati</option>
              <option value="Daund">Daund</option>
            </select>
          </div>

          {/* Project Cards List */}
          <div className="flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-210px)] pr-1">
            {filteredProjects.map((proj) => {
              const isSelected = selectedProject?.id === proj.id;
              const isProposal = proj.categoryLabel === "Public Infrastructure";

              return (
                <div
                  key={proj.id}
                  onClick={() => setSelectedProject(proj)}
                  className={`p-4 rounded-xl border transition cursor-pointer relative ${
                    isSelected
                      ? 'bg-slate-900/90 border-emerald-500/60 shadow-lg shadow-emerald-950/30 ring-1 ring-emerald-500/30'
                      : 'bg-[#0b1220]/70 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-semibold text-slate-400">
                      {proj.categoryLabel}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isProposal
                          ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                          : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                      }`}
                    >
                      {proj.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white mb-1">{proj.title}</h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mb-3">
                    <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                    {proj.gatNo}
                    {proj.distanceKm && (
                      <span className="ml-2 text-emerald-400 font-semibold">
                        • {proj.distanceKm} km away
                      </span>
                    )}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
                    <span>Est. Delivery: <strong className="text-slate-200">{proj.completionTarget}</strong></span>
                    <span className="font-semibold text-slate-300">{proj.unitsCount}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* RIGHT COLUMN: Detailed Ground Reality Dossier */}
        <section className="lg:col-span-7 bg-[#0b1220]/90 border border-slate-800/90 rounded-2xl p-5 lg:p-6 flex flex-col gap-5 shadow-2xl relative">
          
          {/* Header & Target */}
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800/80 pb-4">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase">
                {selectedProject.categoryLabel}
              </span>
              <h1 className="text-xl font-black text-white mt-0.5">
                {selectedProject.title}
              </h1>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                {selectedProject.gatNo} • By <span className="text-slate-200 font-semibold">{selectedProject.developer}</span>
              </p>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">Completion Target</span>
              <span className="text-xs font-bold text-emerald-400 flex items-center justify-end gap-1 mt-0.5">
                <Calendar className="w-3.5 h-3.5" />
                {selectedProject.completionTarget}
              </span>
            </div>
          </div>

          {/* Statutory Records Audit Block */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Statutory Records Audit
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                ID: {selectedProject.auditId}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedProject.auditStatus}
            </p>
            <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Title Report: {selectedProject.titleClearanceStatus}</span>
            </div>
          </div>

          {/* Rate & Road Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Govt. Ready Reckoner</span>
              <span className="text-sm font-extrabold text-white mt-1 block">{selectedProject.readyReckonerRate}</span>
            </div>
            <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Prevailing Market Rate</span>
              <span className="text-sm font-extrabold text-emerald-400 mt-1 block">{selectedProject.marketRate}</span>
            </div>
            <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Road Approach</span>
              <span className="text-xs font-semibold text-slate-300 mt-1 block">{selectedProject.roadApproach}</span>
            </div>
          </div>

          {/* Active Verified Inventory */}
          {selectedProject.inventory && selectedProject.inventory.length > 0 && (
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                Active Verified Inventory
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedProject.inventory.map((inv, idx) => (
                  <div key={idx} className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl flex justify-between items-center">
                    <div>
                      <div className="text-xs font-bold text-white">{inv.type}</div>
                      <div className="text-[11px] text-slate-400">{inv.area} • {inv.verified}</div>
                    </div>
                    <div className="text-xs font-extrabold text-emerald-400">{inv.price}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DIRECT CONNECT & APPOINTMENT SCHEDULER (ZERO BROKER) */}
          <div className="mt-auto pt-4 border-t border-slate-800/80 flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Zero-Broker Guarantee
              </span>
              <span className="text-[11px] text-slate-400">
                Direct Developer Desk: +{selectedProject.developerDirectPhone}
              </span>
            </div>

            {/* Direct Connect Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <a
                href={`https://wa.me/${selectedProject.developerDirectPhone}?text=${encodeURIComponent(
                  `Hello, I am reviewing ${selectedProject.title} (${selectedProject.gatNo}) on BhoomiRadar. I want to schedule a direct site consultation without broker intermediary.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-md shadow-emerald-950/50"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp Developer Desk
              </a>

              <button
                onClick={() => {
                  const el = document.getElementById('pass-booking-form');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <FileCheck2 className="w-4 h-4 text-emerald-400" />
                Generate Signed Visit Pass (PDF)
              </button>
            </div>

            {/* Direct Visit Pass Booking Form */}
            <form 
              id="pass-booking-form"
              onSubmit={handleGeneratePass} 
              className="mt-2 p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Book Direct Site Visit & Lock Pre-Launch Rate
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  48-Hr Rate Lock: {selectedProject.preLaunchDiscountRate}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Your Full Name"
                  required
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500"
                />
                <input
                  type="tel"
                  placeholder="10-Digit Mobile Number"
                  required
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="date"
                  required
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-emerald-500"
                />
                <select
                  value={visitSlot}
                  onChange={(e) => setVisitSlot(e.target.value)}
                  className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-emerald-500"
                >
                  <option>Morning (10:30 AM - 1:00 PM)</option>
                  <option>Afternoon (2:00 PM - 4:30 PM)</option>
                  <option>Evening (5:00 PM - 7:00 PM)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Issue Official Authorized Visit Pass (PDF)
              </button>
            </form>
          </div>
        </section>
      </main>

      {/* MODAL 1: BUILDER SELF-REGISTRATION MODAL */}
      {showBuilderModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b1220] border border-slate-800 rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-white">List Your Project (Zero Brokerage)</h3>
                <p className="text-xs text-slate-400">Connect directly with verified investors and buyers.</p>
              </div>
              <button onClick={() => setShowBuilderModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anand Imperial Heights"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Developer / Firm</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jagtap Developers"
                    value={newProject.developer}
                    onChange={(e) => setNewProject({ ...newProject, developer: e.target.value })}
                    className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Site Desk WhatsApp No.</label>
                  <input
                    type="tel"
                    required
                    placeholder="91XXXXXXXXXX"
                    value={newProject.developerDirectPhone}
                    onChange={(e) => setNewProject({ ...newProject, developerDirectPhone: e.target.value })}
                    className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Authorized Signatory Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Partner / Promoter Name"
                    value={newProject.signatoryName}
                    onChange={(e) => setNewProject({ ...newProject, signatoryName: e.target.value })}
                    className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Project Title Advocate Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Adv. Name (Bar Council No.)"
                    value={newProject.advocateName}
                    onChange={(e) => setNewProject({ ...newProject, advocateName: e.target.value })}
                    className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">City / Taluka</label>
                  <select
                    value={newProject.city}
                    onChange={(e) => setNewProject({ ...newProject, city: e.target.value })}
                    className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                  >
                    <option value="Baramati">Baramati</option>
                    <option value="Daund">Daund</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Gat / Survey Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Gat No. 178/2"
                    value={newProject.gatNo}
                    onChange={(e) => setNewProject({ ...newProject, gatNo: e.target.value })}
                    className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">MahaRERA ID / NA Sanction</label>
                  <input
                    type="text"
                    required
                    placeholder="P521000... or NA Sanction No."
                    value={newProject.auditId}
                    onChange={(e) => setNewProject({ ...newProject, auditId: e.target.value })}
                    className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Base Pre-Launch Rate</label>
                  <input
                    type="text"
                    required
                    placeholder="₹3,100/sq.ft"
                    value={newProject.preLaunchDiscountRate}
                    onChange={(e) => setNewProject({ ...newProject, preLaunchDiscountRate: e.target.value })}
                    className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 mt-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition"
              >
                Publish Project to BhoomiRadar Registry
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: PRINTABLE OFFICIAL VISIT PASS (PDF READY) */}
      {showPassModal && generatedPassData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[95vh] overflow-y-auto print:m-0 print:p-4">
            
            {/* Modal Controls (Hidden in Print) */}
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 print:hidden mb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Official Authorization Pass
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / Save as PDF
                </button>
                <button onClick={() => setShowPassModal(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* DOCUMENT BODY */}
            <div className="border-2 border-slate-800 p-6 rounded-xl relative space-y-4 font-sans">
              
              {/* Header */}
              <div className="flex justify-between items-start border-b-2 border-slate-800 pb-3">
                <div>
                  <h2 className="text-lg font-black tracking-tight text-slate-950 flex items-center gap-1.5">
                    BHOOMIRADAR DIRECT SITE VISIT PASS
                  </h2>
                  <p className="text-[11px] text-slate-600 font-medium">
                    Neutral Development Discovery Registry (Section 79 IT Act)
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono font-bold block text-slate-500">PASS SERIAL ID</span>
                  <span className="text-xs font-black font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                    {generatedPassData.passId}
                  </span>
                </div>
              </div>

              {/* Booking Particulars */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Verified Buyer</span>
                  <strong className="text-slate-900">{generatedPassData.buyerName}</strong>
                  <div className="text-slate-600 font-mono text-[11px]">Mob: +91 {generatedPassData.buyerPhone}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Appointment Window</span>
                  <strong className="text-slate-900">{generatedPassData.visitDate}</strong>
                  <div className="text-slate-600 text-[11px]">{generatedPassData.visitSlot}</div>
                </div>
              </div>

              {/* Project & Legal Snapshot */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between border-b border-slate-200 py-1">
                  <span className="text-slate-500 font-medium">Project Name:</span>
                  <span className="font-bold text-slate-900">{generatedPassData.project.title}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 py-1">
                  <span className="text-slate-500 font-medium">Site Location:</span>
                  <span className="font-bold text-slate-900">{generatedPassData.project.gatNo}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 py-1">
                  <span className="text-slate-500 font-medium">MahaRERA / Sanction ID:</span>
                  <span className="font-mono font-bold text-slate-800">{generatedPassData.project.auditId}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 py-1">
                  <span className="text-slate-500 font-medium">Title Advocate Clearance:</span>
                  <span className="font-bold text-emerald-800">{generatedPassData.project.advocateName}</span>
                </div>
              </div>

              {/* 48-Hour Rate Lock Box */}
              <div className="bg-emerald-50 border-2 border-dashed border-emerald-400 p-3 rounded-lg text-center">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900 block">
                  ★ 48-Hour Direct Rate Lock Guarantee ★
                </span>
                <p className="text-xs text-emerald-950 mt-0.5">
                  Pre-launch rate of <strong className="text-sm font-black">{generatedPassData.project.preLaunchDiscountRate}</strong> is locked for this appointment. Zero middleman or broker brokerage applicable.
                </p>
              </div>

              {/* Dual Signature & Trust Block */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 text-center">
                <div>
                  <div className="h-10 flex items-center justify-center font-serif italic text-emerald-800 font-bold text-sm">
                    Verified Digital Registry
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold border-t border-slate-300 pt-1">
                    BhoomiRadar Statutory Seal
                  </div>
                </div>

                <div>
                  <div className="h-10 flex items-center justify-center font-serif italic text-slate-800 font-bold text-sm">
                    {generatedPassData.project.signatoryName || generatedPassData.project.developer}
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold border-t border-slate-300 pt-1">
                    Authorized Developer Signatory
                  </div>
                </div>
              </div>

              {/* Legal Safe-Harbor Disclaimer */}
              <p className="text-[8px] text-slate-500 leading-tight pt-2 text-justify">
                <strong>Statutory Notice:</strong> BhoomiRadar operates strictly as a technology intermediary under Section 79 of the Information Technology Act, 2000. It does not act as a real estate agent, broker, or escrow holder. All property titles, sanctions, and clearances are provided directly by the developer and their project advocate. Independent verification is recommended prior to formal registration.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}