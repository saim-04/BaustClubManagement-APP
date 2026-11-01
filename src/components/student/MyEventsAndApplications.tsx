import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Event, EventRegistration, Membership } from '../../types';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  FileText,
  Compass
} from 'lucide-react';

interface MyEventsAndApplicationsProps {
  onBrowseEvents: () => void;
  onBrowseClubs: () => void;
}

export const MyEventsAndApplications: React.FC<MyEventsAndApplicationsProps> = ({
  onBrowseEvents,
  onBrowseClubs
}) => {
  const { user } = useAuth();
  const [registeredEvents, setRegisteredEvents] = useState<
    (EventRegistration & { event: Event; clubName: string })[]
  >([]);
  const [memberships, setMemberships] = useState<
    (Membership & { clubName: string; clubCategory: string })[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const [eventsList, mList] = await Promise.all([
        api.getStudentRegisteredEvents(user.studentId),
        api.getStudentMemberships(user.studentId)
      ]);
      setRegisteredEvents(eventsList);
      setMemberships(mList);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  if (!user) return null;

  return (
    <div className="space-y-10 max-w-6xl mx-auto">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Applications & Registered Events</h1>
        <p className="text-xs text-slate-500 mt-1">
          Tracking your active event participations and society admission applications
        </p>
      </div>

      {/* SECTION 1: Registered Events */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-sky-600" />
            Registered Events ({registeredEvents.length})
          </h2>
          <button
            onClick={onBrowseEvents}
            className="text-xs text-sky-600 hover:text-sky-700 font-semibold"
          >
            Find more events &rarr;
          </button>
        </div>

        {isLoading ? (
          <div className="h-28 bg-slate-100 rounded-2xl animate-pulse" />
        ) : registeredEvents.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs text-slate-600 font-medium">You have not registered for any events yet.</p>
            <button
              onClick={onBrowseEvents}
              className="mt-2 text-xs font-semibold text-sky-600 hover:underline"
            >
              Browse campus events schedule &rarr;
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {registeredEvents.map((r) => (
              <div
                key={r.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                    <span className="font-semibold text-sky-700">{r.clubName}</span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      <CheckCircle2 className="w-3 h-3" />
                      Confirmed
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{r.event.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{r.event.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {r.event.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {r.event.time || '10:00 AM'}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {r.event.venue}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: Club Membership Applications */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600" />
            Club Membership Applications ({memberships.length})
          </h2>
          <button
            onClick={onBrowseClubs}
            className="text-xs text-sky-600 hover:text-sky-700 font-semibold"
          >
            Apply to other clubs &rarr;
          </button>
        </div>

        {isLoading ? (
          <div className="h-28 bg-slate-100 rounded-2xl animate-pulse" />
        ) : memberships.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <Compass className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs text-slate-600 font-medium">No application records found.</p>
            <button
              onClick={onBrowseClubs}
              className="mt-2 text-xs font-semibold text-sky-600 hover:underline"
            >
              Browse clubs and apply &rarr;
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Club Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Applied Date</th>
                    <th className="py-3 px-4">Motivation</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {memberships.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{m.clubName}</td>
                      <td className="py-3.5 px-4 text-slate-600">{m.clubCategory}</td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono">
                        {new Date(m.appliedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                        {m.motivation || <span className="text-slate-400 italic">None provided</span>}
                        {m.rejectionReason && (
                          <span className="block text-rose-600 mt-0.5">Note: {m.rejectionReason}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {m.status === 'approved' && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-lg">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Approved
                          </span>
                        )}
                        {m.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-lg">
                            <Clock className="w-3.5 h-3.5" />
                            Pending Review
                          </span>
                        )}
                        {m.status === 'rejected' && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-lg">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Declined
                          </span>
                        )}
                        {m.status === 'left' && (
                          <span className="text-xs text-slate-400 font-medium">Left Club</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
