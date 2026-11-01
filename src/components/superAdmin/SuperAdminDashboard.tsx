import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api, ApiError } from '../../services/api';
import { db } from '../../services/db';
import { Club, User } from '../../types';
import { Modal } from '../common/Modal';
import {
  ShieldCheck,
  Building2,
  Users,
  Calendar,
  GitPullRequest,
  PlusCircle,
  ToggleLeft,
  ToggleRight,
  Trash2,
  ExternalLink,
  Search,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const SuperAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [stats, setStats] = useState({
    totalStudents: 0,
    totalClubs: 0,
    pendingCollabs: 0,
    totalEvents: 0
  });
  const [clubs, setClubs] = useState<(Club & { memberCount: number; pendingCount: number; adminName?: string })[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Add Club Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newClubName, setNewClubName] = useState('');
  const [newClubCategory, setNewClubCategory] = useState('Technology & Computing');
  const [newClubDescription, setNewClubDescription] = useState('');
  const [assignedAdminUserId, setAssignedAdminUserId] = useState('');
  const [addFormErrors, setAddFormErrors] = useState<Record<string, string>>({});
  const [isAdding, setIsAdding] = useState(false);

  // Delete Club Modal
  const [clubToDelete, setClubToDelete] = useState<Club | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // View Details Modal
  const [viewingClub, setViewingClub] = useState<Club | null>(null);

  const loadData = async () => {
    if (!user || user.role !== 'superAdmin') return;

    try {
      setIsLoading(true);
      const [sStats, cList] = await Promise.all([
        api.getSuperAdminDashboardStats(user.id),
        api.getClubs()
      ]);
      setStats(sStats);
      setClubs(cList);
      setUsersList(db.getAllUsers());
      // Set initial user selection for add club
      const eligibleUsers = db.getAllUsers().filter((u) => u.role !== 'superAdmin');
      if (eligibleUsers.length > 0 && !assignedAdminUserId) {
        setAssignedAdminUserId(eligibleUsers[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleToggleStatus = async (clubId: string, currentStatus: string) => {
    if (!user) return;
    try {
      await api.toggleClubStatus(user.id, clubId);
      success(
        `Club is now ${currentStatus === 'active' ? 'Inactive' : 'Active'}.`,
        'Status Changed'
      );
      await loadData();
    } catch (err: unknown) {
      if (err instanceof ApiError) toastError(err.message);
      else toastError('Failed to change status');
    }
  };

  const handleOpenAddClub = () => {
    setNewClubName('');
    setNewClubCategory('Technology & Computing');
    setNewClubDescription('');
    const eligible = usersList.filter((u) => u.role !== 'superAdmin');
    setAssignedAdminUserId(eligible[0]?.id || '');
    setAddFormErrors({});
    setIsAddModalOpen(true);
  };

  const handleAddClubSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setAddFormErrors({});
    const errs: Record<string, string> = {};
    if (!newClubName.trim()) errs.name = 'Club name is required';
    if (!newClubDescription.trim()) errs.description = 'Description is required';
    if (!assignedAdminUserId) errs.adminUserId = 'Please select a student to appoint as President';

    if (Object.keys(errs).length > 0) {
      setAddFormErrors(errs);
      return;
    }

    setIsAdding(true);
    try {
      await api.createClub(user.id, {
        name: newClubName.trim(),
        category: newClubCategory,
        description: newClubDescription.trim(),
        adminUserId: assignedAdminUserId
      });
      success(`Club "${newClubName}" created and assigned president!`, 'Club Established');
      setIsAddModalOpen(false);
      await loadData();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.field) setAddFormErrors({ [err.field]: err.message });
        else setAddFormErrors({ form: err.message });
      } else {
        setAddFormErrors({ form: 'Failed to create club' });
      }
    } finally {
      setIsAdding(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!user || !clubToDelete) return;

    setIsDeleting(true);
    try {
      await api.deleteClub(user.id, clubToDelete.id);
      success(`Club "${clubToDelete.name}" deleted along with associated records.`, 'Club Removed');
      setClubToDelete(null);
      await loadData();
    } catch {
      toastError('Failed to delete club');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user || user.role !== 'superAdmin') return null;

  const filteredClubs = clubs.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.adminName && c.adminName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-50 via-slate-50 to-indigo-50/50 p-6 sm:p-8 rounded-3xl border border-purple-100 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-800 mb-2">
              <ShieldCheck className="w-4 h-4 text-purple-700" />
              <span>Directorate of Students' Welfare (ASW) Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              University Club Administration
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed max-w-2xl">
              Oversee all official student societies, establish new student chapters, activate or deactivate organizations, and monitor cross-club collaborations.
            </p>
          </div>

          <button
            onClick={handleOpenAddClub}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors self-start sm:self-auto shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            Establish New Club
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-600">Total Students</span>
            <Users className="w-4 h-4 text-purple-500" />
          </div>
          <span className="text-3xl font-bold text-slate-900 font-mono tabular-nums">
            {stats.totalStudents}
          </span>
          <p className="text-[11px] text-slate-400 mt-1">Enrolled university students</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-600">Active Clubs</span>
            <Building2 className="w-4 h-4 text-sky-500" />
          </div>
          <span className="text-3xl font-bold text-slate-900 font-mono tabular-nums">
            {stats.totalClubs}
          </span>
          <p className="text-[11px] text-slate-400 mt-1">Registered student chapters</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-600">Pending Collabs</span>
            <GitPullRequest className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-3xl font-bold text-slate-900 font-mono tabular-nums">
            {stats.pendingCollabs}
          </span>
          <p className="text-[11px] text-slate-400 mt-1">Inter-club partnership proposals</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-600">Total Events</span>
            <Calendar className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-3xl font-bold text-slate-900 font-mono tabular-nums">
            {stats.totalEvents}
          </span>
          <p className="text-[11px] text-slate-400 mt-1">Campus sessions & fests</p>
        </div>
      </div>

      {/* All Clubs Management Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-base font-bold text-slate-900">All Registered Clubs ({clubs.length})</h2>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search clubs, categories, admin..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-purple-500 shadow-2xs"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Club Name</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Approved Members</th>
                  <th className="py-3.5 px-4">President</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClubs.map((club) => (
                  <tr key={club.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{club.name}</td>
                    <td className="py-3.5 px-4 text-slate-600">{club.category}</td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                      {club.memberCount} members
                      {club.pendingCount > 0 && (
                        <span className="text-amber-600 text-[10px] ml-1.5 font-sans">
                          ({club.pendingCount} pending)
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-800">{club.adminName}</td>
                    <td className="py-3.5 px-4">
                      {club.status === 'active' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                          <CheckCircle2 className="w-3 h-3" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setViewingClub(club)}
                          className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(club.id, club.status)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                          title={club.status === 'active' ? 'Deactivate Club' : 'Activate Club'}
                        >
                          {club.status === 'active' ? (
                            <ToggleRight className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <ToggleLeft className="w-5 h-5 text-slate-400" />
                          )}
                        </button>
                        <button
                          onClick={() => setClubToDelete(club)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Club"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add New Club Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Establish New BAUST Club"
        maxWidth="lg"
      >
        <form onSubmit={handleAddClubSubmit} className="space-y-4">
          {addFormErrors.form && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
              {addFormErrors.form}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Official Club Name</label>
            <input
              type="text"
              placeholder="e.g. BAUST Cyber Security Society"
              value={newClubName}
              onChange={(e) => setNewClubName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-purple-500 focus:outline-none transition-colors"
            />
            {addFormErrors.name && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{addFormErrors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
            <select
              value={newClubCategory}
              onChange={(e) => setNewClubCategory(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-purple-500 focus:outline-none transition-colors"
            >
              <option value="Technology & Computing">Technology & Computing</option>
              <option value="Engineering & Robotics">Engineering & Robotics</option>
              <option value="Culture & Arts">Culture & Arts</option>
              <option value="Sports & Athletics">Sports & Athletics</option>
              <option value="Career & Academics">Career & Academics</option>
              <option value="Literature & Debating">Literature & Debating</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Charter & Description</label>
            <textarea
              rows={3}
              placeholder="Mission statement, expected activities, departmental affiliations..."
              value={newClubDescription}
              onChange={(e) => setNewClubDescription(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-purple-500 focus:outline-none transition-colors"
            />
            {addFormErrors.description && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{addFormErrors.description}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Assign Initial Club President
            </label>
            <select
              value={assignedAdminUserId}
              onChange={(e) => setAssignedAdminUserId(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-purple-500 focus:outline-none transition-colors"
            >
              {usersList
                .filter((u) => u.role !== 'superAdmin')
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.studentId}) — {u.department} [{u.role}]
                  </option>
                ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              * The chosen user will be immediately promoted to Club President with administrative access.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isAdding}
              className="px-5 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              {isAdding ? 'Creating Club...' : 'Charter Club'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!clubToDelete}
        onClose={() => setClubToDelete(null)}
        title="Revoke & Delete Club"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Are you sure you want to permanently delete <strong className="text-slate-900">{clubToDelete?.name}</strong>?
            This will archive all associated memberships, events, and announcements.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setClubToDelete(null)}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Confirm Revocation'}
            </button>
          </div>
        </div>
      </Modal>

      {/* View Club Details Modal */}
      <Modal
        isOpen={!!viewingClub}
        onClose={() => setViewingClub(null)}
        title={viewingClub?.name || 'Club Information'}
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5">Category</span>
            <span className="font-semibold text-slate-900">{viewingClub?.category}</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Charter Description</span>
            <p className="text-slate-700 leading-relaxed">{viewingClub?.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <span className="text-slate-400 block mb-0.5">Status</span>
              <span className="font-mono font-medium capitalize text-slate-900">{viewingClub?.status}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Established Year</span>
              <span className="font-mono font-medium text-slate-900">{viewingClub?.foundedYear || '2015'}</span>
            </div>
          </div>
          <div className="flex justify-end pt-3 border-t border-slate-100">
            <button
              onClick={() => setViewingClub(null)}
              className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
