// src/App.jsx
import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  MapPin, 
  ShieldCheck, 
  Compass, 
  Search, 
  Share2, 
  MessageCircle, 
  HelpCircle, 
  User, 
  PlusCircle, 
  Printer, 
  Navigation,
  Calendar,
  Sparkles,
  CheckCircle2,
  X
} from 'lucide-react';
import { INITIAL_PROJECTS } from './data';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Global Map Center State (Can be ANY location in India / Maharashtra)
  const [mapLocation, setMapLocation] = useState({
    name: "Baramati, Pune District, Maharashtra",
    lat: 18.1512,
    lon: 74.5885
  });

  // Modals & Panels
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showHelpdesk, setShowHelpdesk] = useState(false);
  const [showBuilderModal, setShowBuilderModal] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  // User State
  const [user, setUser] = useState(() => {
    const s = localStorage.getItem('bhoomi_user');
    return s ? JSON.parse(s) : null;
  });
  const [authName, setAuthName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authRole, setAuthRole] = useState('buyer');

  // Appointment Pass State
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [visitSlot, setVisitSlot] = useState('Morning (10:30 AM - 1:00 PM)');
  const [generatedPass, setGeneratedPass] = useState(null);

  // GOOGLE MAPS STYLE GLOBAL ADDRESS SEARCH (ANY LOCATION)
  const handleGlobalSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      // Free open worldwide geocoding API
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ', Maharashtra, India')}`
      );
      const data = await res.json();

      if (data && data.length > 0) {
        const place = data[0];
        const newLat = parseFloat(place.lat);
        const newLon = parseFloat(place.lon);

        setMapLocation({
          name: place.display_name,
          lat: newLat,
          lon: newLon
        });

        // Find if any listed project is near this searched location
        const sorted = [...projects].sort((a, b) => {
          return (
            parseFloat(calculateDistance(newLat, newLon, a.latitude, a.longitude)) -
            parseFloat(calculateDistance(newLat, newLon, b.latitude, b.longitude))
          );
        });
        if (sorted.length > 0) {
          setSelectedProject(sorted[0]);
        }
      } else {
        alert("Location not found on map. Try entering a nearby landmark, village, or town (e.g. 'Shivajinagar Pune' or 'Bhigwan').");
      }
    } catch (err) {
      console.error(err);
      alert("Error finding location. Please check your internet connection.");
    } finally {
      setIsSearching(false);
    }
  };

  // Instant WhatsApp & Mobile Sharing
  const handleShareLocation = () => {
    const shareText = `*BhoomiRadar Verified Location*\n\n📍 *Place:* ${mapLocation.name}\n🌐 *Map Pin:* https://www.google.com/maps?q=${mapLocation.lat},${mapLocation.lon}\n\n🔍 Check direct developer rates & statutory approvals on BhoomiRadar:\n${window.location.href}`;

    if (navigator.share) {
      navigator.share({
        title: 'BhoomiRadar Property Location',
        text: shareText,
        url: window.location.href
      }).catch(() => {});
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2500);
    }
  };

  // Auth Submit
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    const profile = { name: authName, phone: authPhone, role: authRole };
    setUser(profile);
    localStorage.setItem('bhoomi_user', JSON.stringify(profile));
    setBuyerName(authName);
    setBuyerPhone(authPhone);
    setShowAuthModal(false);
  };

  // Issue Pass
  const handleGeneratePass = (e) => {
    e.preventDefault();
    setGeneratedPass({
      passId: `BR-${Math.floor(100000 + Math.random() * 900000)}`,
      buyerName: buyerName || (user ? user.name : 'Direct Buyer'),
      buyerPhone: buyerPhone || (user ? user.phone : 'Direct Phone'),
      visitDate,
      visitSlot,
      project: selectedProject
    });
    setShowPassModal(true);
  };

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col font-sans">
      
      {/* Top Navbar with Global Location Search */}
      <header className="border-b border-slate-800 bg-[#0c1322] px-4 lg:px-8 py-3 sticky top-0 z-40 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-emerald-400" />
          <span className="text-xl font-black text-white">BhoomiRadar</span>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold uppercase">
            Live
          </span>
        </div>

        {/* GOOGLE MAPS STYLE SEARCH BAR */}
        <form onSubmit={handleGlobalSearch} className="flex-1 max-w-lg mx-2 relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Type ANY city, area, or road (e.g. Pune, Jalochi, Hadapsar, MIDC)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-24 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="absolute right-1 top-1 bottom-1 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold transition disabled:opacity-50"
          >
            {isSearching ? 'Locating...' : 'Search Map'}
          </button>
        </form>

        {/* User Account & Builder CTA */}
        <div className="flex items-center gap-2">
          {user ? (
            <div className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="font-semibold text-slate-200">{user.name}</span>
              <button onClick={() => { setUser(null); localStorage.removeItem('bhoomi_user'); }} className="text-slate-500 hover:text-rose-400 ml-1 text-[10px]">
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700"
            >
              <User className="w-3.5 h-3.5 text-emerald-400" />
              Sign In
            </button>
          )}

          <button
            onClick={() => setShowBuilderModal(true)}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            + List Project
          </button>
        </div>
      </header>

      {/* Main Screen */}
      <main className="flex-1 p-4 lg:p-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Interactive Map & Searched Coordinates */}
        <section className="lg:col-span-5 flex flex-col gap-4">
          
          {/* MAP DISPLAY BOX */}
          <div className="bg-[#0b1220] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-3 bg-slate-900 border-b border-slate-800 flex justify-between items-center gap-2">
              <div className="flex items-center gap-1.5 truncate">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs font-bold text-white truncate max-w-[220px]">
                  {mapLocation.name}
                </span>
              </div>
              <button
                onClick={handleShareLocation}
                className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold flex items-center gap-1 transition shrink-0"
              >
                <Share2 className="w-3.5 h-3.5" />
                {shareSuccess ? 'Copied!' : 'Share Pin'}
              </button>
            </div>

            {/* LIVE VISUAL INTERACTIVE MAP */}
            <div className="w-full h-64 bg-slate-950 relative">
              <iframe
                title="BhoomiRadar Visual Geocoder"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapLocation.lon - 0.02}%2C${mapLocation.lat - 0.015}%2C${mapLocation.lon + 0.02}%2C${mapLocation.lat + 0.015}&layer=mapnik&marker=${mapLocation.lat}%2C${mapLocation.lon}`}
                className="opacity-90 contrast-125"
              ></iframe>
              <div className="absolute bottom-2 left-2 bg-slate-900/90 border border-slate-800 px-2 py-0.5 rounded text-[10px] text-slate-300 font-mono">
                Lat: {mapLocation.lat.toFixed(4)}, Lon: {mapLocation.lon.toFixed(4)}
              </div>
            </div>
          </div>

          {/* Development Projects List */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Ground Reality Projects ({projects.length})
              </span>
              <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Direct Developer Access
              </span>
            </div>

            <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[calc(100vh-480px)] pr-1">
              {projects.map((proj) => {
                const isSelected = selectedProject?.id === proj.id;
                const distance = calculateDistance(mapLocation.lat, mapLocation.lon, proj.latitude, proj.longitude);
                return (
                  <div
                    key={proj.id}
                    onClick={() => {
                      setSelectedProject(proj);
                      setMapLocation({
                        name: `${proj.title} (${proj.gatNo})`,
                        lat: proj.latitude,
                        lon: proj.longitude
                      });
                    }}
                    className={`p-3.5 rounded-xl border transition cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 border-emerald-500 shadow-lg ring-1 ring-emerald-500/30'
                        : 'bg-[#0b1220]/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-semibold text-slate-400">{proj.categoryLabel}</span>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {distance} km away
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-white">{proj.title}</h3>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 mb-2">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      {proj.gatNo}
                    </p>
                    <div className="flex justify-between items-center text-[10px] text-slate-400 pt-2 border-t border-slate-800/60">
                      <span>Rate: <strong className="text-emerald-400">{proj.preLaunchDiscountRate}</strong></span>
                      <span className="text-slate-300 font-semibold">{proj.roadApproach}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: Statutory Legal Dossier & Booking */}
        <section className="lg:col-span-7 bg-[#0b1220] border border-slate-800 rounded-2xl p-5 lg:p-6 flex flex-col gap-5 shadow-2xl">
          
          <div className="flex justify-between items-start border-b border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                {selectedProject.categoryLabel}
              </span>
              <h1 className="text-xl font-black text-white mt-0.5">{selectedProject.title}</h1>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
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

          {/* Statutory Verification Box */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Statutory Records Audit
              </span>
              <span className="text-[11px] font-mono text-slate-400">ID: {selectedProject.auditId}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{selectedProject.auditStatus}</p>
            <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Title Clearance: {selectedProject.titleClearanceStatus}</span>
            </div>
          </div>

          {/* Rates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Govt Ready Reckoner</span>
              <span className="text-sm font-extrabold text-white mt-1 block">{selectedProject.readyReckonerRate}</span>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Prevailing Market Rate</span>
              <span className="text-sm font-extrabold text-emerald-400 mt-1 block">{selectedProject.marketRate}</span>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">DP Road Frontage</span>
              <span className="text-xs font-semibold text-slate-300 mt-1 block">{selectedProject.roadApproach}</span>
            </div>
          </div>

          {/* Direct Desk Connection */}
          <div className="mt-auto pt-4 border-t border-slate-800 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Zero Broker Fee Guarantee
              </span>
              <a
                href={`https://wa.me/${selectedProject.developerDirectPhone}?text=${encodeURIComponent(
                  `Hello, I am viewing ${selectedProject.title} on BhoomiRadar. I want direct site inspection details.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                WhatsApp Direct Site Desk
              </a>
            </div>

            {/* Visit Pass Booking Form */}
            <form onSubmit={handleGeneratePass} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Generate Direct Authorized Visit Pass
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Locked Rate: {selectedProject.preLaunchDiscountRate}
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

      {/* FLOATING HELPDESK WIDGET */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          onClick={() => setShowHelpdesk(!showHelpdesk)}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 p-3.5 rounded-full shadow-2xl flex items-center gap-2 font-bold text-xs transition"
        >
          <HelpCircle className="w-5 h-5" />
          <span className="hidden sm:inline">Helpdesk</span>
        </button>

        {showHelpdesk && (
          <div className="absolute bottom-14 right-0 w-72 bg-[#0b1220] border border-slate-800 rounded-xl shadow-2xl p-4 text-xs space-y-3">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="font-bold text-white flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
                Support & Helpdesk
              </span>
              <button onClick={() => setShowHelpdesk(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Need title report clarification or want to report a fake Gat listing? Contact our ground verification desk:
            </p>
            <a
              href="https://wa.me/919822012345?text=Hello%20BhoomiRadar%20Support,%20I%20need%20help."
              target="_blank"
              rel="noreferrer"
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg flex items-center justify-center gap-1.5 transition block text-center"
            >
              <MessageCircle className="w-4 h-4" />
              Chat on WhatsApp
            </a>
          </div>
        )}
      </div>

      {/* USER LOGIN MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b1220] border border-slate-800 rounded-2xl max-w-sm w-full p-6 text-xs relative">
            <button onClick={() => setShowAuthModal(false)} className="absolute right-4 top-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-white mb-3">Sign In to BhoomiRadar</h3>
            <form onSubmit={handleAuthSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAuthRole('buyer')}
                  className={`py-2 rounded font-bold border ${authRole === 'buyer' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                >
                  Buyer / Investor
                </button>
                <button
                  type="button"
                  onClick={() => setAuthRole('builder')}
                  className={`py-2 rounded font-bold border ${authRole === 'builder' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                >
                  Builder / Landowner
                </button>
              </div>
              <div>
                <label className="text-slate-300 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Your Name"
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  className="w-full p-2 bg-slate-900 border border-slate-800 rounded text-white"
                />
              </div>
              <div>
                <label className="text-slate-300 block mb-1">Mobile Number</label>
                <input
                  type="tel"
                  required
                  placeholder="10-Digit Mobile"
                  value={authPhone}
                  onChange={(e) => setAuthPhone(e.target.value)}
                  className="w-full p-2 bg-slate-900 border border-slate-800 rounded text-white"
                />
              </div>
              <button type="submit" className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded transition">
                Continue
              </button>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE PASS MODAL */}
      {showPassModal && generatedPass && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 mb-4 print:hidden">
              <span className="text-xs font-bold text-slate-500 uppercase">Official Authorization Pass</span>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / Save PDF
                </button>
                <button onClick={() => setShowPassModal(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="border-2 border-slate-800 p-6 rounded-xl space-y-4">
              <div className="flex justify-between items-start border-b-2 border-slate-800 pb-3">
                <div>
                  <h2 className="text-lg font-black text-slate-950">BHOOMIRADAR SITE VISIT PASS</h2>
                  <p className="text-[11px] text-slate-600">Neutral Development Discovery (Section 79 IT Act)</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-500 block">SERIAL ID</span>
                  <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                    {generatedPass.passId}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Buyer</span>
                  <strong className="text-slate-900">{generatedPass.buyerName}</strong>
                  <div className="text-slate-600 text-[11px] font-mono">+91 {generatedPass.buyerPhone}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Appointment</span>
                  <strong className="text-slate-900">{generatedPass.visitDate}</strong>
                  <div className="text-slate-600 text-[11px]">{generatedPass.visitSlot}</div>
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between border-b border-slate-200 py-1">
                  <span className="text-slate-500">Project:</span>
                  <span className="font-bold text-slate-900">{generatedPass.project.title}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 py-1">
                  <span className="text-slate-500">Location:</span>
                  <span className="font-bold text-slate-900">{generatedPass.project.gatNo}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 py-1">
                  <span className="text-slate-500">MahaRERA:</span>
                  <span className="font-mono font-bold text-slate-800">{generatedPass.project.auditId}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 py-1">
                  <span className="text-slate-500">Advocate Title Report:</span>
                  <span className="font-bold text-emerald-800">{generatedPass.project.advocateName}</span>
                </div>
              </div>

              <div className="bg-emerald-50 border-2 border-dashed border-emerald-400 p-3 rounded-lg text-center">
                <span className="text-[10px] font-black uppercase text-emerald-900 block">48-Hour Rate Lock Guarantee</span>
                <p className="text-xs text-emerald-950 mt-0.5">
                  Pre-launch rate of <strong className="font-bold">{generatedPass.project.preLaunchDiscountRate}</strong> locked for this visit.
                </p>
              </div>

              <p className="text-[8px] text-slate-500 leading-tight pt-2">
                <strong>Statutory Notice:</strong> BhoomiRadar operates strictly as an intermediary under Section 79 of the IT Act. All approvals are verified against promoter disclosures.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}