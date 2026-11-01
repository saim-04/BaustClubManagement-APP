import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api, ApiError } from '../../services/api';
import { Equipment } from '../../types';
import { Modal } from '../common/Modal';
import {
  Wrench,
  PlusCircle,
  Share2,
  RotateCcw,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight
} from 'lucide-react';

export const EquipmentManagement: React.FC = () => {
  const { user, club } = useAuth();
  const { success, error: toastError } = useToast();

  const [myEquipment, setMyEquipment] = useState<Equipment[]>([]);
  const [availableOthers, setAvailableOthers] = useState<(Equipment & { ownerClubName: string })[]>([]);
  const [borrowedByMe, setBorrowedByMe] = useState<(Equipment & { ownerClubName: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add Equipment Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEquipName, setNewEquipName] = useState('');
  const [newEquipCategory, setNewEquipCategory] = useState('AV & Audio');
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState('');

  // Borrow action loading
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const loadData = async () => {
    if (!user || !user.clubId) return;

    try {
      setIsLoading(true);
      const res = await api.getEquipmentList(user.id);
      setMyEquipment(res.myEquipment);
      setAvailableOthers(res.availableOthers);
      setBorrowedByMe(res.borrowedByMe);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleAddEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!newEquipName.trim()) {
      setAddError('Please enter equipment name');
      return;
    }

    setIsAdding(true);
    try {
      await api.addClubEquipment(user.id, {
        name: newEquipName.trim(),
        category: newEquipCategory
      });
      success(`Added "${newEquipName}" to club inventory`, 'Equipment Registered');
      setIsAddModalOpen(false);
      setNewEquipName('');
      await loadData();
    } catch (err: unknown) {
      if (err instanceof ApiError) setAddError(err.message);
      else setAddError('Failed to register equipment');
    } finally {
      setIsAdding(false);
    }
  };

  const handleBorrow = async (eq: Equipment & { ownerClubName: string }) => {
    if (!user) return;
    setActionLoadingId(eq.id);
    try {
      await api.borrowEquipment(user.id, eq.id);
      success(`Borrowed "${eq.name}" from ${eq.ownerClubName}!`, 'Item Checked Out');
      await loadData();
    } catch (err: unknown) {
      if (err instanceof ApiError) toastError(err.message);
      else toastError('Failed to borrow item');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReturn = async (eqId: string, name: string) => {
    if (!user) return;
    setActionLoadingId(eqId);
    try {
      await api.returnEquipment(user.id, eqId);
      success(`"${name}" returned successfully to owner club.`, 'Item Returned');
      await loadData();
    } catch (err: unknown) {
      if (err instanceof ApiError) toastError(err.message);
      else toastError('Failed to return item');
    } finally {
      setActionLoadingId(null);
    }
  };

  if (!user || user.role !== 'clubAdmin') return null;

  return (
    <div className="space-y-10 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Equipment Re-Use & Sharing</h1>
          <p className="text-xs text-slate-500 mt-1">
            Share hardware kits, projectors, mics, and 3D printers with fellow university clubs
          </p>
        </div>
        <button
          onClick={() => {
            setNewEquipName('');
            setAddError('');
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Add Item to Inventory
        </button>
      </div>

      {/* SECTION 1: Items Currently Borrowed by Us */}
      {borrowedByMe.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            Currently Borrowed by {club?.name} ({borrowedByMe.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {borrowedByMe.map((eq) => (
              <div
                key={eq.id}
                className="bg-amber-50/40 p-4 rounded-xl border border-amber-200 flex items-center justify-between"
              >
                <div>
                  <span className="text-[11px] font-semibold text-amber-800">Owner: {eq.ownerClubName}</span>
                  <h4 className="text-xs font-bold text-slate-900 mt-0.5">{eq.name}</h4>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Checked out: {eq.borrowedAt ? new Date(eq.borrowedAt).toLocaleDateString() : 'Active'}
                  </span>
                </div>
                <button
                  onClick={() => handleReturn(eq.id, eq.name)}
                  disabled={actionLoadingId === eq.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  Return Item
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: Our Own Equipment */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600" />
          {club?.name} Inventory ({myEquipment.length})
        </h2>

        {isLoading ? (
          <div className="h-32 bg-slate-100 rounded-2xl animate-pulse" />
        ) : myEquipment.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <Wrench className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs text-slate-600 font-medium">No items in your club inventory yet.</p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="mt-2 text-xs font-semibold text-indigo-600 hover:underline"
            >
              Add hardware or sound equipment &rarr;
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Equipment Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myEquipment.map((eq) => (
                    <tr key={eq.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{eq.name}</td>
                      <td className="py-3.5 px-4 text-slate-600">{eq.category || 'General'}</td>
                      <td className="py-3.5 px-4">
                        {eq.status === 'available' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3 h-3" />
                            Available
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                            <Clock className="w-3 h-3" />
                            In Use / Lent Out
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {eq.status === 'inUse' && (
                          <button
                            onClick={() => handleReturn(eq.id, eq.name)}
                            disabled={actionLoadingId === eq.id}
                            className="text-xs text-indigo-600 hover:underline font-semibold"
                          >
                            Mark Available
                          </button>
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

      {/* SECTION 3: Available Equipment from Peer Clubs */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Share2 className="w-4 h-4 text-sky-600" />
          Available for Borrowing from Peer Clubs ({availableOthers.length})
        </h2>

        {availableOthers.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No items currently available from other clubs.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableOthers.map((eq) => (
              <div
                key={eq.id}
                className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span className="font-semibold text-indigo-700">{eq.ownerClubName}</span>
                    <span>{eq.category}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">{eq.name}</h4>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Available to Borrow
                  </span>

                  <button
                    onClick={() => handleBorrow(eq)}
                    disabled={actionLoadingId === eq.id}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    Request to Borrow
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Equipment Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Equipment to Club Inventory"
      >
        <form onSubmit={handleAddEquipment} className="space-y-4">
          {addError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
              {addError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Equipment / Device Name</label>
            <input
              type="text"
              placeholder="e.g. Sony 4K Video Camera & Tripod Kit"
              value={newEquipName}
              onChange={(e) => setNewEquipName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
            <select
              value={newEquipCategory}
              onChange={(e) => setNewEquipCategory(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:outline-none transition-colors"
            >
              <option value="AV & Display">AV & Projectors</option>
              <option value="Sound & Mic">Sound & Microphones</option>
              <option value="Fabrication">Fabrication & 3D Printing</option>
              <option value="Robotics Hardware">Robotics Hardware & Sensors</option>
              <option value="Networking">Networking & Cabling</option>
              <option value="Sports Gear">Sports Equipment</option>
            </select>
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
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              {isAdding ? 'Adding...' : 'Save Item'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
