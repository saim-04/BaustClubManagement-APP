import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api, ApiError } from '../../services/api';
import { Club, CollaborationRequest } from '../../types';
import { Modal } from '../common/Modal';
import {
  GitPullRequest,
  Send,
  Inbox,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  Calendar,
  Sparkles
} from 'lucide-react';

export const CollaborationHub: React.FC = () => {
  const { user, club } = useAuth();
  const { success, error: toastError } = useToast();

  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing' | 'directory'>('incoming');
  const [incomingRequests, setIncomingRequests] = useState<(CollaborationRequest & { requestingClubName: string })[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<(CollaborationRequest & { targetClubName: string })[]>([]);
  const [peerClubs, setPeerClubs] = useState<Club[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Send request modal
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [targetClubId, setTargetClubId] = useState('');
  const [eventDetails, setEventDetails] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState('');

  // Respond modal (Accept / Reject)
  const [respondingReq, setRespondingReq] = useState<(CollaborationRequest & { requestingClubName: string }) | null>(null);
  const [createJointEvent, setCreateJointEvent] = useState(true);
  const [jointTitle, setJointTitle] = useState('');
  const [jointDate, setJointDate] = useState('');
  const [jointVenue, setJointVenue] = useState('Central Auditorium');
  const [isResponding, setIsResponding] = useState(false);

  const loadData = async () => {
    if (!user || !user.clubId) return;

    try {
      setIsLoading(true);
      const [collabs, allClubs] = await Promise.all([
        api.getCollaborationRequests(user.id),
        api.getClubs()
      ]);

      setIncomingRequests(collabs.incoming);
      setOutgoingRequests(collabs.outgoing);
      // Filter out self
      setPeerClubs(allClubs.filter((c) => c.id !== user.clubId));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleOpenSend = (preselectedClubId?: string) => {
    setTargetClubId(preselectedClubId || (peerClubs[0]?.id ?? ''));
    setEventDetails('');
    setSendError('');
    setIsSendModalOpen(true);
  };

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!targetClubId) {
      setSendError('Please select a target club');
      return;
    }
    if (!eventDetails.trim()) {
      setSendError('Please enter proposed event details');
      return;
    }

    setIsSending(true);
    try {
      await api.sendCollaborationRequest(user.id, targetClubId, eventDetails);
      success('Collaboration proposal sent to club president', 'Proposal Dispatched');
      setIsSendModalOpen(false);
      setActiveTab('outgoing');
      await loadData();
    } catch (err: unknown) {
      if (err instanceof ApiError) setSendError(err.message);
      else setSendError('Failed to send collaboration request');
    } finally {
      setIsSending(false);
    }
  };

  const handleOpenAcceptModal = (req: CollaborationRequest & { requestingClubName: string }) => {
    setRespondingReq(req);
    setCreateJointEvent(true);
    setJointTitle(`Joint Fest: ${club?.name} & ${req.requestingClubName}`);
    setJointDate(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
    setJointVenue('BAUST Central Auditorium');
  };

  const handleRespond = async (decision: 'accepted' | 'rejected') => {
    if (!user || !respondingReq) return;

    setIsResponding(true);
    try {
      await api.respondToCollaborationRequest(
        user.id,
        respondingReq.id,
        decision,
        decision === 'accepted' && createJointEvent
          ? {
              title: jointTitle,
              date: jointDate,
              venue: jointVenue
            }
          : undefined
      );

      success(
        decision === 'accepted'
          ? 'Collaboration proposal accepted! Joint event initialized.'
          : 'Proposal declined.',
        'Collaboration Status Updated'
      );
      setRespondingReq(null);
      await loadData();
    } catch (err: unknown) {
      if (err instanceof ApiError) toastError(err.message);
      else toastError('Failed to respond to request');
    } finally {
      setIsResponding(false);
    }
  };

  if (!user || user.role !== 'clubAdmin') return null;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Inter-Club Collaboration Hub</h1>
          <p className="text-xs text-slate-500 mt-1">
            Partner with other BAUST student societies to co-host hackathons, fests, and workshops
          </p>
        </div>
        <button
          onClick={() => handleOpenSend()}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <Send className="w-4 h-4" />
          Propose Collaboration
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('incoming')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-colors ${
            activeTab === 'incoming'
              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Inbox className="w-4 h-4" />
          Incoming Proposals ({incomingRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('outgoing')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-colors ${
            activeTab === 'outgoing'
              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Send className="w-4 h-4" />
          Outgoing Proposals ({outgoingRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('directory')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-colors ${
            activeTab === 'directory'
              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Club Directory ({peerClubs.length})
        </button>
      </div>

      {/* Tab Content */}
      {isLoading ? (
        <div className="h-40 bg-slate-100 rounded-2xl animate-pulse" />
      ) : activeTab === 'incoming' ? (
        incomingRequests.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <Inbox className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <p className="text-xs text-slate-600 font-semibold">No Incoming Proposals</p>
            <p className="text-xs text-slate-400 mt-1">When peer clubs invite you to collaborate, their requests will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {incomingRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-bold text-indigo-700">{req.requestingClubName}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono text-[11px]">{new Date(req.createdAt).toLocaleDateString()}</span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    "{req.eventDetails}"
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  {req.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => {
                          setRespondingReq(req);
                          handleRespond('rejected');
                        }}
                        disabled={isResponding}
                        className="px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors disabled:opacity-50"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleOpenAcceptModal(req)}
                        disabled={isResponding}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Accept Proposal
                      </button>
                    </>
                  ) : (
                    <span
                      className={`text-xs font-semibold px-3 py-1.5 rounded-xl capitalize font-mono ${
                        req.status === 'accepted'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {req.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      ) : activeTab === 'outgoing' ? (
        outgoingRequests.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <Send className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <p className="text-xs text-slate-600 font-semibold">No Outgoing Proposals</p>
            <p className="text-xs text-slate-400 mt-1">You haven't initiated any joint event requests yet.</p>
            <button
              onClick={() => handleOpenSend()}
              className="mt-3 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700"
            >
              Propose First Collaboration
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {outgoingRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                    <span>Sent to <strong className="text-slate-800">{req.targetClubName}</strong></span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono text-[11px]">{new Date(req.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-slate-700">{req.eventDetails}</p>
                </div>

                <div>
                  {req.status === 'pending' && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                      <Clock className="w-3.5 h-3.5" />
                      Pending Review
                    </span>
                  )}
                  {req.status === 'accepted' && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Accepted
                    </span>
                  )}
                  {req.status === 'rejected' && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg">
                      <XCircle className="w-3.5 h-3.5" />
                      Declined
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Directory Tab */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {peerClubs.map((pc) => (
            <div
              key={pc.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-semibold text-indigo-700">{pc.category}</span>
                <h3 className="text-sm font-bold text-slate-900 mt-1">{pc.name}</h3>
                <p className="text-xs text-slate-500 mt-2 line-clamp-2">{pc.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">Status: {pc.status}</span>
                <button
                  onClick={() => handleOpenSend(pc.id)}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send Proposal
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Propose Collaboration Modal */}
      <Modal
        isOpen={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
        title="Propose Joint Club Collaboration"
        maxWidth="lg"
      >
        <form onSubmit={handleSendRequest} className="space-y-4">
          {sendError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
              {sendError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target University Club</label>
            <select
              value={targetClubId}
              onChange={(e) => setTargetClubId(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:outline-none transition-colors"
            >
              {peerClubs.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.category})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Collaboration Concept & Agenda
            </label>
            <textarea
              rows={4}
              placeholder="Outline the event idea, resource sharing, target audience, and expected outcome..."
              value={eventDetails}
              onChange={(e) => setEventDetails(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:outline-none transition-colors"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsSendModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSending}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              {isSending ? 'Sending...' : 'Dispatch Proposal'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Accept & Create Shared Event Modal */}
      <Modal
        isOpen={!!respondingReq}
        onClose={() => setRespondingReq(null)}
        title="Accept Collaboration Proposal"
        maxWidth="lg"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            You are accepting the proposal from <strong className="text-slate-900">{respondingReq?.requestingClubName}</strong>.
            You can automatically initialize a co-hosted event published to both club rosters.
          </p>

          <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={createJointEvent}
              onChange={(e) => setCreateJointEvent(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-0"
            />
            <span className="font-semibold text-slate-900">Publish joint event to university calendar immediately</span>
          </label>

          {createJointEvent && (
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Joint Event Title</label>
                <input
                  type="text"
                  value={jointTitle}
                  onChange={(e) => setJointTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Proposed Date</label>
                  <input
                    type="date"
                    value={jointDate}
                    onChange={(e) => setJointDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Venue</label>
                  <input
                    type="text"
                    value={jointVenue}
                    onChange={(e) => setJointVenue(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              onClick={() => setRespondingReq(null)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => handleRespond('accepted')}
              disabled={isResponding}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              {isResponding ? 'Confirming...' : 'Confirm Acceptance'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
