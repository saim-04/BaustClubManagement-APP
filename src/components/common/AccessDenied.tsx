import React from 'react';
import { ShieldAlert, ArrowLeft, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AccessDeniedProps {
  requiredRole?: string;
  onNavigateHome: () => void;
  onOpenLogin?: () => void;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({
  requiredRole,
  onNavigateHome,
  onOpenLogin
}) => {
  const { user, role, switchDemoAccount } = useAuth();

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Access Denied</h2>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          {requiredRole
            ? `You need ${requiredRole} privileges to view this section.`
            : 'You do not have administrative authorization to access this area.'}
          {user && (
            <span className="block mt-2 text-xs text-slate-500 font-mono">
              Currently authenticated as: {user.name} ({user.role})
            </span>
          )}
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={onNavigateHome}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Dashboard
          </button>

          {onOpenLogin && (
            <button
              onClick={onOpenLogin}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Sign in with Authorized Account
            </button>
          )}

          {/* Quick Demo Assist */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-500 mb-2 font-medium">Quick switch to an authorized role:</p>
            <div className="flex justify-center gap-2">
              {requiredRole?.toLowerCase().includes('admin') && (
                <button
                  onClick={() => switchDemoAccount('clubAdmin')}
                  className="px-3 py-1.5 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-medium transition-colors"
                >
                  Switch to Club President
                </button>
              )}
              {requiredRole?.toLowerCase().includes('super') && (
                <button
                  onClick={() => switchDemoAccount('superAdmin')}
                  className="px-3 py-1.5 text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg font-medium transition-colors"
                >
                  Switch to Super Admin (ASW)
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
