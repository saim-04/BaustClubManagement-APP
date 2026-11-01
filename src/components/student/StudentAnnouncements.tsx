import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Announcement } from '../../types';
import { Bell, Lock, Globe, Search, Calendar } from 'lucide-react';

export const StudentAnnouncements: React.FC = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<
    (Announcement & { clubName: string; isOwnClub: boolean })[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const list = await api.getAnnouncementsForViewer(user?.id);
        setAnnouncements(list);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [user]);

  const filtered = announcements.filter(
    (a) =>
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.clubName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Campus Announcements</h1>
          <p className="text-xs text-slate-500 mt-1">
            Official notices, recruitments, and schedule updates from BAUST student societies
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search notices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-sky-500 shadow-2xs"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <Bell className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-xs text-slate-500">No announcements match your filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((a) => (
            <div
              key={a.id}
              className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all space-y-3"
            >
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-sky-700">{a.clubName}</span>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(a.createdAt).toLocaleDateString()}
                  </span>
                  {a.editedAt && (
                    <span className="text-[10px] text-slate-400">(Edited)</span>
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
                        Members Exclusive
                      </>
                    )}
                  </span>
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900 leading-snug">{a.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{a.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
