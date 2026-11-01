import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Award, ArrowRight, Sparkles } from 'lucide-react';

interface LoginClubAdminProps {
  onSuccess: () => void;
  onForgotPassword: () => void;
}

export const LoginClubAdmin: React.FC<LoginClubAdminProps> = ({ onSuccess, onForgotPassword }) => {
  const { loginClubPresident } = useAuth();
  const { success } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both your university email and password');
      return;
    }

    setIsSubmitting(true);
    try {
      await loginClubPresident(email, password);
      success('Logged in as Club President', 'Authorization Confirmed');
      onSuccess();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Invalid president credentials');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemoBCC = () => {
    setEmail('bcc.president@baust.edu.bd');
    setPassword('President@123');
    setErrorMsg('');
  };

  const handleFillDemoRobotics = () => {
    setEmail('robotics.president@baust.edu.bd');
    setPassword('President@123');
    setErrorMsg('');
  };

  return (
    <div className="max-w-md w-full mx-auto bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
      <div className="text-center mb-6">
        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
          <Award className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Club President Portal</h2>
        <p className="text-xs text-slate-500 mt-1">Sign in to manage your club members, events & equipment</p>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Official President Email
          </label>
          <input
            type="email"
            placeholder="bcc.president@baust.edu.bd"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errorMsg) setErrorMsg('');
            }}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:outline-none transition-colors"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-700">Password</label>
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
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
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:outline-none transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? 'Authenticating...' : 'Sign In as Club President'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Quick demo autofill buttons */}
      <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
        <p className="text-xs font-medium text-slate-700">Pre-Configured Demo Accounts:</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={handleFillDemoBCC}
            className="flex-1 px-2.5 py-1.5 text-xs font-medium bg-white border border-slate-200 text-indigo-700 rounded-lg hover:bg-indigo-50 transition-colors flex items-center justify-center gap-1 shadow-2xs"
          >
            <Sparkles className="w-3 h-3 text-indigo-500" />
            BCC President
          </button>
          <button
            type="button"
            onClick={handleFillDemoRobotics}
            className="flex-1 px-2.5 py-1.5 text-xs font-medium bg-white border border-slate-200 text-indigo-700 rounded-lg hover:bg-indigo-50 transition-colors flex items-center justify-center gap-1 shadow-2xs"
          >
            <Sparkles className="w-3 h-3 text-indigo-500" />
            Robotics President
          </button>
        </div>
      </div>
    </div>
  );
};
