import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Award,
  CheckCircle2,
  ArrowRight,
  Scale,
  Lock,
  Truck,
  FileCheck2,
  MapPin,
  Sparkles,
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
} from '../../components/public/AnimationWrappers.jsx';

const COMPARISON_POINTS = [
  {
    parameter: 'Price Transparency',
    broker: 'Layered markups (5-12%), hidden agent commissions, shifting verbal quotes.',
    ctech: 'Transparent single-tier platform pricing with documented seller reserve and fixed gross margin.',
  },
  {
    parameter: 'Batch Inventory Guarantee',
    broker: 'Phantom listings; stock often sold to multiple buyers before booking.',
    ctech: 'Row-level inventory reservation with confirmed factory tank farm telemetry.',
  },
  {
    parameter: 'Quality & COA Verification',
    broker: 'Unverified photocopied manufacturer COAs with no pre-dispatch lot checks.',
    ctech: 'NABL-partner lab verification with digital batch COA tracking on every dispatch.',
  },
  {
    parameter: 'Billing & Compliance',
    broker: 'Messy multi-party paperwork, circular billings, high GST audit risk.',
    ctech: 'Direct institutional transaction with 100% compliant e-way bills & GST tax invoices.',
  },
  {
    parameter: 'Transport Safety & Demurrage',
    broker: 'Unregulated local third-party tankers with zero tracking or HazMat certifications.',
    ctech: 'Dedicated SS316, MS & Rubber-lined GPS fleet adhering to strict PESO transport guidelines.',
  },
];

const STRATEGIC_HUBS = [
  {
    name: 'Dahej PCPIR Primary Gateway',
    location: 'Dahej SEZ-1, Gujarat',
    focus: 'Bulk petrochemicals, Phenol, Acetone, Methanol & Caustic Soda Lye tanker offloading.',
    tankerCapacity: '400+ MT Daily Throughput',
    badge: 'Flagship Hub',
  },
  {
    name: 'Ankleshwar GIDC Liaison Office',
    location: 'Ankleshwar Industrial Estate, Gujarat',
    focus: 'Specialty intermediaries, pharmaceutical reagents, and QA sampling laboratories.',
    tankerCapacity: 'NABL Partner Lab Center',
    badge: 'QC Lab Hub',
  },
  {
    name: 'Taloja & Navi Mumbai Depot',
    location: 'MIDC Taloja, Maharashtra',
    focus: 'Solvent distribution, Ethyl Acetate, Toluene, and drum/IBC tote decanting for western India.',
    tankerCapacity: '250+ MT Dedicated Buffer',
    badge: 'Western Terminal',
  },
  {
    name: 'Hyderabad Pharma Corridor Liaison',
    location: 'Pashamylaram Industrial Hub, Telangana',
    focus: 'API-grade solvent supplies, high-purity IPA, and pharma manufacturer fulfillment.',
    tankerCapacity: 'Scheduled Multi-Tanker Routes',
    badge: 'Pharma Desk',
  },
];

const LEADERSHIP_VALUES = [
  {
    icon: ShieldCheck,
    title: 'Absolute Deal Integrity',
    desc: 'In an industry plagued by reneged contracts on price spikes, C-Tech guarantees that confirmed order rates and quantities are strictly binding.',
  },
  {
    icon: Scale,
    title: 'Sovereign Neutrality',
    desc: 'We operate as a strictly disciplined trade platform, protecting supplier anonymity while guaranteeing full batch transparency to industrial buyers.',
  },
  {
    icon: Truck,
    title: 'HazMat Safety First',
    desc: 'Chemical transit carries real environmental and human responsibility. We never cut corners on tanker calibration, driver training, or emergency spill kits.',
  },
  {
    icon: Lock,
    title: 'Digital Reconciliation',
    desc: 'From automated weighbridge slips to digital gate passes and single-click GST tax invoices, our tech stack eliminates human reconciliation friction.',
  },
];

export default function AboutPage() {
  const { requestRfq } = useRequestRfq();

  return (
    <div className="min-h-screen bg-[#f8faf9] text-[#1b2433]">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0b132b] via-[#0f172a] to-[#162238] py-20 lg:py-28 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(#0b7a55_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
        <div className="absolute -top-32 right-1/4 h-96 w-96 rounded-full bg-[#0b7a55]/20 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <HeroEntrance>
              <HeroHeading>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#0b7a55]/40 bg-[#0b7a55]/15 px-3.5 py-1.5 text-xs font-semibold text-[#6ee7b7] backdrop-blur-sm mb-6">
                  <Sparkles size={13} className="text-[#6ee7b7]" />
                  <span>About C-Tech Trade Desk</span>
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl text-white">
                  Building India’s Sovereign Trade Desk for{' '}
                  <span className="text-[#6ee7b7]">Industrial Chemical Commerce</span>
                </h1>
              </HeroHeading>

              <HeroText>
                <p className="mt-6 text-base sm:text-lg text-[#cbd5e1] leading-relaxed">
                  Founded in the heart of Gujarat’s PCPIR corridor, C-Tech transforms opaque, volatile chemical brokerage into an institutional, audited, and row-locked electronic exchange.
                </p>
              </HeroText>

              <HeroActions>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                  <button
                    onClick={() => requestRfq()}
                    className="rounded-lg bg-[#0b7a55] px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-[#08603f] transition-all flex items-center gap-2"
                  >
                    <span>Post Procurement RFQ</span>
                    <ArrowRight size={16} />
                  </button>
                  <Link
                    to="/chemicals"
                    className="rounded-lg border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20 transition-all backdrop-blur-sm"
                  >
                    Explore Chemical Catalog
                  </Link>
                </div>
              </HeroActions>
            </HeroEntrance>
          </div>

          {/* Key Metric Highlights */}
          <ScrollReveal direction="up" delay={0.2}>
            <div className="mt-16 grid grid-cols-2 gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md sm:grid-cols-4 lg:p-8">
              <div className="text-center sm:border-r sm:border-white/10">
                <div className="text-2xl font-black text-white sm:text-3xl lg:text-4xl">
                  ₹<AnimatedCounter target={420} suffix="+ Cr" />
                </div>
                <div className="mt-1 text-xs font-medium text-[#94a3b8]">Annualized Traded Volume</div>
              </div>
              <div className="text-center sm:border-r sm:border-white/10">
                <div className="text-2xl font-black text-white sm:text-3xl lg:text-4xl">
                  <AnimatedCounter target={18500} suffix="+" /> MT
                </div>
                <div className="mt-1 text-xs font-medium text-[#94a3b8]">Chemicals Delivered Safely</div>
              </div>
              <div className="text-center sm:border-r sm:border-white/10">
                <div className="text-2xl font-black text-white sm:text-3xl lg:text-4xl">
                  <AnimatedCounter target={350} suffix="+" />
                </div>
                <div className="mt-1 text-xs font-medium text-[#94a3b8]">Verified Chemical Plants</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-[#6ee7b7] sm:text-3xl lg:text-4xl">
                  <AnimatedCounter target={99.4} suffix="%" />
                </div>
                <div className="mt-1 text-xs font-medium text-[#94a3b8]">On-Time Offloading Rate</div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* The Problem We Solved (Genesis) */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="The Industry Bottleneck"
            title="Why Traditional Chemical Brokerage Failed Indian Manufacturers"
            subtitle="For decades, India's ₹2.5 lakh crore chemical supply chain ran on informal phone calls, phantom stock, and unverified batch COAs. We engineered the cure."
          />

          <FadeUp delay={0.2}>
            <div className="mt-12 overflow-hidden rounded-2xl border border-[#e2e8e5] bg-white shadow-xs">
              <div className="grid grid-cols-1 divide-y divide-[#e2e8e5] lg:grid-cols-12 lg:divide-y-0 lg:divide-x">
                {/* Header Row on Large Screens */}
                <div className="hidden lg:col-span-12 lg:grid lg:grid-cols-12 bg-[#f8faf9] p-4 text-xs font-bold uppercase tracking-wider text-[#4a5666]">
                  <div className="col-span-3">Operating Dimension</div>
                  <div className="col-span-4 text-red-600">Traditional Brokerage Friction</div>
                  <div className="col-span-5 text-[#0b7a55]">C-Tech Sovereign Trade Desk</div>
                </div>

                {COMPARISON_POINTS.map((pt, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-1 p-5 lg:col-span-12 lg:grid-cols-12 lg:items-center hover:bg-[#fafbfb] transition-colors gap-3 lg:gap-0"
                  >
                    <div className="lg:col-span-3">
                      <span className="font-bold text-[#0f172a] text-sm flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-[#0b7a55]" />
                        {pt.parameter}
                      </span>
                    </div>

                    <div className="lg:col-span-4 rounded-lg bg-red-50/60 p-3 lg:bg-transparent lg:p-0">
                      <span className="lg:hidden block text-[11px] font-bold text-red-600 uppercase mb-1">
                        Traditional Brokerage
                      </span>
                      <p className="text-xs text-[#52525b] leading-relaxed">{pt.broker}</p>
                    </div>

                    <div className="lg:col-span-5 rounded-lg bg-[#e4f2ec]/60 p-3 lg:bg-transparent lg:p-0">
                      <span className="lg:hidden block text-[11px] font-bold text-[#0b7a55] uppercase mb-1">
                        C-Tech Guarantee
                      </span>
                      <p className="text-xs font-medium text-[#0f172a] leading-relaxed flex items-start gap-1.5">
                        <CheckCircle2 size={15} className="text-[#0b7a55] shrink-0 mt-0.5" />
                        <span>{pt.ctech}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Strategic Hubs & Infrastructure */}
      <section className="bg-white py-16 sm:py-24 border-y border-[#e2e8e5]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Strategic Presence"
            title="Anchored Across India’s Critical Chemical Clusters"
            subtitle="Strategically located terminals and liaison hubs across Gujarat, Maharashtra, and Southern pharma belts to enable rapid dispatch and rigorous quality checks."
          />

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {STRATEGIC_HUBS.map((hub, idx) => (
              <ScrollReveal key={idx} delay={idx * 0.1} direction="up" className="h-full">
                <HoverLift className="h-full">
                  <div className="flex h-full flex-col justify-between rounded-xl border border-[#e2e8e5] bg-[#f8faf9] p-6">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="rounded bg-[#e4f2ec] px-2 py-0.5 text-[10px] font-mono font-bold text-[#0b7a55]">
                          {hub.badge}
                        </span>
                        <MapPin size={16} className="text-[#0b7a55]" />
                      </div>

                      <h3 className="mt-4 text-base font-bold text-[#0f172a]">{hub.name}</h3>
                      <div className="mt-1 text-xs font-semibold text-[#65717f]">{hub.location}</div>

                      <p className="mt-3 text-xs text-[#4a5666] leading-relaxed">{hub.focus}</p>
                    </div>

                    <div className="mt-5 border-t border-[#e2e8e5] pt-3">
                      <span className="block text-[11px] font-bold text-[#0b7a55]">
                        {hub.tankerCapacity}
                      </span>
                    </div>
                  </div>
                </HoverLift>
              </ScrollReveal>
            ))}
          </div>

          {/* Infrastructure Map Preview Banner */}
          <FadeUp delay={0.3}>
            <div className="mt-10 rounded-2xl bg-[#0f172a] p-8 text-white relative overflow-hidden">
              <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-[#0b7a55]/20 to-transparent pointer-events-none" />
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                <div className="max-w-2xl">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0b7a55]/30 px-3 py-1 text-xs font-mono font-bold text-[#6ee7b7] mb-3">
                    Dahej Petroleum, Chemicals and Petrochemicals Investment Region (PCPIR)
                  </span>
                  <h4 className="text-xl font-bold sm:text-2xl">
                    Direct Pipe-to-Terminal & Port Jetty Logistics
                  </h4>
                  <p className="mt-2 text-xs sm:text-sm text-[#cbd5e1] leading-relaxed">
                    By maintaining direct liaison operations adjacent to Dahej deep-water jetty and pipeline corridors, C-Tech guarantees prompt bulk tanker offloading and minimal port detention charges.
                  </p>
                </div>
                <div className="shrink-0">
                  <button
                    onClick={() => requestRfq()}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#0b7a55] px-5 py-3 text-xs font-bold text-white hover:bg-[#08603f] transition-colors"
                  >
                    <span>Request Tanker Slot</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Core Operating Principles */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Operating Philosophy"
            title="Guiding Principles of Our Industrial Trade Desk"
            subtitle="We adhere to rigorous chemical safety, financial transparency, and contract discipline."
          />

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {LEADERSHIP_VALUES.map((val, idx) => {
              const Icon = val.icon;
              return (
                <ScrollReveal key={idx} delay={idx * 0.1} direction="up" className="h-full">
                  <HoverLift className="h-full">
                    <div className="rounded-xl border border-[#e2e8e5] bg-white p-6 shadow-xs h-full flex flex-col justify-between">
                      <div>
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#e4f2ec] text-[#0b7a55]">
                          <Icon size={22} />
                        </div>
                        <h3 className="mt-4 text-base font-bold text-[#0f172a]">{val.title}</h3>
                        <p className="mt-2 text-xs text-[#52525b] leading-relaxed">{val.desc}</p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-[#edf2ef] text-[11px] font-semibold text-[#0b7a55]">
                        Operating Tenet
                      </div>
                    </div>
                  </HoverLift>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Compliance & Regulatory Credentials */}
      <section className="bg-[#f0f4f2] py-16 border-t border-[#e2e8e5]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0b7a55]">
                Regulatory & Safety Discipline
              </span>
              <h3 className="mt-1 text-2xl font-bold text-[#0f172a]">
                Strict Adherence to Statutory Standards
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-[#4a5666] leading-relaxed">
                Chemical commerce requires uncompromised legal and environmental responsibility. C-Tech conducts trade only with GST-registered corporate entities holding valid state PCB consent to operate and PESO approvals where applicable.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full lg:w-auto">
              <div className="rounded-xl bg-white p-4 border border-[#e2e8e5] text-center shadow-xs">
                <FileCheck2 size={24} className="mx-auto text-[#0b7a55]" />
                <div className="mt-2 text-xs font-bold text-[#0f172a]">GSTIN Verified</div>
                <div className="text-[10px] text-[#65717f]">Direct E-Way Sync</div>
              </div>
              <div className="rounded-xl bg-white p-4 border border-[#e2e8e5] text-center shadow-xs">
                <Award size={24} className="mx-auto text-[#0b7a55]" />
                <div className="mt-2 text-xs font-bold text-[#0f172a]">NABL Lab</div>
                <div className="text-[10px] text-[#65717f]">COA Verification</div>
              </div>
              <div className="rounded-xl bg-white p-4 border border-[#e2e8e5] text-center shadow-xs">
                <Truck size={24} className="mx-auto text-[#0b7a55]" />
                <div className="mt-2 text-xs font-bold text-[#0f172a]">PESO Rules</div>
                <div className="text-[10px] text-[#65717f]">Calibrated Fleet</div>
              </div>
              <div className="rounded-xl bg-white p-4 border border-[#e2e8e5] text-center shadow-xs">
                <ShieldCheck size={24} className="mx-auto text-[#0b7a55]" />
                <div className="mt-2 text-xs font-bold text-[#0f172a]">Row-Locked</div>
                <div className="text-[10px] text-[#65717f]">No Overselling</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-[#0b132b] via-[#0f172a] to-[#0b7a55] py-16 text-white text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <h2 className="text-2xl font-bold sm:text-3xl lg:text-4xl">
              Ready to Upgrade Your Industrial Chemical Sourcing?
            </h2>
            <p className="mt-4 text-sm sm:text-base text-[#cbd5e1] max-w-2xl mx-auto">
              Connect directly with our Dahej desk to obtain spot quotation pricing, book dedicated SS316 tanker lots, or register your manufacturing plant.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <button
                onClick={() => requestRfq()}
                className="rounded-lg bg-white px-6 py-3 text-xs sm:text-sm font-bold text-[#0f172a] shadow-sm hover:bg-[#f8faf9] transition-colors"
              >
                Post Industrial Requirement
              </button>
              <Link
                to="/become-seller"
                className="rounded-lg border border-white/30 bg-white/10 px-6 py-3 text-xs sm:text-sm font-bold text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
              >
                List Your Chemical Inventory
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>

      <Footer />
    </div>
  );
}
