import { useState, useEffect, useRef } from 'react';
import { useInView } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import gsap from 'gsap';

// ---------------------------------------------------------------------------
// TRADE HUBS DATA
// ---------------------------------------------------------------------------
const HUBS = [
  {
    id: 'dahej',
    name: 'Dahej PCPIR Terminal',
    type: 'Primary Port & Pipeline Hub',
    country: 'Gujarat, India',
    coords: { x: 675, y: 265 },
    role: 'Central Trade Desk Headquarters',
    capacity: '85,000 MT / Month',
    throughput: 'Phenol, Caustic Soda Lye, Acetone, Methanol',
    transitTime: 'Domestic Gateway',
    compliance: 'NABL Certified · PESO Fleet Live',
    isPrimary: true,
  },
  {
    id: 'hazira',
    name: 'Hazira Liquid Terminal',
    type: 'Deep-water Port Terminal',
    country: 'Gujarat, India',
    coords: { x: 668, y: 280 },
    role: 'Chlor-Alkali & Solvents Pier',
    capacity: '45,000 MT / Month',
    throughput: 'Caustic Soda, Toluene, Benzene',
    transitTime: '12 Hours to Central Belt',
    compliance: 'ISO 9001:2015 · GSTIN Verified',
    isPrimary: false,
  },
  {
    id: 'taloja',
    name: 'Taloja Industrial Depot',
    type: 'Western Inland Buffer',
    country: 'Maharashtra, India',
    coords: { x: 685, y: 298 },
    role: 'Solvents & Drum Decanting',
    capacity: '28,000 MT / Month',
    throughput: 'Ethyl Acetate, Toluene, MEK',
    transitTime: '18-24 Hours Delivery',
    compliance: 'Dedicated SS316 Tanker Fleet',
    isPrimary: false,
  },
  {
    id: 'panipat',
    name: 'Panipat Petro Corridor',
    type: 'Northern Consumption Hub',
    country: 'NCR / Haryana, India',
    coords: { x: 688, y: 215 },
    role: 'Textile & Polymer Feedstock',
    capacity: '32,000 MT / Month',
    throughput: 'Acetic Acid, Monoethylene Glycol, IPA',
    transitTime: '36 Hours Road Transit',
    compliance: 'Automated Weighbridge Telemetry',
    isPrimary: false,
  },
  {
    id: 'hyderabad',
    name: 'Hyderabad Pharma City Desk',
    type: 'API Supply Corridor',
    country: 'Telangana, India',
    coords: { x: 710, y: 305 },
    role: 'Pharma Reagents & Pure Solvents',
    capacity: '22,000 MT / Month',
    throughput: 'Pharma-Grade Acetone, Methanol, HPLC IPA',
    transitTime: '24-30 Hours Dedicated Delivery',
    compliance: 'Full Batch COA Archive',
    isPrimary: false,
  },
  {
    id: 'chennai',
    name: 'Chennai / Ranipet Logistics Node',
    type: 'Southern Processing Hub',
    country: 'Tamil Nadu, India',
    coords: { x: 718, y: 335 },
    role: 'Leather & Dyeing Auxiliaries',
    capacity: '18,000 MT / Month',
    throughput: 'Glacial Acetic Acid, Formic Acid',
    transitTime: '40 Hours Scheduled Route',
    compliance: 'Digitally Sealed Offloading',
    isPrimary: false,
  },
  {
    id: 'haldia',
    name: 'Haldia Port Terminal',
    type: 'Eastern Maritime Gateway',
    country: 'West Bengal, India',
    coords: { x: 755, y: 255 },
    role: 'Bulk Petrochem Inflow Node',
    capacity: '25,000 MT / Month',
    throughput: 'Methanol, Monomers, Polymer Resins',
    transitTime: 'Direct Sea Berth',
    compliance: 'Customs Bonded Warehouse',
    isPrimary: false,
  },
  {
    id: 'jubail',
    name: 'Jubail Industrial Port',
    type: 'Middle East Primary Producer',
    country: 'Saudi Arabia',
    coords: { x: 575, y: 248 },
    role: 'Base Hydrocarbon & Methanol Origin',
    capacity: 'Primary Synthesis Mega-Plant',
    throughput: 'Methanol, Glycols, Aromatics',
    transitTime: '5-7 Days Maritime Vessel',
    compliance: 'Global REACH & SABIC Benchmarks',
    isPrimary: false,
  },
  {
    id: 'singapore',
    name: 'Jurong Island Complex',
    type: 'Southeast Asian Trading Hub',
    country: 'Singapore',
    coords: { x: 795, y: 350 },
    role: 'High-Purity Solvent Fractionation',
    capacity: 'Major Regional Tank Farm',
    throughput: 'Isopropanol, Acetates, Specialty Esters',
    transitTime: '6-8 Days Tanker Vessel',
    compliance: 'International IMO Tier-II',
    isPrimary: false,
  },
  {
    id: 'antwerp',
    name: 'Port of Antwerp-Bruges',
    type: 'European Chemical Cluster',
    country: 'Belgium, EU',
    coords: { x: 470, y: 155 },
    role: 'Fine Chemicals & Specialty Esters',
    capacity: 'Global Tank Terminal',
    throughput: 'Specialty Acrylates, Plasticizers',
    transitTime: '18 Days Container / Parcel Tanker',
    compliance: 'EU REACH Audited',
    isPrimary: false,
  },
  {
    id: 'ulsan',
    name: 'Ulsan Petrochemical Complex',
    type: 'East Asian Synthesis Cluster',
    country: 'South Korea',
    coords: { x: 875, y: 220 },
    role: 'Phenol, Acetone & Polymer Precursors',
    capacity: 'Primary Synthesis Plant',
    throughput: 'Phenol CP Grade, Bisphenol-A, Acetone',
    transitTime: '10-12 Days Sea Freight',
    compliance: 'Korean Chemical Control Act & ISO 14001',
    isPrimary: false,
  },
];

// Connection routes linking into Dahej
const ROUTES = [
  // Global sea routes to Dahej
  { from: 'jubail', to: 'dahej', curve: -35, mode: 'sea', name: 'Arabian Gulf Maritime Corridor' },
  { from: 'singapore', to: 'dahej', curve: 40, mode: 'sea', name: 'Malacca Strait Chemical Inflow' },
  { from: 'antwerp', to: 'dahej', curve: -50, mode: 'sea', name: 'Suez-India Liquid Bulk Line' },
  { from: 'ulsan', to: 'dahej', curve: -45, mode: 'sea', name: 'East Asian Petrochemical Lane' },

  // Domestic corridors radiating from Dahej
  { from: 'dahej', to: 'hazira', curve: -10, mode: 'domestic', name: 'Gujarat PCPIR Coastal Link' },
  { from: 'dahej', to: 'taloja', curve: 15, mode: 'domestic', name: 'Western Highway Tanker Route' },
  { from: 'dahej', to: 'panipat', curve: -20, mode: 'domestic', name: 'Northern Industrial Corridor' },
  { from: 'dahej', to: 'hyderabad', curve: 18, mode: 'domestic', name: 'Deccan Pharma Expressway' },
  { from: 'dahej', to: 'chennai', curve: 25, mode: 'domestic', name: 'South Peninsula Transit' },
  { from: 'dahej', to: 'haldia', curve: -15, mode: 'domestic', name: 'East-West Bulk Pipeline Freight' },
];

export default function GlobalTradeNetwork({ className = '' }) {
  const [selectedHub, setSelectedHub] = useState(HUBS[0]);
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'domestic' | 'global'
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: '-60px' });

  // GSAP pulse / flow animation trigger
  useEffect(() => {
    if (!isInView) return;

    // Animate glowing connection paths using GSAP
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.gsap-trade-path',
        { strokeDashoffset: 120, opacity: 0 },
        {
          strokeDashoffset: 0,
          opacity: 0.85,
          duration: 2.2,
          ease: 'power2.out',
          stagger: 0.08,
        }
      );

      gsap.fromTo(
        '.gsap-hub-node',
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.8,
          ease: 'back.out(1.7)',
          stagger: 0.05,
          delay: 0.4,
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [isInView]);

  const activeRoutes = ROUTES.filter((r) => {
    if (filterMode === 'domestic') return r.mode === 'domestic';
    if (filterMode === 'global') return r.mode === 'sea';
    return true;
  });

  // Calculate SVG curve path between two hubs
  const getPathD = (route) => {
    const fromHub = HUBS.find((h) => h.id === route.from);
    const toHub = HUBS.find((h) => h.id === route.to);
    if (!fromHub || !toHub) return '';

    const x1 = fromHub.coords.x;
    const y1 = fromHub.coords.y;
    const x2 = toHub.coords.x;
    const y2 = toHub.coords.y;

    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2 + route.curve;

    return `M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`;
  };

  return (
    <div ref={containerRef} className={`rounded-3xl border border-[#e2e8e5] bg-white shadow-xl overflow-hidden ${className}`}>
      {/* Top Controller Header */}
      <div className="border-b border-[#e2e8e5] bg-[#f8faf9] p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-[#0b7a55] animate-ping" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#0b7a55]">
              Real-Time Trade Network Telemetry
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-[#0f172a] mt-1">
            Institutional Supply Network &amp; Logistics Corridors
          </h3>
          <p className="text-xs sm:text-sm text-[#4a5666] mt-0.5">
            Connecting Gujarat’s petrochemical core with global maritime terminals and pan-India road corridors.
          </p>
        </div>

        {/* Mode Filter Pill Buttons */}
        <div className="inline-flex rounded-xl bg-white p-1 border border-[#d0ded7] shadow-xs shrink-0 text-xs font-bold">
          <button
            onClick={() => setFilterMode('all')}
            className={`rounded-lg px-3.5 py-1.5 transition-all ${
              filterMode === 'all'
                ? 'bg-[#0b7a55] text-white shadow-xs'
                : 'text-[#4a5666] hover:text-[#0f172a]'
            }`}
          >
            All Corridors ({ROUTES.length})
          </button>
          <button
            onClick={() => setFilterMode('domestic')}
            className={`rounded-lg px-3.5 py-1.5 transition-all ${
              filterMode === 'domestic'
                ? 'bg-[#0b7a55] text-white shadow-xs'
                : 'text-[#4a5666] hover:text-[#0f172a]'
            }`}
          >
            Domestic Fleets
          </button>
          <button
            onClick={() => setFilterMode('global')}
            className={`rounded-lg px-3.5 py-1.5 transition-all ${
              filterMode === 'global'
                ? 'bg-[#0b7a55] text-white shadow-xs'
                : 'text-[#4a5666] hover:text-[#0f172a]'
            }`}
          >
            Maritime Inflows
          </button>
        </div>
      </div>

      {/* Interactive Map Visual */}
      <div className="relative bg-[#0b132b] p-4 sm:p-6 overflow-hidden min-h-[380px] sm:min-h-[460px] flex items-center justify-center">
        {/* Subtle Map Grid Background */}
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:28px_28px] opacity-20 pointer-events-none" />
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-[#0b7a55]/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-[#0b7a55]/20 blur-3xl pointer-events-none" />

        <svg
          viewBox="0 0 1000 500"
          className="w-full h-full max-h-[480px] drop-shadow-2xl select-none"
        >
          {/* Subtle World Landmass Outlines (Abstract Stylized Continents) */}
          <g className="fill-white/5 stroke-white/10 stroke-[1.2]">
            {/* North America */}
            <path d="M 120 120 Q 180 100 240 140 T 260 260 Q 210 290 160 250 Z" />
            {/* Europe */}
            <path d="M 430 110 Q 500 90 530 150 T 480 210 Q 420 180 430 110 Z" />
            {/* Africa */}
            <path d="M 460 230 Q 540 230 550 320 T 490 410 Q 440 330 460 230 Z" />
            {/* Middle East & Arabian Peninsula */}
            <path d="M 550 210 Q 610 220 620 280 T 560 290 Z" />
            {/* India & South Asia */}
            <path d="M 640 180 Q 720 170 760 220 T 710 360 Q 650 310 640 220 Z" />
            {/* East Asia & SE Asia */}
            <path d="M 760 140 Q 880 120 900 220 T 820 360 Q 760 300 760 200 Z" />
            {/* Australia */}
            <path d="M 820 380 Q 920 370 940 430 T 860 470 Z" />
          </g>

          {/* Connection Trade Routes */}
          <g>
            {activeRoutes.map((route, idx) => {
              const pathD = getPathD(route);
              const isSelected = selectedHub && (route.from === selectedHub.id || route.to === selectedHub.id);
              const isSea = route.mode === 'sea';

              return (
                <g key={idx}>
                  {/* Outer Glow Path */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={isSelected ? '#34d399' : isSea ? '#0ea5e9' : '#10b981'}
                    strokeWidth={isSelected ? 3.5 : 2}
                    strokeOpacity={isSelected ? 0.9 : 0.4}
                    className="gsap-trade-path transition-all duration-300"
                  />

                  {/* Flowing Dashed Tracer Line */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={isSelected ? '#ffffff' : isSea ? '#7dd3fc' : '#6ee7b7'}
                    strokeWidth={isSelected ? 2 : 1.5}
                    strokeDasharray="6 6"
                    className="map-line-flow opacity-80"
                  />
                </g>
              );
            })}
          </g>

          {/* Trade Hub Nodes */}
          <g>
            {HUBS.map((hub) => {
              const isSelected = selectedHub?.id === hub.id;
              const isPrimary = hub.isPrimary;

              return (
                <g
                  key={hub.id}
                  onClick={() => setSelectedHub(hub)}
                  className="gsap-hub-node cursor-pointer group"
                  transform={`translate(${hub.coords.x}, ${hub.coords.y})`}
                >
                  {/* Concentric Pulse Rings for Primary Hubs */}
                  {isPrimary && (
                    <>
                      <circle
                        r="24"
                        className="fill-[#10b981]/20 map-node-pulse pointer-events-none"
                      />
                      <circle
                        r="16"
                        className="fill-[#34d399]/30 map-node-pulse pointer-events-none"
                        style={{ animationDelay: '0.8s' }}
                      />
                    </>
                  )}

                  {/* Interactive Outer Target Ring */}
                  <circle
                    r={isSelected ? (isPrimary ? 12 : 9) : (isPrimary ? 9 : 6.5)}
                    className={`transition-all duration-300 ${
                      isSelected
                        ? 'fill-[#10b981] stroke-white stroke-[2.5]'
                        : isPrimary
                        ? 'fill-[#10b981] stroke-[#6ee7b7] stroke-2 group-hover:scale-125'
                        : 'fill-[#38bdf8] stroke-white/80 stroke-1.5 group-hover:scale-125'
                    }`}
                  />

                  {/* Center Dot */}
                  <circle
                    r={isPrimary ? 3.5 : 2.5}
                    className="fill-white pointer-events-none"
                  />

                  {/* Station Label */}
                  <text
                    y={isPrimary ? -16 : -12}
                    textAnchor="middle"
                    className={`font-sans text-[10px] font-bold tracking-tight select-none transition-all ${
                      isSelected
                        ? 'fill-[#6ee7b7] font-black text-[11px]'
                        : isPrimary
                        ? 'fill-white'
                        : 'fill-[#cbd5e1] group-hover:fill-white'
                    }`}
                  >
                    {hub.name.split(' ')[0]}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Live Legend Watermark */}
        <div className="absolute bottom-4 left-4 z-10 flex flex-wrap items-center gap-3 rounded-xl bg-black/60 backdrop-blur-md px-3.5 py-2 border border-white/10 text-[11px] text-white">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#10b981]" />
            <span className="text-[#cbd5e1]">Gujarat PCPIR Heartland</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#38bdf8]" />
            <span className="text-[#cbd5e1]">Global &amp; Port Inflow Terminals</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-4 border-b-2 border-dashed border-[#6ee7b7]" />
            <span className="text-[#cbd5e1]">Active Dedicated Freight</span>
          </div>
        </div>
      </div>

      {/* Hub Specification Context Deck */}
      {selectedHub && (
        <div className="p-6 bg-white border-t border-[#e2e8e5] animate-in fade-in duration-200">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#e4f2ec] px-3 py-0.5 text-xs font-mono font-bold text-[#0b7a55]">
                  {selectedHub.type}
                </span>
                <span className="text-xs font-bold text-[#65717f]">
                  {selectedHub.country}
                </span>
              </div>
              <h4 className="text-2xl font-black text-[#0f172a]">
                {selectedHub.name}
              </h4>
              <p className="text-xs sm:text-sm text-[#4a5666]">
                {selectedHub.role}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div className="rounded-xl bg-[#f8faf9] p-3 border border-[#e2e8e5]">
                <span className="text-[10px] text-[#65717f] block uppercase">Monthly Capacity</span>
                <strong className="text-sm text-[#0f172a] block mt-0.5 font-bold">{selectedHub.capacity}</strong>
              </div>

              <div className="rounded-xl bg-[#f8faf9] p-3 border border-[#e2e8e5]">
                <span className="text-[10px] text-[#65717f] block uppercase">Lead Time</span>
                <strong className="text-sm text-[#0b7a55] block mt-0.5 font-bold">{selectedHub.transitTime}</strong>
              </div>

              <div className="rounded-xl bg-[#f8faf9] p-3 border border-[#e2e8e5] sm:col-span-2">
                <span className="text-[10px] text-[#65717f] block uppercase">Handled Commodities</span>
                <span className="text-xs text-[#0f172a] font-bold truncate block mt-0.5 font-sans">
                  {selectedHub.throughput}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[#edf2ef] flex flex-wrap items-center justify-between text-xs text-[#65717f] gap-2">
            <div className="flex items-center gap-2 text-[#0b7a55] font-semibold">
              <ShieldCheck size={16} />
              <span>Compliance: {selectedHub.compliance}</span>
            </div>
            <div className="text-[11px]">
              Click any node on the map to inspect terminal capacity and active freight routes.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
