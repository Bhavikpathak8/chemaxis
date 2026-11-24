import { useState, useMemo } from 'react';
import {
  Search,
  CheckCircle2,
  Database,
  ChevronRight,
} from 'lucide-react';
import Header from '../../components/public/Header.jsx';
import Footer from '../../components/public/Footer.jsx';
import { useRequestRfq } from '../../lib/useRfqAuth.js';
import {
  HeroEntrance,
  HeroHeading,
  HeroText,
  ScrollReveal,
  ProductCardHover,
} from '../../components/public/AnimationWrappers.jsx';

const FULL_CATALOG = [
  {
    name: 'Phenol',
    grade: 'Pure / CP Grade 99.5%',
    cas: '108-95-2',
    formula: 'C₆H₅OH',
    category: 'Aromatics',
    packaging: 'Dedicated ISO Tanker / MS Drums',
    origin: 'Dahej PCPIR',
    buyerPrice: '₹107.00 / kg',
    moq: '5,000 kg',
    hazard: 'Class 6.1 (Toxic)',
    purity: '99.5% min',
    state: 'Liquid / Molten',
  },
  {
    name: 'Caustic Soda Lye',
    grade: 'Commercial Grade 48%',
    cas: '1310-73-2',
    formula: 'NaOH (aq)',
    category: 'Acids & Alkalies',
    packaging: 'Rubber Lined Road Tankers',
    origin: 'Ankleshwar GIDC',
    buyerPrice: '₹37.50 / kg',
    moq: '15,000 kg',
    hazard: 'Class 8 (Corrosive)',
    purity: '48.0% min',
    state: 'Liquid Solution',
  },
  {
    name: 'Methanol',
    grade: 'Refined Pure 99.85%',
    cas: '67-56-1',
    formula: 'CH₃OH',
    category: 'Solvents',
    packaging: 'Dedicated SS Road Tankers',
    origin: 'Kandla Terminal',
    buyerPrice: '₹29.80 / kg',
    moq: '20,000 kg',
    hazard: 'Class 3 (Flammable)',
    purity: '99.85% min',
    state: 'Clear Liquid',
  },
  {
    name: 'Acetone',
    grade: 'Pharmaceutical / CP 99.5%',
    cas: '67-64-1',
    formula: 'CH₃COCH₃',
    category: 'Solvents',
    packaging: 'HM-HDPE Barrels / Tanker',
    origin: 'Surat Corridor',
    buyerPrice: '₹76.00 / kg',
    moq: '2,000 kg',
    hazard: 'Class 3 (Flammable)',
    purity: '99.5% min',
    state: 'Volatile Liquid',
  },
  {
    name: 'Ethyl Acetate',
    grade: 'Industrial Grade 99.0%',
    cas: '141-78-6',
    formula: 'C₄H₈O₂',
    category: 'Solvents',
    packaging: 'Road Tanker / MS Drums',
    origin: 'Panoli GIDC',
    buyerPrice: '₹68.50 / kg',
    moq: '3,000 kg',
    hazard: 'Class 3 (Flammable)',
    purity: '99.0% min',
    state: 'Clear Liquid',
  },
  {
    name: 'Toluene',
    grade: 'High Purity 99.7%',
    cas: '108-88-3',
    formula: 'C⇂H₈',
    category: 'Aromatics',
    packaging: 'Dedicated Road Tankers',
    origin: 'Hazira PCPIR',
    buyerPrice: '₹84.20 / kg',
    moq: '10,000 kg',
    hazard: 'Class 3 (Flammable)',
    purity: '99.7% min',
    state: 'Clear Liquid',
  },
  {
    name: 'Acetic Acid Glacial',
    grade: 'Technical Pure 99.8%',
    cas: '64-19-7',
    formula: 'CH₃COOH',
    category: 'Acids & Alkalies',
    packaging: 'SS Tankers / HM-HDPE Carboys',
    origin: 'Bharuch Hub',
    buyerPrice: '₹41.50 / kg',
    moq: '5,000 kg',
    hazard: 'Class 8 (Corrosive)',
    purity: '99.8% min',
    state: 'Liquid',
  },
  {
    name: 'Isopropyl Alcohol (IPA)',
    grade: 'Electronic / Pharma 99.8%',
    cas: '67-63-0',
    formula: 'C₃H₈O',
    category: 'Solvents',
    packaging: 'Dedicated Tankers / Barrels',
    origin: 'Dahej Hub',
    buyerPrice: '₹98.00 / kg',
    moq: '2,000 kg',
    hazard: 'Class 3 (Flammable)',
    purity: '99.8% min',
    state: 'Liquid',
  },
  {
    name: 'Hydrochloric Acid (HCl)',
    grade: 'Commercial 30-33%',
    cas: '7647-01-0',
    formula: 'HCl (aq)',
    category: 'Acids & Alkalies',
    packaging: 'FRP / Rubber Lined Road Tankers',
    origin: 'Ankleshwar',
    buyerPrice: '₹8.50 / kg',
    moq: '25,000 kg',
    hazard: 'Class 8 (Corrosive)',
    purity: '32.0% min',
    state: 'Liquid Solution',
  },
  {
    name: 'Benzene',
    grade: 'Pure Nitration Grade',
    cas: '71-43-2',
    formula: 'C₆H₆',
    category: 'Aromatics',
    packaging: 'Dedicated ISO Road Tankers',
    origin: 'Dahej PCPIR',
    buyerPrice: '₹79.00 / kg',
    moq: '20,000 kg',
    hazard: 'Class 3 (Flammable)',
    purity: '99.85% min',
    state: 'Clear Liquid',
  },
  {
    name: 'Monoethylene Glycol (MEG)',
    grade: 'Fibre Pure Grade',
    cas: '107-21-1',
    formula: 'C₂H₆O₂',
    category: 'Intermediates',
    packaging: 'Dedicated Road Tankers / Drums',
    origin: 'Hazira Hub',
    buyerPrice: '₹58.00 / kg',
    moq: '10,000 kg',
    hazard: 'Non-Hazardous',
    purity: '99.5% min',
    state: 'Viscous Liquid',
  },
  {
    name: 'Sodium Hypochlorite',
    grade: 'Water Treatment Grade 10-12%',
    cas: '7681-52-9',
    formula: 'NaOCl',
    category: 'Acids & Alkalies',
    packaging: 'Rubber Lined Road Tankers',
    origin: 'Vapi Belt',
    buyerPrice: '₹7.80 / kg',
    moq: '20,000 kg',
    hazard: 'Class 8 (Corrosive)',
    purity: '11.0% available Cl',
    state: 'Pale Liquid',
  },
];

const CATEGORIES = ['All Chemicals', 'Aromatics', 'Solvents', 'Acids & Alkalies', 'Intermediates'];

export default function ChemicalsPage() {
  const { requestRfq } = useRequestRfq();
  const [selectedCategory, setSelectedCategory] = useState('All Chemicals');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return FULL_CATALOG.filter((item) => {
      const matchCat = selectedCategory === 'All Chemicals' || item.category === selectedCategory;
      const q = search.toLowerCase().trim();
      const matchQuery =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.cas.includes(q) ||
        item.formula.toLowerCase().includes(q) ||
        item.origin.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [selectedCategory, search]);

  const handleInquiry = (name) => {
    requestRfq(name);
  };

  return (
    <div className="min-h-screen bg-[#f8faf9] text-[#1b2433] selection:bg-[#0b7a55] selection:text-white font-sans antialiased">
      <Header />

      {/* ----------------- Header Banner ----------------- */}
      <section className="border-b border-[#e2e8e5] bg-white py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <HeroEntrance className="mx-auto max-w-3xl text-center">
            <HeroHeading>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-[#0b7a55]/20 bg-[#e4f2ec] px-3.5 py-1 text-xs font-bold text-[#0b7a55] mb-3">
                <Database size={13} />
                <span>Specification-Driven Industrial Directory</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#0f172a]">
                Industrial Chemical Catalog
              </h1>
            </HeroHeading>
            <HeroText>
              <p className="mt-3 text-sm sm:text-base text-[#4a5666] leading-relaxed">
                Explore verified bulk chemical commodities available for scheduled tanker dispatch across Dahej, Ankleshwar, and Hazira with authenticated batch COA.
              </p>
            </HeroText>
          </HeroEntrance>
        </div>
      </section>

      {/* ----------------- Search & Filter Toolbar ----------------- */}
      <section className="sticky top-16 z-30 border-b border-[#e2e8e5] bg-white/95 backdrop-blur-md py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search size={16} className="absolute left-3.5 top-3 text-[#65717f]" />
              <input
                type="text"
                placeholder="Search chemical name, CAS# (e.g. 108-95-2)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 w-full rounded-xl border border-[#dbe1de] bg-[#f8faf9] pl-10 pr-4 text-xs text-[#1b2433] placeholder:text-[#65717f] focus:border-[#0b7a55] focus:bg-white focus:outline-none"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                    selectedCategory === cat
                      ? 'bg-[#0b7a55] text-white shadow-xs'
                      : 'border border-[#dbe1de] bg-white text-[#4a5666] hover:border-[#0b7a55] hover:text-[#1b2433]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- Catalog Grid ----------------- */}
      <section className="py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6 text-xs text-[#65717f]">
            <span>Showing <strong className="text-[#1b2433]">{filtered.length}</strong> verified chemical commodities</span>
            <span>All lots row-locked on order</span>
          </div>

          <ScrollReveal direction="up" delay={0.1}>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((item) => (
                <ProductCardHover key={item.name} className="card-corporate p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono text-xs font-bold text-[#0b7a55] bg-[#e4f2ec] px-2 py-0.5 rounded">
                          {item.formula}
                        </span>
                        <h3 className="mt-2 text-xl font-extrabold text-[#0f172a]">{item.name}</h3>
                        <p className="text-xs text-[#4a5666] font-medium">{item.grade}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-xl font-bold text-[#0b7a55]">{item.buyerPrice}</div>
                        <div className="text-[10.5px] font-mono text-[#65717f]">Spot Quote ex-tax</div>
                      </div>
                    </div>

                    <div className="mt-5 space-y-2 border-t border-[#edf2ef] pt-4 text-xs">
                      <div className="flex justify-between text-[#4a5666]">
                        <span>CAS Registry:</span>
                        <span className="font-mono font-bold text-[#1b2433]">{item.cas}</span>
                      </div>
                      <div className="flex justify-between text-[#4a5666]">
                        <span>Purity Specification:</span>
                        <span className="font-semibold text-[#1b2433]">{item.purity}</span>
                      </div>
                      <div className="flex justify-between text-[#4a5666]">
                        <span>Hazard Classification:</span>
                        <span className="font-semibold text-[#b45309]">{item.hazard}</span>
                      </div>
                      <div className="flex justify-between text-[#4a5666]">
                        <span>Packaging:</span>
                        <span className="text-[#1b2433] truncate max-w-[180px]">{item.packaging}</span>
                      </div>
                      <div className="flex justify-between text-[#4a5666]">
                        <span>Minimum Order (MOQ):</span>
                        <span className="font-mono font-semibold text-[#1b2433]">{item.moq}</span>
                      </div>
                      <div className="flex justify-between text-[#4a5666]">
                        <span>Origin Cluster:</span>
                        <span className="text-[#1b2433] font-medium">{item.origin}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#edf2ef] flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-[#0b7a55]">
                      <CheckCircle2 size={13} />
                      <span>COA Uploaded</span>
                    </span>

                    <button
                      onClick={() => handleInquiry(item.name)}
                      className="inline-flex items-center gap-1 rounded-xl bg-[#0b7a55] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#08603f] transition-all"
                    >
                      <span>Request Quotation</span>
                      <ChevronRight size={13} />
                    </button>
                  </div>
                </ProductCardHover>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}
