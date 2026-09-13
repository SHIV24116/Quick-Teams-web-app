import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMatches } from '../store/matchSlice';
import InviteModal from '../components/InviteModal';
import {
  Search,
  Zap,
  Send,
  Github,
  Linkedin,
  GraduationCap,
  UserX,
  CheckCircle,
  Code2
} from 'lucide-react';

const Matches = () => {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserForInvite, setSelectedUserForInvite] = useState(null);

  const { matches, loading } = useSelector((state) => state.match);

  useEffect(() => {
    dispatch(fetchMatches(searchQuery));
  }, [dispatch]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    dispatch(fetchMatches(searchQuery));
  };

  const renderSkillBadges = (skillsStr) => {
    if (!skillsStr) return null;
    const skillList = skillsStr.split(',').map((s) => s.trim()).filter((s) => s.length > 0);
    return skillList.map((skill, idx) => (
      <span
        key={idx}
        className="px-2.5 py-1 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
      >
        {skill}
      </span>
    ));
  };

  return (
    <div className="space-y-8 py-6">
      {/* Header & Search Bar */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5 text-brand-500" />
            <span>Developer Skill Radar</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Find Hackathon Teammates</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Search developer skills (e.g. <span className="font-mono text-brand-600 dark:text-brand-400">"React Python SQL"</span>) to score top matches.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="w-full md:w-auto flex items-center space-x-2">
          <div className="relative flex-1 md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search skills, name, bio..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-500 text-sm"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-sm transition-all"
          >
            Search
          </button>
        </form>
      </div>

      {/* Talent Cards Grid */}
      {loading ? (
        <div className="text-center py-16 space-y-4">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 dark:text-slate-400 text-sm">Scanning developer radar...</p>
        </div>
      ) : matches.length === 0 ? (
        <div className="text-center py-16 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <UserX className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">No Matching Developers Found</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto">
            Try adjusting your search query or clear filters to view available developers.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((dev) => (
            <div
              key={dev.id}
              className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between space-y-5 hover:border-brand-300 dark:hover:border-brand-700 transition-all shadow-sm group"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0">
                      {dev.photo ? (
                        <img
                          src={`/uploads/${dev.photo}`}
                          alt={dev.username}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(dev.username) + '&background=0D8ABC&color=fff';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-brand-600 text-white flex items-center justify-center font-bold text-lg">
                          {dev.name ? dev.name[0].toUpperCase() : dev.username[0].toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                        {dev.name || dev.username}
                      </h3>
                      <div className="text-xs font-mono text-slate-500 dark:text-slate-400">@{dev.username}</div>
                    </div>
                  </div>

                  <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-[11px] font-semibold">
                    <CheckCircle className="w-3 h-3" />
                    <span>Available</span>
                  </span>
                </div>

                {dev.about_me && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60">
                    "{dev.about_me}"
                  </p>
                )}

                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Skills</div>
                  <div className="flex flex-wrap gap-1.5">
                    {renderSkillBadges(dev.skills) || (
                      <span className="text-xs text-slate-400">No skills listed</span>
                    )}
                  </div>
                </div>

                {dev.education && (
                  <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
                    <GraduationCap className="w-4 h-4 text-brand-500 shrink-0" />
                    <span className="truncate">{dev.education}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {dev.github && (
                    <a
                      href={dev.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                      title="GitHub Profile"
                    >
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                  {dev.linkedin && (
                    <a
                      href={dev.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                      title="LinkedIn Profile"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                </div>

                <button
                  onClick={() => setSelectedUserForInvite(dev)}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-sm transition-all flex items-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Invite to Team</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedUserForInvite && (
        <InviteModal
          targetUser={selectedUserForInvite}
          onClose={() => setSelectedUserForInvite(null)}
        />
      )}
    </div>
  );
};

export default Matches;
