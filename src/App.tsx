import { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { About } from "./components/About";
import { ImpactStats } from "./components/ImpactStats";
import { WhatWeDo } from "./components/WhatWeDo";
import { FeaturedProjects } from "./components/FeaturedProjects";
import { MaayonSection } from "./components/MaayonSection";
import { Events } from "./components/Events";
import { LatestOpportunities } from "./components/LatestOpportunities";
import { Journey } from "./components/Journey";
import { Leadership } from "./components/Leadership";
import { Gallery } from "./components/Gallery";
import { JoinUs } from "./components/JoinUs";
import { Contact } from "./components/Contact";
import { Footer } from "./components/Footer";
import { SEO } from "./components/SEO";
import { CLUB_INFO } from "./data/club";
import { SITE_CONFIG } from "./config/site";

export function App() {
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  // Cross-page hash navigation handler (e.g. landing on /#events or /#about from other pages)
  useEffect(() => {
    if (window.location.hash) {
      const targetId = window.location.hash.replace('#', '');
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        const observer = new MutationObserver(() => {
          const target = document.getElementById(targetId);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
            observer.disconnect();
          }
        });
        observer.observe(document.body, { childList: true, subtree: true });
        const timer = setTimeout(() => observer.disconnect(), 2500);
        return () => {
          observer.disconnect();
          clearTimeout(timer);
        };
      }
    }
  }, []);

  const handleOpenJoinModal = () => {
    setIsJoinModalOpen(true);
  };

  const handleCloseJoinModal = () => {
    setIsJoinModalOpen(false);
  };

  const handleExploreClick = () => {
    const el = document.getElementById("about");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleMeetClick = () => {
    const el = document.getElementById("maayon");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Verified Organization JSON-LD Schema
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": SITE_CONFIG.organization.name,
    "alternateName": SITE_CONFIG.organization.alternateName,
    "url": SITE_CONFIG.siteUrl,
    "logo": `${SITE_CONFIG.siteUrl}/assets/logos/lia-shield.png`,
    "foundingDate": `${SITE_CONFIG.organization.established}`,
    "parentOrganization": {
      "@type": "Organization",
      "name": SITE_CONFIG.organization.sponsorClub,
    },
    "location": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Coimbatore",
        "addressRegion": "Tamil Nadu",
        "addressCountry": "IN",
      },
    },
    "sameAs": [
      CLUB_INFO.contact.instagramUrl,
      CLUB_INFO.contact.linkedinUrl,
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "email": CLUB_INFO.contact.email,
      "contactType": "general inquiries",
    },
  };

  return (
    <div className="min-h-screen bg-[#07111F] text-slate-100 selection:bg-[#D7B65A]/30 selection:text-[#E8D89A] flex flex-col">
      {/* Skip to Main Content for Screen Readers and Keyboard Navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#D7B65A] focus:text-[#07111F] focus:font-bold focus:rounded-xl focus:shadow-2xl focus:outline-none"
      >
        Skip to main content
      </a>

      {/* Official Structured SEO */}
      <SEO
        canonicalPath="/"
        jsonLd={organizationJsonLd}
      />

      {/* Navigation Header */}
      <Navbar onOpenJoinModal={handleOpenJoinModal} />

      <main id="main-content" className="flex-grow">
        {/* Full-bleed Hero Section */}
        <Hero
          onExploreClick={handleExploreClick}
          onMeetClick={handleMeetClick}
        />

        {/* About Section */}
        <About />

        {/* Animated Impact Numbers */}
        <ImpactStats />

        {/* Six Avenues of Service */}
        <WhatWeDo />

        {/* Asymmetric Featured Projects Showcase */}
        <FeaturedProjects />

        {/* Signature Presidential Theme: MAAYON 2026–27 */}
        <MaayonSection />

        {/* Filterable Events Showcase with Detail Modal */}
        <Events />

        {/* Professional Careers & Opportunities Module */}
        <LatestOpportunities />

        {/* 13-Year Historical Timeline */}
        <Journey />

        {/* Verified Board of Directors & Team MAAYON */}
        <Leadership />

        {/* High-res Activity Gallery & Lightbox */}
        <Gallery />

        {/* Join Us CTA & Interactive Application Flow */}
        <JoinUs
          isModalOpen={isJoinModalOpen}
          onCloseModal={handleCloseJoinModal}
          onOpenModal={handleOpenJoinModal}
        />

        {/* Official Contact Details & Direct Query Form */}
        <Contact />
      </main>

      {/* Comprehensive Official Footer */}
      <Footer onOpenJoinModal={handleOpenJoinModal} />
    </div>
  );
}

export default App;
