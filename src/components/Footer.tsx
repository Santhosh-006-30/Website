import { ArrowUp, Mail, Phone, MapPin, Shield, Compass, Sparkles } from "lucide-react";
import { CLUB_INFO } from "../data/club";

const InstagramIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const LinkedinIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

interface FooterProps {
  onOpenJoinModal?: () => void;
}

export const Footer = ({ onOpenJoinModal }: FooterProps) => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const navLinks = [
    { label: "About LIA", href: "#about" },
    { label: "Our Impact", href: "#impact" },
    { label: "What We Do", href: "#what-we-do" },
    { label: "Featured Projects", href: "#projects" },
    { label: "MAAYON 2026–27", href: "#maayon" },
    { label: "Events & Timeline", href: "#events" },
    { label: "Our Journey", href: "#journey" },
    { label: "Leadership Board", href: "#leadership" },
    { label: "Photo Gallery", href: "#gallery" },
    { label: "Contact Us", href: "#contact" },
  ];

  return (
    <footer className="bg-[#050D18] text-slate-300 relative overflow-hidden border-t border-white/10">
      {/* Subtle background aura */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-48 bg-[#D7B65A]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 pb-16 border-b border-white/10">
          {/* Column 1: Dual Brand & Bio */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#10233D] to-[#07111F] border border-[#D7B65A]/40 flex items-center justify-center shadow-lg shadow-black/40 overflow-hidden p-1">
                <img
                  src="/assets/logos/lia-logo.png"
                  alt="LIA Crest"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
              <div>
                <span className="font-heading font-extrabold text-base tracking-wider text-white uppercase block leading-tight">
                  ROTARACT CLUB OF
                </span>
                <span className="font-heading font-black text-xl text-[#D7B65A] tracking-wider block">
                  LEAD INDIA AHEAD
                </span>
              </div>
            </div>

            <p className="text-slate-400 text-sm leading-relaxed">
              Chartered in 2012 under the Rotary Club of Coimbatore Texcity, Rotaract District 3206. We empower dynamic youth, cultivate future leaders, and spearhead transformational social initiatives across Tamil Nadu.
            </p>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex items-center space-x-3.5">
              <div className="w-9 h-9 rounded-lg bg-[#D7B65A]/15 border border-[#D7B65A]/30 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-[#D7B65A]" />
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Presidential Theme</p>
                <p className="text-sm font-heading font-bold text-white tracking-wide">MAAYON 2026–27</p>
                <p className="text-xs text-[#D7B65A]">President Rtr. Hariharan B</p>
              </div>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-white flex items-center space-x-2">
              <Compass className="w-4 h-4 text-[#D7B65A]" />
              <span>Explore</span>
            </h3>
            <ul className="grid grid-cols-2 gap-2.5 text-sm text-slate-400">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="hover:text-[#D7B65A] transition-colors inline-block py-0.5"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: The Four-Way Test */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-white flex items-center space-x-2">
              <Shield className="w-4 h-4 text-[#D7B65A]" />
              <span>Guiding Principles</span>
            </h3>
            <div className="space-y-2 text-xs text-slate-400 leading-snug">
              <p className="font-semibold text-slate-300">The 4-Way Test:</p>
              <p>1. Is it the TRUTH?</p>
              <p>2. Is it FAIR to all concerned?</p>
              <p>3. Will it build GOODWILL and BETTER FRIENDSHIPS?</p>
              <p>4. Will it be BENEFICIAL to all concerned?</p>
            </div>
            <div className="pt-2 border-t border-white/5">
              <span className="text-xs font-semibold text-[#D7B65A] tracking-wider uppercase block">
                Motto: Service Above Self
              </span>
            </div>
          </div>

          {/* Column 4: Official Contact & Connect */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-white">
              Official Headquarters
            </h3>
            <div className="space-y-3 text-sm text-slate-400">
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-[#D7B65A] shrink-0 mt-1" />
                <span>{CLUB_INFO.location}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-[#D7B65A] shrink-0" />
                <a
                  href={`mailto:${CLUB_INFO.contact.email}`}
                  className="hover:text-white transition-colors truncate"
                >
                  {CLUB_INFO.contact.email}
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-[#D7B65A] shrink-0" />
                <span>{CLUB_INFO.contact.phones[0]}</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="pt-2 flex items-center space-x-3">
              <a
                href={CLUB_INFO.contact.instagramUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 hover:border-[#D7B65A]/50 hover:bg-[#D7B65A]/10 text-slate-300 hover:text-[#D7B65A] flex items-center justify-center transition-all"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a
                href={CLUB_INFO.contact.linkedinUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 hover:border-[#D7B65A]/50 hover:bg-[#D7B65A]/10 text-slate-300 hover:text-[#D7B65A] flex items-center justify-center transition-all"
              >
                <LinkedinIcon className="w-4 h-4" />
              </a>
              {onOpenJoinModal && (
                <button
                  onClick={onOpenJoinModal}
                  className="px-4 py-2 rounded-lg bg-[#D7B65A] hover:bg-[#E8D89A] text-[#07111F] font-semibold text-xs transition-all shadow-md"
                >
                  Join Us
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Scroll to Top */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-center sm:text-left">
            <span>
              © {new Date().getFullYear()} Rotaract Club of Lead India Ahead (LIA). All rights reserved.
            </span>
            <span className="hidden sm:inline text-slate-700">•</span>
            <span className="text-[#D7B65A]/80">
              Rotaract District 3206 | Sponsored by Rotary Club of Coimbatore Texcity
            </span>
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-colors"
            aria-label="Back to top"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
