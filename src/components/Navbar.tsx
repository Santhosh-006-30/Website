import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowUpRight, Sparkles } from "lucide-react";
import { CLUB_INFO } from "../data/club";

interface NavbarProps {
  onOpenJoinModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenJoinModal }) => {
  const location = useLocation();
  const isHomepage = location.pathname === "/";
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!isHomepage) return;

    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // Determine active section on homepage
      const sections = ["about", "impact", "what-we-do", "projects", "maayon", "events", "journey", "leadership", "gallery", "contact"];
      const scrollPosition = window.scrollY + 200;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomepage]);

  const navItems = [
    { name: "About", targetId: "about" },
    { name: "Impact", targetId: "impact" },
    { name: "Projects", targetId: "projects" },
    { name: "MAAYON", targetId: "maayon" },
    { name: "Events", targetId: "events" },
    { name: "Careers", path: "/careers" },
    { name: "Journey", targetId: "journey" },
    { name: "Leadership", targetId: "leadership" },
    { name: "Gallery", targetId: "gallery" },
    { name: "Contact", targetId: "contact" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled || !isHomepage
            ? "py-3 bg-[#07111F]/85 backdrop-blur-xl border-b border-white/10 shadow-2xl shadow-black/40"
            : "py-5 bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo & Permanent Identity */}
          <a
            href={isHomepage ? "#hero" : "/#hero"}
            className="flex items-center space-x-2.5 sm:space-x-3.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D7B65A] rounded-lg p-1 min-w-0"
          >
            <div className="relative shrink-0">
              <img
                src="/assets/logos/lia-shield.png"
                alt="Rotaract Club of Lead India Ahead Shield Logo"
                loading="eager"
                decoding="async"
                className="h-9 sm:h-11 md:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105 filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
              />
              <div className="absolute -inset-1 bg-[#D7B65A]/20 blur-sm rounded-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            
            <div className="flex flex-col min-w-0">
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <span className="font-heading font-bold text-white text-sm sm:text-base lg:text-lg tracking-wide group-hover:text-[#E8D89A] transition-colors truncate">
                  ROTARACT LIA
                </span>
                <span className="hidden xs:inline-block px-1.5 py-0.5 text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider bg-white/10 text-[#D7B65A] border border-[#D7B65A]/30 rounded shrink-0">
                  Dist. 3206
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium tracking-tight truncate">
                Lead India Ahead • Since 2012
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav aria-label="Main Navigation" className="hidden lg:flex items-center space-x-1 xl:space-x-2 bg-white/[0.03] border border-white/10 backdrop-blur-md px-3 xl:px-4 py-1.5 rounded-full shadow-inner">
            {navItems.map((item) => {
              const isCareers = Boolean(item.path);
              const isSubpageActive =
                (item.targetId === "events" && location.pathname.startsWith("/events")) ||
                (item.targetId === "projects" && location.pathname.startsWith("/projects")) ||
                (item.targetId === "gallery" && location.pathname.startsWith("/gallery")) ||
                (item.targetId === "impact" && location.pathname.startsWith("/impact"));
              const isActive = isCareers
                ? location.pathname.startsWith("/careers")
                : isSubpageActive || (isHomepage && activeSection === item.targetId);
              const href = isCareers
                ? item.path!
                : isHomepage
                  ? `#${item.targetId}`
                  : item.targetId === "impact"
                    ? "/impact"
                    : `/#${item.targetId}`;

              return (
                <a
                  key={item.name}
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  className={`px-2.5 xl:px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 relative ${
                    isActive
                      ? "text-white font-semibold"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {item.name}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute inset-0 bg-gradient-to-r from-[#D7B65A]/20 to-[#06B6D4]/20 border border-[#D7B65A]/40 rounded-full -z-10"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center space-x-2.5 sm:space-x-3">
            {/* Presidential theme pill */}
            <a
              href={isHomepage ? "#maayon" : "/#maayon"}
              className="hidden xl:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#10233D]/70 border border-[#D7B65A]/30 text-xs text-[#E8D89A] hover:border-[#D7B65A] transition-all group shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D7B65A] animate-pulse" />
              <span className="font-semibold tracking-wider text-[11px]">MAAYON '26–27</span>
            </a>

            <button
              onClick={onOpenJoinModal}
              className="relative inline-flex items-center justify-center px-3.5 sm:px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#07111F] transition-all duration-300 bg-gradient-to-r from-[#D7B65A] via-[#E8D89A] to-[#D7B65A] rounded-full hover:shadow-[0_0_20px_rgba(215,182,90,0.5)] active:scale-95 group overflow-hidden shrink-0 cursor-pointer"
            >
              <span className="relative z-10 flex items-center space-x-1.5">
                <span>Join Us</span>
                <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center space-x-2 lg:hidden shrink-0">
            <button
              onClick={onOpenJoinModal}
              className="sm:hidden px-3 py-1.5 text-xs font-semibold text-[#07111F] bg-[#D7B65A] rounded-full active:scale-95 transition-transform cursor-pointer"
            >
              Join
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D7B65A] active:scale-95 cursor-pointer"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation-menu"
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            id="mobile-navigation-menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-[70px] z-40 bg-[#07111F]/95 backdrop-blur-2xl border-b border-white/10 px-6 py-8 shadow-2xl lg:hidden max-h-[85vh] overflow-y-auto"
          >
            <div className="flex flex-col space-y-4">
              <div className="p-3 bg-white/5 border border-[#D7B65A]/20 rounded-xl mb-2 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img src="/assets/logos/maayon-theme.png" alt="MAAYON" className="h-7 w-auto object-contain" />
                  <div>
                    <div className="text-xs font-bold text-[#E8D89A]">MAAYON 2026–27</div>
                    <div className="text-[10px] text-slate-400">President: {CLUB_INFO.president.name}</div>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-[#D7B65A] bg-[#D7B65A]/10 px-2 py-0.5 rounded border border-[#D7B65A]/30">
                  Dist. 3206
                </span>
              </div>

              {navItems.map((item) => {
                const isCareers = Boolean(item.path);
                const isSubpageActive =
                  (item.targetId === "events" && location.pathname.startsWith("/events")) ||
                  (item.targetId === "projects" && location.pathname.startsWith("/projects")) ||
                  (item.targetId === "gallery" && location.pathname.startsWith("/gallery")) ||
                  (item.targetId === "impact" && location.pathname.startsWith("/impact"));
                const isActive = isCareers
                  ? location.pathname.startsWith("/careers")
                  : isSubpageActive || (isHomepage && activeSection === item.targetId);
                const href = isCareers
                  ? item.path!
                  : isHomepage
                    ? `#${item.targetId}`
                    : item.targetId === "impact"
                      ? "/impact"
                      : `/#${item.targetId}`;

                return (
                  <a
                    key={item.name}
                    href={href}
                    onClick={() => setMobileMenuOpen(false)}
                    aria-current={isActive ? "page" : undefined}
                    className={`px-4 py-3 rounded-lg text-base font-medium transition-colors flex items-center justify-between border ${
                      isActive
                        ? "text-[#D7B65A] bg-[#D7B65A]/10 border-[#D7B65A]/30 font-semibold"
                        : "text-slate-200 hover:text-[#D7B65A] hover:bg-white/5 border-transparent"
                    }`}
                  >
                    <span>{item.name}</span>
                    <ArrowUpRight className="w-4 h-4 text-slate-500" />
                  </a>
                );
              })}

              <div className="pt-4 border-t border-white/10 flex flex-col space-y-3">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenJoinModal();
                  }}
                  className="w-full py-3 text-center text-sm font-bold uppercase tracking-wider text-[#07111F] bg-gradient-to-r from-[#D7B65A] via-[#E8D89A] to-[#D7B65A] rounded-xl shadow-lg shadow-[#D7B65A]/20"
                >
                  Join Rotaract LIA
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
