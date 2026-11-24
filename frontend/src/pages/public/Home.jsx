import { useState, useMemo, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  CheckCircle2,
  FileCheck2,
  Headphones,
  ChevronRight,
  FlaskConical,
  Droplets,
  Sprout,
  Pill,
  Paintbrush,
  HardHat,
  X,
  PhoneCall,
  Search,
} from 'lucide-react';
import Header from '../../components/public/Header.jsx';
import Footer from '../../components/public/Footer.jsx';
import SectionHeading from '../../components/public/SectionHeading.jsx';
import { useRequestRfq } from '../../lib/useRfqAuth.js';
import {
  FadeUp,
  HoverLift,
  AnimatedCounter,
  HeroEntrance,
  HeroHeading,
  HeroText,
  HeroActions,
  ScrollReveal,
  ProductCardHover,
} from '../../components/public/AnimationWrappers.jsx';

/* =========================================================================
   1. HERO BACKGROUND EFFECTS & FLOATING CHEMICAL OBJECTS (SVG + Framer Motion)
   ========================================================================= */
function HeroBackgroundEffects() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      {/* Ambient Fluid Glow Orbs (Subtle Depth without darkening the white backdrop) */}
      <motion.div
        className="absolute -top-32 right-[5%] w-[420px] h-[420px] rounded-full bg-gradient-to-br from-[#10b981]/12 via-[#34d399]/6 to-transparent blur-3xl"
        animate={{
          x: [0, 30, -20, 0],
          y: [0, -30, 20, 0],
          scale: [1, 1.08, 0.94, 1],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute -bottom-28 left-[3%] w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-[#059669]/10 via-[#10b981]/5 to-transparent blur-3xl"
        animate={{
          x: [0, -35, 25, 0],
          y: [0, 30, -20, 0],
          scale: [1, 1.12, 0.95, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1.5,
        }}
      />
      <motion.div
        className="absolute top-1/4 left-1/3 w-72 h-72 rounded-full bg-[#34d399]/6 blur-2xl"
        animate={{
          scale: [1, 1.25, 1],
          opacity: [0.25, 0.55, 0.25],
        }}
        transition={{
          duration: 11,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Analytical Chromatography & Spectrometer Waveform (Mid-Layer Horizon) */}
      <div className="absolute top-[46%] left-0 right-0 w-full opacity-35 sm:opacity-50">
        <svg
          viewBox="0 0 1200 100"
          className="w-full h-20 stroke-[#10b981] fill-none"
          preserveAspectRatio="none"
        >
          <motion.path
            d="M0,50 L260,50 Q290,50 310,48 T340,16 Q355,5 370,50 T410,76 Q425,90 440,50 T500,50 L730,50 Q760,50 780,26 T810,50 T860,50 L1200,50"
            strokeWidth="1.25"
            strokeDasharray="5 3"
            animate={{ strokeDashoffset: [0, -100] }}
            transition={{
              duration: 22,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </svg>
      </div>

      {/* Object 1: Benzene Hexagonal Ring with Orbiting Electron (Top Right) */}
      <motion.div
        className="absolute top-12 right-[6%] w-36 h-36 sm:w-44 sm:h-44 opacity-40 sm:opacity-60"
        animate={{
          y: [0, -20, 0],
          rotate: [0, 12, -4, 0],
          scale: [1, 1.04, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <svg viewBox="0 0 120 120" className="w-full h-full stroke-[#10b981] fill-none" strokeWidth="2">
          {/* Orbital path ring */}
          <ellipse
            cx="60"
            cy="60"
            rx="52"
            ry="24"
            transform="rotate(-25 60 60)"
            className="stroke-[#34d399]/40"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          {/* Hexagonal aromatic core */}
          <polygon points="60,15 95,35 95,75 60,95 25,75 25,35" className="stroke-[#0b7a55]" strokeWidth="2.2" />
          {/* Alternating conjugated double bonds */}
          <line x1="60" y1="25" x2="86" y2="40" strokeDasharray="4 2" className="stroke-[#10b981]" />
          <line x1="86" y1="70" x2="60" y2="85" strokeDasharray="4 2" className="stroke-[#10b981]" />
          <line x1="34" y1="70" x2="34" y2="40" strokeDasharray="4 2" className="stroke-[#10b981]" />
          {/* Delocalized pi electron ring */}
          <circle cx="60" cy="55" r="18" className="stroke-[#34d399]/50" strokeWidth="1" strokeDasharray="3 3" />
          {/* Vertex atoms */}
          <circle cx="60" cy="15" r="4" className="fill-[#10b981] stroke-white" strokeWidth="1" />
          <circle cx="95" cy="35" r="4" className="fill-[#0b7a55] stroke-white" strokeWidth="1" />
          <circle cx="95" cy="75" r="4" className="fill-[#10b981] stroke-white" strokeWidth="1" />
          <circle cx="60" cy="95" r="4" className="fill-[#0b7a55] stroke-white" strokeWidth="1" />
          <circle cx="25" cy="75" r="4" className="fill-[#10b981] stroke-white" strokeWidth="1" />
          <circle cx="25" cy="35" r="4" className="fill-[#0b7a55] stroke-white" strokeWidth="1" />
        </svg>

        {/* Orbiting Satellite Electron */}
        <motion.div
          className="absolute top-1/2 left-1/2 w-2.5 h-2.5 -ml-1.25 -mt-1.25 rounded-full bg-[#10b981] shadow-[0_0_10px_#10b981]"
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{
            transformOrigin: '50px 22px',
          }}
        />
      </motion.div>

      {/* Object 2: Laboratory Conical Flask with Rising Vapor Bubbles (Top Left) */}
      <motion.div
        className="absolute top-14 left-[4%] w-32 h-36 opacity-35 sm:opacity-55"
        animate={{
          y: [0, 18, 0],
          rotate: [0, -6, 4, 0],
        }}
        transition={{
          duration: 11,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.5,
        }}
      >
        <svg viewBox="0 0 100 120" className="w-full h-full stroke-[#0b7a55] fill-none" strokeWidth="1.8">
          {/* Flask Lip */}
          <ellipse cx="50" cy="14" rx="14" ry="4" className="stroke-[#10b981]" />
          {/* Flask Neck */}
          <line x1="42" y1="14" x2="42" y2="40" />
          <line x1="58" y1="14" x2="58" y2="40" />
          {/* Graduation measurement ticks */}
          <line x1="42" y1="24" x2="48" y2="24" strokeWidth="1" className="stroke-[#34d399]" />
          <line x1="42" y1="32" x2="48" y2="32" strokeWidth="1" className="stroke-[#34d399]" />
          {/* Flask Body */}
          <path d="M42,40 L16,98 A8,8 0 0,0 24,108 L76,108 A8,8 0 0,0 84,98 L58,40" />
          {/* Liquid Meniscus & Solution Base */}
          <path
            d="M26,90 Q50,96 74,90"
            className="stroke-[#10b981] fill-[#10b981]/15"
            strokeWidth="1.5"
          />
          <path
            d="M26,90 Q50,96 74,90 L76,106 A6,6 0 0,1 70,108 L30,108 A6,6 0 0,1 24,106 Z"
            className="fill-[#10b981]/10 stroke-none"
          />
          {/* Micro Bubbles Rising from Reagent Fluid */}
          <motion.circle
            cx="48"
            cy="84"
            r="2"
            className="fill-[#10b981]"
            animate={{ y: [0, -35], opacity: [0, 0.8, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut', delay: 0.2 }}
          />
          <motion.circle
            cx="55"
            cy="80"
            r="1.5"
            className="fill-[#34d399]"
            animate={{ y: [0, -30], opacity: [0, 0.9, 0] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeOut', delay: 1.1 }}
          />
          <motion.circle
            cx="44"
            cy="76"
            r="1.8"
            className="fill-[#6ee7b7]"
            animate={{ y: [0, -28], opacity: [0, 0.8, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut', delay: 1.8 }}
          />
        </svg>
      </motion.div>

      {/* Object 3: Tetrahedral Branched Alkane Polymer with Element Tags (Bottom Left) */}
      <motion.div
        className="absolute bottom-10 left-[3%] w-48 h-48 opacity-30 sm:opacity-45"
        animate={{
          y: [0, 24, 0],
          rotate: [0, -10, 8, 0],
        }}
        transition={{
          duration: 13,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
      >
        <svg viewBox="0 0 130 130" className="w-full h-full stroke-[#0b7a55] fill-none" strokeWidth="2">
          {/* Bonds */}
          <line x1="65" y1="65" x2="25" y2="25" className="stroke-[#10b981]" />
          <line x1="65" y1="65" x2="105" y2="30" className="stroke-[#0b7a55]" />
          <line x1="65" y1="65" x2="65" y2="115" className="stroke-[#0b7a55]" />
          <line x1="25" y1="25" x2="15" y2="65" strokeDasharray="3 3" className="stroke-[#34d399]" />
          <line x1="105" y1="30" x2="115" y2="75" strokeDasharray="3 3" className="stroke-[#34d399]" />
          <line x1="65" y1="115" x2="100" y2="120" className="stroke-[#6ee7b7]" />
          {/* Atoms with chemical element labels */}
          <circle cx="65" cy="65" r="9" className="fill-[#0b7a55] stroke-white" strokeWidth="1.5" />
          <text x="65" y="68.5" textAnchor="middle" className="fill-white text-[9px] font-mono font-bold">C</text>

          <circle cx="25" cy="25" r="7.5" className="fill-[#10b981] stroke-white" strokeWidth="1.2" />
          <text x="25" y="28" textAnchor="middle" className="fill-white text-[8px] font-mono font-bold">O</text>

          <circle cx="105" cy="30" r="7.5" className="fill-[#0b7a55] stroke-white" strokeWidth="1.2" />
          <text x="105" y="33" textAnchor="middle" className="fill-white text-[8px] font-mono font-bold">N</text>

          <circle cx="65" cy="115" r="7.5" className="fill-[#10b981] stroke-white" strokeWidth="1.2" />
          <text x="65" y="118" textAnchor="middle" className="fill-white text-[8px] font-mono font-bold">C</text>

          <circle cx="15" cy="65" r="4.5" className="fill-[#a7f3d0] stroke-none" />
          <circle cx="115" cy="75" r="4.5" className="fill-[#a7f3d0] stroke-none" />
          <circle cx="100" cy="120" r="4.5" className="fill-[#6ee7b7] stroke-none" />
        </svg>
      </motion.div>

      {/* Object 4: Carbonyl Double Bond Intermediate (Center Right) */}
      <motion.div
        className="absolute top-[42%] right-[2%] w-32 h-32 opacity-30 sm:opacity-45"
        animate={{
          y: [0, -18, 0],
          x: [0, 8, 0],
          rotate: [0, -15, 0],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
      >
        <svg viewBox="0 0 90 90" className="w-full h-full stroke-[#10b981] fill-none" strokeWidth="2">
          <line x1="15" y1="45" x2="45" y2="45" className="stroke-[#0b7a55]" />
          {/* Double bond to oxygen */}
          <line x1="43" y1="41" x2="72" y2="22" strokeWidth="2" className="stroke-[#10b981]" />
          <line x1="47" y1="47" x2="76" y2="28" strokeWidth="2" className="stroke-[#10b981]" />
          <line x1="45" y1="45" x2="62" y2="75" className="stroke-[#0b7a55]" />
          {/* Atoms */}
          <circle cx="15" cy="45" r="5" className="fill-[#0b7a55]" />
          <circle cx="45" cy="45" r="6" className="fill-[#10b981]" />
          <circle cx="74" cy="25" r="5.5" className="fill-[#059669]" />
          <circle cx="62" cy="75" r="4.5" className="fill-[#34d399]" />
        </svg>
      </motion.div>

      {/* Object 5: Chiral Isomer Geometric Cluster (Bottom Right) */}
      <motion.div
        className="absolute bottom-8 right-[10%] w-32 h-32 opacity-25 sm:opacity-40"
        animate={{
          y: [0, -16, 0],
          rotate: [0, 18, -8, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 3,
        }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full stroke-[#0b7a55] fill-none" strokeWidth="1.8">
          <circle cx="50" cy="50" r="14" className="stroke-[#10b981]" strokeDasharray="3 3" />
          <line x1="50" y1="36" x2="50" y2="12" />
          <line x1="60" y1="60" x2="82" y2="78" />
          <line x1="40" y1="60" x2="18" y2="78" />
          <circle cx="50" cy="12" r="4" className="fill-[#10b981]" />
          <circle cx="82" cy="78" r="4.5" className="fill-[#0b7a55]" />
          <circle cx="18" cy="78" r="4.5" className="fill-[#34d399]" />
          <circle cx="50" cy="50" r="5" className="fill-[#6ee7b7]" />
        </svg>
      </motion.div>

      {/* Object 6: Effervescent Micro-Atom Swarm (Active Drifting Particles) */}
      {[
        { top: '22%', left: '16%', size: 6, dur: 5, del: 0, color: '#10b981' },
        { top: '35%', left: '26%', size: 4, dur: 6.5, del: 1, color: '#34d399' },
        { top: '65%', left: '18%', size: 7, dur: 5.5, del: 0.8, color: '#0b7a55' },
        { top: '18%', left: '74%', size: 5, dur: 7, del: 2.2, color: '#6ee7b7' },
        { top: '78%', left: '72%', size: 6, dur: 6, del: 1.5, color: '#10b981' },
        { top: '32%', left: '88%', size: 4.5, dur: 8, del: 3, color: '#34d399' },
        { top: '60%', left: '84%', size: 5.5, dur: 6.8, del: 0.4, color: '#0b7a55' },
        { top: '26%', left: '50%', size: 3.5, dur: 5.2, del: 1.8, color: '#10b981' },
      ].map((pt, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            top: pt.top,
            left: pt.left,
            width: pt.size,
            height: pt.size,
            backgroundColor: pt.color,
            boxShadow: `0 0 10px ${pt.color}`,
          }}
          animate={{
            y: [0, -22, 0],
            x: [0, i % 2 === 0 ? 10 : -10, 0],
            scale: [1, 1.35, 1],
            opacity: [0.25, 0.75, 0.25],
          }}
          transition={{
            duration: pt.dur,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: pt.del,
          }}
        />
      ))}

      {/* Object 7: Precision Grid Telemetry Markers (+) */}
      <div className="absolute top-20 left-[24%] text-[#10b981]/35 font-mono text-xs select-none">+</div>
      <div className="absolute bottom-24 left-[38%] text-[#10b981]/30 font-mono text-xs select-none">+</div>
      <div className="absolute top-28 right-[28%] text-[#10b981]/35 font-mono text-xs select-none">+</div>
      <div className="absolute bottom-20 right-[22%] text-[#10b981]/30 font-mono text-xs select-none">+</div>
    </div>
  );
}

/* =========================================================================
   DATA DEFINITIONS
   ========================================================================= */

// 1. Featured Chemicals
const FEATURED_PRODUCTS = [
  {
    name: 'Phenol',
    grade: 'Pure / CP Grade 99.5%',
    cas: '108-95-2',
    formula: 'C₆H₅OH',
    application: 'Phenolic resins, bisphenol-A, polycarbonates, pharmaceuticals & agrochemicals.',
    moq: '10 MT / Road Tanker',
    hazard: 'Class 6.1 (Toxic / Corrosive)',
    packaging: 'Dedicated SS316 Road Tankers / MS Drums',
    origin: 'Dahej PCPIR Hub',
    image: 'https://images.unsplash.com/photo-1603555501671-8f96b3fce8b4?auto=format&fit=crop&w=800&q=80',
    tag: 'Bulk Petrochemical',
  },
  {
    name: 'Caustic Soda Lye',
    grade: 'Rayon Grade 48% - 50%',
    cas: '1310-73-2',
    formula: 'NaOH',
    application: 'Textile scouring & mercerizing, alumina refining, soap synthesis, effluent pH neutralization.',
    moq: '20 MT / Road Tanker',
    hazard: 'Class 8 (Corrosive Liquid)',
    packaging: 'Rubber-Lined / Epoxy-Coated Tankers',
    origin: 'Dahej & Hazira Belt',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    tag: 'Chlor-Alkali',
  },
  {
    name: 'Methanol',
    grade: 'Pure Synthetic Grade 99.85%',
    cas: '67-56-1',
    formula: 'CH₃OH',
    application: 'Formaldehyde synthesis, acetic acid, biodiesel esterification, high-purity pharma extraction.',
    moq: '15 MT / Road Tanker',
    hazard: 'Class 3 (Flammable Liquid)',
    packaging: 'MS Road Tankers / ISO Totes',
    origin: 'Kandla & Dahej Terminals',
    image: 'https://images.unsplash.com/photo-1518152006812-edab29b069ac?auto=format&fit=crop&w=800&q=80',
    tag: 'Industrial Solvent',
  },
  {
    name: 'Acetone',
    grade: 'Pure Industrial Grade 99.5%',
    cas: '67-64-1',
    formula: 'C₃H₆O',
    application: 'Paints & coatings, methyl methacrylate (MMA), pharmaceutical synthesis, resin dilution.',
    moq: '12 MT / Road Tanker',
    hazard: 'Class 3 (Flammable Liquid)',
    packaging: 'Stainless Steel Tankers / HDPE Drums',
    origin: 'Dahej PCPIR Belt',
    image: 'https://images.unsplash.com/photo-1563170351-be82bc888aa4?auto=format&fit=crop&w=800&q=80',
    tag: 'Ketone Solvent',
  },
  {
    name: 'Ethyl Acetate',
    grade: 'Urethane Grade 99.8%',
    cas: '141-78-6',
    formula: 'C₄H₈O₂',
    application: 'Rotogravure packaging inks, flexible laminates, synthetic resins, process extraction.',
    moq: '10 MT / Tanker or Drums',
    hazard: 'Class 3 (Flammable Liquid)',
    packaging: 'Dedicated Road Tankers / MS Barrels',
    origin: 'Ankleshwar GIDC Hub',
    image: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=800&q=80',
    tag: 'Specialty Ester',
  },
  {
    name: 'Toluene',
    grade: 'Pure Industrial Grade 99.7%',
    cas: '108-88-3',
    formula: 'C₇H₈',
    application: 'Industrial thinners, adhesives, polyurethane foam synthesis, chemical intermediates.',
    moq: '15 MT / Road Tanker',
    hazard: 'Class 3 (Flammable Liquid)',
    packaging: 'Calibrated Road Tankers',
    origin: 'Dahej Petrochem Port',
    image: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=800&q=80',
    tag: 'Aromatic Hydrocarbon',
  },
];

// 2. Industries We Serve
const INDUSTRIES = [
  {
    title: 'Pharmaceuticals & APIs',
    icon: Pill,
    desc: 'High-purity reaction solvents, synthesis reagents, and HPLC extraction media with strict lot traceability.',
    chemicals: 'Methanol, Acetone, IPA, Ethyl Acetate',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Textiles & Dyeing',
    icon: Droplets,
    desc: 'Reliable bulk supply of scouring alkalies, bleaching auxiliaries, and dye fixing chemical intermediates.',
    chemicals: 'Caustic Soda Lye, Acetic Acid, Hydrogen Peroxide',
    image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Agriculture & Crop Care',
    icon: Sprout,
    desc: 'Emulsifiable concentrate carriers, surfactant bases, and formulation solvents for fertilizer & agro plants.',
    chemicals: 'Toluene, Cyclohexanone, Phenol Derivatives',
    image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Water & Effluent Treatment',
    icon: FlaskConical,
    desc: 'Industrial neutralizing agents, coagulants, and chlor-alkali disinfectants for zero-liquid discharge setups.',
    chemicals: 'Caustic Soda 48%, Alum, Sulfuric Acid',
    image: 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f7?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Paints, Inks & Coatings',
    icon: Paintbrush,
    desc: 'Volatile drying solvents, ester diluents, and aromatic thinners for architectural and automotive coatings.',
    chemicals: 'Ethyl Acetate, Acetone, Toluene, MIBK',
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Construction & Manufacturing',
    icon: HardHat,
    desc: 'Polymer precursors, concrete admixtures, epoxy curing chemicals, and industrial degreasers.',
    chemicals: 'Phenol, Formaldehyde, DEG, Plasticizers',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
  },
];

// 3. Why Choose Us Pillars
const VALUE_PILLARS = [
  {
    icon: ShieldCheck,
    title: 'Reliable Sourcing',
    desc: 'Direct allocation from primary synthesis mills, refinery port jetties, and bonded tank terminals. Zero phantom stock quotes.',
  },
  {
    icon: Headphones,
    title: 'Technical & Sizing Support',
    desc: 'Experienced chemical engineers and logistics managers on desk to assist with grade selection, packaging specs, and decanting protocols.',
  },
  {
    icon: FileCheck2,
    title: 'Quality Documentation',
    desc: 'Every consignment backed by manufacturer batch Certificate of Analysis (COA), 16-section MSDS, and pre-dispatch NABL testing.',
  },
  {
    icon: Truck,
    title: 'Responsive Service & Fleet',
    desc: 'Binding spot quotations within 60 minutes, dedicated account oversight, and calibrated GPS-tracked HazMat road tankers.',
  },
];

// 4. Our Process Steps
const PROCESS_STEPS = [
  {
    step: '01',
    title: 'Source',
    badge: 'Direct Mill Allocation',
    desc: 'We secure verified inventory allocations directly from licensed primary synthesis plants and port storage tank farms in the Dahej & Hazira corridors.',
  },
  {
    step: '02',
    title: 'Verify',
    badge: 'NABL & COA Testing',
    desc: 'Batch purity parameters, moisture levels, and specific gravities are audited against manufacturer COAs with pre-dispatch joint driver sampling.',
  },
  {
    step: '03',
    title: 'Supply',
    badge: 'Single-Source Billing',
    desc: 'Transparent pricing with computerized weighbridge tare/gross calibration, synchronized e-way bill generation, and 100% compliant GST invoicing.',
  },
  {
    step: '04',
    title: 'Deliver',
    badge: 'GPS Tanker Transit',
    desc: 'Dedicated SS316, MS, or rubber-lined road tankers execute safe transit under strict PESO HazMat guidelines directly to your plant weighbridge.',
  },
];

// Searchable chemical directory for the interactive search bar
const SEARCHABLE_CHEMICALS = [
  {
    name: 'Di Potassium Phosphate Anhydrous',
    cas: '7758-11-4',
    formula: 'K₂HPO₄',
    category: 'Agro Chemicals',
    grade: 'Technical / Agro Grade',
    buyerPrice: '₹158.00/KG',
    moq: '2,000 kg',
    packaging: '25 kg / 50 kg HDPE Bags',
    origin: 'Dahej PCPIR',
    hazard: 'Non-Hazardous',
    application: 'Fertilizers, agrochemical formulations, fermentation nutrient, buffering agent.',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Isopropyl Alcohol (IPA)',
    cas: '67-63-0',
    formula: 'C₃H₈O',
    category: 'Pharmaceutical',
    grade: 'Electronic / Pharma 99.8%',
    buyerPrice: '₹103.00/KG',
    moq: '2,000 kg',
    packaging: 'Dedicated Road Tanker / 160 kg Drums',
    origin: 'Dahej Hub',
    hazard: 'Class 3 (Flammable)',
    application: 'Pharmaceutical synthesis, extraction solvent, medical disinfectants, electronic cleaning.',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Phenol',
    cas: '108-95-2',
    formula: 'C₆H₅OH',
    category: 'Aromatics',
    grade: 'Pure / CP Grade 99.5%',
    buyerPrice: '₹107.00/KG',
    moq: '10 MT / Road Tanker',
    packaging: 'Dedicated SS316 Road Tankers / MS Drums',
    origin: 'Dahej PCPIR Hub',
    hazard: 'Class 6.1 (Toxic / Corrosive)',
    application: 'Phenolic resins, bisphenol-A, polycarbonates, pharmaceuticals & agrochemicals.',
    image: 'https://images.unsplash.com/photo-1603555501671-8f96b3fce8b4?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Acetone',
    cas: '67-64-1',
    formula: 'C₃H₆O',
    category: 'Solvents',
    grade: 'Pure Industrial Grade 99.5%',
    buyerPrice: '₹76.00/KG',
    moq: '12 MT / Road Tanker',
    packaging: 'Stainless Steel Tankers / HDPE Drums',
    origin: 'Dahej PCPIR Belt',
    hazard: 'Class 3 (Flammable Liquid)',
    application: 'Paints & coatings, methyl methacrylate (MMA), pharmaceutical synthesis, resin dilution.',
    image: 'https://images.unsplash.com/photo-1563170351-be82bc888aa4?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Caustic Soda Lye',
    cas: '1310-73-2',
    formula: 'NaOH (aq)',
    category: 'Acids & Alkalies',
    grade: 'Rayon Grade 48% - 50%',
    buyerPrice: '₹37.50/KG',
    moq: '20 MT / Road Tanker',
    packaging: 'Rubber-Lined / Epoxy-Coated Tankers',
    origin: 'Dahej & Hazira Belt',
    hazard: 'Class 8 (Corrosive Liquid)',
    application: 'Textile scouring & mercerizing, alumina refining, soap synthesis, effluent pH neutralization.',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Methanol',
    cas: '67-56-1',
    formula: 'CH₃OH',
    category: 'Solvents',
    grade: 'Pure Synthetic Grade 99.85%',
    buyerPrice: '₹29.80/KG',
    moq: '15 MT / Road Tanker',
    packaging: 'MS Road Tankers / ISO Totes',
    origin: 'Kandla & Dahej Terminals',
    hazard: 'Class 3 (Flammable Liquid)',
    application: 'Formaldehyde synthesis, acetic acid, biodiesel esterification, high-purity pharma extraction.',
    image: 'https://images.unsplash.com/photo-1518152006812-edab29b069ac?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Toluene',
    cas: '108-88-3',
    formula: 'C₇H₈',
    category: 'Aromatics',
    grade: 'Pure Industrial Grade 99.7%',
    buyerPrice: '₹84.20/KG',
    moq: '15 MT / Road Tanker',
    packaging: 'Calibrated Road Tankers',
    origin: 'Dahej Petrochem Port',
    hazard: 'Class 3 (Flammable Liquid)',
    application: 'Industrial thinners, adhesives, polyurethane foam synthesis, chemical intermediates.',
    image: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Ethyl Acetate',
    cas: '141-78-6',
    formula: 'C₄H₈O₂',
    category: 'Specialty Esters',
    grade: 'Urethane Grade 99.8%',
    buyerPrice: '₹68.50/KG',
    moq: '10 MT / Tanker or Drums',
    packaging: 'Dedicated Road Tankers / MS Barrels',
    origin: 'Ankleshwar GIDC Hub',
    hazard: 'Class 3 (Flammable Liquid)',
    application: 'Rotogravure packaging inks, flexible laminates, synthetic resins, process extraction.',
    image: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Acetic Acid Glacial',
    cas: '64-19-7',
    formula: 'CH₃COOH',
    category: 'Acids & Alkalies',
    grade: 'Technical Pure 99.8%',
    buyerPrice: '₹41.50/KG',
    moq: '5,000 kg',
    packaging: 'SS Tankers / HM-HDPE Carboys',
    origin: 'Bharuch Hub',
    hazard: 'Class 8 (Corrosive)',
    application: 'PTA synthesis, vinyl acetate monomer, textile dyeing, esterification.',
    image: 'https://images.unsplash.com/photo-1603555501671-8f96b3fce8b4?auto=format&fit=crop&w=800&q=80',
  },
];

export default function Home() {
  const { requestRfq } = useRequestRfq();
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Search Bar State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef(null);

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter chemicals dynamically based on user input
  const filteredChemicals = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) {
      return SEARCHABLE_CHEMICALS.slice(0, 4);
    }
    return SEARCHABLE_CHEMICALS.filter(
      (chem) =>
        chem.name.toLowerCase().includes(q) ||
        chem.cas.includes(q) ||
        chem.category.toLowerCase().includes(q) ||
        chem.formula.toLowerCase().includes(q) ||
        chem.grade.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/chemicals?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleOpenDetail = (product) => {
    setSelectedProduct(product);
    setDetailModalOpen(true);
    setSearchFocused(false);
  };

  const handleOpenQuoteForProduct = (chemName) => {
    setDetailModalOpen(false);
    requestRfq(chemName);
  };

  return (
    <div className="min-h-screen bg-[#f8faf9] text-[#1b2433] selection:bg-[#0b7a55] selection:text-white font-sans antialiased">
      {/* Global Corporate Header */}
      <Header />

      {/* =========================================================================
         SECTION 1: HERO SECTION
         Centered editorial structure: Top pill badge, bold headline, subtitle,
         and interactive chemical search bar with live dropdown results.
         Styled in C-Tech's sleek industrial design system.
         ========================================================================= */}
      <section className="relative overflow-hidden bg-white border-b border-[#e2e8e5] py-20 sm:py-28 lg:py-32 text-[#0f172a]">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[radial-gradient(#0b7a55_0.9px,transparent_0.9px)] [background-size:26px_26px] opacity-[0.08] pointer-events-none" />

        {/* Animated Floating Chemical Molecules & Live Background Telemetry */}
        <HeroBackgroundEffects />

        {/* Centered Hero Content */}
        <div className="relative z-20 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <HeroEntrance className="max-w-4xl mx-auto">
            {/* 1. Main Editorial Heading */}
            <HeroHeading>
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#0f172a] leading-[1.12]">
                Source chemicals{' '}
                <span className="text-[#0b7a55]">
                  with confidence
                </span>
              </h1>
            </HeroHeading>

            {/* 3. Supporting Subtitle */}
            <HeroText>
              <p className="mt-6 text-base sm:text-lg text-[#4a5666] leading-relaxed max-w-2xl mx-auto font-normal">
                Connect with verified chemical manufacturers. Search by CAS number, compare specifications, and trade with transparent pricing.
              </p>
            </HeroText>

            {/* 4. Interactive Search Bar with Live Dropdown */}
            <HeroActions>
              <div ref={searchRef} className="max-w-2xl mx-auto mt-9 text-left">
                {/* Search Bar Input Container */}
                <form
                  onSubmit={handleSearchSubmit}
                  className="relative flex items-center h-14 sm:h-16 rounded-full border-2 border-[#0b7a55]/30 bg-white pl-4 sm:pl-5 pr-2 shadow-lg shadow-[#0b7a55]/5 hover:border-[#0b7a55] focus-within:border-[#0b7a55] focus-within:ring-4 focus-within:ring-[#0b7a55]/15 transition-all"
                >
                  <Search size={22} className="text-[#0b7a55] shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setSearchFocused(true);
                    }}
                    onFocus={() => setSearchFocused(true)}
                    placeholder="Search by chemical name, CAS number (e.g. 108-95-2)..."
                    className="w-full bg-transparent border-0 !border-none outline-0 !outline-none ring-0 !ring-0 focus:ring-0 focus:outline-none focus:border-none shadow-none px-3.5 py-2 text-sm sm:text-base text-[#0f172a] placeholder:text-[#94a3b8] font-medium"
                  />

                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="p-1.5 text-[#94a3b8] hover:text-[#0f172a] mr-2 transition-colors"
                      aria-label="Clear search"
                    >
                      <X size={16} />
                    </button>
                  )}

                  <button
                    type="submit"
                    className="h-10 sm:h-11 px-6 sm:px-8 rounded-full bg-[#0b7a55] text-white text-xs sm:text-sm font-bold shadow-sm hover:bg-[#08603f] hover:shadow-md transition-all shrink-0"
                  >
                    Search
                  </button>
                </form>

                {/* Live Autocomplete Results Card (In-flow so nothing is covered) */}
                {searchFocused && (
                  <div className="mt-3.5 rounded-2xl border border-[#e2e8e5] bg-white shadow-xl overflow-hidden divide-y divide-[#edf2ef] transition-all">
                    <div className="px-4 py-2.5 bg-[#f8faf9] flex items-center justify-between text-[11px] font-semibold text-[#65717f]">
                      <span>
                        {searchQuery
                          ? `Matching chemicals for "${searchQuery}" (${filteredChemicals.length})`
                          : 'Frequently sourced chemical commodities'}
                      </span>
                      <span>Verified physical inventory</span>
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-[#edf2ef]">
                      {filteredChemicals.length > 0 ? (
                        filteredChemicals.map((chem) => (
                          <div
                            key={chem.name}
                            onClick={() => handleOpenDetail(chem)}
                            className="p-4 hover:bg-[#f8faf9] cursor-pointer transition-colors flex items-center justify-between group"
                          >
                            <div className="pr-4">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-bold text-[#0f172a] text-sm group-hover:text-[#0b7a55] transition-colors">
                                  {chem.name}
                                </span>
                                <span className="font-mono text-[11px] font-semibold text-[#0b7a55] bg-[#e4f2ec] px-2 py-0.5 rounded">
                                  CAS {chem.cas}
                                </span>
                              </div>
                              <div className="text-xs text-[#65717f] mt-1 flex items-center gap-2">
                                <span className="font-medium text-[#4a5666]">{chem.category}</span>
                                <span>•</span>
                                <span>{chem.grade}</span>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <div className="font-mono text-sm sm:text-base font-extrabold text-[#0f172a]">
                                {chem.buyerPrice}
                              </div>
                              <span className="text-[10px] text-[#65717f] block font-medium">
                                Indicative spot quote
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-6 text-center text-xs text-[#65717f]">
                          No chemicals found matching &ldquo;{searchQuery}&rdquo;.
                          <button
                            onClick={() => requestRfq()}
                            className="ml-2 font-bold text-[#0b7a55] hover:underline"
                          >
                            Request custom specification &rarr;
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="p-3 bg-[#f8faf9] flex items-center justify-between text-xs text-[#65717f] px-4">
                      <span>All quotes backed by batch COA & NABL testing</span>
                      <Link
                        to="/chemicals"
                        className="font-bold text-[#0b7a55] hover:underline flex items-center gap-1"
                      >
                        <span>Explore full catalog ({SEARCHABLE_CHEMICALS.length}+ chemicals)</span>
                        <ChevronRight size={13} />
                      </Link>
                    </div>
                  </div>
                )}

                {/* Popular Search Suggestions (Cleanly placed below the search card) */}
                <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs">
                  <span className="text-[#65717f] font-medium">Popular:</span>
                  {['Di Potassium Phosphate', 'Isopropyl Alcohol', 'Phenol', 'Acetone', 'Caustic Soda Lye', 'Methanol'].map(
                    (term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => {
                          setSearchQuery(term);
                          setSearchFocused(true);
                        }}
                        className="rounded-lg border border-[#e2e8e5] bg-white px-2.5 py-1 text-xs font-medium text-[#4a5666] hover:border-[#0b7a55] hover:text-[#0b7a55] hover:bg-[#f8faf9] transition-all"
                      >
                        {term}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Trust Indicators Bar */}
              <div className="mt-12 pt-8 border-t border-[#edf2ef] flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-[#65717f]">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-[#0b7a55] shrink-0" />
                  <span className="font-medium text-[#1b2433]">100% Verified Manufacturers</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileCheck2 size={16} className="text-[#0b7a55] shrink-0" />
                  <span className="font-medium text-[#1b2433]">Specification & COA Guaranteed</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck size={16} className="text-[#0b7a55] shrink-0" />
                  <span className="font-medium text-[#1b2433]">PESO Calibrated Dedicated Logistics</span>
                </div>
              </div>
            </HeroActions>
          </HeroEntrance>
        </div>
      </section>



      {/* =========================================================================
         SECTION 2: COMPANY INTRODUCTION
         Short intro, image/text split.
         ========================================================================= */}
      <section className="py-20 sm:py-28 bg-white border-b border-[#e2e8e5]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left: Industrial Photography */}
            <div className="lg:col-span-6 relative">
              <FadeUp>
                <div className="relative rounded-2xl overflow-hidden shadow-lg border border-[#e2e8e5] group">
                  <img
                    src="https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1200&q=80"
                    alt="ChemAxis Quality Control Laboratory & Testing Desk"
                    className="w-full h-[420px] object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              </FadeUp>
            </div>

            {/* Right: Company Introduction */}
            <div className="lg:col-span-6">
              <SectionHeading
                title="Engineered for Precision, Backed by Industrial Discipline"
                subtitle="Headquartered in Gujarat's chemical manufacturing heartland, ChemAxis bridges primary petrochemical synthesis plants with enterprise manufacturing lines."
              />

              <FadeUp delay={0.15}>
                <div className="space-y-4 text-sm text-[#4a5666] leading-relaxed">
                  <p>
                    For decades, Indian manufacturers struggled with opaque intermediary commissions, phantom lot listings, and disputed batch qualities. ChemAxis replaces speculative brokerage with an institutional sovereign trade desk: row-locked physical stocks, transparent pricing, and comprehensive lab verification before every road tanker rolls out.
                  </p>
                  <p>
                    We maintain dedicated liaison operations across Dahej PCPIR, Ankleshwar GIDC, Hazira, and Taloja, coordinating factory tank telemetry, computerised weighbridge calibration, and single-source GST invoicing.
                  </p>
                </div>
              </FadeUp>

              {/* Operating Figures */}
              <FadeUp delay={0.25}>
                <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-6 border-t border-[#edf2ef]">
                  <div className="rounded-xl bg-[#f8faf9] p-3.5 border border-[#e2e8e5]">
                    <div className="text-2xl font-black text-[#0f172a]">
                      <AnimatedCounter target={50} suffix="+" />
                    </div>
                    <div className="mt-1 text-[11px] font-semibold text-[#65717f]">Chemical Products</div>
                  </div>

                  <div className="rounded-xl bg-[#f8faf9] p-3.5 border border-[#e2e8e5]">
                    <div className="text-2xl font-black text-[#0f172a]">
                      <AnimatedCounter target={7} suffix="+" />
                    </div>
                    <div className="mt-1 text-[11px] font-semibold text-[#65717f]">Industries Served</div>
                  </div>

                  <div className="rounded-xl bg-[#f8faf9] p-3.5 border border-[#e2e8e5]">
                    <div className="text-2xl font-black text-[#0f172a]">
                      <AnimatedCounter target={25} suffix="+" />
                    </div>
                    <div className="mt-1 text-[11px] font-semibold text-[#65717f]">Supply Terminals</div>
                  </div>

                  <div className="rounded-xl bg-[#e4f2ec]/60 p-3.5 border border-[#0b7a55]/20">
                    <div className="text-2xl font-black text-[#0b7a55]">
                      <AnimatedCounter target={99.4} suffix="%" />
                    </div>
                    <div className="mt-1 text-[11px] font-semibold text-[#0b7a55]">On-Time Offloading</div>
                  </div>
                </div>
              </FadeUp>

              <FadeUp delay={0.35}>
                <div className="mt-8 flex items-center gap-4">
                  <Link
                    to="/about"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0b7a55] hover:text-[#08603f] transition-colors"
                  >
                    <span>Read about our trade desk model & governance</span>
                    <ChevronRight size={15} />
                  </Link>
                </div>
              </FadeUp>
            </div>
          </div>
        </div>
      </section>



      {/* =========================================================================
         SECTION 3: FEATURED CHEMICAL PRODUCTS
         Premium product cards, name, grade, application, image, view details button, hover animation.
         ========================================================================= */}
      <section id="featured-products" className="py-20 sm:py-28 bg-[#f8faf9]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Featured Industrial Commodities & Solvents"
            subtitle="Verified batch allocations with upload-ready COAs, standardized packaging, and direct tanker fulfillment."
            action={{
              label: 'View All 50+ Chemicals',
              onClick: () => {},
            }}
          />

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {FEATURED_PRODUCTS.map((item, idx) => (
              <ScrollReveal key={idx} delay={idx * 0.1} direction="up" className="h-full">
                <ProductCardHover className="h-full">
                  <div className="flex flex-col h-full rounded-2xl border border-[#e2e8e5] bg-white overflow-hidden shadow-xs hover:shadow-2xl hover:border-[#0b7a55]/40 transition-all group">
                    {/* Product Image with Smooth Hover Zoom */}
                    <div className="relative h-48 overflow-hidden bg-[#0f172a]">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="product-card-img w-full h-full object-cover filter brightness-95"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                      {/* Formula Pill Badge */}
                      <div className="absolute top-3 left-3">
                        <span className="rounded-lg bg-[#0b7a55] px-2.5 py-1 text-xs font-mono font-bold text-white shadow-xs">
                          {item.formula}
                        </span>
                      </div>

                      {/* Tag Badge */}
                      <div className="absolute top-3 right-3">
                        <span className="rounded-lg bg-black/60 backdrop-blur-md px-2.5 py-1 text-[10.5px] font-semibold text-white">
                          {item.tag}
                        </span>
                      </div>

                      {/* Bottom Title on Image */}
                      <div className="absolute bottom-3 left-3 right-3">
                        <h3 className="text-xl font-extrabold text-white">{item.name}</h3>
                        <div className="text-xs text-[#cbd5e1] font-medium">{item.grade}</div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs text-[#65717f]">
                          <span>CAS Registry:</span>
                          <span className="font-mono font-bold text-[#0f172a]">{item.cas}</span>
                        </div>

                        <div className="border-t border-[#edf2ef] pt-3">
                          <span className="block text-[11px] font-bold text-[#65717f] uppercase tracking-wider mb-1">
                            Primary Applications:
                          </span>
                          <p className="text-xs text-[#4a5666] leading-relaxed line-clamp-2">
                            {item.application}
                          </p>
                        </div>

                        <div className="rounded-lg bg-[#f8faf9] p-2.5 border border-[#edf2ef] text-[11.5px] space-y-1">
                          <div className="flex justify-between">
                            <span className="text-[#65717f]">Packaging:</span>
                            <span className="font-medium text-[#0f172a] truncate max-w-[170px]">{item.packaging}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#65717f]">Min Order (MOQ):</span>
                            <span className="font-mono font-bold text-[#0b7a55]">{item.moq}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-6 pt-4 border-t border-[#edf2ef] flex items-center justify-between gap-3">
                        <button
                          onClick={() => handleOpenDetail(item)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0b7a55] hover:text-[#08603f] transition-colors"
                        >
                          <span>View Details</span>
                          <ChevronRight size={14} />
                        </button>

                        <button
                          onClick={() => handleOpenQuoteForProduct(item.name)}
                          className="rounded-lg bg-[#0b7a55] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#08603f] transition-all shadow-xs"
                        >
                          Request Quote
                        </button>
                      </div>
                    </div>
                  </div>
                </ProductCardHover>
              </ScrollReveal>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/chemicals"
              className="inline-flex items-center gap-2 rounded-xl border border-[#d0ded7] bg-white px-6 py-3 text-xs font-bold text-[#0f172a] hover:border-[#0b7a55] hover:bg-[#f8faf9] transition-all"
            >
              <span>Explore Complete 50+ Commodity Catalog with CAS Search</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>



      {/* =========================================================================
         SECTION 4: INDUSTRIES WE SERVE
         Pharmaceuticals, textiles, agriculture, water treatment, paints/coatings,
         construction/manufacturing. Image-based cards with hover overlays.
         ========================================================================= */}
      <section className="py-20 sm:py-28 bg-white border-y border-[#e2e8e5]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Supplying India's Critical Industrial Sectors"
            subtitle="Tailored purity grades, batch testing, and certified transport solutions aligned to your industry's exact regulatory standards."
          />

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {INDUSTRIES.map((ind, idx) => {
              const Icon = ind.icon;
              return (
                <ScrollReveal key={idx} delay={idx * 0.1} direction="up" className="h-full">
                  <div
                    className="group relative h-80 rounded-2xl overflow-hidden border border-[#e2e8e5] shadow-xs cursor-pointer"
                  >
                    {/* Background Image */}
                    <img
                      src={ind.image}
                      alt={ind.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    {/* Dark Base Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b132b]/95 via-[#0b132b]/60 to-black/20 group-hover:from-[#0b132b]/98 group-hover:via-[#0b132b]/80 transition-all duration-300" />

                    {/* Top Industry Icon */}
                    <div className="absolute top-5 left-5">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur-md text-[#6ee7b7] border border-white/20 group-hover:bg-[#0b7a55] group-hover:text-white transition-all">
                        <Icon size={20} />
                      </div>
                    </div>

                    {/* Content Container */}
                    <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col justify-end text-white">
                      <h3 className="text-xl font-bold tracking-tight text-white group-hover:text-[#6ee7b7] transition-colors">
                        {ind.title}
                      </h3>

                      <p className="mt-2 text-xs text-[#cbd5e1] leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all">
                        {ind.desc}
                      </p>

                      <div className="mt-4 pt-3 border-t border-white/15">
                        <span className="block text-[10.5px] font-mono font-bold text-[#6ee7b7] uppercase tracking-wider">
                          Key Chemicals:
                        </span>
                        <span className="text-xs text-white/90 font-medium">
                          {ind.chemicals}
                        </span>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>



      {/* =========================================================================
         SECTION 5: WHY CHOOSE US
         Reliable sourcing, technical support, quality documentation, responsive service.
         Animated icons.
         ========================================================================= */}
      <section className="py-20 sm:py-28 bg-[#f8faf9]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Why Leading Chemical Buyers & Plants Partner With Us"
            subtitle="Built on physical asset integrity, financial transparency, and uncompromised HazMat compliance."
          />

          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
            {VALUE_PILLARS.map((col, idx) => {
              const Icon = col.icon;
              return (
                <ScrollReveal key={idx} delay={idx * 0.1} direction="up" className="h-full">
                  <HoverLift className="h-full">
                    <div className="h-full rounded-2xl border border-[#e2e8e5] bg-white p-7 shadow-xs flex flex-col justify-between group hover:border-[#0b7a55]/40 transition-all">
                      <div>
                        {/* Animated Icon Container */}
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ type: 'spring', stiffness: 300 }}
                          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e4f2ec] text-[#0b7a55] group-hover:bg-[#0b7a55] group-hover:text-white transition-colors duration-300 shadow-xs"
                        >
                          <Icon size={26} />
                        </motion.div>

                        <h3 className="mt-6 text-lg font-bold text-[#0f172a]">
                          {col.title}
                        </h3>

                        <p className="mt-3 text-xs sm:text-sm text-[#52525b] leading-relaxed">
                          {col.desc}
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-[#edf2ef] flex items-center gap-1.5 text-xs font-bold text-[#0b7a55]">
                        <CheckCircle2 size={14} />
                        <span>Institutional Standard</span>
                      </div>
                    </div>
                  </HoverLift>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>



      {/* =========================================================================
         SECTION 6: OUR PROCESS
         Source → Verify → Supply → Deliver. Horizontal animated timeline.
         ========================================================================= */}
      <section className="py-20 sm:py-28 bg-white border-t border-[#e2e8e5] relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Our End-to-End Fulfillment Timeline"
            subtitle="From primary synthesis mill reservation to plant weighbridge offloading, every step is row-locked and verified."
          />

          {/* Horizontal Animated Timeline */}
          <div className="mt-16 relative">
            {/* Connecting Horizontal Line (visible on desktop) */}
            <div className="hidden lg:block absolute top-10 left-[6%] right-[6%] h-1 bg-[#e2e8e5] z-0">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: '100%' }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: 'easeInOut' }}
                className="h-full bg-gradient-to-r from-[#0b7a55] via-[#10b981] to-[#34d399]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
              {PROCESS_STEPS.map((st, idx) => (
                <FadeUp key={idx} delay={idx * 0.15}>
                  <div className="flex flex-col h-full rounded-2xl border border-[#e2e8e5] bg-[#f8faf9] p-6 text-left relative group hover:border-[#0b7a55] hover:bg-white transition-all shadow-xs">
                    {/* Top Step Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0b7a55] text-white font-mono font-black text-sm shadow-md group-hover:scale-105 transition-transform">
                        {st.step}
                      </div>
                      <span className="rounded-full bg-[#e4f2ec] px-2.5 py-0.5 text-[10px] font-mono font-bold text-[#0b7a55]">
                        {st.badge}
                      </span>
                    </div>

                    <h3 className="text-xl font-extrabold text-[#0f172a] mb-2 flex items-center gap-2">
                      <span>{st.title}</span>
                      {idx < PROCESS_STEPS.length - 1 && (
                        <ArrowRight size={16} className="text-[#0b7a55] hidden lg:inline" />
                      )}
                    </h3>

                    <p className="text-xs sm:text-sm text-[#4a5666] leading-relaxed flex-1">
                      {st.desc}
                    </p>

                    <div className="mt-5 pt-3 border-t border-[#e2e8e5] text-[11px] font-semibold text-[#65717f]">
                      Step {idx + 1} of 4 in Trade Protocol
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
         SECTION 7: CTA SECTION
         "Looking for a Reliable Chemical Supply Partner?", Request a Quote button.
         ========================================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#0b132b] via-[#0f172a] to-[#08603f] py-20 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center z-10">
          <FadeUp>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Looking for a Reliable Chemical Supply Partner?
            </h2>

            <p className="mt-6 text-sm sm:text-base text-[#cbd5e1] max-w-2xl mx-auto leading-relaxed">
              Whether you need spot tankers for immediate industrial offloading or a scheduled monthly frame contract pegged to verified petrochemical benchmarks, our Dahej desk is ready to execute.
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => requestRfq()}
                className="rounded-xl bg-[#10b981] px-8 py-4 text-sm font-bold text-[#0b132b] shadow-xl hover:bg-[#34d399] transition-all flex items-center gap-2"
              >
                <span>Request a Quote Now</span>
                <ArrowRight size={16} />
              </button>

              <a
                href="tel:+912642240000"
                className="rounded-xl border border-white/20 bg-white/10 px-6 py-4 text-sm font-semibold text-white hover:bg-white/20 transition-all backdrop-blur-md flex items-center gap-2"
              >
                <PhoneCall size={16} className="text-[#6ee7b7]" />
                <span>Call Desk: +91 2642 240000</span>
              </a>
            </div>
          </FadeUp>
        </div>
      </section>



      {/* =========================================================================
         SECTION 8: FOOTER
         Company details, quick links, products, contact information and social links.
         ========================================================================= */}
      <Footer />

      {/* =========================================================================
         INTERACTIVE PRODUCT DETAIL MODAL (for "View Details" button)
         ========================================================================= */}
      {detailModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl border border-[#e2e8e5]">
            <button
              onClick={() => setDetailModalOpen(false)}
              className="absolute top-4 right-4 text-[#65717f] hover:text-[#0f172a]"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3">
              <span className="rounded bg-[#e4f2ec] px-2.5 py-1 text-xs font-mono font-bold text-[#0b7a55]">
                {selectedProduct.formula}
              </span>
              <span className="text-xs font-semibold text-[#65717f]">CAS: {selectedProduct.cas}</span>
            </div>

            <h3 className="mt-2 text-2xl font-bold text-[#0f172a]">{selectedProduct.name}</h3>
            <p className="text-xs font-semibold text-[#0b7a55]">{selectedProduct.grade}</p>

            <div className="mt-4 rounded-xl overflow-hidden h-36 relative">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <span className="absolute bottom-3 left-3 text-xs font-bold text-white">
                Origin: {selectedProduct.origin}
              </span>
            </div>

            <div className="mt-5 space-y-2.5 text-xs">
              <div>
                <span className="font-bold text-[#0f172a] block">Key Applications:</span>
                <p className="text-[#4a5666] mt-0.5">{selectedProduct.application}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="rounded-lg bg-[#f8faf9] p-2.5 border border-[#edf2ef]">
                  <span className="text-[11px] text-[#65717f] block">Packaging Standard</span>
                  <span className="font-bold text-[#0f172a]">{selectedProduct.packaging}</span>
                </div>
                <div className="rounded-lg bg-[#f8faf9] p-2.5 border border-[#edf2ef]">
                  <span className="text-[11px] text-[#65717f] block">Minimum Order (MOQ)</span>
                  <span className="font-bold text-[#0b7a55] font-mono">{selectedProduct.moq}</span>
                </div>
              </div>

              <div className="rounded-lg bg-amber-50 p-2.5 border border-amber-200 text-amber-800 text-[11.5px]">
                <strong>Hazard Class:</strong> {selectedProduct.hazard} — Dispatched under PESO transport compliance.
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#edf2ef] flex justify-end gap-3">
              <button
                onClick={() => setDetailModalOpen(false)}
                className="rounded-lg border border-[#d0ded7] px-4 py-2 text-xs font-semibold text-[#4a5666] hover:bg-[#f8faf9]"
              >
                Close
              </button>
              <button
                onClick={() => handleOpenQuoteForProduct(selectedProduct.name)}
                className="rounded-lg bg-[#0b7a55] px-5 py-2 text-xs font-bold text-white hover:bg-[#08603f]"
              >
                Request Quotation for {selectedProduct.name}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Detail Modal ends above */}
    </div>
  );
}
