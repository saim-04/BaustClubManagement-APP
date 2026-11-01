import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api, ApiError } from '../../services/api';
import { Announcement } from '../../types';
import { Modal } from '../common/Modal';
import {
  Bell,
  PlusCircle,
  Edit2,
  Trash2,
  Globe,
  Lock,
  Calendar,
  ShieldCheck
} from 'lucide-react';

export const AnnouncementManagement: React.FC = () => {
  const { user, club } = useAuth();
  const { success, error: toastError } = useToast();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'membersOnly'>('public');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete modal
  const [itemToDelete, setItemToDelete] = useState<Announcement | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async () => {
    if (!user || !user.clubId) return;

    try {
      setIsLoading(true);
      const list = await api.getAnnouncementsForViewer(user.id);
      // Strictly filter to own club's announcements
      setAnnouncements(list.filter((a) => a.clubId === user.clubId));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setVisibility('public');
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (a: Announcement) => {
    setEditingId(a.id);
    setTitle(a.title);
    setContent(a.content);
    setVisibility(a.visibility);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setFormErrors({});
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Title is required';
    if (!content.trim()) errs.content = 'Content is required';

    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        await api.updateAnnouncement(user.id, editingId, { title, content, visibility });
        success('Announcement modified with updated timestamp', 'Notice Updated');
      } else {
        await api.createAnnouncement(user.id, { title, content, visibility });
        success('Notice published to student bulletin', 'Notice Published');
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.field) setFormErrors({ [err.field]: err.message });
        else setFormErrors({ form: err.message });
      } else {
        setFormErrors({ form: 'Failed to save announcement' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!user || !itemToDelete) return;

    setIsDeleting(true);
    try {
      await api.deleteAnnouncement(user.id, itemToDelete.id);
      success('Announcement removed from official records', 'Notice Deleted');
      setItemToDelete(null);
      await loadData();
    } catch {
      toastError('Failed to delete announcement');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user || user.role !== 'clubAdmin') return null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Scoped to {club?.name || 'Your Club'}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manage Announcements</h1>
          <p className="text-xs text-slate-500 mt-1">
            Publish notices, recruitment calls, and executive circulars for {club?.name}
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Post Announcement
        </button>
      </div>

      {isLoading ? (
        <div className="h-40 bg-slate-100 rounded-2xl animate-pulse" />
      ) : announcements.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <Bell className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-800">No Announcements Posted</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">Post updates or instructions for your club members.</p>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Post Notice
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => (
            <div
              key={a.id}
              className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all flex flex-col sm:flex-row justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Published {new Date(a.createdAt).toLocaleDateString()}
                  </span>
                  {a.editedAt && (
                    <span className="text-[11px] text-indigo-600 font-medium">
                      · Edited {new Date(a.editedAt).toLocaleDateString()}
                    </span>
                  )}
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1">
                    {a.visibility === 'public' ? (
                      <>
                        <Globe className="w-3.5 h-3.5 text-slate-400" />
                        Public Notice
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5 text-indigo-500" />
                        Members Only
                      </>
                    )}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">{a.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{a.content}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0 self-end sm:self-start">
                <button
                  onClick={() => handleOpenEdit(a)}
                  className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => setItemToDelete(a)}
                  className="p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Announcement' : 'Post New Club Notice'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formErrors.form && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
              {formErrors.form}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Announcement Title</label>
            <input
              type="text"
              placeholder="e.g. Schedule of General Body Meeting & Volunteer Recruitment"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full px-3.5 py-2.5 text-xs rounded-xl border bg-slate-50/50 focus:bg-white focus:outline-none transition-colors ${
                formErrors.title ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500'
              }`}
            />
            {formErrors.title && <p className="text-xs text-rose-600 mt-1 font-medium">{formErrors.title}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Content / Instructions</label>
            <textarea
              rows={4}
              placeholder="Write the detailed notice text..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={`w-full p-2.5 text-xs rounded-xl border bg-slate-50/50 focus:bg-white focus:outline-none transition-colors ${
                formErrors.content ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500'
              }`}
            />
            {formErrors.content && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{formErrors.content}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Audience Visibility</label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`p-3 rounded-xl border text-xs cursor-pointer flex items-center gap-2 transition-colors ${
                  visibility === 'public'
                    ? 'border-indigo-500 bg-indigo-50/40 text-indigo-950 font-semibold'
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                <input
                  type="radio"
                  name="visibility"
                  value="public"
                  checked={visibility === 'public'}
                  onChange={() => setVisibility('public')}
                  className="sr-only"
                />
                <Globe className="w-4 h-4 text-indigo-600 shrink-0" />
                <div>
                  <p>Public Campus Notice</p>
                  <p className="text-[10px] text-slate-400 font-normal">Visible to all students</p>
                </div>
              </label>

              <label
                className={`p-3 rounded-xl border text-xs cursor-pointer flex items-center gap-2 transition-colors ${
                  visibility === 'membersOnly'
                    ? 'border-indigo-500 bg-indigo-50/40 text-indigo-950 font-semibold'
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                <input
                  type="radio"
                  name="visibility"
                  value="membersOnly"
                  checked={visibility === 'membersOnly'}
                  onChange={() => setVisibility('membersOnly')}
                  className="sr-only"
                />
                <Lock className="w-4 h-4 text-indigo-600 shrink-0" />
                <div>
                  <p>Club Members Only</p>
                  <p className="text-[10px] text-slate-400 font-normal">Restricted to your approved members</p>
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
              {isSubmitting ? 'Saving...' : editingId ? 'Update Notice' : 'Post Notice'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        title="Delete Announcement"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Are you sure you want to delete <strong className="text-slate-900">{itemToDelete?.title}</strong>?
            This notice will be removed immediately from student dashboards.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setItemToDelete(null)}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Confirm Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
