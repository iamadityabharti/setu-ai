import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, CitizenRequest } from '../../lib/api';
import { useAuthStore } from '../../store/useAuthStore';
import { useLangStore } from '../../store/useLangStore';
import { useDashboardWebSocket } from '../../lib/ws';
import {
  Mic, Volume2, CheckCircle2, AlertTriangle, Clock,
  ArrowRight, Check, Droplet, Navigation, Zap, HeartPulse,
  GraduationCap, Trash2, Send
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
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState<string | null>(null);

  // WebSocket for real-time status updates
  const { isConnected } = useDashboardWebSocket(user?.region_id || 'reg-in-mh', (event) => {
    if (event.type === 'NEW_GRIEVANCE_INGESTED' || event.type === 'CLUSTERING_RUN_COMPLETED') {
      queryClient.invalidateQueries({ queryKey: ['my_requests'] });
    }
  });

  // Query citizen's requests
  const { data: requests = [], isLoading: isLoadingRequests } = useQuery({
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
    { id: 'water', label: t('cat_water'), icon: '💧' },
    { id: 'roads', label: t('cat_roads'), icon: '🛣️' },
    { id: 'electricity', label: t('cat_power'), icon: '⚡' },
    { id: 'healthcare', label: t('cat_health'), icon: '🏥' },
    { id: 'education', label: t('cat_schools'), icon: '🏫' },
    { id: 'sanitation', label: t('cat_sanitation'), icon: '🚽' },
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

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Civic Context Header */}
      <div className="bg-gradient-to-r from-white to-sand-100/60 border border-civic-border rounded-xl p-6 mb-7 shadow-civic-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-navy-850 bg-navy-50 border border-navy-200 px-2.5 py-0.5 rounded-full mb-1.5">
            🏛️ Direct Civic Intake Channel
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-navy-950">
            {t('submit_grievance')}
          </h1>
          <p className="text-xs text-navy-900/70 mt-1 max-w-lg">
            Spoken voice note, WhatsApp, SMS, or typed report. Anonymized and aggregated into capital planning models.
          </p>
        </div>
        <div className="text-right">
          <span className="inline-block text-[11px] font-bold bg-sand-200 border border-sand-400 text-navy-950 px-2.5 py-1 rounded">
            Maharashtra, India (IN-MH)
          </span>
          <div className="font-mono text-[10.5px] text-navy-900/60 mt-1">
            GPS: 19.8762° N, 75.3433° E
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#EAE6DE] p-1 rounded-xl mb-7 border border-civic-border">
        <button
          onClick={() => setActiveTab('submit')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
            activeTab === 'submit'
              ? 'bg-white text-navy-850 shadow-civic-xs'
              : 'text-navy-900/70 hover:text-navy-950'
          }`}
        >
          ✏️ {t('submit_grievance')}
        </button>
        <button
          onClick={() => setActiveTab('track')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
            activeTab === 'track'
              ? 'bg-white text-navy-850 shadow-civic-xs'
              : 'text-navy-900/70 hover:text-navy-950'
          }`}
        >
          📋 {t('track_grievance')}
          <span className="bg-navy-850 text-white text-[10px] px-2 py-0.2 rounded-full font-bold">
            {requests.length || 3}
          </span>
        </button>
      </div>

      {/* VIEW 1: SUBMISSION FORM */}
      {activeTab === 'submit' && (
        <div>
          <div className="bg-white border border-civic-border rounded-xl p-6 sm:p-8 shadow-civic-xs">
            {/* Step 1: Category */}
            <div className="mb-6">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-navy-950 mb-2.5">
                1. Select Public Infrastructure Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                {categories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.id)}
                    className={`p-3 rounded-lg border text-center transition-all flex flex-col items-center gap-1.5 ${
                      category === c.id
                        ? 'border-navy-850 bg-navy-50 ring-1 ring-navy-850 shadow-xs'
                        : 'border-civic-border bg-white hover:bg-sand-50'
                    }`}
                  >
                    <span className="text-xl">{c.icon}</span>
                    <span className={`text-xs font-semibold ${category === c.id ? 'text-navy-850 font-bold' : 'text-navy-950'}`}>
                      {c.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Spoken Voice Note Studio */}
            <div className="mb-6">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-navy-950 mb-2.5">
                2. {t('speak_label')}
              </label>

              <div className="bg-gradient-to-b from-white to-sand-50 border-2 border-dashed border-sand-400 rounded-xl p-6 text-center">
                <button
                  type="button"
                  onClick={toggleRecording}
                  className={`w-16 h-16 rounded-full inline-flex items-center justify-center text-white text-2xl transition-all shadow-civic-md ${
                    isRecording
                      ? 'bg-terracotta animate-recording'
                      : 'bg-navy-850 hover:bg-navy-800 hover:scale-105'
                  }`}
                >
                  <Mic className="w-7 h-7" />
                </button>

                <div className="text-sm font-bold text-navy-950 mt-3">
                  {isRecording ? t('recording_active') : (hasVoiceNote ? t('recorded_done') : t('tap_to_speak'))}
                </div>
                <div className="text-xs text-navy-900/60 mt-0.5">
                  Whisper large-v3 automatically detects language (Marathi / Hindi / English / Portuguese)
                </div>

                {/* Animated soundbars */}
                {isRecording && (
                  <div className="flex items-center justify-center gap-1 h-8 my-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((bar) => (
                      <div
                        key={bar}
                        className="w-1 bg-navy-850 rounded-full animate-wave-bar"
                        style={{ animationDelay: `${bar * 0.1}s` }}
                      />
                    ))}
                  </div>
                )}

                {/* Whisper Preview Card */}
                {hasVoiceNote && (
                  <div className="mt-4 bg-white border border-civic-border rounded-lg p-4 text-left shadow-xs">
                    <div className="flex items-center justify-between text-[11px] font-bold text-navy-850 mb-1.5">
                      <span className="bg-navy-50 text-navy-850 px-2 py-0.5 rounded border border-navy-200">
                        Whisper Multilingual AI · Marathi Dialect
                      </span>
                      <span className="text-civic-emerald font-extrabold">Confidence: 98.4%</span>
                    </div>
                    <p className="text-xs font-semibold text-navy-950 mt-1">
                      "आमच्या गावात पिण्याच्या पाण्याची मुख्य पाईपलाईन 3 आठवड्यांपासून फुटली आहे. 350 कुटुंबांना पिण्यासाठी दूषित पाणी वापरावे लागत आहे."
                    </p>
                    <div className="mt-2 pt-2 border-t border-dashed border-civic-border text-xs text-navy-900/70 italic">
                      English Translation: "The main drinking water feeder pipe in our ward has been ruptured for 3 weeks. 350 families are forced to consume contaminated well water."
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Step 3: Description */}
            <div className="mb-6">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-navy-950 mb-1.5">
                3. Written Description / Details
              </label>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                rows={3}
                className="w-full border border-civic-border rounded-lg p-3 text-xs text-navy-950 focus:border-navy-850 focus:ring-1 focus:ring-navy-850 outline-none"
                placeholder="Describe the issue, affected families, or duration..."
              />
            </div>

            {/* Step 4: Location & Urgency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-navy-950 mb-1.5">
                  4. Village / Street Landmark
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  className="w-full border border-civic-border rounded-lg p-2.5 text-xs text-navy-950 focus:border-navy-850 focus:ring-1 focus:ring-navy-850 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-navy-950 mb-1.5">
                  5. Urgency Signal
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setUrgency('standard')}
                    className={`p-2.5 rounded-lg border text-center text-xs transition-all ${
                      urgency === 'standard' ? 'border-navy-850 bg-navy-50 font-bold text-navy-850' : 'border-civic-border bg-white text-navy-950'
                    }`}
                  >
                    <div>Standard</div>
                    <div className="text-[10px] text-navy-900/50">Routine fix</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUrgency('severe')}
                    className={`p-2.5 rounded-lg border text-center text-xs transition-all ${
                      urgency === 'severe' ? 'border-navy-850 bg-navy-50 font-bold text-navy-850' : 'border-civic-border bg-white text-navy-950'
                    }`}
                  >
                    <div>Severe</div>
                    <div className="text-[10px] text-navy-900/50">&gt;100 affected</div>
                  </button>

                  {/* Terracotta ONLY for Critical Hazard */}
                  <button
                    type="button"
                    onClick={() => setUrgency('critical')}
                    className={`p-2.5 rounded-lg border text-center text-xs transition-all ${
                      urgency === 'critical' ? 'border-terracotta bg-terracotta-light text-terracotta font-extrabold ring-1 ring-terracotta' : 'border-civic-border bg-white text-navy-950'
                    }`}
                  >
                    <div className="text-terracotta">Critical Hazard</div>
                    <div className="text-[10px] text-terracotta">Health outbreak</div>
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-civic-border">
              <div className="text-xs text-navy-900/60">
                🔒 Privacy Guarantee: Identity anonymized before spatial clustering.
              </div>
              <button
                type="button"
                onClick={() => submitMutation.mutate()}
                disabled={submitMutation.isPending}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-navy-850 text-white font-bold text-xs py-3 px-6 rounded-lg hover:bg-navy-800 transition-all shadow-civic-xs disabled:opacity-50"
              >
                {submitMutation.isPending ? 'Ingesting & Clustering...' : t('submit_btn')}
              </button>
            </div>
          </div>

          {/* SMS / Low-Bandwidth Banner */}
          <div className="bg-gradient-to-r from-sand-100 to-sand-200 border border-sand-400 rounded-xl p-5 mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <div className="text-xs font-bold text-navy-950">Low-Connectivity / Offline Civic Access</div>
              <p className="text-xs text-navy-900/70 mt-0.5">
                No smartphone required. Send an SMS or WhatsApp voice note to <strong>+91 98765-SETU1</strong> or dial toll-free <strong>1800-SETU-AI</strong>.
              </p>
            </div>
            <span className="text-[11px] font-bold bg-white text-navy-950 px-2.5 py-1 rounded border border-sand-400 flex-shrink-0">
              Multi-Channel Ingestion
            </span>
          </div>
        </div>
      )}

      {/* VIEW 2: MY REQUESTS & LIVE TIMELINE */}
      {activeTab === 'track' && (
        <div className="space-y-6">
          {submitSuccessMsg && (
            <div className="bg-civic-emerald/10 border border-civic-emerald/30 text-civic-emerald p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              {submitSuccessMsg}
            </div>
          )}

          {/* Primary Tracked Request Card */}
          <div className="bg-white border border-civic-border rounded-xl p-6 sm:p-7 shadow-civic-xs border-l-4 border-l-navy-850">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-civic-border mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-extrabold bg-navy-50 text-navy-850 border border-navy-200 px-2 py-0.5 rounded">
                    REF: #SETU-IN-2026-9812
                  </span>
                  <span className="text-[10px] font-bold bg-sand-200 text-navy-950 border border-sand-400 px-2 py-0.5 rounded">
                    Drinking Water
                  </span>
                  {/* Terracotta ONLY for Critical Urgency */}
                  <span className="text-[10px] font-extrabold bg-terracotta-light text-terracotta border border-terracotta-border px-2 py-0.5 rounded">
                    Urgency: Critical
                  </span>
                </div>
                <h2 className="text-lg font-bold text-navy-950">
                  Badnapur Feeder Pipeline Rupture & Water Contamination
                </h2>
                <div className="text-xs text-navy-900/60 mt-0.5">
                  Ingested via Voice Note (Marathi) · Cluster: Hotspot #IN-MH-WTR-04 (342 verified reports)
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-navy-900/50">Current Status</div>
                <div className="text-sm font-extrabold text-navy-850">Prioritized (Rank #1 in District)</div>
              </div>
            </div>

            {/* Live Progress Timeline */}
            <div className="relative pl-8 space-y-6 before:content-[''] before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-navy-850 before:via-navy-700 before:to-civic-border">
              {/* Step 1 */}
              <div className="relative">
                <div className="absolute -left-8 top-1 w-6 h-6 rounded-full bg-navy-850 text-white flex items-center justify-center text-xs font-bold">
                  ✓
                </div>
                <div className="bg-sand-50/50 border border-civic-border rounded-lg p-3.5">
                  <div className="flex justify-between items-center text-xs font-bold text-navy-950">
                    <span>1. Multilingual Ingestion & Whisper Transcription</span>
                    <span className="text-[11px] text-navy-900/50 font-normal">Sept 14, 10:14 AM</span>
                  </div>
                  <p className="text-xs text-navy-900/70 mt-1">
                    Voice audio processed and translated. Extracted category: <code>water_supply</code>, urgency: <code>0.89</code>, coordinates: <code>19.8762, 75.3433</code>.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative">
                <div className="absolute -left-8 top-1 w-6 h-6 rounded-full bg-navy-850 text-white flex items-center justify-center text-xs font-bold">
                  ✓
                </div>
                <div className="bg-sand-50/50 border border-civic-border rounded-lg p-3.5">
                  <div className="flex justify-between items-center text-xs font-bold text-navy-950">
                    <span>2. Clustered into Demand Hotspot #IN-MH-WTR-04</span>
                    <span className="text-[11px] text-navy-900/50 font-normal">Sept 14, 11:30 AM</span>
                  </div>
                  <p className="text-xs text-navy-900/70 mt-1">
                    HDBSCAN spatial clustering fused your request with <strong>342 neighboring citizen complaints</strong> across a 3.2km corridor. Estimated affected population: 14,200.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative">
                <div className="absolute -left-8 top-1 w-6 h-6 rounded-full bg-navy-850 text-white flex items-center justify-center text-xs font-bold">
                  ✓
                </div>
                <div className="bg-sand-50/50 border border-civic-border rounded-lg p-3.5">
                  <div className="flex justify-between items-center text-xs font-bold text-navy-950">
                    <span>3. Explainable Score Computation & Plan Grounding</span>
                    <span className="text-[11px] text-navy-900/50 font-normal">Sept 16, 02:45 PM</span>
                  </div>
                  <p className="text-xs text-navy-900/70 mt-1">
                    Maharashtra Regional Planning Office computed priority score: <strong>91.4 / 100</strong>. Grounded via RAG against <em>MH State Water Masterplan 2025-27 (Art. 4.2)</em>.
                  </p>
                </div>
              </div>

              {/* Step 4 (Active) */}
              <div className="relative">
                <div className="absolute -left-8 top-1 w-6 h-6 rounded-full bg-sand-400 border-2 border-navy-850 text-navy-950 flex items-center justify-center text-xs font-bold shadow-xs">
                  ●
                </div>
                <div className="bg-navy-50 border-2 border-navy-850 rounded-lg p-3.5">
                  <div className="flex justify-between items-center text-xs font-bold text-navy-950">
                    <span>4. Prioritized in District Capital Works (Rank #1)</span>
                    <span className="text-[10px] uppercase font-bold bg-navy-850 text-white px-2 py-0.5 rounded">Active Stage</span>
                  </div>
                  <p className="text-xs text-navy-900/70 mt-1">
                    Project Title: <em>"Badnapur Sub-District High-Capacity Feeder Line Replacement"</em>. Estimated Cost: ₹3.8 Crores ($460,000 USD).
                  </p>
                </div>
              </div>

              {/* Step 5 */}
              <div className="relative opacity-60">
                <div className="absolute -left-8 top-1 w-6 h-6 rounded-full bg-white border border-civic-border text-navy-900/50 flex items-center justify-center text-xs font-bold">
                  5
                </div>
                <div className="bg-white border border-civic-border rounded-lg p-3.5">
                  <div className="flex justify-between items-center text-xs font-bold text-navy-950">
                    <span>5. National / State Budget Allocation</span>
                    <span className="text-[11px] text-navy-900/50">Pending Sanction</span>
                  </div>
                  <p className="text-xs text-navy-900/70 mt-1">
                    Scheduled for State Infrastructure Council sanction under Jal Jeevan Mission.
                  </p>
                </div>
              </div>

              {/* Step 6 */}
              <div className="relative opacity-40">
                <div className="absolute -left-8 top-1 w-6 h-6 rounded-full bg-white border border-civic-border text-navy-900/50 flex items-center justify-center text-xs font-bold">
                  6
                </div>
                <div className="bg-white border border-civic-border rounded-lg p-3.5">
                  <div className="flex justify-between items-center text-xs font-bold text-navy-950">
                    <span>6. Field Execution & Physical Impact Verification</span>
                    <span className="text-[11px] text-navy-900/50">Future</span>
                  </div>
                  <p className="text-xs text-navy-900/70 mt-1">
                    Before/after sensor metrics and citizen feedback verification to close the loop.
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
