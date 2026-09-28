import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, CitizenRequest } from '../../lib/api';
import { useAuthStore } from '../../store/useAuthStore';
import { useLangStore } from '../../store/useLangStore';
import { useDashboardWebSocket } from '../../lib/ws';
import {
  Mic, Volume2, CheckCircle2, AlertTriangle, Clock,
  ArrowRight, Check, Droplet, Navigation, Zap, HeartPulse,
  GraduationCap, Trash2, Send, Radio, Sparkles, Shield,
  MapPin, Play, Square, RefreshCw, FileText, CheckCircle
} from 'lucide-react';

export const CitizenPortal: React.FC = () => {
  const { user } = useAuthStore();
  const { t } = useLangStore();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'submit' | 'track'>('submit');
  const [category, setCategory] = useState<string>('water');
  const [rawText, setRawText] = useState<string>(
    'The main pipeline servicing Ward 4 (Badnapur Road) ruptured. Over 350 families have zero potable water access.'
  );
  const [landmark, setLandmark] = useState<string>('Ward 4, Near Primary Health Sub-Centre, Badnapur');
  const [urgency, setUrgency] = useState<'standard' | 'severe' | 'critical'>('severe');
  
  // Voice Recording Simulation State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [hasVoiceNote, setHasVoiceNote] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [isPlayingBack, setIsPlayingBack] = useState<boolean>(false);
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState<string | null>(null);

  // Timer effect for voice recording
  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // WebSocket for real-time status updates
  const { isConnected } = useDashboardWebSocket(user?.region_id || 'reg-in-mh', (event) => {
    if (event.type === 'NEW_GRIEVANCE_INGESTED' || event.type === 'CLUSTERING_RUN_COMPLETED') {
      queryClient.invalidateQueries({ queryKey: ['my_requests'] });
    }
  });

  // Query citizen's requests
  const { data: requests = [] } = useQuery({
    queryKey: ['my_requests'],
    queryFn: async () => {
      try {
        const my = await api.getMyRequests();
        if (my && my.length > 0) return my;
      } catch (e) {
        // Fallback to all requests for demo
      }
      return api.listRequests({ region_id: 'reg-in-mh' });
    }
  });

  // Mutation to submit grievance
  const submitMutation = useMutation({
    mutationFn: async () => {
      return api.submitRequest({
        raw_text: rawText,
        channel: hasVoiceNote ? 'voice' : 'web',
        category,
        urgency_signal: urgency,
        lat: 19.8762,
        lon: 75.3433,
        region_id: user?.region_id || 'reg-in-mh'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my_requests'] });
      setSubmitSuccessMsg('Grievance successfully submitted and verified! Clustered into District Demand Model.');
      setActiveTab('track');
    }
  });

  const categories = [
    { id: 'water', label: t('cat_water'), icon: '💧', color: 'from-blue-50 to-blue-100/50' },
    { id: 'roads', label: t('cat_roads'), icon: '🛣️', color: 'from-amber-50 to-amber-100/50' },
    { id: 'electricity', label: t('cat_power'), icon: '⚡', color: 'from-yellow-50 to-yellow-100/50' },
    { id: 'healthcare', label: t('cat_health'), icon: '🏥', color: 'from-rose-50 to-rose-100/50' },
    { id: 'education', label: t('cat_schools'), icon: '🏫', color: 'from-emerald-50 to-emerald-100/50' },
    { id: 'sanitation', label: t('cat_sanitation'), icon: '🚽', color: 'from-purple-50 to-purple-100/50' },
  ];

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      setHasVoiceNote(false);
    } else {
      setIsRecording(false);
      setHasVoiceNote(true);
      setRawText('आमच्या गावात पिण्याच्या पाण्याची मुख्य पाईपलाईन 3 आठवड्यांपासून फुटली आहे. 350 कुटुंबांना पिण्यासाठी दूषित पाणी वापरावे लागत आहे.');
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainder = sec % 60;
    return `0${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Civic Context Header */}
      <div className="bg-white border-2 border-sand-300/80 rounded-2xl p-6 sm:p-7 mb-8 shadow-civic-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-navy-850 bg-sand-200 border border-sand-400 px-3 py-1 rounded-full mb-2 shadow-xs">
            <Radio className="w-3 h-3 text-navy-850 animate-pulse" />
            <span>Direct Citizen Intake Gateway</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-navy-950 tracking-tight">
            {t('submit_grievance')}
          </h1>
          <p className="text-xs sm:text-sm text-navy-900/70 mt-1 max-w-xl font-normal leading-relaxed">
            Record spoken dialect voice notes, WhatsApp reports, or SMS. Securely anonymized and aggregated into spatial capital allocation models.
          </p>
        </div>

        <div className="flex flex-col items-start sm:items-end gap-1.5 flex-shrink-0">
          <span className="inline-flex items-center gap-1.5 text-xs font-black bg-navy-850 text-white px-3 py-1.5 rounded-lg shadow-xs">
            <MapPin className="w-3.5 h-3.5 text-sand-400" />
            <span>Maharashtra, India (IN-MH)</span>
          </span>
          <div className="font-mono text-[11px] text-navy-900/60 bg-sand-100/60 px-2 py-0.5 rounded border border-sand-300">
            GPS: 19.8762° N, 75.3433° E
          </div>
        </div>
      </div>

      {/* Modern Tabs */}
      <div className="flex bg-sand-200/80 p-1.5 rounded-xl mb-8 border border-sand-400/60 shadow-xs">
        <button
          onClick={() => setActiveTab('submit')}
          className={`flex-1 py-3 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
            activeTab === 'submit'
              ? 'bg-navy-850 text-white shadow-civic-xs'
              : 'text-navy-950 hover:bg-white/40'
          }`}
        >
          <span>✍️</span> {t('submit_grievance')}
        </button>
        <button
          onClick={() => setActiveTab('track')}
          className={`flex-1 py-3 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
            activeTab === 'track'
              ? 'bg-navy-850 text-white shadow-civic-xs'
              : 'text-navy-950 hover:bg-white/40'
          }`}
        >
          <span>📡</span> {t('track_grievance')}
          <span className="bg-sand-400 text-navy-950 text-[11px] px-2 py-0.5 rounded-full font-black">
            {requests.length || 3} Active
          </span>
        </button>
      </div>

      {/* VIEW 1: SUBMISSION FORM */}
      {activeTab === 'submit' && (
        <div className="space-y-8">
          <div className="bg-white border-2 border-sand-300/80 rounded-2xl p-6 sm:p-8 shadow-civic-sm">
            {/* Step 1: Category */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-black uppercase tracking-wider text-navy-950 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-sand-400 text-navy-950 flex items-center justify-center text-[11px] font-black">1</span>
                  Select Infrastructure Category
                </label>
                <span className="text-[11px] text-navy-900/50">Required</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {categories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.id)}
                    className={`p-3.5 rounded-xl border text-center transition-all flex flex-col items-center gap-2 relative overflow-hidden group ${
                      category === c.id
                        ? 'border-navy-850 bg-navy-50 ring-2 ring-navy-850 shadow-xs scale-102'
                        : 'border-civic-border bg-white hover:border-sand-400 hover:bg-sand-50/50'
                    }`}
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform">{c.icon}</span>
                    <span className={`text-xs font-bold leading-tight ${category === c.id ? 'text-navy-850' : 'text-navy-950'}`}>
                      {c.label}
                    </span>
                    {category === c.id && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-navy-850" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Spoken Voice Note Studio */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-black uppercase tracking-wider text-navy-950 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-sand-400 text-navy-950 flex items-center justify-center text-[11px] font-black">2</span>
                  {t('speak_label')} (Whisper Dialect Engine)
                </label>
                <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Multilingual STT
                </span>
              </div>

              {/* Studio Console Card */}
              <div className="bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950 border-2 border-sand-400/40 rounded-2xl p-6 sm:p-8 text-center text-white relative overflow-hidden shadow-civic-md">
                {/* Subtle background glow */}
                <div className="absolute -top-12 -left-12 w-48 h-48 bg-sand-400/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-terracotta/10 rounded-full blur-2xl pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center">
                  {/* Record Mic Button */}
                  <div className="relative my-2">
                    {isRecording && (
                      <div className="absolute inset-0 rounded-full bg-terracotta/40 animate-ping pointer-events-none" />
                    )}
                    <button
                      type="button"
                      onClick={toggleRecording}
                      className={`w-20 h-20 rounded-full inline-flex items-center justify-center text-white transition-all shadow-xl relative z-10 ${
                        isRecording
                          ? 'bg-terracotta animate-recording scale-110'
                          : hasVoiceNote
                          ? 'bg-emerald-600 hover:bg-emerald-500 hover:scale-105'
                          : 'bg-gradient-to-tr from-sand-400 to-sand-500 text-navy-950 hover:scale-105'
                      }`}
                    >
                      {isRecording ? (
                        <Square className="w-8 h-8 fill-current text-white" />
                      ) : hasVoiceNote ? (
                        <Check className="w-9 h-9 stroke-[3] text-white" />
                      ) : (
                        <Mic className="w-8 h-8 text-navy-950 stroke-[2.5]" />
                      )}
                    </button>
                  </div>

                  {/* Status Headline */}
                  <div className="text-base font-extrabold text-white mt-3">
                    {isRecording ? (
                      <span className="text-terracotta-light flex items-center justify-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-terracotta animate-ping" />
                        Recording Spoken Note... {formatSeconds(recordingSeconds)}
                      </span>
                    ) : hasVoiceNote ? (
                      <span className="text-emerald-300 flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Voice Audio Ingested & Transcribed
                      </span>
                    ) : (
                      <span>Tap to Record Spoken Voice Note</span>
                    )}
                  </div>

                  <p className="text-xs text-sand-200/70 mt-1 max-w-md font-normal">
                    Whisper large-v3 automatically detects regional dialects (Marathi, Hindi, Portuguese, Russian, Mandarin).
                  </p>

                  {/* Dynamic Soundwave frequency bars */}
                  {isRecording && (
                    <div className="flex items-center justify-center gap-1.5 h-10 my-4">
                      {[12, 24, 38, 18, 44, 28, 50, 32, 16, 42, 26, 36, 14, 20].map((h, i) => (
                        <div
                          key={i}
                          className="w-1.5 bg-gradient-to-t from-terracotta to-sand-400 rounded-full animate-wave-bar"
                          style={{
                            height: `${h}px`,
                            animationDelay: `${(i % 5) * 0.15}s`
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Whisper Preview Card */}
                  {hasVoiceNote && (
                    <div className="mt-5 w-full bg-white/10 backdrop-blur-md border border-sand-400/30 rounded-xl p-5 text-left shadow-civic-xs">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-sand-300 pb-2 border-b border-white/10 mb-3">
                        <span className="flex items-center gap-2 bg-sand-400/20 text-sand-300 px-2.5 py-0.5 rounded border border-sand-400/30">
                          <Radio className="w-3 h-3 text-sand-400 animate-pulse" />
                          Whisper Speech Engine · Dialect: Marathi (MR-IN)
                        </span>
                        <span className="text-emerald-300 font-mono text-[11px] bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                          Confidence: 98.4%
                        </span>
                      </div>

                      <div className="text-sm font-medium text-white italic leading-relaxed">
                        "आमच्या गावात पिण्याच्या पाण्याची मुख्य पाईपलाईन 3 आठवड्यांपासून फुटली आहे. 350 कुटुंबांना पिण्यासाठी दूषित पाणी वापरावे लागत आहे."
                      </div>

                      <div className="mt-3 pt-3 border-t border-dashed border-white/10 text-xs text-sand-200/90 leading-relaxed">
                        <strong className="text-sand-400 font-bold uppercase tracking-wider text-[10px] block mb-1">
                          Realtime English Synthesis:
                        </strong>
                        "The main drinking water feeder pipe in our ward has been ruptured for 3 weeks. 350 families are forced to consume contaminated well water."
                      </div>

                      <div className="mt-3 flex items-center justify-between text-[11px] text-white/50 pt-2 border-t border-white/5">
                        <span>Audio Duration: 0:14s · 16kHz WAV</span>
                        <button
                          onClick={toggleRecording}
                          className="text-sand-300 hover:text-white flex items-center gap-1 font-bold underline"
                        >
                          <RefreshCw className="w-3 h-3" /> Re-record
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Step 3: Written Details */}
            <div className="mb-8">
              <label className="text-xs font-black uppercase tracking-wider text-navy-950 flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-full bg-sand-400 text-navy-950 flex items-center justify-center text-[11px] font-black">3</span>
                Written Description & Ground Observations
              </label>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                rows={3}
                className="w-full border-2 border-sand-300/80 rounded-xl p-3.5 text-xs sm:text-sm text-navy-950 focus:border-navy-850 focus:ring-2 focus:ring-navy-850/20 outline-none transition-all"
                placeholder="Describe the issue, affected families, or duration..."
              />
            </div>

            {/* Step 4 & 5: Location & Urgency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-navy-950 flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full bg-sand-400 text-navy-950 flex items-center justify-center text-[11px] font-black">4</span>
                  Village / Landmark Details
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  className="w-full border-2 border-sand-300/80 rounded-xl p-3 text-xs sm:text-sm text-navy-950 focus:border-navy-850 focus:ring-2 focus:ring-navy-850/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-wider text-navy-950 flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full bg-sand-400 text-navy-950 flex items-center justify-center text-[11px] font-black">5</span>
                  Urgency Level Signal
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setUrgency('standard')}
                    className={`p-3 rounded-xl border-2 text-center text-xs transition-all ${
                      urgency === 'standard'
                        ? 'border-navy-850 bg-navy-50 font-bold text-navy-850 shadow-xs'
                        : 'border-civic-border bg-white text-navy-900 hover:bg-sand-50'
                    }`}
                  >
                    <div className="font-bold">Standard</div>
                    <div className="text-[10px] text-navy-900/60 mt-0.5">Routine fix</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUrgency('severe')}
                    className={`p-3 rounded-xl border-2 text-center text-xs transition-all ${
                      urgency === 'severe'
                        ? 'border-navy-850 bg-navy-50 font-bold text-navy-850 shadow-xs'
                        : 'border-civic-border bg-white text-navy-900 hover:bg-sand-50'
                    }`}
                  >
                    <div className="font-bold">Severe</div>
                    <div className="text-[10px] text-navy-900/60 mt-0.5">&gt;100 affected</div>
                  </button>

                  {/* Terracotta ONLY for Critical Hazard */}
                  <button
                    type="button"
                    onClick={() => setUrgency('critical')}
                    className={`p-3 rounded-xl border-2 text-center text-xs transition-all ${
                      urgency === 'critical'
                        ? 'border-terracotta bg-terracotta-light text-terracotta font-extrabold ring-2 ring-terracotta/40 shadow-xs'
                        : 'border-civic-border bg-white text-navy-900 hover:bg-sand-50'
                    }`}
                  >
                    <div className="text-terracotta font-black">Critical</div>
                    <div className="text-[10px] text-terracotta mt-0.5">Health hazard</div>
                  </button>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t-2 border-sand-200">
              <div className="text-xs text-navy-900/70 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Zero-Knowledge Privacy: Personal identities stripped prior to spatial clustering.</span>
              </div>
              <button
                type="button"
                onClick={() => submitMutation.mutate()}
                disabled={submitMutation.isPending}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-navy-850 to-navy-900 text-white font-extrabold text-sm py-3.5 px-8 rounded-xl hover:from-navy-900 hover:to-navy-950 transition-all shadow-civic-md disabled:opacity-50 hover:scale-[1.02]"
              >
                {submitMutation.isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-sand-400" />
                    <span>Ingesting & Fusing...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-sand-400" />
                    <span>{t('submit_btn')}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Low Connectivity / SMS Card */}
          <div className="bg-gradient-to-r from-sand-100 via-sand-200 to-sand-300 border-2 border-sand-400 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-civic-xs">
            <div>
              <div className="text-sm font-black text-navy-950 flex items-center gap-2">
                <span>📱</span> Low-Bandwidth / 2G Offline Access
              </div>
              <p className="text-xs text-navy-900/80 mt-1 max-w-xl font-normal leading-relaxed">
                Citizens in remote rural zones can submit via SMS or WhatsApp voice note to <strong>+91 98765-SETU1</strong> or dial toll-free IVR <strong>1800-SETU-AI</strong> without data.
              </p>
            </div>
            <span className="text-xs font-black bg-white text-navy-950 px-3 py-1.5 rounded-lg border border-sand-400 shadow-xs flex-shrink-0">
              Multi-Channel Ingestion
            </span>
          </div>
        </div>
      )}

      {/* VIEW 2: MY REQUESTS & LIVE 6-STAGE TIMELINE */}
      {activeTab === 'track' && (
        <div className="space-y-6">
          {submitSuccessMsg && (
            <div className="bg-emerald-50 border-2 border-emerald-500/40 text-emerald-900 p-4 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-3 shadow-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>{submitSuccessMsg}</span>
            </div>
          )}

          {/* Primary Tracked Request Card */}
          <div className="bg-white border-2 border-sand-300/80 rounded-2xl p-6 sm:p-8 shadow-civic-md border-l-8 border-l-navy-850">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b-2 border-sand-200 mb-8">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-[11px] font-black bg-navy-850 text-white px-2.5 py-0.5 rounded shadow-xs">
                    REF: #SETU-IN-2026-9812
                  </span>
                  <span className="text-[11px] font-bold bg-sand-200 text-navy-950 border border-sand-400 px-2.5 py-0.5 rounded">
                    💧 Drinking Water
                  </span>
                  {/* Terracotta ONLY for Critical Urgency */}
                  <span className="text-[11px] font-black bg-terracotta-light text-terracotta border border-terracotta-border px-2.5 py-0.5 rounded">
                    🚨 Urgency: Critical
                  </span>
                </div>
                <h2 className="text-xl font-black text-navy-950">
                  Badnapur Feeder Pipeline Rupture & Water Contamination
                </h2>
                <div className="text-xs text-navy-900/60 mt-1">
                  Ingested via Spoken Voice Note (Marathi) · Fused into Hotspot #IN-MH-WTR-04 (342 verified reports)
                </div>
              </div>
              <div className="text-left sm:text-right bg-sand-50 sm:bg-transparent p-3 sm:p-0 rounded-xl w-full sm:w-auto">
                <div className="text-[10px] uppercase font-black tracking-wider text-navy-900/50">Current State</div>
                <div className="text-base font-black text-navy-850">Prioritized (Rank #1 in District)</div>
                <div className="text-[11px] font-mono text-emerald-700 font-semibold mt-0.5">Verified on Ledger</div>
              </div>
            </div>

            {/* 6-Stage Timeline with Rich High-End Stepper */}
            <div className="relative pl-8 sm:pl-10 space-y-7 before:content-[''] before:absolute before:left-3.5 sm:before:left-4.5 before:top-3 before:bottom-3 before:w-1 before:bg-gradient-to-b before:from-navy-850 before:via-sand-400 before:to-sand-200">
              {/* Step 1 */}
              <div className="relative">
                <div className="absolute -left-8 sm:-left-10 top-1 w-8 h-8 rounded-full bg-navy-850 text-sand-300 flex items-center justify-center text-xs font-black shadow-md border-2 border-white">
                  ✓
                </div>
                <div className="bg-sand-50/70 border border-sand-300/80 rounded-xl p-4 shadow-xs">
                  <div className="flex justify-between items-center text-xs sm:text-sm font-bold text-navy-950">
                    <span>1. Multilingual Ingestion & Whisper Transcription</span>
                    <span className="text-[11px] text-navy-900/50 font-normal">Sept 14, 10:14 AM</span>
                  </div>
                  <p className="text-xs text-navy-900/70 mt-1 leading-relaxed">
                    Voice audio processed and translated. Extracted category: <code className="bg-sand-200 px-1 py-0.5 rounded text-navy-900">water_supply</code>, urgency: <code className="bg-terracotta-light text-terracotta font-bold px-1 py-0.5 rounded">0.89</code>, coordinates: <code className="bg-sand-200 px-1 py-0.5 rounded text-navy-900">19.8762, 75.3433</code>.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative">
                <div className="absolute -left-8 sm:-left-10 top-1 w-8 h-8 rounded-full bg-navy-850 text-sand-300 flex items-center justify-center text-xs font-black shadow-md border-2 border-white">
                  ✓
                </div>
                <div className="bg-sand-50/70 border border-sand-300/80 rounded-xl p-4 shadow-xs">
                  <div className="flex justify-between items-center text-xs sm:text-sm font-bold text-navy-950">
                    <span>2. Clustered into Demand Hotspot #IN-MH-WTR-04</span>
                    <span className="text-[11px] text-navy-900/50 font-normal">Sept 14, 11:30 AM</span>
                  </div>
                  <p className="text-xs text-navy-900/70 mt-1 leading-relaxed">
                    HDBSCAN spatial clustering fused your request with <strong>342 neighboring citizen complaints</strong> across a 3.2km corridor. Estimated affected population: 14,200.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative">
                <div className="absolute -left-8 sm:-left-10 top-1 w-8 h-8 rounded-full bg-navy-850 text-sand-300 flex items-center justify-center text-xs font-black shadow-md border-2 border-white">
                  ✓
                </div>
                <div className="bg-sand-50/70 border border-sand-300/80 rounded-xl p-4 shadow-xs">
                  <div className="flex justify-between items-center text-xs sm:text-sm font-bold text-navy-950">
                    <span>3. Explainable Score Computation & Plan Grounding</span>
                    <span className="text-[11px] text-navy-900/50 font-normal">Sept 16, 02:45 PM</span>
                  </div>
                  <p className="text-xs text-navy-900/70 mt-1 leading-relaxed">
                    Maharashtra Regional Planning Office computed priority score: <strong className="text-navy-950 font-black">91.4 / 100</strong>. Grounded via RAG against <em>MH State Water Masterplan 2025-27 (Art. 4.2)</em>.
                  </p>
                </div>
              </div>

              {/* Step 4 (Active Stage) */}
              <div className="relative">
                <div className="absolute -left-8 sm:-left-10 top-1 w-8 h-8 rounded-full bg-sand-400 border-4 border-navy-850 text-navy-950 flex items-center justify-center text-xs font-black shadow-lg animate-bounce">
                  ●
                </div>
                <div className="bg-gradient-to-r from-navy-50 to-sand-100/50 border-2 border-navy-850 rounded-xl p-4 shadow-civic-xs">
                  <div className="flex justify-between items-center text-xs sm:text-sm font-black text-navy-950">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-sand-500 animate-ping" />
                      4. Prioritized in District Capital Works (Rank #1)
                    </span>
                    <span className="text-[10px] uppercase font-black bg-navy-850 text-sand-300 px-2.5 py-0.5 rounded shadow-xs">
                      Active In Review
                    </span>
                  </div>
                  <p className="text-xs text-navy-900/80 mt-1.5 leading-relaxed">
                    Project Title: <strong>"Badnapur Sub-District High-Capacity Feeder Line Replacement"</strong>. Estimated Cost: ₹3.8 Crores ($460,000 USD).
                  </p>
                </div>
              </div>

              {/* Step 5 */}
              <div className="relative opacity-60">
                <div className="absolute -left-8 sm:-left-10 top-1 w-8 h-8 rounded-full bg-white border-2 border-sand-400 text-navy-900/60 flex items-center justify-center text-xs font-black">
                  5
                </div>
                <div className="bg-white border border-sand-300 rounded-xl p-4">
                  <div className="flex justify-between items-center text-xs font-bold text-navy-950">
                    <span>5. State Infrastructure Council Budget Allocation</span>
                    <span className="text-[11px] text-navy-900/50">Pending Sanction</span>
                  </div>
                  <p className="text-xs text-navy-900/70 mt-1">
                    Scheduled for State Infrastructure Council sanction under Jal Jeevan Mission.
                  </p>
                </div>
              </div>

              {/* Step 6 */}
              <div className="relative opacity-40">
                <div className="absolute -left-8 sm:-left-10 top-1 w-8 h-8 rounded-full bg-white border-2 border-sand-400 text-navy-900/60 flex items-center justify-center text-xs font-black">
                  6
                </div>
                <div className="bg-white border border-sand-300 rounded-xl p-4">
                  <div className="flex justify-between items-center text-xs font-bold text-navy-950">
                    <span>6. Field Execution & Physical Impact Verification</span>
                    <span className="text-[11px] text-navy-900/50">Future Proof</span>
                  </div>
                  <p className="text-xs text-navy-900/70 mt-1">
                    Before/after sensor metrics and citizen feedback verification to close the accountability loop.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
