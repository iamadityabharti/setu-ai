import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, Project, PolicyResponse } from '../../lib/api';
import { useDashboardWebSocket } from '../../lib/ws';
import { useAuthStore } from '../../store/useAuthStore';
import { useLangStore } from '../../store/useLangStore';
import {
  RotateCw, Filter, Search, CheckCircle, AlertCircle, FileText,
  Layers, Users, DollarSign, ArrowUpRight, ShieldCheck, MapPin,
  Sparkles, Radio, CheckCircle2, ChevronRight, Sliders, ExternalLink,
  ZoomIn, ZoomOut, Compass, Info, FileSpreadsheet
} from 'lucide-react';

export const OfficialDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { t } = useLangStore();
  const queryClient = useQueryClient();

  const [selectedProjectId, setSelectedProjectId] = useState<string>('proj-mh-wtr-1');
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [showVulnerability, setShowVulnerability] = useState<boolean>(true);
  const [ragQuery, setRagQuery] = useState<string>(
    'Does this project qualify under the 2025-27 State Water Masterplan?'
  );
  const [ragResult, setRagResult] = useState<PolicyResponse | null>(null);

  // Live WebSocket stream
  const { isConnected } = useDashboardWebSocket(user?.region_id || 'reg-in-mh', (event) => {
    if (event.type === 'NEW_GRIEVANCE_INGESTED' || event.type === 'CLUSTERING_RUN_COMPLETED' || event.type === 'PROJECT_STATUS_UPDATED') {
      queryClient.invalidateQueries({ queryKey: ['ranked_projects'] });
      queryClient.invalidateQueries({ queryKey: ['hotspots'] });
    }
  });

  // Query projects
  const { data: projects = [] } = useQuery({
    queryKey: ['ranked_projects'],
    queryFn: () => api.listRankedProjects({ region_id: 'reg-in-mh' })
  });

  // Query hotspots
  const { data: hotspots = [] } = useQuery({
    queryKey: ['hotspots'],
    queryFn: () => api.listHotspots({ region_id: 'reg-in-mh' })
  });

  // Clustering Mutation
  const clusterMutation = useMutation({
    mutationFn: () => api.triggerClustering('reg-in-mh'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ranked_projects'] });
      queryClient.invalidateQueries({ queryKey: ['hotspots'] });
    }
  });

  // Policy RAG Query Mutation
  const ragMutation = useMutation({
    mutationFn: (q: string) => api.queryPolicyRAG(q, 'reg-in-mh', 'water'),
    onSuccess: (data) => {
      setRagResult(data);
    }
  });

  const selectedProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  const quickPrompts = [
    'Does this project qualify under 2025-27 State Water Masterplan?',
    'What is the statutory funding gap for Ward 4 feeder?',
    'Check alignment with PMKSY Article 4.2'
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-72px)] overflow-hidden bg-[#F8F7F4]">
      {/* Sub-header / Command Context Bar */}
      <div className="bg-white border-b-2 border-sand-300/80 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 flex-shrink-0 shadow-civic-xs z-30">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-black text-xs sm:text-sm text-navy-950">
              Regional Command: Maharashtra State (IN-MH) · Division 04
            </span>
          </div>
          <div className="hidden md:flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2.5 py-0.5 rounded-full">
            <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
            <span>{isConnected ? 'Realtime WebSocket Sync Active' : 'Connecting to Stream...'}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          {/* Sector Filter */}
          <div className="flex items-center gap-1 bg-sand-100/80 border border-sand-400 rounded-lg px-2.5 py-1">
            <Filter className="w-3.5 h-3.5 text-navy-850" />
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="bg-transparent text-xs font-bold text-navy-950 outline-none cursor-pointer"
            >
              <option value="all">All Sectors (Water, Roads, Power)</option>
              <option value="water">Drinking Water</option>
              <option value="roads">Roads & Bridges</option>
              <option value="power">Energy & Grid</option>
            </select>
          </div>

          {/* Trigger Clustering Button */}
          <button
            onClick={() => clusterMutation.mutate()}
            disabled={clusterMutation.isPending}
            className="inline-flex items-center gap-1.5 bg-navy-850 hover:bg-navy-900 text-white font-black text-xs px-3 py-1.5 rounded-lg transition-all shadow-xs disabled:opacity-50 hover:scale-[1.02]"
            title="Re-run HDBSCAN clustering on latest citizen reports"
          >
            <RotateCw className={`w-3.5 h-3.5 text-sand-400 ${clusterMutation.isPending ? 'animate-spin' : ''}`} />
            <span>{clusterMutation.isPending ? 'Clustering...' : 'Execute HDBSCAN'}</span>
          </button>
        </div>
      </div>

      {/* 3-Column Command Layout */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden">
        
        {/* COLUMN 1: Ranked Project Queue (3.2 cols) */}
        <div className="col-span-12 md:col-span-4 lg:col-span-3 bg-white border-r-2 border-sand-300/80 flex flex-col h-full overflow-hidden z-20">
          <div className="p-3.5 border-b-2 border-sand-200 bg-sand-50/60 flex items-center justify-between flex-shrink-0">
            <div>
              <h2 className="text-xs sm:text-sm font-black text-navy-950 uppercase tracking-wider">
                Prioritized Capital Queue
              </h2>
              <div className="text-[11px] text-navy-900/60">Ranked by 5-Factor Explainable Formula</div>
            </div>
            <span className="text-[10px] font-black bg-sand-300 text-navy-950 px-2 py-0.5 rounded-full">
              {projects.length} Projects
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {projects.map((proj, idx) => {
              const isSelected = proj.id === selectedProject?.id;
              const isUrgent = proj.priority_score > 90;
              return (
                <div
                  key={proj.id}
                  onClick={() => setSelectedProjectId(proj.id)}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-200 relative overflow-hidden group ${
                    isSelected
                      ? 'border-navy-850 bg-gradient-to-r from-navy-50/80 to-white shadow-civic-sm border-l-6 border-l-navy-850'
                      : 'border-sand-200 bg-white hover:border-sand-400 hover:bg-sand-50/40'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-sand-200 text-navy-950 px-2 py-0.5 rounded border border-sand-300">
                      Rank #{idx + 1} · {proj.category}
                    </span>
                    <span className={`text-xs font-black px-2 py-0.5 rounded ${
                      isUrgent 
                        ? 'bg-terracotta-light text-terracotta border border-terracotta-border' 
                        : 'bg-navy-50 text-navy-850'
                    }`}>
                      Score: {proj.priority_score}
                    </span>
                  </div>

                  <h3 className="text-xs sm:text-sm font-extrabold text-navy-950 line-clamp-1 mb-1.5 group-hover:text-navy-700">
                    {proj.title}
                  </h3>

                  <div className="flex items-center gap-3 text-[11px] text-navy-900/70 font-medium mb-2">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-navy-850" /> {proj.estimated_beneficiaries.toLocaleString()} pop
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3 text-emerald-600" /> ${(proj.estimated_cost / 1000).toFixed(0)}K
                    </span>
                  </div>

                  {/* 5-Segment Priority Meter */}
                  <div className="space-y-1">
                    <div className="flex h-2 w-full rounded-full overflow-hidden bg-sand-200">
                      <div className="seg-volume" style={{ width: '35%' }} title="Demand Volume: 35%" />
                      <div className="seg-urgency" style={{ width: '20%' }} title="Urgency Signal: 20%" />
                      <div className="seg-vulnerability" style={{ width: '18%' }} title="Demographic Vulnerability: 18%" />
                      <div className="seg-infra" style={{ width: '15%' }} title="Infra Deficit: 15%" />
                      <div className="seg-budget" style={{ width: '12%' }} title="Budget Alignment: 12%" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* COLUMN 2: Geospatial Interactive Map Canvas (5 cols) */}
        <div className="col-span-12 md:col-span-8 lg:col-span-5 bg-[#E6EDF5] relative flex flex-col overflow-hidden border-r-2 border-sand-300/80">
          {/* Floating Map Controls Bar */}
          <div className="absolute top-3 left-3 right-3 z-10 flex justify-between pointer-events-none">
            <div className="pointer-events-auto bg-white/95 backdrop-blur-md border border-sand-300 rounded-xl px-3 py-1.5 flex items-center gap-3 text-xs font-bold text-navy-950 shadow-civic-sm">
              <span className="text-[11px] uppercase tracking-wider text-navy-900/60 font-black">GIS Layers:</span>
              <label className="flex items-center gap-1.5 text-xs cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showHeatmap}
                  onChange={(e) => setShowHeatmap(e.target.checked)}
                  className="rounded text-navy-850"
                />
                <span>HDBSCAN Hotspots</span>
              </label>
              <label className="flex items-center gap-1.5 text-xs cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showVulnerability}
                  onChange={(e) => setShowVulnerability(e.target.checked)}
                  className="rounded text-navy-850"
                />
                <span>Census Vulnerability</span>
              </label>
            </div>

            <div className="pointer-events-auto flex items-center gap-1 bg-white/95 backdrop-blur-md border border-sand-300 rounded-xl p-1 shadow-civic-sm">
              <button className="p-1 rounded hover:bg-sand-100 text-navy-850" title="Zoom In">
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button className="p-1 rounded hover:bg-sand-100 text-navy-850" title="Zoom Out">
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* SVG Map Canvas with Simulated Spatial Hotspots */}
          <div className="w-full h-full relative overflow-hidden flex items-center justify-center">
            {/* Topographic grid overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(19,42,76,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(19,42,76,0.08)_1px,transparent_1px)] bg-[size:44px_44px]" />

            {/* Simulated River / Corridor Lines */}
            <svg className="absolute inset-0 w-full h-full stroke-blue-300/60 stroke-[3] fill-none pointer-events-none">
              <path d="M 40 180 Q 220 140 380 290 T 720 420" />
              <path d="M 230 40 L 310 260 L 460 560" className="stroke-sand-400/80 stroke-[2] stroke-dasharray-[4_4]" />
              <path d="M 100 420 Q 280 340 580 370" />
            </svg>

            {/* Hotspot 1: Badnapur Water (Terracotta Pulsing Pin - Urgent) */}
            <div
              onClick={() => setSelectedProjectId('proj-mh-wtr-1')}
              className={`absolute left-[46%] top-[38%] w-20 h-20 -ml-10 -mt-10 rounded-full text-white border-2 border-white shadow-2xl flex flex-col items-center justify-center cursor-pointer hover:scale-110 transition-transform z-30 p-2 ${
                selectedProjectId === 'proj-mh-wtr-1'
                  ? 'bg-gradient-to-br from-terracotta to-terracotta-dark ring-4 ring-terracotta/40 scale-105 animate-recording'
                  : 'bg-terracotta/90'
              }`}
              title="Hotspot #IN-MH-WTR-04: 342 Citizen Requests"
            >
              <div className="text-[12px] font-black leading-none">#1 · 342</div>
              <div className="text-[8.5px] font-black opacity-95 uppercase tracking-wider mt-0.5">WATER</div>
            </div>

            {/* Hotspot 2: State Highway Roads */}
            <div
              onClick={() => setSelectedProjectId('proj-mh-rds-1')}
              className={`absolute left-[28%] top-[56%] w-16 h-16 -ml-8 -mt-8 rounded-full text-white border-2 border-white shadow-xl flex flex-col items-center justify-center cursor-pointer hover:scale-110 transition-transform z-20 ${
                selectedProjectId === 'proj-mh-rds-1'
                  ? 'bg-navy-900 ring-4 ring-navy-700/50 scale-105'
                  : 'bg-navy-850'
              }`}
              title="Hotspot #IN-MH-RD-08: 215 Citizen Requests"
            >
              <div className="text-[11px] font-black leading-none">#2 · 215</div>
              <div className="text-[8px] font-black opacity-90 uppercase mt-0.5">ROADS</div>
            </div>

            {/* Hotspot 3: Rural Health / Power */}
            <div
              onClick={() => setSelectedProjectId('proj-br-eng-1')}
              className={`absolute left-[65%] top-[62%] w-14 h-14 -ml-7 -mt-7 rounded-full text-white border-2 border-white shadow-xl flex flex-col items-center justify-center cursor-pointer hover:scale-110 transition-transform z-20 ${
                selectedProjectId === 'proj-br-eng-1'
                  ? 'bg-navy-800 ring-4 ring-sand-400/50 scale-105'
                  : 'bg-navy-700'
              }`}
              title="Hotspot #BR-ENG-01: 210 Citizen Requests"
            >
              <div className="text-[10px] font-black leading-none">#3 · 210</div>
              <div className="text-[8px] font-black opacity-90 uppercase mt-0.5">POWER</div>
            </div>
          </div>

          {/* Map Legend (Bottom-Left) */}
          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md border border-sand-300 rounded-xl p-3 text-[11px] shadow-civic-sm z-10">
            <div className="font-black text-navy-950 uppercase tracking-wider text-[10px] mb-1.5">
              Spatial Density & Urgency
            </div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-terracotta border border-white shadow-xs" />
              <span className="font-semibold text-navy-900">Urgent Demand Hotspot (&gt;0.80)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-navy-850 border border-white shadow-xs" />
              <span className="font-semibold text-navy-900">Standard HDBSCAN Hotspot</span>
            </div>
          </div>

          {/* Live Coordinates HUD (Bottom-Right) */}
          <div className="absolute bottom-3 right-3 bg-navy-950/90 backdrop-blur-md text-sand-200 border border-sand-400/30 rounded-xl px-3 py-1.5 text-[10.5px] font-mono shadow-civic-sm z-10 hidden sm:block">
            <span>Lat: 19.8762° N | Lon: 75.3433° E | EPS: 0.05 Haversine</span>
          </div>
        </div>

        {/* COLUMN 3: Deep Dive Score Breakdown & Policy RAG (3.8 cols) */}
        <div className="col-span-12 lg:col-span-4 bg-white flex flex-col h-full overflow-y-auto">
          {selectedProject && (
            <div className="p-5 sm:p-6 space-y-6">
              {/* Project Title Card */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-black uppercase bg-sand-200 text-navy-950 border border-sand-400 px-2.5 py-0.5 rounded shadow-xs">
                    Hotspot #{selectedProject.hotspot_id || 'IN-MH-WTR-04'}
                  </span>
                  <span className="text-xs font-black bg-terracotta-light text-terracotta border border-terracotta-border px-2.5 py-0.5 rounded">
                    Score: {selectedProject.priority_score} / 100
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-black text-navy-950 leading-snug">
                  {selectedProject.title}
                </h2>
                <p className="text-xs text-navy-900/70 mt-1.5 leading-relaxed font-normal">
                  {selectedProject.description}
                </p>
              </div>

              {/* Beneficiary & Capex Metric Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-sand-50/80 border-2 border-sand-200 p-3 rounded-xl">
                  <div className="text-[10px] text-navy-900/60 font-black uppercase tracking-wider flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-navy-850" /> Beneficiaries
                  </div>
                  <div className="text-base font-black text-navy-950 mt-0.5">
                    {selectedProject.estimated_beneficiaries.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-semibold">Rural population</div>
                </div>

                <div className="bg-sand-50/80 border-2 border-sand-200 p-3 rounded-xl">
                  <div className="text-[10px] text-navy-900/60 font-black uppercase tracking-wider flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-700" /> Estimated Capex
                  </div>
                  <div className="text-base font-black text-navy-950 mt-0.5">
                    ${selectedProject.estimated_cost.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-navy-900/50 font-semibold">₹3.8 Cr equivalent</div>
                </div>
              </div>

              {/* 100% EXPLAINABLE PRIORITY FORMULA BREAKDOWN */}
              <div className="bg-sand-50/80 border-2 border-sand-300 rounded-2xl p-4 sm:p-5 shadow-xs">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xs sm:text-sm font-black text-navy-950 flex items-center gap-1.5">
                    <span>🧮</span> {t('explainable_formula')}
                  </h3>
                  <span className="text-[10px] font-black bg-navy-850 text-sand-300 px-2 py-0.5 rounded">
                    Zero Black-Box
                  </span>
                </div>
                <div className="text-[11px] font-mono text-navy-900/70 mb-3 bg-white p-2 rounded-lg border border-sand-200">
                  P = 0.35·D + 0.20·U + 0.20·V + 0.15·I + 0.10·B
                </div>

                {/* Stacked Horizontal Bar */}
                <div className="flex h-3 w-full rounded-full overflow-hidden bg-sand-200 mb-4 shadow-inner">
                  <div className="seg-volume" style={{ width: '35%' }} title="Demand Volume: 34.3" />
                  <div className="seg-urgency" style={{ width: '20%' }} title="Urgency Signal: 17.8" />
                  <div className="seg-vulnerability" style={{ width: '18%' }} title="Demographic Vulnerability: 18.2" />
                  <div className="seg-infra" style={{ width: '12%' }} title="Infra Deficit: 12.0" />
                  <div className="seg-budget" style={{ width: '9%' }} title="Budget Alignment: 9.1" />
                </div>

                {/* Mathematical Table */}
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b-2 border-sand-300 text-navy-900/60 font-black uppercase text-[10px]">
                      <th className="text-left pb-1.5">Formula Factor</th>
                      <th className="text-center pb-1.5">Weight</th>
                      <th className="text-right pb-1.5">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand-200">
                    <tr>
                      <td className="py-1.5 font-medium">Citizen Demand Volume</td>
                      <td className="text-center font-mono">35%</td>
                      <td className="text-right font-black text-navy-950">34.3 / 35.0</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 font-bold text-terracotta">Urgency Signal (NLU)</td>
                      <td className="text-center font-mono text-terracotta">20%</td>
                      <td className="text-right font-black text-terracotta">17.8 / 20.0</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 font-medium">Demographic Vulnerability</td>
                      <td className="text-center font-mono">20%</td>
                      <td className="text-right font-black text-navy-950">18.2 / 20.0</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 font-medium">Infra Deficit Index</td>
                      <td className="text-center font-mono">15%</td>
                      <td className="text-right font-black text-navy-950">12.0 / 15.0</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 font-medium">Budget / Plan Alignment</td>
                      <td className="text-center font-mono">10%</td>
                      <td className="text-right font-black text-navy-950">9.1 / 10.0</td>
                    </tr>
                    <tr className="border-t-2 border-navy-950 font-black">
                      <td className="pt-2" colSpan={2}>Composite Priority Total</td>
                      <td className="pt-2 text-right text-sm text-navy-950 font-black">
                        {selectedProject.priority_score} / 100
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Policy-Alignment Assistant (RAG) */}
              <div className="bg-white border-2 border-sand-300 rounded-2xl p-4 sm:p-5 shadow-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="text-xs sm:text-sm font-black text-navy-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-sand-500" />
                    {t('rag_title')}
                  </h3>
                  <span className="text-[10px] font-mono font-black bg-navy-50 text-navy-850 px-2 py-0.5 rounded border border-navy-200">
                    pgvector 384d
                  </span>
                </div>
                <p className="text-[11px] text-navy-900/60 mb-3 font-normal">
                  Semantic retrieval against state masterplans, gazettes & Jal Jeevan Mission guidelines.
                </p>

                <div className="space-y-2 mb-3">
                  <input
                    type="text"
                    value={ragQuery}
                    onChange={(e) => setRagQuery(e.target.value)}
                    className="w-full border-2 border-sand-300 rounded-xl p-2.5 text-xs text-navy-950 outline-none focus:border-navy-850 font-medium"
                  />
                  <button
                    onClick={() => ragMutation.mutate(ragQuery)}
                    disabled={ragMutation.isPending}
                    className="w-full inline-flex items-center justify-center gap-2 bg-navy-850 hover:bg-navy-900 text-white font-extrabold text-xs py-2.5 rounded-xl transition-all disabled:opacity-50 shadow-xs"
                  >
                    <Search className="w-3.5 h-3.5 text-sand-400" />
                    <span>{ragMutation.isPending ? 'Querying vector corpus...' : t('rag_query_btn')}</span>
                  </button>
                </div>

                {/* Grounded Citation Result */}
                {ragResult && (
                  <div className="bg-sand-50/80 border-2 border-sand-300 rounded-xl p-3.5 text-xs space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-black text-navy-850">
                      <span>Source: {ragResult.citations[0]?.document_source}</span>
                      <span className="text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-300">
                        Similarity: {ragResult.citations[0]?.similarity_score}
                      </span>
                    </div>
                    <p className="text-navy-950 text-xs font-semibold leading-relaxed">
                      {ragResult.answer}
                    </p>
                    <div className="text-[11px] text-navy-900/70 border-t border-dashed border-sand-300 pt-2 italic">
                      <strong>Direct Quote:</strong> "{ragResult.citations[0]?.snippet}"
                    </div>
                  </div>
                )}
              </div>

              {/* Endorse Button */}
              <button
                onClick={() => alert(`Project #${selectedProject.id} endorsed! Dispatched to National Commission Queue. Audit log #AUD-9104 created.`)}
                className="w-full bg-gradient-to-r from-navy-850 to-navy-950 hover:from-navy-900 hover:to-navy-950 text-white font-black text-xs sm:text-sm py-3.5 rounded-xl shadow-civic-md transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
              >
                <CheckCircle className="w-4 h-4 text-sand-400" />
                <span>Endorse for National Allocation</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
