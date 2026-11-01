import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api, ApiError } from '../../services/api';
import { Lock, User as UserIcon, Shield, CheckCircle2 } from 'lucide-react';

export const AccountSettings: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { success } = useToast();

  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setPasswordChanged(false);

    const errs: Record<string, string> = {};
    if (!currentPass) errs.currentPass = 'Current password is required';
    if (!newPass) errs.newPass = 'New password is required';
    else if (newPass.length < 8) errs.newPass = 'New password must be at least 8 characters';
    else if (!/\d/.test(newPass)) errs.newPass = 'New password must contain at least one number';
    if (newPass !== confirmPass) errs.confirmPass = 'Passwords do not match';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsSubmitting(true);
    try {
      await api.changePassword(user.id, currentPass, newPass, confirmPass);
      success('Password successfully changed', 'Security Updated');
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
      setPasswordChanged(true);
      refreshUser();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.field) setErrors({ [err.field]: err.message });
        else setErrors({ form: err.message });
      } else {
        setErrors({ form: 'Failed to update password' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Account Settings</h1>
        <p className="text-xs text-slate-500 mt-1">Manage your identity profile and password security</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-100/70 text-sky-700 flex items-center justify-center font-bold text-lg">
              {user.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 leading-tight">{user.name}</h2>
              <span className="text-xs text-sky-700 capitalize font-medium">{user.role}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-2.5 text-xs">
            <div>
              <span className="text-slate-400 block">Student ID / System ID</span>
              <span className="font-mono font-medium text-slate-800">{user.studentId}</span>
            </div>
            <div>
              <span className="text-slate-400 block">University Email</span>
              <span className="font-medium text-slate-800">{user.email}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Department</span>
              <span className="font-medium text-slate-800">{user.department}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Batch</span>
              <span className="font-medium text-slate-800">{user.batch}</span>
            </div>
            {user.phone && (
              <div>
                <span className="text-slate-400 block">Contact Phone</span>
                <span className="font-mono font-medium text-slate-800">{user.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Change Password Card */}
        <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Change Password</h3>
              <p className="text-xs text-slate-500">Ensure your account is protected with a strong passphrase</p>
            </div>
          </div>

          {passwordChanged && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              Your password has been changed successfully.
            </div>
          )}

          {errors.form && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                placeholder="Enter current password"
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-slate-50/50 focus:bg-white focus:outline-none transition-colors ${
                  errors.currentPass ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200 focus:border-sky-500'
                }`}
              />
              {errors.currentPass && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{errors.currentPass}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                placeholder="Minimum 8 characters, 1 number"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-slate-50/50 focus:bg-white focus:outline-none transition-colors ${
                  errors.newPass ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200 focus:border-sky-500'
                }`}
              />
              {errors.newPass && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{errors.newPass}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                placeholder="Re-enter new password"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-slate-50/50 focus:bg-white focus:outline-none transition-colors ${
                  errors.confirmPass ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200 focus:border-sky-500'
                }`}
              />
              {errors.confirmPass && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{errors.confirmPass}</p>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors disabled:opacity-50 shadow-xs"
              >
                {isSubmitting ? 'Updating Security...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
