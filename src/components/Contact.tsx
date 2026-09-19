import { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle2 } from "lucide-react";
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

export const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 6000);
  };

  return (
    <section id="contact" className="py-24 bg-[#07111F] relative overflow-hidden border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[#D7B65A] uppercase tracking-wider mb-3">
            <Mail className="w-3.5 h-3.5 text-[#D7B65A]" />
            <span>Connect with Team LIA</span>
          </div>
          <h2 className="font-heading font-extrabold text-3xl sm:text-5xl text-white tracking-tight">
            GET IN <span className="gold-gradient-text">TOUCH</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-3 font-normal">
            For collaborative projects, district partnerships, institutional memberships, or community initiatives.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left: Verified Contact Info Cards */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-6">
            
            {/* Phone numbers */}
            <div className="p-4 sm:p-6 glass-card rounded-2xl border border-white/10 flex items-start space-x-3.5 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#D7B65A]/10 border border-[#D7B65A]/30 flex items-center justify-center text-[#D7B65A] shrink-0">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="space-y-1 min-w-0">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Direct Contact Numbers</h3>
                <div className="space-y-0.5">
                  {CLUB_INFO.contact.phones.map((phone, idx) => (
                    <a
                      key={idx}
                      href={`tel:${phone.replace(/\s+/g, "")}`}
                      className="block text-sm sm:text-base font-semibold text-white hover:text-[#D7B65A] transition-colors"
                    >
                      {phone}
                    </a>
                  ))}
                </div>
                <div className="text-[11px] text-slate-500 pt-1">Official Secretariat Lines</div>
              </div>
            </div>

            {/* Email Address */}
            <div className="p-4 sm:p-6 glass-card rounded-2xl border border-white/10 flex items-start space-x-3.5 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#06B6D4]/10 border border-[#06B6D4]/30 flex items-center justify-center text-[#06B6D4] shrink-0">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="space-y-1 min-w-0">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Official Club Email</h3>
                <a
                  href={`mailto:${CLUB_INFO.contact.email}`}
                  className="block text-xs sm:text-sm md:text-base font-semibold text-white hover:text-[#06B6D4] transition-colors break-all"
                >
                  {CLUB_INFO.contact.email}
                </a>
                <div className="text-[11px] text-slate-500 pt-1">Rotaract Secretariat Correspondence</div>
              </div>
            </div>

            {/* Location */}
            <div className="p-4 sm:p-6 glass-card rounded-2xl border border-white/10 flex items-start space-x-3.5 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-center text-[#10B981] shrink-0">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Base of Operations</h3>
                <div className="text-sm sm:text-base font-semibold text-white">
                  Coimbatore, Tamil Nadu, India
                </div>
                <div className="text-xs text-slate-400">
                  Rotaract District 3206 • Sponsored by Rotary Club of Coimbatore Texcity
                </div>
              </div>
            </div>

            {/* Verified Social Networks */}
            <div className="p-4 sm:p-6 glass-card rounded-2xl border border-white/10">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 sm:mb-4">Official Channels</h3>
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                <a
                  href={CLUB_INFO.contact.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 sm:p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center space-x-2 sm:space-x-2.5 text-slate-200 hover:text-[#D7B65A] transition-colors"
                >
                  <InstagramIcon className="w-4 h-4 text-[#F43F5E] shrink-0" />
                  <span className="text-xs font-semibold truncate">Instagram</span>
                </a>

                <a
                  href={CLUB_INFO.contact.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 sm:p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center space-x-2 sm:space-x-2.5 text-slate-200 hover:text-[#06B6D4] transition-colors"
                >
                  <LinkedinIcon className="w-4 h-4 text-[#06B6D4] shrink-0" />
                  <span className="text-xs font-semibold truncate">LinkedIn</span>
                </a>
              </div>
            </div>

          </div>

          {/* Right: Message Form */}
          <div className="lg:col-span-7">
            <div className="glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 border border-white/10 relative">
              <h3 className="font-heading font-bold text-xl sm:text-2xl text-white mb-2">Send an Inquiry</h3>
              <p className="text-xs text-slate-400 mb-6 font-normal">
                Leave your message below and our executive team will get back to you promptly.
              </p>

              {sent ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-[#10B981]/20 text-[#10B981] flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="font-heading font-bold text-2xl text-white">Message Delivered</h4>
                  <p className="text-sm text-slate-300 max-w-sm mx-auto">
                    Thank you for reaching out to the Rotaract Club of Lead India Ahead. We will review and respond shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact-name" className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                        Your Name *
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        autoComplete="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Rtr. John Doe"
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#D7B65A] transition-colors"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-email" className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                        Email Address *
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        required
                        autoComplete="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@example.com"
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#D7B65A] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-subject" className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                      Subject
                    </label>
                    <input
                      id="contact-subject"
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="e.g. Community Project Collaboration / Membership"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#D7B65A] transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-message" className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                      Your Message *
                    </label>
                    <textarea
                      id="contact-message"
                      rows={5}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Please share how you would like to connect or collaborate..."
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#D7B65A] transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 text-sm font-bold uppercase tracking-wider text-[#07111F] bg-gradient-to-r from-[#D7B65A] via-[#E8D89A] to-[#D7B65A] rounded-xl hover:shadow-[0_0_20px_rgba(215,182,90,0.5)] transition-all flex items-center justify-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Message to Secretariat</span>
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
