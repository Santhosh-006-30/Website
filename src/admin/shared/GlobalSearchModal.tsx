import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  Calendar,
  FolderKanban,
  FileText,
  Briefcase,
  Users,
  Image,
  ArrowRight,
  Command,
} from 'lucide-react';
import { adminGlobalSearch, type GroupedSearchResults } from '../../services/search';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GroupedSearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await adminGlobalSearch(query);
        setResults(res);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSelect = (url: string) => {
    navigate(url);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-24 px-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col max-h-[75vh]"
        style={{ background: 'rgba(11, 23, 40, 0.95)' }}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-white/10 flex items-center gap-3">
          <Search className="w-5 h-5 text-[#D7B65A] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search events, projects, posts, careers, team, albums..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-500 hover:text-slate-300 p-1 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs text-slate-400 bg-white/5 border border-white/10 px-2 py-1 rounded-md hover:bg-white/10 transition-colors"
          >
            ESC
          </button>
        </div>

        {/* Search Results / Content Area */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {loading && (
            <div className="py-8 text-center text-xs text-slate-400">
              Searching across CMS records...
            </div>
          )}

          {!loading && !query && (
            <div className="py-8 text-center space-y-2">
              <Command className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">Type anything to quickly jump to records or edit forms.</p>
            </div>
          )}

          {!loading && query && results && results.totalResults === 0 && (
            <div className="py-8 text-center text-xs text-slate-400">
              No matching records found for "{query}".
            </div>
          )}

          {!loading && results && results.totalResults > 0 && (
            <div className="space-y-4">
              {/* Events */}
              {results.events.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-2">
                    <Calendar className="w-3.5 h-3.5 text-[#D7B65A]" />
                    Events ({results.events.length})
                  </div>
                  <div className="space-y-1">
                    {results.events.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item.adminUrl)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition-colors text-left group"
                      >
                        <div>
                          <div className="text-xs font-semibold text-white group-hover:text-[#D7B65A] transition-colors">
                            {item.title}
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-2">
                            <span>{item.category}</span>
                            <span>•</span>
                            <span>{item.subtitle}</span>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-white transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {results.projects.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-2">
                    <FolderKanban className="w-3.5 h-3.5 text-cyan-400" />
                    Projects ({results.projects.length})
                  </div>
                  <div className="space-y-1">
                    {results.projects.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item.adminUrl)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition-colors text-left group"
                      >
                        <div>
                          <div className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors">
                            {item.title}
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-2">
                            <span>{item.category}</span>
                            <span>•</span>
                            <span>{item.subtitle}</span>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-white transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Posts */}
              {results.posts.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-2">
                    <FileText className="w-3.5 h-3.5 text-blue-400" />
                    Posts ({results.posts.length})
                  </div>
                  <div className="space-y-1">
                    {results.posts.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item.adminUrl)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition-colors text-left group"
                      >
                        <div>
                          <div className="text-xs font-semibold text-white group-hover:text-blue-300 transition-colors">
                            {item.title}
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-2">
                            <span>{item.category}</span>
                            <span>•</span>
                            <span>{item.subtitle}</span>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-white transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Careers */}
              {results.careers.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-2">
                    <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                    Careers ({results.careers.length})
                  </div>
                  <div className="space-y-1">
                    {results.careers.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item.adminUrl)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition-colors text-left group"
                      >
                        <div>
                          <div className="text-xs font-semibold text-white group-hover:text-emerald-300 transition-colors">
                            {item.title}
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-2">
                            <span>{item.category}</span>
                            <span>•</span>
                            <span>{item.subtitle}</span>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-white transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Team */}
              {results.team.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-2">
                    <Users className="w-3.5 h-3.5 text-purple-400" />
                    Leadership ({results.team.length})
                  </div>
                  <div className="space-y-1">
                    {results.team.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item.adminUrl)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition-colors text-left group"
                      >
                        <div>
                          <div className="text-xs font-semibold text-white group-hover:text-purple-300 transition-colors">
                            {item.title}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {item.subtitle}
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-white transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Gallery */}
              {results.gallery.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-2">
                    <Image className="w-3.5 h-3.5 text-pink-400" />
                    Gallery Albums ({results.gallery.length})
                  </div>
                  <div className="space-y-1">
                    {results.gallery.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item.adminUrl)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition-colors text-left group"
                      >
                        <div>
                          <div className="text-xs font-semibold text-white group-hover:text-pink-300 transition-colors">
                            {item.title}
                          </div>
                          {item.subtitle && (
                            <div className="text-[10px] text-slate-400 line-clamp-1">
                              {item.subtitle}
                            </div>
                          )}
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-white transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
