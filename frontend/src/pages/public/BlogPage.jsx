import { useState } from 'react';
import {
  FileText,
  Clock,
  ArrowRight,
  Search,
  X,
} from 'lucide-react';
import Header from '../../components/public/Header.jsx';
import Footer from '../../components/public/Footer.jsx';
import {
  HoverLift,
  HeroEntrance,
  HeroHeading,
  HeroText,
  ScrollReveal,
  FadeUp,
} from '../../components/public/AnimationWrappers.jsx';

const ARTICLES = [
  {
    id: 1,
    title: 'Gujarat PCPIR Expansion: How Dahej & Ankleshwar are Transforming Indian Chemical Supply Chains',
    category: 'Market Trends',
    readTime: '6 min read',
    date: 'November 18, 2026',
    excerpt: 'An in-depth analysis of port-led chemical manufacturing in Dahej, pipeline interconnectivity, and how dedicated road tanker corridors are cutting transit turnaround times.',
    content: `
The Dahej Petroleum, Chemicals and Petrochemicals Investment Region (PCPIR) has emerged as the nucleus of India’s basic organic and inorganic chemical output. With major synthesis crackers, dedicated jetties at Dahej Port, and direct road connectivity to Ankleshwar and Panoli GIDC estates, turnaround times for bulk solvents and aromatics have dropped by over 35%.

In this market briefing, we examine how row-locked warehouse allocations and digital weighbridge gate passes allow procurement teams to source directly from primary synthesis plants without multi-layered intermediary broker margins.
    `,
    author: 'C-Tech Market Intelligence Desk',
  },
  {
    id: 2,
    title: 'The Critical Role of Batch COA & Gas Chromatography in Industrial Solvent Procurement',
    category: 'Quality & COA',
    readTime: '5 min read',
    date: 'November 12, 2026',
    excerpt: 'Why generic product specification sheets are insufficient for pharmaceutical and synthesis plants, and how batch-specific Certificates of Analysis prevent contaminated production runs.',
    content: `
In bulk chemical procurement, accepting generic product brochures instead of batch-specific Certificates of Analysis (COA) is a leading cause of production batch rejection. For solvents like Methanol, Acetone, and Isopropyl Alcohol, trace moisture content and boiling range variances can disrupt downstream reaction yields.

C-Tech enforces a strict protocol: every lot listed on the trade desk must be paired with an authenticated gas chromatography test report from the synthesis plant, signed by the quality assurance head before quotation release.
    `,
    author: 'Quality Assurance & Testing Liaison',
  },
  {
    id: 3,
    title: 'HazMat Logistics Best Practices: Handling Bulk Corrosive Acids and Class 3 Flammable Solvents',
    category: 'Logistics & Safety',
    readTime: '7 min read',
    date: 'November 05, 2026',
    excerpt: 'Key safety requirements for rubber-lined road tankers, spark-arrested transport vehicles, emergency response guidelines, and driver compliance under Central Motor Vehicle Rules.',
    content: `
Transporting hazardous chemicals such as 48% Caustic Soda Lye, Concentrated Nitric Acid, and high-purity Benzene requires rigorous mechanical auditing of road tankers. Rubber linings must be inspected for pinhole corrosion, and drivers must hold certified hazardous material transport endorsements.

C-Tech automates driver credential verification and attaches bilingual Emergency Action Cards (TREM Cards) to every digital dispatch challan, ensuring regulatory compliance across state highway borders.
    `,
    author: 'Logistics & Fleet Operations',
  },
  {
    id: 4,
    title: 'Understanding E-Way Bill & GST QR Invoicing Compliance for Bulk Chemical Dispatches',
    category: 'Regulatory Compliance',
    readTime: '4 min read',
    date: 'October 28, 2026',
    excerpt: 'A comprehensive guide to managing electronic invoice registration numbers (IRN), real-time QR generation, and seamless GSTR-2B Input Tax Credit reconciliation.',
    content: `
Recent changes to GST e-invoicing thresholds mandate that chemical manufacturers and distributors generate authenticated IRN QR codes for all B2B transactions. Errors in vehicle number assignment or HSN code classification can lead to vehicle detention at highway checkposts.

C-Tech’s trade engine generates the delivery challan, e-way bill details sheet, and IRN-ready invoice simultaneously, matching invoice balances against bank UTR numbers for clean financial auditing.
    `,
    author: 'Tax & Compliance Advisory',
  },
  {
    id: 5,
    title: 'Global Feedstock Benchmarks: Navigating Benzene, Phenol, and Acetone Price Volatility',
    category: 'Market Trends',
    readTime: '6 min read',
    date: 'October 19, 2026',
    excerpt: 'Examining crude oil derivative pricing, import parity parity trends from East Asia, and strategies for chemical plants to hedge raw material inventory costs.',
    content: `
Cumene-based Phenol and Acetone synthesis rates are intricately linked to international crude oil derivatives and regional plant turnaround schedules. For continuous manufacturing operations in pharmaceuticals and laminates, price fluctuations can rapidly impact operating margins.

By leveraging C-Tech’s spot market pricing policies and confidential floor rate agreements, buyers secure spot availability while producers protect their baseline margin thresholds.
    `,
    author: 'Commodities Research Group',
  },
];

const CATEGORIES = ['All Insights', 'Market Trends', 'Quality & COA', 'Logistics & Safety', 'Regulatory Compliance'];

export default function BlogPage() {
  const [selectedCat, setSelectedCat] = useState('All Insights');
  const [search, setSearch] = useState('');
  const [activeArticle, setActiveArticle] = useState(null);
  const [subscribed, setSubscribed] = useState(false);

  const filtered = ARTICLES.filter((a) => {
    const matchCat = selectedCat === 'All Insights' || a.category === selectedCat;
    const q = search.toLowerCase().trim();
    const matchQuery =
      !q || a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q);
    return matchCat && matchQuery;
  });

  return (
    <div className="min-h-screen bg-[#f8faf9] text-[#1b2433] selection:bg-[#0b7a55] selection:text-white font-sans antialiased">
      <Header />

      {/* ----------------- Header Banner ----------------- */}
      <section className="border-b border-[#e2e8e5] bg-white py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <HeroEntrance className="mx-auto max-w-3xl text-center">
            <HeroHeading>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-[#0b7a55]/20 bg-[#e4f2ec] px-3.5 py-1 text-xs font-bold text-[#0b7a55] mb-3">
                <FileText size={13} />
                <span>C-Tech Research & Industry Briefings</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#0f172a]">
                Chemical Market Intelligence
              </h1>
            </HeroHeading>
            <HeroText>
              <p className="mt-3 text-sm sm:text-base text-[#4a5666] leading-relaxed">
                Timely analysis on industrial chemical supply chains, Gujarat PCPIR infrastructure, batch COA testing standards, and regulatory tax compliance.
              </p>
            </HeroText>
          </HeroEntrance>
        </div>
      </section>

      {/* ----------------- Filter & Search Bar ----------------- */}
      <section className="border-b border-[#e2e8e5] bg-white py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search size={15} className="absolute left-3.5 top-3 text-[#65717f]" />
              <input
                type="text"
                placeholder="Search briefings and articles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 w-full rounded-xl border border-[#dbe1de] bg-[#f8faf9] pl-10 pr-4 text-xs text-[#1b2433] placeholder:text-[#65717f] focus:border-[#0b7a55] focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCat(cat)}
                  className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                    selectedCat === cat
                      ? 'bg-[#0b7a55] text-white shadow-xs'
                      : 'border border-[#dbe1de] bg-white text-[#4a5666] hover:border-[#0b7a55]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- Articles Grid ----------------- */}
      <section className="py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((article, idx) => (
              <ScrollReveal key={article.id} delay={idx * 0.08} direction="up" className="h-full">
                <HoverLift className="card-corporate p-6 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-semibold text-[#65717f] mb-3">
                      <span className="rounded bg-[#e4f2ec] px-2 py-0.5 text-[#0b7a55] font-bold">
                        {article.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {article.readTime}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-[#0f172a] leading-snug hover:text-[#0b7a55] transition-colors">
                      {article.title}
                    </h3>

                    <p className="mt-3 text-xs text-[#4a5666] leading-relaxed line-clamp-3">
                      {article.excerpt}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#edf2ef] flex items-center justify-between text-xs">
                    <span className="text-[#65717f] font-mono text-[11px]">{article.date}</span>
                    <button
                      onClick={() => setActiveArticle(article)}
                      className="inline-flex items-center gap-1 font-bold text-[#0b7a55] hover:underline"
                    >
                      <span>Read Full Brief</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </HoverLift>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------- Newsletter Box ----------------- */}
      <section className="py-16 bg-white border-t border-[#e2e8e5]">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8 space-y-4">
          <FadeUp>
            <h3 className="text-2xl font-extrabold text-[#0f172a]">
              Subscribe to Spot Market Rate Alerts
            </h3>
            <p className="mt-2 text-xs text-[#4a5666] max-w-md mx-auto">
              Receive weekly commodity price benchmarks, regional tanker freight indices, and Gujarat PCPIR logistics advisories directly in your inbox.
            </p>

            {subscribed ? (
              <div className="mt-6 rounded-xl bg-[#e4f2ec] p-4 text-xs font-bold text-[#0b7a55]">
                ✓ You are subscribed to C-Tech Spot Market Bulletins.
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSubscribed(true);
                }}
                className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2 max-w-md mx-auto"
              >
                <input
                  type="email"
                  required
                  placeholder="Enter corporate email address..."
                  className="h-10 w-full rounded-xl border border-[#dbe1de] px-3.5 text-xs text-[#1b2433] focus:border-[#0b7a55] focus:outline-none"
                />
                <button
                  type="submit"
                  className="h-10 w-full sm:w-auto shrink-0 rounded-xl bg-[#0b7a55] px-5 text-xs font-bold text-white shadow-xs hover:bg-[#08603f]"
                >
                  Subscribe
                </button>
              </form>
            )}
          </FadeUp>
        </div>
      </section>

      {/* ----------------- Article Reader Modal ----------------- */}
      {activeArticle && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-[#dbe1de] bg-white p-6 sm:p-8 shadow-2xl">
            <button
              onClick={() => setActiveArticle(null)}
              className="absolute right-5 top-5 rounded-lg p-1.5 text-[#65717f] hover:bg-[#f1f4f2] hover:text-[#1b2433]"
              aria-label="Close article"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 text-xs text-[#65717f] mb-3">
              <span className="rounded bg-[#e4f2ec] px-2 py-0.5 font-bold text-[#0b7a55]">
                {activeArticle.category}
              </span>
              <span>{activeArticle.readTime}</span>
              <span>·</span>
              <span className="font-mono">{activeArticle.date}</span>
            </div>

            <h2 className="text-2xl font-extrabold text-[#0f172a] leading-tight">
              {activeArticle.title}
            </h2>

            <div className="mt-2 text-xs font-semibold text-[#0b7a55]">
              Published by: {activeArticle.author}
            </div>

            <div className="mt-6 space-y-4 text-xs sm:text-sm text-[#334155] leading-relaxed border-t border-[#edf2ef] pt-5">
              <p className="font-medium text-[#0f172a] text-sm sm:text-base leading-relaxed">
                {activeArticle.excerpt}
              </p>
              <div className="whitespace-pre-line text-[#4a5666]">
                {activeArticle.content}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-[#edf2ef] flex justify-between items-center text-xs">
              <span className="text-[#65717f]">C-Tech Trade Desk Research Series</span>
              <button
                onClick={() => setActiveArticle(null)}
                className="rounded-xl bg-[#0b7a55] px-4 py-2 font-bold text-white hover:bg-[#08603f]"
              >
                Close Article
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
