import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Lock,
  FileText,
  Layers,
  Factory,
  BarChart3,
  Database,
  Send,
  FileCheck2,
  Check,
  Users,
} from 'lucide-react';
import Header from '../../components/public/Header.jsx';
import Footer from '../../components/public/Footer.jsx';
import SectionHeading from '../../components/public/SectionHeading.jsx';
import {
  FadeUp,
  HoverLift,
  AnimatedCounter,
  HeroEntrance,
  HeroHeading,
  HeroText,
  HeroActions,
  HeroVisual,
  ScrollReveal,
} from '../../components/public/AnimationWrappers.jsx';

/* =========================================================================
   1. DATA DEFINITIONS
   ========================================================================= */

// Benefit Cards (Section 5)
const VALUE_BENEFITS = [
  {
    icon: Database,
    title: 'Product Discoverability',
    desc: 'Help enterprise buyers discover your catalog through standardized chemical names, CAS numbers, purity grades, and process applications.',
  },
  {
    icon: Layers,
    title: 'Technical Information',
    desc: 'Present purity, exact pharmacopeia / technical grade, form, packaging dimensions, and dispatch hubs in an unambiguous field structure.',
  },
  {
    icon: FileCheck2,
    title: 'Documentation',
    desc: 'Attach manufacturer batch Certificate of Analysis (COA), 16-section SDS, and technical data sheets directly to your active listings.',
  },
  {
    icon: Send,
    title: 'Direct Enquiries',
    desc: 'Receive verified, specification-linked RFQs directly from enterprise manufacturing plants ready for spot and frame contract fulfillment.',
  },
];

// 4-Step Process Timeline (Section 6)
const PROCESS_STEPS = [
  {
    num: '01',
    title: 'Buyer Finds Your Listing',
    desc: 'Buyers search by chemical name, CAS, grade, purity, application or commodity sector across verified national stock.',
  },
  {
    num: '02',
    title: 'Buyer Sends an RFQ',
    desc: 'The requirement is tightly bound to the precise product record, grade, and documentation they evaluated.',
  },
  {
    num: '03',
    title: 'Your Team Receives It',
    desc: 'Quantity, delivery destination context, packaging requirements, and timeline arrive in your supplier workspace.',
  },
  {
    num: '04',
    title: 'You Quote Directly',
    desc: 'Issue your price, lot availability, documents, and commercial terms while preserving your direct customer relationship.',
  },
];

// Assisted Sourcing Flow (Section 7)
const ASSISTED_SOURCING_STEPS = [
  { step: '1', title: 'Buyer Requirement Submission', desc: 'Buyer submits off-market or custom specification needs.' },
  { step: '2', title: 'Relevant Supplier Discovery', desc: 'Platform algorithms identify matching synthesis plants.' },
  { step: '3', title: 'Structured Requirement Details', desc: 'Exact purity, volume, and destination context are formatted.' },
  { step: '4', title: 'Supplier Enquiry Notification', desc: 'Alert reaches your desk with zero broker noise.' },
  { step: '5', title: 'Private Requirement Handling', desc: 'Commercial discussions proceed with institutional privacy.' },
];

// Buyer Network Categories (Section 8)
const BUYER_SECTORS = [
  { title: 'Manufacturing Companies', desc: 'Bulk synthesis, consumer goods, polymer & resins' },
  { title: 'Procurement Teams', desc: 'Institutional purchase heads & chemical sourcing leads' },
  { title: 'Chemical Traders', desc: 'Stockists, regional distributors & industrial traders' },
  { title: 'Industrial Buyers', desc: 'Pharma API plants, textile mills, dye houses, agrochemicals' },
  { title: 'Exporters', desc: 'International merchant exporters & overseas distributors' },
  { title: 'Distributors', desc: 'Bonded warehouse operators & bulk storage tank terminals' },
];

// Seller Listing Creation Steps (Section 11)
const CATALOG_CREATION_STEPS = [
  {
    step: '01',
    title: 'Choose the Right Path',
    desc: 'Select an existing CAS verified commodity or create a dedicated listing for your specialized formulation.',
  },
  {
    step: '02',
    title: 'Add the Technical Fit',
    desc: 'Specify lot purity, grade, physical form, appearance, and upload batch Certificate of Analysis (COA) and SDS.',
  },
  {
    step: '03',
    title: 'Add the Commercial Offer',
    desc: 'Set standard packaging (tanker, IBC, drums), minimum order quantity (MOQ), and dispatch warehouse location.',
  },
  {
    step: '04',
    title: 'Publish a Clear Offer',
    desc: 'Your listing becomes discoverable across relevant category pages and direct search queries by active industrial buyers.',
  },
];

// Seller Operating System Features (Section 12)
const SELLER_OS_FEATURES = [
  {
    id: '01',
    title: 'CATALOGUE',
    headline: 'Make your supply easy to evaluate.',
    desc: 'Put grade, purity, packaging, MOQ and compliance documents into one structured, buyer-ready record.',
    icon: Database,
  },
  {
    id: '02',
    title: 'RFQ CONTEXT',
    headline: 'Receive requirements with context.',
    desc: 'See the exact product, required volume, delivery plant location, and technical application before responding.',
    icon: Send,
  },
  {
    id: '03',
    title: 'STRUCTURED QUOTE',
    headline: 'Quote without rebuilding every response.',
    desc: 'Send unit rate, tanker availability, payment terms, and signed quotation PDFs from one professional desk.',
    icon: FileText,
  },
  {
    id: '04',
    title: 'PERFORMANCE INSIGHT',
    headline: 'Improve what buyers can see.',
    desc: 'Use buyer attention telemetry and response time analytics to identify high-demand chemical commodities.',
    icon: BarChart3,
  },
];

// Seller Benefits (Section 14)
const SELLER_BENEFITS = [
  {
    id: '01',
    title: 'Own the Relationship',
    desc: 'Buyer conversations come directly to your business. Your pricing, payment terms, and direct customer relationships remain completely yours.',
    icon: Users,
  },
  {
    id: '02',
    title: 'Built for Chemical Complexity',
    desc: 'Variants, purity grades, NABL documents, HazMat packaging, and CAS numbers are first-class fields — never buried in unstructured marketing copy.',
    icon: Layers,
  },
  {
    id: '03',
    title: 'Measure Before You Guess',
    desc: 'Use catalog visibility, search impression metrics, and buyer RFQ volume to determine which products and grades deserve production priority.',
    icon: BarChart3,
  },
];

// Seller FAQs (Section 15)
const SELLER_FAQS = [
  {
    q: 'Can I register my company for free?',
    a: 'Yes, basic seller registration and catalog setup on C-Tech are completely free. You can register your manufacturing plant or trading firm, upload your GSTIN, and create your initial chemical listings without upfront fees.',
  },
  {
    q: 'What does supplier verification mean?',
    a: 'Verification is an institutional compliance check where our compliance desk validates your corporate GSTIN, manufacturing/trading address, factory licenses (PCB consent where applicable), and authorized desk contacts to ensure buyer confidence.',
  },
  {
    q: 'Will the platform guarantee leads or orders?',
    a: 'No. C-Tech provides a high-intent industrial marketplace infrastructure and structured discovery. We do not make fabricated guarantees of lead volume or commercial orders. Volume depends on your material specifications, pricing, stock availability, and response speed.',
  },
  {
    q: 'How many products can I list?',
    a: 'Verified suppliers can list their complete product line across both CAS-identified chemicals and formulated specialty compounds with associated packaging and batch documentation.',
  },
  {
    q: 'Do I have to upload every product myself?',
    a: 'You can input listings individually via our supplier portal or utilize our assisted catalog setup where our chemical onboarding desk assists in structuring your inventory from your product sheets.',
  },
  {
    q: 'What happens when a buyer selects my product?',
    a: 'When a buyer issues an RFQ for your product, you receive an instant alert in your Supplier Workspace with the requested tonnage, delivery pincode, and target timeline. You can then review and issue a formal quotation directly.',
  },
  {
    q: 'What happens when a buyer requests an unlisted product?',
    a: 'Through our Assisted Sourcing pipeline, if a buyer seeks an intermediate or reagent not currently active on the catalog, matching verified producers in that category are notified privately to submit spot capacity offers.',
  },
  {
    q: 'Can I list formulated products without a single CAS number?',
    a: 'Yes. Formulated compounds, polyols, specialty waterproofing admixtures, and custom solvent blends can be listed under the Formulated Products schema, which focuses on brand, application, dosage, performance, and TDS.',
  },
  {
    q: 'What does Buyer Insights reveal?',
    a: 'Buyer Insights displays search telemetry, including how many buyers viewed your product specifications, search impressions by CAS number, and RFQ conversion rates compared to regional benchmarks.',
  },
  {
    q: 'Does the platform charge commission on orders?',
    a: 'Commercial terms depend on your supplier tier. Standard marketplace interactions operate with clear, transparent transaction fee models disclosed during onboarding, with zero hidden price markups.',
  },
  {
    q: 'Who owns the buyer relationship?',
    a: 'You own your customer relationship. Once an RFQ is matched and terms are finalized, you retain your direct commercial account and direct billing protocols.',
  },
  {
    q: 'Can traders, importers and distributors join?',
    a: 'Yes. In addition to primary synthesis chemical manufacturers, authorized distributors, stockists, port terminal operators, and verified importers are active participants on the platform.',
  },
  {
    q: 'What makes a supplier perform better on the platform?',
    a: 'Suppliers with 100% catalog profile completeness, attached manufacturer batch COAs, clear packaging specs, and prompt response times (< 60 minutes) consistently receive higher buyer RFQ engagement.',
  },
];

/* =========================================================================
   3. MAIN COMPONENT: BecomeSeller
   ========================================================================= */
export default function BecomeSeller() {
  // Listing Type Toggle (Section 10)
  const [activeListingTab, setActiveListingTab] = useState('cas'); // 'cas' | 'formulated'

  // FAQ Accordion State (Section 15)
  const [openFaq, setOpenFaq] = useState(0);

  // Newsletter State (Section 17)
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) return;
    setNewsletterSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#f8faf9] text-[#1b2433] selection:bg-[#0b7a55] selection:text-white font-sans antialiased">
      {/* Sticky Corporate Navigation Header */}
      <Header />

      {/* =========================================================================
         SECTION 1: HERO SECTION — BECOME COMPLETELY BUYER-READY
         Clean, sleek white background
         ========================================================================= */}
      <section className="relative bg-white border-b border-[#e2e8e5] text-[#1b2433] py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
          <HeroEntrance className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7">
              <HeroHeading>
                <span className="text-xs font-bold uppercase tracking-wider text-[#0b7a55] bg-[#e4f2ec] px-3.5 py-1 rounded-full inline-block mb-4 font-mono">
                  THE VERTICAL MARKETPLACE FOR CHEMICALS
                </span>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#0f172a] leading-[1.12]">
                  Become completely{' '}
                  <span className="text-[#0b7a55]">
                    buyer-ready.
                  </span>
                </h1>
                <p className="mt-4 text-xl sm:text-2xl font-bold text-[#334155]">
                  Get discovered. Receive better enquiries. Grow your chemical business.
                </p>
              </HeroHeading>

              <HeroText>
                <p className="mt-6 text-base sm:text-lg text-[#4a5666] leading-relaxed max-w-2xl font-normal">
                  Present structured products, receive clear requirements and respond with professional quotations — from one chemical-focused supplier workspace built around how industrial buyers actually make decisions.
                </p>

                {/* Three Trust Indicators */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-[#edf2ef]">
                  <div className="flex items-center gap-2 text-xs text-[#4a5666]">
                    <CheckCircle2 size={16} className="text-[#0b7a55] shrink-0" />
                    <span className="font-medium">Managed Catalogue Setup</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#4a5666]">
                    <CheckCircle2 size={16} className="text-[#0b7a55] shrink-0" />
                    <span className="font-medium">Specification-Based Listings</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#4a5666]">
                    <CheckCircle2 size={16} className="text-[#0b7a55] shrink-0" />
                    <span className="font-medium">Direct Buyer Enquiries</span>
                  </div>
                </div>
              </HeroText>

              {/* Action Buttons */}
              <HeroActions>
                <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  <Link
                    to="/register/seller"
                    className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#0b7a55] px-7 py-3.5 text-sm font-bold text-white shadow-md hover:bg-[#08603f] transition-all"
                  >
                    <span>Register Your Company</span>
                    <ArrowRight size={16} />
                  </Link>

                  <Link
                    to="/register/seller"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#d0ded7] bg-[#f8faf9] px-7 py-3.5 text-sm font-bold text-[#1b2433] hover:bg-white transition-all shadow-xs"
                  >
                    <span>Start Your Supplier Profile</span>
                  </Link>
                </div>

                <div className="mt-6 text-xs text-[#65717f] leading-relaxed flex items-center gap-2">
                  <span>Already listed?</span>
                  <Link to="/login" className="font-bold text-[#0b7a55] hover:underline">
                    Sign in to keep your products and information current &rarr;
                  </Link>
                </div>
              </HeroActions>
            </div>

            {/* Right Side: Realistic Clean Chemical Product Listing Preview */}
            <HeroVisual className="lg:col-span-5 relative">
              <div className="space-y-4">
                  {/* Card 1: Buyer Search Result View */}
                  <div className="rounded-2xl border border-[#e2e8e5] bg-white p-5 shadow-lg relative group hover:border-[#0b7a55]/40 transition-all">
                    <div className="flex items-center justify-between pb-3 border-b border-[#edf2ef] text-xs">
                      <span className="font-mono text-[10.5px] uppercase tracking-wider text-[#65717f]">
                        Buyer Search Result
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0b7a55] bg-[#e4f2ec] px-2 py-0.5 rounded-md">
                        <ShieldCheck size={13} />
                        Verified Business
                      </span>
                    </div>

                    <div className="mt-3 flex items-start justify-between">
                      <div>
                        <h4 className="text-lg font-bold text-[#0f172a]">Acetone · Pharma Grade</h4>
                        <div className="font-mono text-xs text-[#0b7a55] mt-0.5 font-bold">CAS: 67-64-1</div>
                      </div>
                      <span className="rounded bg-[#0b7a55] px-2.5 py-0.5 text-[11px] font-mono font-bold text-white">
                        Purity ≥ 99.5%
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-[11.5px] text-[#4a5666] bg-[#f8faf9] p-3 rounded-xl border border-[#e2e8e5]">
                      <div>Packaging: <strong className="text-[#0f172a]">160 kg drum</strong></div>
                      <div>Dispatch: <strong className="text-[#0f172a]">Ahmedabad, Gujarat</strong></div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs pt-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-[#65717f]">Documents:</span>
                        <div className="flex gap-1 font-mono text-[10px] font-bold text-[#0f172a]">
                          <span className="bg-[#f1f5f9] border border-[#e2e8e5] px-1.5 py-0.5 rounded">COA</span>
                          <span className="bg-[#f1f5f9] border border-[#e2e8e5] px-1.5 py-0.5 rounded">SDS</span>
                          <span className="bg-[#f1f5f9] border border-[#e2e8e5] px-1.5 py-0.5 rounded">TDS</span>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-[#0b7a55]">
                        Status: Ready for RFQ
                      </span>
                    </div>
                  </div>

                  {/* Card 2: Technical Product Record */}
                  <div className="rounded-2xl border border-[#e2e8e5] bg-[#f8faf9] p-5 shadow-md relative ml-3 sm:ml-6 text-xs space-y-2.5">
                    <div className="flex items-center justify-between text-[#65717f] font-mono text-[10px] uppercase">
                      <span>Technical Specification Record</span>
                      <span className="text-[#0b7a55] font-bold">Direct Producer Allocation</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[#0f172a] text-sm">ACETONE</span>
                      <span className="font-mono text-[#65717f]">CAS No. 67-64-1</span>
                    </div>

                    <div className="space-y-1 text-[#4a5666] text-[11.5px] border-t border-[#edf2ef] pt-2">
                      <div className="flex justify-between">
                        <span className="text-[#65717f]">Grade:</span>
                        <span className="font-medium text-[#0f172a]">Pharma / IP</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#65717f]">Purity:</span>
                        <span className="font-mono font-bold text-[#0b7a55]">≥ 99.5%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#65717f]">Packaging:</span>
                        <span className="text-[#0f172a]">160 kg drum</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#65717f]">Dispatch:</span>
                        <span className="text-[#0f172a]">Ahmedabad, Gujarat</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#edf2ef] flex items-center justify-between text-[11px]">
                      <span className="text-[#65717f]">Documents attached:</span>
                      <span className="font-mono font-bold text-[#0b7a55]">COA / SDS / TDS</span>
                    </div>
                  </div>
                </div>
            </HeroVisual>
          </HeroEntrance>
        </div>
      </section>

      {/* =========================================================================
         SECTION 2: SELLER VALUE PROPOSITION ("Always buyer-ready.")
         ========================================================================= */}
      <section className="py-20 sm:py-28 bg-white border-b border-[#e2e8e5]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="A complete, buyer-ready supplier record."
            subtitle="When your chemical catalog presents clean specifications, validated purity grades, and NABL-audited batch documents, industrial procurement teams can evaluate and issue serious RFQs immediately without back-and-forth friction."
          />

          {/* 4 Benefit Cards */}
          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7">
            {VALUE_BENEFITS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <ScrollReveal key={idx} delay={idx * 0.1} direction="up" className="h-full">
                  <HoverLift className="h-full">
                    <div className="flex flex-col justify-between h-full rounded-2xl border border-[#e2e8e5] bg-[#f8faf9] p-7 hover:bg-white hover:border-[#0b7a55]/40 transition-all shadow-xs group">
                      <div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e4f2ec] text-[#0b7a55] group-hover:bg-[#0b7a55] group-hover:text-white transition-colors duration-300 mb-6">
                          <Icon size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-[#0f172a] mb-2.5">
                          {item.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-[#4a5666] leading-relaxed">
                          {item.desc}
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-[#edf2ef] flex items-center gap-1.5 text-xs font-semibold text-[#0b7a55]">
                        <CheckCircle2 size={14} />
                        <span>Standardized Field Architecture</span>
                      </div>
                    </div>
                  </HoverLift>
                </ScrollReveal>
              );
            })}
          </div>

          {/* Visual Statistic Panel */}
          <FadeUp delay={0.2}>
            <div className="mt-16 rounded-3xl border border-[#e2e8e5] bg-[#f8faf9] text-[#0f172a] p-8 sm:p-10 shadow-xs relative overflow-hidden">
              <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-8">
                <div>
                  <div className="text-3xl sm:text-4xl font-extrabold text-[#0b7a55]">
                    <AnimatedCounter target={94} suffix="%" />
                  </div>
                  <div className="mt-2 text-xs font-bold text-[#0f172a]">Catalogue Discoverability</div>
                  <div className="text-[11px] text-[#65717f] mt-0.5">Matched by CAS & grade filters</div>
                </div>

                <div>
                  <div className="text-3xl sm:text-4xl font-extrabold text-[#0b7a55]">
                    <AnimatedCounter target={98} suffix="%" />
                  </div>
                  <div className="mt-2 text-xs font-bold text-[#0f172a]">Profile Completeness</div>
                  <div className="text-[11px] text-[#65717f] mt-0.5">Specifications & batch documents</div>
                </div>

                <div>
                  <div className="text-3xl sm:text-4xl font-extrabold text-[#0f172a]">
                    <AnimatedCounter target={3.4} suffix="x" />
                  </div>
                  <div className="mt-2 text-xs font-bold text-[#0f172a]">Higher RFQ Activity</div>
                  <div className="text-[11px] text-[#65717f] mt-0.5">Versus unstructured listings</div>
                </div>

                <div>
                  <div className="text-3xl sm:text-4xl font-extrabold text-[#0b7a55]">
                    &lt; <AnimatedCounter target={45} suffix=" min" />
                  </div>
                  <div className="mt-2 text-xs font-bold text-[#0f172a]">Supplier Response Speed</div>
                  <div className="text-[11px] text-[#65717f] mt-0.5">Instant quotation workflow</div>
                </div>
              </div>

              <div className="relative z-10 mt-6 pt-4 border-t border-[#edf2ef] text-[11px] text-[#65717f] text-center">
                * Note: Figures represent illustrative platform performance benchmarks for verified supplier catalogs.
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* =========================================================================
         SECTION 3: HOW BUYER DEMAND REACHES SUPPLY
         ========================================================================= */}
      <section className="py-20 sm:py-28 bg-[#f8faf9] border-b border-[#e2e8e5]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="How demand reaches supply."
            subtitle="A buyer-ready listing creates a direct route to your team. Clear specifications eliminate preliminary enquiries and convert directly into actionable quotation requests."
          />

          {/* Horizontal Process Timeline */}
          <div className="mt-16 relative">
            <div className="hidden lg:block absolute top-10 left-[6%] right-[6%] h-1 bg-[#e2e8e5] z-0">
              <div className="h-full bg-gradient-to-r from-[#0b7a55] via-[#10b981] to-[#34d399]" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
              {PROCESS_STEPS.map((st, idx) => (
                <FadeUp key={idx} delay={idx * 0.12}>
                  <div className="flex flex-col h-full rounded-2xl border border-[#e2e8e5] bg-white p-6 shadow-xs hover:border-[#0b7a55] transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0b7a55] text-white font-mono font-extrabold text-sm shadow-md">
                        {st.num}
                      </div>
                      <span className="font-mono text-[10.5px] font-bold text-[#0b7a55] bg-[#e4f2ec] px-2.5 py-0.5 rounded-full">
                        Step {st.num}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-[#0f172a] mb-2">{st.title}</h3>
                    <p className="text-xs sm:text-sm text-[#4a5666] leading-relaxed flex-1">
                      {st.desc}
                    </p>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>

          <div className="mt-12 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#0b7a55]/20 bg-[#e4f2ec] px-4 py-1.5 text-xs font-bold text-[#0b7a55]">
              <ShieldCheck size={15} />
              <span>Your commercial relationship remains yours. Direct invoicing and buyer communication.</span>
            </span>
          </div>
        </div>
      </section>

      {/* =========================================================================
         SECTION 4: ASSISTED SOURCING
         ========================================================================= */}
      <section className="py-20 sm:py-28 bg-white border-b border-[#e2e8e5]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#0b7a55] bg-[#e4f2ec] px-3.5 py-1 rounded-full inline-block mb-3">
              WHEN THE EXACT PRODUCT IS NOT LISTED
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0f172a]">
              Assisted sourcing keeps the buyer moving.
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#4a5666] leading-relaxed">
              When a buyer’s exact requirement does not match an existing catalogue listing, our assisted sourcing desk bridges the requirement directly to relevant licensed synthesis plants.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {ASSISTED_SOURCING_STEPS.map((step, idx) => (
              <ScrollReveal key={idx} delay={idx * 0.08} direction="up" className="h-full">
                <div
                  className="rounded-2xl border border-[#e2e8e5] bg-[#f8faf9] p-5 flex flex-col justify-between group hover:border-[#0b7a55]/40 hover:bg-white transition-all shadow-xs h-full"
                >
                  <div>
                    <div className="font-mono text-xs font-bold text-[#0b7a55] mb-2">STAGE {step.step}</div>
                    <h4 className="text-sm font-bold text-[#0f172a] mb-1.5">{step.title}</h4>
                    <p className="text-xs text-[#52525b] leading-relaxed">{step.desc}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#edf2ef] text-[10.5px] font-semibold text-[#0b7a55] flex items-center gap-1">
                    <Check size={12} />
                    <span>Institutional Handshake</span>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <div className="mt-10 rounded-2xl bg-[#edf2ef]/60 p-5 border border-[#d0ded7] text-xs text-[#4a5666] max-w-2xl mx-auto text-center leading-relaxed">
            <strong>Clear Distinction:</strong> Normal product-linked RFQs attach directly to your listed inventory. Assisted Sourcing routes unlisted, custom synthesis, or specialized lot inquiries directly to verified category producers.
          </div>
        </div>
      </section>

      {/* =========================================================================
         SECTION 5: BUYER NETWORK SECTION
         ========================================================================= */}
      <section className="py-20 sm:py-28 bg-[#f8faf9] border-b border-[#e2e8e5]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Buyer organisations are looking for the right supply partners."
            subtitle="Create a professional supplier presence so enterprise procurement teams and manufacturing plants can evaluate your capacity and issue formal quotation requests."
          />

          <div className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {BUYER_SECTORS.map((cat, idx) => (
              <ScrollReveal key={idx} delay={idx * 0.08} direction="up" className="h-full">
                <div
                  className="rounded-2xl border border-[#e2e8e5] bg-white p-5 text-center shadow-xs hover:border-[#0b7a55]/40 transition-all flex flex-col justify-center h-full"
                >
                  <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-xl bg-[#e4f2ec] text-[#0b7a55] mb-3">
                    <Factory size={20} />
                  </div>
                  <h4 className="text-xs font-bold text-[#0f172a]">{cat.title}</h4>
                  <p className="text-[11px] text-[#65717f] mt-1 line-clamp-2">{cat.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <div className="mt-10 text-center text-xs text-[#65717f] flex items-center justify-center gap-2">
            <Lock size={14} className="text-[#0b7a55]" />
            <span>Buyer requirement details remain private until a supplier is confirmed relevant to the enquiry.</span>
          </div>
        </div>
      </section>

      {/* =========================================================================
         SECTION 6: WHY STRUCTURED PRODUCT LISTINGS MATTER
         2-Column Interactive Comparison: Old Way vs Buyer-Ready Record
         ========================================================================= */}
      <section className="py-20 sm:py-28 bg-white border-b border-[#e2e8e5]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="A buyer cannot compare what your listing does not structure."
            subtitle="Opaque classifieds and paragraph sales copy force buyers into endless telephone verification. Structured chemical records provide instant clarity that earns commercial trust."
          />

          <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: The Old Way */}
            <ScrollReveal direction="up" delay={0.1} className="h-full">
              <div className="h-full rounded-3xl border border-red-200 bg-red-50/20 p-8 shadow-xs">
                <div className="flex items-center justify-between pb-4 border-b border-red-200">
                  <span className="font-mono text-xs font-bold text-red-700 uppercase tracking-wider">
                    Typical Online Listing (The Old Way)
                  </span>
                  <span className="text-xs font-semibold text-red-600 bg-red-100 px-2.5 py-0.5 rounded-full">
                    Unstructured Copy
                  </span>
                </div>

                <div className="mt-6 rounded-2xl bg-white p-6 border border-red-200 shadow-xs space-y-3">
                  <div className="text-xs font-bold text-[#94a3b8]">ABC CHEMICAL TRADERS</div>
                  <h4 className="text-lg font-bold text-[#0f172a]">&ldquo;Acetone Supplier — Best Price Guarantee&rdquo;</h4>
                  <p className="text-xs text-[#52525b] leading-relaxed">
                    &ldquo;Acetone, pharma grade, 99.5% purity. Available in drums. Ready stock for immediate dispatch. Contact us via phone or WhatsApp for best rates and more details.&rdquo;
                  </p>
                  <div className="text-[11px] text-[#65717f] italic border-t border-gray-100 pt-2">
                    No batch COA attached · No CAS number indexed · Dispatch origin ambiguous
                  </div>
                </div>

                <div className="mt-6 space-y-2 text-xs text-[#52525b]">
                  <div className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">✕</span>
                    <span>Critical specifications buried in marketing sales copy.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">✕</span>
                    <span>No standardized field schema for purity, formula, or hazard class.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">✕</span>
                    <span>Documents must be chased through multiple WhatsApp threads.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">✕</span>
                    <span>Buyers must reconfirm basic logistics details before quoting.</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Right: Buyer-Ready Record */}
            <ScrollReveal direction="up" delay={0.2} className="h-full">
              <div className="h-full rounded-3xl border border-[#0b7a55]/30 bg-[#e4f2ec]/30 p-8 shadow-sm">
                <div className="flex items-center justify-between pb-4 border-b border-[#0b7a55]/20">
                  <span className="font-mono text-xs font-bold text-[#0b7a55] uppercase tracking-wider">
                    Professional Supplier Listing (Buyer-Ready Record)
                  </span>
                  <span className="text-xs font-bold text-[#0b7a55] bg-[#e4f2ec] px-2.5 py-0.5 rounded-full border border-[#0b7a55]/30">
                    Specification-First
                  </span>
                </div>

                <div className="mt-6 rounded-2xl bg-white p-6 border border-[#0b7a55]/30 shadow-md space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-lg font-extrabold text-[#0f172a]">Acetone</h4>
                    <span className="font-mono text-xs font-bold text-[#0b7a55] bg-[#e4f2ec] px-2 py-0.5 rounded">
                      CAS: 67-64-1
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-[#4a5666] pt-2 border-t border-[#edf2ef]">
                    <div>Purity: <strong className="text-[#0f172a]">≥ 99.5%</strong></div>
                    <div>Grade: <strong className="text-[#0f172a]">IP / Pharma</strong></div>
                    <div>Pack Size: <strong className="text-[#0f172a]">160 kg drum</strong></div>
                    <div>Region: <strong className="text-[#0f172a]">Pan India</strong></div>
                    <div>Origin: <strong className="text-[#0f172a]">India (Dahej)</strong></div>
                    <div>Seller: <strong className="text-[#0b7a55]">Manufacturer</strong></div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#edf2ef] text-xs">
                    <span className="text-[#65717f]">Documents:</span>
                    <span className="font-mono font-bold text-[#0b7a55]">COA · SDS · TDS Ready</span>
                  </div>
                </div>

                <div className="mt-6 space-y-2 text-xs text-[#0f172a]">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 size={15} className="text-[#0b7a55] shrink-0 mt-0.5" />
                    <span>Searchable by exact CAS number, grade, and application.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 size={15} className="text-[#0b7a55] shrink-0 mt-0.5" />
                    <span>Ready for instant, structured RFQ dispatch without preliminary calls.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 size={15} className="text-[#0b7a55] shrink-0 mt-0.5" />
                    <span>Enterprise procurement heads can verify technical fit in 30 seconds.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 size={15} className="text-[#0b7a55] shrink-0 mt-0.5" />
                    <span>Elevates your facility as an institutional, tier-1 chemical partner.</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* =========================================================================
         SECTION 7: DIFFERENT PRODUCT LISTING TYPES (CAS vs Formulated)
         ========================================================================= */}
      <section className="py-20 sm:py-28 bg-[#f8faf9] border-b border-[#e2e8e5]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Built for both sides of the chemical industry."
            subtitle="A CAS chemical and a formulated specialty product should never use the same listing form. C-Tech structures each according to how buyers evaluate them."
          />

          {/* Tab Selector */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex rounded-xl bg-white p-1.5 border border-[#d0ded7] shadow-xs">
              <button
                onClick={() => setActiveListingTab('cas')}
                className={`rounded-lg px-6 py-2.5 text-xs font-bold transition-all ${
                  activeListingTab === 'cas'
                    ? 'bg-[#0b7a55] text-white shadow-xs'
                    : 'text-[#4a5666] hover:text-[#0f172a]'
                }`}
              >
                Card A — CAS Chemicals
              </button>
              <button
                onClick={() => setActiveListingTab('formulated')}
                className={`rounded-lg px-6 py-2.5 text-xs font-bold transition-all ${
                  activeListingTab === 'formulated'
                    ? 'bg-[#0b7a55] text-white shadow-xs'
                    : 'text-[#4a5666] hover:text-[#0f172a]'
                }`}
              >
                Card B — Formulated Products
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* CARD A — CAS CHEMICALS */}
            <div
              className={`rounded-3xl border p-8 transition-all ${
                activeListingTab === 'cas'
                  ? 'border-[#0b7a55] bg-white shadow-xl ring-2 ring-[#0b7a55]/20'
                  : 'border-[#e2e8e5] bg-white/70 opacity-90'
              }`}
            >
              <div className="flex items-center justify-between pb-4 border-b border-[#edf2ef]">
                <div>
                  <span className="font-mono text-xs font-bold text-[#0b7a55] uppercase">CARD A — CAS CHEMICALS</span>
                  <h3 className="text-xl font-bold text-[#0f172a] mt-1">Exact identity. Exact variant.</h3>
                </div>
                <span className="rounded-full bg-[#e4f2ec] px-3 py-1 text-xs font-bold text-[#0b7a55]">
                  Commodity Schema
                </span>
              </div>

              <p className="mt-4 text-xs sm:text-sm text-[#4a5666] leading-relaxed">
                Buyers shortlist the precise material they need before sending the requirement. Focuses on CAS identity, grade, formula, and physical parameters.
              </p>

              {/* Sample Product Record */}
              <div className="mt-6 rounded-2xl bg-[#f8faf9] p-5 border border-[#e2e8e5] space-y-2 text-xs">
                <div className="flex justify-between items-center font-bold text-[#0f172a]">
                  <span>Acetone</span>
                  <span className="font-mono text-[#0b7a55]">CAS: 67-64-1</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[#52525b]">
                  <div>Purity: <strong className="text-[#0f172a]">≥ 99.5%</strong></div>
                  <div>Grade: <strong className="text-[#0f172a]">Pharma</strong></div>
                  <div>Pack: <strong className="text-[#0f172a]">160 kg drum</strong></div>
                  <div>Origin: <strong className="text-[#0f172a]">India</strong></div>
                  <div>Stock: <strong className="text-[#0b7a55]">Available</strong></div>
                  <div>Dispatch: <strong className="text-[#0f172a]">Ahmedabad</strong></div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#edf2ef]">
                <h5 className="text-xs font-bold text-[#0f172a] mb-2 uppercase tracking-wider font-mono">
                  Technical Listing Fields:
                </h5>
                <div className="flex flex-wrap gap-2">
                  {['CAS identity', 'Grade & purity', 'Physical form', 'Origin', 'Packaging & MOQ', 'COA, SDS and TDS'].map((f, i) => (
                    <span key={i} className="rounded-lg bg-[#e4f2ec] px-2.5 py-1 text-[11px] font-semibold text-[#0b7a55]">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* CARD B — FORMULATED PRODUCTS */}
            <div
              className={`rounded-3xl border p-8 transition-all ${
                activeListingTab === 'formulated'
                  ? 'border-[#0b7a55] bg-white shadow-xl ring-2 ring-[#0b7a55]/20'
                  : 'border-[#e2e8e5] bg-white/70 opacity-90'
              }`}
            >
              <div className="flex items-center justify-between pb-4 border-b border-[#edf2ef]">
                <div>
                  <span className="font-mono text-xs font-bold text-[#0b7a55] uppercase">CARD B — FORMULATED PRODUCTS</span>
                  <h3 className="text-xl font-bold text-[#0f172a] mt-1">Application. Performance. Fit.</h3>
                </div>
                <span className="rounded-full bg-[#f1f5f9] px-3 py-1 text-xs font-bold text-[#475569]">
                  Performance Schema
                </span>
              </div>

              <p className="mt-4 text-xs sm:text-sm text-[#4a5666] leading-relaxed">
                Buyers understand where the formulation fits, how it performs and what supports it. Focuses on application guidelines, dosage, and technical field data.
              </p>

              {/* Sample Product Record */}
              <div className="mt-6 rounded-2xl bg-[#f8faf9] p-5 border border-[#e2e8e5] space-y-2 text-xs">
                <div className="flex justify-between items-center font-bold text-[#0f172a]">
                  <span>CT-Solv D-40</span>
                  <span className="font-mono text-xs text-[#0b7a55]">High-Flash Hydrocarbon Blend</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[#52525b]">
                  <div>Application: <strong className="text-[#0f172a]">Industrial Degreasing</strong></div>
                  <div>Flash Point: <strong className="text-[#0f172a]">≥ 40°C</strong></div>
                  <div>Packaging: <strong className="text-[#0f172a]">210 L MS Drum</strong></div>
                  <div>Supply: <strong className="text-[#0f172a]">Pan India (Dahej/Taloja)</strong></div>
                  <div>Form: <strong className="text-[#0f172a]">Clear Liquid</strong></div>
                  <div>Lead Time: <strong className="text-[#0b7a55]">Immediate Dispatch</strong></div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#edf2ef]">
                <h5 className="text-xs font-bold text-[#0f172a] mb-2 uppercase tracking-wider font-mono">
                  Performance Listing Fields:
                </h5>
                <div className="flex flex-wrap gap-2">
                  {['Brand & model', 'Application', 'Performance specs', 'Packaging & MOQ', 'Stock & lead time', 'TDS & brochure'].map((f, i) => (
                    <span key={i} className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
         SECTION 8: HOW TO BUILD YOUR SELLER LISTING (4 Steps + Creation Mockup)
         ========================================================================= */}
      <section className="py-20 sm:py-28 bg-white border-b border-[#e2e8e5]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Make your catalogue buyer-ready."
            subtitle="Choose the right product path, then add the technical and commercial information buyers need to assess your supply."
          />

          <div className="mt-14 grid grid-cols-1 md:grid-cols-4 gap-6">
            {CATALOG_CREATION_STEPS.map((step, idx) => (
              <ScrollReveal key={idx} delay={idx * 0.1} direction="up" className="h-full">
                <div className="rounded-2xl border border-[#e2e8e5] bg-[#f8faf9] p-6 shadow-xs h-full flex flex-col justify-between">
                  <div>
                    <div className="font-mono text-xs font-bold text-[#0b7a55] mb-2">{step.step}</div>
                    <h4 className="text-base font-bold text-[#0f172a] mb-2">{step.title}</h4>
                    <p className="text-xs text-[#52525b] leading-relaxed">{step.desc}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#edf2ef] text-[10.5px] font-semibold text-[#0b7a55]">
                    Step {step.step} Protocol
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Large Visual Preview of Seller Product Creation Interface */}
          <FadeUp delay={0.2}>
            <div className="mt-14 rounded-3xl border border-[#dbe1de] bg-white shadow-xl overflow-hidden">
              <div className="bg-[#0f172a] px-6 py-4 border-b border-white/10 flex items-center justify-between text-white text-xs">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-red-500/80" />
                    <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
                    <span className="h-3 w-3 rounded-full bg-green-500/80" />
                  </div>
                  <span className="font-mono font-bold text-white/90 ml-3">Seller Workspace &bull; Add New Chemical Listing</span>
                </div>
                <span className="text-xs text-[#6ee7b7] font-semibold">Specification-First Protocol</span>
              </div>

              <div className="p-8 sm:p-10 bg-[#f8faf9]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
                  <div>
                    <label className="block font-bold text-[#0f172a] mb-1">Product Name</label>
                    <input readOnly value="Acetone" className="w-full rounded-xl border border-[#d0ded7] bg-white px-3.5 py-2.5 font-medium text-[#0f172a]" />
                  </div>
                  <div>
                    <label className="block font-bold text-[#0f172a] mb-1">CAS Number</label>
                    <input readOnly value="67-64-1" className="w-full rounded-xl border border-[#d0ded7] bg-white px-3.5 py-2.5 font-mono text-[#0b7a55] font-bold" />
                  </div>
                  <div>
                    <label className="block font-bold text-[#0f172a] mb-1">Category</label>
                    <input readOnly value="Industrial Solvents / Ketones" className="w-full rounded-xl border border-[#d0ded7] bg-white px-3.5 py-2.5 text-[#0f172a]" />
                  </div>

                  <div>
                    <label className="block font-bold text-[#0f172a] mb-1">Grade</label>
                    <input readOnly value="Pharma / Pure Synthetic Grade" className="w-full rounded-xl border border-[#d0ded7] bg-white px-3.5 py-2.5 text-[#0f172a]" />
                  </div>
                  <div>
                    <label className="block font-bold text-[#0f172a] mb-1">Purity</label>
                    <input readOnly value="≥ 99.5% min" className="w-full rounded-xl border border-[#d0ded7] bg-white px-3.5 py-2.5 font-mono font-bold text-[#0f172a]" />
                  </div>
                  <div>
                    <label className="block font-bold text-[#0f172a] mb-1">Physical Form</label>
                    <input readOnly value="Clear Liquid" className="w-full rounded-xl border border-[#d0ded7] bg-white px-3.5 py-2.5 text-[#0f172a]" />
                  </div>

                  <div>
                    <label className="block font-bold text-[#0f172a] mb-1">Packaging Standard</label>
                    <input readOnly value="160 kg MS Drum / Road Tanker" className="w-full rounded-xl border border-[#d0ded7] bg-white px-3.5 py-2.5 text-[#0f172a]" />
                  </div>
                  <div>
                    <label className="block font-bold text-[#0f172a] mb-1">Minimum Order (MOQ)</label>
                    <input readOnly value="5,000 kg" className="w-full rounded-xl border border-[#d0ded7] bg-white px-3.5 py-2.5 font-mono text-[#0b7a55]" />
                  </div>
                  <div>
                    <label className="block font-bold text-[#0f172a] mb-1">Dispatch Hub</label>
                    <input readOnly value="Dahej PCPIR Corridor, Gujarat" className="w-full rounded-xl border border-[#d0ded7] bg-white px-3.5 py-2.5 text-[#0f172a]" />
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-[#e2e8e5] flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-bold text-[#0f172a]">Uploaded Compliance Documents:</span>
                    <span className="rounded bg-[#e4f2ec] px-2.5 py-1 text-xs font-mono font-bold text-[#0b7a55]">Batch COA</span>
                    <span className="rounded bg-[#e4f2ec] px-2.5 py-1 text-xs font-mono font-bold text-[#0b7a55]">16-Part SDS</span>
                    <span className="rounded bg-[#e4f2ec] px-2.5 py-1 text-xs font-mono font-bold text-[#0b7a55]">TDS</span>
                  </div>

                  <span className="rounded-xl bg-[#0b7a55] px-5 py-2 text-xs font-bold text-white shadow-xs">
                    Listing Validated & Ready
                  </span>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* =========================================================================
         SECTION 9: SELLER OPERATING SYSTEM
         ========================================================================= */}
      <section className="py-20 sm:py-28 bg-[#f8faf9] border-b border-[#e2e8e5]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#0b7a55] bg-[#e4f2ec] px-3.5 py-1 rounded-full inline-block mb-3">
              SELLER OPERATING SYSTEM
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0f172a]">
              From buyer-ready catalogue to direct quote.
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#4a5666] leading-relaxed">
              Keep product data, RFQ context, commercial responses and performance insight in one structured workspace built for chemical procurement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7">
            {SELLER_OS_FEATURES.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <ScrollReveal key={feat.id} delay={idx * 0.1} direction="up" className="h-full">
                  <HoverLift className="h-full">
                    <div className="flex flex-col justify-between h-full rounded-2xl border border-[#e2e8e5] bg-white p-7 hover:border-[#0b7a55]/40 transition-all shadow-xs group">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e4f2ec] text-[#0b7a55] group-hover:bg-[#0b7a55] group-hover:text-white transition-colors">
                            <Icon size={22} />
                          </div>
                          <span className="font-mono text-xs font-extrabold text-[#65717f]">{feat.id}</span>
                        </div>

                        <div className="font-mono text-[11px] font-bold text-[#0b7a55] uppercase tracking-wider mb-1">
                          {feat.title}
                        </div>
                        <h4 className="text-base font-bold text-[#0f172a] mb-2">{feat.headline}</h4>
                        <p className="text-xs text-[#4a5666] leading-relaxed">{feat.desc}</p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-[#edf2ef] text-xs font-bold text-[#0b7a55] flex items-center gap-1">
                        <span>Configured in Workspace</span>
                        <ChevronRight size={14} />
                      </div>
                    </div>
                  </HoverLift>
                </ScrollReveal>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/seller"
              className="inline-flex items-center gap-2 rounded-xl bg-[#0b7a55] px-7 py-3.5 text-sm font-bold text-white shadow-md hover:bg-[#08603f] transition-all"
            >
              <span>Explore the Supplier Workspace</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>



      {/* =========================================================================
         SECTION 11: SELLER BENEFITS (3 Large Cards)
         ========================================================================= */}
      <section className="py-20 sm:py-28 bg-white border-b border-[#e2e8e5]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Engineered for Chemical Manufacturers & Licensed Traders"
            subtitle="C-Tech bridges physical chemical assets with enterprise industrial demand without intermediary price leakage."
          />

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
            {SELLER_BENEFITS.map((b, idx) => {
              const Icon = b.icon;
              return (
                <ScrollReveal key={b.id} delay={idx * 0.1} direction="up" className="h-full">
                  <HoverLift className="h-full">
                    <div className="flex flex-col justify-between h-full rounded-2xl border border-[#e2e8e5] bg-[#f8faf9] p-8 hover:bg-white hover:border-[#0b7a55]/40 transition-all shadow-xs group">
                      <div>
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e4f2ec] text-[#0b7a55] group-hover:bg-[#0b7a55] group-hover:text-white transition-colors duration-300">
                            <Icon size={24} />
                          </div>
                          <span className="font-mono text-xs font-bold text-[#0b7a55] bg-white px-2.5 py-1 rounded-md border border-[#e2e8e5]">
                            Benefit {b.id}
                          </span>
                        </div>

                        <h3 className="text-xl font-bold text-[#0f172a] mb-3">{b.title}</h3>
                        <p className="text-sm text-[#4a5666] leading-relaxed">{b.desc}</p>
                      </div>

                      <div className="mt-8 pt-4 border-t border-[#edf2ef] flex items-center gap-1.5 text-xs font-semibold text-[#0b7a55]">
                        <CheckCircle2 size={14} />
                        <span>Direct Enterprise Account Protocol</span>
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
         SECTION 13: SELLER FAQ SECTION (Accordion)
         ========================================================================= */}
      <section className="py-20 sm:py-28 bg-white border-b border-[#e2e8e5]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Questions a serious supplier should ask."
            subtitle="Clear, honest answers regarding pricing discretion, order matching, document requirements, and verification protocols."
          />

          <div className="mt-12 space-y-3">
            {SELLER_FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-[#e2e8e5] bg-[#f8faf9] overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                  className="flex w-full items-center justify-between p-5 text-left text-sm font-bold text-[#0f172a] hover:text-[#0b7a55]"
                >
                  <span className="pr-4">{faq.q}</span>
                  <ChevronDown
                    size={18}
                    className={`shrink-0 text-[#0b7a55] transition-transform duration-200 ${
                      openFaq === idx ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-[#4a5666] leading-relaxed border-t border-[#e2e8e5] pt-3 bg-white">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
         SECTION 14: FINAL CONVERSION SECTION
         Clean, sleek white background
         ========================================================================= */}
      <section className="py-20 sm:py-24 bg-white border-b border-[#e2e8e5] text-[#0f172a]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <FadeUp>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#0b7a55] bg-[#e4f2ec] px-3.5 py-1 rounded-full inline-block mb-4">
              READY TO GROW YOUR BUSINESS?
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#0f172a] leading-tight">
              Your next buyer should see a supplier ready to do business.
            </h2>
            <p className="mt-4 text-sm sm:text-base text-[#4a5666] max-w-2xl mx-auto leading-relaxed">
              Launch with a professionally structured catalogue, respond through a serious quotation workflow and improve using buyer activity.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/register/seller"
                className="rounded-xl bg-[#0b7a55] px-8 py-3.5 text-sm font-bold text-white shadow-md hover:bg-[#08603f] transition-all flex items-center gap-2"
              >
                <span>Register Your Company</span>
                <ArrowRight size={16} />
              </Link>

              <Link
                to="/seller"
                className="rounded-xl border border-[#d0ded7] bg-[#f8faf9] px-8 py-3.5 text-sm font-bold text-[#1b2433] hover:bg-white transition-all shadow-xs"
              >
                <span>Explore Supplier Workspace</span>
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap justify-center gap-8 text-xs text-[#65717f] border-t border-[#edf2ef] pt-6">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-[#0b7a55]" />
                Structured Catalogue
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-[#0b7a55]" />
                Product Discoverability
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-[#0b7a55]" />
                Direct Buyer Enquiries
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-[#0b7a55]" />
                Professional Quotations
              </span>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* =========================================================================
         SECTION 15: NEWSLETTER SUBSCRIPTION SECTION
         ========================================================================= */}
      <section className="py-16 bg-[#f8faf9] text-[#0f172a] border-b border-[#e2e8e5]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0f172a]">
              Chemical industry forecasts &amp; sourcing guides, in your inbox.
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-[#4a5666]">
              Sector outlooks and procurement trends — sent only when we publish.
            </p>

            {newsletterSubmitted ? (
              <div className="mt-6 rounded-xl bg-[#e4f2ec] p-4 border border-[#0b7a55]/20 text-xs font-bold text-[#0b7a55]">
                ✓ Thank you. You are subscribed to C-Tech Chemical Market Intelligence.
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="mt-6 flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter corporate email address"
                  className="flex-1 rounded-xl border border-[#d0ded7] bg-white px-4 py-3 text-xs text-[#1b2433] placeholder-gray-400 focus:border-[#0b7a55] focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-[#0b7a55] px-6 py-3 text-xs font-bold text-white hover:bg-[#08603f] transition-all shadow-xs"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
