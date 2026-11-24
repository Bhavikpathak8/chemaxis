import { Link } from 'react-router-dom';
import { PhoneCall, Mail, MapPin, ShieldCheck, FileCheck } from 'lucide-react';
import ChemAxisLogo from '../ui/ChemAxisLogo.jsx';

export default function Footer() {
  return (
    <footer className="border-t border-[#e2e8e5] bg-[#0f172a] text-[#94a3b8] text-xs">
      {/* Upper Footer Columns */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Column 1: Brand & Regional Corridor */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center group">
              <ChemAxisLogo theme="dark" variant="full" size={36} />
            </Link>
            <p className="text-xs text-[#94a3b8] leading-relaxed max-w-sm">
              India’s sovereign chemical trading desk. Connecting verified chemical producers, refineries, and importers with enterprise industrial manufacturers with zero counterparty price leakage and row-locked physical fulfillment.
            </p>

            <div className="space-y-2 pt-2 text-[#cbd5e1]">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-[#0b7a55] shrink-0" />
                <span>Dahej PCPIR Corridor Liaison Desk, Bharuch, Gujarat 392015</span>
              </div>
              <div className="flex items-center gap-2">
                <PhoneCall size={14} className="text-[#0b7a55] shrink-0" />
                <span>+91 2642 240000 / +91 98250 00000</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-[#0b7a55] shrink-0" />
                <span>desk@chemaxis.trade / spot.pricing@chemaxis.trade</span>
              </div>
            </div>

            {/* Social & Liaison Links */}
            <div className="pt-2 flex items-center gap-3">
              <span className="text-[11px] font-semibold text-white">Follow Desk:</span>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1e293b] text-[#cbd5e1] hover:bg-[#0b7a55] hover:text-white transition-colors"
                title="LinkedIn"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1e293b] text-[#cbd5e1] hover:bg-[#0b7a55] hover:text-white transition-colors"
                title="X (Twitter)"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a
                href="https://wa.me/919825000000"
                target="_blank"
                rel="noreferrer"
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1e293b] text-[#cbd5e1] hover:bg-[#10b981] hover:text-white transition-colors"
                title="WhatsApp Trade Desk"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Chemical Sectors */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Chemical Catalog</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/chemicals" className="hover:text-white transition-colors">
                  Aromatics (Phenol, Toluene)
                </Link>
              </li>
              <li>
                <Link to="/chemicals" className="hover:text-white transition-colors">
                  Industrial Solvents (Methanol, Acetone)
                </Link>
              </li>
              <li>
                <Link to="/chemicals" className="hover:text-white transition-colors">
                  Acids & Alkalies (Caustic Soda Lye)
                </Link>
              </li>
              <li>
                <Link to="/chemicals" className="hover:text-white transition-colors">
                  Esters & Intermediates (Ethyl Acetate)
                </Link>
              </li>
              <li>
                <Link to="/chemicals" className="hover:text-white transition-colors">
                  Fine & Specialty Reagents
                </Link>
              </li>
              <li>
                <Link to="/chemicals" className="hover:text-white transition-colors font-medium text-[#10b981]">
                  View Full 50+ Directory →
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Platform Portals */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Trade Portals</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/for-buyers" className="hover:text-white transition-colors">
                  Buyer Sourcing Desk
                </Link>
              </li>
              <li>
                <Link to="/become-seller" className="hover:text-white transition-colors">
                  Seller Plant Onboarding
                </Link>
              </li>
              <li>
                <Link to="/app" className="hover:text-white transition-colors">
                  Mobile Trade Suite & App
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-white transition-colors">
                  Market Benchmarks & News
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Corporate Staff Sign In
                </Link>
              </li>
              <li>
                <Link to="/help" className="hover:text-white transition-colors">
                  Support & Help Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Compliance & Operational Standards */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Trust & Compliance</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5 text-[#cbd5e1]">
                <ShieldCheck size={14} className="text-[#10b981]" />
                <span>GSTIN Verification API</span>
              </li>
              <li className="flex items-center gap-1.5 text-[#cbd5e1]">
                <FileCheck size={14} className="text-[#10b981]" />
                <span>Batch COA & MSDS Audit</span>
              </li>
              <li className="flex items-center gap-1.5 text-[#cbd5e1]">
                <ShieldCheck size={14} className="text-[#10b981]" />
                <span>PostgreSQL Row-Locked Stock</span>
              </li>
              <li className="flex items-center gap-1.5 text-[#cbd5e1]">
                <FileCheck size={14} className="text-[#10b981]" />
                <span>IRN-Ready E-Invoice & QR</span>
              </li>
              <li className="flex items-center gap-1.5 text-[#cbd5e1]">
                <ShieldCheck size={14} className="text-[#10b981]" />
                <span>HazMat Class 3/6/8 Logistics</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Industrial Hubs Strip */}
        <div className="mt-12 pt-8 border-t border-[#1e293b]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#cbd5e1]">
              <span className="font-bold text-white">Gujarat Chemical Belt Operational Hubs:</span>
              <span className="rounded bg-[#1e293b] px-2 py-0.5">Dahej PCPIR</span>
              <span className="rounded bg-[#1e293b] px-2 py-0.5">Ankleshwar GIDC</span>
              <span className="rounded bg-[#1e293b] px-2 py-0.5">Panoli Estate</span>
              <span className="rounded bg-[#1e293b] px-2 py-0.5">Hazira Petrochem</span>
              <span className="rounded bg-[#1e293b] px-2 py-0.5">Surat Corridor</span>
              <span className="rounded bg-[#1e293b] px-2 py-0.5">Vapi & Vadodara</span>
            </div>
            <div className="font-mono text-[11px] text-[#94a3b8]">
              Operating Platform v3.0
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Strip */}
      <div className="border-t border-[#1e293b] bg-[#090d16] py-5">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-3 px-4 text-[11px] sm:px-6 lg:px-8">
          <div>
            © {new Date().getFullYear()} ChemAxis Chemicals Pvt Ltd. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <Link to="/about" className="hover:text-white transition-colors">About Desk</Link>
            <Link to="/help" className="hover:text-white transition-colors">Help & FAQ</Link>
            <Link to="/chemicals" className="hover:text-white transition-colors">Chemical Directory</Link>
            <Link to="/login" className="hover:text-white transition-colors font-semibold text-[#10b981]">Portal Access</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
