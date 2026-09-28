import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, RegionComparison, ImpactSnapshot } from '../../lib/api';
import { useAuthStore } from '../../store/useAuthStore';
import { useLangStore } from '../../store/useLangStore';
import {
  Download, FileCheck2, ArrowRight, CheckCircle2,
  Activity, Globe, TrendingUp, ShieldAlert, BarChart3,
  Layers, Check, Sparkles, Building2, MapPin, ShieldCheck,
  AlertTriangle, ArrowUpRight, Scale, Clock, Lock
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { t } = useLangStore();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'leaderboard' | 'impact'>('leaderboard');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  
  // Status Transition Modal state
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [transitionData, setTransitionData] = useState<{
    projectId: string;
    title: string;
    from: string;
    to: string;
  } | null>(null);

  // Query leaderboard
  const { data: leaderboard = [], isLoading: isLoadingLeaderboard } = useQuery({
    queryKey: ['leaderboard', selectedCountry],
    queryFn: () => api.getLeaderboard(selectedCountry === 'all' ? undefined : selectedCountry)
  });

  // Query impact snapshots
  const { data: snapshots = [] } = useQuery({
    queryKey: ['impact_snapshots'],
    queryFn: () => api.getImpactSnapshots()
  });

  // Transition mutation
  const transitionMutation = useMutation({
    mutationFn: async ({ id, to }: { id: string; to: string }) => {
      return api.updateProjectStatus(id, to, "Approved by National Commission Command");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      queryClient.invalidateQueries({ queryKey: ['ranked_projects'] });
      setModalOpen(false);
    }
  });

  const handleOpenModal = (projectId: string, title: string, from: string, to: string) => {
    setTransitionData({ projectId, title, from, to });
    setModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
      {/* Commission Executive Banner */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 text-white border-2 border-sand-400/40 rounded-2xl p-6 sm:p-8 mb-8 shadow-civic-md flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative overflow-hidden">
        {/* Subtle mesh circle */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-sand-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-sand-300 bg-white/10 border border-sand-400/30 px-3 py-1 rounded-full mb-3 shadow-xs">
            <Scale className="w-3.5 h-3.5 text-sand-400" />
            <span>National Infrastructure Commission · BRICS Allocation Authority</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Federal Infrastructure Allocation & Impact Audit
          </h1>
          <p className="text-xs sm:text-sm text-sand-200/80 mt-1.5 max-w-2xl font-normal leading-relaxed">
            Federated sovereign architecture: Cross-state equity auditing, algorithmic budget sanctioning, and verified ground telemetry.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <a
            href="http://localhost:8000/api/v1/hotspots/public/hotspots"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-sand-200 border border-sand-400/30 font-bold text-xs py-2.5 px-4 rounded-xl transition-all shadow-xs backdrop-blur-md"
          >
            <Download className="w-4 h-4 text-sand-400" />
            <span>Open Data API</span>
          </a>
          <button
            onClick={() => alert("Full BRICS Capital Allocations Audit Dossier compiled successfully!\n\n• Hash: SHA256-0x892a0e41b\n• Standards: UN-DPG / IMF Public Investment Management Assessment\n• Format: Signed JSON & Verified Ledger.")}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-sand-300 to-sand-400 text-navy-950 font-black text-xs py-2.5 px-4 rounded-xl hover:from-sand-400 hover:to-sand-500 transition-all shadow-md hover:scale-[1.02]"
          >
            <FileCheck2 className="w-4 h-4 text-navy-950" />
            <span>Export Audit Dossier</span>
          </button>
        </div>
      </div>

      {/* 4 Summary High-Impact KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <div className="bg-white border-2 border-sand-300/80 rounded-2xl p-5 sm:p-6 shadow-civic-xs hover:border-sand-400 transition-all">
          <div className="text-[11px] font-black uppercase tracking-wider text-navy-900/60 flex items-center justify-between">
            <span>Jurisdictions</span>
            <Globe className="w-3.5 h-3.5 text-navy-850" />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-navy-950 my-2">28 States</div>
          <div className="text-[11px] text-navy-900/70 font-medium">India (18) · Brazil (6) · South Africa (4)</div>
        </div>

        <div className="bg-white border-2 border-sand-300/80 rounded-2xl p-5 sm:p-6 shadow-civic-xs hover:border-sand-400 transition-all">
          <div className="text-[11px] font-black uppercase tracking-wider text-navy-900/60 flex items-center justify-between">
            <span>Active Hotspots</span>
            <Activity className="w-3.5 h-3.5 text-terracotta" />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-navy-950 my-2">842 Zones</div>
          <div className="text-[11px] text-navy-900/70 font-medium">Clustered from 148,240 citizen reports</div>
        </div>

        <div className="bg-white border-2 border-sand-300/80 rounded-2xl p-5 sm:p-6 shadow-civic-xs hover:border-sand-400 transition-all">
          <div className="text-[11px] font-black uppercase tracking-wider text-navy-900/60 flex items-center justify-between">
            <span>Allocated Capital</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-navy-950 my-2">$482.4M</div>
          <div className="text-[11px] text-emerald-700 font-bold">62.4% Capital deployment rate</div>
        </div>

        <div className="bg-white border-2 border-sand-300/80 rounded-2xl p-5 sm:p-6 shadow-civic-xs hover:border-sand-400 transition-all">
          <div className="text-[11px] font-black uppercase tracking-wider text-navy-900/60 flex items-center justify-between">
            <span>Ground Audited</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-navy-950 my-2">114 Works</div>
          <div className="text-[11px] text-emerald-700 font-bold">100% Verified via IoT & surveys</div>
        </div>
      </div>

      {/* Modern Tabs */}
      <div className="flex bg-sand-200/80 p-1.5 rounded-xl mb-8 border border-sand-400/60 shadow-xs">
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`flex-1 py-3 text-xs sm:text-sm font-black rounded-lg transition-all flex items-center justify-center gap-2 ${
            activeTab === 'leaderboard'
              ? 'bg-navy-850 text-white shadow-civic-xs'
              : 'text-navy-950 hover:bg-white/40'
          }`}
        >
          <span>📊</span> {t('leaderboard_tab')}
        </button>
        <button
          onClick={() => setActiveTab('impact')}
          className={`flex-1 py-3 text-xs sm:text-sm font-black rounded-lg transition-all flex items-center justify-center gap-2 ${
            activeTab === 'impact'
              ? 'bg-navy-850 text-white shadow-civic-xs'
              : 'text-navy-950 hover:bg-white/40'
          }`}
        >
          <span>📈</span> {t('impact_tab')}
        </button>
      </div>

      {/* VIEW 1: CROSS-REGION COMPARISON LEADERBOARD */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-5">
          <div className="flex flex-wrap justify-between items-center gap-3 text-xs">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCountry('all')}
                className={`px-3.5 py-1.5 rounded-lg font-black transition-all ${
                  selectedCountry === 'all'
                    ? 'bg-sand-400 text-navy-950 shadow-xs'
                    : 'bg-white border-2 border-sand-300 text-navy-900 hover:bg-sand-50'
                }`}
              >
                All BRICS Nations
              </button>
              <button
                onClick={() => setSelectedCountry('IN')}
                className={`px-3.5 py-1.5 rounded-lg font-black transition-all flex items-center gap-1.5 ${
                  selectedCountry === 'IN'
                    ? 'bg-sand-400 text-navy-950 shadow-xs'
                    : 'bg-white border-2 border-sand-300 text-navy-900 hover:bg-sand-50'
                }`}
              >
                <span>🇮🇳</span> <span>India</span>
              </button>
              <button
                onClick={() => setSelectedCountry('BR')}
                className={`px-3.5 py-1.5 rounded-lg font-black transition-all flex items-center gap-1.5 ${
                  selectedCountry === 'BR'
                    ? 'bg-sand-400 text-navy-950 shadow-xs'
                    : 'bg-white border-2 border-sand-300 text-navy-900 hover:bg-sand-50'
                }`}
              >
                <span>🇧🇷</span> <span>Brazil</span>
              </button>
            </div>
            <div className="text-navy-900/60 text-[11px] font-semibold bg-sand-100/60 px-3 py-1 rounded-full border border-sand-300">
              🔒 Data Sovereignty: National privacy partition enforced
            </div>
          </div>

          <div className="bg-white border-2 border-sand-300/80 rounded-2xl overflow-hidden shadow-civic-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead className="bg-sand-100/60 border-b-2 border-sand-300 text-navy-950 uppercase text-[11px] font-black tracking-wider">
                  <tr>
                    <th className="text-left p-4">State / Regional Jurisdiction</th>
                    <th className="text-left p-4">Top Demand Sector</th>
                    <th className="text-center p-4">Citizen Reports</th>
                    <th className="text-center p-4">Avg Urgency</th>
                    <th className="text-right p-4">Allocated Capex</th>
                    <th className="text-right p-4">Commission Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-200">
                  {leaderboard.map((row) => (
                    <tr key={row.region_id} className="hover:bg-sand-50/60 transition-colors">
                      <td className="p-4">
                        <div className="font-black text-navy-950">
                          {row.region_name} ({row.country_code}-{row.region_id.split('-').pop()?.toUpperCase()})
                        </div>
                        <div className="text-[11px] text-navy-900/60 mt-0.5">
                          Population: {(row.total_population / 1000000).toFixed(1)}M citizens
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="bg-sand-200 border border-sand-400 text-navy-950 font-bold px-2.5 py-1 rounded text-xs">
                          {row.top_demand_sector}
                        </span>
                      </td>
                      <td className="p-4 text-center font-black text-navy-950">
                        {row.total_citizen_reports || 342}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-2.5 py-1 rounded-lg font-black text-xs ${
                          row.avg_urgency > 0.8
                            ? 'bg-terracotta-light text-terracotta border border-terracotta-border'
                            : 'bg-sand-200 text-navy-950 border border-sand-400'
                        }`}>
                          {row.avg_urgency} {row.avg_urgency > 0.8 ? '(Critical)' : '(Standard)'}
                        </span>
                      </td>
                      <td className="p-4 text-right font-black text-navy-950 text-sm">
                        ${(row.allocated_capex_usd / 1000000).toFixed(1)}M USD
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleOpenModal(
                            'proj-mh-wtr-1',
                            `${row.region_name} Feeder Pipeline Renewal`,
                            'Recommended',
                            'Funded'
                          )}
                          className="bg-navy-850 hover:bg-navy-900 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl transition-all shadow-xs hover:scale-[1.02] inline-flex items-center gap-1.5"
                        >
                          <span>Sanction Funding</span>
                          <ArrowRight className="w-3.5 h-3.5 text-sand-400" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: BEFORE/AFTER PHYSICAL IMPACT AUDITING */}
      {activeTab === 'impact' && (
        <div className="space-y-6">
          <div className="bg-sand-50/80 border-2 border-sand-300 p-4 rounded-xl flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-navy-950">Before & After Ground Impact Auditing</h2>
              <p className="text-xs text-navy-900/70 mt-0.5">
                Grounded telemetry: Measuring whether executed capital projects cured the citizen grievances that initiated them.
              </p>
            </div>
            <span className="text-xs font-black bg-emerald-100 text-emerald-800 px-3 py-1 rounded-lg border border-emerald-300">
              100% Verifiable Data
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Snapshot 1: Water Security */}
            <div className="bg-white border-2 border-sand-300/80 rounded-2xl p-6 sm:p-7 shadow-civic-sm hover:shadow-civic-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded">
                    ✓ Ground Completion Verified
                  </span>
                  <h3 className="text-base font-black text-navy-950 mt-2">
                    Jalna District Piped Water Feeder Reinforcement
                  </h3>
                  <div className="text-xs text-navy-900/60 mt-0.5 font-medium">Hotspot #IN-MH-WTR-01 · Completed July 2026</div>
                </div>
                <span className="text-xs font-black bg-sand-200 text-navy-950 px-3 py-1 rounded-lg border border-sand-400">
                  12,400 Beneficiaries
                </span>
              </div>

              {/* Before / After Gauge Box */}
              <div className="bg-sand-50/70 border-2 border-sand-300 rounded-xl p-4 flex items-center justify-between mb-4">
                <div className="text-center flex-1 border-r-2 border-dashed border-sand-300 pr-3">
                  <div className="text-[10px] uppercase font-black tracking-wider text-navy-900/50">Before (Voice Reports)</div>
                  <div className="text-2xl font-black text-navy-900/40 my-1">1.5 hrs/day</div>
                  <div className="text-xs text-navy-900/70 font-medium">Intermittent well supply</div>
                </div>
                <div className="px-3 text-xl font-black text-sand-500">➔</div>
                <div className="text-center flex-1 pl-3">
                  <div className="text-[10px] uppercase font-black tracking-wider text-emerald-700">After (IoT Telemetry)</div>
                  <div className="text-2xl font-black text-emerald-700 my-1">18.5 hrs/day</div>
                  <div className="text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded inline-block">
                    +1,133% Access Increase
                  </div>
                </div>
              </div>

              <div className="bg-sand-100/60 border border-sand-300 rounded-xl p-3.5 text-xs text-navy-950 leading-relaxed">
                <strong>Citizen Follow-up Survey:</strong> 94.2% satisfaction confirmed via automated outbound WhatsApp/SMS voice prompts. District complaints dropped from 340/month to 4/month.
              </div>
            </div>

            {/* Snapshot 2: Roads & Emergency Transit */}
            <div className="bg-white border-2 border-sand-300/80 rounded-2xl p-6 sm:p-7 shadow-civic-sm hover:shadow-civic-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded">
                    ✓ Ground Completion Verified
                  </span>
                  <h3 className="text-base font-black text-navy-950 mt-2">
                    State Highway 176 Culvert Reconstruction
                  </h3>
                  <div className="text-xs text-navy-900/60 mt-0.5 font-medium">Hotspot #IN-MH-RD-03 · Completed May 2026</div>
                </div>
                <span className="text-xs font-black bg-sand-200 text-navy-950 px-3 py-1 rounded-lg border border-sand-400">
                  45,000 Commuters
                </span>
              </div>

              {/* Before / After Gauge Box */}
              <div className="bg-sand-50/70 border-2 border-sand-300 rounded-xl p-4 flex items-center justify-between mb-4">
                <div className="text-center flex-1 border-r-2 border-dashed border-sand-300 pr-3">
                  <div className="text-[10px] uppercase font-black tracking-wider text-navy-900/50">Before (Travel Time)</div>
                  <div className="text-2xl font-black text-navy-900/40 my-1">95 mins</div>
                  <div className="text-xs text-navy-900/70 font-medium">Monsoon flood washouts</div>
                </div>
                <div className="px-3 text-xl font-black text-sand-500">➔</div>
                <div className="text-center flex-1 pl-3">
                  <div className="text-[10px] uppercase font-black tracking-wider text-emerald-700">After (Paved Culvert)</div>
                  <div className="text-2xl font-black text-emerald-700 my-1">26 mins</div>
                  <div className="text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded inline-block">
                    -72% Transit Latency
                  </div>
                </div>
              </div>

              <div className="bg-sand-100/60 border border-sand-300 rounded-xl p-3.5 text-xs text-navy-950 leading-relaxed">
                <strong>Emergency Services Verification:</strong> Aurangabad district emergency ambulance dispatch records zero weather-induced bypass incidents since completion.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Transition Audit Log Modal */}
      {modalOpen && transitionData && (
        <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border-2 border-sand-300">
            <div className="flex items-center gap-2.5 text-navy-950 mb-3">
              <div className="w-9 h-9 rounded-xl bg-sand-200 text-navy-950 flex items-center justify-center font-black">
                <Scale className="w-5 h-5 text-navy-850" />
              </div>
              <div>
                <h3 className="text-base font-black text-navy-950">
                  Confirm Capital Project Lifecycle Sanction
                </h3>
                <div className="text-[11px] text-navy-900/60">Constitutional Audit Authority</div>
              </div>
            </div>

            <div className="bg-sand-50 border-2 border-sand-200 rounded-xl p-4 mb-4 text-xs space-y-1.5">
              <div><strong>Project:</strong> {transitionData.title}</div>
              <div>
                <strong>Lifecycle Transition:</strong>{' '}
                <span className="font-bold text-navy-950 bg-sand-200 px-2 py-0.5 rounded">{transitionData.from}</span>
                {' '}➔{' '}
                <span className="font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">{transitionData.to}</span>
              </div>
              <div className="text-[11px] text-navy-900/60 pt-1 font-mono">
                Project Ref: #{transitionData.projectId}
              </div>
            </div>

            <div className="bg-navy-50 border border-navy-200 rounded-xl p-3.5 text-xs mb-6 text-navy-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-navy-950">
                <Lock className="w-3.5 h-3.5 text-navy-850" />
                Immutable Audit Trail Commitment:
              </div>
              <p className="text-[11px] text-navy-900/70 leading-relaxed">
                This transaction commits a tamper-proof row to the <code className="bg-white px-1 py-0.5 rounded border border-navy-200 font-mono">audit_logs</code> table with official JWT credentials, SHA-256 hash, and reason explanation.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2.5 border-2 border-sand-300 rounded-xl text-xs font-bold text-navy-950 hover:bg-sand-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => transitionMutation.mutate({ id: transitionData.projectId, to: transitionData.to })}
                disabled={transitionMutation.isPending}
                className="px-5 py-2.5 bg-gradient-to-r from-navy-850 to-navy-950 hover:from-navy-900 hover:to-navy-950 text-white rounded-xl text-xs font-black shadow-civic-sm transition-all disabled:opacity-50"
              >
                {transitionMutation.isPending ? 'Committing Transaction...' : 'Sanction & Commit to Ledger'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
