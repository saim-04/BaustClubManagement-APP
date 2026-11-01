import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api, ApiError } from '../../services/api';
import { Event } from '../../types';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Lock,
  Globe,
  Users,
  Search,
  Filter
} from 'lucide-react';

export const EventsCatalog: React.FC = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [events, setEvents] = useState<
    (Event & {
      clubName: string;
      isRegistered: boolean;
      isMemberOfHostingClub: boolean;
      registrationCount: number;
    })[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'public' | 'membersOnly'>('all');
  const [registeringId, setRegisteringId] = useState<string | null>(null);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const list = await api.getEventsForViewer(user?.id);
      setEvents(list);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [user]);

  const handleRegister = async (eventId: string, title: string) => {
    if (!user) {
      toastError('Please log in as a student to register for events');
      return;
    }
    if (user.role !== 'student') {
      toastError('Event registration is available for student accounts');
      return;
    }

    setRegisteringId(eventId);
    try {
      await api.registerForEvent(user.id, eventId);
      success(`Successfully registered for "${title}"!`, 'Registration Confirmed');
      await loadEvents();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        toastError(err.message, 'Registration Notice');
      } else {
        toastError('Failed to register for event');
      }
    } finally {
      setRegisteringId(null);
    }
  };

  const filteredEvents = events.filter((ev) => {
    const matchesSearch =
      ev.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.clubName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesVisibility =
      filterType === 'all' ? true : ev.visibility === filterType;

    return matchesSearch && matchesVisibility;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">University Club Events</h1>
          <p className="text-xs text-slate-500 mt-1">
            Workshops, hackathons, seminars, and competitive contests hosted across BAUST clubs
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search event title, venue, club..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-sky-500 shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                filterType === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Events
            </button>
            <button
              onClick={() => setFilterType('public')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                filterType === 'public' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Public
            </button>
            <button
              onClick={() => setFilterType('membersOnly')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                filterType === 'membersOnly' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Members Only
            </button>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-56 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <Calendar className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-800">No events found</h3>
          <p className="text-xs text-slate-500 mt-1">Check back later or adjust your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredEvents.map((ev) => {
            const today = new Date().toISOString().split('T')[0];
            const isDeadlinePassed = ev.registrationDeadline < today;

            return (
              <div
                key={ev.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all p-6 flex flex-col justify-between"
              >
                <div>
                  {/* Clean unboxed metadata kicker */}
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2.5">
                    <span className="font-semibold text-sky-700">{ev.clubName}</span>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 font-mono tabular-nums text-slate-600">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        {ev.registrationCount} registered
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1">
                        {ev.visibility === 'public' ? (
                          <>
                            <Globe className="w-3.5 h-3.5 text-slate-400" />
                            Public
                          </>
                        ) : (
                          <>
                            <Lock className="w-3.5 h-3.5 text-indigo-500" />
                            Members Only
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 tracking-tight leading-snug">
                    {ev.title}
                  </h3>

                  <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                    {ev.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{ev.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{ev.time || '10:00 AM'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 col-span-2">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="truncate">{ev.venue}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    Reg. Deadline: <strong className="text-slate-700 font-mono">{ev.registrationDeadline}</strong>
                  </span>

                  <div>
                    {ev.isRegistered ? (
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold rounded-xl">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Already Registered
                      </span>
                    ) : isDeadlinePassed ? (
                      <span className="text-xs text-slate-400 font-medium px-3 py-1.5">
                        Registration Closed
                      </span>
                    ) : (
                      <button
                        onClick={() => handleRegister(ev.id, ev.title)}
                        disabled={registeringId === ev.id}
                        className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors disabled:opacity-50"
                      >
                        {registeringId === ev.id ? 'Registering...' : 'Register for Event'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
