import React, { useState } from 'react';
import { aiTopics, AI_PHASES } from '../data/aiCurriculum';
import { CheckCircle2, ChevronDown, ChevronRight, Clock, BookOpen, Zap, Circle } from 'lucide-react';

interface AIRoadmapProps {
  onSelectTopic: (topicId: string) => void;
}

export const AIRoadmap: React.FC<AIRoadmapProps> = ({ onSelectTopic }) => {
  const [completedIds, setCompletedIds] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem('ai-completed') || '[]')); }
    catch { return new Set(); }
  });
  const [expandedPhases, setExpandedPhases] = useState<Set<number>>(() => new Set([1]));

  const toggleComplete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompletedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      localStorage.setItem('ai-completed', JSON.stringify([...next]));
      return next;
    });
  };

  const togglePhase = (phaseId: number) => {
    setExpandedPhases(prev => {
      const next = new Set(prev);
      next.has(phaseId) ? next.delete(phaseId) : next.add(phaseId);
      return next;
    });
  };

  const totalTopics = aiTopics.length;
  const completedCount = completedIds.size;
  const progressPct = Math.round((completedCount / totalTopics) * 100);

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span style={{ fontSize: 28 }}>🗺️</span>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.2 }}>
            Agentic AI Developer Roadmap
          </h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>
          From AI basics to building autonomous agents — follow phases in order for best results.
        </p>

        {/* Progress bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ flex: 1, height: 5, background: 'var(--border-glass)', borderRadius: 5, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${progressPct}%`,
              background: 'linear-gradient(90deg, #10b981, #34d399)',
              borderRadius: 5, transition: 'width 0.4s ease',
            }} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#10b981', whiteSpace: 'nowrap' }}>
            {completedCount}/{totalTopics} done · {progressPct}%
          </span>
        </div>
      </div>

      {/* Flow diagram */}
      <div style={{ position: 'relative' }}>
        {AI_PHASES.map((phase, phaseIdx) => {
          const phaseTopics = aiTopics.filter(t => t.phase === phase.id);
          const phaseCompleted = phaseTopics.filter(t => completedIds.has(t.id)).length;
          const isExpanded = expandedPhases.has(phase.id);
          const allDone = phaseCompleted === phaseTopics.length;
          const isLast = phaseIdx === AI_PHASES.length - 1;

          return (
            <div key={phase.id} style={{ position: 'relative' }}>
              {/* Vertical connector line */}
              {!isLast && (
                <div style={{
                  position: 'absolute',
                  left: 21,
                  top: 56,
                  width: 2,
                  bottom: isExpanded ? 0 : -24,
                  background: allDone
                    ? 'linear-gradient(180deg, #10b981, #34d399)'
                    : 'var(--border-glass)',
                  zIndex: 0,
                }} />
              )}

              {/* Phase header row */}
              <button
                onClick={() => togglePhase(phase.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  width: '100%', padding: '14px 0',
                  background: 'none', border: 'none', cursor: 'pointer',
                  textAlign: 'left', position: 'relative', zIndex: 1,
                }}
              >
                {/* Phase node circle */}
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: allDone
                    ? 'rgba(16,185,129,0.15)'
                    : `${phase.color}10`,
                  border: `2px solid ${allDone ? '#10b981' : phase.color}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, flexShrink: 0,
                }}>
                  {allDone ? <CheckCircle2 size={20} color="#10b981" /> : phase.emoji}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span style={{
                      fontSize: 10, fontWeight: 800, letterSpacing: '0.1em',
                      textTransform: 'uppercase', color: phase.color,
                    }}>
                      Phase {phase.id}
                    </span>
                    <span style={{
                      fontSize: 10, color: 'var(--text-muted)',
                      background: 'var(--border-glass)', padding: '1px 7px',
                      borderRadius: 4, fontWeight: 600,
                    }}>
                      {phaseCompleted}/{phaseTopics.length}
                    </span>
                    {allDone && (
                      <span style={{
                        fontSize: 9, fontWeight: 800, color: '#10b981',
                        background: 'rgba(16,185,129,0.12)', padding: '1px 7px',
                        borderRadius: 4, letterSpacing: '0.05em',
                      }}>DONE</span>
                    )}
                  </div>
                  <span style={{
                    fontSize: 16, fontWeight: 800,
                    color: allDone ? '#10b981' : 'var(--text-primary)',
                  }}>
                    {phase.name}
                  </span>
                </div>

                <div style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>
              </button>

              {/* Topics list */}
              {isExpanded && (
                <div style={{ marginLeft: 58, marginBottom: 8 }}>
                  {phaseTopics.map((topic, topicIdx) => {
                    const done = completedIds.has(topic.id);
                    const isLastTopic = topicIdx === phaseTopics.length - 1;

                    return (
                      <div key={topic.id} style={{ position: 'relative' }}>
                        {/* Topic connector */}
                        {!isLastTopic && (
                          <div style={{
                            position: 'absolute', left: 8, top: 42,
                            width: 1, height: 'calc(100% - 20px)',
                            background: 'var(--border-glass)',
                          }} />
                        )}

                        <div
                          style={{
                            display: 'flex', alignItems: 'flex-start', gap: 12,
                            padding: '10px 12px', borderRadius: 10,
                            cursor: 'pointer', transition: 'background 0.15s',
                            background: done ? 'rgba(16,185,129,0.04)' : 'transparent',
                          }}
                          onMouseEnter={e => {
                            if (!done) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)';
                          }}
                          onMouseLeave={e => {
                            (e.currentTarget as HTMLDivElement).style.background = done ? 'rgba(16,185,129,0.04)' : 'transparent';
                          }}
                          onClick={() => onSelectTopic(topic.id)}
                        >
                          {/* Topic dot */}
                          <div style={{
                            width: 18, height: 18, marginTop: 2, flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            {done
                              ? <CheckCircle2 size={16} color="#10b981" fill="rgba(16,185,129,0.15)" />
                              : <Circle size={14} color="var(--text-muted)" />
                            }
                          </div>

                          {/* Content */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                              <span style={{ fontSize: 14 }}>{topic.emoji}</span>
                              <span style={{
                                fontSize: 13, fontWeight: 600,
                                color: done ? '#10b981' : 'var(--text-primary)',
                              }}>
                                {topic.title}
                              </span>
                            </div>
                            <p style={{
                              fontSize: 11, color: 'var(--text-muted)',
                              lineHeight: 1.5, margin: 0,
                            }}>
                              {topic.summary.slice(0, 90)}…
                            </p>
                          </div>

                          {/* Meta + actions */}
                          <div style={{
                            display: 'flex', flexDirection: 'column',
                            alignItems: 'flex-end', gap: 6, flexShrink: 0,
                          }}>
                            <div style={{
                              display: 'flex', alignItems: 'center', gap: 4,
                              fontSize: 10, color: 'var(--text-muted)',
                            }}>
                              <Clock size={10} /> {topic.readTime}m
                            </div>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button
                                onClick={(e) => toggleComplete(topic.id, e)}
                                style={{
                                  fontSize: 10, padding: '3px 8px', borderRadius: 5,
                                  border: `1px solid ${done ? 'rgba(16,185,129,0.3)' : 'var(--border-glass)'}`,
                                  background: done ? 'rgba(16,185,129,0.1)' : 'transparent',
                                  color: done ? '#10b981' : 'var(--text-muted)',
                                  cursor: 'pointer', fontWeight: 600,
                                }}
                                title={done ? 'Mark incomplete' : 'Mark complete'}
                              >
                                {done ? '✓ Done' : 'Mark done'}
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); onSelectTopic(topic.id); }}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: 3,
                                  fontSize: 10, padding: '3px 8px', borderRadius: 5,
                                  border: '1px solid rgba(16,185,129,0.2)',
                                  background: 'rgba(16,185,129,0.07)',
                                  color: '#10b981', cursor: 'pointer', fontWeight: 600,
                                }}
                              >
                                <BookOpen size={9} /> Read
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Arrow between phases */}
              {!isLast && (
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'flex-start',
                  paddingLeft: 14, paddingBottom: 4,
                  color: 'var(--text-muted)', fontSize: 10, letterSpacing: '0.05em',
                }}>
                  <span style={{ fontSize: 16, lineHeight: 1, opacity: 0.3 }}>↓</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer tip */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 10,
        background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.12)',
        borderRadius: 10, padding: '12px 16px', marginTop: 24,
      }}>
        <Zap size={14} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} />
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
          <strong style={{ color: '#10b981' }}>Pro tip:</strong> After Phase 2, start building something real with AI APIs. Projects accelerate learning faster than reading alone.
        </p>
      </div>
    </div>
  );
};
