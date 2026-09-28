import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useLangStore, LanguageCode } from '../store/useLangStore';
import { Globe, Shield, User as UserIcon } from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { user, switchDemoRole, logout } = useAuthStore();
  const { currentLang, setLanguage, t } = useLangStore();

  return (
    <header className="sticky top-0 z-50 bg-navy-850/95 backdrop-blur-md text-white border-b-2 border-sand-400 shadow-civic-md h-[68px] px-6 flex items-center justify-between">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-sand-400 to-sand-500 text-navy-950 font-extrabold flex items-center justify-center text-xl shadow-md group-hover:scale-105 transition-transform">
            से
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-sand-400 text-navy-950 text-[10px] font-extrabold px-1.5 py-0.5 rounded tracking-wider uppercase">
                SETU AI
              </span>
              <span className="text-lg font-extrabold tracking-tight text-white">
                सेतु · {t('brand_sub')}
              </span>
            </div>
          </div>
        </Link>
        <span className="hidden md:inline-block text-xs text-sand-300 border-l border-sand-400/30 pl-3 ml-1 font-normal">
          {t('tagline')}
        </span>
      </div>

      {/* Nav Actions */}
      <div className="flex items-center gap-4">
        {/* Language Selector */}
        <div className="flex items-center gap-1.5 bg-white/10 border border-sand-400/30 rounded-md px-2.5 py-1 text-xs text-white">
          <Globe className="w-3.5 h-3.5 text-sand-400" />
          <select
            value={currentLang}
            onChange={(e) => setLanguage(e.target.value as LanguageCode)}
            className="bg-transparent text-white font-medium outline-none cursor-pointer text-xs"
          >
            <option value="en" className="bg-navy-950 text-white">English</option>
            <option value="hi" className="bg-navy-950 text-white">हिन्दी (Hindi)</option>
            <option value="pt" className="bg-navy-950 text-white">Português (Brasil)</option>
            <option value="ru" className="bg-navy-950 text-white">Русский (Russian)</option>
            <option value="zh" className="bg-navy-950 text-white">中文 (Chinese)</option>
          </select>
        </div>

        {/* Quick Role Switcher for Judges / Demo */}
        <div className="hidden lg:flex items-center gap-1 text-xs bg-white/5 border border-white/10 rounded-md p-1">
          <span className="text-sand-300 text-[11px] px-1.5 flex items-center gap-1 font-semibold">
            <UserIcon className="w-3 h-3 text-sand-400" /> Role:
          </span>
          <button
            onClick={() => switchDemoRole('citizen')}
            className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
              user?.role === 'citizen' ? 'bg-sand-400 text-navy-950 shadow-xs' : 'text-white/80 hover:bg-white/10'
            }`}
          >
            Citizen
          </button>
          <button
            onClick={() => switchDemoRole('official')}
            className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
              user?.role === 'official' ? 'bg-sand-400 text-navy-950 shadow-xs' : 'text-white/80 hover:bg-white/10'
            }`}
          >
            Official
          </button>
          <button
            onClick={() => switchDemoRole('national_admin')}
            className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
              user?.role === 'national_admin' ? 'bg-sand-400 text-navy-950 shadow-xs' : 'text-white/80 hover:bg-white/10'
            }`}
          >
            National Admin
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1">
          <Link
            to="/citizen"
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              location.pathname.startsWith('/citizen')
                ? 'bg-white/15 text-white'
                : 'text-white/80 hover:bg-white/10'
            }`}
          >
            Citizen Voice
          </Link>
          <Link
            to="/official"
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              location.pathname.startsWith('/official')
                ? 'bg-white/15 text-white'
                : 'text-white/80 hover:bg-white/10'
            }`}
          >
            Regional Dashboard
          </Link>
          <Link
            to="/admin"
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              location.pathname.startsWith('/admin')
                ? 'bg-white/15 text-white'
                : 'text-white/80 hover:bg-white/10'
            }`}
          >
            National Admin
          </Link>
        </nav>
      </div>
    </header>
  );
};
