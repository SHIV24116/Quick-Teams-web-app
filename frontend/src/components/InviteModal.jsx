import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { sendInvite } from '../store/matchSlice';
import { fetchMyTeams } from '../store/teamSlice';
import { X, Send, ShieldCheck, AlertCircle } from 'lucide-react';

const InviteModal = ({ targetUser, onClose }) => {
  const dispatch = useDispatch();
  const { myTeams } = useSelector((state) => state.teams);
  const { user: currentUser } = useSelector((state) => state.auth);

  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [purpose, setPurpose] = useState('');

  // Filter teams where currentUser is Admin
  const adminTeams = myTeams.filter((team) =>
    team.members?.some(
      (m) => m.id === currentUser?.id && m.TeamMember?.role === 'admin'
    )
  );

  useEffect(() => {
    dispatch(fetchMyTeams());
  }, [dispatch]);

  useEffect(() => {
    if (adminTeams.length > 0 && !selectedTeamId) {
      setSelectedTeamId(adminTeams[0].id.toString());
    }
  }, [adminTeams, selectedTeamId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedTeamId) return;

    dispatch(
      sendInvite({
        receiver_id: targetUser.id,
        team_id: parseInt(selectedTeamId, 10),
        purpose: purpose.trim() || 'Hey! Join our hackathon team workspace!'
      })
    );
    onClose();
  };

  if (!targetUser) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700/70 p-6 shadow-2xl light:bg-white light:border-slate-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-accent-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
            {targetUser.name ? targetUser.name[0].toUpperCase() : targetUser.username[0].toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white light:text-slate-900">
              Invite {targetUser.name || targetUser.username}
            </h3>
            <p className="text-xs text-slate-400">
              Select a team you administer to send an official workspace invitation
            </p>
          </div>
        </div>

        {adminTeams.length === 0 ? (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm flex items-start space-x-3 mb-4">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">No Admin Teams Found</p>
              <p className="text-xs text-amber-200/80 mt-1">
                You must be an Admin of at least one team to send invites. Please create a team workspace first in "My Teams".
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Select Team Workspace
              </label>
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-brand-500 light:bg-slate-50 light:border-slate-300 light:text-slate-900"
              >
                {adminTeams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.members?.length || 0} members)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Invitation Note / Pitch (Optional)
              </label>
              <textarea
                rows={3}
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="E.g., We saw your Python & React skills and would love to have you on our hackathon team!"
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 light:bg-slate-50 light:border-slate-300 light:text-slate-900"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-brand-600 to-accent-500 text-white shadow-lg shadow-brand-500/20 hover:from-brand-500 hover:to-accent-400 transition-all flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Send Team Invitation</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default InviteModal;
