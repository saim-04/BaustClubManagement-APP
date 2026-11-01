import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Membership, Event, Announcement } from '../../types';
import {
  Compass,
  FileText,
  Calendar,
  Bell,
  ArrowRight,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface StudentDashboardProps {
  onNavigate: (view: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [memberships, setMemberships] = useState<(Membership & { clubName: string; clubCategory: string })[]>([]);
  const [registeredEvents, setRegisteredEvents] = useState<{ id: string; event: Event; clubName: string }[]>([]);
  const [recentAnnouncements, setRecentAnnouncements] = useState<(Announcement & { clubName: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        const [mList, eList, aList] = await Promise.all([
          api.getStudentMemberships(user.studentId),
          api.getStudentRegisteredEvents(user.studentId),
          api.getAnnouncementsForViewer(user.id)
        ]);
        setMemberships(mList);
        setRegisteredEvents(eList);
        setRecentAnnouncements(aList.slice(0, 3));
      } catch (err) {
        console.error('Failed to load student dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadDashboardData();
  }, [user]);

  if (!user) return null;

  const approvedClubs = memberships.filter((m) => m.status === 'approved');
  const pendingClubs = memberships.filter((m) => m.status === 'pending');

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-sky-50 via-indigo-50/40 to-emerald-50/50 p-6 sm:p-8 rounded-3xl border border-sky-100 shadow-2xs">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-800 mb-2">
            <span>BAUST Student Portal</span>
            <span aria-hidden="true">·</span>
            <span>{user.department}</span>
            <span aria-hidden="true">·</span>
            <span>Batch {user.batch}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight text-balance">
            Welcome back, {user.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
            Discover student clubs, register for hackathons and workshops, and stay updated with official campus announcements.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              onClick={() => onNavigate('browse-clubs')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors whitespace-nowrap"
            >
              <Compass className="w-4 h-4" />
              Browse Clubs
            </button>
            <button
              onClick={() => onNavigate('my-applications')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 shadow-2xs transition-colors whitespace-nowrap"
            >
              <FileText className="w-4 h-4 text-slate-400" />
              My Applications & Events
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Clubs Joined + Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: My Clubs & Status */}
        <div className="lg:col-span-2 space-y-6">
          {/* Clubs Joined Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">Clubs Joined & Applied</h2>
                <p className="text-xs text-slate-500">Your official club memberships and application status</p>
              </div>
              <button
                onClick={() => onNavigate('my-clubs')}
                className="text-xs text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1 transition-colors"
              >
                View all ({memberships.length})
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {isLoading ? (
              <div className="h-32 flex items-center justify-center text-xs text-slate-400">Loading memberships...</div>
            ) : memberships.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Compass className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-700">You haven't joined any clubs yet</p>
                <p className="text-xs text-slate-500 mt-1 mb-4">Explore technology, robotics, sports, and cultural societies.</p>
                <button
                  onClick={() => onNavigate('browse-clubs')}
                  className="px-4 py-2 bg-sky-600 text-white text-xs font-semibold rounded-xl hover:bg-sky-700 transition-colors"
                >
                  Browse Clubs Directory
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {memberships.slice(0, 4).map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/40 transition-colors"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{m.clubName}</h4>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span>{m.clubCategory}</span>
                        <span aria-hidden="true">·</span>
                        <span>Applied {new Date(m.appliedAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div>
                      {m.status === 'approved' && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Active Member
                        </span>
                      )}
                      {m.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                          <Clock className="w-3.5 h-3.5" />
                          Under Review
                        </span>
                      )}
                      {m.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Not Accepted
                        </span>
                      )}
                      {m.status === 'left' && (
                        <span className="text-xs text-slate-400 font-medium px-2 py-1">
                          Left Club
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Registered Events */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">My Registered Events</h3>
                <p className="text-xs text-slate-500">Upcoming sessions, workshops, and competitions you signed up for</p>
              </div>
              <button
                onClick={() => onNavigate('events')}
                className="text-xs text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1 transition-colors"
              >
                Browse all events
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {isLoading ? (
              <div className="h-28 flex items-center justify-center text-xs text-slate-400">Loading events...</div>
            ) : registeredEvents.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Calendar className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                <p className="text-xs text-slate-600">No active event registrations yet.</p>
                <button
                  onClick={() => onNavigate('events')}
                  className="mt-3 text-xs text-sky-600 font-semibold hover:underline"
                >
                  Explore Upcoming Events &rarr;
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {registeredEvents.map((r) => (
                  <div
                    key={r.id}
                    className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-white transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <span className="text-[11px] font-semibold text-sky-700 block mb-0.5">{r.clubName}</span>
                      <h4 className="text-xs font-bold text-slate-900">{r.event.title}</h4>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                        <span>{r.event.date}</span>
                        <span aria-hidden="true">·</span>
                        <span>{r.event.time || '10:00 AM'}</span>
                        <span aria-hidden="true">·</span>
                        <span>{r.event.venue}</span>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded self-start sm:self-center">
                      Registered
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: 3 Recent Announcements & Summary */}
        <div className="space-y-6">
          {/* KPI Summary Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs grid grid-cols-2 gap-4 text-center">
            <div className="p-3 bg-sky-50/70 rounded-xl">
              <span className="text-2xl font-bold text-sky-900 font-mono tabular-nums">{approvedClubs.length}</span>
              <p className="text-[11px] font-medium text-sky-700 mt-0.5">Clubs Joined</p>
            </div>
            <div className="p-3 bg-indigo-50/70 rounded-xl">
              <span className="text-2xl font-bold text-indigo-900 font-mono tabular-nums">{registeredEvents.length}</span>
              <p className="text-[11px] font-medium text-indigo-700 mt-0.5">Events Enrolled</p>
            </div>
          </div>

          {/* Recent Announcements */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-slate-600" />
                <h3 className="text-sm font-bold text-slate-900">Recent Notices</h3>
              </div>
              <button
                onClick={() => onNavigate('announcements')}
                className="text-xs text-sky-600 hover:text-sky-700 font-semibold"
              >
                All notices
              </button>
            </div>

            {isLoading ? (
              <div className="h-32 flex items-center justify-center text-xs text-slate-400">Loading notices...</div>
            ) : recentAnnouncements.length === 0 ? (
              <p className="text-xs text-slate-500">No recent announcements.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentAnnouncements.map((a) => (
                  <div key={a.id} className="py-3 first:pt-0 last:pb-0 space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-semibold text-slate-700">{a.clubName}</span>
                      <span>{new Date(a.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h5 className="text-xs font-semibold text-slate-900 line-clamp-1">{a.title}</h5>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{a.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
