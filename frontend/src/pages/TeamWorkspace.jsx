import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTeamDetails, makeAdmin, removeMember, leaveTeam } from '../store/teamSlice';
import API from '../api/axios';
import {
  MessageSquare,
  Send,
  Users,
  ShieldCheck,
  UserX,
  LogOut,
  Shield
} from 'lucide-react';

const TeamWorkspace = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const messagesEndRef = useRef(null);

  const { currentTeam, loading } = useSelector((state) => state.teams);
  const { user: currentUser } = useSelector((state) => state.auth);

  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    if (teamId) {
      dispatch(fetchTeamDetails(teamId));
    }
  }, [teamId, dispatch]);

  const loadMessages = async () => {
    try {
      const res = await API.get(`/chats/${teamId}`);
      setMessages(res.data);
    } catch (err) {
      console.error('[CHAT LOAD ERROR]', err);
    }
  };

  useEffect(() => {
    if (teamId) {
      loadMessages();
      const interval = setInterval(loadMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [teamId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    try {
      setChatLoading(true);
      await API.post(`/chats/${teamId}`, { content: chatInput.trim() });
      setChatInput('');
      loadMessages();
    } catch (err) {
      console.error('[SEND MESSAGE ERROR]', err);
    } finally {
      setChatLoading(false);
    }
  };

  const isCurrentAdmin = currentTeam?.members?.some(
    (m) => m.id === currentUser?.id && m.TeamMember?.role === 'admin'
  );

  const handlePromoteAdmin = (targetUserId) => {
    if (window.confirm('Are you sure you want to promote this member to Admin?')) {
      dispatch(makeAdmin({ teamId, userId: targetUserId }));
    }
  };

  const handleKickMember = (targetUserId) => {
    if (window.confirm('Are you sure you want to remove this member from the team?')) {
      dispatch(removeMember({ teamId, userId: targetUserId }));
    }
  };

  const handleLeaveWorkspace = () => {
    if (window.confirm('Are you sure you want to leave this team workspace?')) {
      dispatch(leaveTeam(teamId)).then((res) => {
        if (!res.error) {
          navigate('/my-teams');
        }
      });
    }
  };

  if (loading || !currentTeam) {
    return (
      <div className="text-center py-20 space-y-4">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-500 dark:text-slate-400 text-sm">Opening Team Workspace...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-6">
      {/* Workspace Header */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {currentTeam.name}
            </h1>
            {isCurrentAdmin && (
              <span className="px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs font-semibold flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>You are Admin</span>
              </span>
            )}
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {currentTeam.description || 'Dedicated Hackathon Team Workspace'}
          </p>
        </div>

        <button
          onClick={handleLeaveWorkspace}
          className="px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-100 text-xs font-semibold transition-all flex items-center space-x-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Leave Team</span>
        </button>
      </div>

      {/* Main Workspace Layout (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Live Chat (2 cols) */}
        <div className="lg:col-span-2 flex flex-col h-[580px] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {/* Chat Header */}
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-brand-500" />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Team Group Chat</h3>
            </div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Updates</span>
            </span>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-sm">
                No messages yet. Start the conversation with your team!
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.sender_id === currentUser?.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        {msg.sender?.name || msg.sender?.username}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div
                      className={`max-w-md px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isMe
                          ? 'bg-brand-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Form */}
          <form onSubmit={handleSendMessage} className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex items-center space-x-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type message to team..."
              className="flex-1 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-500 text-sm"
            />
            <button
              type="submit"
              disabled={chatLoading || !chatInput.trim()}
              className="px-5 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-semibold shadow-sm transition-all disabled:opacity-50 flex items-center space-x-1"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Right Column: Roster & Controls */}
        <div className="space-y-6">
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-brand-500" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Team Roster ({currentTeam.members?.length || 0})
                </h3>
              </div>
            </div>

            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {currentTeam.members?.map((m) => {
                const isMemberAdmin = m.TeamMember?.role === 'admin';
                return (
                  <div
                    key={m.id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0">
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

                      <div className="truncate">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {m.name || m.username}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">@{m.username}</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0">
                      {isMemberAdmin ? (
                        <span className="px-2 py-0.5 rounded-md bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-[10px] font-bold">
                          Admin
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-[10px] font-medium">
                          Member
                        </span>
                      )}

                      {isCurrentAdmin && m.id !== currentUser?.id && (
                        <div className="flex items-center space-x-1 ml-1">
                          {!isMemberAdmin && (
                            <button
                              onClick={() => handlePromoteAdmin(m.id)}
                              className="p-1 rounded bg-slate-200 dark:bg-slate-700 hover:bg-brand-600 text-slate-600 dark:text-slate-300 hover:text-white"
                              title="Make Admin"
                            >
                              <Shield className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleKickMember(m.id)}
                            className="p-1 rounded bg-slate-200 dark:bg-slate-700 hover:bg-rose-600 text-slate-600 dark:text-slate-300 hover:text-white"
                            title="Remove Member"
                          >
                            <UserX className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamWorkspace;
