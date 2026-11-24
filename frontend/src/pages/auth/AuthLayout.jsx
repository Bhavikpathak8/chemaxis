import { Link } from 'react-router-dom';
import { ShieldCheck, Sparkles, ArrowLeft, CheckCircle2 } from 'lucide-react';
import MotionCanvas from '../../components/motion/MotionCanvas.jsx';
import ChemAxisLogo from '../../components/ui/ChemAxisLogo.jsx';

export default function AuthLayout({ title, subtitle, children, wide }) {
  return (
    <div className="min-h-screen bg-[#f1f4f2] text-[#1b2433] md:grid md:grid-cols-[minmax(0,5.5fr)_minmax(0,6.5fr)]">
      {/* Motion-Rich Left Aside Panel */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-[#1c2740] p-10 text-white md:flex border-r border-[#dbe1de]">
        {/* Interactive canvas with light/emerald particles */}
        <MotionCanvas particleCount={40} connectionDistance={120} theme="dark" />

        {/* Ambient glow lights */}
        <div className="pointer-events-none absolute -top-20 -left-20 h-80 w-80 rounded-full bg-[#0b7a55]/25 blur-3xl anim-pulse-glow" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-[#10b981]/15 blur-3xl" />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center justify-between">
          <Link to="/" className="flex items-center group">
            <ChemAxisLogo theme="dark" variant="full" size={36} />
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs text-white transition-colors hover:bg-white/[0.12]"
          >
            <ArrowLeft size={13} />
            <span>Showcase Website</span>
          </Link>
        </div>

        {/* Middle Feature Content */}
        <div className="relative z-10 max-w-[42ch] space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">
            <Sparkles size={13} />
            <span>Zero Price Leakage Protocol</span>
          </div>

          <h2 className="text-[30px] font-bold leading-[1.18] tracking-tight text-white">
            Every chemical transaction, from listing to payment, on one sovereign desk.
          </h2>

          <p className="text-[14.5px] leading-relaxed text-[#8d9bb8]">
            Sellers list stock with encrypted reserve rates, buyers receive transparent quotations, and ChemAxis prices, allocates dedicated tankers, invoices with QR, and settles each order in between.
          </p>

          {/* Micro Visual Card */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-xl backdrop-blur-md space-y-3">
            <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2">
              <span className="font-semibold text-emerald-300 flex items-center gap-1.5">
                <ShieldCheck size={14} />
                <span>Security Enforcement</span>
              </span>
              <span className="font-mono text-[#8d9bb8]">Gujarat Hub</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[12px] text-slate-200">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-400" />
                <span>Row-locked stock</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-400" />
                <span>Redacted identity</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-400" />
                <span>GPS tanker transit</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-400" />
                <span>Automated GST QR</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center justify-between text-[12px] text-[#8d9bb8] font-mono">
          <span>Dahej · Ankleshwar · Surat</span>
          <span>Sovereign Trade Desk v3</span>
        </div>
      </aside>

      {/* Right Main Form Area (Crisp White and Green) */}
      <main className="relative flex items-center justify-center px-5 py-10 bg-[#f1f4f2]">
        <div className={`w-full ${wide ? 'max-w-[560px]' : 'max-w-[420px]'}`}>
          {/* Mobile brand header */}
          <div className="mb-6 flex items-center justify-between md:hidden">
            <Link to="/" className="flex items-center gap-2">
              <ChemAxisLogo theme="light" variant="compact" size={28} />
            </Link>
            <Link to="/" className="text-xs text-[#0b7a55] font-semibold flex items-center gap-1">
              <ArrowLeft size={12} />
              <span>Showcase</span>
            </Link>
          </div>

          {/* Form Card: Crisp White with Green Accents */}
          <div className="rounded-2xl border border-[#dbe1de] bg-white p-7 shadow-lg">
            <h1 className="text-[24px] font-bold tracking-tight text-[#1b2433]">{title}</h1>
            {subtitle ? <p className="mt-1.5 text-[14px] text-[#4a5666]">{subtitle}</p> : null}
            <div className="mt-6">{children}</div>
          </div>
        </div>
      </main>
    </div>
  );
}
