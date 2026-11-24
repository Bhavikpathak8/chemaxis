import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Truck,
  ArrowRight,
  FileText,
  Lock,
  CheckCircle2,
  Database,
  Building2,
  ChevronRight,
  ChevronDown,
  Search,
  Scale,
  Zap,
} from 'lucide-react';
import { useAuth, ROLE_HOME } from '../../lib/auth.jsx';

const CHEMICAL_DATA = [
  {
    name: 'Phenol',
    grade: 'Pure / CP Grade 99.5%',
    cas: '108-95-2',
    formula: 'C₆H₅OH',
    packaging: 'Dedicated ISO Tanker / MS Drums',
    category: 'Aromatics',
    origin: 'Dahej PCPIR',
    buyerPrice: '₹107.00 / kg',
    moq: '5,000 kg',
  },
  {
    name: 'Caustic Soda Lye',
    grade: 'Commercial Grade 48%',
    cas: '1310-73-2',
    formula: 'NaOH (aq)',
    packaging: 'Rubber Lined Road Tankers',
    category: 'Acids & Alkalies',
    origin: 'Ankleshwar GIDC',
    buyerPrice: '₹37.50 / kg',
    moq: '15,000 kg',
  },
  {
    name: 'Methanol',
    grade: 'Refined Pure 99.85%',
    cas: '67-56-1',
    formula: 'CH₃OH',
    packaging: 'Dedicated SS Road Tankers',
    category: 'Solvents',
    origin: 'Kandla Terminal',
    buyerPrice: '₹29.80 / kg',
    moq: '20,000 kg',
  },
  {
    name: 'Acetone',
    grade: 'Pharmaceutical / CP 99.5%',
    cas: '67-64-1',
    formula: 'CH₃COCH₃',
    packaging: 'HM-HDPE Barrels / Tanker',
    category: 'Solvents',
    origin: 'Surat Corridor',
    buyerPrice: '₹76.00 / kg',
    moq: '2,000 kg',
  },
  {
    name: 'Ethyl Acetate',
    grade: 'Industrial Grade 99.0%',
    cas: '141-78-6',
    formula: 'C₄H₈O₂',
    packaging: 'Road Tanker / MS Drums',
    category: 'Solvents',
    origin: 'Panoli GIDC',
    buyerPrice: '₹68.50 / kg',
    moq: '3,000 kg',
  },
  {
    name: 'Toluene',
    grade: 'High Purity 99.7%',
    cas: '108-88-3',
    formula: 'C⇂H₈',
    packaging: 'Dedicated Road Tankers',
    category: 'Aromatics',
    origin: 'Hazira PCPIR',
    buyerPrice: '₹84.20 / kg',
    moq: '10,000 kg',
  },
];

const FAQS = [
  {
    q: 'How does C-Tech guarantee zero price exposure between buyer and seller?',
    a: 'Our server completely strips seller pricing, margins, and seller identities before any response reaches the buyer. Chemical sellers only see their own agreed reserve rate and payouts. All margin calculations and trade settlement economics remain confidential to C-Tech.',
  },
  {
    q: 'How does row-level stock locking protect orders?',
    a: 'When an industrial buyer confirms a quotation, the system locks that specific lot in the database at the row level. This guarantees that chemical stock cannot be re-allocated or double-sold to another party.',
  },
  {
    q: 'What compliance documents are issued for every chemical dispatch?',
    a: 'Every shipment carries the manufacturer batch Certificate of Analysis (COA), Material Safety Data Sheet (MSDS), GPS tanker dispatch sheet, official delivery challan, and IRN-ready GST tax invoice with verified QR code.',
  },
  {
    q: 'What are the payment and payout settlement terms?',
    a: 'Buyer invoices are settled via RTGS/NEFT against official invoice balances. Seller payouts are released directly to verified bank accounts upon delivery confirmation at the buyer plant gate.',
  },
];

export default function LandingPage() {
  const { user } = useAuth();
  const [activeRoleTab, setActiveRoleTab] = useState('buyers');
  const [search, setSearch] = useState('');
  const [openFaq, setOpenFaq] = useState(0);

  const filteredChemicals = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return CHEMICAL_DATA;
    return CHEMICAL_DATA.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.cas.includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.origin.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className="min-h-screen bg-[#f8faf9] text-[#1b2433] selection:bg-[#0b7a55] selection:text-white font-sans antialiased">
      {/* ----------------- Clean Corporate Header ----------------- */}
      <header className="sticky top-0 z-50 border-b border-[#e2e8e5] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0b7a55] text-white shadow-xs">
              <svg width="20" height="20" viewBox="0 0 32 32" aria-hidden>
                <path d="M16 3l11 13-11 13L5 16z" fill="#ffffff" />
                <path d="M16 10l5.5 6-5.5 6-5.5-6z" fill="#0B7A55" />
              </svg>
            </div>
            <div>
              <span className="text-[18px] font-bold tracking-tight text-[#1b2433]">C-Tech</span>
              <span className="ml-2 rounded bg-[#e4f2ec] px-1.5 py-0.5 text-[10.5px] font-mono font-bold text-[#0b7a55]">
                TRADE DESK
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-[13.5px] font-medium text-[#4a5666]">
            <a href="#capabilities" className="hover:text-[#0b7a55] transition-colors">
              Capabilities
            </a>
            <a href="#workflow" className="hover:text-[#0b7a55] transition-colors">
              Order Desk
            </a>
            <a href="#catalog" className="hover:text-[#0b7a55] transition-colors">
              Chemicals
            </a>
            <a href="#ecosystem" className="hover:text-[#0b7a55] transition-colors">
              Ecosystem
            </a>
            <a href="#faq" className="hover:text-[#0b7a55] transition-colors">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <Link
                to={ROLE_HOME[user.role] || '/login'}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#0b7a55] px-4 py-2 text-[13px] font-bold text-white shadow-xs transition-colors hover:bg-[#08603f]"
              >
                <span>Go to {user.role} Workspace</span>
                <ArrowRight size={14} />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-lg border border-[#e2e8e5] bg-white px-3.5 py-2 text-[13px] font-semibold text-[#1b2433] transition-colors hover:border-[#0b7a55] hover:bg-[#f8faf9]"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-[#0b7a55] px-3.5 py-2 text-[13px] font-bold text-white shadow-xs transition-colors hover:bg-[#08603f]"
                >
                  Register Plant
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ----------------- Clean Hero Section ----------------- */}
      <section className="border-b border-[#e2e8e5] bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            {/* Status Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#0b7a55]/20 bg-[#e4f2ec] px-3 py-1 text-xs font-semibold text-[#0b7a55]">
              <span className="h-2 w-2 rounded-full bg-[#0b7a55]" />
              <span>Gujarat Chemical Corridor • Institutional Trade Desk</span>
            </div>

            {/* Headline */}
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-[#1b2433] leading-[1.12]">
              The Sovereign Desk for{' '}
              <span className="text-[#0b7a55]">B2B Chemical Commerce.</span>
            </h1>

            {/* Subhead */}
            <p className="mt-5 text-base sm:text-lg text-[#4a5666] leading-relaxed">
              Sellers list bulk stock at protected reserve rates. Buyers receive competitive, transparent quotes.
              C-Tech prices, allocates dedicated road tankers, manages E-Way documentation, and settles each order with zero counterparty price leakage.
            </p>

            {/* Primary Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-[#0b7a55] px-6 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#08603f]"
              >
                <span>Enter Trade Workspace</span>
                <ArrowRight size={16} />
              </Link>
              <a
                href="#catalog"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-[#e2e8e5] bg-white px-6 py-3.5 text-sm font-bold text-[#1b2433] transition-colors hover:border-[#0b7a55] hover:bg-[#f8faf9]"
              >
                <span>Browse Chemical Directory</span>
              </a>
            </div>

            {/* Core Verification Proof Points */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-[#4a5666]">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-[#0b7a55]" />
                100% Confidential Reserve Rates
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-[#0b7a55]" />
                Database Row-Locked Stock
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-[#0b7a55]" />
                Automated GSTIN & COA Verification
              </span>
            </div>
          </div>

          {/* ----------------- Product Preview: Actual Clean Order Desk Terminal ----------------- */}
          <div className="mt-14 overflow-hidden rounded-xl border border-[#dbe1de] bg-white shadow-xl">
            {/* Terminal Top Window Bar */}
            <div className="flex items-center justify-between border-b border-[#e2e8e5] bg-[#f8faf9] px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[#e2e8e5]" />
                <span className="h-3 w-3 rounded-full bg-[#e2e8e5]" />
                <span className="h-3 w-3 rounded-full bg-[#e2e8e5]" />
                <span className="ml-2 font-mono text-xs text-[#65717f]">ctech-desk // live-orders</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded bg-[#e4f2ec] px-2 py-0.5 font-mono text-[11px] font-bold text-[#0b7a55]">
                  GSTIN: 24AAAAA0000A1Z5
                </span>
                <span className="hidden sm:inline-block rounded bg-white border border-[#e2e8e5] px-2 py-0.5 text-[11px] font-medium text-[#4a5666]">
                  Bharuch ➔ Dahej
                </span>
              </div>
            </div>

            {/* Terminal Realistic Ledger Table */}
            <div className="overflow-x-auto p-4 sm:p-6">
              <table className="tbl w-full text-left">
                <thead>
                  <tr>
                    <th>Chemical & CAS</th>
                    <th>Lot Quantity</th>
                    <th>Seller Floor (Private)</th>
                    <th>Trade Margin</th>
                    <th>Buyer Quoted Rate</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8e5] text-xs sm:text-[13px]">
                  <tr className="hover:bg-[#f8faf9] transition-colors">
                    <td className="py-3">
                      <div className="font-bold text-[#1b2433]">Phenol 99.5% CP</div>
                      <div className="font-mono text-[11px] text-[#65717f]">CAS: 108-95-2</div>
                    </td>
                    <td className="fig font-semibold text-[#1b2433]">5,000 kg</td>
                    <td className="fig font-bold text-[#0b7a55] bg-[#e4f2ec]/50 px-2 py-1 rounded">
                      ₹100.00 / kg
                    </td>
                    <td className="fig font-semibold text-[#0b7a55]">+₹7.00 (₹35,000)</td>
                    <td className="fig font-bold text-[#1b2433]">₹107.00 / kg</td>
                    <td>
                      <span className="inline-flex items-center gap-1 rounded bg-[#e4f2ec] px-2 py-0.5 text-[11px] font-bold text-[#0b7a55]">
                        <CheckCircle2 size={12} /> Stock Row-Locked
                      </span>
                    </td>
                  </tr>

                  <tr className="hover:bg-[#f8faf9] transition-colors">
                    <td className="py-3">
                      <div className="font-bold text-[#1b2433]">Caustic Soda Lye 48%</div>
                      <div className="font-mono text-[11px] text-[#65717f]">CAS: 1310-73-2</div>
                    </td>
                    <td className="fig font-semibold text-[#1b2433]">15,000 kg</td>
                    <td className="fig font-bold text-[#0b7a55] bg-[#e4f2ec]/50 px-2 py-1 rounded">
                      ₹35.00 / kg
                    </td>
                    <td className="fig font-semibold text-[#0b7a55]">+₹2.50 (₹37,500)</td>
                    <td className="fig font-bold text-[#1b2433]">₹37.50 / kg</td>
                    <td>
                      <span className="inline-flex items-center gap-1 rounded bg-[#f1f4f2] px-2 py-0.5 text-[11px] font-semibold text-[#4a5666]">
                        <Truck size={12} /> E-Way Challan Active
                      </span>
                    </td>
                  </tr>

                  <tr className="hover:bg-[#f8faf9] transition-colors">
                    <td className="py-3">
                      <div className="font-bold text-[#1b2433]">Methanol Refined Pure</div>
                      <div className="font-mono text-[11px] text-[#65717f]">CAS: 67-56-1</div>
                    </td>
                    <td className="fig font-semibold text-[#1b2433]">20,000 kg</td>
                    <td className="fig font-bold text-[#0b7a55] bg-[#e4f2ec]/50 px-2 py-1 rounded">
                      ₹28.00 / kg
                    </td>
                    <td className="fig font-semibold text-[#0b7a55]">+₹1.80 (₹36,000)</td>
                    <td className="fig font-bold text-[#1b2433]">₹29.80 / kg</td>
                    <td>
                      <span className="inline-flex items-center gap-1 rounded bg-[#e4f2ec] px-2 py-0.5 text-[11px] font-bold text-[#0b7a55]">
                        <CheckCircle2 size={12} /> Bank Settled (RTGS)
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Terminal Footer Metrics Bar */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-[#e2e8e5] pt-3 text-xs text-[#4a5666]">
                <div className="flex items-center gap-4">
                  <span>Gross Desk Margin: <strong className="font-mono text-[#0b7a55]">₹1,08,500</strong></span>
                  <span>Logistics & Freight: <strong className="font-mono text-[#1b2433]">₹36,400</strong></span>
                  <span>Net Platform Profit: <strong className="font-mono text-[#0b7a55]">₹72,100</strong></span>
                </div>
                <div className="font-mono text-[11px] text-[#65717f]">
                  Server-side price redaction enforced
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- Key Capabilities Grid (No Gimmicks, Crisp B2B) ----------------- */}
      <section id="capabilities" className="py-16 bg-[#f8faf9]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1b2433]">
              Purpose-Built for Industrial Chemical Transactions
            </h2>
            <p className="mt-2 text-[#4a5666] text-sm">
              Critical safeguards and compliance controls engineered directly into the server database.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Card 1 */}
            <div className="card-corporate p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e4f2ec] text-[#0b7a55]">
                <Lock size={20} />
              </div>
              <h3 className="mt-4 text-base font-bold text-[#1b2433]">Zero Price Leakage</h3>
              <p className="mt-2 text-xs text-[#4a5666] leading-relaxed">
                Buyers never see the seller’s reserve price. Sellers never see the buyer’s quote or trade margin. Redacted on the server.
              </p>
            </div>

            {/* Card 2 */}
            <div className="card-corporate p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e4f2ec] text-[#0b7a55]">
                <Database size={20} />
              </div>
              <h3 className="mt-4 text-base font-bold text-[#1b2433]">Row-Locked Inventory</h3>
              <p className="mt-2 text-xs text-[#4a5666] leading-relaxed">
                Stock is locked at the database row level upon quotation acceptance, eliminating double-allocation and phantom lots.
              </p>
            </div>

            {/* Card 3 */}
            <div className="card-corporate p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e4f2ec] text-[#0b7a55]">
                <Truck size={20} />
              </div>
              <h3 className="mt-4 text-base font-bold text-[#1b2433]">Dedicated Road Tankers</h3>
              <p className="mt-2 text-xs text-[#4a5666] leading-relaxed">
                Verified driver assignments, E-Way Bill details sheets, delivery challans, and real-time status transitions.
              </p>
            </div>

            {/* Card 4 */}
            <div className="card-corporate p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e4f2ec] text-[#0b7a55]">
                <FileText size={20} />
              </div>
              <h3 className="mt-4 text-base font-bold text-[#1b2433]">Automated GST Invoicing</h3>
              <p className="mt-2 text-xs text-[#4a5666] leading-relaxed">
                Generates IRN-ready GST tax invoices with QR verification. Payouts are reconciled cleanly against registered bank accounts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- The Workflow Timeline ----------------- */}
      <section id="workflow" className="border-y border-[#e2e8e5] bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1b2433]">
              The C-Tech Transaction Workflow
            </h2>
            <p className="mt-2 text-[#4a5666] text-sm">
              From chemical listing to delivery and final settlement.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-4">
            <div className="rounded-xl border border-[#e2e8e5] bg-[#f8faf9] p-5">
              <div className="font-mono text-xs font-bold text-[#0b7a55]">STEP 01</div>
              <h3 className="mt-2 text-base font-bold text-[#1b2433]">Seller Listing</h3>
              <p className="mt-1.5 text-xs text-[#4a5666] leading-relaxed">
                Chemical manufacturers list inventory with batch COA and private reserve price. If edited, the listing unlists automatically.
              </p>
            </div>

            <div className="rounded-xl border border-[#0b7a55] bg-white p-5 shadow-xs">
              <div className="font-mono text-xs font-bold text-[#0b7a55]">STEP 02</div>
              <h3 className="mt-2 text-base font-bold text-[#1b2433]">Algorithmic Quote</h3>
              <p className="mt-1.5 text-xs text-[#4a5666] leading-relaxed">
                The trade desk reviews buyer RFQs, applies configured margin rules, verifies stock availability, and submits the buyer quote.
              </p>
            </div>

            <div className="rounded-xl border border-[#e2e8e5] bg-[#f8faf9] p-5">
              <div className="font-mono text-xs font-bold text-[#0b7a55]">STEP 03</div>
              <h3 className="mt-2 text-base font-bold text-[#1b2433]">Order Row-Lock</h3>
              <p className="mt-1.5 text-xs text-[#4a5666] leading-relaxed">
                Buyer accepts the quotation and issues a Purchase Order. The seller inventory is row-locked in PostgreSQL to ensure fulfillment.
              </p>
            </div>

            <div className="rounded-xl border border-[#e2e8e5] bg-[#f8faf9] p-5">
              <div className="font-mono text-xs font-bold text-[#0b7a55]">STEP 04</div>
              <h3 className="mt-2 text-base font-bold text-[#1b2433]">Dispatch & Settlement</h3>
              <p className="mt-1.5 text-xs text-[#4a5666] leading-relaxed">
                Dedicated tanker assigned, delivery challan and GST QR invoice issued. Payout released upon buyer plant gate verification.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- Clean Chemical Directory Section ----------------- */}
      <section id="catalog" className="py-16 bg-[#f8faf9]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1b2433]">
                Benchmark Industrial Chemicals
              </h2>
              <p className="mt-1 text-sm text-[#4a5666]">
                Real-time catalogue with pre-uploaded Certificate of Analysis (COA) and verified stock.
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search size={15} className="absolute left-3 top-3 text-[#65717f]" />
              <input
                type="text"
                placeholder="Search chemical or CAS#..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 w-full rounded-lg border border-[#e2e8e5] bg-white pl-9 pr-3 text-xs text-[#1b2433] placeholder:text-[#65717f] focus:border-[#0b7a55] focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-[#e2e8e5] bg-white shadow-xs">
            <table className="tbl w-full text-left">
              <thead>
                <tr>
                  <th>Commodity Name</th>
                  <th>CAS Number</th>
                  <th>Category</th>
                  <th>Packaging Format</th>
                  <th>Origin Cluster</th>
                  <th>Buyer Benchmark</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8e5] text-xs">
                {filteredChemicals.map((chem) => (
                  <tr key={chem.name} className="hover:bg-[#f8faf9] transition-colors">
                    <td className="py-3">
                      <div className="font-bold text-[#1b2433]">{chem.name}</div>
                      <div className="text-[11px] text-[#65717f]">{chem.grade}</div>
                    </td>
                    <td className="fig font-mono font-medium text-[#4a5666]">{chem.cas}</td>
                    <td>
                      <span className="rounded bg-[#f1f4f2] px-2 py-0.5 text-[11px] font-medium text-[#4a5666]">
                        {chem.category}
                      </span>
                    </td>
                    <td className="text-[#4a5666]">{chem.packaging}</td>
                    <td className="text-[#4a5666]">{chem.origin}</td>
                    <td className="fig font-bold text-[#0b7a55]">{chem.buyerPrice}</td>
                    <td>
                      <Link
                        to="/register"
                        className="inline-flex items-center gap-1 font-bold text-[#0b7a55] hover:underline"
                      >
                        <span>Request Quote</span>
                        <ChevronRight size={13} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ----------------- Ecosystem Stakeholders (Buyers vs Sellers) ----------------- */}
      <section id="ecosystem" className="border-t border-[#e2e8e5] bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1b2433]">
              Tailored for Enterprise Industrial Roles
            </h2>
            <div className="mt-5 inline-flex rounded-lg border border-[#e2e8e5] bg-[#f8faf9] p-1">
              <button
                onClick={() => setActiveRoleTab('buyers')}
                className={`rounded-md px-4 py-2 text-xs font-bold transition-all ${
                  activeRoleTab === 'buyers' ? 'bg-[#0b7a55] text-white shadow-xs' : 'text-[#4a5666] hover:text-[#1b2433]'
                }`}
              >
                For Industrial Buyers
              </button>
              <button
                onClick={() => setActiveRoleTab('sellers')}
                className={`rounded-md px-4 py-2 text-xs font-bold transition-all ${
                  activeRoleTab === 'sellers' ? 'bg-[#0b7a55] text-white shadow-xs' : 'text-[#4a5666] hover:text-[#1b2433]'
                }`}
              >
                For Chemical Sellers
              </button>
            </div>
          </div>

          <div className="mx-auto max-w-4xl rounded-2xl border border-[#e2e8e5] bg-[#f8faf9] p-8">
            {activeRoleTab === 'buyers' ? (
              <div className="grid gap-6 sm:grid-cols-3">
                <div className="rounded-xl border border-[#e2e8e5] bg-white p-5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e4f2ec] text-[#0b7a55]">
                    <ShieldCheck size={18} />
                  </div>
                  <h3 className="mt-3 text-sm font-bold text-[#1b2433]">Batch COA Download</h3>
                  <p className="mt-1.5 text-xs text-[#4a5666] leading-relaxed">
                    Verify manufacturer laboratory testing, CAS certification, and MSDS sheets before approving orders.
                  </p>
                </div>
                <div className="rounded-xl border border-[#e2e8e5] bg-white p-5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e4f2ec] text-[#0b7a55]">
                    <Truck size={18} />
                  </div>
                  <h3 className="mt-3 text-sm font-bold text-[#1b2433]">Dedicated Logistics</h3>
                  <p className="mt-1.5 text-xs text-[#4a5666] leading-relaxed">
                    Dedicated road tanker fleet with driver credentials, milestone dispatch tracking, and e-way bill details sheet.
                  </p>
                </div>
                <div className="rounded-xl border border-[#e2e8e5] bg-white p-5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e4f2ec] text-[#0b7a55]">
                    <FileText size={18} />
                  </div>
                  <h3 className="mt-3 text-sm font-bold text-[#1b2433]">GST QR Invoicing</h3>
                  <p className="mt-1.5 text-xs text-[#4a5666] leading-relaxed">
                    Standardized delivery challans, official purchase orders, and compliant GST invoices with QR verification.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-3">
                <div className="rounded-xl border border-[#e2e8e5] bg-white p-5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e4f2ec] text-[#0b7a55]">
                    <Scale size={18} />
                  </div>
                  <h3 className="mt-3 text-sm font-bold text-[#1b2433]">Protected Floor Rate</h3>
                  <p className="mt-1.5 text-xs text-[#4a5666] leading-relaxed">
                    You set your exact reserve price. The desk never sells below your floor, preventing market rate erosion.
                  </p>
                </div>
                <div className="rounded-xl border border-[#e2e8e5] bg-white p-5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e4f2ec] text-[#0b7a55]">
                    <Zap size={18} />
                  </div>
                  <h3 className="mt-3 text-sm font-bold text-[#1b2433]">Row-Level Inventory Lock</h3>
                  <p className="mt-1.5 text-xs text-[#4a5666] leading-relaxed">
                    Stock is locked on quotation acceptance, preventing duplicate allocations and protecting your warehouse counts.
                  </p>
                </div>
                <div className="rounded-xl border border-[#e2e8e5] bg-white p-5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e4f2ec] text-[#0b7a55]">
                    <Building2 size={18} />
                  </div>
                  <h3 className="mt-3 text-sm font-bold text-[#1b2433]">Bank Payout Settlements</h3>
                  <p className="mt-1.5 text-xs text-[#4a5666] leading-relaxed">
                    Payouts are credited directly to your bank account via RTGS/NEFT with verified UTR payment references.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ----------------- Frequently Asked Questions ----------------- */}
      <section id="faq" className="border-t border-[#e2e8e5] bg-[#f8faf9] py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1b2433]">
              Frequently Asked Questions
            </h2>
            <p className="mt-1 text-sm text-[#4a5666]">
              Answers regarding counterparty confidentiality, chemical quality standards, and logistics.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-[#e2e8e5] bg-white transition-all overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                  className="flex w-full items-center justify-between p-4 text-left text-sm font-bold text-[#1b2433] hover:text-[#0b7a55]"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 text-[#0b7a55] ${
                      openFaq === idx ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-4 pb-4 text-xs text-[#4a5666] leading-relaxed border-t border-[#e2e8e5] pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------- Corporate Closing Call to Action ----------------- */}
      <section className="border-t border-[#e2e8e5] bg-white py-16">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-[#1b2433]">
            Ready to Streamline Your Chemical Trading Desk?
          </h2>
          <p className="mt-3 text-sm text-[#4a5666] max-w-xl mx-auto">
            Join verified chemical manufacturers and institutional buyers operating with zero counterparty price leakage.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-[#0b7a55] px-6 py-3 text-sm font-bold text-white shadow-xs transition-colors hover:bg-[#08603f]"
            >
              <span>Register Plant Account</span>
              <ArrowRight size={15} />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-[#e2e8e5] bg-white px-6 py-3 text-sm font-bold text-[#1b2433] transition-colors hover:border-[#0b7a55]"
            >
              <span>Sign In to Trade Desk</span>
            </Link>
          </div>

          {/* Quick Demo Credentials */}
          <div className="mt-8 border-t border-[#e2e8e5] pt-6 max-w-lg mx-auto">
            <div className="text-xs font-mono text-[#65717f] mb-2">
              Instant Sandbox Demo Access:
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <Link
                to="/login"
                className="rounded border border-[#e2e8e5] bg-[#f8faf9] px-2.5 py-1 text-xs text-[#1b2433] hover:border-[#0b7a55] font-medium"
              >
                Super Admin: <span className="font-mono text-[#0b7a55] font-bold">admin@ctech.com</span>
              </Link>
              <Link
                to="/login"
                className="rounded border border-[#e2e8e5] bg-[#f8faf9] px-2.5 py-1 text-xs text-[#1b2433] hover:border-[#0b7a55] font-medium"
              >
                Seller: <span className="font-mono text-[#0b7a55] font-bold">seller@ctech.com</span>
              </Link>
              <Link
                to="/login"
                className="rounded border border-[#e2e8e5] bg-[#f8faf9] px-2.5 py-1 text-xs text-[#1b2433] hover:border-[#0b7a55] font-medium"
              >
                Buyer: <span className="font-mono text-[#0b7a55] font-bold">buyer@ctech.com</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- Clean Corporate Footer ----------------- */}
      <footer className="border-t border-[#e2e8e5] bg-[#f8faf9] py-10 text-xs text-[#65717f]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded bg-[#0b7a55] text-white">
                <svg width="16" height="16" viewBox="0 0 32 32" aria-hidden>
                  <path d="M16 3l11 13-11 13L5 16z" fill="#ffffff" />
                  <path d="M16 10l5.5 6-5.5 6-5.5-6z" fill="#0B7A55" />
                </svg>
              </div>
              <span className="font-bold text-[#1b2433]">C-Tech Chemicals Pvt Ltd</span>
              <span className="text-[#65717f]">· Bharuch · Surat · Gujarat</span>
            </div>

            <div className="flex items-center gap-5 font-medium text-[#4a5666]">
              <a href="#capabilities" className="hover:text-[#0b7a55]">Capabilities</a>
              <a href="#workflow" className="hover:text-[#0b7a55]">Workflow</a>
              <a href="#catalog" className="hover:text-[#0b7a55]">Chemicals</a>
              <a href="#faq" className="hover:text-[#0b7a55]">FAQ</a>
              <Link to="/login" className="hover:text-[#0b7a55]">Sign In</Link>
            </div>

            <div className="font-mono text-[11px] text-[#65717f]">
              © {new Date().getFullYear()} C-Tech Trade Desk. GSTIN & Hazardous Transit Compliant.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
