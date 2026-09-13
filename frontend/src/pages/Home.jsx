import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Users,
  Search,
  FolderGit2,
  Trophy,
  ArrowRight,
  Sparkles,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Code2
} from 'lucide-react';

const Home = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="space-y-12 py-8">
      {/* Hero Header Section */}
      <div className="text-center space-y-6 max-w-3xl mx-auto pt-6">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-brand-500" />
          <span>The Modern Hackathon Team Engine</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
          Build Dream Teams for <span className="text-brand-600 dark:text-brand-400">Hackathons & Projects</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Find matching developers based on verified techstacks, create dedicated team workspaces, and collaborate with real-time group chat.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {user ? (
            <>
              <Link
                to="/matches"
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-semibold shadow-sm transition-all flex items-center justify-center space-x-2"
              >
                <Search className="w-4 h-4" />
                <span>Search Talent Radar</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/my-teams"
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all flex items-center justify-center space-x-2"
              >
                <FolderGit2 className="w-4 h-4" />
                <span>View My Workspaces</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/register"
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-semibold shadow-sm transition-all flex items-center justify-center space-x-2"
              >
                <span>Create Free Profile</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/login"
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm hover:border-brand-300 dark:hover:border-brand-700 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 flex items-center justify-center text-brand-600 dark:text-brand-400">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Smart Talent Matcher</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Relevance-driven algorithm matches your project needs with developers possessing required skills like React, Node.js, Python, and SQL.
          </p>
        </div>

        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm hover:border-brand-300 dark:hover:border-brand-700 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 flex items-center justify-center text-brand-600 dark:text-brand-400">
            <FolderGit2 className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Team Workspaces</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Form dedicated team channels with project pitch descriptions, role definitions, and full admin permissions for team leaders.
          </p>
        </div>

        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm hover:border-brand-300 dark:hover:border-brand-700 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 flex items-center justify-center text-brand-600 dark:text-brand-400">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Real-Time Team Chat</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Instantly share repo links, architecture diagrams, and brainstorm hackathon ideas inside private team group channels.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
