import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api, ApiError } from '../../services/api';
import { Event } from '../../types';
import { Modal } from '../common/Modal';
import {
  Calendar,
  Clock,
  MapPin,
  PlusCircle,
  Edit2,
  Trash2,
  Users,
  Globe,
  Lock,
  CheckCircle2
} from 'lucide-react';

export const EventManagement: React.FC = () => {
  const { user, club } = useAuth();
  const { success, error: toastError } = useToast();

  const [events, setEvents] = useState<
    (Event & {
      clubName: string;
      registrationCount: number;
    })[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form modal state (Create / Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '10:00 AM',
    venue: '',
    registrationDeadline: '',
    visibility: 'public' as 'public' | 'membersOnly'
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cancel/Delete modal state
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadEvents = async () => {
    if (!user || !user.clubId) return;

    try {
      setIsLoading(true);
      const allEvents = await api.getEventsForViewer(user.id);
      // Filter to own club's events
      const myEvents = allEvents.filter((e) => e.clubId === user.clubId);
      setEvents(myEvents);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [user]);

  const handleOpenCreate = () => {
    setEditingEventId(null);
    setFormData({
      title: '',
      description: '',
      date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      time: '10:00 AM',
      venue: 'Academic Building 1, Hall 301',
      registrationDeadline: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      visibility: 'public'
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ev: Event) => {
    setEditingEventId(ev.id);
    setFormData({
      title: ev.title,
      description: ev.description,
      date: ev.date,
      time: ev.time || '10:00 AM',
      venue: ev.venue,
      registrationDeadline: ev.registrationDeadline,
      visibility: ev.visibility
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setFormErrors({});
    const errs: Record<string, string> = {};
    if (!formData.title.trim()) errs.title = 'Title is required';
    if (!formData.description.trim()) errs.description = 'Description is required';
    if (!formData.date) errs.date = 'Date is required';
    if (!formData.venue.trim()) errs.venue = 'Venue is required';
    if (!formData.registrationDeadline) errs.registrationDeadline = 'Deadline is required';
    if (formData.registrationDeadline > formData.date) {
      errs.registrationDeadline = 'Deadline cannot be after event date';
    }

    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingEventId) {
        await api.updateEvent(user.id, editingEventId, formData);
        success('Event updated successfully', 'Event Modified');
      } else {
        await api.createEvent(user.id, formData);
        success('New event announced and published!', 'Event Created');
      }
      setIsModalOpen(false);
      await loadEvents();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.field) setFormErrors({ [err.field]: err.message });
        else setFormErrors({ form: err.message });
      } else {
        setFormErrors({ form: 'Failed to save event' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!user || !eventToDelete) return;

    setIsDeleting(true);
    try {
      await api.deleteEvent(user.id, eventToDelete.id);
      success(`Event "${eventToDelete.title}" was cancelled and removed.`, 'Event Cancelled');
      setEventToDelete(null);
      await loadEvents();
    } catch {
      toastError('Failed to cancel event');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user || user.role !== 'clubAdmin') return null;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Event Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Organize competitions, workshops, and general body sessions for {club?.name}
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Announce New Event
        </button>
      </div>

      {isLoading ? (
        <div className="h-40 bg-slate-100 rounded-2xl animate-pulse" />
      ) : events.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <Calendar className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-800">No events scheduled yet</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">Host your first workshop or contest for club members or the general campus.</p>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Create Event
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span className="flex items-center gap-1 font-mono tabular-nums text-slate-700 font-semibold">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    {ev.registrationCount} Registered
                  </span>
                  <span className="flex items-center gap-1 text-[11px]">
                    {ev.visibility === 'public' ? (
                      <>
                        <Globe className="w-3.5 h-3.5 text-slate-400" />
                        Public Event
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5 text-indigo-500" />
                        Members Only
                      </>
                    )}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">{ev.title}</h3>
                <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">{ev.description}</p>

                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{ev.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{ev.time || '10:00 AM'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 col-span-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{ev.venue}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Deadline: <strong className="text-slate-600 font-mono">{ev.registrationDeadline}</strong>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(ev)}
                    className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    aria-label="Edit event"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setEventToDelete(ev)}
                    className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    aria-label="Cancel event"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEventId ? 'Edit Event Details' : 'Announce New Club Event'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formErrors.form && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
              {formErrors.form}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Event Title</label>
            <input
              type="text"
              placeholder="e.g. BAUST Dynamic Programming Masterclass"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`w-full px-3.5 py-2.5 text-xs rounded-xl border bg-slate-50/50 focus:bg-white focus:outline-none transition-colors ${
                formErrors.title ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500'
              }`}
            />
            {formErrors.title && <p className="text-xs text-rose-600 mt-1 font-medium">{formErrors.title}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              placeholder="Outline the agenda, prerequisites, certificate/prizes..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`w-full p-2.5 text-xs rounded-xl border bg-slate-50/50 focus:bg-white focus:outline-none transition-colors ${
                formErrors.description ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500'
              }`}
            />
            {formErrors.description && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{formErrors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Event Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:outline-none transition-colors font-mono"
              />
              {formErrors.date && <p className="text-xs text-rose-600 mt-1 font-medium">{formErrors.date}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Time</label>
              <input
                type="text"
                placeholder="10:00 AM - 01:00 PM"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Venue</label>
              <input
                type="text"
                placeholder="Central Auditorium / Lab 301"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:outline-none transition-colors"
              />
              {formErrors.venue && <p className="text-xs text-rose-600 mt-1 font-medium">{formErrors.venue}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Registration Deadline</label>
              <input
                type="date"
                value={formData.registrationDeadline}
                onChange={(e) => setFormData({ ...formData, registrationDeadline: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:outline-none transition-colors font-mono"
              />
              {formErrors.registrationDeadline && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{formErrors.registrationDeadline}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Audience Visibility</label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`p-3 rounded-xl border text-xs cursor-pointer flex items-center gap-2 transition-colors ${
                  formData.visibility === 'public'
                    ? 'border-indigo-500 bg-indigo-50/40 text-indigo-950 font-semibold'
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                <input
                  type="radio"
                  name="visibility"
                  value="public"
                  checked={formData.visibility === 'public'}
                  onChange={() => setFormData({ ...formData, visibility: 'public' })}
                  className="sr-only"
                />
                <Globe className="w-4 h-4 text-indigo-600 shrink-0" />
                <div>
                  <p>Public Event</p>
                  <p className="text-[10px] text-slate-400 font-normal">All university students can register</p>
                </div>
              </label>

              <label
                className={`p-3 rounded-xl border text-xs cursor-pointer flex items-center gap-2 transition-colors ${
                  formData.visibility === 'membersOnly'
                    ? 'border-indigo-500 bg-indigo-50/40 text-indigo-950 font-semibold'
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                <input
                  type="radio"
                  name="visibility"
                  value="membersOnly"
                  checked={formData.visibility === 'membersOnly'}
                  onChange={() => setFormData({ ...formData, visibility: 'membersOnly' })}
                  className="sr-only"
                />
                <Lock className="w-4 h-4 text-indigo-600 shrink-0" />
                <div>
                  <p>Members Only</p>
                  <p className="text-[10px] text-slate-400 font-normal">Restricted to approved club members</p>
                </div>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : editingEventId ? 'Update Event' : 'Publish Event'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Cancel Event Confirmation Modal */}
      <Modal
        isOpen={!!eventToDelete}
        onClose={() => setEventToDelete(null)}
        title="Cancel Event"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Are you sure you want to cancel <strong className="text-slate-900">{eventToDelete?.title}</strong>?
            All student registrations for this session will be released.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setEventToDelete(null)}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Keep Event
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              {isDeleting ? 'Cancelling...' : 'Confirm Cancellation'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
