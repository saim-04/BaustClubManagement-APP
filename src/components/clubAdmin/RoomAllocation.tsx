import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api, ApiError } from '../../services/api';
import { RoomBooking } from '../../types';
import { Modal } from '../common/Modal';
import {
  Building2,
  Calendar,
  Clock,
  PlusCircle,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Check
} from 'lucide-react';

export const RoomAllocation: React.FC = () => {
  const { user, club } = useAuth();
  const { success, error: toastError } = useToast();

  const [bookings, setBookings] = useState<(RoomBooking & { clubName: string; isMyClub: boolean })[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [isLoading, setIsLoading] = useState(true);

  // Booking Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roomName, setRoomName] = useState(api.ROOM_OPTIONS[0]);
  const [bookingDate, setBookingDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [timeSlot, setTimeSlot] = useState(api.TIME_SLOTS[1]);
  const [purpose, setPurpose] = useState('');
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadBookings = async (date?: string) => {
    try {
      setIsLoading(true);
      const list = await api.getRoomBookings(date);
      setBookings(list);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBookings(selectedDate);
  }, [selectedDate]);

  const handleOpenBookingModal = () => {
    setRoomName(api.ROOM_OPTIONS[0]);
    setBookingDate(selectedDate || new Date().toISOString().split('T')[0]);
    setTimeSlot(api.TIME_SLOTS[1]);
    setPurpose('');
    setConflictError(null);
    setIsModalOpen(true);
  };

  const handleBookRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setConflictError(null);

    setIsSubmitting(true);
    try {
      await api.bookRoom(user.id, {
        roomName,
        date: bookingDate,
        timeSlot,
        purpose
      });
      success(`Reserved "${roomName}" for ${timeSlot} on ${bookingDate}`, 'Room Reservation Confirmed');
      setIsModalOpen(false);
      await loadBookings(selectedDate);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setConflictError(err.message);
      } else {
        setConflictError('Failed to reserve room');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || (user.role !== 'clubAdmin' && user.role !== 'superAdmin')) {
    return null;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">University Room Allocation</h1>
          <p className="text-xs text-slate-500 mt-1">
            Official reservations for auditoriums, seminar halls, and lab spaces with automated clash prevention
          </p>
        </div>
        <button
          onClick={handleOpenBookingModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Reserve a Room
        </button>
      </div>

      {/* Date Filter Strip */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-700 font-semibold">
          <Calendar className="w-4 h-4 text-indigo-600" />
          <span>Filter Schedule by Date:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50 focus:bg-white focus:outline-none"
          />
        </div>

        <button
          onClick={() => setSelectedDate('')}
          className="text-xs text-indigo-600 hover:underline font-semibold"
        >
          Show All Upcoming Bookings
        </button>
      </div>

      {/* Bookings View */}
      {isLoading ? (
        <div className="h-40 bg-slate-100 rounded-2xl animate-pulse" />
      ) : bookings.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <Building2 className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-800">
            {selectedDate ? `No Bookings on ${selectedDate}` : 'No Facility Bookings'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">All rooms are open for allocation during these dates.</p>
          <button
            onClick={handleOpenBookingModal}
            className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700"
          >
            Reserve Facility Slot
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Room / Facility</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Time Slot</th>
                  <th className="py-3.5 px-4">Booking Club</th>
                  <th className="py-3.5 px-4">Purpose</th>
                  <th className="py-3.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((b) => (
                  <tr
                    key={b.id}
                    className={`hover:bg-slate-50/60 transition-colors ${
                      b.isMyClub ? 'bg-indigo-50/20' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 font-bold text-slate-900">{b.roomName}</td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono">{b.date}</td>
                    <td className="py-3.5 px-4 font-mono font-medium text-indigo-700">{b.timeSlot}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {b.clubName}
                      {b.isMyClub && (
                        <span className="ml-1.5 text-[10px] text-indigo-700 font-semibold px-1.5 py-0.5 rounded bg-indigo-50">
                          (My Club)
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">{b.purpose || 'Official Session'}</td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        <Check className="w-3 h-3" />
                        Confirmed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Book Room Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Reserve Campus Facility / Room"
        maxWidth="lg"
      >
        <form onSubmit={handleBookRoom} className="space-y-4">
          {conflictError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-rose-900">Allocation Conflict</p>
                <p className="mt-0.5 leading-relaxed">{conflictError}</p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Facility</label>
            <select
              value={roomName}
              onChange={(e) => {
                setRoomName(e.target.value);
                setConflictError(null);
              }}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:outline-none transition-colors"
            >
              {api.ROOM_OPTIONS.map((room) => (
                <option key={room} value={room}>
                  {room}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Booking Date</label>
              <input
                type="date"
                value={bookingDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => {
                  setBookingDate(e.target.value);
                  setConflictError(null);
                }}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:outline-none transition-colors font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Time Slot</label>
              <select
                value={timeSlot}
                onChange={(e) => {
                  setTimeSlot(e.target.value);
                  setConflictError(null);
                }}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:outline-none transition-colors font-mono"
              >
                {api.TIME_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Purpose / Event Title <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Executive Committee Strategy Meeting / Rehearsal"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:outline-none transition-colors"
            />
          </div>

          <p className="text-[11px] text-slate-400">
            * The system will automatically verify room schedule invariants to prevent double-booking.
          </p>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
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
              {isSubmitting ? 'Verifying Availability...' : 'Confirm Reservation'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
