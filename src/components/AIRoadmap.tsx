import React, { useState } from 'react';
import { aiTopics, AI_PHASES } from '../data/aiCurriculum';
import { CheckCircle2, ChevronRight, Clock, BookOpen, Zap } from 'lucide-react';

interface AIRoadmapProps {
  onSelectTopic: (topicId: string) => void;
}

const DIFFICULTY_COLORS: Record<string, { bg: string; text: string }> = {
  Beginner:     { bg: 'rgba(52,211,153,0.12)', text: '#34d399' },
  Intermediate: { bg: 'rgba(129,140,248,0.12)', text: '#818cf8' },
  Advanced:     { bg: 'rgba(251,191,36,0.12)', text: '#fbbf24' },
};

export const AIRoadmap: React.FC<AIRoadmapProps> = ({ onSelectTopic }) => {
  const [completedIds, setCompletedIds] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem('ai-completed') || '[]')); }
    catch { return new Set(); }
  });

  const toggleComplete = (id: string) => {
    setCompletedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      localStorage.setItem('ai-completed', JSON.stringify([...next]));
      return next;
    });
  };

  const totalTopics = aiTopics.length;
  const completedCount = completedIds.size;
  const progressPct = Math.round((completedCount / totalTopics) * 100);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(34,211,238,0.06) 100%)',
        border: '1px solid rgba(99,102,241,0.18)',
        borderRadius: 20,
        padding: '36px 40px',
        marginBottom: 40,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -40, right: -40,
          width: 200, height: 200,
          background: 'radial-gradient(circle, rgba(129,140,248,0.15) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: 36 }}>🗺️</span>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                Agentic AI Developer Roadmap
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginTop: 4 }}>
                From AI basics to building autonomous agents — in the right order
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                {completedCount} / {totalTopics} topics completed
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#818cf8' }}>{progressPct}%</span>
            </div>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 6, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${progressPct}%`,
                background: 'linear-gradient(90deg, #6366f1, #22d3ee)',
                borderRadius: 6,
                transition: 'width 0.4s ease',
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* Phases */}
      {AI_PHASES.map((phase, phaseIdx) => {
        const phaseTopics = aiTopics.filter(t => t.phase === phase.id);
        const phaseCompleted = phaseTopics.filter(t => completedIds.has(t.id)).length;

        return (
          <div key={phase.id} style={{ marginBottom: 40 }}>
            {/* Phase Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              {/* Connector line */}
              {phaseIdx > 0 && (
                <div style={{
                  position: 'absolute',
                  marginTop: -20,
                  marginLeft: 20,
                  width: 2,
                  height: 20,
                  background: 'rgba(99,102,241,0.2)',
                }} />
              )}
              <div style={{
                width: 44, height: 44, borderRadius: 14,
                background: `${phase.color}18`,
                border: `1.5px solid ${phase.color}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, flexShrink: 0,
              }}>
                {phase.emoji}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: phase.color }}>
                    Phase {phase.id}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {phaseCompleted}/{phaseTopics.length} done
                  </span>
                </div>
                <h2 style={{ fontSize: 19, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                  {phase.name}
                </h2>
              </div>
            </div>

            {/* Topics grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14, paddingLeft: 4 }}>
              {phaseTopics.map(topic => {
                const done = completedIds.has(topic.id);
                const diff = DIFFICULTY_COLORS[topic.difficulty];
                return (
                  <div key={topic.id} style={{
                    background: done ? 'rgba(52,211,153,0.05)' : 'rgba(13,13,32,0.9)',
                    border: `1px solid ${done ? 'rgba(52,211,153,0.2)' : 'rgba(99,102,241,0.12)'}`,
                    borderRadius: 14,
                    padding: '18px 18px 14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                  }}
                    onClick={() => onSelectTopic(topic.id)}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLDivElement).style.borderColor = done ? 'rgba(52,211,153,0.4)' : 'rgba(99,102,241,0.3)';
                      (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLDivElement).style.borderColor = done ? 'rgba(52,211,153,0.2)' : 'rgba(99,102,241,0.12)';
                      (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                    }}
                  >
                    {/* Done check */}
                    <button
                      onClick={e => { e.stopPropagation(); toggleComplete(topic.id); }}
                      style={{
                        position: 'absolute', top: 14, right: 14,
                        background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                        color: done ? '#34d399' : 'var(--text-muted)',
                      }}
                      title={done ? 'Mark incomplete' : 'Mark complete'}
                    >
                      <CheckCircle2 size={18} fill={done ? '#34d399' : 'none'} />
                    </button>

                    <div style={{ fontSize: 28, marginBottom: 10 }}>{topic.emoji}</div>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: done ? '#34d399' : 'var(--text-primary)', lineHeight: 1.35, marginBottom: 8, paddingRight: 24 }}>
                      {topic.title}
                    </h3>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 12 }}>
                      {topic.summary.slice(0, 80)}…
                    </p>

                    {/* Meta row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: diff.bg, color: diff.text, fontWeight: 600 }}>
                        {topic.difficulty}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)' }}>
                        <Clock size={11} /> {topic.readTime} min
                      </span>
                    </div>

                    {/* Read button */}
                    <button
                      onClick={e => { e.stopPropagation(); onSelectTopic(topic.id); }}
                      style={{
                        marginTop: 12, width: '100%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        padding: '8px 0', borderRadius: 8,
                        background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.16)',
                        color: '#818cf8', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(99,102,241,0.15)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(99,102,241,0.08)'; }}
                    >
                      <BookOpen size={13} /> Read topic <ChevronRight size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Footer tip */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 12,
        background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.15)',
        borderRadius: 12, padding: '14px 18px', marginTop: 8,
      }}>
        <Zap size={16} color="#22d3ee" style={{ flexShrink: 0, marginTop: 2 }} />
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <strong style={{ color: '#22d3ee' }}>Pro tip:</strong> You don't need to complete every phase before building. After Phase 2 (LLM Ecosystem), start building something small using the AI APIs. Real projects accelerate learning faster than reading alone.
        </p>
      </div>
    </div>
  );
};
