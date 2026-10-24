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
  Loader2,
  KeyRound,
  Coins
} from 'lucide-react';
import { supabase } from './supabase';

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

  // Filters
  const [activeStage, setActiveStage] = useState('all'); // all | upcoming | ongoing | completed
  const [activeIntent, setActiveIntent] = useState('all'); // all | buy | rent

  // Map Location
  const [mapLocation, setMapLocation] = useState({
    name: "Baramati, Maharashtra",
    lat: 18.1512,
    lon: 74.5885,
    cityDetected: "Baramati"
  });

  // Modals & User
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

  // Visit Pass
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [visitSlot, setVisitSlot] = useState('Morning (10:30 AM - 1:00 PM)');
  const [generatedPass, setGeneratedPass] = useState(null);

  // Builder / Landlord Form
  const [newProject, setNewProject] = useState({
    title: '',
    developer: '',
    developer_phone: '',
    city: 'Baramati',
    gat_no: '',
    latitude: 18.1512,
    longitude: 74.5885,
    lifecycle_stage: 'ongoing',
    stage_label: 'Ongoing (Structure Cast)',
    category_label: 'Commercial + Residential',
    transaction_type: 'buy', // buy | rent | both
    rental_rate: '',
    deposit_amount: '',
    pre_launch_rate: '₹3,200/sq.ft',
    market_rate: '₹3,600/sq.ft',
    ready_reckoner_rate: '₹2,800/sq.ft',
    road_approach: '15m DP Road Frontage',
    audit_id: 'MahaRERA: Application Submitted',
    audit_status: 'Title clearance certificate cleared with advocate search report.',
    title_clearance_status: '30-Year Search Report Cleared'
  });

  // Fetch from Supabase
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

  // Global Nominatim Search covering all of Maharashtra
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

        // Detect Maharashtra Cities
        let detected = searchQuery.trim();
        const q = searchQuery.toLowerCase();
        if (q.includes("pune") || q.includes("kharadi") || q.includes("hinjawadi") || q.includes("hadapsar")) {
          detected = "Pune";
        } else if (q.includes("mumbai") || q.includes("bkc") || q.includes("sion") || q.includes("chembur")) {
          detected = "Mumbai";
        } else if (q.includes("baramati") || q.includes("jalochi") || q.includes("bhigwan")) {
          detected = "Baramati";
        } else if (q.includes("nagpur") || q.includes("mihan")) {
          detected = "Nagpur";
        } else if (q.includes("nashik") || q.includes("gangapur")) {
          detected = "Nashik";
        } else if (q.includes("kolhapur") || q.includes("rankala")) {
          detected = "Kolhapur";
        } else if (q.includes("solapur")) {
          detected = "Solapur";
        } else if (q.includes("aurangabad") || q.includes("sambhaji")) {
          detected = "Chhatrapati Sambhajinagar";
        }

        setMapLocation({
          name: place.display_name,
          lat: newLat,
          lon: newLon,
          cityDetected: detected
        });
      } else {
        alert("Location not found. Try searching any Maharashtra city or taluka.");
      }
    } catch (err) {
      console.error(err);
      alert("Error finding location.");
    } finally {
      setIsSearchingLocation(false);
    }
  };

  // Filter by Radius + Lifecycle Stage + Intent (Buy vs Rent)
  const visibleProjects = useMemo(() => {
    return projects
      .map((p) => ({
        ...p,
        distanceKm: calculateDistance(mapLocation.lat, mapLocation.lon, p.latitude, p.longitude)
      }))
      .filter((p) => {
        // Stage filter
        const matchStage = activeStage === 'all' || p.lifecycle_stage === activeStage;
        
        // Intent filter (Buy vs Rent)
        let matchIntent = true;
        if (activeIntent === 'buy') {
          matchIntent = p.transaction_type === 'buy' || p.transaction_type === 'both' || !p.transaction_type;
        } else if (activeIntent === 'rent') {
          matchIntent = p.transaction_type === 'rent' || p.transaction_type === 'both';
        }

        // Distance: within 55 km radius or city match
        const matchProximity = p.distanceKm <= 55 || p.city?.toLowerCase() === mapLocation.cityDetected?.toLowerCase();
        
        return matchStage && matchIntent && matchProximity;
      })
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [projects, mapLocation, activeStage, activeIntent]);

  // Insert to live DB
  const handleCreateProject = async (e) => {
    e.preventDefault();
    const payload = {
      ...newProject,
      source: 'builder_verified'
    };

    const { error } = await supabase.from('projects').insert([payload]);
    if (error) {
      alert("Failed to insert: " + error.message);
    } else {
      alert("Property/Project successfully added to the live Maharashtra directory!");
      setShowBuilderModal(false);
      fetchDatabaseProjects(newProject.city);
    }
  };

  const handleShareLocation = () => {
    const shareText = `*BhoomiRadar Maharashtra Property Intelligence*\n\n📍 *Area:* ${mapLocation.name}\n🗺️ *GPS Coordinates:* ${mapLocation.lat}, ${mapLocation.lon}\n\n🔍 Check verified ongoing, upcoming, and rental developments directly with site offices:\n${window.location.href}`;

    if (navigator.share) {
      navigator.share({ title: 'BhoomiRadar Property', text: shareText, url: window.location.href }).catch(() => {});
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2500);
    }
  };

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
            Maharashtra
          </span>
        </div>

        {/* Global Search */}
        <form onSubmit={handleGlobalSearch} className="flex-1 max-w-lg mx-2 relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search ANY district/taluka: 'Nashik', 'Nagpur', 'Kolhapur', 'Pune'..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-24 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={isSearchingLocation}
            className="absolute right-1 top-1 bottom-1 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold transition disabled:opacity-50"
          >
            {isSearchingLocation ? 'Locating...' : 'Search'}
          </button>
        </form>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBuilderModal(true)}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            + List Sale / Rent
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Map + Projects Feed */}
        <section className="lg:col-span-5 flex flex-col gap-4">
          
          {/* Map Box */}
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

            <div className="w-full h-56 bg-slate-950 relative">
              <iframe
                title="BhoomiRadar Live Map"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapLocation.lon - 0.04}%2C${mapLocation.lat - 0.03}%2C${mapLocation.lon + 0.04}%2C${mapLocation.lat + 0.03}&layer=mapnik&marker=${mapLocation.lat}%2C${mapLocation.lon}`}
                className="opacity-90 contrast-125"
              ></iframe>
            </div>
          </div>

          {/* DUAL FILTERS: Intent (Buy vs Rent) & Lifecycle (Upcoming | Ongoing | Existing) */}
          <div className="flex flex-col gap-2.5">
            
            {/* Primary Intent: All | Buy | Rent */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold">
              <button
                onClick={() => setActiveIntent('all')}
                className={`py-1.5 rounded-lg transition ${
                  activeIntent === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All Listings
              </button>
              <button
                onClick={() => setActiveIntent('buy')}
                className={`py-1.5 rounded-lg transition flex items-center justify-center gap-1 ${
                  activeIntent === 'buy' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Coins className="w-3 h-3" /> Outright Buy
              </button>
              <button
                onClick={() => setActiveIntent('rent')}
                className={`py-1.5 rounded-lg transition flex items-center justify-center gap-1 ${
                  activeIntent === 'rent' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <KeyRound className="w-3 h-3" /> Rent / Lease
              </button>
            </div>

            {/* Lifecycle Stages */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-900/60 border border-slate-800 rounded-xl text-[11px] font-semibold">
              <button
                onClick={() => setActiveStage('all')}
                className={`py-1 rounded-md transition ${activeStage === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}
              >
                All Stages
              </button>
              <button
                onClick={() => setActiveStage('upcoming')}
                className={`py-1 rounded-md transition ${activeStage === 'upcoming' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'text-slate-400'}`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setActiveStage('ongoing')}
                className={`py-1 rounded-md transition ${activeStage === 'ongoing' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'text-slate-400'}`}
              >
                Ongoing
              </button>
              <button
                onClick={() => setActiveStage('completed')}
                className={`py-1 rounded-md transition ${activeStage === 'completed' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40' : 'text-slate-400'}`}
              >
                Existing
              </button>
            </div>

            {/* Results Count */}
            <div className="flex justify-between items-center text-xs text-slate-400 px-1">
              <span>Found {visibleProjects.length} verified developments in {mapLocation.cityDetected}</span>
              {loading && <span className="text-emerald-400 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin"/> Updating...</span>}
            </div>

            {/* Projects Feed */}
            <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[calc(100vh-530px)] pr-1">
              {visibleProjects.length === 0 ? (
                <div className="p-6 text-center bg-slate-900/40 border border-slate-800 rounded-xl text-slate-400 text-xs">
                  No developments found for current filters in {mapLocation.cityDetected}. Click <strong>+ List Sale / Rent</strong> to add a property or commercial unit.
                </div>
              ) : (
                visibleProjects.map((proj) => {
                  const isSelected = selectedProject?.id === proj.id;
                  const isRental = proj.transaction_type === 'rent';
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
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-semibold text-slate-400">{proj.category_label}</span>
                          {isRental && (
                            <span className="text-[9px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 px-1.5 py-0.2 rounded">
                              FOR RENT
                            </span>
                          )}
                        </div>
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
                        {isRental ? (
                          <span>Rent: <strong className="text-sky-400 font-bold">{proj.rental_rate}</strong> ({proj.deposit_amount})</span>
                        ) : (
                          <span>Rate: <strong className="text-emerald-400 font-bold">{proj.pre_launch_rate || proj.market_rate}</strong></span>
                        )}
                        <span className="text-slate-300 font-semibold">{proj.road_approach}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>

        {/* Right Column: Full Project Inspection Dossier */}
        {selectedProject ? (
          <section className="lg:col-span-7 bg-[#0b1220] border border-slate-800 rounded-2xl p-5 lg:p-6 flex flex-col gap-5 shadow-2xl">
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                    {selectedProject.category_label}
                  </span>
                  {selectedProject.transaction_type === 'rent' && (
                    <span className="text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded">
                      AVAILABLE ON LEASE / RENT
                    </span>
                  )}
                </div>
                <h1 className="text-xl font-black text-white mt-1">{selectedProject.title}</h1>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  {selectedProject.gat_no} • Promoter / Owner: <span className="text-slate-200 font-semibold">{selectedProject.developer}</span>
                </p>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400 block">Possession / Handover</span>
                <span className="text-xs font-bold text-emerald-400 flex items-center justify-end gap-1 mt-0.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {selectedProject.completion_target}
                </span>
              </div>
            </div>

            {/* Audit Status */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Statutory Records & Title Audit
                </span>
                <span className="text-[11px] font-mono text-slate-400">{selectedProject.audit_id}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{selectedProject.audit_status}</p>
              <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Title Status: {selectedProject.title_clearance_status}</span>
              </div>
            </div>

            {/* Financial Details (Buy vs Rent) */}
            {selectedProject.transaction_type === 'rent' ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Monthly Rent</span>
                  <span className="text-base font-extrabold text-sky-400 mt-1 block">{selectedProject.rental_rate}</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Security Deposit</span>
                  <span className="text-base font-extrabold text-white mt-1 block">{selectedProject.deposit_amount}</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Road Frontage</span>
                  <span className="text-xs font-semibold text-slate-300 mt-1 block">{selectedProject.road_approach}</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Ready Reckoner</span>
                  <span className="text-sm font-extrabold text-white mt-1 block">{selectedProject.ready_reckoner_rate}</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Prevailing Rate</span>
                  <span className="text-sm font-extrabold text-emerald-400 mt-1 block">{selectedProject.market_rate}</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Direct Pre-Launch</span>
                  <span className="text-sm font-extrabold text-emerald-300 mt-1 block">{selectedProject.pre_launch_rate}</span>
                </div>
              </div>
            )}

            {/* Direct Connect & Pass */}
            <div className="mt-auto pt-4 border-t border-slate-800 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Direct Developer / Owner Desk (Zero Commission)
                </span>
                {selectedProject.developer_phone && (
                  <a
                    href={`https://wa.me/${selectedProject.developer_phone}?text=${encodeURIComponent(
                      `Hello, I saw ${selectedProject.title} on BhoomiRadar. Please provide direct inspection appointment details.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    WhatsApp Site Office
                  </a>
                )}
              </div>

              {/* Pass Booking Form */}
              <form onSubmit={handleGeneratePass} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Direct Site Inspection Pass
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {selectedProject.transaction_type === 'rent' ? selectedProject.rental_rate : `Locked Rate: ${selectedProject.pre_launch_rate}`}
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
            Select a project or rental property from the left feed.
          </section>
        )}
      </main>

      {/* MODAL: List Property (Sale or Rent) */}
      {showBuilderModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b1220] border border-slate-800 rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-white">List Property or Development</h3>
                <p className="text-slate-400">Post for direct sale or lease across Maharashtra.</p>
              </div>
              <button onClick={() => setShowBuilderModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-3">
              
              {/* Type Switch: Sale vs Rent */}
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Listing Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewProject({ ...newProject, transaction_type: 'buy' })}
                    className={`py-2 rounded-lg font-bold border ${newProject.transaction_type === 'buy' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                  >
                    For Outright Sale
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewProject({ ...newProject, transaction_type: 'rent' })}
                    className={`py-2 rounded-lg font-bold border ${newProject.transaction_type === 'rent' ? 'bg-sky-500/20 border-sky-500 text-sky-400' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                  >
                    For Rent / Lease
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Property or Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shivalik Residency or Flat 402, Ganga Tower"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Promoter / Owner Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={newProject.developer}
                    onChange={(e) => setNewProject({ ...newProject, developer: e.target.value })}
                    className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">WhatsApp Phone Number</label>
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
                  <label className="text-slate-300 font-semibold block mb-1">City / District (Maharashtra)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nashik, Nagpur, Kolhapur, Pune"
                    value={newProject.city}
                    onChange={(e) => setNewProject({ ...newProject, city: e.target.value })}
                    className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Gat No. / Survey No. / Address</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Gat No. 45/1"
                    value={newProject.gat_no}
                    onChange={(e) => setNewProject({ ...newProject, gat_no: e.target.value })}
                    className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                  />
                </div>
              </div>

              {/* Conditional Pricing: Rent vs Sale */}
              {newProject.transaction_type === 'rent' ? (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Expected Monthly Rent</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ₹20,000/month"
                      value={newProject.rental_rate}
                      onChange={(e) => setNewProject({ ...newProject, rental_rate: e.target.value })}
                      className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Security Deposit</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ₹60,000"
                      value={newProject.deposit_amount}
                      onChange={(e) => setNewProject({ ...newProject, deposit_amount: e.target.value })}
                      className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Direct Pre-Launch / Sale Rate</label>
                    <input
                      type="text"
                      required
                      placeholder="₹3,400/sq.ft"
                      value={newProject.pre_launch_rate}
                      onChange={(e) => setNewProject({ ...newProject, pre_launch_rate: e.target.value })}
                      className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">MahaRERA / Sanction Number</label>
                    <input
                      type="text"
                      required
                      placeholder="P516000..."
                      value={newProject.audit_id}
                      onChange={(e) => setNewProject({ ...newProject, audit_id: e.target.value })}
                      className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 mt-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition"
              >
                Publish Listing to Live Directory
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}