import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLangStore } from '../store/useLangStore';
import { useAuthStore } from '../store/useAuthStore';
import { 
  ArrowRight, Mic, Map, Scale, CheckCircle2, Shield, Layers, 
  Sparkles, Volume2, Database, Cpu, Globe2, BarChart3, Radio, FileCode2
} from 'lucide-react';

interface VoiceSample {
  country: string;
  flag: string;
  lang: string;
  nativeText: string;
  translatedText: string;
  category: string;
  urgency: 'critical' | 'high' | 'medium';
  location: string;
  duration: string;
}

export const LandingPage: React.FC = () => {
  const { t, currentLang } = useLangStore();
  const { switchDemoRole } = useAuthStore();
  const [activeVoiceIndex, setActiveVoiceIndex] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const voiceSamples: VoiceSample[] = [
    {
      country: 'India',
      flag: '🇮🇳',
      lang: 'हिन्दी (Hindi)',
      nativeText: 'हमारे गांव का मुख्य कुआं 3 हफ्ते पहले सूख गया; 450 परिवारों को पीने के पानी के लिए 4 किमी पैदल चलना पड़ता है।',
      translatedText: 'Our village main well dried up 3 weeks ago; 450 families must walk 4km for clean drinking water.',
      category: 'Water Security',
      urgency: 'critical',
      location: 'Kolhapur, Maharashtra',
      duration: '0:14s'
    },
    {
      country: 'Brazil',
      flag: '🇧🇷',
      lang: 'Português',
      nativeText: 'A ponte da rodovia BR-381 cedeu com as chuvas e isolou 3 mil moradores da zona rural de Betim.',
      translatedText: 'The highway bridge collapsed with heavy rains, isolating 3,000 rural residents in Betim.',
      category: 'Transportation',
      urgency: 'critical',
      location: 'Minas Gerais, Brazil',
      duration: '0:19s'
    },
    {
      country: 'South Africa',
      flag: '🇿🇦',
      lang: 'English / isiZulu',
      nativeText: 'The secondary clinic solar backup failed 5 days ago; pediatric vaccines and insulin are spoiling.',
      translatedText: 'The secondary clinic solar backup failed 5 days ago; pediatric vaccines and insulin are spoiling.',
      category: 'Healthcare & Energy',
      urgency: 'high',
      location: 'Gauteng Province, ZAF',
      duration: '0:12s'
    },
    {
      country: 'Russia',
      flag: '🇷🇺',
      lang: 'Русский',
      nativeText: 'Центральная котельная вышла из строя при -22°C; школа и поликлиника остаются без тепла.',
      translatedText: 'Central district heating boiler failed at -22°C; the primary school and clinic have no heating.',
      category: 'Thermal Energy',
      urgency: 'critical',
      location: 'Sverdlovsk Oblast, RUS',
      duration: '0:16s'
    },
    {
      country: 'China',
      flag: '🇨🇳',
      lang: '中文 (Mandarin)',
      nativeText: '川东山区灌溉渠渗漏坍塌，下游2000余亩梯田在插秧期严重缺水。',
      translatedText: 'Mountain irrigation canal suffered collapse; 2,000+ mu of terraced crops face severe drought during seeding.',
      category: 'Agriculture & Water',
      urgency: 'high',
      location: 'Sichuan Basin, CHN',
      duration: '0:17s'
    }
  ];

  const currentSample = voiceSamples[activeVoiceIndex];

  const toggleSimulateAudio = () => {
    setIsPlayingAudio(true);
    setTimeout(() => setIsPlayingAudio(false), 3200);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F4]">
      {/* Hero Section with Rich Ambient Background */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0E1D33] via-[#132A4C] to-[#193660] text-white pt-20 pb-28 px-4 sm:px-8 border-b-4 border-sand-400">
        {/* Subtle mesh background circles */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-sand-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[30rem] h-[30rem] bg-navy-600/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(232,220,196,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(232,220,196,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10 text-center">
          {/* Top DPG Badge */}
          <div className="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-sand-400/40 px-4 py-1.5 rounded-full text-xs font-bold text-sand-200 shadow-civic-xs mb-8">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sand-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sand-400"></span>
            </span>
            <span className="tracking-wide">Digital Public Infrastructure · Certified DPG Standard · BRICS Aligned</span>
          </div>

          {/* Headline */}
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.12] mb-6">
            Citizen Voices <span className="text-sand-400 italic">Bridged</span> to National Infrastructure
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-sand-100/90 max-w-3xl mx-auto leading-relaxed font-normal mb-10">
            {t('landing_sub')}
          </p>

          {/* Quick CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-14">
            <Link
              to="/citizen"
              onClick={() => switchDemoRole('citizen')}
              className="inline-flex items-center gap-2.5 bg-gradient-to-r from-sand-300 via-sand-400 to-sand-500 text-navy-950 font-extrabold px-6 py-3.5 rounded-xl text-sm shadow-civic-md hover:scale-[1.02] hover:shadow-lg transition-all"
            >
              <Mic className="w-4 h-4 text-navy-950" />
              <span>Record Citizen Voice</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/official"
              onClick={() => switchDemoRole('official')}
              className="inline-flex items-center gap-2.5 bg-navy-950/80 hover:bg-navy-950 text-white font-bold px-6 py-3.5 rounded-xl text-sm border border-sand-400/30 backdrop-blur-md hover:border-sand-400 transition-all shadow-civic-xs"
            >
              <Map className="w-4 h-4 text-sand-400" />
              <span>Launch Command Cockpit</span>
            </Link>

            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-sand-200 text-xs font-semibold px-4 py-3 rounded-xl border border-white/10 transition-all"
            >
              <FileCode2 className="w-4 h-4 text-sand-400" />
              <span>OpenAPI v1</span>
            </a>
          </div>

          {/* Interactive Multilingual Voice Synthesizer Console */}
          <div className="bg-navy-950/90 border border-sand-400/30 rounded-2xl p-5 sm:p-6 backdrop-blur-xl shadow-2xl text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sand-400/20 text-sand-400 flex items-center justify-center font-bold">
                  <Radio className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <div className="text-xs font-black uppercase tracking-wider text-sand-300">
                    Live Multilingual Voice Synthesizer
                  </div>
                  <div className="text-[11px] text-white/60">
                    Whisper large-v3 · Real-time Dialect Detection & Translation
                  </div>
                </div>
              </div>

              {/* Language Selector Pills */}
              <div className="flex flex-wrap gap-1.5">
                {voiceSamples.map((sample, idx) => (
                  <button
                    key={sample.country}
                    onClick={() => setActiveVoiceIndex(idx)}
                    className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                      activeVoiceIndex === idx
                        ? 'bg-sand-400 text-navy-950 shadow-sm scale-105'
                        : 'bg-white/5 text-sand-200 hover:bg-white/10 border border-white/5'
                    }`}
                  >
                    <span>{sample.flag}</span>
                    <span>{sample.country}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Synthesizer Content Box */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              {/* Native Voice Transcript */}
              <div className="md:col-span-5 bg-navy-900/80 rounded-xl p-4 border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-sand-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-sand-400 animate-ping" />
                    Spoken Voice Input ({currentSample.lang})
                  </span>
                  <button
                    onClick={toggleSimulateAudio}
                    className="flex items-center gap-1 text-[11px] font-bold bg-sand-400/20 hover:bg-sand-400/30 text-sand-300 px-2 py-0.5 rounded transition-all"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>{isPlayingAudio ? 'Streaming...' : 'Simulate Audio'}</span>
                  </button>
                </div>
                <p className="text-sm font-medium text-white italic leading-relaxed min-h-[52px]">
                  "{currentSample.nativeText}"
                </p>
                <div className="mt-3 flex items-center justify-between text-[11px] text-sand-300/80 border-t border-white/5 pt-2">
                  <span>📍 {currentSample.location}</span>
                  <span>⏱ {currentSample.duration}</span>
                </div>
              </div>

              {/* Pipeline Arrow / Audio Frequency Bars */}
              <div className="md:col-span-2 flex flex-col items-center justify-center gap-2 py-1">
                <div className="flex items-center gap-1 h-8">
                  <span className={`w-1 bg-sand-400 rounded-full ${isPlayingAudio ? 'animate-wave-bar' : 'h-3 opacity-40'}`} />
                  <span className={`w-1 bg-sand-400 rounded-full ${isPlayingAudio ? 'animate-wave-bar-tall' : 'h-5 opacity-70'}`} />
                  <span className={`w-1 bg-terracotta rounded-full ${isPlayingAudio ? 'animate-wave-bar' : 'h-7 opacity-90'}`} />
                  <span className={`w-1 bg-sand-400 rounded-full ${isPlayingAudio ? 'animate-wave-bar-tall' : 'h-4 opacity-60'}`} />
                  <span className={`w-1 bg-sand-400 rounded-full ${isPlayingAudio ? 'animate-wave-bar' : 'h-2 opacity-30'}`} />
                </div>
                <div className="text-[10px] font-black text-sand-400/90 tracking-widest uppercase text-center">
                  AI Translation
                </div>
              </div>

              {/* Fused NLU Output */}
              <div className="md:col-span-5 bg-navy-900/80 rounded-xl p-4 border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    English Translation & NLU Entities
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                    98.6% Conf
                  </span>
                </div>
                <p className="text-sm font-medium text-sand-100 leading-relaxed min-h-[52px]">
                  "{currentSample.translatedText}"
                </p>
                <div className="mt-3 flex items-center gap-2 border-t border-white/5 pt-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-navy-800 text-sand-200 border border-white/10">
                    📂 {currentSample.category}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-terracotta text-white border border-terracotta-border">
                    🚨 {currentSample.urgency.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Main Persona Gateways */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 -mt-12 relative z-20 w-full mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1. Citizen Portal */}
          <div className="bg-white border-2 border-sand-300/80 rounded-2xl p-7 shadow-civic-md hover:shadow-civic-lg hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-sand-100 to-sand-300 text-navy-950 flex items-center justify-center text-2xl mb-5 font-black shadow-xs group-hover:scale-105 transition-transform">
                <Mic className="w-6 h-6 text-navy-850" />
              </div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-navy-950">
                  {t('citizen_portal')}
                </h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-sand-200 text-navy-950">
                  Low Bandwidth
                </span>
              </div>
              <div className="text-xs font-semibold text-sand-700 bg-sand-50 border border-sand-200 px-3 py-1.5 rounded-lg mb-4">
                Voice recording, WhatsApp, SMS & live tracking
              </div>
              <p className="text-xs text-navy-900/70 leading-relaxed mb-6 font-normal">
                {t('citizen_desc')}
              </p>
            </div>
            <Link
              to="/citizen"
              onClick={() => switchDemoRole('citizen')}
              className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-sand-300 to-sand-400 text-navy-950 font-extrabold py-3 px-4 rounded-xl text-xs hover:from-sand-400 hover:to-sand-500 transition-all shadow-xs group-hover:shadow"
            >
              <span>Submit Report & Track</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* 2. Regional Official Command */}
          <div className="bg-white border-2 border-navy-800/40 rounded-2xl p-7 shadow-civic-md hover:shadow-civic-lg hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-navy-100 to-navy-200 text-navy-950 flex items-center justify-center text-2xl mb-5 font-black shadow-xs group-hover:scale-105 transition-transform">
                <Map className="w-6 h-6 text-navy-850" />
              </div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-navy-950">
                  {t('official_portal')}
                </h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-navy-850 text-white">
                  Live Hotspots
                </span>
              </div>
              <div className="text-xs font-semibold text-navy-700 bg-navy-50 border border-navy-200 px-3 py-1.5 rounded-lg mb-4">
                Spatial clustering, 5-factor scoring & Policy RAG
              </div>
              <p className="text-xs text-navy-900/70 leading-relaxed mb-6 font-normal">
                {t('official_desc')}
              </p>
            </div>
            <Link
              to="/official"
              onClick={() => switchDemoRole('official')}
              className="w-full inline-flex items-center justify-center gap-2 bg-navy-850 text-white font-extrabold py-3 px-4 rounded-xl text-xs hover:bg-navy-900 transition-all shadow-civic-xs group-hover:shadow"
            >
              <span>Open Regional Cockpit</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* 3. National Admin */}
          <div className="bg-white border-2 border-sand-400/50 rounded-2xl p-7 shadow-civic-md hover:shadow-civic-lg hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-sand-200 via-sand-300 to-sand-400 text-navy-950 flex items-center justify-center text-2xl mb-5 font-black shadow-xs group-hover:scale-105 transition-transform">
                <Scale className="w-6 h-6 text-navy-850" />
              </div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-navy-950">
                  {t('admin_portal')}
                </h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-sand-300 text-navy-950">
                  National Scope
                </span>
              </div>
              <div className="text-xs font-semibold text-sand-800 bg-sand-100/60 border border-sand-300 px-3 py-1.5 rounded-lg mb-4">
                BRICS cross-state capital & before/after audits
              </div>
              <p className="text-xs text-navy-900/70 leading-relaxed mb-6 font-normal">
                {t('admin_desc')}
              </p>
            </div>
            <Link
              to="/admin"
              onClick={() => switchDemoRole('national_admin')}
              className="w-full inline-flex items-center justify-center gap-2 bg-white border-2 border-navy-850 text-navy-950 font-extrabold py-3 px-4 rounded-xl text-xs hover:bg-navy-50 transition-all shadow-xs group-hover:shadow"
            >
              <span>Enter National Commission</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Audited Metrics Ribbon */}
      <section className="bg-white border-y border-civic-border py-12 px-6 shadow-civic-xs">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="p-4 rounded-xl hover:bg-sand-50/50 transition-colors">
            <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy-950 tracking-tight">148,240</div>
            <div className="text-xs font-black uppercase text-navy-900/60 mt-2 tracking-wider">Citizen Reports Ingested</div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1">↑ +14.2% this month</div>
          </div>
          <div className="p-4 rounded-xl hover:bg-sand-50/50 transition-colors">
            <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy-950 tracking-tight">842</div>
            <div className="text-xs font-black uppercase text-navy-900/60 mt-2 tracking-wider">AI Demand Hotspots</div>
            <div className="text-[11px] text-navy-700 font-semibold mt-1">HDBSCAN clustered</div>
          </div>
          <div className="p-4 rounded-xl hover:bg-sand-50/50 transition-colors">
            <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy-950 tracking-tight">$2.4B</div>
            <div className="text-xs font-black uppercase text-navy-900/60 mt-2 tracking-wider">Capital Directed</div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1">Across 3 BRICS pilot states</div>
          </div>
          <div className="p-4 rounded-xl hover:bg-sand-50/50 transition-colors">
            <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy-950 tracking-tight">100%</div>
            <div className="text-xs font-black uppercase text-navy-900/60 mt-2 tracking-wider">Explainable Audit Trail</div>
            <div className="text-[11px] text-navy-700 font-semibold mt-1">Zero black-box decisions</div>
          </div>
        </div>
      </section>

      {/* 4-Stage Architectural Pipeline */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 bg-sand-200 border border-sand-400 text-navy-950 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mb-3">
            <Cpu className="w-3.5 h-3.5" /> End-to-End Pipeline
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-navy-950 tracking-tight">
            How Citizen Voices Become Concrete Projects
          </h2>
          <p className="text-xs sm:text-sm text-navy-900/70 mt-3 leading-relaxed">
            From spoken dialect in a rural panchayat to funded state capital projects — mathematically verifiable at every step.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="bg-white border border-civic-border rounded-2xl p-6 shadow-civic-sm relative overflow-hidden group hover:border-sand-400 transition-all">
            <div className="text-5xl font-black text-sand-200/80 absolute -top-1 -right-1 font-mono select-none">
              01
            </div>
            <div className="w-10 h-10 rounded-xl bg-sand-100 text-navy-950 flex items-center justify-center font-bold mb-4">
              <Mic className="w-5 h-5 text-navy-850" />
            </div>
            <h3 className="font-extrabold text-base text-navy-950 mb-2">Multimodal Ingestion</h3>
            <p className="text-xs text-navy-900/70 leading-relaxed mb-4">
              Ingests Hindi, Marathi, Portuguese, Russian, and Chinese voice, SMS, or WhatsApp. Whisper large-v3 automatically extracts transcripts.
            </p>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sand-100 text-navy-950 border border-sand-300">
              Low-bandwidth ready
            </span>
          </div>

          {/* Step 2 */}
          <div className="bg-white border border-civic-border rounded-2xl p-6 shadow-civic-sm relative overflow-hidden group hover:border-sand-400 transition-all">
            <div className="text-5xl font-black text-sand-200/80 absolute -top-1 -right-1 font-mono select-none">
              02
            </div>
            <div className="w-10 h-10 rounded-xl bg-sand-100 text-navy-950 flex items-center justify-center font-bold mb-4">
              <Layers className="w-5 h-5 text-navy-850" />
            </div>
            <h3 className="font-extrabold text-base text-navy-950 mb-2">Spatial Hotspot Fusion</h3>
            <p className="text-xs text-navy-900/70 leading-relaxed mb-4">
              HDBSCAN clusters requests within a 5km radius into unified demand hotspots, fusing census demographic vulnerability and infrastructure index.
            </p>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sand-100 text-navy-950 border border-sand-300">
              Haversine metric
            </span>
          </div>

          {/* Step 3 */}
          <div className="bg-white border border-civic-border rounded-2xl p-6 shadow-civic-sm relative overflow-hidden group hover:border-sand-400 transition-all">
            <div className="text-5xl font-black text-sand-200/80 absolute -top-1 -right-1 font-mono select-none">
              03
            </div>
            <div className="w-10 h-10 rounded-xl bg-sand-100 text-navy-950 flex items-center justify-center font-bold mb-4">
              <Scale className="w-5 h-5 text-navy-850" />
            </div>
            <h3 className="font-extrabold text-base text-navy-950 mb-2">100% Explainable Score</h3>
            <p className="text-xs text-navy-900/70 leading-relaxed mb-4">
              Projects ranked via published weights: 35% Demand + 20% Urgency + 20% Vulnerability + 15% Deficit + 10% Budget Alignment.
            </p>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sand-100 text-navy-950 border border-sand-300">
              Mathematical parity
            </span>
          </div>

          {/* Step 4 */}
          <div className="bg-white border border-civic-border rounded-2xl p-6 shadow-civic-sm relative overflow-hidden group hover:border-sand-400 transition-all">
            <div className="text-5xl font-black text-sand-200/80 absolute -top-1 -right-1 font-mono select-none">
              04
            </div>
            <div className="w-10 h-10 rounded-xl bg-sand-100 text-navy-950 flex items-center justify-center font-bold mb-4">
              <CheckCircle2 className="w-5 h-5 text-navy-850" />
            </div>
            <h3 className="font-extrabold text-base text-navy-950 mb-2">Physical Impact Audits</h3>
            <p className="text-xs text-navy-900/70 leading-relaxed mb-4">
              Tracks project execution from tender to ground completion with satellite/ground imagery and citizen satisfaction before/after delta.
            </p>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sand-100 text-navy-950 border border-sand-300">
              Verifiable proof
            </span>
          </div>
        </div>
      </section>

      {/* Open Source & DPG Certification Strip */}
      <section className="bg-navy-950 text-white py-12 px-6 border-t border-sand-400/20">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-sand-400/20 text-sand-400 flex items-center justify-center font-bold text-2xl flex-shrink-0">
              🏛️
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Digital Public Goods Standard Compliant</h4>
              <p className="text-xs text-sand-200/70 mt-0.5">
                Open source under MIT license. Compliant with UNICEF DPG standard for public infrastructure transparency.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="http://localhost:8000/api/v1/hotspots/public/hotspots"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-sand-400 text-navy-950 font-bold px-4 py-2.5 rounded-lg text-xs hover:bg-sand-300 transition-all shadow-sm"
            >
              <Database className="w-3.5 h-3.5" />
              <span>GeoJSON Open Data Feed</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
