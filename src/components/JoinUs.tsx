import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle, Sparkles, X, Shield, Send } from "lucide-react";
import confetti from "canvas-confetti";

interface JoinUsProps {
  isModalOpen: boolean;
  onCloseModal: () => void;
  onOpenModal: () => void;
}

export const JoinUs = ({ isModalOpen, onCloseModal, onOpenModal }: JoinUsProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    college: "",
    interest: "Community Service",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#D7B65A", "#06B6D4", "#10B981", "#E8D89A"],
      });
    } catch (err) {
      // Confetti fallback
    }
  };

  return (
    <>
      <section className="py-24 bg-gradient-to-b from-[#07111F] via-[#09172B] to-[#07111F] relative overflow-hidden border-t border-white/5">
        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#D7B65A]/10 blur-[130px] pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#10233D] border border-[#D7B65A]/40 text-xs font-semibold text-[#E8D89A] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#D7B65A]" />
              <span>Shape the Future • Join Team LIA</span>
            </div>

            <h2 className="font-heading font-extrabold text-4xl sm:text-6xl text-white tracking-tight leading-tight">
              YOUR NEXT CHAPTER <br />
              <span className="gold-gradient-text">STARTS HERE.</span>
            </h2>

            <p className="max-w-2xl mx-auto text-slate-300 text-sm sm:text-lg font-normal leading-relaxed">
              Whether you are a student exploring leadership or a young professional looking to create meaningful social impact, the Rotaract Club of Lead India Ahead welcomes you to a community of purpose.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                onClick={onOpenModal}
                className="w-full sm:w-auto px-9 py-4 rounded-full text-sm font-bold uppercase tracking-wider text-[#07111F] bg-gradient-to-r from-[#D7B65A] via-[#E8D89A] to-[#D7B65A] hover:shadow-[0_0_30px_rgba(215,182,90,0.5)] transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center space-x-2 group"
              >
                <span>Join Rotaract LIA</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={onOpenModal}
                className="w-full sm:w-auto px-8 py-4 rounded-full text-sm font-semibold text-white bg-white/5 border border-white/15 hover:bg-white/10 hover:border-white/30 backdrop-blur-md transition-all transform hover:-translate-y-0.5"
              >
                Volunteer With Us
              </button>
            </div>

            <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
              <span className="flex items-center space-x-1.5">
                <Shield className="w-4 h-4 text-[#D7B65A]" />
                <span>Rotaract District 3206 Official Charter</span>
              </span>
              <span>•</span>
              <span>Sponsored by Rotary Club of Coimbatore Texcity</span>
              <span>•</span>
              <span>Since 2012</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Join Application Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseModal}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl glass-panel rounded-3xl overflow-hidden border border-white/20 shadow-2xl z-10 p-6 sm:p-8"
            >
              <button
                onClick={onCloseModal}
                className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                aria-label="Close form"
              >
                <X className="w-5 h-5" />
              </button>

              {!submitted ? (
                <div>
                  <div className="mb-6">
                    <div className="text-xs font-bold uppercase tracking-wider text-[#D7B65A] mb-1">
                      Membership & Volunteer Application
                    </div>
                    <h3 className="font-heading font-extrabold text-2xl text-white">
                      Connect with Team LIA
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Fill in your details below and our membership team will connect with you.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Your full name"
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#D7B65A] transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="name@example.com"
                          className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#D7B65A] transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+91 98765 43210"
                          className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#D7B65A] transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                        College / Organization
                      </label>
                      <input
                        type="text"
                        value={formData.college}
                        onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                        placeholder="e.g. SNS College, Karpagam Academy, Professional"
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#D7B65A] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                        Primary Area of Interest
                      </label>
                      <select
                        value={formData.interest}
                        onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#0B1728] border border-white/10 text-white text-sm focus:outline-none focus:border-[#D7B65A] transition-colors"
                      >
                        <option value="Community Service">Community Service & Social Welfare</option>
                        <option value="Youth Sports">Youth Sports & Athletic Events</option>
                        <option value="Health Awareness">Public Health Awareness (DHEEMA)</option>
                        <option value="Professional Development">Professional Skills & Technology</option>
                        <option value="Leadership">Youth Leadership & Governance</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 mt-4 text-sm font-bold uppercase tracking-wider text-[#07111F] bg-gradient-to-r from-[#D7B65A] via-[#E8D89A] to-[#D7B65A] rounded-xl hover:shadow-[0_0_20px_rgba(215,182,90,0.5)] transition-all flex items-center justify-center space-x-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>Submit Expression of Interest</span>
                    </button>
                  </form>
                </div>
              ) : (
                <div className="py-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-[#10B981]/20 text-[#10B981] flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h3 className="font-heading font-extrabold text-2xl text-white">
                    Thank You, {formData.name || "Friend"}!
                  </h3>
                  <p className="text-sm text-slate-300 max-w-md mx-auto">
                    Your expression of interest has been received. Team MAAYON 2026–27 welcomes your passion and will connect with you soon!
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      onCloseModal();
                    }}
                    className="px-6 py-2.5 rounded-full text-xs font-bold uppercase text-[#07111F] bg-[#D7B65A] hover:bg-[#E8D89A]"
                  >
                    Done
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
