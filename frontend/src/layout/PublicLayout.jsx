import { useEffect } from 'react';
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Mail, MapPin } from 'lucide-react';
import { useAuth, ROLE_HOME } from '../lib/auth.jsx';

import ChemAxisLogo from '../components/ui/ChemAxisLogo.jsx';

export default function PublicLayout() {
  const { user } = useAuth();
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const navLinks = [
    { to: '/', label: 'Home', end: true },
    { to: '/chemicals', label: 'Chemical Directory' },
    { to: '/how-it-works', label: 'How It Works' },
    { to: '/for-sellers', label: 'For Sellers' },
    { to: '/for-buyers', label: 'For Buyers' },
    { to: '/compliance', label: 'Hubs & Compliance' },
  ];

  return (
    <div className="min-h-screen bg-[#f8faf9] text-[#1b2433] font-sans antialiased flex flex-col selection:bg-[#0b7a55] selection:text-white">
      {/* ----------------- Top Navigation Bar ----------------- */}
      <header className="sticky top-0 z-50 border-b border-[#e2e8e5] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center group">
            <ChemAxisLogo theme="light" variant="full" size={34} />
          </Link>
                  TRADE DESK
                </span>
              </div>
            </div>
          </Link>

          {/* Nav Items */}
          <nav className="hidden lg:flex items-center gap-6 text-[13.5px] font-medium text-[#4a5666]">
            {navLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `transition-colors py-1 border-b-2 ${isActive
                    ? 'border-[#0b7a55] text-[#0b7a55] font-semibold'
                    : 'border-transparent hover:text-[#0b7a55]'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-[#0b7a55]/20 bg-[#e4f2ec] px-2.5 py-1 text-[11px] font-mono font-semibold text-[#0b7a55]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0b7a55] animate-pulse" />
              <span>Dahej • Ankleshwar Desk Live</span>
            </div>

            {user ? (
              <Link
                to={ROLE_HOME[user.role] || '/login'}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#0b7a55] px-3.5 py-2 text-[13px] font-bold text-white shadow-xs transition-colors hover:bg-[#08603f]"
              >
                <span>Workspace ({user.role})</span>
                <ArrowRight size={14} />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-lg border border-[#e2e8e5] bg-white px-3.5 py-2 text-[13px] font-semibold text-[#1b2433] transition-colors hover:border-[#0b7a55] hover:bg-[#f8faf9]"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-[#0b7a55] px-3.5 py-2 text-[13px] font-bold text-white shadow-xs transition-colors hover:bg-[#08603f]"
                >
                  Register Plant
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation Sub-bar */}
        <div className="flex lg:hidden overflow-x-auto border-t border-[#e2e8e5] bg-[#f8faf9] px-4 py-2 text-xs font-medium text-[#4a5666] gap-4 scrollbar-none">
          {navLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `whitespace-nowrap py-0.5 ${isActive ? 'text-[#0b7a55] font-bold' : 'hover:text-[#0b7a55]'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </header>

      {/* ----------------- Page Content ----------------- */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ----------------- Clean Corporate Footer ----------------- */}
      <footer className="border-t border-[#e2e8e5] bg-white text-[#4a5666] text-xs">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
            {/* Column 1: Company Info */}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded bg-[#0b7a55] text-white">
                  <svg width="16" height="16" viewBox="0 0 32 32" aria-hidden>
                    <path d="M16 3l11 13-11 13L5 16z" fill="#ffffff" />
                    <path d="M16 10l5.5 6-5.5 6-5.5-6z" fill="#0B7A55" />
                  </svg>
                </div>
                <span className="text-sm font-bold text-[#1b2433]">ChemAxis Chemicals Pvt Ltd</span>
              </div>
              <p className="text-[#65717f] text-xs leading-relaxed max-w-sm">
                Gujarat's dedicated B2B industrial chemical spot trading desk. Connecting verified chemical manufacturing plants across Dahej PCPIR, Ankleshwar, Hazira, and Panoli with institutional buyers.
              </p>
              <div className="pt-1 text-[#65717f] space-y-1">
                <div className="flex items-center gap-2">
                  <MapPin size={13} className="text-[#0b7a55]" />
                  <span>Plot 42, GIDC Industrial Estate, Bharuch - 392015, Gujarat</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={13} className="text-[#0b7a55]" />
                  <span>desk@chemaxis.trade · +91 (02642) 240000</span>
                </div>
              </div>
            </div>

            {/* Column 2: Navigation */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1b2433] mb-3">Trading Desk</h4>
              <ul className="space-y-2 text-xs">
                <li><Link to="/chemicals" className="hover:text-[#0b7a55] transition-colors">Chemical Directory</Link></li>
                <li><Link to="/how-it-works" className="hover:text-[#0b7a55] transition-colors">Transaction Flow</Link></li>
                <li><Link to="/for-sellers" className="hover:text-[#0b7a55] transition-colors">Sell Bulk Inventory</Link></li>
                <li><Link to="/for-buyers" className="hover:text-[#0b7a55] transition-colors">Source Bulk Chemicals</Link></li>
                <li><Link to="/compliance" className="hover:text-[#0b7a55] transition-colors">Gujarat Hubs & Compliance</Link></li>
              </ul>
            </div>

            {/* Column 3: Active Commodities */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1b2433] mb-3">Core Chemicals</h4>
              <ul className="space-y-2 text-xs">
                <li><Link to="/chemicals?q=Phenol" className="hover:text-[#0b7a55] transition-colors">Phenol 99.5% CP</Link></li>
                <li><Link to="/chemicals?q=Caustic" className="hover:text-[#0b7a55] transition-colors">Caustic Soda Lye 48%</Link></li>
                <li><Link to="/chemicals?q=Methanol" className="hover:text-[#0b7a55] transition-colors">Methanol Pure Grade</Link></li>
                <li><Link to="/chemicals?q=Acetone" className="hover:text-[#0b7a55] transition-colors">Acetone Commercial</Link></li>
                <li><Link to="/chemicals?q=Toluene" className="hover:text-[#0b7a55] transition-colors">Toluene High Purity</Link></li>
              </ul>
            </div>

            {/* Column 4: Compliance & Access */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1b2433] mb-3">Regulatory</h4>
              <ul className="space-y-2 text-xs text-[#65717f]">
                <li className="flex items-center gap-1.5"><ShieldCheck size={13} className="text-[#0b7a55]" /> GST e-Invoice QR Code</li>
                <li className="flex items-center gap-1.5"><ShieldCheck size={13} className="text-[#0b7a55]" /> E-Way Bill Details Sheet</li>
                <li className="flex items-center gap-1.5"><ShieldCheck size={13} className="text-[#0b7a55]" /> PESO & HazMat Transport</li>
                <li className="flex items-center gap-1.5"><ShieldCheck size={13} className="text-[#0b7a55]" /> Row-Locked Stock Engine</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t border-[#e2e8e5] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#65717f]">
            <p>© {new Date().getFullYear()} ChemAxis Chemicals Pvt Ltd. All rights reserved.</p>
            <div className="flex gap-4">
              <Link to="/login" className="hover:text-[#0b7a55]">Staff Login</Link>
              <Link to="/register" className="hover:text-[#0b7a55]">Register Plant</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
