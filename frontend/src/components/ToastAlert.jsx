import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { clearAuthAlerts } from '../store/authSlice';
import { clearTeamAlerts } from '../store/teamSlice';
import { clearMatchAlerts } from '../store/matchSlice';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

const ToastAlert = () => {
  const dispatch = useDispatch();

  const authState = useSelector((state) => state.auth);
  const teamState = useSelector((state) => state.teams);
  const matchState = useSelector((state) => state.match);

  const error = authState.error || teamState.error || matchState.error;
  const success = authState.successMessage || teamState.successMessage || matchState.successMessage;

  const handleClose = () => {
    dispatch(clearAuthAlerts());
    dispatch(clearTeamAlerts());
    dispatch(clearMatchAlerts());
  };

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        handleClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  if (!error && !success) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-3 max-w-md w-full px-4 py-3.5 rounded-2xl shadow-2xl backdrop-blur-xl border transition-all duration-300 animate-bounce-short ${
      error
        ? 'bg-rose-950/90 border-rose-500/50 text-rose-200 shadow-rose-500/20'
        : 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200 shadow-emerald-500/20'
    }">
      {error ? (
        <AlertCircle className="w-6 h-6 text-rose-400 shrink-0" />
      ) : (
        <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
      )}
      <div className="flex-1 text-sm font-medium pr-2">
        {error || success}
      </div>
      <button
        onClick={handleClose}
        className="p-1 rounded-lg hover:bg-white/10 transition-colors"
      >
        <X className="w-4 h-4 opacity-70 hover:opacity-100" />
      </button>
    </div>
  );
};

export default ToastAlert;
