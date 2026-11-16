import React, { useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  User as UserIcon,
  FilePlus2,
  ClipboardList,
  Users,
  Tag,
  Scale,
  Bell,
  PackageCheck,
  Settings,
  LogOut,
  Menu,
  X,
  Building2,
  CarFront,
  BarChart3,
  Layers,
  Store,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import { useApp } from '../store/AppContext';

interface WorkspaceLayoutProps {
  mode: 'user' | 'admin';
}

export const WorkspaceLayout: React.FC<WorkspaceLayoutProps> = ({ mode }) => {
  const { currentUser, db, logout } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const unreadCount = db.notifications.filter((n) => {
    const audience = mode === 'admin' ? 'admin' : currentUser?.id;
    return !n.isRead && (n.userId === audience || n.userId === currentUser?.id);
  }).length;

  const userNav = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/dashboard/requests/new', label: 'New Car Request', icon: FilePlus2 },
    { to: '/dashboard/requests', label: 'My Car Requests', icon: ClipboardList, end: true },
    { to: '/dashboard/groups', label: 'My Groups', icon: Users },
    { to: '/dashboard/offers', label: 'Dealer Offers', icon: Tag },
    { to: '/dashboard/compare', label: 'Offer Comparison', icon: Scale },
    { to: '/dashboard/purchases', label: 'Purchase Tracking', icon: PackageCheck },
    {
      to: '/dashboard/notifications',
      label: unreadCount > 0 ? `Notifications (${unreadCount})` : 'Notifications',
      icon: Bell,
    },
    { to: '/dashboard/profile', label: 'My Profile', icon: UserIcon },
    { to: '/dashboard/settings', label: 'Account Settings', icon: Settings },
  ];

  const adminNav = [
    { to: '/admin', label: 'Admin Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/users', label: 'User Management', icon: Users },
    { to: '/admin/brands', label: 'Car Brands', icon: Layers },
    { to: '/admin/models', label: 'Models & Variants', icon: CarFront },
    { to: '/admin/requests', label: 'Request Management', icon: ClipboardList },
    { to: '/admin/groups', label: 'Group Management', icon: Building2 },
    { to: '/admin/dealers', label: 'Dealer Management', icon: Store },
    { to: '/admin/offers', label: 'Dealer Offers', icon: Tag },
    { to: '/admin/purchases', label: 'Purchase Management', icon: PackageCheck },
    { to: '/admin/reports', label: 'Reports & Analytics', icon: BarChart3 },
    { to: '/admin/settings', label: 'Admin Settings', icon: Settings },
  ];

  const items = mode === 'admin' ? adminNav : userNav;

  const activeNav =
    items.find((item) =>
      item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
    ) || items[0];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#F8F8F6] text-[#17191D] flex">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#17191D]/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#E4E4E0] flex flex-col transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 px-5 border-b border-[#ECECE8] flex items-center justify-between">
          <Link
            to="/"
            className="text-base font-extrabold tracking-tight text-[#17191D] font-display whitespace-nowrap"
          >
            AutoCollective
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
            className="lg:hidden p-1.5 rounded text-[#5A5F6B] hover:text-[#17191D]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-4 py-3 border-b border-[#ECECE8]">
          <p className="text-xs font-semibold text-[#6F7480]">
            {mode === 'admin' ? 'Administration Console' : 'Buyer Workspace'}
          </p>
          <p className="text-sm font-semibold text-[#17191D] truncate mt-0.5">
            {currentUser?.name}
          </p>
          <p className="text-xs text-[#5A5F6B] truncate">{currentUser?.email}</p>
        </div>

        <nav aria-label="Workspace navigation" className="flex-1 overflow-y-auto p-3 space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-[#EBF3F0] text-[#176B50] font-semibold'
                      : 'text-[#4A4F59] hover:bg-[#F4F4F0] hover:text-[#17191D]'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-3 border-t border-[#ECECE8] space-y-1">
          <Link
            to="/"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-[#4A4F59] hover:bg-[#F4F4F0] hover:text-[#17191D] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span>Public Website</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-red-700 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 bg-white border-b border-[#E4E4E0] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden p-2 rounded-lg border border-[#D8D8D2] text-[#17191D]"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5 text-sm text-[#5A5F6B] min-w-0">
              <span className="hidden sm:inline whitespace-nowrap">
                {mode === 'admin' ? 'Admin' : 'Buyer'}
              </span>
              <ChevronRight className="hidden sm:inline w-4 h-4 shrink-0 text-[#9CA3AF]" />
              <span className="font-semibold text-[#17191D] truncate">{activeNav.label}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {mode === 'user' ? (
              <Link
                to="/dashboard/requests/new"
                className="px-4 py-2 text-xs font-semibold text-white bg-[#176B50] rounded-lg hover:bg-[#125640] transition-colors whitespace-nowrap shrink-0"
              >
                New Car Request
              </Link>
            ) : (
              <Link
                to="/admin/offers"
                className="px-4 py-2 text-xs font-semibold text-white bg-[#176B50] rounded-lg hover:bg-[#125640] transition-colors whitespace-nowrap shrink-0"
              >
                Manage Offers
              </Link>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
