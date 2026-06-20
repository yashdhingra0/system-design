import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen, GitBranch, ArrowLeftRight, Stethoscope,
  Map, GraduationCap, Newspaper, LayoutDashboard,
  HelpCircle, Wrench, Network, TrendingUp,
  FolderGit2, BookOpenCheck, Sun, Moon, Menu, X,
  Link2, GitBranch as GithubIcon, ExternalLink, Zap, Award, Brain
} from 'lucide-react';

export type Tab = 'concepts' | 'solid' | 'dashboard' | 'questions' | 'quiz' | 'prep-tools' |
  'revision-notes' | 'prep-sandbox' | 'design-patterns' | 'tech-comparisons' |
  'system-diagrams' | 'system-evolution' | 'design-doctor' |
  'ai-roadmap' | 'ai-learning' | 'ai-news';

export interface NavItem {
  label: string;
  tab: Tab;
  icon: React.ReactNode;
  badge?: string;
}

export interface NavGroup {
  label: string;
  emoji: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Learn', emoji: '📚',
    items: [
      { label: 'Core Concepts', tab: 'concepts', icon: <BookOpen size={14} /> },
      { label: 'SOLID Principles', tab: 'solid', icon: <Award size={14} /> },
      { label: 'Design Patterns', tab: 'design-patterns', icon: <GitBranch size={14} /> },
      { label: 'Tech Comparisons', tab: 'tech-comparisons', icon: <ArrowLeftRight size={14} /> },
    ],
  },
  {
    label: 'AI Hub', emoji: '🤖',
    items: [
      { label: 'AI Roadmap', tab: 'ai-roadmap', icon: <Map size={14} /> },
      { label: 'AI Learning Hub', tab: 'ai-learning', icon: <GraduationCap size={14} />, badge: 'NEW' },
      { label: 'AI News', tab: 'ai-news', icon: <Newspaper size={14} />, badge: 'LIVE' },
    ],
  },
  {
    label: 'Practice', emoji: '💪',
    items: [
      { label: '50 Problems', tab: 'dashboard', icon: <LayoutDashboard size={14} /> },
      { label: 'Interview Q&A', tab: 'questions', icon: <HelpCircle size={14} /> },
      { label: 'Quiz', tab: 'quiz', icon: <Zap size={14} /> },
      { label: 'Prep Sandbox', tab: 'prep-sandbox', icon: <FolderGit2 size={14} /> },
    ],
  },
  {
    label: 'Reference', emoji: '🗂️',
    items: [
      { label: 'System Diagrams', tab: 'system-diagrams', icon: <Network size={14} /> },
      { label: 'System Evolution', tab: 'system-evolution', icon: <TrendingUp size={14} /> },
      { label: 'Design Doctor', tab: 'design-doctor', icon: <Stethoscope size={14} />, badge: 'NEW' },
      { label: 'Prep Tools', tab: 'prep-tools', icon: <Wrench size={14} /> },
      { label: 'Revision Notes', tab: 'revision-notes', icon: <BookOpenCheck size={14} /> },
    ],
  },
];

// ── News Ticker ──────────────────────────────────────────────────────────────
const NewsTicker: React.FC<{ onClickNews: () => void }> = ({ onClickNews }) => {
  const [headlines, setHeadlines] = useState<string[]>([]);
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    fetch('/api/news?category=all&pageSize=10')
      .then(r => r.json())
      .then(d => {
        const titles = (d.articles || [])
          .filter((a: { title?: string }) => a.title && a.title !== '[Removed]')
          .slice(0, 10)
          .map((a: { title: string }) => a.title);
        if (titles.length) setHeadlines(titles);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!headlines.length) return;
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setIdx(i => (i + 1) % headlines.length); setVisible(true); }, 300);
    }, 5000);
    return () => clearInterval(interval);
  }, [headlines.length]);

  if (!headlines.length) return null;

  return (
    <button onClick={onClickNews} style={{
      display: 'flex', alignItems: 'center', gap: 8, maxWidth: 300, overflow: 'hidden',
      background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.18)',
      borderRadius: 7, padding: '4px 10px', cursor: 'pointer',
    }} title="Click to open AI News">
      <span style={{ fontSize: 10, fontWeight: 800, color: '#10b981', flexShrink: 0, letterSpacing: '0.05em' }}>LIVE</span>
      <span style={{
        fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap',
        overflow: 'hidden', textOverflow: 'ellipsis',
        opacity: visible ? 1 : 0, transition: 'opacity 0.3s ease',
      }}>{headlines[idx]}</span>
    </button>
  );
};

// ── Profile Dropdown ─────────────────────────────────────────────────────────
const ProfileButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '5px 10px 5px 5px', borderRadius: 8,
        background: open ? 'var(--border-glass)' : 'transparent',
        border: '1px solid transparent', cursor: 'pointer', transition: 'all 0.2s',
      }} title="Profile">
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: 'linear-gradient(135deg, #059669, #10b981)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 800, color: '#fff', flexShrink: 0,
        }}>YD</div>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Yash</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', right: 0,
          width: 240, background: 'var(--surface-elevated)',
          border: '1px solid var(--border-glass)', borderRadius: 12,
          padding: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.4)', zIndex: 400,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid var(--border-glass)' }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'linear-gradient(135deg, #059669, #10b981)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 800, color: '#fff',
            }}>YD</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Yash Dhingra</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Creator of Systemic</div>
            </div>
          </div>

          <a href="https://www.linkedin.com/in/dhingrayash001/" target="_blank" rel="noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 6px', borderRadius: 8, textDecoration: 'none', color: 'var(--text-secondary)', fontSize: 13, transition: 'all 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.05)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; }}
          >
            <Link2 size={15} color="#0a66c2" />
            <span>LinkedIn</span>
            <ExternalLink size={11} style={{ marginLeft: 'auto', opacity: 0.5 }} />
          </a>

          <a href="https://github.com/yashdhingra0" target="_blank" rel="noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 6px', borderRadius: 8, textDecoration: 'none', color: 'var(--text-secondary)', fontSize: 13, transition: 'all 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.05)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; }}
          >
            <GithubIcon size={15} />
            <span>GitHub</span>
            <ExternalLink size={11} style={{ marginLeft: 'auto', opacity: 0.5 }} />
          </a>

          <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border-glass)', fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>
            Built with ❤️ for the community
          </div>
        </div>
      )}
    </div>
  );
};

// ── Main TopNavbar ────────────────────────────────────────────────────────────
interface TopNavbarProps {
  currentTab: Tab;
  onSelectTab: (tab: Tab) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  activeGroupLabel: string | null;
  onSetActiveGroup: (label: string) => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  currentTab, onSelectTab, theme, onToggleTheme, activeGroupLabel, onSetActiveGroup,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSelect = (tab: Tab) => {
    onSelectTab(tab);
    setMobileOpen(false);
  };

  return (
    <>
      <nav className="top-nav">
        {/* Logo — click goes home */}
        <button
          onClick={() => handleSelect('concepts')}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '6px 10px 6px 4px', borderRadius: 8,
            flexShrink: 0,
          }}
          className="top-nav-logo"
        >
          <Brain size={22} color="#10b981" />
          <span style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Systemic</span>
        </button>

        {/* Desktop group tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }} className="desktop-nav">
          {NAV_GROUPS.map(group => {
            const isActive = activeGroupLabel === group.label ||
              (!activeGroupLabel && group.items.some(i => i.tab === currentTab));
            return (
              <button
                key={group.label}
                onClick={() => onSetActiveGroup(isActive && activeGroupLabel === group.label ? '' : group.label)}
                className={`top-nav-btn ${isActive ? 'active' : ''}`}
              >
                <span>{group.emoji}</span>
                <span>{group.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
          {currentTab !== 'ai-news' && (
            <div className="desktop-nav">
              <NewsTicker onClickNews={() => handleSelect('ai-news')} />
            </div>
          )}

          <button onClick={onToggleTheme} style={{
            padding: '6px', borderRadius: 8, background: 'transparent',
            border: '1px solid var(--border-glass)', cursor: 'pointer',
            color: 'var(--text-secondary)', display: 'flex', alignItems: 'center',
          }} title={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          <ProfileButton />

          <button onClick={() => setMobileOpen(o => !o)} className="mobile-menu-btn" style={{
            padding: '6px', borderRadius: 8, background: 'transparent',
            border: '1px solid var(--border-glass)', cursor: 'pointer',
            color: 'var(--text-secondary)', display: 'none', alignItems: 'center',
          }}>
            {mobileOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{
          position: 'fixed', top: 56, left: 0, right: 0, bottom: 0,
          background: 'var(--bg-main)', zIndex: 190, overflowY: 'auto', padding: 16,
        }}>
          {NAV_GROUPS.map(group => (
            <div key={group.label} style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, padding: '0 4px' }}>
                {group.emoji} {group.label}
              </div>
              {group.items.map(item => (
                <button key={item.tab} onClick={() => handleSelect(item.tab)} style={{
                  display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                  padding: '12px 12px', borderRadius: 8, marginBottom: 2,
                  background: currentTab === item.tab ? 'rgba(16,185,129,0.1)' : 'transparent',
                  border: 'none', cursor: 'pointer', textAlign: 'left',
                  color: currentTab === item.tab ? '#10b981' : 'var(--text-secondary)',
                  fontSize: 14, fontWeight: 500,
                }}>
                  {item.icon} {item.label}
                  {item.badge && (
                    <span style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 800, padding: '1px 5px', borderRadius: 4, background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          ))}

          <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: 16, marginTop: 8 }}>
            <a href="https://www.linkedin.com/in/dhingrayash001/" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-secondary)', textDecoration: 'none', padding: '10px 0', fontSize: 14 }}>
              <Link2 size={16} color="#0a66c2" /> LinkedIn — Yash Dhingra
            </a>
            <a href="https://github.com/yashdhingra0" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-secondary)', textDecoration: 'none', padding: '10px 0', fontSize: 14 }}>
              <GithubIcon size={16} /> GitHub — yashdhingra0
            </a>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
};
