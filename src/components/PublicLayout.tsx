import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useApp } from '../store/AppContext';

export const PublicLayout: React.FC = () => {
  const { currentUser, db } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { to: '/cars', label: 'Explore Cars' },
    { to: '/groups', label: 'Group Deals' },
    { to: '/how-it-works', label: 'How It Works' },
    { to: '/faq', label: 'FAQ' },
    { to: '/contact', label: 'Contact' },
  ];

  const primaryActionPath = currentUser
    ? currentUser.role === 'admin'
      ? '/admin'
      : '/dashboard'
    : '/login';

  const primaryActionLabel = currentUser
    ? currentUser.role === 'admin'
      ? 'Admin Console'
      : 'Dashboard'
    : 'Sign In';

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F8F6] text-[#17191D]">
      {db.settings.maintenanceNotice && (
        <div className="bg-[#176B50] text-white text-xs py-2 px-4 text-center font-medium">
          {db.settings.maintenanceNotice}
        </div>
      )}

      {/* Strict 3-zone Top Bar Contract */}
      <header className="sticky top-0 z-40 bg-[#F8F8F6]/95 backdrop-blur-sm border-b border-[#E4E4E0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single text element wordmark */}
          <Link
            to="/"
            className="text-lg font-extrabold tracking-tight text-[#17191D] font-display whitespace-nowrap shrink-0"
          >
            AutoCollective
          </Link>

          {/* Zone 2: 5 concise single-line text nav links */}
          <nav
            aria-label="Main navigation"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-[#4A4F59]"
          >
            {navLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `whitespace-nowrap shrink-0 transition-colors hover:text-[#17191D] ${
                    isActive
                      ? 'text-[#176B50] font-semibold underline underline-offset-8 decoration-2'
                      : ''
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Zone 3: 1 primary action + mobile menu trigger */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => navigate(primaryActionPath)}
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-white bg-[#176B50] rounded-lg hover:bg-[#125640] transition-colors whitespace-nowrap shrink-0"
            >
              {primaryActionLabel}
            </button>

            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileOpen}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-lg border border-[#D8D8D2] bg-white text-[#17191D]"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div className="md:hidden border-t border-[#E4E4E0] bg-white px-4 py-4 space-y-2">
            {navLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2.5 rounded-lg text-sm font-medium ${
                    isActive ? 'bg-[#EBF3F0] text-[#176B50]' : 'text-[#17191D] hover:bg-[#F4F4F0]'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <div className="pt-2 border-t border-[#ECECE8] flex flex-col gap-2">
              <Link
                to={primaryActionPath}
                onClick={() => setMobileOpen(false)}
                className="w-full text-center px-4 py-2.5 text-sm font-semibold text-white bg-[#176B50] rounded-lg"
              >
                {primaryActionLabel}
              </Link>
              {!currentUser && (
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="w-full text-center px-4 py-2.5 text-sm font-medium text-[#17191D] border border-[#D8D8D2] rounded-lg"
                >
                  Create Account
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-[#E4E4E0] mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <Link
                to="/"
                className="text-lg font-extrabold tracking-tight text-[#17191D] font-display"
              >
                AutoCollective
              </Link>
              <p className="text-sm font-medium text-[#176B50] mt-1">
                Buy Together. Save Together.
              </p>
              <p className="text-xs text-[#5A5F6B] mt-3 leading-relaxed">
                AutoCollective connects verified car buyers with authorized dealerships to
                facilitate collective quotations. We do not sell vehicles directly or guarantee
                discounts.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-[#17191D] tracking-wide mb-3">Platform</h4>
              <ul className="space-y-2 text-sm text-[#5A5F6B]">
                <li>
                  <Link to="/cars" className="hover:text-[#17191D] transition-colors">
                    Explore Cars
                  </Link>
                </li>
                <li>
                  <Link to="/groups" className="hover:text-[#17191D] transition-colors">
                    Browse Group Deals
                  </Link>
                </li>
                <li>
                  <Link to="/how-it-works" className="hover:text-[#17191D] transition-colors">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link
                    to="/dashboard/requests/new"
                    className="hover:text-[#17191D] transition-colors"
                  >
                    Start a Car Request
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-[#17191D] tracking-wide mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-[#5A5F6B]">
                <li>
                  <Link to="/about" className="hover:text-[#17191D] transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="hover:text-[#17191D] transition-colors">
                    Frequently Asked Questions
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-[#17191D] transition-colors">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-[#17191D] tracking-wide mb-3">
                Account & Legal
              </h4>
              <ul className="space-y-2 text-sm text-[#5A5F6B]">
                <li>
                  <Link to="/login" className="hover:text-[#17191D] transition-colors">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="hover:text-[#17191D] transition-colors">
                    Register
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-[#17191D] transition-colors">
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="hover:text-[#17191D] transition-colors">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-[#ECECE8] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#6F7480]">
            <p>© {new Date().getFullYear()} AutoCollective. Demonstration Platform.</p>
            <p>
              Support: {db.settings.supportEmail} · {db.settings.supportPhone}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
