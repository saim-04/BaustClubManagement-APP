import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api, ApiError } from '../../services/api';
import { Modal } from '../common/Modal';
import {
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  UserCheck,
  ShieldCheck,
  Mail
} from 'lucide-react';

interface PendingApp {
  membershipId: string;
  studentId: string;
  name: string;
  department: string;
  batch: string;
  appliedAt: string;
  motivation?: string;
  email: string;
}

export const PendingApplications: React.FC = () => {
  const { user, club } = useAuth();
  const { success, error: toastError } = useToast();

  const [applications, setApplications] = useState<PendingApp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Reject modal state
  const [rejectingApp, setRejectingApp] = useState<PendingApp | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  const loadPending = async () => {
    if (!user || !user.clubId) return;

    try {
      setIsLoading(true);
      const list = await api.getPendingApplications(user.id);
      setApplications(list);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, [user]);

  const handleApprove = async (app: PendingApp) => {
    if (!user) return;
    setProcessingId(app.membershipId);
    try {
      await api.reviewMembership(user.id, app.membershipId, 'approved');
      success(`Approved ${app.name} (${app.studentId}) as official club member!`, 'Application Approved');
      await loadPending();
    } catch (err: unknown) {
      if (err instanceof ApiError) toastError(err.message);
      else toastError('Failed to approve application');
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !rejectingApp) return;

    setIsRejecting(true);
    try {
      await api.reviewMembership(user.id, rejectingApp.membershipId, 'rejected', rejectionReason);
      success(`Application for ${rejectingApp.name} declined.`, 'Application Declined');
      setRejectingApp(null);
      setRejectionReason('');
      await loadPending();
    } catch (err: unknown) {
      if (err instanceof ApiError) toastError(err.message);
      else toastError('Failed to decline application');
    } finally {
      setIsRejecting(false);
    }
  };

  if (!user || user.role !== 'clubAdmin') return null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 mb-1">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Restricted to President of {club?.name || 'Club'}</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Pending Membership Applications</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review student admission statements and approve active memberships for your club
        </p>
      </div>

      {isLoading ? (
        <div className="h-40 bg-slate-100 rounded-2xl animate-pulse" />
      ) : applications.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <Clock className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-800">No Pending Applications</h3>
          <p className="text-xs text-slate-500 mt-1">All student requests for your club have been reviewed.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app.membershipId}
              className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="font-mono font-medium text-slate-800">{app.studentId}</span>
                  <span aria-hidden="true">·</span>
                  <span>{app.department}</span>
                  <span aria-hidden="true">·</span>
                  <span>Batch {app.batch}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-slate-400">Applied {new Date(app.appliedAt).toLocaleDateString()}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-tight">{app.name}</h3>

                {app.motivation ? (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700">
                    <span className="text-slate-400 block font-semibold text-[10px] uppercase mb-0.5">
                      Motivation Statement:
                    </span>
                    <p className="italic">"{app.motivation}"</p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No custom motivation statement provided.</p>
                )}

                <p className="text-[11px] text-slate-400 font-mono">
                  Contact: <a href={`mailto:${app.email}`} className="text-indigo-600 hover:underline">{app.email}</a>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <button
                  onClick={() => {
                    setRejectingApp(app);
                    setRejectionReason('');
                  }}
                  disabled={processingId === app.membershipId}
                  className="px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors disabled:opacity-50"
                >
                  Decline
                </button>
                <button
                  onClick={() => handleApprove(app)}
                  disabled={processingId === app.membershipId}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {processingId === app.membershipId ? 'Approving...' : 'Approve Membership'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      <Modal
        isOpen={!!rejectingApp}
        onClose={() => setRejectingApp(null)}
        title="Decline Membership Application"
      >
        <form onSubmit={handleConfirmReject} className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            You are declining the application for <strong className="text-slate-900">{rejectingApp?.name}</strong>.
            You can optionally specify a reason for the applicant.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Feedback / Rejection Reason <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Currently full capacity for 1st year students; recommend applying next semester."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:outline-none transition-colors"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setRejectingApp(null)}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isRejecting}
              className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              {isRejecting ? 'Processing...' : 'Confirm Rejection'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
