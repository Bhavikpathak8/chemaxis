import { useState, useMemo } from 'react';
import { ArrowRight, ShieldCheck, Truck, Percent, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const COMMODITIES = [
  { id: 'phenol', name: 'Phenol 99.5%', baseSellerPrice: 100, unit: 'kg', minQty: 1000, maxQty: 25000, defaultQty: 5000, marginPct: 7, cas: '108-95-2' },
  { id: 'caustic', name: 'Caustic Soda Lye 48%', baseSellerPrice: 35, unit: 'kg', minQty: 5000, maxQty: 40000, defaultQty: 15000, marginPct: 8, cas: '1310-73-2' },
  { id: 'methanol', name: 'Methanol Pure Grade', baseSellerPrice: 28, unit: 'kg', minQty: 5000, maxQty: 50000, defaultQty: 20000, marginPct: 6.5, cas: '67-56-1' },
  { id: 'acetone', name: 'Acetone Commercial', baseSellerPrice: 72, unit: 'kg', minQty: 2000, maxQty: 30000, defaultQty: 8000, marginPct: 7.5, cas: '67-64-1' },
  { id: 'ethyl_acetate', name: 'Ethyl Acetate 99%', baseSellerPrice: 65, unit: 'kg', minQty: 2000, maxQty: 25000, defaultQty: 6000, marginPct: 7, cas: '141-78-6' },
];

export default function TradeSimulator() {
  const [selectedId, setSelectedId] = useState('phenol');
  const [qty, setQty] = useState(5000);
  const [distanceKm, setDistanceKm] = useState(180); // Dahej -> Surat corridor

  const chemical = useMemo(
    () => COMMODITIES.find((c) => c.id === selectedId) || COMMODITIES[0],
    [selectedId]
  );

  // Calculations mirroring ChemAxis's trade desk engine
  const sellerRate = chemical.baseSellerPrice;
  const marginPerUnit = +(sellerRate * (chemical.marginPct / 100)).toFixed(2);
  const buyerRate = sellerRate + marginPerUnit;

  const sellerSubtotal = sellerRate * qty;
  const grossTradeMargin = marginPerUnit * qty;
  
  // Freight estimate (dedicated road tanker)
  const metricTons = qty / 1000;
  const estimatedFreight = Math.round(metricTons * distanceKm * 3.8);
  const netCtechProfit = Math.max(0, grossTradeMargin - estimatedFreight);

  // GST 18%
  const buyerSubtotal = buyerRate * qty;
  const gstAmount = Math.round(buyerSubtotal * 0.18);
  const totalBuyerInvoice = buyerSubtotal + gstAmount;

  const formatInr = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-2xl border border-[#d0ded7] bg-white p-6 shadow-xl md:p-8">
      {/* Background soft ambient green highlights */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#0b7a55]/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-[#10b981]/5 blur-3xl" />

      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-[#e2e8e5] pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#e4f2ec] border border-[#0b7a55]/20 px-3 py-1 text-[12px] font-semibold text-[#0b7a55]">
            <Sparkles size={13} />
            <span>Interactive Margin & Order Simulator</span>
          </div>
          <h3 className="mt-2 text-2xl font-bold tracking-tight text-[#1b2433] md:text-3xl">
            Simulate Chemical Deal Economics in Real-Time
          </h3>
          <p className="text-[14px] text-[#4a5666]">
            Understand how ChemAxis safeguards seller floor pricing while generating transparent, all-inclusive quotes to buyers.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-[#0b7a55] font-semibold bg-[#e4f2ec] px-3 py-1.5 rounded-lg border border-[#0b7a55]/20">
          <ShieldCheck size={16} />
          <span>GSTIN & E-Way Ready</span>
        </div>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-12">
        {/* Controls Column */}
        <div className="space-y-5 lg:col-span-5">
          {/* Commodity Selector */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#4a5666]">
              Select Industrial Chemical
            </label>
            <div className="mt-2.5 grid grid-cols-1 gap-2">
              {COMMODITIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(c.id);
                    setQty(c.defaultQty);
                  }}
                  className={`flex items-center justify-between rounded-xl border p-3 text-left transition-all ${
                    selectedId === c.id
                      ? 'border-[#0b7a55] bg-[#e4f2ec] text-[#1b2433] shadow-sm font-semibold'
                      : 'border-[#dbe1de] bg-[#f8faf9] text-[#4a5666] hover:border-[#0b7a55]/40 hover:bg-white'
                  }`}
                >
                  <div>
                    <div className="text-[14px] font-semibold text-[#1b2433]">{c.name}</div>
                    <div className="text-[11.5px] font-mono text-[#65717f]">CAS: {c.cas}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-xs font-bold text-[#0b7a55]">
                      ₹{c.baseSellerPrice}/{c.unit}
                    </div>
                    <div className="text-[11px] text-[#65717f]">Seller base</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Slider */}
          <div className="rounded-xl border border-[#dbe1de] bg-[#f8faf9] p-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#4a5666]">
                Order Quantity
              </label>
              <span className="font-mono text-base font-bold text-[#1b2433]">
                {qty.toLocaleString()} {chemical.unit} ({metricTons.toFixed(1)} MT)
              </span>
            </div>
            <input
              type="range"
              min={chemical.minQty}
              max={chemical.maxQty}
              step={500}
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-lg bg-[#dbe1de] accent-[#0b7a55]"
            />
            <div className="mt-1 flex justify-between text-[11px] font-mono text-[#65717f]">
              <span>{chemical.minQty.toLocaleString()} {chemical.unit}</span>
              <span>{chemical.maxQty.toLocaleString()} {chemical.unit}</span>
            </div>
          </div>

          {/* Delivery Corridor */}
          <div className="rounded-xl border border-[#dbe1de] bg-[#f8faf9] p-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#4a5666]">
                Transit Corridor Distance
              </label>
              <span className="font-mono text-base font-bold text-[#1b2433]">
                {distanceKm} km (Dedicated Tanker)
              </span>
            </div>
            <input
              type="range"
              min={50}
              max={600}
              step={10}
              value={distanceKm}
              onChange={(e) => setDistanceKm(Number(e.target.value))}
              className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-lg bg-[#dbe1de] accent-[#0b7a55]"
            />
            <div className="mt-1 flex justify-between text-[11px] font-mono text-[#65717f]">
              <span>50 km (Intra-PCPIR)</span>
              <span>600 km (Inter-State Hubs)</span>
            </div>
          </div>
        </div>

        {/* Live Motion Results Column */}
        <div className="flex flex-col justify-between rounded-xl border border-[#d0ded7] bg-[#f8faf9] p-6 lg:col-span-7">
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-[#e2e8e5] pb-3.5">
              <div className="text-xs font-bold uppercase tracking-wider text-[#4a5666]">
                Dual-Sided Trade Breakdown
              </div>
              <div className="rounded-full bg-[#e4f2ec] px-2.5 py-0.5 text-xs font-mono font-semibold text-[#0b7a55] border border-[#0b7a55]/20">
                Zero Price Leakage Active
              </div>
            </div>

            {/* Split Price Cards */}
            <div className="grid grid-cols-2 gap-4">
              {/* Seller Side */}
              <div className="rounded-xl border border-[#0b7a55]/30 bg-white p-4 shadow-xs">
                <div className="text-[12px] font-semibold text-[#0b7a55]">Seller Floor (Confidential)</div>
                <div className="mt-1 font-mono text-2xl font-bold text-[#1b2433]">
                  ₹{sellerRate.toFixed(2)}
                  <span className="text-xs font-normal text-[#65717f]">/{chemical.unit}</span>
                </div>
                <div className="mt-2 text-[12px] text-[#4a5666]">
                  Seller Payout: <span className="font-mono font-bold text-[#1b2433]">{formatInr(sellerSubtotal)}</span>
                </div>
              </div>

              {/* Buyer Side */}
              <div className="rounded-xl border border-[#2e3d5c]/20 bg-white p-4 shadow-xs">
                <div className="text-[12px] font-semibold text-[#2e3d5c]">Buyer Rate (Ex-Tax)</div>
                <div className="mt-1 font-mono text-2xl font-bold text-[#1b2433]">
                  ₹{buyerRate.toFixed(2)}
                  <span className="text-xs font-normal text-[#65717f]">/{chemical.unit}</span>
                </div>
                <div className="mt-2 text-[12px] text-[#4a5666]">
                  Total Ex-Tax: <span className="font-mono font-bold text-[#1b2433]">{formatInr(buyerSubtotal)}</span>
                </div>
              </div>
            </div>

            {/* Progress / Margin Bar Breakdown */}
            <div className="space-y-2 rounded-xl border border-[#dbe1de] bg-white p-4 shadow-xs">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-[#1b2433]">ChemAxis Gross Trade Margin</span>
                <span className="font-mono text-[#0b7a55] font-bold">{formatInr(grossTradeMargin)}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#e4f2ec]">
                <div
                  className="h-full bg-gradient-to-r from-[#0b7a55] to-[#10b981] transition-all duration-300"
                  style={{ width: `${Math.min(100, (grossTradeMargin / buyerSubtotal) * 100 * 8)}%` }}
                />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 pt-2 text-xs text-[#4a5666] border-t border-[#e2e8e5]">
                <div className="flex items-center gap-1.5">
                  <Truck size={14} className="text-[#0b7a55]" />
                  <span>Freight & E-Way:</span>
                  <span className="font-mono font-semibold text-[#1b2433]">{formatInr(estimatedFreight)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Percent size={14} className="text-[#0b7a55]" />
                  <span>GST (18% Input Tax):</span>
                  <span className="font-mono font-semibold text-[#1b2433]">{formatInr(gstAmount)}</span>
                </div>
              </div>
            </div>

            {/* Final Net Invoice Card */}
            <div className="rounded-xl border border-[#0b7a55] bg-gradient-to-br from-[#0b7a55] to-[#08603f] p-5 text-white shadow-lg">
              <div className="flex flex-col justify-between sm:flex-row sm:items-center">
                <div>
                  <div className="text-xs uppercase tracking-wider text-emerald-100 font-semibold">
                    Total Buyer Order Value (Inc. 18% GST)
                  </div>
                  <div className="mt-1 font-mono text-3xl font-extrabold tracking-tight text-white">
                    {formatInr(totalBuyerInvoice)}
                  </div>
                  <div className="mt-1 text-[12px] text-emerald-100">
                    Net Trader Desk Margin: <span className="font-mono font-bold text-white">{formatInr(netCtechProfit)}</span>
                  </div>
                </div>

                <div className="mt-4 sm:mt-0">
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#08603f] shadow-md transition-all hover:bg-[#e4f2ec] hover:scale-105"
                  >
                    <span>Request Official Quote</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 text-center text-[12px] text-[#65717f] font-mono">
            *All orders backed by physical batch COA analysis and row-locked chemical warehouse inventory.
          </div>
        </div>
      </div>
    </div>
  );
}
