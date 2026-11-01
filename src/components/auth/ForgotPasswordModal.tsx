import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { api, ApiError } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { KeyRound, Mail, CheckCircle2, Copy } from 'lucide-react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPasswordResetComplete: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onPasswordResetComplete
}) => {
  const { success } = useToast();

  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  const [tokenInput, setTokenInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [copied, setCopied] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRequestToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim()) {
      setErrorMsg('Please enter your university email');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.requestPasswordReset(email);
      setGeneratedCode(res.token);
      setTokenInput(res.token); // Auto populate for convenient testing
      setStep('reset');
      success('Password reset token generated!', 'Verification Code Sent');
    } catch (err: unknown) {
      if (err instanceof ApiError) setErrorMsg(err.message);
      else setErrorMsg('Could not process password reset request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!tokenInput.trim()) {
      setErrorMsg('Please enter the 6-character reset code');
      return;
    }
    if (newPassword.length < 8) {
      setErrorMsg('New password must be at least 8 characters');
      return;
    }
    if (!/\d/.test(newPassword)) {
      setErrorMsg('New password must contain at least one number');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.resetPasswordWithToken(tokenInput, newPassword, confirmPassword);
      success('Password has been successfully updated. You can now log in.', 'Password Changed');
      handleClose();
      onPasswordResetComplete();
    } catch (err: unknown) {
      if (err instanceof ApiError) setErrorMsg(err.message);
      else setErrorMsg('Password reset failed. Invalid or expired token.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCode = () => {
    if (generatedCode) {
      navigator.clipboard?.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setStep('request');
    setEmail('');
    setGeneratedCode(null);
    setTokenInput('');
    setNewPassword('');
    setConfirmPassword('');
    setErrorMsg('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Reset Account Password">
      {step === 'request' ? (
        <form onSubmit={handleRequestToken} className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Enter your registered university email address. The system will issue a secure, time-limited verification code.
          </p>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="email"
                placeholder="fahim.cse@baust.edu.bd"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-sky-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Generating...' : 'Send Reset Code'}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-4">
          {/* Simulated Email Delivery Notice Box */}
          <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-sky-900">Simulated Email Inbox:</span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="text-[11px] font-medium text-sky-700 hover:text-sky-900 flex items-center gap-1"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy Code'}
              </button>
            </div>
            <p className="text-xs text-sky-800">
              Your security reset code is:{' '}
              <span className="font-mono font-bold tracking-widest text-sky-950 bg-white px-2 py-0.5 rounded border border-sky-300 ml-1">
                {generatedCode}
              </span>
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Reset Code</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                placeholder="6-character code"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value.toUpperCase())}
                className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-sky-500 focus:outline-none transition-colors font-mono tracking-wider uppercase"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
            <input
              type="password"
              placeholder="Min 8 chars, 1 number"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-sky-500 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-sky-500 focus:outline-none transition-colors"
            />
          </div>

          <div className="pt-2 flex justify-between items-center">
            <button
              type="button"
              onClick={() => setStep('request')}
              className="text-xs text-slate-500 hover:text-slate-800 transition-colors"
            >
              Back to email
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Updating...' : 'Set New Password'}
              </button>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
};
