import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  Users,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  Calendar,
  GraduationCap,
  ShieldCheck
} from 'lucide-react';

interface MemberRow {
  membershipId: string;
  studentId: string;
  name: string;
  department: string;
  batch: string;
  joinedDate: string;
  email: string;
  phone?: string;
}

export const ManageMembers: React.FC = () => {
  const { user, club } = useAuth();

  const [members, setMembers] = useState<MemberRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [batchFilter, setBatchFilter] = useState('all');
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  /**
   * ACCESS CONTROL & PRIVACY MAINTAIN (Rule 12 & 13):
   * This query passes the verified admin's session ID and clubId.
   * The backend strictly rejects any attempt to fetch another club's members.
   * Sensitive contact fields (phone, email) are only delivered here.
   */
  const loadMembers = async () => {
    if (!user || !user.clubId) return;

    try {
      setIsLoading(true);
      const list = await api.getClubMembers(user.id, user.clubId, searchTerm, batchFilter);
      setMembers(list);
    } catch (err) {
      console.error('Failed to load club members:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, [user, searchTerm, batchFilter]);

  if (!user || user.role !== 'clubAdmin' || !user.clubId) {
    return null;
  }

  // Extract distinct batches for filter
  const batches = ['all', '19th', '20th', '21st', '22nd', '23rd'];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Privacy Guard Enforced · Scoped to {club?.name || 'Your Club'}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Active Club Members</h1>
          <p className="text-xs text-slate-500 mt-1">
            Directory of approved students enrolled in {club?.name}
          </p>
        </div>

        {/* Filter tools */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, ID, dept..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-indigo-500 shadow-2xs"
            />
          </div>

          <select
            value={batchFilter}
            onChange={(e) => setBatchFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-indigo-500 shadow-2xs text-slate-700"
          >
            <option value="all">All Batches</option>
            {batches
              .filter((b) => b !== 'all')
              .map((b) => (
                <option key={b} value={b}>
                  Batch {b}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading club members...</div>
        ) : members.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs text-slate-600 font-semibold">No approved members found.</p>
            <p className="text-xs text-slate-400 mt-1">
              Check pending applications or adjust your search parameters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Student ID</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Batch</th>
                  <th className="py-3 px-4">Join Date</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {members.map((m) => {
                  const isExpanded = expandedRowId === m.membershipId;

                  return (
                    <React.Fragment key={m.membershipId}>
                      <tr
                        className={`hover:bg-slate-50/60 transition-colors cursor-pointer ${
                          isExpanded ? 'bg-indigo-50/30' : ''
                        }`}
                        onClick={() => setExpandedRowId(isExpanded ? null : m.membershipId)}
                      >
                        <td className="py-3 px-4 font-semibold text-slate-900">{m.name}</td>
                        <td className="py-3 px-4 font-mono text-slate-700">{m.studentId}</td>
                        <td className="py-3 px-4 text-slate-600">{m.department}</td>
                        <td className="py-3 px-4 text-slate-600 font-medium">{m.batch}</td>
                        <td className="py-3 px-4 text-slate-500 font-mono">
                          {new Date(m.joinedDate).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            className="p-1 rounded-md text-slate-400 hover:text-indigo-600 transition-colors"
                            aria-label="Toggle contact details"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-indigo-600" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Contact Information Row (Admin Only) */}
                      {isExpanded && (
                        <tr className="bg-slate-50/80 border-y border-indigo-100/60">
                          <td colSpan={6} className="py-3 px-6">
                            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-700">
                              <div className="flex items-center gap-1.5 font-medium">
                                <Mail className="w-3.5 h-3.5 text-indigo-500" />
                                <span>Email:</span>
                                <a
                                  href={`mailto:${m.email}`}
                                  className="text-indigo-600 hover:underline font-mono"
                                >
                                  {m.email}
                                </a>
                              </div>
                              <div className="flex items-center gap-1.5 font-medium">
                                <Phone className="w-3.5 h-3.5 text-indigo-500" />
                                <span>Phone:</span>
                                <span className="font-mono text-slate-900">{m.phone || 'Not provided'}</span>
                              </div>
                              <div className="text-[11px] text-slate-400 italic">
                                * Confidential member contact info visible only to assigned Club President
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
