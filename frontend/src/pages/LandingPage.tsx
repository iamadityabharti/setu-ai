import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLangStore } from '../store/useLangStore';
import { useAuthStore } from '../store/useAuthStore';
import { ArrowRight, Mic, Map, Scale, CheckCircle2, Shield, Layers } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { t, currentLang } = useLangStore();
  const { switchDemoRole } = useAuthStore();

  const quotes: Record<string, string> = {
    en: '"Our village well dried up 3 weeks ago; 450 families must walk 4km for drinking water."',
    hi: '"हमारे गांव का कुआं 3 हफ्ते पहले सूख गया; 450 परिवारों को पीने के पानी के लिए 4 किमी पैदल चलना पड़ता है।"',
    pt: '"Nosso posto de saúde está sem energia elétrica há 4 dias; vacinas essenciais foram perdidas."',
    ru: '"В нашей деревне пересох колодец 3 недели назад; сотни семей возят воду за километры."',
    zh: '"我们村的供水管网破损已达3周，450户村民不得不步行4公里取用日常饮用水。"'
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-sand-100/50 to-civic-bg pt-16 pb-20 px-6 border-b border-civic-border text-center">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(19,42,76,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(19,42,76,0.03)_1px,transparent_1px)] bg-[size:36px_36px] pointer-events-none" />

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 bg-white border border-sand-400 px-4 py-1.5 rounded-full text-xs font-bold text-navy-850 shadow-civic-xs mb-6">
            <span>🏛️</span>
            <span>Interoperable Digital Public Infrastructure for BRICS Nations</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-navy-950 leading-[1.15] tracking-tight mb-6">
            {t('landing_h1')}
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-navy-900/70 max-w-2xl mx-auto leading-relaxed mb-10">
            {t('landing_sub')}
          </p>

          {/* Multilingual Live Demo Banner */}
          <div className="max-w-2xl mx-auto bg-white border border-civic-border rounded-xl p-4 shadow-civic-xs flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
            <div>
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-navy-850">
                Multilingual NLU Synthesizer:
              </div>
              <div className="text-sm font-medium italic text-navy-950 mt-1">
                {quotes[currentLang] || quotes['en']}
              </div>
            </div>
            <div className="flex gap-1.5 flex-shrink-0">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-sand-200 text-navy-950 border border-sand-400">🇮🇳 IND</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-sand-200 text-navy-950 border border-sand-400">🇧🇷 BRA</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-sand-200 text-navy-950 border border-sand-400">🇷🇺 RUS</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-sand-200 text-navy-950 border border-sand-400">🇨🇳 CHN</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-sand-200 text-navy-950 border border-sand-400">🇿🇦 ZAF</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Persona Gateways */}
      <section className="max-w-7xl mx-auto px-6 -mt-8 relative z-20 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1. Citizen Portal */}
          <div className="bg-white border border-civic-border rounded-xl p-7 shadow-civic-sm hover:shadow-civic-md hover:-translate-y-1 transition-all border-t-4 border-t-sand-500 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-sand-200 text-navy-950 flex items-center justify-center text-2xl mb-4 font-bold shadow-xs">
                <Mic className="w-6 h-6 text-navy-850" />
              </div>
              <h2 className="text-xl font-bold text-navy-950 mb-2">
                {t('citizen_portal')}
              </h2>
              <div className="inline-block text-[11px] font-bold text-navy-850 bg-navy-50 px-2.5 py-1 rounded mb-3">
                Top Task: Voice/SMS submission & live tracking
              </div>
              <p className="text-xs text-navy-900/70 leading-relaxed mb-6">
                {t('citizen_desc')}
              </p>
            </div>
            <Link
              to="/citizen"
              onClick={() => switchDemoRole('citizen')}
              className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-sand-300 to-sand-400 text-navy-950 font-bold py-2.5 px-4 rounded-lg text-xs hover:from-sand-400 hover:to-sand-500 transition-all shadow-xs"
            >
              Launch Citizen Portal <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 2. Regional Official Command */}
          <div className="bg-white border border-civic-border rounded-xl p-7 shadow-civic-sm hover:shadow-civic-md hover:-translate-y-1 transition-all border-t-4 border-t-navy-700 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-navy-50 text-navy-850 flex items-center justify-center text-2xl mb-4 font-bold shadow-xs">
                <Map className="w-6 h-6 text-navy-850" />
              </div>
              <h2 className="text-xl font-bold text-navy-950 mb-2">
                {t('official_portal')}
              </h2>
              <div className="inline-block text-[11px] font-bold text-navy-850 bg-navy-50 px-2.5 py-1 rounded mb-3">
                Top Task: Hotspot triage & masterplan RAG check
              </div>
              <p className="text-xs text-navy-900/70 leading-relaxed mb-6">
                {t('official_desc')}
              </p>
            </div>
            <Link
              to="/official"
              onClick={() => switchDemoRole('official')}
              className="w-full inline-flex items-center justify-center gap-2 bg-navy-850 text-white font-bold py-2.5 px-4 rounded-lg text-xs hover:bg-navy-800 transition-all shadow-civic-xs"
            >
              Open Regional Command <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 3. National Admin */}
          <div className="bg-white border border-civic-border rounded-xl p-7 shadow-civic-sm hover:shadow-civic-md hover:-translate-y-1 transition-all border-t-4 border-t-navy-950 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-sand-100 text-navy-950 flex items-center justify-center text-2xl mb-4 font-bold shadow-xs">
                <Scale className="w-6 h-6 text-navy-850" />
              </div>
              <h2 className="text-xl font-bold text-navy-950 mb-2">
                {t('admin_portal')}
              </h2>
              <div className="inline-block text-[11px] font-bold text-navy-850 bg-navy-50 px-2.5 py-1 rounded mb-3">
                Top Task: Cross-region capital & impact verification
              </div>
              <p className="text-xs text-navy-900/70 leading-relaxed mb-6">
                {t('admin_desc')}
              </p>
            </div>
            <Link
              to="/admin"
              onClick={() => switchDemoRole('national_admin')}
              className="w-full inline-flex items-center justify-center gap-2 bg-white border border-civic-border text-navy-950 font-bold py-2.5 px-4 rounded-lg text-xs hover:bg-sand-100 transition-all shadow-xs"
            >
              Access National Commission <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Audited Metrics Ribbon */}
      <section className="bg-white border-y border-civic-border py-12 px-6 mt-16">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-navy-950 tracking-tight">148,240</div>
            <div className="text-xs font-bold uppercase text-navy-900/60 mt-1.5 tracking-wider">Citizen Reports Ingested</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-navy-950 tracking-tight">842</div>
            <div className="text-xs font-bold uppercase text-navy-900/60 mt-1.5 tracking-wider">AI Demand Hotspots</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-navy-950 tracking-tight">$2.4B</div>
            <div className="text-xs font-bold uppercase text-navy-900/60 mt-1.5 tracking-wider">Capital Directed</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-navy-950 tracking-tight">100%</div>
            <div className="text-xs font-bold uppercase text-navy-900/60 mt-1.5 tracking-wider">Explainable Audit Trail</div>
          </div>
        </div>
      </section>

      {/* Pillars Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-navy-950 mb-2">Digital Public Good Architecture</h2>
          <p className="text-xs text-navy-900/70">Engineered for low-bandwidth rural access, data sovereignty, and auditable algorithmic transparency.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-civic-border rounded-xl p-6 shadow-civic-xs">
            <div className="w-9 h-9 rounded-lg bg-sand-200 flex items-center justify-center font-bold text-navy-950 mb-3">1</div>
            <h3 className="font-bold text-sm text-navy-950 mb-1.5">Offline-Ready & Multimodal Ingestion</h3>
            <p className="text-xs text-navy-900/70 leading-relaxed">
              Whisper large-v3 processes spoken dialects. 2-way SMS and WhatsApp adapters support rural habitations without smartphones.
            </p>
          </div>

          <div className="bg-white border border-civic-border rounded-xl p-6 shadow-civic-xs">
            <div className="w-9 h-9 rounded-lg bg-navy-50 flex items-center justify-center font-bold text-navy-850 mb-3">2</div>
            <h3 className="font-bold text-sm text-navy-950 mb-1.5">HDBSCAN Spatial Clustering & Fusion</h3>
            <p className="text-xs text-navy-900/70 leading-relaxed">
              Clusters raw complaints into unified demand hotspots, fusing census demographic vulnerability and existing infrastructure deficits.
            </p>
          </div>

          <div className="bg-white border border-civic-border rounded-xl p-6 shadow-civic-xs">
            <div className="w-9 h-9 rounded-lg bg-sand-200 flex items-center justify-center font-bold text-navy-950 mb-3">3</div>
            <h3 className="font-bold text-sm text-navy-950 mb-1.5">Grounded Policy RAG Assistant</h3>
            <p className="text-xs text-navy-900/70 leading-relaxed">
              Retrieval-augmented semantic search indexes uploaded state masterplans, proving budget alignment with direct citations.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
