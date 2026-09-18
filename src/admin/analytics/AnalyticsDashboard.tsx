import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  RefreshCw,
  Trash2,
  ShieldCheck,
  Eye,
  TrendingUp,
  Share2
} from 'lucide-react';
import { getAnalyticsSummary, clearAnalyticsData } from '../../lib/analytics';
import type { AnalyticsSummary } from '../../lib/analytics';
import { showToast } from '../shared/Toast';

export const AnalyticsDashboard: React.FC = () => {
  const [summary, setSummary] = useState<AnalyticsSummary>(getAnalyticsSummary());

  const refreshData = () => {
    setSummary(getAnalyticsSummary());
    showToast.success('Analytics refreshed');
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear local analytics history? This cannot be undone.')) {
      clearAnalyticsData();
      setSummary(getAnalyticsSummary());
      showToast.success('Local analytics data cleared');
    }
  };

  useEffect(() => {
    setSummary(getAnalyticsSummary());
  }, []);

  const total = summary.totalViews;
  const desktopPct = total > 0 ? Math.round((summary.devices.desktop / total) * 100) : 0;
  const mobilePct = total > 0 ? Math.round((summary.devices.mobile / total) * 100) : 0;
  const tabletPct = total > 0 ? Math.round((summary.devices.tablet / total) * 100) : 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D7B65A]/10 border border-[#D7B65A]/30 flex items-center justify-center text-[#D7B65A]">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Privacy-First Analytics</h1>
              <p className="text-sm text-slate-400">
                Audited client-side insights without third-party surveillance or cookies
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={refreshData}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          {total > 0 && (
            <button
              onClick={handleClear}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              Clear Local Data
            </button>
          )}
        </div>
      </div>

      {/* DNT Status Notice */}
      {summary.dntActive && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-3">
          <ShieldCheck className="w-4 h-4 flex-shrink-0 text-amber-400" />
          <span>
            <strong>Do Not Track active:</strong> Your browser has signaled DNT preference. Administrative views in this session are excluded from metrics.
          </span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-white/10 bg-[#0c192e]/60">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Recorded Views</span>
            <Eye className="w-4 h-4 text-[#D7B65A]" />
          </div>
          <p className="text-3xl font-bold text-white font-mono">{total}</p>
          <p className="text-xs text-slate-400 mt-1">Rolling 30-day window</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 bg-[#0c192e]/60">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Top Visited Path</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-lg font-bold text-white truncate font-mono">
            {summary.topPages[0]?.path || '—'}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {summary.topPages[0] ? `${summary.topPages[0].count} views` : 'No activity recorded yet'}
          </p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 bg-[#0c192e]/60">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Mobile Viewers</span>
            <Smartphone className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-3xl font-bold text-white font-mono">{mobilePct}%</p>
          <p className="text-xs text-slate-400 mt-1">{summary.devices.mobile} total mobile views</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 bg-[#0c192e]/60">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Social / Referral</span>
            <Share2 className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-3xl font-bold text-white font-mono">
            {total > 0 ? Math.round(((summary.sources.social + summary.sources.search) / total) * 100) : 0}%
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {summary.sources.social} social · {summary.sources.search} search
          </p>
        </div>
      </div>

      {total === 0 ? (
        <div className="glass-panel p-12 rounded-2xl border border-white/10 bg-[#0c192e]/60 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-slate-400">
            <Eye className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-semibold text-white">No Public Page Views Logged Yet</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Metrics will appear automatically as users explore public pages like Events, Projects, Careers, Gallery, and Posts.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Pages */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-[#0c192e]/60 space-y-4">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#D7B65A]" />
              Popular Public Content
            </h2>
            <div className="space-y-3">
              {summary.topPages.map((item, idx) => {
                const pct = Math.round((item.count / total) * 100);
                return (
                  <div key={item.path} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-300 font-medium">
                        <span className="text-slate-500 mr-2">#{idx + 1}</span>
                        {item.path}
                      </span>
                      <span className="text-slate-400">
                        {item.count} views ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#D7B65A] to-[#B3933B]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Devices & Channels */}
          <div className="space-y-6">
            {/* Device Breakdown */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-[#0c192e]/60 space-y-4">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Monitor className="w-4 h-4 text-sky-400" />
                Device Category Split
              </h2>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <Monitor className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                  <p className="text-lg font-bold text-white font-mono">{desktopPct}%</p>
                  <p className="text-[11px] text-slate-400">Desktop ({summary.devices.desktop})</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <Smartphone className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                  <p className="text-lg font-bold text-white font-mono">{mobilePct}%</p>
                  <p className="text-[11px] text-slate-400">Mobile ({summary.devices.mobile})</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <Tablet className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                  <p className="text-lg font-bold text-white font-mono">{tabletPct}%</p>
                  <p className="text-[11px] text-slate-400">Tablet ({summary.devices.tablet})</p>
                </div>
              </div>
            </div>

            {/* Referrer Sources */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-[#0c192e]/60 space-y-4">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Share2 className="w-4 h-4 text-purple-400" />
                Discovery Sources
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-slate-400">Direct</p>
                  <p className="text-base font-bold text-white font-mono mt-0.5">{summary.sources.direct}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-slate-400">Search</p>
                  <p className="text-base font-bold text-white font-mono mt-0.5">{summary.sources.search}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-slate-400">Social</p>
                  <p className="text-base font-bold text-white font-mono mt-0.5">{summary.sources.social}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-slate-400">Internal</p>
                  <p className="text-base font-bold text-white font-mono mt-0.5">{summary.sources.internal}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Guarantee Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 space-y-3">
        <h2 className="text-sm font-semibold text-emerald-300 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Rotaract Club of Lead India Ahead — Privacy Governance Charter
        </h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-300">
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Zero personal identifiable information (PII) collected or stored.
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            No IP address logging or geographic triangulation.
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            No persistent advertising cookies or external third-party scripts.
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Strict 30-day retention with rolling local purge window.
          </li>
        </ul>
      </div>
    </div>
  );
};
