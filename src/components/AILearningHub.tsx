import React, { useState, useEffect } from 'react';
import { aiTopics, AI_PHASES } from '../data/aiCurriculum';
import type { AISection } from '../data/aiCurriculum';
import { Clock, CheckCircle2, Lightbulb, AlertTriangle, ChevronRight, Search, Heart, Eye } from 'lucide-react';

// ── Persistence helpers ───────────────────────────────────────────────────────
function loadCounts(key: string): Record<string, number> {
  try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch { return {}; }
}
function saveCounts(key: string, data: Record<string, number>) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch { /* noop */ }
}

interface AILearningHubProps {
  initialTopicId?: string;
}

const PHASE_COLORS: Record<number, string> = {
  1: '#34d399', 2: '#34d399', 3: '#34d399', 4: '#fbbf24', 5: '#f87171',
};

const DIFFICULTY_STYLE: Record<string, { bg: string; color: string }> = {
  Beginner:     { bg: 'rgba(52,211,153,0.12)', color: '#34d399' },
  Intermediate: { bg: 'rgba(52,211,153,0.12)', color: '#34d399' },
  Advanced:     { bg: 'rgba(251,191,36,0.12)', color: '#fbbf24' },
};

// ── Code Block ──────────────────────────────────────────────────────────────
const CodeBlock: React.FC<{ title: string; language: string; code: string }> = ({ title, language, code }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(16,185,129,0.18)', marginTop: 20, marginBottom: 20 }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px',
        background: 'rgba(16,185,129,0.1)',
        borderBottom: '1px solid rgba(16,185,129,0.14)',
      }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#34d399' }}>{title}</span>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{language}</span>
          <button onClick={copy} style={{
            fontSize: 11, padding: '3px 10px', borderRadius: 6,
            background: copied ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.06)',
            border: `1px solid ${copied ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.1)'}`,
            color: copied ? '#34d399' : 'var(--text-secondary)',
            cursor: 'pointer', transition: 'all 0.2s',
          }}>
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      </div>
      <pre style={{
        margin: 0, padding: '20px 22px', overflowX: 'auto',
        background: 'rgba(10,10,10,0.85)',
        fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: 1.75,
        color: '#e2e8f0',
      }}>
        <code>{code}</code>
      </pre>
    </div>
  );
};

// ── Section Renderer ─────────────────────────────────────────────────────────
const SectionRenderer: React.FC<{ section: AISection }> = ({ section }) => {
  if (section.type === 'code' && section.code) {
    return <CodeBlock title={section.code.title} language={section.code.language} code={section.code.code} />;
  }

  if (section.type === 'tip') {
    return (
      <div style={{
        display: 'flex', gap: 12, alignItems: 'flex-start',
        background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.18)',
        borderRadius: 12, padding: '14px 18px', margin: '20px 0',
      }}>
        <Lightbulb size={16} color="#34d399" style={{ flexShrink: 0, marginTop: 2 }} />
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
          {section.content}
        </p>
      </div>
    );
  }

  if (section.type === 'warning') {
    return (
      <div style={{
        display: 'flex', gap: 12, alignItems: 'flex-start',
        background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.18)',
        borderRadius: 12, padding: '14px 18px', margin: '20px 0',
      }}>
        <AlertTriangle size={16} color="#fbbf24" style={{ flexShrink: 0, marginTop: 2 }} />
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
          {section.content}
        </p>
      </div>
    );
  }

  if (section.type === 'grid' && section.items) {
    return (
      <div style={{ marginTop: 20, marginBottom: 20 }}>
        {section.title && (
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>{section.title}</h3>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {section.items.map((item, i) => (
            <div key={i} style={{
              background: 'rgba(10,10,10,0.8)', border: '1px solid rgba(16,185,129,0.12)',
              borderRadius: 12, padding: '16px',
            }}>
              {item.emoji && <div style={{ fontSize: 24, marginBottom: 8 }}>{item.emoji}</div>}
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{item.title}</div>
              {item.badge && (
                <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 5, background: 'rgba(16,185,129,0.12)', color: '#34d399', fontWeight: 600, display: 'inline-block', marginBottom: 6 }}>
                  {item.badge}
                </span>
              )}
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (section.type === 'steps' && section.items) {
    return (
      <div style={{ marginTop: 20, marginBottom: 20 }}>
        {section.title && (
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>{section.title}</h3>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {section.items.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                background: 'linear-gradient(135deg, #10b981, #34d399)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 800, color: '#fff',
              }}>{i + 1}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{item.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default: text section
  return (
    <div style={{ marginTop: 20, marginBottom: 8 }}>
      {section.title && (
        <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12, lineHeight: 1.3 }}>{section.title}</h3>
      )}
      {section.content && (
        <div style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.85 }}>
          {section.content.split('\n').map((para, i) => {
            if (!para.trim()) return <div key={i} style={{ height: 10 }} />;
            // Bold handling (**text**)
            const parts = para.split(/(\*\*[^*]+\*\*)/g);
            return (
              <p key={i} style={{ margin: '0 0 8px' }}>
                {parts.map((part, j) =>
                  part.startsWith('**') && part.endsWith('**')
                    ? <strong key={j} style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{part.slice(2, -2)}</strong>
                    : <span key={j}>{part}</span>
                )}
              </p>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ── Main Component ───────────────────────────────────────────────────────────
export const AILearningHub: React.FC<AILearningHubProps> = ({ initialTopicId }) => {
  const [selectedId, setSelectedId] = useState<string>(initialTopicId || aiTopics[0].id);
  const [search, setSearch] = useState('');
  const [filterPhase, setFilterPhase] = useState<number | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem('ai-completed') || '[]')); }
    catch { return new Set(); }
  });
  const [likes, setLikes] = useState<Record<string, number>>(() => loadCounts('ai-likes'));
  const [likedByMe, setLikedByMe] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem('ai-liked-by-me') || '[]')); } catch { return new Set(); }
  });
  const [views, setViews] = useState<Record<string, number>>(() => loadCounts('ai-views'));

  const selected = aiTopics.find(t => t.id === selectedId) || aiTopics[0];

  // Increment view count when topic changes
  useEffect(() => {
    if (initialTopicId) setSelectedId(initialTopicId);
  }, [initialTopicId]);

  useEffect(() => {
    setViews(prev => {
      const next = { ...prev, [selectedId]: (prev[selectedId] || 0) + 1 };
      saveCounts('ai-views', next);
      return next;
    });
  }, [selectedId]);

  const toggleComplete = () => {
    setCompletedIds(prev => {
      const next = new Set(prev);
      next.has(selectedId) ? next.delete(selectedId) : next.add(selectedId);
      localStorage.setItem('ai-completed', JSON.stringify([...next]));
      return next;
    });
  };

  const toggleLike = () => {
    const alreadyLiked = likedByMe.has(selectedId);
    setLikes(prev => {
      const next = { ...prev, [selectedId]: Math.max(0, (prev[selectedId] || 0) + (alreadyLiked ? -1 : 1)) };
      saveCounts('ai-likes', next);
      return next;
    });
    setLikedByMe(prev => {
      const next = new Set(prev);
      alreadyLiked ? next.delete(selectedId) : next.add(selectedId);
      localStorage.setItem('ai-liked-by-me', JSON.stringify([...next]));
      return next;
    });
  };

  const filtered = aiTopics.filter(t => {
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
    const matchPhase = filterPhase === null || t.phase === filterPhase;
    return matchSearch && matchPhase;
  });

  const phaseColor = PHASE_COLORS[selected.phase];
  const isDone = completedIds.has(selectedId);

  return (
    <div style={{ display: 'flex', gap: 0, height: 'calc(100vh - 80px)', overflow: 'hidden' }}>
      {/* Sidebar list */}
      <div style={{
        width: 280, flexShrink: 0, overflowY: 'auto',
        borderRight: '1px solid rgba(16,185,129,0.1)',
        paddingRight: 0,
        display: 'flex', flexDirection: 'column', gap: 0,
      }}>
        {/* Search */}
        <div style={{ padding: '0 16px 12px 0', position: 'sticky', top: 0, background: 'var(--bg-main)', zIndex: 1, paddingTop: 2 }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search topics…"
              style={{
                width: '100%', padding: '8px 10px 8px 30px', borderRadius: 9,
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(16,185,129,0.14)',
                color: 'var(--text-primary)', fontSize: 13, outline: 'none',
              }}
            />
          </div>
          {/* Phase filters */}
          <div style={{ display: 'flex', gap: 5, marginTop: 8, flexWrap: 'wrap' }}>
            <button
              onClick={() => setFilterPhase(null)}
              style={{
                fontSize: 10, padding: '3px 8px', borderRadius: 6, cursor: 'pointer',
                background: filterPhase === null ? 'rgba(16,185,129,0.2)' : 'transparent',
                border: `1px solid ${filterPhase === null ? 'rgba(16,185,129,0.35)' : 'rgba(16,185,129,0.1)'}`,
                color: filterPhase === null ? '#34d399' : 'var(--text-muted)',
                fontWeight: 600,
              }}
            >All</button>
            {AI_PHASES.map(p => (
              <button key={p.id} onClick={() => setFilterPhase(filterPhase === p.id ? null : p.id)}
                style={{
                  fontSize: 10, padding: '3px 8px', borderRadius: 6, cursor: 'pointer',
                  background: filterPhase === p.id ? `${p.color}20` : 'transparent',
                  border: `1px solid ${filterPhase === p.id ? `${p.color}40` : 'rgba(16,185,129,0.1)'}`,
                  color: filterPhase === p.id ? p.color : 'var(--text-muted)',
                  fontWeight: 600,
                }}
              >P{p.id}</button>
            ))}
          </div>
        </div>

        {/* Topic list */}
        {filtered.map(topic => {
          const isActive = topic.id === selectedId;
          const done = completedIds.has(topic.id);
          const pc = PHASE_COLORS[topic.phase];
          return (
            <button key={topic.id} onClick={() => setSelectedId(topic.id)} style={{
              display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 12px 12px 0',
              borderBottom: '1px solid rgba(16,185,129,0.07)',
              background: isActive ? 'rgba(16,185,129,0.08)' : 'transparent',
              borderLeft: `3px solid ${isActive ? '#34d399' : 'transparent'}`,
              paddingLeft: isActive ? 9 : 12,
              cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left', width: '100%',
              border: 'none',
            }}>
              <span style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>{topic.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: done ? 600 : 500, color: isActive ? '#34d399' : (done ? '#34d399' : 'var(--text-primary)'), lineHeight: 1.35, marginBottom: 3 }}>
                  {topic.title}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 10, color: pc, fontWeight: 700 }}>P{topic.phase}</span>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>·</span>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{topic.readTime}m</span>
                  {(likes[topic.id] || 0) > 0 && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 10, color: '#f87171' }}>
                      <Heart size={9} fill="#f87171" /> {likes[topic.id]}
                    </span>
                  )}
                  {done && <CheckCircle2 size={11} color="#34d399" fill="#34d399" />}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Reading area */}
      <div style={{ flex: 1, overflowY: 'auto', paddingLeft: 40, paddingRight: 16 }}>
        {/* Article header */}
        <div style={{
          background: `linear-gradient(135deg, ${phaseColor}0d 0%, rgba(52,211,153,0.04) 100%)`,
          border: `1px solid ${phaseColor}25`,
          borderRadius: 18, padding: '32px 36px', marginBottom: 36, marginTop: 2,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: -30, right: -30, width: 150, height: 150,
            background: `radial-gradient(circle, ${phaseColor}18 0%, transparent 70%)`,
            borderRadius: '50%',
          }} />
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: 52, marginBottom: 14 }}>{selected.emoji}</div>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.25, marginBottom: 12 }}>
              {selected.title}
            </h1>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 18, maxWidth: 680 }}>
              {selected.summary}
            </p>
            {/* Meta chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 7, background: `${phaseColor}18`, color: phaseColor, fontWeight: 700 }}>
                Phase {selected.phase} — {selected.phaseName}
              </span>
              <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 7, ...DIFFICULTY_STYLE[selected.difficulty], fontWeight: 600 }}>
                {selected.difficulty}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)' }}>
                <Clock size={12} /> {selected.readTime} min read
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)' }}>
                <Eye size={12} /> {(views[selectedId] || 1).toLocaleString()} views
              </span>
              {/* Tags */}
              {selected.tags.slice(0, 3).map(tag => (
                <span key={tag} style={{ fontSize: 11, padding: '3px 9px', borderRadius: 6, background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {tag}
                </span>
              ))}
              {/* Like + Mark done */}
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
                <button onClick={toggleLike} style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '5px 12px', borderRadius: 8,
                  background: likedByMe.has(selectedId) ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${likedByMe.has(selectedId) ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.12)'}`,
                  color: likedByMe.has(selectedId) ? '#f87171' : 'var(--text-secondary)',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                }}>
                  <Heart size={13} fill={likedByMe.has(selectedId) ? '#f87171' : 'none'} />
                  {(likes[selectedId] || 0) > 0 ? (likes[selectedId] || 0) : 'Like'}
                </button>
                <button onClick={toggleComplete} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '5px 14px', borderRadius: 8,
                  background: isDone ? 'rgba(52,211,153,0.12)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${isDone ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.12)'}`,
                  color: isDone ? '#34d399' : 'var(--text-secondary)',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                }}>
                  <CheckCircle2 size={13} fill={isDone ? '#34d399' : 'none'} />
                  {isDone ? 'Completed' : 'Mark complete'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Article body */}
        <div style={{ maxWidth: 740 }}>
          {selected.sections.map((section, i) => (
            <SectionRenderer key={i} section={section} />
          ))}

          {/* Related topics */}
          {selected.relatedTopics.length > 0 && (
            <div style={{ marginTop: 48, paddingTop: 28, borderTop: '1px solid rgba(16,185,129,0.12)' }}>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
                Up next
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {selected.relatedTopics.map(rid => {
                  const rel = aiTopics.find(t => t.id === rid);
                  if (!rel) return null;
                  return (
                    <button key={rid} onClick={() => setSelectedId(rid)} style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                      background: 'rgba(10,10,10,0.7)', border: '1px solid rgba(16,185,129,0.12)',
                      borderRadius: 11, cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left',
                    }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(16,185,129,0.28)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(16,185,129,0.12)'; }}
                    >
                      <span style={{ fontSize: 22 }}>{rel.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{rel.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                          Phase {rel.phase} · {rel.readTime} min read
                        </div>
                      </div>
                      <ChevronRight size={16} color="var(--text-muted)" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          <div style={{ height: 60 }} />
        </div>
      </div>
    </div>
  );
};
