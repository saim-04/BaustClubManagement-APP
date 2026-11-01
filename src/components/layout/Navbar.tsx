import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import {
  Compass,
  Calendar,
  Bell,
  Users,
  Settings,
  LogOut,
  ShieldCheck,
  Award,
  GraduationCap,
  Menu,
  X,
  ChevronDown,
  Building,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenLogin: (role?: 'student' | 'clubAdmin' | 'superAdmin') => void;
  onOpenSignup: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenLogin,
  onOpenSignup
}) => {
  const { user, role, club, logout, switchDemoAccount } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Define role-specific navigation links adhering to Top Bar Contract (4-5 single-line links)
  const getNavLinks = () => {
    if (role === 'superAdmin') {
      return [
        { id: 'admin-dashboard', label: 'Overview' },
        { id: 'room-allocation', label: 'Facilities' },
        { id: 'browse-clubs', label: 'Public View' }
      ];
    }
    if (role === 'clubAdmin') {
      return [
        { id: 'club-dashboard', label: 'Dashboard' },
        { id: 'manage-members', label: 'Members' },
        { id: 'pending-applications', label: 'Admissions' },
        { id: 'manage-events', label: 'Events' },
        { id: 'collaboration-hub', label: 'Collaboration' },
        { id: 'equipment-management', label: 'Equipment' },
        { id: 'room-allocation', label: 'Rooms' }
      ];
    }
    // Student or unauthenticated
    return [
      { id: 'student-dashboard', label: 'Dashboard' },
      { id: 'browse-clubs', label: 'Clubs' },
      { id: 'my-clubs', label: 'My Clubs' },
      { id: 'events', label: 'Events' },
      { id: 'announcements', label: 'Notices' }
    ];
  };

  const navLinks = getNavLinks();

  const handleNavClick = (viewId: string) => {
    onNavigate(viewId);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* ZONE 1: Brand Title (Single text element wordmark) */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                if (role === 'superAdmin') onNavigate('admin-dashboard');
                else if (role === 'clubAdmin') onNavigate('club-dashboard');
                else onNavigate('student-dashboard');
              }}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-2xs font-bold text-sm">
                B
              </div>
              <div>
                <span className="text-base font-bold text-slate-900 tracking-tight block leading-tight whitespace-nowrap">
                  BAUST Club Hub
                </span>
              </div>
            </button>
          </div>

          {/* ZONE 2: 4-5 Navigation Links (single-line, whitespace-nowrap) */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`whitespace-nowrap transition-colors py-1 relative ${
                  currentView === link.id
                    ? 'text-sky-700 font-bold'
                    : 'hover:text-slate-900'
                }`}
              >
                {link.label}
                {currentView === link.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-600 rounded-full" />
                )}
              </button>
            ))}
          </nav>

          {/* ZONE 3: 1 Primary Action / Profile Zone */}
          <div className="flex items-center gap-3 shrink-0">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                  aria-expanded={isProfileOpen}
                >
                  <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">
                    {user.name.charAt(0)}
                  </div>
                  <div className="hidden sm:block text-left text-xs leading-tight">
                    <p className="font-semibold text-slate-900 truncate max-w-[120px]">{user.name}</p>
                    <span className="text-[10px] text-slate-500 font-medium capitalize">
                      {role === 'superAdmin'
                        ? 'Super Admin (ASW)'
                        : role === 'clubAdmin'
                        ? `President (${club ? club.name.split(' ')[1] || 'Club' : 'Club'})`
                        : 'Student'}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <div
                    className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95"
                    onMouseLeave={() => setIsProfileOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                        Role: {role}
                      </span>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          onNavigate('account-settings');
                          setIsProfileOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                      >
                        <Settings className="w-4 h-4 text-slate-400" />
                        Account Settings & Password
                      </button>

                      {role === 'student' && (
                        <button
                          onClick={() => {
                            onNavigate('my-applications');
                            setIsProfileOpen(false);
                          }}
                          className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                        >
                          <Calendar className="w-4 h-4 text-slate-400" />
                          My Applications & Events
                        </button>
                      )}
                    </div>

                    <div className="pt-1 border-t border-slate-100">
                      <button
                        onClick={() => {
                          logout();
                          setIsProfileOpen(false);
                          onNavigate('student-dashboard');
                        }}
                        className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenLogin('student')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={onOpenSignup}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition-colors whitespace-nowrap"
                >
                  Register
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              aria-label="Toggle Navigation"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                currentView === link.id
                  ? 'bg-sky-50 text-sky-700 font-bold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {link.label}
            </button>
          ))}
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => handleNavClick('account-settings')}
              className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              Account Settings
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
