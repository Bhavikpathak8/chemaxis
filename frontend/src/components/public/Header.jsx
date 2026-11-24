import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  Menu,
  X,
  ArrowRight,
} from 'lucide-react';
import { useAuth, ROLE_HOME } from '../../lib/auth.jsx';
import ChemAxisLogo from '../ui/ChemAxisLogo.jsx';

export default function Header() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Chemicals', to: '/chemicals' },
    { label: 'For Buyers', to: '/for-buyers' },
    { label: 'Become a Seller', to: '/become-seller' },
    { label: 'Platform App', to: '/app' },
    { label: 'Market Insights', to: '/blog' },
    { label: 'About', to: '/about' },
    { label: 'Help Desk', to: '/help' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#e2e8e5] shadow-xs">
      {/* Main Corporate Navbar */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo with ChemAxis Modern Molecular Axis */}
        <Link to="/" className="flex items-center group">
          <ChemAxisLogo theme="light" variant="full" size={36} />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-[13.5px] font-semibold text-[#4a5666]">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `transition-colors py-1 hover:text-[#0b7a55] ${
                  isActive ? 'text-[#0b7a55] border-b-2 border-[#0b7a55]' : ''
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Right Action Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          {user ? (
            <Link
              to={ROLE_HOME[user.role] || '/login'}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#0b7a55] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#08603f] transition-all"
            >
              <span>{user.role} Workspace</span>
              <ArrowRight size={14} />
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="rounded-lg border border-[#e2e8e5] bg-white px-3.5 py-2 text-xs font-semibold text-[#1b2433] hover:border-[#0b7a55] hover:bg-[#f8faf9] transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register/seller"
                className="rounded-lg bg-[#0b7a55] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#08603f] transition-colors"
              >
                Register Plant
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-[#1b2433] hover:bg-[#f1f4f2]"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-[#e2e8e5] bg-white px-4 pt-3 pb-6 space-y-3">
          <nav className="flex flex-col space-y-2">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-[#1b2433] hover:bg-[#f1f4f2]"
            >
              Home Overview
            </Link>
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-[#1b2433] hover:bg-[#f1f4f2]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="pt-3 border-t border-[#e2e8e5] flex flex-col gap-2">
            {user ? (
              <Link
                to={ROLE_HOME[user.role] || '/login'}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center rounded-lg bg-[#0b7a55] py-2.5 text-xs font-bold text-white"
              >
                Go to {user.role} Workspace
              </Link>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg border border-[#e2e8e5] py-2 text-center text-xs font-semibold text-[#1b2433]"
                >
                  Sign In
                </Link>
                <Link
                  to="/register/seller"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg bg-[#0b7a55] py-2 text-center text-xs font-bold text-white"
                >
                  Register Plant
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
