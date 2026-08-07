import React, { useState, useEffect } from 'react';
import {
  History, RefreshCw, AlertTriangle, Search, Filter,
  CheckCircle2, XCircle, Pencil, Trash2, PlusCircle,
  Shield, Database, ChevronLeft, ChevronRight
} from 'lucide-react';
import { auditApi } from '../lib/api';
import type { AuditLog } from '../lib/api';

// ── Helpers ────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  if (m > 0) return `${m}m ago`;
  return 'just now';
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const ACTION_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  recommendation_approved: { icon: <CheckCircle2 size={14} />, color: 'text-green-600 bg-green-50', label: 'Approved' },
  recommendation_rejected: { icon: <XCircle size={14} />, color: 'text-red-600 bg-red-50', label: 'Rejected' },
  incident_created: { icon: <PlusCircle size={14} />, color: 'text-blue-600 bg-blue-50', label: 'Created' },
  incident_updated: { icon: <Pencil size={14} />, color: 'text-amber-600 bg-amber-50', label: 'Updated' },
  incident_deleted: { icon: <Trash2 size={14} />, color: 'text-red-600 bg-red-50', label: 'Deleted' },
  resource_deployed: { icon: <Shield size={14} />, color: 'text-purple-600 bg-purple-50', label: 'Deployed' },
  resource_returned: { icon: <Shield size={14} />, color: 'text-slate-600 bg-slate-50', label: 'Returned' },
  simulation_started: { icon: <Database size={14} />, color: 'text-cyan-600 bg-cyan-50', label: 'Sim Started' },
  simulation_stopped: { icon: <Database size={14} />, color: 'text-slate-600 bg-slate-50', label: 'Sim Stopped' },
};

const ENTITY_ICONS: Record<string, React.ReactNode> = {
  recommendation: <Shield size={13} />,
  incident: <AlertTriangle size={13} />,
  resource: <Database size={13} />,
  simulation: <Database size={13} />,
};

// ── Mock Data ──────────────────────────────────────────────────────────────

const MOCK_LOGS: AuditLog[] = [
  { id: 1, action: 'recommendation_approved', entity_type: 'recommendation', entity_id: 4, performed_by: 'commander.rajan@resqverse', details: { recommendation_id: 4, agent: 'RouteAgent' }, created_at: new Date(Date.now() - 1_800_000).toISOString() },
  { id: 2, action: 'recommendation_rejected', entity_type: 'recommendation', entity_id: 5, performed_by: 'commander.rajan@resqverse', details: { reason: 'Awaiting meteorological confirmation', agent: 'EvacuationAgent' }, created_at: new Date(Date.now() - 900_000).toISOString() },
  { id: 3, action: 'incident_created', entity_type: 'incident', entity_id: 5, performed_by: 'ops.meena@resqverse', details: { title: 'Anna Nagar Building Fire', severity: 'high' }, created_at: new Date(Date.now() - 900_000).toISOString() },
  { id: 4, action: 'incident_updated', entity_type: 'incident', entity_id: 3, performed_by: 'ops.vignesh@resqverse', details: { status: 'monitoring', previous_status: 'active' }, created_at: new Date(Date.now() - 3_600_000).toISOString() },
  { id: 5, action: 'resource_deployed', entity_type: 'resource', entity_id: 1, performed_by: 'ops.priya@resqverse', details: { resource: 'Ambulance Unit 01', incident_id: 1 }, created_at: new Date(Date.now() - 5_400_000).toISOString() },
  { id: 6, action: 'simulation_started', entity_type: 'simulation', entity_id: 1, performed_by: 'analyst.arjun@resqverse', details: { scenario: 'Flood Chennai', severity: 8 }, created_at: new Date(Date.now() - 7_200_000).toISOString() },
  { id: 7, action: 'simulation_stopped', entity_type: 'simulation', entity_id: 1, performed_by: 'analyst.arjun@resqverse', details: { scenario: 'Flood Chennai', duration_s: 480 }, created_at: new Date(Date.now() - 3_600_000).toISOString() },
  { id: 8, action: 'recommendation_approved', entity_type: 'recommendation', entity_id: 2, performed_by: 'commander.rajan@resqverse', details: { recommendation_id: 2, agent: 'ResourceAgent' }, created_at: new Date(Date.now() - 9_000_000).toISOString() },
  { id: 9, action: 'incident_created', entity_type: 'incident', entity_id: 4, performed_by: 'ops.divya@resqverse', details: { title: 'Marina Cyclone Alert', severity: 'medium' }, created_at: new Date(Date.now() - 18_000_000).toISOString() },
  { id: 10, action: 'resource_returned', entity_type: 'resource', entity_id: 3, performed_by: 'ops.priya@resqverse', details: { resource: 'Rescue Boat RB-7', incident_id: 1 }, created_at: new Date(Date.now() - 21_600_000).toISOString() },
  { id: 11, action: 'incident_updated', entity_type: 'incident', entity_id: 6, performed_by: 'ops.vignesh@resqverse', details: { status: 'resolved' }, created_at: new Date(Date.now() - 86_400_000).toISOString() },
  { id: 12, action: 'recommendation_rejected', entity_type: 'recommendation', entity_id: 1, performed_by: 'commander.rajan@resqverse', details: { reason: 'Insufficient data', agent: 'EvacuationAgent' }, created_at: new Date(Date.now() - 86_400_000 * 1.5).toISOString() },
];

const PAGE_SIZE = 8;
const ACTION_TYPE_OPTIONS = ['all', 'recommendation_approved', 'recommendation_rejected', 'incident_created', 'incident_updated', 'resource_deployed', 'resource_returned', 'simulation_started', 'simulation_stopped'];
const ENTITY_OPTIONS = ['all', 'recommendation', 'incident', 'resource', 'simulation'];

// ── Main Component ─────────────────────────────────────────────────────────

export function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [entityFilter, setEntityFilter] = useState('all');
  const [page, setPage] = useState(1);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await auditApi.list();
      setLogs(data);
      setOffline(false);
    } catch {
      setLogs(MOCK_LOGS);
      setOffline(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // Reset page on filter change
  useEffect(() => { setPage(1); }, [search, actionFilter, entityFilter]);

  const filtered = logs.filter(l => {
    const q = search.toLowerCase();
    const matchSearch = !q || l.action.includes(q) || l.performed_by.toLowerCase().includes(q) || l.entity_type.includes(q);
    const matchAction = actionFilter === 'all' || l.action === actionFilter;
    const matchEntity = entityFilter === 'all' || l.entity_type === entityFilter;
    return matchSearch && matchAction && matchEntity;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Audit Log</h2>
          <p className="text-sm text-slate-500 mt-0.5">{filtered.length} system actions recorded</p>
        </div>
        <button onClick={loadData} className="flex items-center gap-2 px-3 py-2 text-sm bg-primary text-white rounded-lg hover:bg-blue-700">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {offline && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
          <AlertTriangle size={14} /> Backend offline — showing simulated data
        </div>
      )}

      {/* Info */}
      <div className="bg-blue-50 border border-blue-100 text-blue-800 px-4 py-2.5 rounded-xl text-sm flex items-center gap-2">
        <History size={15} />
        <span>All operator actions, AI approvals, and system events are recorded here and cannot be modified.</span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by action, user, or entity…"
            className="w-full pl-8 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <Filter size={14} className="text-slate-400" />
        <select
          value={actionFilter}
          onChange={e => setActionFilter(e.target.value)}
          className="border border-slate-200 rounded-lg text-sm px-2 py-2 bg-white focus:outline-none"
        >
          {ACTION_TYPE_OPTIONS.map(o => (
            <option key={o} value={o}>
              {o === 'all' ? 'All Actions' : o.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </option>
          ))}
        </select>
        <select
          value={entityFilter}
          onChange={e => setEntityFilter(e.target.value)}
          className="border border-slate-200 rounded-lg text-sm px-2 py-2 bg-white focus:outline-none"
        >
          {ENTITY_OPTIONS.map(o => (
            <option key={o} value={o}>
              {o === 'all' ? 'All Entities' : o.charAt(0).toUpperCase() + o.slice(1) + 's'}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40"><RefreshCw size={24} className="animate-spin text-primary" /></div>
        ) : paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-400">
            <History size={32} className="mb-2" />
            <p className="text-sm">No log entries match your filters</p>
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Entity</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Performed By</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Details</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginated.map(log => {
                  const config = ACTION_CONFIG[log.action];
                  return (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config?.color ?? 'text-slate-600 bg-slate-50'}`}>
                          {config?.icon}
                          {config?.label ?? log.action.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          {ENTITY_ICONS[log.entity_type] ?? <Database size={13} />}
                          <span className="capitalize text-xs">{log.entity_type} #{log.entity_id}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold flex-shrink-0">
                            {log.performed_by.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-slate-700 text-xs truncate max-w-[140px]" title={log.performed_by}>{log.performed_by}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(log.details ?? {}).slice(0, 2).map(([k, v]) => (
                            <span key={k} className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                              {k}: {String(v).slice(0, 20)}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs text-slate-700 font-medium">{timeAgo(log.created_at)}</span>
                          <span className="text-xs text-slate-400">{formatDate(log.created_at)}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
              <span className="text-xs text-slate-400">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} entries
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${p === page ? 'bg-primary text-white' : 'hover:bg-slate-100 text-slate-600'}`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
