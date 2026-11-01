import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api, ApiError } from '../../services/api';
import { Club, Membership, Event } from '../../types';
import { Modal } from '../common/Modal';
import {
  Search,
  Users,
  Compass,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building2
} from 'lucide-react';

export const BrowseClubs: React.FC = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [clubs, setClubs] = useState<(Club & { memberCount: number; pendingCount: number; adminName?: string })[]>([]);
  const [userMemberships, setUserMemberships] = useState<Membership[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Selected Club for Detail Modal
  const [selectedClub, setSelectedClub] = useState<
    (Club & { memberCount: number; adminName: string; upcomingEvents: Event[] }) | null
  >(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Application form state
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [motivation, setMotivation] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [clubsList, mList] = await Promise.all([
        api.getClubs(),
        user?.studentId ? api.getStudentMemberships(user.studentId) : Promise.resolve([])
      ]);
      setClubs(clubsList);
      setUserMemberships(mList);
    } catch (err) {
      console.error('Failed to load clubs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleOpenDetail = async (clubId: string) => {
    try {
      setDetailLoading(true);
      const detail = await api.getClubDetail(clubId);
      setSelectedClub(detail);
      setShowApplyForm(false);
      setMotivation('');
    } catch {
      toastError('Failed to load club details');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedClub) return;

    setIsApplying(true);
    try {
      await api.applyForMembership(user.studentId, selectedClub.id, motivation);
      success(`Your membership application for ${selectedClub.name} was submitted!`, 'Application Submitted');
      setShowApplyForm(false);
      setMotivation('');
      // Refresh memberships
      const updated = await api.getStudentMemberships(user.studentId);
      setUserMemberships(updated);
      setSelectedClub(null);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        toastError(err.message, 'Application Notice');
      } else {
        toastError('Failed to submit application');
      }
    } finally {
      setIsApplying(false);
    }
  };

  // Filter logic
  const filteredClubs = clubs.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === 'all' || c.category.toLowerCase().includes(categoryFilter.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', 'Technology', 'Robotics', 'Culture', 'Sports', 'Career'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header and Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Browse University Clubs</h1>
          <p className="text-xs text-slate-500 mt-1">
            Explore BAUST official student societies, technical chapters, and cultural organizations
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search club name or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-sky-500 shadow-2xs"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-sky-500 shadow-2xs text-slate-700"
          >
            <option value="all">All Categories</option>
            <option value="Technology">Technology & IT</option>
            <option value="Robotics">Engineering & Robotics</option>
            <option value="Culture">Arts & Debating</option>
            <option value="Sports">Sports & Athletics</option>
            <option value="Career">Career & Research</option>
          </select>
        </div>
      </div>

      {/* Clubs Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredClubs.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <Compass className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-800">No clubs match your query</h3>
          <p className="text-xs text-slate-500 mt-1">Try clearing your search query or selecting a different category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClubs.map((club) => {
            const userMembership = userMemberships.find((m) => m.clubId === club.id);

            return (
              <div
                key={club.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-6">
                  {/* Clean unboxed metadata header */}
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2.5">
                    <span className="font-semibold text-sky-700">{club.category}</span>
                    <span className="flex items-center gap-1 font-mono text-slate-600 tabular-nums">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      {club.memberCount} members
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-700 transition-colors tracking-tight line-clamp-1">
                    {club.name}
                  </h3>

                  <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                    {club.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>President: {club.adminName}</span>
                    <span className="font-mono text-slate-400">Est. {club.foundedYear || '2015'}</span>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="px-6 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    {userMembership?.status === 'approved' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Member
                      </span>
                    )}
                    {userMembership?.status === 'pending' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700">
                        <Clock className="w-3.5 h-3.5" />
                        Application Pending
                      </span>
                    )}
                    {!userMembership && (
                      <span className="text-[11px] text-slate-500">Open for enrollment</span>
                    )}
                  </div>

                  <button
                    onClick={() => handleOpenDetail(club.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold rounded-lg shadow-2xs transition-colors"
                  >
                    View Details
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Club Detail Modal */}
      {selectedClub && (
        <Modal
          isOpen={!!selectedClub}
          onClose={() => setSelectedClub(null)}
          title={selectedClub.name}
          maxWidth="lg"
        >
          <div className="space-y-5">
            {/* Meta Strip */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pb-3 border-b border-slate-100">
              <span className="font-semibold text-sky-700">{selectedClub.category}</span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1 font-mono tabular-nums">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                {selectedClub.memberCount} Approved Members
              </span>
              <span aria-hidden="true">·</span>
              <span>President: {selectedClub.adminName}</span>
            </div>

            {/* Full Description */}
            <div>
              <h4 className="text-xs font-semibold text-slate-700 mb-1">About the Club</h4>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                {selectedClub.description}
              </p>
            </div>

            {/* Upcoming Club Events */}
            <div>
              <h4 className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-sky-600" />
                Upcoming Club Events ({selectedClub.upcomingEvents.length})
              </h4>
              {selectedClub.upcomingEvents.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No upcoming events scheduled right now.</p>
              ) : (
                <div className="space-y-2">
                  {selectedClub.upcomingEvents.slice(0, 3).map((ev) => (
                    <div
                      key={ev.id}
                      className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 text-xs flex items-center justify-between"
                    >
                      <div>
                        <p className="font-semibold text-slate-900">{ev.title}</p>
                        <p className="text-[11px] text-slate-500">
                          {ev.date} · {ev.venue}
                        </p>
                      </div>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-200/60 text-slate-700 font-semibold">
                        {ev.visibility}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Application Section */}
            <div className="pt-4 border-t border-slate-100">
              {(() => {
                const membership = userMemberships.find((m) => m.clubId === selectedClub.id);

                if (user?.role !== 'student') {
                  return (
                    <p className="text-xs text-slate-500 italic">
                      Membership applications are reserved for university students.
                    </p>
                  );
                }

                if (membership?.status === 'approved') {
                  return (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      You are an approved member of this club.
                    </div>
                  );
                }

                if (membership?.status === 'pending') {
                  return (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-xs text-amber-800">
                      <Clock className="w-4 h-4 text-amber-600" />
                      Your membership application has been submitted and is currently pending review by the Club President.
                    </div>
                  );
                }

                if (!showApplyForm) {
                  return (
                    <button
                      onClick={() => setShowApplyForm(true)}
                      className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                    >
                      Apply for Membership
                    </button>
                  );
                }

                return (
                  <form onSubmit={handleApply} className="space-y-3">
                    <h5 className="text-xs font-bold text-slate-900">Application Form</h5>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Motivation / Statement of Interest <span className="text-slate-400 font-normal">(Optional)</span>
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Why do you wish to join this club? Mention your skills or interests..."
                        value={motivation}
                        onChange={(e) => setMotivation(e.target.value)}
                        className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-sky-500 focus:outline-none transition-colors"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowApplyForm(false)}
                        className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isApplying}
                        className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors disabled:opacity-50"
                      >
                        {isApplying ? 'Submitting...' : 'Submit Application'}
                      </button>
                    </div>
                  </form>
                );
              })()}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
