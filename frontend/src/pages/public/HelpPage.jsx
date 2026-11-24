import { useState, useMemo } from 'react';
import {
  Search,
  HelpCircle,
  ShieldCheck,
  Truck,
  FileText,
  CreditCard,
  AlertTriangle,
  ChevronDown,
  CheckCircle2,
  PhoneCall,
  Mail,
  Clock,
  Send,
  Building2,
  Scale,
} from 'lucide-react';
import Header from '../../components/public/Header.jsx';
import Footer from '../../components/public/Footer.jsx';
import SectionHeading from '../../components/public/SectionHeading.jsx';
import { useRequestRfq } from '../../lib/useRfqAuth.js';
import { FadeUp } from '../../components/public/AnimationWrappers.jsx';

const TOPIC_CATEGORIES = [
  {
    id: 'kyc',
    icon: Building2,
    title: 'Account KYC & Compliance',
    desc: 'GSTIN verification, PCB consents, factory licenses, and onboarding.',
  },
  {
    id: 'rfq',
    icon: Scale,
    title: 'RFQ & Spot Quotations',
    desc: 'Quote validity, benchmark pricing, floor rates, and minimum order quantities.',
  },
  {
    id: 'logistics',
    icon: Truck,
    title: 'Tankers & HazMat Logistics',
    desc: 'PESO road tankers, GPS telemetry, transit demurrage, and driver safety.',
  },
  {
    id: 'billing',
    icon: FileText,
    title: 'Invoices & GST E-Way Bills',
    desc: 'Weighbridge reconciliation, digital delivery challans, and tax invoices.',
  },
  {
    id: 'quality',
    icon: ShieldCheck,
    title: 'Quality & Batch COA Claims',
    desc: 'NABL sampling, manufacturer batch test reports, and dispute arbitration.',
  },
  {
    id: 'payments',
    icon: CreditCard,
    title: 'Settlements & Escrow',
    desc: 'RTGS/NEFT releases, payout timelines, bank reconciliations, and credits.',
  },
];

const FAQS = [
  {
    category: 'kyc',
    q: 'What statutory documents are required for buyer or seller onboarding?',
    a: 'Every participant must provide a valid GSTIN certificate, Company PAN, factory address proof, Factory License or GIDC/MIDC allotment letter, and State Pollution Control Board (GPCB/MPCB) Consent to Operate. For regulated chemicals, a valid PESO or Narcotics permit is required.',
  },
  {
    category: 'kyc',
    q: 'How long does the KYC verification process take?',
    a: 'Once your statutory documents are uploaded via the portal, our Dahej compliance desk verifies the details against government databases within 2 to 4 business hours.',
  },
  {
    category: 'rfq',
    q: 'How long is a C-Tech spot quotation valid?',
    a: 'Because petrochemical and basic chemical markets experience continuous international crude and import index fluctuations, standard spot quotes are valid for 24 hours from issuance.',
  },
  {
    category: 'rfq',
    q: 'Can our factory negotiate monthly frame contracts instead of spot orders?',
    a: 'Yes. For recurring demand exceeding 50 MT/month, we structure formula-linked contracts pegged to monthly ICIS / Platts benchmarks or fixed quarterly arrangements with scheduled weekly tanker dispatches.',
  },
  {
    category: 'logistics',
    q: 'What is the demurrage policy for chemical tanker offloading at buyer plants?',
    a: 'Buyers are granted 4 hours of free detention time from the moment the tanker reports at the factory gate with valid e-way documentation. Offloading delays beyond 4 hours incur demurrage at pre-notified standard industry rates.',
  },
  {
    category: 'logistics',
    q: 'Are all tankers dedicated and calibrated for specific chemical classes?',
    a: 'Yes. Corrosive chemicals like Caustic Soda Lye are dispatched exclusively in rubber-lined or epoxy-coated tankers, while pure solvents such as Phenol, Methanol, and Acetone utilize SS316 or specialized MS road tankers equipped with sealed sample valves and GPS tracking.',
  },
  {
    category: 'billing',
    q: 'How does C-Tech calculate final invoice weight vs loading weight?',
    a: 'The billing quantity is governed by the computerised weighbridge slip from the manufacturer loading terminal. If destination weighbridge variance exceeds the standard 0.5% transit allowance, our dispute desk reviews calibration slips from both weighbridges.',
  },
  {
    category: 'billing',
    q: 'When are GST tax invoices and digital e-way bills generated?',
    a: 'The digital e-way bill is issued prior to tanker dispatch. The final GST tax invoice is generated automatically upon transit departure and synced directly to your buyer portal and registered email.',
  },
  {
    category: 'quality',
    q: 'What is the standard protocol if a delivered batch fails incoming QC?',
    a: 'The buyer must retain the tanker sealed without decanting and immediately log a QC dispute in the portal within 2 hours of arrival. Three joint samples are drawn in the presence of the driver: one for the buyer, one for the seller, and one for arbitration at an accredited independent NABL laboratory.',
  },
  {
    category: 'payments',
    q: 'When are seller payouts released into factory bank accounts?',
    a: 'Payouts are executed automatically via direct RTGS/NEFT within 24 hours of destination weighbridge sign-off and receipt of the signed gate pass and delivery challan.',
  },
];

export default function HelpPage() {
  const { requestRfq } = useRequestRfq();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // Ticket Form State
  const [ticketForm, setTicketForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    category: 'RFQ & Spot Quote Assistance',
    message: '',
  });
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');

  const filteredFaqs = useMemo(() => {
    return FAQS.filter((faq) => {
      const matchesCategory =
        selectedCategory === 'all' || faq.category === selectedCategory;
      const matchesSearch =
        faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.a.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleTicketSubmit = (e) => {
    e.preventDefault();
    if (!ticketForm.name || !ticketForm.email || !ticketForm.message) return;
    const generatedId = `CT-TKT-${Math.floor(10000 + Math.random() * 90000)}`;
    setTicketId(generatedId);
    setTicketSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#f8faf9] text-[#1b2433]">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0b132b] via-[#0f172a] to-[#162238] py-16 sm:py-20 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(#0b7a55_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <FadeUp>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#0b7a55]/40 bg-[#0b7a55]/15 px-3.5 py-1.5 text-xs font-semibold text-[#6ee7b7] mb-4">
                <HelpCircle size={13} className="text-[#6ee7b7]" />
                <span>C-Tech Support & Operations Desk</span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                How Can Our Trade Desk Help You?
              </h1>
              <p className="mt-4 text-sm sm:text-base text-[#cbd5e1]">
                Find instant answers on KYC guidelines, spot quotations, chemical transport safety, GST billing, and quality testing standards.
              </p>
            </FadeUp>

            {/* Live Search Input */}
            <FadeUp delay={0.2}>
              <div className="mt-8 relative max-w-xl mx-auto">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Search size={18} className="text-[#94a3b8]" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search questions (e.g. KYC, demurrage, COA, payout, GST e-way)..."
                  className="w-full rounded-xl border border-white/20 bg-white/10 py-3.5 pl-11 pr-4 text-sm text-white placeholder-[#94a3b8] backdrop-blur-md focus:border-[#0b7a55] focus:bg-white/15 focus:outline-hidden transition-all shadow-lg"
                />
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* Category Pills & Cards */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Knowledge Base"
            title="Browse by Operational Category"
            subtitle="Select a topic to quickly filter common questions or learn about C-Tech trade desk procedures."
          />

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`rounded-xl border p-4 text-left transition-all ${
                selectedCategory === 'all'
                  ? 'border-[#0b7a55] bg-[#e4f2ec] text-[#0b7a55] shadow-xs'
                  : 'border-[#e2e8e5] bg-white text-[#4a5666] hover:border-[#0b7a55]/40'
              }`}
            >
              <div className="text-xs font-bold uppercase tracking-wider">All Topics</div>
              <div className="mt-1 text-xs text-[#65717f]">Complete FAQ list ({FAQS.length})</div>
            </button>

            {TOPIC_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`rounded-xl border p-4 text-left transition-all ${
                    isActive
                      ? 'border-[#0b7a55] bg-[#e4f2ec] text-[#0b7a55] shadow-xs'
                      : 'border-[#e2e8e5] bg-white text-[#4a5666] hover:border-[#0b7a55]/40'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-[#0b7a55]' : 'text-[#65717f]'} />
                  <div className="mt-2 text-xs font-bold text-[#0f172a] line-clamp-1">{cat.title}</div>
                  <div className="mt-0.5 text-[11px] text-[#65717f] line-clamp-2">{cat.desc}</div>
                </button>
              );
            })}
          </div>

          {/* Interactive FAQs Accordion */}
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-[#0f172a]">
                Frequently Asked Questions ({filteredFaqs.length})
              </h3>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-[#0b7a55] font-semibold hover:underline"
                >
                  Clear search filter
                </button>
              )}
            </div>

            {filteredFaqs.length === 0 ? (
              <div className="rounded-xl border border-[#e2e8e5] bg-white p-12 text-center">
                <HelpCircle size={36} className="mx-auto text-[#94a3b8]" />
                <h4 className="mt-3 text-sm font-bold text-[#0f172a]">No matching questions found</h4>
                <p className="mt-1 text-xs text-[#65717f]">
                  Try searching for keywords like "tanker", "KYC", "COA", "payout", or "demurrage", or post a direct ticket below.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFaqs.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div
                      key={idx}
                      className="overflow-hidden rounded-xl border border-[#e2e8e5] bg-white shadow-xs transition-colors"
                    >
                      <button
                        onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                        className="flex w-full items-center justify-between p-5 text-left font-semibold text-[#0f172a] hover:bg-[#fafbfb]"
                      >
                        <span className="text-sm sm:text-base pr-4 flex items-center gap-2.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#0b7a55]" />
                          {faq.q}
                        </span>
                        <ChevronDown
                          size={18}
                          className={`shrink-0 text-[#65717f] transition-transform ${
                            isOpen ? 'rotate-180 text-[#0b7a55]' : ''
                          }`}
                        />
                      </button>

                      {isOpen && (
                        <div className="border-t border-[#e2e8e5] bg-[#f8faf9] p-5 text-xs sm:text-sm text-[#4a5666] leading-relaxed">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Emergency Transit & Incident Support Desk */}
      <section className="bg-[#0f172a] py-12 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-red-500/20 px-3 py-1 text-xs font-mono font-bold text-red-300 mb-3">
                <AlertTriangle size={14} className="text-red-400" />
                <span>24/7 Road Transit & HazMat Emergency Protocol</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold">
                Urgent Tanker Transit or Offloading Assistance?
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-[#cbd5e1] leading-relaxed">
                If your driver is stranded at a factory gate, experiences an offloading coupling mismatch, or requires immediate emergency coordination, contact our live Gujarat corridor dispatch cell immediately.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-3">
                  <PhoneCall size={16} className="text-[#6ee7b7]" />
                  <div>
                    <div className="font-bold text-white">Emergency Desk Hotline</div>
                    <a href="tel:+912642240000" className="text-[#6ee7b7] font-mono hover:underline">
                      +91 2642 240000
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-[#6ee7b7]" />
                  <div>
                    <div className="font-bold text-white">HazMat Dispatch Email</div>
                    <span className="text-[#cbd5e1] font-mono">transit@ctech-trade.com</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock size={16} className="text-[#6ee7b7]" />
                  <div>
                    <div className="font-bold text-white">Coverage Window</div>
                    <span className="text-[#94a3b8]">24 Hours / 7 Days Live Support</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Support Ticket Submission Form */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Direct Desk Ticket"
            title="Submit an Operational Inquiry or Support Ticket"
            subtitle="Our trade desk officers and logistics coordinators respond within 60 minutes during market hours."
          />

          <div className="mt-10 rounded-2xl border border-[#e2e8e5] bg-white p-6 sm:p-10 shadow-xs">
            {ticketSubmitted ? (
              <div className="text-center py-8">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#e4f2ec] text-[#0b7a55]">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="mt-4 text-xl font-bold text-[#0f172a]">
                  Support Ticket Submitted Successfully
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-[#4a5666]">
                  Your inquiry has been assigned reference ID:{' '}
                  <span className="font-mono font-bold text-[#0b7a55]">{ticketId}</span>
                </p>
                <p className="mt-1 text-xs text-[#65717f]">
                  A dedicated C-Tech trade desk officer will contact you at {ticketForm.email} shortly.
                </p>

                <div className="mt-6 flex justify-center gap-3">
                  <button
                    onClick={() => {
                      setTicketSubmitted(false);
                      setTicketForm({
                        name: '',
                        company: '',
                        email: '',
                        phone: '',
                        category: 'RFQ & Spot Quote Assistance',
                        message: '',
                      });
                    }}
                    className="rounded-lg border border-[#e2e8e5] px-4 py-2 text-xs font-semibold text-[#1b2433] hover:bg-[#f8faf9]"
                  >
                    Submit Another Query
                  </button>
                  <button
                    onClick={() => requestRfq()}
                    className="rounded-lg bg-[#0b7a55] px-4 py-2 text-xs font-bold text-white hover:bg-[#08603f]"
                  >
                    Post Chemical RFQ
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleTicketSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#0f172a] mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={ticketForm.name}
                      onChange={(e) => setTicketForm({ ...ticketForm, name: e.target.value })}
                      placeholder="e.g. Rajesh Mehta"
                      className="w-full rounded-lg border border-[#d0ded7] px-3.5 py-2.5 text-xs text-[#1b2433] focus:border-[#0b7a55] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0f172a] mb-1">
                      Company / Plant Name
                    </label>
                    <input
                      type="text"
                      value={ticketForm.company}
                      onChange={(e) => setTicketForm({ ...ticketForm, company: e.target.value })}
                      placeholder="e.g. Gujarat Organics Ltd."
                      className="w-full rounded-lg border border-[#d0ded7] px-3.5 py-2.5 text-xs text-[#1b2433] focus:border-[#0b7a55] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#0f172a] mb-1">
                      Work Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={ticketForm.email}
                      onChange={(e) => setTicketForm({ ...ticketForm, email: e.target.value })}
                      placeholder="procurement@company.com"
                      className="w-full rounded-lg border border-[#d0ded7] px-3.5 py-2.5 text-xs text-[#1b2433] focus:border-[#0b7a55] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0f172a] mb-1">
                      Contact Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={ticketForm.phone}
                      onChange={(e) => setTicketForm({ ...ticketForm, phone: e.target.value })}
                      placeholder="+91 98250 XXXXX"
                      className="w-full rounded-lg border border-[#d0ded7] px-3.5 py-2.5 text-xs text-[#1b2433] focus:border-[#0b7a55] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0f172a] mb-1">
                    Inquiry Category
                  </label>
                  <select
                    value={ticketForm.category}
                    onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                    className="w-full rounded-lg border border-[#d0ded7] px-3.5 py-2.5 text-xs text-[#1b2433] focus:border-[#0b7a55] focus:outline-hidden"
                  >
                    <option>RFQ & Spot Quote Assistance</option>
                    <option>Tanker Transit & Demurrage Clarification</option>
                    <option>Quality / COA Lab Dispute</option>
                    <option>Invoicing, E-Way Bill & GST</option>
                    <option>Seller Payout & Bank Reconciliation</option>
                    <option>KYC Approval & Plant Verification</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0f172a] mb-1">
                    Message / Order Reference *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={ticketForm.message}
                    onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
                    placeholder="Provide details about your query, chemical lot, or order reference number..."
                    className="w-full rounded-lg border border-[#d0ded7] px-3.5 py-2.5 text-xs text-[#1b2433] focus:border-[#0b7a55] focus:outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-[#0b7a55] px-6 py-3 text-xs font-bold text-white shadow-xs hover:bg-[#08603f] transition-all"
                >
                  <Send size={14} />
                  <span>Submit Ticket to Trade Desk</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
