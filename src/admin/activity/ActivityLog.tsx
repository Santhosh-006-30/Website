import React, { useState, useEffect, useCallback } from 'react';
import { 
  Activity, RefreshCw, Filter, Calendar, User, 
  ChevronLeft, ChevronRight, FileText, ChevronDown, ChevronUp 
} from 'lucide-react';
import { getAuditLogs } from '../../services/audit';
import type { AuditLog, AuditAction, AuditEntityType } from '../../types/supabase';
import { TableSkeleton } from '../shared/LoadingSpinner';
import { EmptyState } from '../shared/EmptyState';

const ACTION_COLORS: Record<AuditAction, { bg: string; text: string; border: string }> = {
  CREATE: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  PUBLISH: { bg: 'bg-emerald-500/15', text: 'text-emerald-300', border: 'border-emerald-500/30' },
  UPDATE: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  UPLOAD: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' },
  UNPUBLISH: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  ARCHIVE: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  DELETE: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
  DELETE_IMAGE: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
  ROLE_CHANGE: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  LOGIN: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' },
  LOGOUT: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' },
};

export const ActivityLog: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filters
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [entityFilter, setEntityFilter] = useState<string>('all');

  const pageSize = 15;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAuditLogs({
        page: currentPage,
        pageSize,
        action: actionFilter !== 'all' ? (actionFilter as AuditAction) : undefined,
        entityType: entityFilter !== 'all' ? (entityFilter as AuditEntityType) : undefined,
      });
      setLogs(res.data);
      setTotalCount(res.total);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, actionFilter, entityFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <Activity className="w-7 h-7 text-cyan-400" />
            Audit &amp; Activity Log
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Tamper-evident, chronological trail of all administrative actions and content modifications.
          </p>
        </div>

        <button
          onClick={() => fetchLogs()}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/60 rounded-xl text-sm font-medium transition-colors self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-md flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
          <Filter className="w-4 h-4 text-cyan-400" />
          Filter:
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-800 border border-slate-700/80 text-slate-200 text-sm rounded-xl px-3 py-2 outline-none focus:border-cyan-500 transition-colors"
          >
            <option value="all">All Actions</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
            <option value="PUBLISH">PUBLISH</option>
            <option value="UNPUBLISH">UNPUBLISH</option>
            <option value="ARCHIVE">ARCHIVE</option>
            <option value="UPLOAD">UPLOAD</option>
            <option value="DELETE_IMAGE">DELETE_IMAGE</option>
            <option value="ROLE_CHANGE">ROLE_CHANGE</option>
            <option value="LOGIN">LOGIN</option>
            <option value="LOGOUT">LOGOUT</option>
          </select>

          <select
            value={entityFilter}
            onChange={(e) => {
              setEntityFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-800 border border-slate-700/80 text-slate-200 text-sm rounded-xl px-3 py-2 outline-none focus:border-cyan-500 transition-colors"
          >
            <option value="all">All Entities</option>
            <option value="event">Event</option>
            <option value="post">Post</option>
            <option value="project">Project</option>
            <option value="gallery_album">Gallery Album</option>
            <option value="gallery_image">Gallery Image</option>
            <option value="team_member">Team Member</option>
            <option value="profile">User Profile</option>
            <option value="site_setting">Site Setting</option>
            <option value="session">Session</option>
            <option value="career">Career / Opportunity</option>
          </select>
        </div>

        <div className="ml-auto text-xs text-slate-400">
          Showing <span className="text-slate-200 font-semibold">{logs.length}</span> of{' '}
          <span className="text-slate-200 font-semibold">{totalCount}</span> entries
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden backdrop-blur-md">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={8} />
          </div>
        ) : logs.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No activity recorded"
            description={
              actionFilter !== 'all' || entityFilter !== 'all'
                ? 'No activity matches your active filters. Try clearing the filters.'
                : 'Administrative actions and updates will appear here automatically.'
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/60 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Timestamp</th>
                  <th className="py-3.5 px-4 font-semibold">User</th>
                  <th className="py-3.5 px-4 font-semibold">Action</th>
                  <th className="py-3.5 px-4 font-semibold">Entity</th>
                  <th className="py-3.5 px-4 font-semibold">Subject / Target</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {logs.map((log) => {
                  const style = ACTION_COLORS[log.action] || {
                    bg: 'bg-slate-800',
                    text: 'text-slate-300',
                    border: 'border-slate-700',
                  };
                  const isExpanded = expandedId === log.id;
                  const hasMetadata = log.metadata && Object.keys(log.metadata).length > 0;

                  return (
                    <React.Fragment key={log.id}>
                      <tr className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-400 font-mono">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            {new Date(log.created_at).toLocaleDateString()}{' '}
                            <span className="text-slate-500">
                              {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                              <User className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <div className="text-xs font-medium text-slate-200">
                                {log.user_name || log.user_email || 'System'}
                              </div>
                              {log.user_name && log.user_email && (
                                <div className="text-[10px] text-slate-500">{log.user_email}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${style.bg} ${style.text} ${style.border}`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap text-xs font-mono text-slate-400 capitalize">
                          {log.entity_type?.replace('_', ' ') || '—'}
                        </td>
                        <td className="py-3.5 px-4 max-w-xs truncate text-xs text-slate-200">
                          {log.entity_name ? (
                            <span className="font-medium text-slate-100">{log.entity_name}</span>
                          ) : log.entity_id ? (
                            <span className="font-mono text-slate-500">{log.entity_id.slice(0, 8)}...</span>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap text-right">
                          {hasMetadata ? (
                            <button
                              onClick={() => toggleExpand(log.id)}
                              className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                            >
                              {isExpanded ? (
                                <>Less <ChevronUp className="w-3.5 h-3.5" /></>
                              ) : (
                                <>Details <ChevronDown className="w-3.5 h-3.5" /></>
                              )}
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-600">—</span>
                          )}
                        </td>
                      </tr>

                      {isExpanded && hasMetadata && (
                        <tr className="bg-slate-950/60">
                          <td colSpan={6} className="px-6 py-4 border-t border-slate-800/40">
                            <div className="text-xs font-mono">
                              <span className="text-slate-400 block mb-1 font-sans font-semibold">Event Metadata:</span>
                              <pre className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-cyan-300 overflow-x-auto text-[11px]">
                                {JSON.stringify(log.metadata, null, 2)}
                              </pre>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3.5 border-t border-slate-800 bg-slate-900/40 text-sm">
            <div className="text-xs text-slate-400">
              Page <span className="font-semibold text-slate-200">{currentPage}</span> of{' '}
              <span className="font-semibold text-slate-200">{totalPages}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
