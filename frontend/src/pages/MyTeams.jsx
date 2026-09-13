import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMyTeams, createTeam } from '../store/teamSlice';
import {
  FolderGit2,
  Plus,
  Users,
  ShieldCheck,
  ArrowRight,
  MessageSquare,
  X
} from 'lucide-react';

const MyTeams = () => {
  const dispatch = useDispatch();
  const { myTeams, loading } = useSelector((state) => state.teams);
  const { user: currentUser } = useSelector((state) => state.auth);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamDesc, setTeamDesc] = useState('');

  useEffect(() => {
    dispatch(fetchMyTeams());
  }, [dispatch]);

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!teamName.trim()) return;

    dispatch(createTeam({ name: teamName, description: teamDesc })).then((res) => {
      if (!res.error) {
        setTeamName('');
        setTeamDesc('');
        setShowCreateModal(false);
      }
    });
  };

  const isAdmin = (team) => {
    return team.members?.some(
      (m) => m.id === currentUser?.id && m.TeamMember?.role === 'admin'
    );
  };

  return (
    <div className="space-y-8 py-6">
      {/* Header Banner */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs font-semibold">
            <FolderGit2 className="w-3.5 h-3.5 text-brand-500" />
            <span>Workspace Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">My Team Workspaces</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage your project workspaces, inspect member roles, and launch team group chats.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-sm transition-all flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create Dedicated Team</span>
        </button>
      </div>

      {/* Teams Grid */}
      {loading ? (
        <div className="text-center py-16 space-y-4">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 dark:text-slate-400 text-sm">Loading team workspaces...</p>
        </div>
      ) : myTeams.length === 0 ? (
        <div className="text-center py-16 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <FolderGit2 className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">No Active Teams Yet</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto">
            You are not part of any team yet. Create your first team workspace or browse the Talent Match radar to join!
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 rounded-2xl bg-brand-600 text-white text-sm font-semibold inline-flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Team Now</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myTeams.map((team) => {
            const adminStatus = isAdmin(team);
            return (
              <div
                key={team.id}
                className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between space-y-5 hover:border-brand-300 dark:hover:border-brand-700 transition-all shadow-sm group"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                        {team.name}
                      </h3>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">Workspace ID #{team.id}</div>
                    </div>

                    {adminStatus && (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Admin</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60">
                    {team.description || 'No project description pitch provided.'}
                  </p>

                  <div className="space-y-2">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Roster ({team.members?.length || 0})
                    </div>
                    <div className="flex items-center space-x-2 overflow-x-auto py-1">
                      {team.members?.map((m) => (
                        <div
                          key={m.id}
                          className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-brand-500/50 overflow-hidden shrink-0"
                          title={`${m.name || m.username} (${m.TeamMember?.role})`}
                        >
                          {m.photo ? (
                            <img
                              src={`/uploads/${m.photo}`}
                              alt={m.username}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold">
                              {m.name ? m.name[0].toUpperCase() : m.username[0].toUpperCase()}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-1">
                    <Users className="w-3.5 h-3.5 text-brand-500" />
                    <span>Active Workspace</span>
                  </span>

                  <Link
                    to={`/team/${team.id}`}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-brand-600 dark:hover:bg-brand-600 text-slate-700 dark:text-slate-200 hover:text-white dark:hover:text-white text-xs font-semibold transition-all flex items-center space-x-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Open Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 flex items-center justify-center text-brand-600 dark:text-brand-400">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Create Team Workspace</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Establish a formal workspace for your hackathon project</p>
              </div>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Team Name *
                </label>
                <input
                  type="text"
                  required
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. CyberPulse AI Team"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Project Pitch / Description
                </label>
                <textarea
                  rows={4}
                  value={teamDesc}
                  onChange={(e) => setTeamDesc(e.target.value)}
                  placeholder="Describe your hackathon project architecture, tech stack goals, and missing developer roles..."
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-500 text-sm"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-brand-600 hover:bg-brand-500 text-white shadow-sm transition-all"
                >
                  Create Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTeams;
