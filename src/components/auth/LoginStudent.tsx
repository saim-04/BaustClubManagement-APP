import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { GraduationCap, ArrowRight, Sparkles } from 'lucide-react';

interface LoginStudentProps {
  onSuccess: () => void;
  onGoToSignup: () => void;
  onForgotPassword: () => void;
}

export const LoginStudent: React.FC<LoginStudentProps> = ({
  onSuccess,
  onGoToSignup,
  onForgotPassword
}) => {
  const { loginStudent } = useAuth();
  const { success } = useToast();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!identifier.trim() || !password) {
      setErrorMsg('Invalid ID or password');
      return;
    }

    setIsSubmitting(true);
    try {
      await loginStudent(identifier, password);
      success('Logged in successfully as Student', 'Welcome Back');
      onSuccess();
    } catch {
      setErrorMsg('Invalid ID or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemo = () => {
    setIdentifier('210101045');
    setPassword('Student@123');
    setErrorMsg('');
  };

  return (
    <div className="max-w-md w-full mx-auto bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
      <div className="text-center mb-6">
        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
          <GraduationCap className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Student Portal Login</h2>
        <p className="text-xs text-slate-500 mt-1">Sign in with your BAUST Student ID or Email</p>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Student ID or University Email
          </label>
          <input
            type="text"
            placeholder="e.g. 210101045 or fahim.cse@baust.edu.bd"
            value={identifier}
            onChange={(e) => {
              setIdentifier(e.target.value);
              if (errorMsg) setErrorMsg('');
            }}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-sky-500 focus:outline-none transition-colors"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-700">Password</label>
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-xs text-sky-600 hover:text-sky-700 font-medium transition-colors"
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
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-sky-500 focus:outline-none transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-2 py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? 'Verifying...' : 'Sign In'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Quick demo autofill */}
      <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
        <div className="text-left">
          <p className="text-xs font-medium text-slate-700">Quick Test Credentials</p>
          <p className="text-[11px] text-slate-500 font-mono">ID: 210101045 / Student@123</p>
        </div>
        <button
          type="button"
          onClick={handleFillDemo}
          className="px-2.5 py-1 text-xs font-medium bg-white border border-slate-200 text-sky-700 rounded-lg shadow-xs hover:bg-sky-50 transition-colors flex items-center gap-1"
        >
          <Sparkles className="w-3 h-3 text-sky-500" />
          Auto-fill
        </button>
      </div>

      <div className="mt-6 text-center text-xs text-slate-500">
        New student at BAUST?{' '}
        <button
          onClick={onGoToSignup}
          className="text-sky-600 hover:text-sky-700 font-semibold transition-colors"
        >
          Create account
        </button>
      </div>
    </div>
  );
};
