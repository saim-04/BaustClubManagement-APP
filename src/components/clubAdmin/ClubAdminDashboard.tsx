import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  Users,
  Clock,
  Calendar,
  GitPullRequest,
  PlusCircle,
  Bell,
  Building,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

interface ClubAdminDashboardProps {
  onNavigate: (view: string) => void;
}

export const ClubAdminDashboard: React.FC<ClubAdminDashboardProps> = ({ onNavigate }) => {
  const { user, club } = useAuth();

  const [stats, setStats] = useState({
    totalMembers: 0,
    pendingApps: 0,
    upcomingEvents: 0,
    pendingCollabs: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'clubAdmin' || !user.clubId) return;

    const loadData = async () => {
      try {
        setIsLoading(true);
        const [members, pending, events, collabs] = await Promise.all([
          api.getClubMembers(user.id, user.clubId!),
          api.getPendingApplications(user.id),
          api.getEventsForViewer(user.id),
          api.getCollaborationRequests(user.id)
        ]);

        const myClubEvents = events.filter((e) => e.clubId === user.clubId);
        setStats({
          totalMembers: members.length,
          pendingApps: pending.length,
          upcomingEvents: myClubEvents.length,
          pendingCollabs: collabs.incoming.filter((r) => r.status === 'pending').length
        });
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

  if (!user || user.role !== 'clubAdmin') {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <ShieldAlert className="w-8 h-8 text-rose-500 mx-auto mb-2" />
        <p className="text-xs text-slate-600">Access Restricted: Club President privileges required.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-50 via-sky-50/40 to-slate-50 p-6 sm:p-8 rounded-3xl border border-indigo-100 shadow-2xs">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-800 mb-2">
            <span>President Console</span>
            <span aria-hidden="true">·</span>
            <span>{club?.category || 'BAUST Society'}</span>
            <span aria-hidden="true">·</span>
            <span>Est. {club?.foundedYear || '2015'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight text-balance">
            {club?.name || 'My Club'} Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
            Welcome, President {user.name}. Manage official memberships, publish exclusive events, review equipment sharing, and schedule campus hall allocations.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              onClick={() => onNavigate('manage-members')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors whitespace-nowrap"
            >
              <Users className="w-4 h-4" />
              Manage Members
            </button>
            <button
              onClick={() => onNavigate('manage-events')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 shadow-2xs transition-colors whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4 text-slate-400" />
              Create Event
            </button>
            <button
              onClick={() => onNavigate('manage-announcements')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 shadow-2xs transition-colors whitespace-nowrap"
            >
              <Bell className="w-4 h-4 text-slate-400" />
              Post Announcement
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigate('manage-members')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-indigo-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-600">Active Members</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <span className="text-3xl font-bold text-slate-900 font-mono tabular-nums">
            {stats.totalMembers}
          </span>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 group-hover:text-indigo-600">
            View member directory &rarr;
          </p>
        </div>

        <div
          onClick={() => onNavigate('pending-applications')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-amber-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-600">Pending Applications</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-3xl font-bold text-slate-900 font-mono tabular-nums">
            {stats.pendingApps}
          </span>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 group-hover:text-amber-600">
            Review admissions queue &rarr;
          </p>
        </div>

        <div
          onClick={() => onNavigate('manage-events')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-sky-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-600">Hosted Events</span>
            <Calendar className="w-4 h-4 text-sky-500" />
          </div>
          <span className="text-3xl font-bold text-slate-900 font-mono tabular-nums">
            {stats.upcomingEvents}
          </span>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 group-hover:text-sky-600">
            Schedule & manage sessions &rarr;
          </p>
        </div>

        <div
          onClick={() => onNavigate('collaboration-hub')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-600">Incoming Requests</span>
            <GitPullRequest className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-3xl font-bold text-slate-900 font-mono tabular-nums">
            {stats.pendingCollabs}
          </span>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 group-hover:text-emerald-600">
            Collaboration proposals &rarr;
          </p>
        </div>
      </div>

      {/* Quick Action Hub */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          onClick={() => onNavigate('room-allocation')}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all cursor-pointer flex items-start gap-4"
        >
          <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Campus Room Booking</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Reserve Central Auditorium, Seminar Halls, and Conference rooms with automated conflict verification.
            </p>
          </div>
        </div>

        <div
          onClick={() => onNavigate('equipment-management')}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all cursor-pointer flex items-start gap-4"
        >
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Equipment Re-Use</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Manage club inventory, share audio/projectors with peer clubs, and track borrowed gear.
            </p>
          </div>
        </div>

        <div
          onClick={() => onNavigate('pending-applications')}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all cursor-pointer flex items-start gap-4"
        >
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Pending Admissions ({stats.pendingApps})</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Review applicant motivation statements and grant official club member status.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
