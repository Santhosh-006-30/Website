import { useState } from "react";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { About } from "./components/About";
import { ImpactStats } from "./components/ImpactStats";
import { WhatWeDo } from "./components/WhatWeDo";
import { FeaturedProjects } from "./components/FeaturedProjects";
import { MaayonSection } from "./components/MaayonSection";
import { Events } from "./components/Events";
import { Journey } from "./components/Journey";
import { Leadership } from "./components/Leadership";
import { Gallery } from "./components/Gallery";
import { JoinUs } from "./components/JoinUs";
import { Contact } from "./components/Contact";
import { Footer } from "./components/Footer";

export function App() {
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

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

  return (
    <div className="min-h-screen bg-[#07111F] text-slate-100 selection:bg-[#D7B65A]/30 selection:text-[#E8D89A] flex flex-col">
      {/* Navigation Header */}
      <Navbar onOpenJoinModal={handleOpenJoinModal} />

      <main className="flex-grow">
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
