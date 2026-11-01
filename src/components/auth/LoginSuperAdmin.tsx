import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

interface LoginSuperAdminProps {
  onSuccess: () => void;
  onForgotPassword: () => void;
}

export const LoginSuperAdmin: React.FC<LoginSuperAdminProps> = ({ onSuccess, onForgotPassword }) => {
  const { loginSuperAdmin } = useAuth();
  const { success } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both administrative email and password');
      return;
    }

    setIsSubmitting(true);
    try {
      await loginSuperAdmin(email, password);
      success('Logged in as ASW Super Administrator', 'Executive Authorization Confirmed');
      onSuccess();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Invalid administrative credentials');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('asw@baust.edu.bd');
    setPassword('Admin@123');
    setErrorMsg('');
  };

  return (
    <div className="max-w-md w-full mx-auto bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
      <div className="text-center mb-6">
        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">ASW Administration Login</h2>
        <p className="text-xs text-slate-500 mt-1">Directorate of Students' Welfare — BAUST Executive Portal</p>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            ASW Officer Email
          </label>
          <input
            type="email"
            placeholder="asw@baust.edu.bd"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errorMsg) setErrorMsg('');
            }}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-purple-500 focus:outline-none transition-colors"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-700">Password</label>
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-xs text-purple-600 hover:text-purple-700 font-medium transition-colors"
            >
              Forgot Password?
            </button>
          </div>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errorMsg) setErrorMsg('');
            }}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-purple-500 focus:outline-none transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-2 py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? 'Verifying Credentials...' : 'Authenticate ASW Admin'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Quick demo autofill */}
      <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
        <div className="text-left">
          <p className="text-xs font-medium text-slate-700">ASW Demo Account</p>
          <p className="text-[11px] text-slate-500 font-mono">asw@baust.edu.bd / Admin@123</p>
        </div>
        <button
          type="button"
          onClick={handleFillDemo}
          className="px-2.5 py-1 text-xs font-medium bg-white border border-slate-200 text-purple-700 rounded-lg shadow-xs hover:bg-purple-50 transition-colors flex items-center gap-1"
        >
          <Sparkles className="w-3 h-3 text-purple-500" />
          Auto-fill
        </button>
      </div>
    </div>
  );
};
