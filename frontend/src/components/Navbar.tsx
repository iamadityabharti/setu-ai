import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useLangStore, LanguageCode } from '../store/useLangStore';
import { Globe, Shield, Sparkles, User as UserIcon, Activity } from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { user, switchDemoRole } = useAuthStore();
  const { currentLang, setLanguage, t } = useLangStore();

  const langOptions = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
    { code: 'pt', label: 'Português', flag: '🇧🇷' },
    { code: 'ru', label: 'Русский', flag: '🇷🇺' },
    { code: 'zh', label: '中文', flag: '🇨🇳' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-navy-950/95 backdrop-blur-xl text-white border-b border-sand-400/20 shadow-civic-md h-[72px] px-4 sm:px-8 flex items-center justify-between transition-all">
      {/* Brand */}
      <div className="flex items-center gap-3.5">
        <Link to="/" className="flex items-center gap-3.5 group">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sand-300 via-sand-400 to-sand-600 text-navy-950 font-black flex items-center justify-center text-xl shadow-md group-hover:scale-105 group-hover:rotate-1 transition-all duration-300 border border-white/20">
              से
            </div>
            <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-navy-950 animate-pulse" title="System Live" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-sand-400 text-navy-950 text-[10px] font-black px-1.5 py-0.5 rounded tracking-widest uppercase shadow-xs">
                SETU AI
              </span>
              <span className="text-lg font-black tracking-tight text-white group-hover:text-sand-300 transition-colors">
                सेतु <span className="text-sand-400/80 font-light">·</span> {t('brand_sub')}
              </span>
            </div>
            <div className="text-[11px] text-sand-200/70 font-medium hidden sm:block">
              Digital Public Good for BRICS Infrastructure
            </div>
          </div>
        </Link>
      </div>

      {/* Nav Actions */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Live WebSocket / Stream Pill */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-[11px] font-semibold text-emerald-300">
          <Activity className="w-3 h-3 animate-pulse text-emerald-400" />
          <span>Realtime Engine Active</span>
        </div>

        {/* Language Selector */}
        <div className="relative flex items-center gap-1.5 bg-white/8 hover:bg-white/12 border border-sand-400/25 rounded-lg px-2.5 py-1.5 text-xs text-white transition-all">
          <Globe className="w-3.5 h-3.5 text-sand-400" />
          <select
            value={currentLang}
            onChange={(e) => setLanguage(e.target.value as LanguageCode)}
            className="bg-transparent text-white font-medium outline-none cursor-pointer text-xs pr-1"
          >
            {langOptions.map((opt) => (
              <option key={opt.code} value={opt.code} className="bg-navy-950 text-white py-1">
                {opt.flag} {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Role Switcher for Evaluators / Demo */}
        <div className="hidden lg:flex items-center gap-1 text-xs bg-white/5 border border-white/10 rounded-lg p-1">
          <span className="text-sand-300/80 text-[11px] px-2 flex items-center gap-1 font-semibold">
            <UserIcon className="w-3 h-3 text-sand-400" /> Persona:
          </span>
          <button
            onClick={() => switchDemoRole('citizen')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
              user?.role === 'citizen'
                ? 'bg-gradient-to-r from-sand-400 to-sand-500 text-navy-950 shadow-sm'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            Citizen
          </button>
          <button
            onClick={() => switchDemoRole('official')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
              user?.role === 'official'
                ? 'bg-gradient-to-r from-sand-400 to-sand-500 text-navy-950 shadow-sm'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            Official
          </button>
          <button
            onClick={() => switchDemoRole('national_admin')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
              user?.role === 'national_admin'
                ? 'bg-gradient-to-r from-sand-400 to-sand-500 text-navy-950 shadow-sm'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            National Admin
          </button>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10">
          <Link
            to="/citizen"
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all relative ${
              location.pathname.startsWith('/citizen')
                ? 'bg-sand-400 text-navy-950 font-bold shadow-xs'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            Citizen Voice
          </Link>
          <Link
            to="/official"
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all relative ${
              location.pathname.startsWith('/official')
                ? 'bg-sand-400 text-navy-950 font-bold shadow-xs'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            Command Cockpit
          </Link>
          <Link
            to="/admin"
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all relative ${
              location.pathname.startsWith('/admin')
                ? 'bg-sand-400 text-navy-950 font-bold shadow-xs'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            Commission
          </Link>
        </nav>
      </div>
    </header>
  );
};
