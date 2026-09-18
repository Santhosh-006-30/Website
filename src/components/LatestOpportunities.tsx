import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Building2,
  MapPin,
  Clock,
  DollarSign,
  ArrowRight,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { getLatestOpportunities } from '../services/careers';
import type { Career } from '../types/supabase';

export const LatestOpportunities: React.FC = () => {
  const [opportunities, setOpportunities] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getLatestOpportunities(3)
      .then((data) => {
        if (isMounted) {
          setOpportunities(data);
        }
      })
      .catch((err) => {
        console.warn('[LatestOpportunities] Could not fetch opportunities:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Return null if loading or no opportunities available to preserve sleek homepage layout
  if (loading || opportunities.length === 0) {
    return null;
  }

  const formatDeadline = (deadlineStr: string | null) => {
    if (!deadlineStr) return 'Rolling';
    const d = new Date(deadlineStr);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <section id="careers" className="py-20 sm:py-28 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#D7B65A]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D7B65A]/10 border border-[#D7B65A]/30 text-[#E8D89A] text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#D7B65A]" />
              Professional Avenue &amp; Placements
            </div>

            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight">
              Careers &amp; Opportunities
            </h2>

            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Discover verified internships, fellowships, and social impact positions curated
              for the youth and members of Rotaract Club of Lead India Ahead.
            </p>
          </div>

          <Link
            to="/careers"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-[#D7B65A] bg-[#D7B65A]/10 hover:bg-[#D7B65A] hover:text-[#07111F] border border-[#D7B65A]/30 transition-all duration-300 self-start md:self-auto group"
          >
            <span>View All Opportunities</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* 3-Column Opportunities Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {opportunities.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="group flex flex-col justify-between rounded-2xl p-6 border border-white/10 bg-gradient-to-b from-[#0c192e]/80 to-[#07111F]/80 hover:border-[#D7B65A]/40 transition-all duration-300 shadow-xl hover:shadow-[#D7B65A]/10 hover:-translate-y-1"
            >
              <div className="space-y-4">
                {/* Top Meta: Org & Badges */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {item.organization_logo_url ? (
                      <img
                        src={item.organization_logo_url}
                        alt={item.organization_name}
                        loading="lazy"
                        className="w-10 h-10 rounded-xl object-contain bg-white/5 p-1 border border-white/10 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#D7B65A] flex-shrink-0">
                        <Building2 className="w-5 h-5" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-300 truncate">
                        {item.organization_name}
                      </p>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        {item.location || (item.work_mode === 'remote' ? 'Remote' : 'On-Site')}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] bg-[#D7B65A]/15 text-[#E8D89A] border border-[#D7B65A]/30 px-2 py-0.5 rounded-full font-semibold capitalize whitespace-nowrap">
                    {item.opportunity_type.replace('_', ' ')}
                  </span>
                </div>

                {/* Title */}
                <div>
                  <Link
                    to={`/careers/${item.slug}`}
                    className="font-heading font-bold text-lg text-white group-hover:text-[#E8D89A] transition-colors line-clamp-2 leading-snug"
                  >
                    {item.title}
                  </Link>
                </div>

                {/* Sub Meta */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                  {item.remuneration ? (
                    <span className="text-emerald-400 font-medium flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5" />
                      {item.remuneration}
                    </span>
                  ) : (
                    <span className="text-slate-500 text-[11px]">Competitive</span>
                  )}

                  <span className="text-slate-400 text-[11px] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {formatDeadline(item.application_deadline)}
                  </span>
                </div>
              </div>

              {/* Action Links */}
              <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between gap-3">
                <Link
                  to={`/careers/${item.slug}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  Details
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <a
                  href={item.application_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#D7B65A] to-[#B3933B] text-[#07111F] hover:brightness-110 shadow-md shadow-[#D7B65A]/20 transition-all cursor-pointer"
                >
                  {item.application_label || 'Apply'}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
