import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2, XCircle, Clock, Zap, RefreshCw, AlertTriangle,
  Brain, Shield, ChevronDown, ChevronUp, User
} from 'lucide-react';
import { recommendationsApi } from '../lib/api';
import type { AgentRecommendation } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

// ── Helpers ────────────────────────────────────────────────────────────────

const RISK_STYLES: Record<string, string> = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-red-100 text-red-700',
};

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-slate-100 text-slate-600',
};

function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color = pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-slate-500 w-8 text-right">{pct}%</span>
    </div>
  );
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 0) return `${h}h ago`;
  if (m > 0) return `${m}m ago`;
  return 'just now';
}

// ── Mock Data ──────────────────────────────────────────────────────────────

const MOCK_RECS: AgentRecommendation[] = [
  { id: 1, agent_name: 'EvacuationAgent', incident_id: 1, recommendation: 'Deploy 3 additional NDRF teams to Adyar zone 2 for immediate evacuation of low-lying residential areas.', reasoning: 'Water levels at 4.2m exceed safe threshold. 2,400 residents in flood path. Current deployment insufficient based on population density mapping.', confidence: 0.91, risk_level: 'high', data_used: { water_level: '4.2m', residents: 2400 }, requires_human_approval: true, status: 'pending', approved_by: undefined, approved_at: undefined, created_at: new Date(Date.now() - 600_000).toISOString() },
  { id: 2, agent_name: 'ResourceAgent', incident_id: 1, recommendation: 'Pre-position 500 water purification tablets and 200 food packs at Adyar Community Center as primary shelter overflow site.', reasoning: 'Shelter capacity at 82% with projected 40% rise in next 6h. Community center can absorb 300 additional evacuees.', confidence: 0.87, risk_level: 'medium', data_used: { shelter_pct: 82, projected_rise: 40 }, requires_human_approval: true, status: 'pending', approved_by: undefined, approved_at: undefined, created_at: new Date(Date.now() - 1_200_000).toISOString() },
  { id: 3, agent_name: 'MedicalAgent', incident_id: 2, recommendation: 'Establish forward medical post at Tambaram bus terminus to triage earthquake-injured residents within 500m of epicenter.', reasoning: 'Hospital distance 8km. Structural damage in 12 buildings. Estimated 40-60 injuries requiring immediate triage.', confidence: 0.78, risk_level: 'high', data_used: { hospitals_nearby: 1, estimated_injuries: 50 }, requires_human_approval: true, status: 'pending', approved_by: undefined, approved_at: undefined, created_at: new Date(Date.now() - 2_700_000).toISOString() },
  { id: 4, agent_name: 'RouteAgent', incident_id: 1, recommendation: 'Redirect NH-32 traffic via Velachery bypass; current Adyar bridge is at structural risk due to water pressure.', reasoning: 'Sensor data shows 95kN load variance. Bridge was built in 1974, below modern flood tolerance specifications.', confidence: 0.95, risk_level: 'high', data_used: { sensor_reading: '95kN' }, requires_human_approval: true, status: 'approved', approved_by: 'Commander Rajan', approved_at: new Date(Date.now() - 1_800_000).toISOString(), created_at: new Date(Date.now() - 3_600_000).toISOString() },
  { id: 5, agent_name: 'EvacuationAgent', incident_id: 3, recommendation: 'Issue shelter-in-place advisory for 1km radius around Sholinganallur plant. Distribute protective masks.', reasoning: 'Wind direction moving chemical plume toward densely populated IT corridor. Air quality index critical.', confidence: 0.83, risk_level: 'medium', data_used: { aqi: 'critical', wind_direction: 'NNE' }, requires_human_approval: true, status: 'rejected', approved_by: 'Commander Rajan', approved_at: new Date(Date.now() - 900_000).toISOString(), created_at: new Date(Date.now() - 7_200_000).toISOString() },
];

// ── Approval Card ──────────────────────────────────────────────────────────

interface ApprovalCardProps {
  rec: AgentRecommendation;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  processing: number | null;
}

function ApprovalCard({ rec, onApprove, onReject, processing }: ApprovalCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isProcessing = processing === rec.id;

  return (
    <div className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow overflow-hidden ${rec.status === 'pending' ? 'border-amber-200' : rec.status === 'approved' ? 'border-green-200' : 'border-slate-200'}`}>
      {/* Status accent bar */}
      <div className={`h-1 w-full ${rec.status === 'pending' ? 'bg-amber-400' : rec.status === 'approved' ? 'bg-green-500' : 'bg-slate-300'}`} />

      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 bg-purple-50 text-purple-700 text-xs font-semibold px-2 py-1 rounded-lg">
              <Brain size={12} />
              {rec.agent_name}
            </div>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${RISK_STYLES[rec.risk_level] ?? 'bg-slate-100 text-slate-500'}`}>
              {rec.risk_level} risk
            </span>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_STYLES[rec.status]}`}>
              {rec.status === 'pending' ? <><Clock size={10} className="inline mr-1" />Pending</>
                : rec.status === 'approved' ? <><CheckCircle2 size={10} className="inline mr-1" />Approved</>
                : <><XCircle size={10} className="inline mr-1" />Rejected</>}
            </span>
            <span className="text-xs text-slate-400">Incident #{rec.incident_id}</span>
          </div>
          <span className="text-xs text-slate-400 whitespace-nowrap flex-shrink-0">{timeAgo(rec.created_at)}</span>
        </div>

        {/* Recommendation text */}
        <p className="mt-3 text-sm text-slate-800 leading-relaxed font-medium">{rec.recommendation}</p>

        {/* Confidence */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400">AI Confidence</span>
          </div>
          <ConfidenceBar value={rec.confidence} />
        </div>

        {/* Expand reasoning */}
        <button
          onClick={() => setExpanded(e => !e)}
          className="flex items-center gap-1 text-xs text-primary mt-2 hover:underline"
        >
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          {expanded ? 'Hide' : 'Show'} reasoning & data
        </button>

        {expanded && (
          <div className="mt-2 bg-slate-50 rounded-lg p-3 space-y-2">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Reasoning</p>
              <p className="text-xs text-slate-700 leading-relaxed">{rec.reasoning}</p>
            </div>
            {rec.data_used && Object.keys(rec.data_used).length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Data Used</p>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(rec.data_used).map(([k, v]) => (
                    <span key={k} className="text-xs bg-white border border-slate-200 rounded px-2 py-0.5 font-mono">
                      {k}: <span className="font-semibold">{String(v)}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Approved/Rejected by */}
        {(rec.status === 'approved' || rec.status === 'rejected') && rec.approved_by && (
          <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-400">
            <User size={11} />
            <span>{rec.status === 'approved' ? 'Approved' : 'Rejected'} by <span className="font-medium text-slate-600">{rec.approved_by}</span> · {rec.approved_at ? timeAgo(rec.approved_at) : ''}</span>
          </div>
        )}

        {/* Action buttons */}
        {rec.status === 'pending' && (
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={() => onApprove(rec.id)}
              disabled={isProcessing}
              id={`approve-${rec.id}`}
              className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              {isProcessing ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
              Approve
            </button>
            <button
              onClick={() => onReject(rec.id)}
              disabled={isProcessing}
              id={`reject-${rec.id}`}
              className="flex-1 flex items-center justify-center gap-2 py-2 bg-white border border-slate-200 hover:bg-red-50 hover:border-red-200 text-slate-700 hover:text-red-700 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              <XCircle size={14} />
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

type ApprovalTab = 'pending' | 'approved' | 'rejected';

export function ApprovalsPage() {
  const { user } = useAuth();
  const [allRecs, setAllRecs] = useState<AgentRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [tab, setTab] = useState<ApprovalTab>('pending');
  const [processing, setProcessing] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await recommendationsApi.list();
      setAllRecs(data);
      setOffline(false);
    } catch {
      setAllRecs(MOCK_RECS);
      setOffline(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleApprove = async (id: number) => {
    setProcessing(id);
    try {
      if (offline) {
        setAllRecs(prev => prev.map(r => r.id === id ? { ...r, status: 'approved', approved_by: user?.email ?? 'operator', approved_at: new Date().toISOString() } : r));
      } else {
        await recommendationsApi.approve(id, user?.email ?? 'operator');
        await loadData();
      }
      showToast('Recommendation approved successfully', 'success');
    } catch {
      showToast('Failed to approve recommendation', 'error');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (id: number) => {
    const reason = window.prompt('Enter rejection reason (optional):') ?? 'Overridden by command';
    if (reason === null) return; // user cancelled
    setProcessing(id);
    try {
      if (offline) {
        setAllRecs(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected', approved_by: user?.email ?? 'operator', approved_at: new Date().toISOString() } : r));
      } else {
        await recommendationsApi.reject(id, user?.email ?? 'operator', reason);
        await loadData();
      }
      showToast('Recommendation rejected', 'success');
    } catch {
      showToast('Failed to reject recommendation', 'error');
    } finally {
      setProcessing(null);
    }
  };

  const pending = allRecs.filter(r => r.status === 'pending');
  const approved = allRecs.filter(r => r.status === 'approved');
  const rejected = allRecs.filter(r => r.status === 'rejected');
  const displayed = tab === 'pending' ? pending : tab === 'approved' ? approved : rejected;

  const TABS: { key: ApprovalTab; label: string; icon: React.ReactNode; count: number; accent: string }[] = [
    { key: 'pending', label: 'Pending', icon: <Clock size={15} />, count: pending.length, accent: 'text-amber-600 border-amber-500' },
    { key: 'approved', label: 'Approved', icon: <CheckCircle2 size={15} />, count: approved.length, accent: 'text-green-600 border-green-500' },
    { key: 'rejected', label: 'Rejected', icon: <XCircle size={15} />, count: rejected.length, accent: 'text-slate-500 border-slate-400' },
  ];

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 transition-all ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">AI Approvals</h2>
          <p className="text-sm text-slate-500 mt-0.5">Human-in-the-loop review of AI agent recommendations</p>
        </div>
        <div className="flex items-center gap-3">
          {pending.length > 0 && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 px-3 py-1.5 rounded-lg text-sm font-medium">
              <Zap size={14} />
              {pending.length} awaiting review
            </div>
          )}
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-primary text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {offline && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
          <AlertTriangle size={14} /> Backend offline — changes will not persist
        </div>
      )}

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-100 text-blue-800 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
        <Shield size={16} className="mt-0.5 flex-shrink-0" />
        <p>All AI recommendations marked <strong>high risk</strong> or that involve resource deployment require explicit human approval before execution. Logged actions create an immutable audit trail.</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${tab === t.key ? `${t.accent} border-current` : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            {t.icon}
            {t.label}
            <span className={`text-xs rounded-full px-1.5 py-0.5 font-bold ${tab === t.key ? 'bg-current text-white' : 'bg-slate-100 text-slate-500'}`}
              style={tab === t.key ? { color: 'white' } : {}}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40"><RefreshCw size={24} className="animate-spin text-primary" /></div>
      ) : displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-slate-400">
          {tab === 'pending' ? <><Clock size={32} className="mb-2" /><p className="text-sm">No pending approvals — all clear ✓</p></> :
            tab === 'approved' ? <><CheckCircle2 size={32} className="mb-2" /><p className="text-sm">No approved recommendations yet</p></> :
            <><XCircle size={32} className="mb-2" /><p className="text-sm">No rejected recommendations</p></>}
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {displayed.map(rec => (
            <ApprovalCard
              key={rec.id}
              rec={rec}
              onApprove={handleApprove}
              onReject={handleReject}
              processing={processing}
            />
          ))}
        </div>
      )}
    </div>
  );
}
