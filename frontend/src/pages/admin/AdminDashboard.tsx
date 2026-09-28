import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, RegionComparison, ImpactSnapshot } from '../../lib/api';
import { useAuthStore } from '../../store/useAuthStore';
import { useLangStore } from '../../store/useLangStore';
import {
  Download, FileCheck2, ArrowRight, CheckCircle2,
  Activity, Globe, TrendingUp, ShieldAlert
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
  const { data: snapshots = [], isLoading: isLoadingSnapshots } = useQuery({
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
      alert(`Status transitioned to "${transitionData?.to}"! Immutable row logged in audit_logs table.`);
    }
  });

  const handleOpenModal = (projectId: string, title: string, from: string, to: string) => {
    setTransitionData({ projectId, title, from, to });
    setModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Commission Banner */}
      <div className="bg-gradient-to-r from-white via-sand-50 to-white border border-civic-border rounded-xl p-6 sm:p-8 mb-8 shadow-civic-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-navy-850 bg-sand-200 border border-sand-400 px-2.5 py-0.5 rounded-full mb-1.5">
            ⚖️ Federal Command & BRICS Allocation
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-navy-950">
            BRICS National Infrastructure Allocation & Impact Audit
          </h1>
          <p className="text-xs text-navy-900/70 mt-1 max-w-xl">
            Federated data model: Monitoring demand equity, project lifecycle audit logs, and verifiable ground metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="http://localhost:8000/api/v1/public/hotspots"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 bg-white border border-civic-border text-navy-950 font-bold text-xs py-2 px-3.5 rounded-lg hover:bg-sand-50 transition-all shadow-xs"
          >
            <Download className="w-3.5 h-3.5" /> Open Data API
          </a>
          <button
            onClick={() => alert("Generating full BRICS capital allocations dossier (PDF/JSON)...")}
            className="inline-flex items-center gap-1.5 bg-navy-850 text-white font-bold text-xs py-2 px-3.5 rounded-lg hover:bg-navy-800 transition-all shadow-civic-xs"
          >
            <FileCheck2 className="w-3.5 h-3.5" /> Generate Audit Dossier
          </button>
        </div>
      </div>

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-civic-border rounded-xl p-5 shadow-civic-xs">
          <div className="text-[11px] font-bold uppercase text-navy-900/60">Monitored Regions</div>
          <div className="text-2xl font-extrabold text-navy-950 my-1">28 Regions</div>
          <div className="text-[11px] text-navy-900/50">India (18) · Brazil (6) · South Africa (4)</div>
        </div>

        <div className="bg-white border border-civic-border rounded-xl p-5 shadow-civic-xs">
          <div className="text-[11px] font-bold uppercase text-navy-900/60">Active Demand Hotspots</div>
          <div className="text-2xl font-extrabold text-navy-950 my-1">842 Hotspots</div>
          <div className="text-[11px] text-navy-900/50">Clustered from 148,240 citizen inputs</div>
        </div>

        <div className="bg-white border border-civic-border rounded-xl p-5 shadow-civic-xs">
          <div className="text-[11px] font-bold uppercase text-navy-900/60">Allocated Capital</div>
          <div className="text-2xl font-extrabold text-navy-950 my-1">$482.4M</div>
          <div className="text-[11px] text-navy-900/50">62.4% Capital deployment rate</div>
        </div>

        <div className="bg-white border border-civic-border rounded-xl p-5 shadow-civic-xs">
          <div className="text-[11px] font-bold uppercase text-navy-900/60">Completed & Audited</div>
          <div className="text-2xl font-extrabold text-navy-950 my-1">114 Projects</div>
          <div className="text-[11px] text-civic-emerald font-semibold">100% verified with sensor & citizen feedback</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#EAE6DE] p-1 rounded-xl mb-6 border border-civic-border">
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
            activeTab === 'leaderboard'
              ? 'bg-white text-navy-850 shadow-civic-xs'
              : 'text-navy-900/70 hover:text-navy-950'
          }`}
        >
          📊 {t('leaderboard_tab')}
        </button>
        <button
          onClick={() => setActiveTab('impact')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
            activeTab === 'impact'
              ? 'bg-white text-navy-850 shadow-civic-xs'
              : 'text-navy-900/70 hover:text-navy-950'
          }`}
        >
          📈 {t('impact_tab')}
        </button>
      </div>

      {/* VIEW 1: CROSS-REGION LEADERBOARD */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs">
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedCountry('all')}
                className={`px-3 py-1 rounded font-bold transition-all ${
                  selectedCountry === 'all' ? 'bg-sand-400 text-navy-950' : 'bg-white border border-civic-border text-navy-900/70'
                }`}
              >
                All BRICS
              </button>
              <button
                onClick={() => setSelectedCountry('IN')}
                className={`px-3 py-1 rounded font-bold transition-all ${
                  selectedCountry === 'IN' ? 'bg-sand-400 text-navy-950' : 'bg-white border border-civic-border text-navy-900/70'
                }`}
              >
                🇮🇳 India
              </button>
              <button
                onClick={() => setSelectedCountry('BR')}
                className={`px-3 py-1 rounded font-bold transition-all ${
                  selectedCountry === 'BR' ? 'bg-sand-400 text-navy-950' : 'bg-white border border-civic-border text-navy-900/70'
                }`}
              >
                🇧🇷 Brazil
              </button>
            </div>
            <div className="text-navy-900/60 text-[11px]">
              Data Sovereignty: Country-level sharded architecture enforced
            </div>
          </div>

          <div className="bg-white border border-civic-border rounded-xl overflow-hidden shadow-civic-xs">
            <table className="w-full text-xs">
              <thead className="bg-navy-50/70 border-b border-civic-border text-navy-950 uppercase text-[10.5px] font-extrabold tracking-wider">
                <tr>
                  <th className="text-left p-4">Region / Jurisdiction</th>
                  <th className="text-left p-4">Top Demand Sector</th>
                  <th className="text-center p-4">Citizen Reports</th>
                  <th className="text-center p-4">Avg Urgency</th>
                  <th className="text-right p-4">Allocated Capex</th>
                  <th className="text-right p-4">Lifecycle Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-civic-border/70">
                {leaderboard.map((row) => (
                  <tr key={row.region_id} className="hover:bg-sand-50/50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-navy-950">
                        {row.region_name} ({row.country_code}-{row.region_id.split('-').pop()?.toUpperCase()})
                      </div>
                      <div className="text-[11px] text-navy-900/60">
                        Population: {(row.total_population / 1000000).toFixed(1)}M residents
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="bg-sand-200 border border-sand-400 text-navy-950 font-semibold px-2 py-0.5 rounded text-[11px]">
                        {row.top_demand_sector}
                      </span>
                    </td>
                    <td className="p-4 text-center font-bold text-navy-950">
                      {row.total_citizen_reports || 342}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-0.5 rounded font-extrabold text-[10.5px] ${
                        row.avg_urgency > 0.8
                          ? 'bg-terracotta-light text-terracotta border border-terracotta-border'
                          : 'bg-sand-200 text-navy-950 border border-sand-400'
                      }`}>
                        {row.avg_urgency} {row.avg_urgency > 0.8 ? '(Critical)' : '(Standard)'}
                      </span>
                    </td>
                    <td className="p-4 text-right font-extrabold text-navy-950">
                      ${(row.allocated_capex_usd / 1000000).toFixed(1)}M
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleOpenModal(
                          'proj-mh-wtr-1',
                          `${row.region_name} Feeder Pipeline Renewal`,
                          'Recommended',
                          'Funded'
                        )}
                        className="bg-navy-850 hover:bg-navy-800 text-white font-bold text-[11px] px-3 py-1.5 rounded transition-all shadow-xs"
                      >
                        Transition: Mark "Funded" →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: BEFORE/AFTER IMPACT TRACKER */}
      {activeTab === 'impact' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-base font-bold text-navy-950">Before & After Physical Impact Tracking</h2>
            <p className="text-xs text-navy-900/70 mt-0.5">
              Grounded validation: Measuring whether capital expenditures actually cured the citizen demand hotspots that initiated them.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Snapshot 1: Water Access */}
            <div className="bg-white border border-civic-border rounded-xl p-6 shadow-civic-xs">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[10px] font-extrabold bg-civic-emerald/10 text-civic-emerald border border-civic-emerald/30 px-2 py-0.5 rounded">
                    Completed & Verified
                  </span>
                  <h3 className="text-sm font-bold text-navy-950 mt-1.5">
                    Jalna District Piped Water Feeder Reinforcement
                  </h3>
                  <div className="text-[11px] text-navy-900/60">Hotspot #IN-MH-WTR-01 · Completed July 2026</div>
                </div>
                <span className="text-[11px] font-bold bg-navy-50 text-navy-850 px-2.5 py-0.5 rounded border border-navy-200">
                  12,400 Residents
                </span>
              </div>

              <div className="bg-civic-bg border border-civic-border rounded-lg p-4 flex items-center justify-between mb-4">
                <div className="text-center flex-1 border-r border-dashed border-civic-border pr-2">
                  <div className="text-[10px] uppercase font-bold text-navy-900/50">Before (Complaints)</div>
                  <div className="text-xl font-extrabold text-navy-900/50 my-0.5">1.5 hrs/day</div>
                  <div className="text-[11px] text-navy-900/70">Intermittent well supply</div>
                </div>
                <div className="px-3 text-lg font-bold text-navy-850">➔</div>
                <div className="text-center flex-1 pl-2">
                  <div className="text-[10px] uppercase font-bold text-navy-900/50">After (IoT Verified)</div>
                  <div className="text-2xl font-extrabold text-civic-emerald my-0.5">18.5 hrs/day</div>
                  <div className="text-[11px] font-bold text-civic-emerald">+1,133% Clean Water Access</div>
                </div>
              </div>

              <div className="bg-sand-50 border border-sand-300 rounded-lg p-3 text-xs text-navy-900/80">
                💬 <strong>Citizen Sentiment Confirmation:</strong> Follow-up survey via SMS verified 94.2% satisfaction. Citizen grievance volume in ward dropped from 340/month to 4/month.
              </div>
            </div>

            {/* Snapshot 2: Roads & Emergency Transit */}
            <div className="bg-white border border-civic-border rounded-xl p-6 shadow-civic-xs">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[10px] font-extrabold bg-civic-emerald/10 text-civic-emerald border border-civic-emerald/30 px-2 py-0.5 rounded">
                    Completed & Verified
                  </span>
                  <h3 className="text-sm font-bold text-navy-950 mt-1.5">
                    State Highway 176 Culvert Reconstruction
                  </h3>
                  <div className="text-[11px] text-navy-900/60">Hotspot #IN-MH-RD-03 · Completed May 2026</div>
                </div>
                <span className="text-[11px] font-bold bg-navy-50 text-navy-850 px-2.5 py-0.5 rounded border border-navy-200">
                  45,000 Commuters
                </span>
              </div>

              <div className="bg-civic-bg border border-civic-border rounded-lg p-4 flex items-center justify-between mb-4">
                <div className="text-center flex-1 border-r border-dashed border-civic-border pr-2">
                  <div className="text-[10px] uppercase font-bold text-navy-900/50">Before (Travel Time)</div>
                  <div className="text-xl font-extrabold text-navy-900/50 my-0.5">95 mins</div>
                  <div className="text-[11px] text-navy-900/70">Monsoon washouts</div>
                </div>
                <div className="px-3 text-lg font-bold text-navy-850">➔</div>
                <div className="text-center flex-1 pl-2">
                  <div className="text-[10px] uppercase font-bold text-navy-900/50">After (Paved All-Weather)</div>
                  <div className="text-2xl font-extrabold text-civic-emerald my-0.5">26 mins</div>
                  <div className="text-[11px] font-bold text-civic-emerald">-72% Ambulance Transit Time</div>
                </div>
              </div>

              <div className="bg-sand-50 border border-sand-300 rounded-lg p-3 text-xs text-navy-900/80">
                🚑 <strong>Healthcare Delivery:</strong> District ambulance dispatch reports zero impassable weather incidents since bridge inauguration.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Transition Audit Log Modal */}
      {modalOpen && transitionData && (
        <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-civic-lg border border-civic-border">
            <h3 className="text-base font-bold text-navy-950 mb-2">
              Confirm Capital Project Status Transition
            </h3>
            <p className="text-xs text-navy-900/70 mb-4">
              <strong>Project:</strong> {transitionData.title}<br />
              <strong>Transition:</strong> <span className="font-bold text-navy-950">{transitionData.from}</span> ➔ <span className="font-bold text-civic-emerald">{transitionData.to}</span>
            </p>

            <div className="bg-sand-50 border border-sand-400 rounded-lg p-3 text-xs mb-5">
              <strong>Audit Trail Notice:</strong> This action will be permanently logged in <code>audit_logs</code> table with Actor ID, timestamp, and JSON delta for transparency.
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 border border-civic-border rounded-lg text-xs font-semibold text-navy-950 hover:bg-sand-50"
              >
                Cancel
              </button>
              <button
                onClick={() => transitionMutation.mutate({ id: transitionData.projectId, to: transitionData.to })}
                disabled={transitionMutation.isPending}
                className="px-4 py-2 bg-navy-850 hover:bg-navy-800 text-white rounded-lg text-xs font-bold shadow-civic-xs disabled:opacity-50"
              >
                {transitionMutation.isPending ? 'Committing...' : 'Confirm & Commit to Audit Log'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
