import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Layers,
  FileText,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  FileCheck2,
  ArrowRight,
  TrendingDown,
  MapPin,
  Check,
  ChevronRight,
  X,
  BadgeCheck,
} from 'lucide-react';
import Header from '../../components/public/Header.jsx';
import Footer from '../../components/public/Footer.jsx';
import SectionHeading from '../../components/public/SectionHeading.jsx';
import { useRequestRfq } from '../../lib/useRfqAuth.js';
import {
  FadeUp,
  HoverLift,
  HeroEntrance,
  HeroHeading,
  HeroText,
  HeroActions,
  HeroVisual,
  ScrollReveal,
} from '../../components/public/AnimationWrappers.jsx';

// ---------------------------------------------------------------------------
// DATA DEFINITIONS FOR BUYER PAGE
// ---------------------------------------------------------------------------

const TARGET_BUYERS = [
  'Procurement Managers',
  'Sourcing Heads',
  'Purchase Executives',
  'Plant Heads',
  'Corporate Buyers',
];

const DISCOVERY_CARDS = [
  {
    id: 'name-cas',
    title: 'Search by name or CAS',
    desc: 'Start with the material you need and check grade, purity, packaging and available documents.',
    btnText: 'Search Chemicals',
    link: '/chemicals',
    icon: Search,
    pill: 'Direct Material Search',
  },
  {
    id: 'use-case',
    title: 'Browse by use case',
    desc: 'Explore product categories when the process matters more than the exact chemical name.',
    btnText: 'Explore Categories',
    link: '/chemicals',
    icon: Layers,
    pill: 'Application First',
  },
  {
    id: 'post-rfq',
    title: 'Post a clear requirement',
    desc: 'Share the specification, quantity and delivery location so relevant suppliers can respond properly.',
    btnText: 'Start a Requirement',
    action: 'rfq',
    icon: FileText,
    pill: 'Custom Sourcing',
  },
];

const PROBLEMS_AND_SOLUTIONS = [
  {
    problem: 'Requirements scattered across WhatsApp, unorganized email threads, and casual phone calls.',
    solution: 'One structured RFQ format with precise CAS, purity grade, and packaging specs broadcast simultaneously.',
  },
  {
    problem: 'Quotes arrive in a dozen different formats with hidden transportation charges and shifting delivery terms.',
    solution: 'Standardized side-by-side quotations detailing ex-works vs door-delivery landed prices and MOQ terms.',
  },
  {
    problem: 'No clear way to verify whether an unknown trading entity holds actual physical allocation or valid licenses.',
    solution: '100% verified primary manufacturers and direct port importers with validated GSTIN and PCB consents.',
  },
  {
    problem: 'Certificates of Analysis (COA) and Technical Data Sheets (TDS) lost in email threads or received after dispatch.',
    solution: 'Every batch document, test parameter, and MSDS attached directly to the lot record prior to commitment.',
  },
];

const RFQ_RECORDS = [
  {
    chemical: 'Acetic Acid',
    spec: '99.8% Glacial · 5 MT',
    packaging: 'Dedicated Road Tanker',
    suppliersCount: 4,
    status: 'Quotes In',
    statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    date: 'Today, 10:24 AM',
  },
  {
    chemical: 'Caustic Soda Flakes',
    spec: 'Technical Grade 99% · 10 MT',
    packaging: '50 kg HDPE Bags',
    suppliersCount: 3,
    status: 'Comparing',
    statusColor: 'bg-amber-50 text-amber-700 border-amber-200',
    date: 'Yesterday',
  },
  {
    chemical: 'Toluene',
    spec: 'Pure Grade · 8 MT',
    packaging: 'ISO Road Tanker',
    suppliersCount: 2,
    status: 'Awaiting',
    statusColor: 'bg-blue-50 text-blue-700 border-blue-200',
    date: '21 Nov 2026',
  },
  {
    chemical: 'Sulphuric Acid',
    spec: 'Commercial 98% · 20 MT',
    packaging: 'Rubber-Lined Tanker',
    suppliersCount: 5,
    status: 'Ordered',
    statusColor: 'bg-teal-50 text-teal-800 border-teal-200',
    date: '19 Nov 2026',
  },
];

const COMPARISON_SUPPLIERS = [
  {
    id: 'supp-a',
    name: 'SUPPLIER A',
    region: 'Dahej Corridor, Gujarat',
    price: '₹142',
    unit: '/kg',
    leadTime: '7 days',
    purity: '99.2%',
    moq: '500 kg',
    delivery: 'Ex-works',
    certifications: 'ISO 9001',
    status: 'Shortlisted',
    isRecommended: false,
  },
  {
    id: 'supp-b',
    name: 'SUPPLIER B',
    region: 'Taloja Belt, Maharashtra',
    price: '₹128',
    unit: '/kg',
    leadTime: '5 days',
    purity: '99.6%',
    moq: '250 kg',
    delivery: 'Door delivery',
    certifications: 'ISO · REACH',
    status: 'Recommended Pick',
    isRecommended: true,
  },
  {
    id: 'supp-c',
    name: 'SUPPLIER C',
    region: 'Ranipet Hub, Tamil Nadu',
    price: '₹136',
    unit: '/kg',
    leadTime: '9 days',
    purity: '99.4%',
    moq: '1,000 kg',
    delivery: 'Ex-works',
    certifications: 'ISO 9001',
    status: 'Shortlisted',
    isRecommended: false,
  },
];

const TIMELINE_STEPS = [
  {
    number: '01',
    step: 'Requirement',
    title: 'Define Material Specs',
    desc: 'Specify CAS number, purity threshold, packaging type, and target delivery pin code.',
  },
  {
    number: '02',
    step: 'RFQ',
    title: 'Broadcast Requirement',
    desc: 'Your request is routed directly to qualified, GST-verified chemical producers and importers.',
  },
  {
    number: '03',
    step: 'Responses',
    title: 'Receive Structured Quotes',
    desc: 'Suppliers submit standardized commercial terms, lot availability, and valid COAs.',
  },
  {
    number: '04',
    step: 'Comparison',
    title: 'Line Up Offers',
    desc: 'Compare landed price, transit lead time, MOQ, and technical test parameters side by side.',
  },
  {
    number: '05',
    step: 'Order',
    title: 'Authorize & Release PO',
    desc: 'Lock inventory directly with single-source GST invoicing, e-way bill generation, and GPS dispatch.',
  },
];

const VERIFICATION_PILLARS = [
  {
    title: 'GST Verification',
    desc: 'Every vendor is validated in real-time against the national GSTIN registry to ensure active tax compliance.',
  },
  {
    title: 'Company Verification',
    desc: 'Registered corporate identity, manufacturing address, and factory licenses verified by our compliance desk.',
  },
  {
    title: 'Documentation',
    desc: 'NABL laboratory reports, batch COAs, and valid Pollution Control Board consents archived on file.',
  },
  {
    title: 'Transparent Profiles',
    desc: 'Declared chemical capacities, production grades, and logistics packaging formats available in the open.',
  },
];

const TECHNICAL_DOCS = [
  {
    code: 'COA',
    name: 'Certificate of Analysis',
    desc: 'Batch-specific chemical test parameters, actual purity percentage, density, and moisture analysis.',
    available: true,
  },
  {
    code: 'TDS',
    name: 'Technical Data Sheet',
    desc: 'Physical, chemical, and thermal properties of the grade including solubility and flash point.',
    available: true,
  },
  {
    code: 'SDS',
    name: 'Safety Data Sheet',
    desc: 'Standardized 16-section GHS documentation detailing hazard classes, PPE, and spill handling.',
    available: true,
  },
  {
    code: 'SPEC',
    name: 'Product Specifications',
    desc: 'Standard manufacturer sales specifications and acceptable parameter tolerance ranges.',
    available: true,
  },
  {
    code: 'CERT',
    name: 'Factory Certifications',
    desc: 'ISO 9001:2015, REACH compliance declarations, and statutory regulatory filings.',
    available: true,
  },
  {
    code: 'DOCS',
    name: 'Transport & E-Way Slips',
    desc: 'Driver TREM card, PESO calibration records, and digital weighbridge tare-weight slips.',
    available: true,
  },
];

const BUYER_CHECKLIST = [
  {
    title: 'Material Fit',
    desc: 'Check grade, purity and technical parameters against your formulation process.',
  },
  {
    title: 'Supplier Identity',
    desc: 'Review company legal standing and live GST verification before initiating commercial terms.',
  },
  {
    title: 'Technical Proof',
    desc: 'Insist on signed batch COA, TDS, and safety sheets tied directly to the production lot.',
  },
  {
    title: 'Commercial Fit',
    desc: 'Compare price, MOQ, transit lead time, and freight terms (Ex-Works vs Door Delivery).',
  },
  {
    title: 'Supply Context',
    desc: 'Provide exact delivery location and offloading hose coupling standards for tanker arrival.',
  },
];

const INDUSTRIAL_REGIONS = [
  {
    name: 'Gujarat Corridor',
    hubs: 'Dahej PCPIR, Ankleshwar GIDC, Hazira, Vapi',
    focus: 'Petrochemicals, Caustic Soda Lye, Solvents, Fine Intermediates',
    activeNodes: 180,
  },
  {
    name: 'Maharashtra Industrial Belt',
    hubs: 'Taloja MIDC, Tarapur, Roha, Pimpri',
    focus: 'Aromatics, Ketones, Plasticizers, Specialty Reagents',
    activeNodes: 120,
  },
  {
    name: 'Delhi NCR & Northern Zone',
    hubs: 'Panipat, Baddi, Faridabad, Ghaziabad',
    focus: 'Textile auxiliaries, Agrochemical formulations, Inks',
    activeNodes: 85,
  },
  {
    name: 'Tamil Nadu & Southern Hub',
    hubs: 'Ranipet, Manali (Chennai), Cuddalore, Hosur',
    focus: 'Leather chemicals, pharma grade solvents, polymers',
    activeNodes: 95,
  },
  {
    name: 'Andhra Pradesh & Telangana',
    hubs: 'Hyderabad Pharma City, Visakhapatnam PCPIR',
    focus: 'API bulk intermediates, HPLC reagents, high-purity alcohols',
    activeNodes: 110,
  },
  {
    name: 'West Bengal & Eastern Ports',
    hubs: 'Haldia Port Terminal, Durgapur, Kolkata',
    focus: 'Bulk petrochemical imports, base chemicals, plastic resins',
    activeNodes: 65,
  },
];

const BUYER_FEATURES = [
  {
    title: 'Search by Chemical or CAS',
    desc: 'Locate certified stock lots instantly using systematic chemical nomenclature or IUPAC CAS registry numbers.',
    icon: Search,
  },
  {
    title: 'Structured Requirements',
    desc: 'Issue comprehensive RFQs with locked tolerance limits, destination pin codes, and packaging preferences.',
    icon: FileText,
  },
  {
    title: 'Quote Comparison Desk',
    desc: 'Evaluate side-by-side offers comparing landed costs, demurrage policies, and dispatch lead times.',
    icon: TrendingDown,
  },
  {
    title: 'Supplier Verification',
    desc: 'Trade only with GST-validated primary manufacturers and bonded port terminal importers.',
    icon: ShieldCheck,
  },
  {
    title: 'Technical Documents Archive',
    desc: 'Download authentic batch COAs, 16-section MSDS sheets, and dispatch weighbridge receipts in one click.',
    icon: FileCheck2,
  },
];

export default function ForBuyer() {
  const { requestRfq } = useRequestRfq();
  const [selectedSupplier, setSelectedSupplier] = useState('supp-b');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);
  const [activeDocModal, setActiveDocModal] = useState(null);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) return;
    setNewsletterSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#f8faf9] text-[#1b2433] selection:bg-[#0b7a55] selection:text-white font-sans antialiased">
      {/* Navigation Header */}
      <Header />

      {/* =========================================================================
         SECTION 1: HERO SECTION — CHEMICAL SOURCING MADE CLEARER
         ========================================================================= */}
      <section className="relative bg-white border-b border-[#e2e8e5] py-16 lg:py-20 text-[#1b2433]">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <HeroEntrance className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
            {/* Left Column: Heading & Value Proposition */}
            <div className="lg:col-span-7">
              <HeroHeading>
                <span className="text-xs font-bold uppercase tracking-widest text-[#0b7a55] block mb-3 font-mono">
                  Chemical sourcing, made clearer.
                </span>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#0f172a] leading-[1.12]">
                  Find the right chemical.{' '}
                  <span className="text-[#0b7a55]">
                    Source with confidence.
                  </span>
                </h1>
              </HeroHeading>

              <HeroText>
                <p className="mt-6 text-base sm:text-lg text-[#4a5666] leading-relaxed max-w-2xl font-normal">
                  See the specification, technical proof and supplier context before you enquire. Then send one clear requirement and compare the offers that come back.
                </p>

                {/* Made For Industrial Roles */}
                <div className="mt-8 pt-6 border-t border-[#edf2ef]">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#65717f] block mb-2.5">
                    Engineered For Industrial Decision Makers:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {TARGET_BUYERS.map((role) => (
                      <span
                        key={role}
                        className="rounded-lg bg-[#f8faf9] px-3 py-1 text-xs font-semibold text-[#1b2433] border border-[#e2e8e5]"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              </HeroText>

              {/* CTAs & Trust Indicators */}
              <HeroActions>
                <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  <Link
                    to="/chemicals"
                    className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#0b7a55] px-7 py-3.5 text-sm font-bold text-white shadow-md shadow-[#0b7a55]/20 hover:bg-[#08603f] transition-all"
                  >
                    <span>Find a Chemical</span>
                    <ArrowRight size={16} />
                  </Link>

                  <button
                    onClick={() => requestRfq()}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#d0ded7] bg-white px-7 py-3.5 text-sm font-bold text-[#0f172a] hover:bg-[#f8faf9] hover:border-[#0b7a55] transition-all"
                  >
                    <span>Post a Requirement</span>
                  </button>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-6 text-xs text-[#65717f]">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 size={15} className="text-[#0b7a55]" />
                    Supplier context before contact
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 size={15} className="text-[#0b7a55]" />
                    Buy by verified specification
                  </span>
                </div>
              </HeroActions>
            </div>

            {/* Right Column: Interactive Chemical Product Preview Card */}
            <HeroVisual className="lg:col-span-5 relative">
              <div className="relative rounded-2xl border border-[#e2e8e5] bg-white p-6 sm:p-7 shadow-xl">
                {/* Top Product Header */}
                <div className="flex items-start justify-between pb-4 border-b border-[#edf2ef]">
                  <div>
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#0b7a55] block">
                      Verified Product Record
                    </span>
                    <h3 className="text-2xl font-extrabold text-[#0f172a] mt-0.5">Acetone</h3>
                    <span className="font-mono text-xs text-[#65717f]">CAS: 67-64-1</span>
                  </div>
                  <span className="rounded-md bg-[#e4f2ec] px-2.5 py-1 text-xs font-mono font-bold text-[#0b7a55] border border-[#0b7a55]/20">
                    Pharma Grade
                  </span>
                </div>

                {/* Specification Details Grid */}
                <div className="mt-5 space-y-3 text-xs">
                  <div className="flex items-center justify-between py-1.5 border-b border-[#edf2ef]">
                    <span className="text-[#65717f]">Purity Specification:</span>
                    <span className="font-bold text-[#0f172a] font-mono">≥ 99.5% by GC</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-[#edf2ef]">
                    <span className="text-[#65717f]">Packaging Standard:</span>
                    <span className="font-medium text-[#0f172a]">160 kg HM-HDPE Drum / ISO Tanker</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-[#edf2ef]">
                    <span className="text-[#65717f]">Primary Dispatch Terminal:</span>
                    <span className="font-medium text-[#0f172a]">Ahmedabad / Dahej Corridor</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-[#edf2ef]">
                    <span className="text-[#65717f]">Attached Technical Proof:</span>
                    <span className="font-mono font-bold text-[#0b7a55]">COA · SDS · TDS On File</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-[#65717f]">Supplier Compliance:</span>
                    <span className="inline-flex items-center gap-1 font-bold text-[#0b7a55]">
                      <ShieldCheck size={14} />
                      <span>GST Verified Primary Producer</span>
                    </span>
                  </div>
                </div>

                {/* Floating Document Snippet Badges */}
                <div className="mt-6 pt-4 border-t border-[#edf2ef] flex items-center justify-between gap-3">
                  <button
                    onClick={() => requestRfq('Acetone')}
                    className="w-full rounded-xl bg-[#0b7a55] py-3 text-xs font-bold text-white shadow-md shadow-[#0b7a55]/20 hover:bg-[#08603f] transition-all text-center"
                  >
                    Enquire for This Specification
                  </button>
                </div>
              </div>
            </HeroVisual>
          </HeroEntrance>
        </div>
      </section>

      {/* =========================================================================
         SECTION 2: CHEMICAL DISCOVERY SECTION ("Start where you are.")
         ========================================================================= */}
      <section className="py-20 sm:py-28 bg-white border-b border-[#e2e8e5]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Start where you are."
            subtitle="You do not need to fit your buying process into a generic marketplace flow. Select how your team prefers to source."
          />

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            {DISCOVERY_CARDS.map((card, idx) => {
              const Icon = card.icon;
              return (
                <ScrollReveal key={card.id} delay={idx * 0.12} direction="up" className="h-full">
                  <HoverLift className="h-full">
                    <div className="flex flex-col justify-between h-full rounded-2xl border border-[#e2e8e5] bg-[#f8faf9] p-8 hover:bg-white hover:border-[#0b7a55]/40 transition-all shadow-xs group">
                      <div>
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e4f2ec] text-[#0b7a55] group-hover:bg-[#0b7a55] group-hover:text-white transition-colors duration-300">
                            <Icon size={24} />
                          </div>
                          <span className="text-[11px] font-mono font-bold text-[#65717f] bg-white px-2.5 py-1 rounded-md border border-[#e2e8e5]">
                            {card.pill}
                          </span>
                        </div>

                        <h3 className="text-xl font-bold text-[#0f172a] mb-3">
                          {card.title}
                        </h3>

                        <p className="text-sm text-[#4a5666] leading-relaxed">
                          {card.desc}
                        </p>
                      </div>

                      <div className="mt-8 pt-6 border-t border-[#edf2ef]">
                        {card.action === 'rfq' ? (
                          <button
                            onClick={() => requestRfq()}
                            className="w-full inline-flex items-center justify-between rounded-xl bg-[#0b7a55] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#08603f] transition-all"
                          >
                            <span>{card.btnText}</span>
                            <ArrowRight size={15} />
                          </button>
                        ) : (
                          <Link
                            to={card.link}
                            className="w-full inline-flex items-center justify-between rounded-xl border border-[#d0ded7] bg-white px-4 py-2.5 text-xs font-bold text-[#0f172a] hover:border-[#0b7a55] hover:text-[#0b7a55] transition-all"
                          >
                            <span>{card.btnText}</span>
                            <ArrowRight size={15} />
                          </Link>
                        )}
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
         SECTION 3: BUYING PROBLEMS AND SOLUTIONS ("Buy with less uncertainty.")
         ========================================================================= */}
      <section className="py-20 sm:py-28 bg-[#f8faf9] border-b border-[#e2e8e5]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Buy with less uncertainty."
            subtitle="Buying the wrong grade, missing a document or finding out too late that a supplier cannot deliver is expensive. Start with the facts that decide whether a material fits."
          />

          <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* Left: The Blind Chase (Before) */}
            <ScrollReveal direction="up" delay={0.1} className="h-full">
              <div className="h-full rounded-2xl border border-red-200/80 bg-red-50/40 p-8 sm:p-10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-100 text-red-600 font-bold text-xs">
                      ✕
                    </span>
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-red-700">
                      Traditional Procurement Friction
                    </span>
                  </div>

                  <h3 className="text-2xl font-black text-[#0f172a] mb-6">
                    The blind chase
                  </h3>

                  <div className="space-y-5">
                    {PROBLEMS_AND_SOLUTIONS.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3.5">
                        <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-[#4a5666] leading-relaxed">
                          {item.problem}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-red-200 text-xs font-semibold text-red-700">
                  Result: High procurement risk, delayed batches, and invoice reconciliation headaches.
                </div>
              </div>
            </ScrollReveal>

            {/* Right: The Solution (The buyer-first way) */}
            <ScrollReveal direction="up" delay={0.2} className="h-full">
              <div className="h-full rounded-2xl border border-[#0b7a55]/30 bg-white p-8 sm:p-10 flex flex-col justify-between shadow-xs">
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e4f2ec] text-[#0b7a55] font-bold text-xs">
                      ✓
                    </span>
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#0b7a55]">
                      C-Tech Sovereign Standard
                    </span>
                  </div>

                  <h3 className="text-2xl font-black text-[#0f172a] mb-6">
                    The buyer-first way
                  </h3>

                  <div className="space-y-5">
                    {PROBLEMS_AND_SOLUTIONS.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3.5">
                        <CheckCircle2 size={18} className="text-[#0b7a55] shrink-0 mt-0.5" />
                        <p className="text-sm font-medium text-[#0f172a] leading-relaxed">
                          {item.solution}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-[#e2e8e5] text-xs font-bold text-[#0b7a55]">
                  Result: Guaranteed specification match, binding quotes, and zero counterparty surprises.
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* =========================================================================
         SECTION 4: BUYER DASHBOARD PREVIEW ("Once your requirement is live.")
         ========================================================================= */}
      <section className="py-20 sm:py-28 bg-white border-b border-[#e2e8e5]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Feature Highlights */}
            <div className="lg:col-span-5">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#0b7a55] block mb-2">
                Once your requirement is live
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0f172a] leading-tight">
                Keep every response. See every next step.
              </h2>
              <p className="mt-4 text-sm sm:text-base text-[#4a5666] leading-relaxed">
                After you send a requirement, every supplier response and status update stays in one place—so the decision is clear when it is time to buy.
              </p>

              <div className="mt-8 space-y-4">
                <div className="rounded-xl border border-[#e2e8e5] bg-[#f8faf9] p-4">
                  <h4 className="text-sm font-bold text-[#0f172a]">1. All RFQs in one place</h4>
                  <p className="text-xs text-[#52525b] mt-1">
                    Consolidate company-wide chemical requisitions without searching fragmented spreadsheets.
                  </p>
                </div>
                <div className="rounded-xl border border-[#e2e8e5] bg-[#f8faf9] p-4">
                  <h4 className="text-sm font-bold text-[#0f172a]">2. Track quotations side by side</h4>
                  <p className="text-xs text-[#52525b] mt-1">
                    Examine pricing breakdowns, packaging tariffs, and transit terms in real-time.
                  </p>
                </div>
                <div className="rounded-xl border border-[#e2e8e5] bg-[#f8faf9] p-4">
                  <h4 className="text-sm font-bold text-[#0f172a]">3. Live supplier responses</h4>
                  <p className="text-xs text-[#52525b] mt-1">
                    Suppliers upload certified batch analysis reports before you authorize the PO.
                  </p>
                </div>
                <div className="rounded-xl border border-[#e2e8e5] bg-[#f8faf9] p-4">
                  <h4 className="text-sm font-bold text-[#0f172a]">4. Status & transit tracking</h4>
                  <p className="text-xs text-[#52525b] mt-1">
                    Monitor weighbridge tare weights, e-way bills, and tanker offloading ETA.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Realistic Buyer Dashboard Preview */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl border border-[#e2e8e5] bg-[#f8faf9] text-[#0f172a] p-5 sm:p-7 shadow-md">
                {/* Simulated Portal Topbar */}
                <div className="flex items-center justify-between pb-4 border-b border-[#e2e8e5]">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-red-400" />
                    <span className="h-3 w-3 rounded-full bg-amber-400" />
                    <span className="h-3 w-3 rounded-full bg-emerald-500" />
                    <span className="ml-3 font-mono text-xs font-bold text-[#0f172a]">
                      C-Tech Procurement Suite — My RFQs Desk
                    </span>
                  </div>
                  <span className="rounded bg-[#0b7a55] px-2 py-0.5 text-[10px] font-mono font-bold text-white">
                    LIVE PREVIEW
                  </span>
                </div>

                {/* Simulated RFQ Items Table */}
                <div className="mt-5 space-y-3">
                  {RFQ_RECORDS.map((rfq, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-[#e2e8e5] bg-white p-4 hover:border-[#0b7a55]/40 transition-colors shadow-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-base text-[#0f172a]">{rfq.chemical}</span>
                            <span className="text-[11px] font-mono text-[#65717f]">({rfq.packaging})</span>
                          </div>
                          <div className="text-xs text-[#52525b] mt-0.5">{rfq.spec}</div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono text-[#65717f]">
                            {rfq.suppliersCount} Verified Quotes
                          </span>
                          <span
                            className={`rounded-md px-2.5 py-0.5 text-xs font-bold border ${rfq.statusColor}`}
                          >
                            {rfq.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 pt-3 border-t border-[#e2e8e5] flex justify-between items-center text-[11px] text-[#65717f]">
                  <span>Visual dashboard preview demonstrating real-time quotation aggregation.</span>
                  <button
                    onClick={() => requestRfq()}
                    className="font-bold text-[#0b7a55] hover:underline"
                  >
                    Open New RFQ +
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
         SECTION 5: QUOTATION COMPARISON ("Decisions, simplified.")
         ========================================================================= */}
      <section className="py-20 sm:py-28 bg-[#f8faf9] border-b border-[#e2e8e5]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Decisions, simplified."
            subtitle="Line up every supplier on the metrics that decide the order — price, lead time, purity, MOQ, delivery and certifications. The best value rises to the top."
          />

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {COMPARISON_SUPPLIERS.map((s, idx) => {
              const isSelected = selectedSupplier === s.id;
              return (
                <ScrollReveal key={s.id} delay={idx * 0.1} direction="up" className="h-full">
                  <div
                    onClick={() => setSelectedSupplier(s.id)}
                    className={`cursor-pointer rounded-2xl p-6 transition-all border flex flex-col justify-between h-full ${
                      isSelected
                        ? 'border-[#0b7a55] bg-white shadow-xl ring-2 ring-[#0b7a55]/20'
                        : 'border-[#e2e8e5] bg-white hover:border-[#0b7a55]/40 shadow-xs'
                    }`}
                  >
                    <div>
                      {/* Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-[#edf2ef]">
                        <div>
                          <h4 className="font-extrabold text-[#0f172a] text-lg">{s.name}</h4>
                          <div className="flex items-center gap-1 text-xs text-[#65717f] mt-0.5">
                            <MapPin size={12} className="text-[#0b7a55]" />
                            <span>{s.region}</span>
                          </div>
                        </div>

                        {s.isRecommended ? (
                          <span className="rounded-full bg-[#e4f2ec] px-3 py-1 text-xs font-mono font-bold text-[#0b7a55] border border-[#0b7a55]/30">
                            Recommended Pick
                          </span>
                        ) : (
                          <span className="rounded-full bg-[#f1f5f3] px-2.5 py-0.5 text-xs font-semibold text-[#65717f]">
                            {s.status}
                          </span>
                        )}
                      </div>

                      {/* Price Metric */}
                      <div className="py-5 text-center bg-[#f8faf9] rounded-xl my-4 border border-[#edf2ef]">
                        <div className="text-3xl font-black text-[#0b7a55]">
                          {s.price}
                          <span className="text-sm font-semibold text-[#65717f]">{s.unit}</span>
                        </div>
                        <div className="text-[11px] font-mono text-[#65717f] mt-1">Landed Commercial Quote</div>
                      </div>

                      {/* Metric Rows */}
                      <div className="space-y-2.5 text-xs">
                        <div className="flex justify-between py-1 border-b border-[#edf2ef]">
                          <span className="text-[#65717f]">Transit Lead Time:</span>
                          <span className="font-bold text-[#0f172a]">{s.leadTime}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-[#edf2ef]">
                          <span className="text-[#65717f]">Purity Tested:</span>
                          <span className="font-mono font-bold text-[#0f172a]">{s.purity}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-[#edf2ef]">
                          <span className="text-[#65717f]">Minimum Order (MOQ):</span>
                          <span className="font-semibold text-[#0f172a]">{s.moq}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-[#edf2ef]">
                          <span className="text-[#65717f]">Delivery Terms:</span>
                          <span className="font-medium text-[#0f172a]">{s.delivery}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-[#65717f]">Certifications:</span>
                          <span className="font-mono font-bold text-[#0b7a55]">{s.certifications}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-[#edf2ef]">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          requestRfq();
                        }}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
                          s.isRecommended
                            ? 'bg-[#0b7a55] text-white hover:bg-[#08603f] shadow-xs'
                            : 'border border-[#d0ded7] text-[#0f172a] hover:bg-[#f8faf9]'
                        }`}
                      >
                        {s.isRecommended ? 'Select Best Value Offer' : 'Shortlist Supplier'}
                      </button>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>

          <p className="mt-8 text-center text-xs text-[#65717f]">
            * Illustrative comparison — sample data shown to demonstrate the quotation evaluation experience.
          </p>
        </div>
      </section>

      {/* =========================================================================
         SECTION 6: BUYING PROCESS TIMELINE ("From requirement to right supplier.")
         ========================================================================= */}
      <section className="py-20 sm:py-28 bg-white border-b border-[#e2e8e5]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="From requirement to right supplier."
            subtitle="Move from a production need to a purchasing decision without losing the specification, documents or commercial context along the way."
          />

          <div className="mt-14 relative">
            {/* Desktop Connecting Line */}
            <div className="hidden lg:block absolute top-9 left-[8%] right-[8%] h-0.5 bg-[#e2e8e5] z-0" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 relative z-10">
              {TIMELINE_STEPS.map((st, idx) => (
                <ScrollReveal key={idx} delay={idx * 0.1} direction="up" className="h-full">
                  <div
                    className="h-full rounded-2xl border border-[#e2e8e5] bg-[#f8faf9] p-6 flex flex-col justify-between hover:bg-white hover:border-[#0b7a55] transition-all shadow-xs"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0b7a55] text-white font-mono font-bold text-sm shadow-xs">
                          {st.number}
                        </span>
                        <span className="font-mono text-xs font-bold text-[#0b7a55] uppercase">
                          {st.step}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-[#0f172a] mb-2">{st.title}</h4>
                      <p className="text-xs text-[#52525b] leading-relaxed">{st.desc}</p>
                    </div>

                    <div className="mt-6 pt-3 border-t border-[#edf2ef] text-[11px] font-semibold text-[#65717f]">
                      Stage {idx + 1} of 5
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
         SECTION 7: SUPPLIER VERIFICATION ("Know who you are buying from.")
         ========================================================================= */}
      <section className="py-20 sm:py-28 bg-[#f8faf9] border-b border-[#e2e8e5]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Know who you are buying from."
            subtitle="Supplier proof before the first call. Check company identity and technical readiness before you spend time on a conversation."
          />

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VERIFICATION_PILLARS.map((p, idx) => (
              <ScrollReveal key={idx} delay={idx * 0.1} direction="up" className="h-full">
                <div
                  className="rounded-2xl border border-[#e2e8e5] bg-white p-6 shadow-xs flex flex-col justify-between h-full"
                >
                  <div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e4f2ec] text-[#0b7a55] mb-5">
                      <BadgeCheck size={24} />
                    </div>
                    <h4 className="text-base font-bold text-[#0f172a] mb-2">{p.title}</h4>
                    <p className="text-xs text-[#52525b] leading-relaxed">{p.desc}</p>
                  </div>
                  <div className="mt-6 pt-3 border-t border-[#edf2ef] text-[11px] font-bold text-[#0b7a55]">
                    Validated Standard
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Verification Box Preview */}
          <div className="mt-10 rounded-2xl border border-[#e2e8e5] bg-white p-6 sm:p-8 shadow-xs max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#edf2ef]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0b7a55] text-white font-bold">
                  ✓
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-[#0f172a]">Gujarat Alkalies & Chemicals Ltd (Partner Allocation)</h4>
                    <span className="rounded bg-[#e4f2ec] px-2 py-0.5 text-[10px] font-mono font-bold text-[#0b7a55]">
                      VERIFIED PRODUCER
                    </span>
                  </div>
                  <div className="text-xs text-[#65717f]">GSTIN: 24AAACG1234F1Z8 · Plant: Dahej PCPIR Complex</div>
                </div>
              </div>

              <span className="text-xs font-mono font-semibold text-[#0b7a55]">
                Consent to Operate: Active & Valid
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="rounded-lg bg-[#f8faf9] p-3 border border-[#edf2ef]">
                <span className="text-[#65717f] block text-[11px]">Primary Capacity</span>
                <span className="font-bold text-[#0f172a]">450 MT / Month</span>
              </div>
              <div className="rounded-lg bg-[#f8faf9] p-3 border border-[#edf2ef]">
                <span className="text-[#65717f] block text-[11px]">ISO Certification</span>
                <span className="font-bold text-[#0f172a]">ISO 9001:2015</span>
              </div>
              <div className="rounded-lg bg-[#f8faf9] p-3 border border-[#edf2ef]">
                <span className="text-[#65717f] block text-[11px]">Document Audit</span>
                <span className="font-bold text-[#0b7a55]">6 of 6 Verified</span>
              </div>
              <div className="rounded-lg bg-[#f8faf9] p-3 border border-[#edf2ef]">
                <span className="text-[#65717f] block text-[11px]">Dispatch Fleet</span>
                <span className="font-bold text-[#0f172a]">PESO Calibrated</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
         SECTION 8: TECHNICAL DOCUMENTATION ("Documents that matter.")
         ========================================================================= */}
      <section className="py-20 sm:py-28 bg-white border-b border-[#e2e8e5]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Documents that matter."
            subtitle="The technical paper trail your team actually needs — organised per product, ready when you are."
          />

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {TECHNICAL_DOCS.map((doc, idx) => (
              <ScrollReveal key={idx} delay={idx * 0.08} direction="up" className="h-full">
                <div
                  className="rounded-2xl border border-[#e2e8e5] bg-[#f8faf9] p-6 hover:bg-white hover:border-[#0b7a55] transition-all shadow-xs flex flex-col justify-between h-full"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="rounded-lg bg-[#0b7a55] text-white px-3 py-1 font-mono font-bold text-xs">
                        {doc.code}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0b7a55]">
                        <Check size={13} />
                        Available on Lot
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-[#0f172a] mb-2">{doc.name}</h4>
                    <p className="text-xs text-[#52525b] leading-relaxed">{doc.desc}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#edf2ef]">
                    <button
                      onClick={() => setActiveDocModal(doc)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0b7a55] hover:underline"
                    >
                      <span>View Sample {doc.code} Schema</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
         SECTION 9: BUYER CHECKLIST ("The buyer's checklist.")
         ========================================================================= */}
      <section className="py-20 sm:py-28 bg-[#f8faf9] border-b border-[#e2e8e5]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="The buyer's checklist."
            subtitle="Know what to check before you buy. A confident sourcing decision starts with the right facts—not more people, more logins or another workflow to manage."
          />

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {BUYER_CHECKLIST.map((chk, idx) => (
              <ScrollReveal key={idx} delay={idx * 0.08} direction="up" className="h-full">
                <div
                  className="rounded-2xl border border-[#e2e8e5] bg-white p-6 shadow-xs flex flex-col justify-between h-full"
                >
                  <div>
                    <span className="font-mono text-xs font-bold text-[#0b7a55] block mb-2">
                      Check #{idx + 1}
                    </span>
                    <h4 className="text-base font-bold text-[#0f172a] mb-2">{chk.title}</h4>
                    <p className="text-xs text-[#52525b] leading-relaxed">{chk.desc}</p>
                  </div>
                  <div className="mt-6 pt-3 border-t border-[#edf2ef] flex items-center gap-1 text-[11px] font-bold text-[#0b7a55]">
                    <Check size={14} />
                    <span>Standardized in Portal</span>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Three-point summary banner */}
          <div className="mt-10 rounded-2xl bg-[#f8faf9] border border-[#e2e8e5] p-8 text-[#0f172a] max-w-3xl mx-auto text-center shadow-xs">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#0b7a55] block mb-2">
              The Three-Point Rule of Confident Chemical Sourcing
            </span>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 mt-4 text-sm font-bold">
              <span className="flex items-center gap-2 text-[#0f172a]">
                <CheckCircle2 size={18} className="text-[#0b7a55]" />
                Verify the material.
              </span>
              <span className="flex items-center gap-2 text-[#0f172a]">
                <CheckCircle2 size={18} className="text-[#0b7a55]" />
                Verify the supplier.
              </span>
              <span className="flex items-center gap-2 text-[#0f172a]">
                <CheckCircle2 size={18} className="text-[#0b7a55]" />
                Compare the offer.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
         SECTION 10: NATIONAL CHEMICAL NETWORK ("Made for India's Chemical Industry.")
         ========================================================================= */}
      <section className="py-20 sm:py-28 bg-white border-b border-[#e2e8e5]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Made for India's Chemical Industry."
            subtitle="Connect with the manufacturers, traders and distributors who power Indian chemistry, building a more efficient, transparent and reliable supply chain."
          />

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {INDUSTRIAL_REGIONS.map((reg, idx) => (
              <ScrollReveal key={idx} delay={idx * 0.08} direction="up" className="h-full">
                <div
                  className="rounded-2xl border border-[#e2e8e5] bg-[#f8faf9] p-6 hover:border-[#0b7a55] transition-all h-full"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-[#edf2ef]">
                    <h4 className="font-extrabold text-[#0f172a] text-base">{reg.name}</h4>
                    <span className="rounded-full bg-[#e4f2ec] px-2.5 py-0.5 text-xs font-mono font-bold text-[#0b7a55]">
                      {reg.activeNodes} Nodes
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-xs">
                    <div>
                      <span className="text-[#65717f] block font-medium">Key Terminal Hubs:</span>
                      <span className="font-bold text-[#0f172a]">{reg.hubs}</span>
                    </div>
                    <div>
                      <span className="text-[#65717f] block font-medium">Core Sourcing Categories:</span>
                      <span className="text-[#4a5666]">{reg.focus}</span>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <p className="mt-8 text-center text-xs text-[#65717f]">
            * Regional network figures reflect active factory logistics routes and verified manufacturer partner terminals.
          </p>
        </div>
      </section>

      {/* =========================================================================
         SECTION 11: BUYER FEATURES ("What you can do today.")
         ========================================================================= */}
      <section className="py-20 sm:py-28 bg-[#f8faf9] border-b border-[#e2e8e5]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="What you can do today."
            subtitle="Built for better buying, not more admin."
          />

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {BUYER_FEATURES.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <ScrollReveal key={idx} delay={idx * 0.08} direction="up" className="h-full">
                  <div
                    className="rounded-2xl border border-[#e2e8e5] bg-white p-6 shadow-xs flex flex-col justify-between hover:border-[#0b7a55] transition-all h-full"
                  >
                    <div>
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e4f2ec] text-[#0b7a55] mb-5">
                        <Icon size={22} />
                      </div>
                      <h4 className="text-base font-bold text-[#0f172a] mb-2">{feat.title}</h4>
                      <p className="text-xs text-[#52525b] leading-relaxed">{feat.desc}</p>
                    </div>
                    <div className="mt-6 pt-3 border-t border-[#edf2ef] text-[11px] font-bold text-[#0b7a55]">
                      Active Capability
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
         SECTION 12: FINAL CALL TO ACTION ("Source with confidence.")
         ========================================================================= */}
      <section className="py-20 sm:py-24 bg-white border-t border-[#e2e8e5]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <FadeUp>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0f172a] leading-tight">
              Source with confidence.
            </h2>

            <p className="mt-4 text-sm sm:text-base text-[#4a5666] max-w-2xl mx-auto leading-relaxed">
              Start with the chemical or specification you need. Review the facts, then make the right enquiry with confidence.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/chemicals"
                className="rounded-xl bg-[#0b7a55] px-8 py-3.5 text-sm font-bold text-white shadow-md hover:bg-[#08603f] transition-all flex items-center gap-2"
              >
                <span>Start Sourcing</span>
                <ArrowRight size={16} />
              </Link>

              <button
                onClick={() => requestRfq()}
                className="rounded-xl border border-[#d0ded7] bg-[#f8faf9] px-8 py-3.5 text-sm font-bold text-[#1b2433] hover:bg-white transition-all shadow-xs"
              >
                <span>Post a Requirement</span>
              </button>
            </div>

            <div className="mt-10 flex flex-wrap justify-center gap-8 text-xs text-[#65717f] border-t border-[#edf2ef] pt-6">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-[#0b7a55]" />
                Verified Suppliers
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-[#0b7a55]" />
                Spec-Driven Sourcing
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-[#0b7a55]" />
                Built for Indian Manufacturing
              </span>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* =========================================================================
         SECTION 13: NEWSLETTER
         ========================================================================= */}
      <section className="py-16 sm:py-20 bg-white border-t border-[#e2e8e5]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <SectionHeading
            title="Chemical industry forecasts & sourcing guides, in your inbox."
            subtitle="Sector outlooks and procurement trends — sent only when we publish. No spam, unsubscribe in one click."
          />

          <div className="mt-8 max-w-md mx-auto">
            {newsletterSubmitted ? (
              <div className="rounded-xl bg-[#e4f2ec] p-4 text-center border border-[#0b7a55]/20">
                <CheckCircle2 size={24} className="mx-auto text-[#0b7a55] mb-2" />
                <p className="text-sm font-bold text-[#0b7a55]">Thank you for subscribing!</p>
                <p className="text-xs text-[#4a5666] mt-1">
                  You will receive our next quarterly chemical market intelligence digest.
                </p>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter corporate email address..."
                  className="flex-1 rounded-xl border border-[#d0ded7] px-4 py-3 text-xs text-[#1b2433] focus:border-[#0b7a55] focus:outline-none bg-[#f8faf9]"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-[#0b7a55] px-6 py-3 text-xs font-bold text-white hover:bg-[#08603f] transition-all shrink-0"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Interactive Sample Document Modal */}
      {activeDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-[#e2e8e5]">
            <button
              onClick={() => setActiveDocModal(null)}
              className="absolute top-4 right-4 text-[#65717f] hover:text-[#0f172a]"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="rounded bg-[#e4f2ec] px-2 py-0.5 text-xs font-mono font-bold text-[#0b7a55]">
                {activeDocModal.code}
              </span>
              <span className="text-xs font-semibold text-[#65717f]">Technical Schema</span>
            </div>

            <h3 className="text-xl font-bold text-[#0f172a]">{activeDocModal.name}</h3>
            <p className="text-xs text-[#4a5666] mt-1">{activeDocModal.desc}</p>

            <div className="mt-5 rounded-xl bg-[#f8faf9] p-4 border border-[#e2e8e5] text-xs font-mono space-y-2">
              <div className="flex justify-between border-b border-[#edf2ef] pb-1 text-[#4a5666]">
                <span>Document Format:</span>
                <span className="font-bold text-[#0f172a]">Digitally Signed PDF / NABL Audit</span>
              </div>
              <div className="flex justify-between border-b border-[#edf2ef] pb-1 text-[#4a5666]">
                <span>Lot Linkage:</span>
                <span className="font-bold text-[#0f172a]">Mapped to Factory Dispatch Weighbridge</span>
              </div>
              <div className="flex justify-between text-[#4a5666]">
                <span>Verification State:</span>
                <span className="font-bold text-[#0b7a55]">Archived & Download-Ready</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setActiveDocModal(null)}
                className="rounded-lg border border-[#d0ded7] px-4 py-2 text-xs font-semibold text-[#4a5666]"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const code = activeDocModal.code;
                  setActiveDocModal(null);
                  requestRfq(code);
                }}
                className="rounded-lg bg-[#0b7a55] px-4 py-2 text-xs font-bold text-white hover:bg-[#08603f]"
              >
                Request Material with {activeDocModal.code}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
