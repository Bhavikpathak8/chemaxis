import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

const INTELLIGENCE_DATA = [
  {
    name: 'Phenol',
    grade: '99.5% CP Grade',
    cas: '108-95-2',
    currentPrice: '₹107.00 / kg',
    change: '+2.4%',
    up: true,
    hub: 'Dahej PCPIR',
    feedstock: 'Benzene / Propylene',
    sentiment: 'Strong Demand',
    history: [
      { month: 'Jun', price: 98.5 },
      { month: 'Jul', price: 101.0 },
      { month: 'Aug', price: 103.5 },
      { month: 'Sep', price: 102.0 },
      { month: 'Oct', price: 104.5 },
      { month: 'Nov', price: 107.0 },
    ],
    notes: 'Firm demand from laminate and phenolic resin formulators. Import cargo arrivals slightly delayed at Kandla, supporting domestic spot rates.',
  },
  {
    name: 'Caustic Soda Lye',
    grade: 'Rayon Grade 48%',
    cas: '1310-73-2',
    currentPrice: '₹37.50 / kg',
    change: '-0.5%',
    up: false,
    hub: 'Ankleshwar GIDC',
    feedstock: 'Chlor-Alkali Electrolysis',
    sentiment: 'Balanced Supply',
    history: [
      { month: 'Jun', price: 39.0 },
      { month: 'Jul', price: 38.2 },
      { month: 'Aug', price: 38.0 },
      { month: 'Sep', price: 37.8 },
      { month: 'Oct', price: 37.7 },
      { month: 'Nov', price: 37.5 },
    ],
    notes: 'Chlor-alkali plants operating at high capacity across Gujarat. Offtake steady from Surat textile dyeing clusters and Dahej alumina units.',
  },
  {
    name: 'Methanol',
    grade: 'Refined Pure 99.85%',
    cas: '67-56-1',
    currentPrice: '₹29.80 / kg',
    change: '+1.1%',
    up: true,
    hub: 'Kandla Terminal',
    feedstock: 'Natural Gas / Coal',
    sentiment: 'Bullish',
    history: [
      { month: 'Jun', price: 27.5 },
      { month: 'Jul', price: 28.0 },
      { month: 'Aug', price: 28.6 },
      { month: 'Sep', price: 29.0 },
      { month: 'Oct', price: 29.5 },
      { month: 'Nov', price: 29.8 },
    ],
    notes: 'Middle East port inventory draws have pushed CFR India import benchmark higher. Formaldehyde plants actively booking prompt tanker dispatches.',
  },
  {
    name: 'Acetone',
    grade: 'Commercial / CP 99.5%',
    cas: '67-64-1',
    currentPrice: '₹76.00 / kg',
    change: '+3.2%',
    up: true,
    hub: 'Surat Corridor',
    feedstock: 'Cumene Oxidation',
    sentiment: 'High Inquiries',
    history: [
      { month: 'Jun', price: 71.0 },
      { month: 'Jul', price: 72.5 },
      { month: 'Aug', price: 73.0 },
      { month: 'Sep', price: 74.0 },
      { month: 'Oct', price: 74.8 },
      { month: 'Nov', price: 76.0 },
    ],
    notes: 'Sharp uptick in inquiries from pharmaceutical API synthesis units across Ankleshwar and Vapi. Local domestic inventories tightly held.',
  },
  {
    name: 'Ethyl Acetate',
    grade: 'Industrial Grade 99.0%',
    cas: '141-78-6',
    currentPrice: '₹68.50 / kg',
    change: '+0.8%',
    up: true,
    hub: 'Panoli GIDC',
    feedstock: 'Ethanol / Acetic Acid',
    sentiment: 'Stable',
    history: [
      { month: 'Jun', price: 66.0 },
      { month: 'Jul', price: 67.0 },
      { month: 'Aug', price: 67.5 },
      { month: 'Sep', price: 68.0 },
      { month: 'Oct', price: 68.2 },
      { month: 'Nov', price: 68.5 },
    ],
    notes: 'Packaging and flexographic printing ink demand steady. Raw material ethanol allocation stable across regional distilleries.',
  },
  {
    name: 'Toluene',
    grade: 'High Purity 99.7%',
    cas: '108-88-3',
    currentPrice: '₹84.20 / kg',
    change: '-1.2%',
    up: false,
    hub: 'Hazira PCPIR',
    feedstock: 'Reformate / Pyrolysis Gasoline',
    sentiment: 'Softening',
    history: [
      { month: 'Jun', price: 86.0 },
      { month: 'Jul', price: 85.5 },
      { month: 'Aug', price: 85.0 },
      { month: 'Sep', price: 84.8 },
      { month: 'Oct', price: 85.2 },
      { month: 'Nov', price: 84.2 },
    ],
    notes: 'Refinery supply ample at Hazira. Solvents market taking a wait-and-watch approach ahead of next monthly contract announcements.',
  },
];

export default function PriceIntelligencePage() {
  const [selectedChem, setSelectedChem] = useState(INTELLIGENCE_DATA[0]);

  return (
    <div className="bg-white">
      {/* ----------------- Header ----------------- */}
      <section className="py-14 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-[#f0f2f5]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#ecfdf5] border border-[#a7f3d0] px-3.5 py-1 text-xs font-semibold text-[#065f46] mb-3">
              <Activity size={13} className="text-[#059669]" />
              Updated Daily from Gujarat Chemical Terminals
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#111827]">
              Chemical Spot Price Intelligence
            </h1>
            <p className="mt-2 text-sm text-[#4b5563] max-w-2xl">
              Verified spot rate benchmarks across Dahej PCPIR, Ankleshwar, Kandla, and Hazira. Sourced from physical trade executions and verified refinery tenders.
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-[#6b7280]">Trading Desk Reference</span>
            <div className="font-mono text-sm font-bold text-[#111827]">
              INR / Metric Ton & Kg (Ex-Tax)
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- Main Intelligence View ----------------- */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid gap-8 lg:grid-cols-12">
          {/* List of Commodities */}
          <div className="lg:col-span-5 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#6b7280] mb-3">
              Select Commodity Benchmark
            </h2>
            {INTELLIGENCE_DATA.map((item) => (
              <button
                key={item.name}
                type="button"
                onClick={() => setSelectedChem(item)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${selectedChem.name === item.name
                  ? 'border-[#0b7a55] bg-[#ecfdf5]/50 shadow-xs ring-1 ring-[#0b7a55]'
                  : 'border-[#e5e7eb] bg-white hover:border-[#0b7a55]/40'
                  }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-[#111827]">{item.name}</h3>
                    <p className="text-[11.5px] text-[#6b7280]">{item.grade} · CAS {item.cas}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm font-bold text-[#111827]">{item.currentPrice}</div>
                    <span
                      className={`inline-flex items-center gap-0.5 text-[11px] font-mono font-bold ${item.up ? 'text-[#059669]' : 'text-[#e11d48]'
                        }`}
                    >
                      {item.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                      {item.change}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Detailed Commodity Analytics View */}
          <div className="lg:col-span-7 rounded-2xl border border-[#e5e7eb] bg-white p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#f0f2f5] gap-4">
              <div>
                <span className="font-mono text-xs font-semibold text-[#0b7a55] bg-[#ecfdf5] px-2.5 py-0.5 rounded">
                  CAS {selectedChem.cas}
                </span>
                <h3 className="mt-2 text-2xl font-extrabold text-[#111827]">{selectedChem.name}</h3>
                <p className="text-xs text-[#6b7280]">{selectedChem.grade} · Primary Hub: {selectedChem.hub}</p>
              </div>

              <div className="text-left sm:text-right">
                <div className="text-xs text-[#6b7280]">Spot Benchmark Rate</div>
                <div className="font-mono text-3xl font-extrabold text-[#111827]">{selectedChem.currentPrice}</div>
                <div className="mt-1 flex items-center sm:justify-end gap-1.5 text-xs text-[#4b5563]">
                  <span>Feedstock: {selectedChem.feedstock}</span>
                </div>
              </div>
            </div>

            {/* 6-Month Trend Visual Table */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#111827] mb-3">
                6-Month Spot Price Movement (₹ / kg)
              </h4>
              <div className="grid grid-cols-6 gap-2">
                {selectedChem.history.map((pt) => (
                  <div key={pt.month} className="p-3 rounded-lg border border-[#e5e7eb] bg-[#fafafa] text-center">
                    <span className="font-mono text-[11px] text-[#6b7280] block">{pt.month}</span>
                    <span className="font-mono text-sm font-bold text-[#111827] mt-1 block">
                      ₹{pt.price.toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Market Commentary */}
            <div className="p-4 rounded-xl border border-[#e5e7eb] bg-[#f9fafb]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#111827] mb-1.5">
                C-Tech Desk Commentary
              </h4>
              <p className="text-xs text-[#4b5563] leading-relaxed">
                {selectedChem.notes}
              </p>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#f0f2f5]">
              <div className="flex items-center gap-2 text-xs font-medium text-[#059669]">
                <ShieldCheck size={16} />
                <span>Physical lot verified by manufacturer batch COA</span>
              </div>
              <Link
                to={`/chemicals?q=${encodeURIComponent(selectedChem.name)}`}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#18181b] text-white text-xs font-bold hover:bg-black transition-colors"
              >
                <span>Request Quotation</span>
                <ChevronRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
