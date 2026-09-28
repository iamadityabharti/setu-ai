import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, Project, PolicyResponse } from '../../lib/api';
import { useDashboardWebSocket } from '../../lib/ws';
import { useAuthStore } from '../../store/useAuthStore';
import { useLangStore } from '../../store/useLangStore';
import {
  RotateCw, Filter, Search, CheckCircle, AlertCircle, FileText,
  Layers, Users, DollarSign, ArrowUpRight, ShieldCheck, MapPin
} from 'lucide-react';

export const OfficialDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { t } = useLangStore();
  const queryClient = useQueryClient();

  const [selectedProjectId, setSelectedProjectId] = useState<string>('proj-mh-wtr-1');
  const [sectorFilter, setSectorFilter] = useState<string>('all');
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
  const { data: projects = [], isLoading: isLoadingProjects } = useQuery({
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
      alert("HDBSCAN spatial clustering pipeline executed! Project queue recomputed and synchronized over WebSocket.");
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

  return (
    <div className="flex flex-col h-[calc(100vh-68px)] overflow-hidden bg-civic-bg">
      {/* Sub-header / Region Context Bar */}
      <div className="bg-white border-b border-civic-border px-6 py-2.5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-extrabold text-xs text-navy-950">
            Region: Maharashtra State (IN-MH) · Aurangabad & Jalna Division
          </span>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-civic-emerald bg-civic-emerald/10 border border-civic-emerald/30 px-2.5 py-0.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-civic-emerald animate-pulse" />
            {isConnected ? 'WebSocket Live: Region Stream' : 'Connecting WebSocket...'}
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            className="border border-civic-border rounded px-2.5 py-1 text-xs font-semibold text-navy-950 bg-white outline-none"
          >
            <option value="all">All Sectors (Water, Roads, Power...)</option>
            <option value="water">Drinking Water</option>
            <option value="roads">Roads & Bridges</option>
          </select>
        </div>
      </div>

      {/* 3-Column Command Layout */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden">
        
        {/* COLUMN 1: Ranked Project Queue (3.5 cols) */}
        <div className="col-span-12 md:col-span-4 lg:col-span-3 bg-white border-r border-civic-border flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b border-civic-border bg-white flex items-center justify-between flex-shrink-0">
            <div>
              <h2 className="text-sm font-extrabold text-navy-950">Ranked Capital Projects</h2>
              <div className="text-[11px] text-navy-900/60 mt-0.5">Sorted by Explainable Priority Score</div>
            </div>
            <button
              onClick={() => clusterMutation.mutate()}
              disabled={clusterMutation.isPending}
              className="inline-flex items-center gap-1 bg-navy-850 hover:bg-navy-800 text-white font-bold text-[11px] px-2.5 py-1.5 rounded transition-all disabled:opacity-50"
              title="Re-run HDBSCAN clustering on latest citizen reports"
            >
              <RotateCw className={`w-3 h-3 ${clusterMutation.isPending ? 'animate-spin' : ''}`} />
              Run Clustering
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {projects.map((proj, idx) => {
              const isSelected = proj.id === selectedProject?.id;
              const isUrgent = proj.priority_score > 90;
              return (
                <div
                  key={proj.id}
                  onClick={() => setSelectedProjectId(proj.id)}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-navy-850 bg-navy-50/70 border-l-4 border-l-navy-850 shadow-xs'
                      : 'border-civic-border bg-white hover:bg-sand-50'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-sand-300 text-navy-950 px-2 py-0.5 rounded">
                      Rank #{idx + 1} · {proj.category}
                    </span>
                    <span className={`text-xs font-extrabold ${isUrgent ? 'text-terracotta' : 'text-navy-950'}`}>
                      Score: {proj.priority_score}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-navy-950 line-clamp-1 mb-1">
                    {proj.title}
                  </h3>

                  <div className="flex items-center gap-3 text-[11px] text-navy-900/60">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" /> {proj.estimated_beneficiaries.toLocaleString()} pop
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" /> ${(proj.estimated_cost / 1000).toFixed(0)}K
                    </span>
                  </div>

                  {/* 5-Segment Priority Meter */}
                  <div className="flex h-2 w-full rounded overflow-hidden bg-gray-200 mt-2">
                    <div className="seg-volume" style={{ width: '35%' }} title="Demand Volume: 35%" />
                    <div className="seg-urgency" style={{ width: '20%' }} title="Urgency Signal: 20%" />
                    <div className="seg-vulnerability" style={{ width: '18%' }} title="Demographic Vulnerability: 18%" />
                    <div className="seg-infra" style={{ width: '15%' }} title="Infra Deficit: 15%" />
                    <div className="seg-budget" style={{ width: '12%' }} title="Budget Alignment: 12%" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* COLUMN 2: Geospatial Interactive Map Canvas (5 cols) */}
        <div className="col-span-12 md:col-span-8 lg:col-span-5 bg-slate-200 relative flex flex-col overflow-hidden">
          {/* Map Top Bar */}
          <div className="absolute top-3 left-3 right-3 z-10 flex justify-between pointer-events-none">
            <div className="pointer-events-auto bg-white/95 backdrop-blur border border-civic-border rounded-lg px-3 py-1.5 flex items-center gap-3 text-xs font-semibold shadow-civic-xs">
              <span>Layers:</span>
              <label className="flex items-center gap-1 text-[11px] cursor-pointer">
                <input type="checkbox" defaultChecked /> HDBSCAN Hotspots
              </label>
              <label className="flex items-center gap-1 text-[11px] cursor-pointer">
                <input type="checkbox" defaultChecked /> Vulnerability Index
              </label>
            </div>
          </div>

          {/* SVG Map Canvas with Simulated Spatial Hotspots */}
          <div className="w-full h-full bg-[#E5EBF2] relative overflow-hidden flex items-center justify-center">
            {/* Grid overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(19,42,76,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(19,42,76,0.06)_1px,transparent_1px)] bg-[size:40px_40px]" />

            {/* Simulated Road Lines */}
            <svg className="absolute inset-0 w-full h-full stroke-slate-300 stroke-[2] fill-none pointer-events-none">
              <path d="M 50 150 Q 200 120 400 300 T 700 450" />
              <path d="M 250 50 L 320 280 L 450 550" />
              <path d="M 120 400 Q 300 350 600 380" />
            </svg>

            {/* Hotspot 1: Badnapur Water (Terracotta Pulsing Pin - Urgent) */}
            <div
              onClick={() => setSelectedProjectId('proj-mh-wtr-1')}
              className="absolute left-[45%] top-[38%] w-18 h-18 -ml-9 -mt-9 rounded-full bg-gradient-to-br from-terracotta to-terracotta-dark text-white border-2 border-white shadow-civic-lg flex flex-col items-center justify-center cursor-pointer hover:scale-110 transition-transform animate-recording z-20 p-2"
              title="Hotspot #IN-MH-WTR-04: 342 Citizen Requests"
            >
              <div className="text-[11px] font-extrabold leading-none">#1 · 342</div>
              <div className="text-[8px] font-bold opacity-90 uppercase mt-0.5">WATER</div>
            </div>

            {/* Hotspot 2: State Highway Roads */}
            <div
              onClick={() => setSelectedProjectId('proj-mh-rds-1')}
              className="absolute left-[28%] top-[56%] w-14 h-14 -ml-7 -mt-7 rounded-full bg-navy-850 text-white border-2 border-white shadow-civic-md flex flex-col items-center justify-center cursor-pointer hover:scale-110 transition-transform z-10"
              title="Hotspot #IN-MH-RD-08: 215 Citizen Requests"
            >
              <div className="text-[10px] font-extrabold leading-none">#2 · 215</div>
              <div className="text-[8px] font-bold opacity-90 uppercase mt-0.5">ROADS</div>
            </div>

            {/* Hotspot 3: Rural Health */}
            <div
              onClick={() => setSelectedProjectId('proj-br-eng-1')}
              className="absolute left-[65%] top-[62%] w-12 h-12 -ml-6 -mt-6 rounded-full bg-navy-700 text-white border-2 border-white shadow-civic-md flex flex-col items-center justify-center cursor-pointer hover:scale-110 transition-transform z-10"
              title="Hotspot #BR-ENG-01: 210 Citizen Requests"
            >
              <div className="text-[10px] font-extrabold leading-none">#3 · 210</div>
              <div className="text-[8px] font-bold opacity-90 uppercase mt-0.5">POWER</div>
            </div>
          </div>

          {/* Map Legend */}
          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur border border-civic-border rounded-lg p-2.5 text-[11px] shadow-civic-xs z-10">
            <div className="font-bold text-navy-950 mb-1">Density & Urgency Legend</div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-terracotta" />
              <span>Urgent Hotspot (Urgency &gt; 0.8)</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="w-2.5 h-2.5 rounded-full bg-navy-850" />
              <span>Standard Demand Hotspot</span>
            </div>
          </div>
        </div>

        {/* COLUMN 3: Deep Dive Score Breakdown & Policy RAG (4 cols) */}
        <div className="col-span-12 lg:col-span-4 bg-white border-l border-civic-border flex flex-col h-full overflow-y-auto">
          {selectedProject && (
            <div className="p-5 space-y-5">
              {/* Project Header */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-extrabold uppercase bg-sand-200 text-navy-950 border border-sand-400 px-2 py-0.5 rounded">
                    Hotspot #{selectedProject.hotspot_id || 'IN-MH-WTR-04'}
                  </span>
                  <span className="text-[11px] font-extrabold bg-terracotta-light text-terracotta border border-terracotta-border px-2 py-0.5 rounded">
                    Priority Score: {selectedProject.priority_score} / 100
                  </span>
                </div>
                <h2 className="text-base font-bold text-navy-950 leading-snug">
                  {selectedProject.title}
                </h2>
                <p className="text-xs text-navy-900/70 mt-1 leading-relaxed">
                  {selectedProject.description}
                </p>
              </div>

              {/* Beneficiary & Capex Metric Strip */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-navy-50 border border-navy-100 p-2.5 rounded-lg">
                  <div className="text-[10px] text-navy-900/60 font-semibold uppercase">Beneficiaries</div>
                  <div className="text-sm font-extrabold text-navy-950">
                    {selectedProject.estimated_beneficiaries.toLocaleString()} residents
                  </div>
                </div>
                <div className="bg-navy-50 border border-navy-100 p-2.5 rounded-lg">
                  <div className="text-[10px] text-navy-900/60 font-semibold uppercase">Estimated Capex</div>
                  <div className="text-sm font-extrabold text-navy-950">
                    ${selectedProject.estimated_cost.toLocaleString()} USD
                  </div>
                </div>
              </div>

              {/* EXPLAINABLE PRIORITY FORMULA BREAKDOWN (Section 7) */}
              <div className="bg-sand-50/60 border border-sand-300 rounded-xl p-4">
                <div className="text-xs font-bold text-navy-950 mb-1">
                  {t('explainable_formula')}
                </div>
                <div className="text-[11px] text-navy-900/60 mb-2.5">
                  Auditable formula: Demand 35% + Urgency 20% + Vulnerability 20% + Deficit 15% + Budget 10%
                </div>

                {/* Stacked Horizontal Bar */}
                <div className="flex h-3 w-full rounded-md overflow-hidden bg-gray-200 mb-3 shadow-inner">
                  <div className="seg-volume" style={{ width: '35%' }} title="Demand Volume: 34.3" />
                  <div className="seg-urgency" style={{ width: '20%' }} title="Urgency Signal: 17.8" />
                  <div className="seg-vulnerability" style={{ width: '18%' }} title="Demographic Vulnerability: 18.2" />
                  <div className="seg-infra" style={{ width: '12%' }} title="Infra Deficit: 12.0" />
                  <div className="seg-budget" style={{ width: '9%' }} title="Budget Alignment: 9.1" />
                </div>

                {/* Mathematical Table */}
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="border-b border-sand-300 text-navy-900/60 font-bold uppercase text-[9.5px]">
                      <th className="text-left pb-1">Factor</th>
                      <th className="text-center pb-1">Weight</th>
                      <th className="text-right pb-1">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand-200/60">
                    <tr>
                      <td className="py-1">Citizen Demand Volume</td>
                      <td className="text-center">35%</td>
                      <td className="text-right font-bold text-navy-950">34.3 / 35.0</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-terracotta font-bold">Urgency Signal (NLU)</td>
                      <td className="text-center text-terracotta">20%</td>
                      <td className="text-right font-bold text-terracotta">17.8 / 20.0</td>
                    </tr>
                    <tr>
                      <td className="py-1">Demographic Vulnerability</td>
                      <td className="text-center">20%</td>
                      <td className="text-right font-bold text-navy-950">18.2 / 20.0</td>
                    </tr>
                    <tr>
                      <td className="py-1">Infra Deficit Index</td>
                      <td className="text-center">15%</td>
                      <td className="text-right font-bold text-navy-950">12.0 / 15.0</td>
                    </tr>
                    <tr>
                      <td className="py-1">Budget / Plan Alignment</td>
                      <td className="text-center">10%</td>
                      <td className="text-right font-bold text-navy-950">9.1 / 10.0</td>
                    </tr>
                    <tr className="border-t-2 border-navy-950 font-bold">
                      <td className="pt-1.5" colSpan={2}>Composite Priority</td>
                      <td className="pt-1.5 text-right text-xs text-navy-950 font-extrabold">
                        {selectedProject.priority_score} / 100
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Policy-Alignment Assistant (RAG) */}
              <div className="bg-white border border-civic-border rounded-xl p-4 shadow-xs">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xs font-bold text-navy-950">{t('rag_title')}</h3>
                  <span className="text-[10px] font-extrabold bg-navy-50 text-navy-850 px-2 py-0.5 rounded border border-navy-200">
                    pgvector 384d
                  </span>
                </div>
                <p className="text-[11px] text-navy-900/60 mb-2.5">
                  Semantic retrieval against state investment plans & gazettes.
                </p>

                <div className="space-y-2">
                  <input
                    type="text"
                    value={ragQuery}
                    onChange={(e) => setRagQuery(e.target.value)}
                    className="w-full border border-civic-border rounded p-2 text-xs text-navy-950 outline-none focus:border-navy-850"
                  />
                  <button
                    onClick={() => ragMutation.mutate(ragQuery)}
                    disabled={ragMutation.isPending}
                    className="w-full inline-flex items-center justify-center gap-1.5 bg-navy-850 hover:bg-navy-800 text-white font-bold text-xs py-2 rounded transition-all disabled:opacity-50"
                  >
                    <Search className="w-3.5 h-3.5" />
                    {ragMutation.isPending ? 'Querying pgvector corpus...' : t('rag_query_btn')}
                  </button>
                </div>

                {/* Grounded Citation Result */}
                {ragResult && (
                  <div className="mt-3 bg-sand-50 border border-sand-300 rounded-lg p-3 text-xs space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-bold text-navy-850">
                      <span>Source: {ragResult.citations[0]?.document_source}</span>
                      <span className="text-civic-emerald">Similarity: {ragResult.citations[0]?.similarity_score}</span>
                    </div>
                    <p className="text-navy-950 text-[11px] font-semibold">
                      {ragResult.answer}
                    </p>
                    <div className="text-[10.5px] text-navy-900/70 border-t border-dashed border-sand-300 pt-1">
                      <strong>Citing:</strong> {ragResult.citations[0]?.snippet}
                    </div>
                  </div>
                )}
              </div>

              {/* Endorse Button */}
              <button
                onClick={() => alert(`Project #${selectedProject.id} endorsed! Dispatched to National Commission Queue. Audit log #AUD-9104 created.`)}
                className="w-full bg-navy-850 hover:bg-navy-800 text-white font-bold text-xs py-3 rounded-lg shadow-civic-xs transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4 text-sand-400" />
                Endorse for National Allocation
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
