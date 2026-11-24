import { Link } from 'react-router-dom';
import {
  Smartphone,
  Truck,
  ArrowRight,
  QrCode,
  CheckCircle2,
} from 'lucide-react';
import Header from '../../components/public/Header.jsx';
import Footer from '../../components/public/Footer.jsx';
import SectionHeading from '../../components/public/SectionHeading.jsx';
import { FadeUp } from '../../components/public/AnimationWrappers.jsx';

export default function AppPage() {
  return (
    <div className="min-h-screen bg-[#f8faf9] text-[#1b2433] selection:bg-[#0b7a55] selection:text-white font-sans antialiased">
      <Header />

      {/* ----------------- Hero Section with Phone Frame Mockup ----------------- */}
      <section className="border-b border-[#e2e8e5] bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            {/* Left Copy */}
            <div className="lg:col-span-6 space-y-6">
              <FadeUp delay={0.05}>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-[#0b7a55]/20 bg-[#e4f2ec] px-3.5 py-1 text-xs font-bold text-[#0b7a55]">
                  <Smartphone size={13} />
                  <span>C-Tech Mobile Trade Suite</span>
                </div>
              </FadeUp>

              <FadeUp delay={0.12}>
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-[#0f172a] leading-[1.12]">
                  Institutional Chemical Trading,{' '}
                  <span className="text-[#0b7a55]">Directly from Your Mobile.</span>
                </h1>
              </FadeUp>

              <FadeUp delay={0.2}>
                <p className="text-base text-[#4a5666] leading-relaxed">
                  Designed for chemical plant managers, procurement directors, and road tanker transport operators. Approve spot quotations, inspect batch COA documents, and scan weighbridge gate passes from anywhere.
                </p>
              </FadeUp>

              <FadeUp delay={0.28}>
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#0b7a55] px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-[#0b7a55]/20 hover:bg-[#08603f] transition-all"
                  >
                    <span>Launch Mobile Web Workspace</span>
                    <ArrowRight size={16} />
                  </Link>
                  <a
                    href="#driver-app"
                    className="inline-flex items-center gap-2 rounded-xl border border-[#dbe1de] bg-white px-6 py-3.5 text-sm font-bold text-[#1b2433] hover:border-[#0b7a55] transition-colors"
                  >
                    <span>Driver Gate Pass App</span>
                  </a>
                </div>
              </FadeUp>

              {/* Badges */}
              <FadeUp delay={0.34}>
                <div className="pt-4 flex flex-wrap items-center gap-6 text-xs font-semibold text-[#4a5666]">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 size={15} className="text-[#0b7a55]" />
                    PWA Ready (No App Store Delay)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 size={15} className="text-[#0b7a55]" />
                    Offline Gate Pass Support
                  </span>
                </div>
              </FadeUp>
            </div>

            {/* Right Phone Frame Mockup */}
            <div className="lg:col-span-6 flex justify-center">
              <FadeUp delay={0.3}>
                <div className="relative mx-auto w-72 rounded-[40px] border-[8px] border-[#0f172a] bg-[#0f172a] p-3 shadow-2xl">
                  {/* Speaker Notch */}
                  <div className="mx-auto h-4 w-28 rounded-full bg-[#1e293b] mb-2" />

                  {/* Phone Screen Contents */}
                  <div className="rounded-[28px] bg-white p-4 space-y-4 text-xs font-sans overflow-hidden">
                    {/* App Header */}
                    <div className="flex items-center justify-between border-b border-[#edf2ef] pb-3">
                      <div className="flex items-center gap-1.5">
                        <div className="flex h-6 w-6 items-center justify-center rounded bg-[#0b7a55] text-white">
                          <svg width="12" height="12" viewBox="0 0 32 32">
                            <path d="M16 3l11 13-11 13L5 16z" fill="#ffffff" />
                          </svg>
                        </div>
                        <span className="font-extrabold text-[#0f172a]">C-Tech Trade</span>
                      </div>
                      <span className="rounded bg-[#e4f2ec] px-1.5 py-0.5 font-mono text-[9.5px] font-bold text-[#0b7a55]">
                        ONLINE
                      </span>
                    </div>

                    {/* Active Shipment Notification Card */}
                    <div className="rounded-xl border border-[#0b7a55]/20 bg-[#e4f2ec] p-3">
                      <div className="flex items-center justify-between text-[11px] font-bold text-[#0b7a55]">
                        <span className="flex items-center gap-1">
                          <Truck size={12} />
                          <span>TANKER DISPATCHED</span>
                        </span>
                        <span className="font-mono text-[10px]">ETA: 2h 45m</span>
                      </div>
                      <div className="mt-1 font-bold text-[#0f172a]">Phenol 99.5% (10 MT)</div>
                      <div className="text-[10px] text-[#4a5666]">Vehicle: GJ-16-AX-8910 (Dedicated SS)</div>
                    </div>

                    {/* Quick Gate Pass QR Code */}
                    <div className="rounded-xl border border-[#dbe1de] bg-[#f8faf9] p-3 text-center space-y-2">
                      <div className="text-[10.5px] font-bold text-[#0f172a]">Weighbridge Plant Gate Pass</div>
                      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-lg bg-white border border-[#dbe1de] shadow-xs">
                        <QrCode size={64} className="text-[#0f172a]" />
                      </div>
                      <div className="font-mono text-[9px] text-[#65717f]">CHALLAN #CT-2026-9041</div>
                    </div>

                    {/* Quick Action Button */}
                    <button className="w-full rounded-xl bg-[#0b7a55] py-2.5 text-center text-[11px] font-bold text-white shadow-xs">
                      View Verified Batch COA
                    </button>
                  </div>
                </div>
              </FadeUp>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- Key Mobile Capabilities ----------------- */}
      <section className="py-20 bg-white border-b border-[#e2e8e5]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Suite Capabilities"
            title="Two Specialized Mobile Workflows"
            description="Purpose-built interfaces tailored for corporate buyers and physical transport drivers."
          />

          <div className="grid gap-8 md:grid-cols-2">
            {/* Procurement Executive App */}
            <div className="card-corporate p-8 space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e4f2ec] text-[#0b7a55]">
                <Smartphone size={24} />
              </div>
              <h3 className="text-xl font-extrabold text-[#0f172a]">The Procurement Executive App</h3>
              <p className="text-xs text-[#4a5666] leading-relaxed">
                For VP Procurement, Chemical Trading Directors, and Plant Sourcing Managers. Review calibrated spot quotations on the factory floor, accept binding Purchase Orders, and inspect gas chromatography testing parameters.
              </p>
              <ul className="space-y-2 text-xs font-semibold text-[#1b2433] pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#0b7a55]" />
                  <span>Instant quote approval and automated Purchase Order dispatch</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#0b7a55]" />
                  <span>Push notification alerts on commodity spot rate shifts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#0b7a55]" />
                  <span>Digital COA vault with one-click PDF sharing</span>
                </li>
              </ul>
            </div>

            {/* Transporter & Driver Gate Pass App */}
            <div id="driver-app" className="card-corporate p-8 space-y-4 border-2 border-[#0b7a55]">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0b7a55] text-white">
                <Truck size={24} />
              </div>
              <h3 className="text-xl font-extrabold text-[#0f172a]">Driver & Weighbridge Gate Pass App</h3>
              <p className="text-xs text-[#4a5666] leading-relaxed">
                For chemical road tanker drivers, dispatch supervisors, and logistics coordinators. Eliminates physical paper friction at plant entry gates, security checkposts, and industrial weighbridges.
              </p>
              <ul className="space-y-2 text-xs font-semibold text-[#1b2433] pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#0b7a55]" />
                  <span>Offline-capable QR gate pass scanning at plant weighbridges</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#0b7a55]" />
                  <span>Integrated E-Way Bill details sheet and hazmat emergency cards</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#0b7a55]" />
                  <span>Electronic delivery signature and weighbridge receipt capture</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- Launch CTA ----------------- */}
      <section className="py-20 bg-[#f8faf9]">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8 space-y-5">
          <h2 className="text-3xl font-extrabold text-[#0f172a]">
            Access C-Tech on Any Device Today
          </h2>
          <p className="text-sm text-[#4a5666] max-w-lg mx-auto">
            No cumbersome app store downloads required. Open C-Tech in your mobile browser and add it to your home screen for instant full-screen execution.
          </p>
          <div className="pt-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-[#0b7a55] px-8 py-3.5 text-sm font-bold text-white shadow-md shadow-[#0b7a55]/20 hover:bg-[#08603f] transition-all"
            >
              <span>Sign In to Mobile Trade Desk</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
