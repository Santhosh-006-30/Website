import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, Briefcase, ArrowLeft } from 'lucide-react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { JoinUs } from './JoinUs';
import { SEO } from './SEO';

export const NotFoundPage: React.FC = () => {
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#07111F] text-slate-100 selection:bg-[#D7B65A]/30 selection:text-[#E8D89A] flex flex-col">
      {/* 404 Noindex SEO */}
      <SEO
        title="404 — Page Not Found"
        description="The requested page could not be found on the Rotaract Club of Lead India Ahead website."
        noindex={true}
      />

      <Navbar onOpenJoinModal={() => setIsJoinModalOpen(true)} />

      <main className="flex-grow flex items-center justify-center pt-28 sm:pt-36 pb-20 px-4 sm:px-6">
        <div className="max-w-md w-full glass-panel rounded-3xl border border-white/10 bg-gradient-to-br from-[#10233D]/90 via-[#0c192e]/90 to-[#07111F] p-8 sm:p-10 text-center shadow-2xl space-y-6">
          {/* Logo / Crest Badge */}
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-[#D7B65A]/30 mx-auto flex items-center justify-center p-3 shadow-lg">
            <img
              src="/assets/logos/lia-shield.png"
              alt="LIA Shield"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="space-y-2">
            <span className="text-4xl sm:text-5xl font-black text-[#D7B65A] font-heading block">
              404
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white font-heading">
              Page Not Found
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              The page you are looking for doesn't exist, has been removed, or moved to another URL.
            </p>
          </div>

          {/* Action Links */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-[#D7B65A] to-[#B3933B] text-[#07111F] hover:brightness-110 shadow-md shadow-[#D7B65A]/20 transition-all cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              Back Home
            </Link>
            <Link
              to="/careers"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors cursor-pointer"
            >
              <Briefcase className="w-3.5 h-3.5 text-[#D7B65A]" />
              View Careers
            </Link>
          </div>

          <div className="pt-4 border-t border-white/5">
            <Link
              to="/#events"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#D7B65A] transition-colors"
            >
              <ArrowLeft className="w-3 h-3" />
              Explore Events &amp; Initiatives
            </Link>
          </div>
        </div>
      </main>

      {/* Global Join Modal */}
      <JoinUs
        isModalOpen={isJoinModalOpen}
        onCloseModal={() => setIsJoinModalOpen(false)}
        onOpenModal={() => setIsJoinModalOpen(true)}
      />

      <Footer onOpenJoinModal={() => setIsJoinModalOpen(true)} />
    </div>
  );
};
