import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { db } from '../../services/db';
import { UserRole } from '../../types';
import { Sparkles, Shield, User, Award, RotateCcw, Key } from 'lucide-react';

interface RoleQuickSwitcherProps {
  onNavigate: (view: string) => void;
  onOpenLogin: (role?: 'student' | 'clubAdmin' | 'superAdmin') => void;
}

export const RoleQuickSwitcher: React.FC<RoleQuickSwitcherProps> = ({ onNavigate, onOpenLogin }) => {
  const { user, role, switchDemoAccount, refreshUser } = useAuth();
  const { success } = useToast();

  const handleSwitch = (targetRole: UserRole, targetClubId?: string) => {
    switchDemoAccount(targetRole, targetClubId);
    success(
      `Switched session to ${
        targetRole === 'superAdmin'
          ? 'ASW Super Administrator'
          : targetRole === 'clubAdmin'
          ? targetClubId === 'c2'
            ? 'BRMC President'
            : 'BCC President'
          : 'General Student (Fahim)'
      }`,
      'Active Session Changed'
    );
    if (targetRole === 'superAdmin') onNavigate('admin-dashboard');
    else if (targetRole === 'clubAdmin') onNavigate('club-dashboard');
    else onNavigate('student-dashboard');
  };

  const handleResetData = () => {
    if (window.confirm('Reset database back to initial BAUST seed data?')) {
      db.resetToDefaults();
      refreshUser();
      success('Database restored to default demo state', 'Reset Complete');
      onNavigate('student-dashboard');
    }
  };

  return (
    <aside aria-label="Demo Role Switcher" className="bg-slate-900 text-white border-b border-slate-800 px-4 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="font-semibold text-slate-200">Role Preview:</span>
          <span className="text-slate-400">
            Current:{' '}
            <strong className="text-white font-mono">
              {role === 'superAdmin'
                ? 'Super Admin (ASW)'
                : role === 'clubAdmin'
                ? `Club Admin (${user?.name})`
                : 'Student'}
            </strong>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => handleSwitch('student')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1 ${
              role === 'student'
                ? 'bg-sky-500 text-white shadow-2xs'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <User className="w-3 h-3" />
            Student View
          </button>

          <button
            onClick={() => handleSwitch('clubAdmin', 'c1')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1 ${
              role === 'clubAdmin' && user?.clubId === 'c1'
                ? 'bg-indigo-500 text-white shadow-2xs'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Award className="w-3 h-3" />
            President (BCC)
          </button>

          <button
            onClick={() => handleSwitch('clubAdmin', 'c2')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1 ${
              role === 'clubAdmin' && user?.clubId === 'c2'
                ? 'bg-indigo-500 text-white shadow-2xs'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Award className="w-3 h-3" />
            President (Robotics)
          </button>

          <button
            onClick={() => handleSwitch('superAdmin')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1 ${
              role === 'superAdmin'
                ? 'bg-purple-500 text-white shadow-2xs'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Shield className="w-3 h-3" />
            ASW Super Admin
          </button>

          <div className="h-3 w-px bg-slate-700 mx-1 hidden sm:block" />

          {/* ASW login direct route test */}
          <button
            onClick={() => onNavigate('admin-login')}
            className="px-2 py-1 text-[11px] text-slate-400 hover:text-purple-300 font-medium transition-colors"
            title="Open dedicated /admin/login screen"
          >
            /admin/login
          </button>

          <button
            onClick={handleResetData}
            className="px-2 py-1 text-[11px] text-slate-400 hover:text-rose-300 font-medium transition-colors flex items-center gap-1"
            title="Reset storage to initial state"
          >
            <RotateCcw className="w-3 h-3" />
            Reset Data
          </button>
        </div>
      </div>
    </aside>
  );
};
