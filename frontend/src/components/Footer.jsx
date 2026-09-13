import React from 'react';
import { Users, Github, Heart, Code2 } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="mt-auto border-t border-slate-800/80 bg-slate-950/60 py-8 text-slate-400 light:bg-slate-100 light:border-slate-200 light:text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-md bg-brand-600 flex items-center justify-center">
            <Users className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-slate-200 light:text-slate-800">Quick Teams Platform</span>
          <span className="text-xs text-slate-500">© 2026. All rights reserved.</span>
        </div>

        <div className="flex items-center space-x-6 text-sm">
          <span className="flex items-center space-x-1">
            <span>Built with</span>
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500 inline" />
            <span>for Hackathon Builders</span>
          </span>
          <a
            href="https://github.com/SHIV24116/Quick-Teams-web-app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 hover:text-white transition-colors"
          >
            <Github className="w-4 h-4" />
            <span>GitHub Repository</span>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
