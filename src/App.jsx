// src/App.jsx
import React, { useState, useEffect, useMemo } from 'react';
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
  Calendar, 
  Sparkles, 
  CheckCircle2, 
  X,
  Loader2
} from 'lucide-react';
import { supabase } from './supabase';

// Haversine distance in km
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
  return parseFloat((R * c).toFixed(1));
}

export default function App() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [activeStage, setActiveStage] = useState('all');

  // Map Center
  const [mapLocation, setMapLocation] = useState({
    name: "Baramati, Maharashtra",
    lat: 18.1512,
    lon: 74.5885,
    cityDetected: "Baramati"
  });

  // Modals & Authentication
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showHelpdesk, setShowHelpdesk] = useState(false);
  const [showBuilderModal, setShowBuilderModal] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const [user, setUser] = useState(() => {
    const s = localStorage.getItem('bhoomi_user');
    return s ? JSON.parse(s) : null;
  });
  const [authName, setAuthName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authRole, setAuthRole] = useState('buyer');

  // Pass Booking
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [visitSlot, setVisitSlot] = useState('Morning (10:30 AM - 1:00 PM)');
  const [generatedPass, setGeneratedPass] = useState(null);

  // New Builder Project Form State
  const [newProject, setNewProject] = useState({
    title: '',
    developer: '',
    developer_phone: '',
    signatory_name: '',
    advocate_name: '',
    city: 'Baramati',
    corridor: 'Growth Corridor',
    gat_no: '',
    latitude: 18.1512,
    longitude: 74.5885,
    lifecycle_stage: 'ongoing',
    stage_label: 'Ongoing (Plinth / Structure)',
    category_label: 'Commercial + Residential',
    market_rate: '₹3,400/sq.ft',
    pre_launch_rate: '₹3,100/sq.ft',
    ready_reckoner_rate: '₹2,800/sq.ft',
    road_approach: '15m DP Road Frontage',
    audit_id: 'MahaRERA: Application Submitted',
    audit_status: 'Sanctioned layout & CC verified by project advocate.',
    title_clearance_status: '30-Year Search Report Cleared'
  });

  // Query Supabase based on detected city
  const fetchDatabaseProjects = async (city) => {
    setLoading(true);
    try {
      let query = supabase.from('projects').select('*');
      if (city && city.toLowerCase() !== 'all') {
        query = query.ilike('city', `%${city}%`);
      }
      const { data, error } = await query;
      if (error) {
        console.error("Supabase Error:", error);
      } else if (data) {
        setProjects(data);
        setSelectedProject(data.length > 0 ? data[0] : null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatabaseProjects(mapLocation.cityDetected);
  }, [mapLocation.cityDetected]);

  // Global OSM Nominatim search with city parser
  const handleGlobalSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearchingLocation(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery + ', Maharashtra, India'
        )}`
      );
      const data = await res.json();

      if (data && data.length > 0) {
        const place = data[0];
        const newLat = parseFloat(place.lat);
        const newLon = parseFloat(place.lon);

        let detected = searchQuery.trim();
        const q = searchQuery.toLowerCase();
        if (q.includes("pune") || q.includes("kharadi") || q.includes("hinjawadi") || q.includes("hadapsar") || q.includes("kothrud") || q.includes("wakad")) {
          detected = "Pune";
        } else if (q.includes("mumbai") || q.includes("bkc") || q.includes("sion") || q.includes("chembur") || q.includes("thane")) {
          detected = "Mumbai";
        } else if (q.includes("baramati") || q.includes("jalochi") || q.includes("bhigwan") || q.includes("midc")) {
          detected = "Baramati";
        }

        setMapLocation({
          name: place.display_name,
          lat: newLat,
          lon: newLon,
          cityDetected: detected
        });
      } else {
        alert("Location not found on map.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearchingLocation(false);
    }
  };

  // Strict local filter: only show developments within 45 km radius
  const visibleProjects = useMemo(() => {
    return projects
      .map((p) => ({
        ...p,
        distanceKm: calculateDistance(mapLocation.lat, mapLocation.lon, p.latitude, p.longitude)
      }))
      .filter((p) => {
        const matchStage = activeStage === 'all' || p.lifecycle_stage === activeStage;
        const matchProximity = p.distanceKm <= 45;
        return matchStage && matchProximity;
      })
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [projects, mapLocation, activeStage]);

  // WhatsApp / Share handler
  const handleShareLocation = () => {
    const shareText = `*BhoomiRadar Local Real Estate Intelligence*\n\n📍 *Area:* ${mapLocation.name}\n🗺️ *GPS Coordinates:* ${mapLocation.lat}, ${mapLocation.lon}\n\n🔍 Check direct developer rates & statutory approvals on BhoomiRadar:\n${window.location.href}`;

    if (navigator.share) {
      navigator.share({ title: 'BhoomiRadar Projects', text: shareText, url: window.location.href }).catch(() => {});
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2500);
    }
  };

  // Create Project in Supabase
  const handleCreateProject = async (e) => {
    e.preventDefault();
    const payload = {
      ...newProject,
      source: 'builder_verified'
    };

    const { error } = await supabase.from('projects').insert([payload]);
    if (error) {
      alert("Failed to insert project: " + error.message);
    } else {
      alert("Project registered successfully in Supabase!");
      setShowBuilderModal(false);
      fetchDatabaseProjects(newProject.city);
    }
  };

  // Issue Pass
  const handleGeneratePass = (e) => {
    e.preventDefault();
    if (!selectedProject) return;
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
      
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-[#0c1322] px-4 lg:px-8 py-3 sticky top-0 z-40 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-emerald-400" />
          <span className="text-xl font-black text-white">BhoomiRadar</span>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold uppercase">
            Live
          </span>
        </div>

        {/* Global Search Bar */}
        <form onSubmit={handleGlobalSearch} className="flex-1 max-w-lg mx-2 relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search ANY place: 'Pune', 'Mumbai', 'Baramati'..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-24 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={isSearchingLocation}
            className="absolute right-1 top-1 bottom-1 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold transition disabled:opacity-50"
          >
            {isSearchingLocation ? 'Locating...' : 'Search Map'}
          </button>
        </form>

        {/* User Account / Builder Registration */}
        <div className="flex items-center gap-2">
          {user ? (
            <div className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="font-semibold text-slate-200">{user.name}</span>
              <button 
                onClick={() => { setUser(null); localStorage.removeItem('bhoomi_user'); }} 
                className="text-slate-500 hover:text-rose-400 ml-1 text-[10px]"
              >
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

      {/* Main Grid View */}
      <main className="flex-1 p-4 lg:p-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Map & Local Projects */}
        <section className="lg:col-span-5 flex flex-col gap-4">
          
          {/* Map Viewer */}
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

            <div className="w-full h-60 bg-slate-950 relative">
              <iframe
                title="BhoomiRadar Live Map"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapLocation.lon - 0.03}%2C${mapLocation.lat - 0.02}%2C${mapLocation.lon + 0.03}%2C${mapLocation.lat + 0.02}&layer=mapnik&marker=${mapLocation.lat}%2C${mapLocation.lon}`}
                className="opacity-90 contrast-125"
              ></iframe>
            </div>
          </div>

          {/* Lifecycle Filter Tabs */}
          <div className="flex flex-col gap-2.5">
            <div className="flex justify-between items-center">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Local Developments ({visibleProjects.length})
              </span>
              {loading && (
                <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Querying Database...
                </span>
              )}
            </div>

            <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-xl text-[11px] font-bold">
              <button
                onClick={() => setActiveStage('all')}
                className={`py-1.5 rounded-lg transition ${
                  activeStage === 'all' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveStage('upcoming')}
                className={`py-1.5 rounded-lg transition ${
                  activeStage === 'upcoming' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setActiveStage('ongoing')}
                className={`py-1.5 rounded-lg transition ${
                  activeStage === 'ongoing' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Ongoing
              </button>
              <button
                onClick={() => setActiveStage('completed')}
                className={`py-1.5 rounded-lg transition ${
                  activeStage === 'completed' ? 'bg-blue-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Existing
              </button>
            </div>

            {/* List */}
            <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[calc(100vh-510px)] pr-1">
              {visibleProjects.length === 0 ? (
                <div className="p-6 text-center bg-slate-900/40 border border-slate-800 rounded-xl text-slate-400 text-xs">
                  No local projects found within 45 km of this point in {mapLocation.cityDetected}. Use <strong>+ List Project</strong> to register one.
                </div>
              ) : (
                visibleProjects.map((proj) => {
                  const isSelected = selectedProject?.id === proj.id;
                  return (
                    <div
                      key={proj.id}
                      onClick={() => {
                        setSelectedProject(proj);
                        setMapLocation({
                          name: `${proj.title} (${proj.gat_no})`,
                          lat: proj.latitude,
                          lon: proj.longitude,
                          cityDetected: proj.city
                        });
                      }}
                      className={`p-3.5 rounded-xl border transition cursor-pointer ${
                        isSelected
                          ? 'bg-slate-900 border-emerald-500 shadow-lg ring-1 ring-emerald-500/30'
                          : 'bg-[#0b1220]/70 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-semibold text-slate-400">{proj.category_label}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            proj.lifecycle_stage === 'upcoming'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : proj.lifecycle_stage === 'ongoing'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          }`}
                        >
                          {proj.stage_label}
                        </span>
                      </div>
                      <h3 className="text-xs font-bold text-white">{proj.title}</h3>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 mb-2">
                        <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                        {proj.gat_no} • <strong className="text-slate-300">{proj.distanceKm} km away</strong>
                      </p>
                      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-2 border-t border-slate-800/60">
                        <span>Rate: <strong className="text-emerald-400">{proj.pre_launch_rate}</strong></span>
                        <span className="text-slate-300 font-semibold">{proj.road_approach}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: Selected Project Legal Dossier */}
        {selectedProject ? (
          <section className="lg:col-span-7 bg-[#0b1220] border border-slate-800 rounded-2xl p-5 lg:p-6 flex flex-col gap-5 shadow-2xl">
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                  {selectedProject.category_label}
                </span>
                <h1 className="text-xl font-black text-white mt-1">{selectedProject.title}</h1>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  {selectedProject.gat_no} • By <span className="text-slate-200 font-semibold">{selectedProject.developer}</span>
                </p>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400 block">Target Possession</span>
                <span className="text-xs font-bold text-emerald-400 flex items-center justify-end gap-1 mt-0.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {selectedProject.completion_target}
                </span>
              </div>
            </div>

            {/* Statutory Record */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Statutory Records Audit
                </span>
                <span className="text-[11px] font-mono text-slate-400">ID: {selectedProject.audit_id}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{selectedProject.audit_status}</p>
              <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Title Clearance: {selectedProject.title_clearance_status}</span>
              </div>
            </div>

            {/* Rates */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Govt Ready Reckoner</span>
                <span className="text-sm font-extrabold text-white mt-1 block">{selectedProject.ready_reckoner_rate}</span>
              </div>
              <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Market Rate</span>
                <span className="text-sm font-extrabold text-emerald-400 mt-1 block">{selectedProject.market_rate}</span>
              </div>
              <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Road Approach</span>
                <span className="text-xs font-semibold text-slate-300 mt-1 block">{selectedProject.road_approach}</span>
              </div>
            </div>

            {/* Booking Form */}
            <div className="mt-auto pt-4 border-t border-slate-800 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Direct Site Desk (Zero Middleman)
                </span>
                {selectedProject.developer_phone && (
                  <a
                    href={`https://wa.me/${selectedProject.developer_phone}?text=${encodeURIComponent(
                      `Hello, I am reviewing ${selectedProject.title} on BhoomiRadar. I want direct site inspection details.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    WhatsApp Site Desk
                  </a>
                )}
              </div>

              <form onSubmit={handleGeneratePass} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Direct Site Visit Pass
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Locked Rate: {selectedProject.pre_launch_rate}
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
        ) : (
          <section className="lg:col-span-7 bg-[#0b1220] border border-slate-800 rounded-2xl p-8 flex items-center justify-center text-slate-400 text-xs">
            Select a project from the left feed or search another location.
          </section>
        )}
      </main>

      {/* Builder Modal */}
      {showBuilderModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b1220] border border-slate-800 rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-white">List Your Project (Direct Cloud DB)</h3>
                <p className="text-slate-400">Stores directly to live Supabase registry for all buyers.</p>
              </div>
              <button onClick={() => setShowBuilderModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-3">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Imperial Residency"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Developer Firm</label>
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
                  <label className="text-slate-300 font-semibold block mb-1">Direct Desk WhatsApp</label>
                  <input
                    type="tel"
                    required
                    placeholder="91XXXXXXXXXX"
                    value={newProject.developer_phone}
                    onChange={(e) => setNewProject({ ...newProject, developer_phone: e.target.value })}
                    className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">City / Taluka</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Baramati, Pune, Mumbai"
                    value={newProject.city}
                    onChange={(e) => setNewProject({ ...newProject, city: e.target.value })}
                    className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Gat / Survey Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Gat No. 142/2"
                    value={newProject.gat_no}
                    onChange={(e) => setNewProject({ ...newProject, gat_no: e.target.value })}
                    className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">MahaRERA ID</label>
                  <input
                    type="text"
                    required
                    placeholder="P521000..."
                    value={newProject.audit_id}
                    onChange={(e) => setNewProject({ ...newProject, audit_id: e.target.value })}
                    className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Pre-Launch Rate</label>
                  <input
                    type="text"
                    required
                    placeholder="₹3,200/sq.ft"
                    value={newProject.pre_launch_rate}
                    onChange={(e) => setNewProject({ ...newProject, pre_launch_rate: e.target.value })}
                    className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 mt-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition"
              >
                Save Project to Cloud Database
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Printable Visit Pass Modal */}
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
                  <span className="font-bold text-slate-900">{generatedPass.project.gat_no}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 py-1">
                  <span className="text-slate-500">MahaRERA:</span>
                  <span className="font-mono font-bold text-slate-800">{generatedPass.project.audit_id}</span>
                </div>
              </div>

              <div className="bg-emerald-50 border-2 border-dashed border-emerald-400 p-3 rounded-lg text-center">
                <span className="text-[10px] font-black uppercase text-emerald-900 block">48-Hour Rate Lock Guarantee</span>
                <p className="text-xs text-emerald-950 mt-0.5">
                  Pre-launch rate of <strong className="font-bold">{generatedPass.project.pre_launch_rate}</strong> locked for this visit.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}