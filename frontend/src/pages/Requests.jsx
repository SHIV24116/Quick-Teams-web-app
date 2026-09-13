import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchIncomingInvites, acceptInvite, declineInvite } from '../store/matchSlice';
import { Mail, Check, X, Inbox } from 'lucide-react';

const Requests = () => {
  const dispatch = useDispatch();
  const { incomingInvites } = useSelector((state) => state.match);

  useEffect(() => {
    dispatch(fetchIncomingInvites());
  }, [dispatch]);

  const handleAccept = (reqId) => {
    dispatch(acceptInvite(reqId));
  };

  const handleDecline = (reqId) => {
    dispatch(declineInvite(reqId));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6">
      {/* Header Banner */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs font-semibold">
            <Mail className="w-3.5 h-3.5 text-brand-500" />
            <span>Workspace Invitations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Team Invitations</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Accept invitations to join project workspaces and access team live chat channels.
          </p>
        </div>
      </div>

      {/* Requests List */}
      {incomingInvites.length === 0 ? (
        <div className="text-center py-16 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <Inbox className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">No Pending Team Invites</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto">
            You don't have any incoming team invitations right now. Set availability in your profile to get recruited!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {incomingInvites.map((inv) => (
            <div
              key={inv.id}
              className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                  {inv.team?.name ? inv.team.name[0].toUpperCase() : 'T'}
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Invited to join <span className="text-brand-600 dark:text-brand-400">{inv.team?.name}</span>
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Sent by <span className="font-semibold text-slate-700 dark:text-slate-300">@{inv.sender?.username}</span> • {new Date(inv.createdAt).toLocaleDateString()}
                  </p>

                  {inv.purpose && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60 mt-2">
                      "{inv.purpose}"
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3 w-full md:w-auto shrink-0">
                <button
                  onClick={() => handleDecline(inv.id)}
                  className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all flex items-center justify-center space-x-1.5"
                >
                  <X className="w-4 h-4 text-rose-500" />
                  <span>Decline</span>
                </button>

                <button
                  onClick={() => handleAccept(inv.id)}
                  className="flex-1 md:flex-initial px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Accept & Join</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Requests;
