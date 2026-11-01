import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api, ApiError } from '../../services/api';
import { Membership } from '../../types';
import { Modal } from '../common/Modal';
import {
  Users,
  LogOut,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Compass
} from 'lucide-react';

interface MyClubsProps {
  onBrowseClubs: () => void;
}

export const MyClubs: React.FC<MyClubsProps> = ({ onBrowseClubs }) => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [memberships, setMemberships] = useState<(Membership & { clubName: string; clubCategory: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Leave club dialog state
  const [clubToLeave, setClubToLeave] = useState<{ clubId: string; clubName: string } | null>(null);
  const [isLeaving, setIsLeaving] = useState(false);

  const loadData = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const list = await api.getStudentMemberships(user.studentId);
      setMemberships(list);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleConfirmLeave = async () => {
    if (!user || !clubToLeave) return;

    setIsLeaving(true);
    try {
      await api.leaveClub(user.studentId, clubToLeave.clubId);
      success(`You have stepped down from ${clubToLeave.clubName}.`, 'Membership Updated');
      setClubToLeave(null);
      await loadData();
    } catch (err: unknown) {
      if (err instanceof ApiError) toastError(err.message);
      else toastError('Failed to leave club');
    } finally {
      setIsLeaving(false);
    }
  };

  if (!user) return null;

  const activeMemberships = memberships.filter((m) => m.status === 'approved');
  const pendingMemberships = memberships.filter((m) => m.status === 'pending');
  const pastMemberships = memberships.filter((m) => m.status === 'rejected' || m.status === 'left');

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Club Memberships</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your official BAUST student society memberships and affiliations
          </p>
        </div>
        <button
          onClick={onBrowseClubs}
          className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <Compass className="w-4 h-4" />
          Explore More Clubs
        </button>
      </div>

      {/* Active Memberships Section */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Active Clubs ({activeMemberships.length})
        </h2>

        {isLoading ? (
          <div className="h-24 bg-slate-100 rounded-xl animate-pulse" />
        ) : activeMemberships.length === 0 ? (
          <div className="p-6 text-center bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <p className="text-xs text-slate-500">You are not currently an active member of any clubs.</p>
            <button
              onClick={onBrowseClubs}
              className="mt-2 text-xs font-semibold text-sky-600 hover:underline"
            >
              Browse and join student societies &rarr;
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeMemberships.map((m) => (
              <div
                key={m.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                    <span className="font-semibold text-sky-700">{m.clubCategory}</span>
                    <span>Joined {new Date(m.updatedAt || m.appliedAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{m.clubName}</h3>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Good Standing
                  </span>

                  <button
                    onClick={() => setClubToLeave({ clubId: m.clubId, clubName: m.clubName })}
                    className="inline-flex items-center gap-1.5 px-3 py-1 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-lg transition-colors font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Leave Club
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Applications Section */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-600" />
          Pending Applications ({pendingMemberships.length})
        </h2>

        {pendingMemberships.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No applications currently pending review.</p>
        ) : (
          <div className="space-y-3">
            {pendingMemberships.map((m) => (
              <div
                key={m.id}
                className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{m.clubName}</h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                    <span>{m.clubCategory}</span>
                    <span aria-hidden="true">·</span>
                    <span>Submitted on {new Date(m.appliedAt).toLocaleDateString()}</span>
                  </div>
                  {m.motivation && (
                    <p className="text-xs text-slate-600 mt-1 italic">"{m.motivation}"</p>
                  )}
                </div>

                <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg self-start sm:self-center">
                  <Clock className="w-3.5 h-3.5" />
                  Awaiting President Review
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Memberships / Historical Records */}
      {pastMemberships.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <h2 className="text-sm font-bold text-slate-700">Past Records</h2>
          <div className="space-y-2">
            {pastMemberships.map((m) => (
              <div
                key={m.id}
                className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200 text-xs flex items-center justify-between"
              >
                <div>
                  <span className="font-semibold text-slate-800">{m.clubName}</span>
                  {m.rejectionReason && (
                    <p className="text-[11px] text-rose-600 mt-0.5">Reason: {m.rejectionReason}</p>
                  )}
                </div>
                <span className="text-[11px] text-slate-500 font-mono capitalize">{m.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirmation Modal to Leave Club */}
      <Modal
        isOpen={!!clubToLeave}
        onClose={() => setClubToLeave(null)}
        title="Confirm Club Resignation"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Are you sure you wish to leave <strong className="text-slate-900">{clubToLeave?.clubName}</strong>?
            You will lose access to member-only events and workshops. You may re-apply at any time.
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setClubToLeave(null)}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmLeave}
              disabled={isLeaving}
              className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              {isLeaving ? 'Processing...' : 'Confirm & Leave'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
