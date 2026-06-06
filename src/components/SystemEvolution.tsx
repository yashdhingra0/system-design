import React, { useState } from 'react';
import { systemEvolutions } from '../data/systemEvolutions';
import type { EvolutionStage, SystemEvolution as SystemEvolutionType } from '../data/systemEvolutions';
import { ChevronLeft, Users, Zap, Database, AlertCircle, CheckCircle2, ArrowRight, Layers } from 'lucide-react';

/* ─────────────────────────────────────────────
   Gallery Card
───────────────────────────────────────────── */
const CompanyCard: React.FC<{
  evolution: SystemEvolutionType;
  onClick: () => void;
}> = ({ evolution, onClick }) => (
  <button
    onClick={onClick}
    style={{
      background: 'var(--surface-obsidian)',
      border: '1px solid var(--border-glass)',
      borderRadius: '16px',
      padding: '28px',
      textAlign: 'left',
      cursor: 'pointer',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      width: '100%',
    }}
    onMouseEnter={e => {
      (e.currentTarget as HTMLElement).style.borderColor = `${evolution.stages[0].color}55`;
      (e.currentTarget as HTMLElement).style.boxShadow = `0 0 28px ${evolution.stages[0].color}15`;
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-glass)';
      (e.currentTarget as HTMLElement).style.boxShadow = '';
    }}
  >
    {/* Emoji + name */}
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
      <span style={{ fontSize: '38px', lineHeight: 1 }}>{evolution.emoji}</span>
      <div>
        <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
          {evolution.company}
        </h3>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
          {evolution.stages.length} stages · {evolution.stages[0].year}–{evolution.stages[evolution.stages.length - 1].year}
        </span>
      </div>
    </div>

    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.65, margin: '0 0 16px 0' }}>
      {evolution.tagline}
    </p>

    {/* Year pills */}
    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
      {evolution.stages.map(s => (
        <span key={s.year} style={{
          padding: '3px 9px',
          borderRadius: '20px',
          fontSize: '11px',
          fontWeight: 700,
          background: `${s.color}18`,
          border: `1px solid ${s.color}33`,
          color: s.color === '#000000' ? 'var(--text-secondary)' : s.color,
        }}>
          {s.year}
        </span>
      ))}
    </div>
  </button>
);

/* ─────────────────────────────────────────────
   Timeline Dot
───────────────────────────────────────────── */
const TimelineDot: React.FC<{
  stage: EvolutionStage;
  isActive: boolean;
  isFirst: boolean;
  isLast: boolean;
  onClick: () => void;
}> = ({ stage, isActive, isFirst, isLast, onClick }) => {
  const dotColor = stage.color === '#000000' || stage.color === '#1a1a1a' || stage.color === '#333333' || stage.color === '#444444' || stage.color === '#555555'
    ? '#94a3b8'
    : stage.color;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', flex: 1 }}>
      {/* Connector line */}
      {!isFirst && (
        <div style={{
          position: 'absolute',
          right: '50%',
          top: '20px',
          width: '100%',
          height: '2px',
          background: isActive ? `linear-gradient(90deg, ${dotColor}44, ${dotColor}99)` : 'var(--border-glass)',
          zIndex: 0,
          transition: 'background 0.3s',
        }} />
      )}
      {!isLast && (
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '20px',
          width: '100%',
          height: '2px',
          background: 'var(--border-glass)',
          zIndex: 0,
        }} />
      )}

      {/* Dot */}
      <button
        onClick={onClick}
        style={{
          width: '40px', height: '40px',
          borderRadius: '50%',
          border: '2px solid',
          borderColor: isActive ? dotColor : 'var(--border-glass)',
          background: isActive ? `${dotColor}22` : 'var(--surface-obsidian)',
          cursor: 'pointer',
          zIndex: 1,
          position: 'relative',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.25s',
          boxShadow: isActive ? `0 0 18px ${dotColor}44` : 'none',
          flexShrink: 0,
        }}
      >
        <span style={{
          fontSize: '11px', fontWeight: 800,
          color: isActive ? dotColor : 'var(--text-muted)',
        }}>
          {String(stage.year).slice(2)}
        </span>
      </button>

      {/* Year label */}
      <span style={{
        fontSize: '10px',
        fontWeight: 700,
        color: isActive ? dotColor : 'var(--text-muted)',
        marginTop: '6px',
        whiteSpace: 'nowrap',
        transition: 'color 0.25s',
      }}>
        {stage.year}
      </span>

      {/* Stage title below */}
      <span style={{
        fontSize: '9px',
        color: isActive ? 'var(--text-secondary)' : 'var(--text-muted)',
        marginTop: '2px',
        textAlign: 'center',
        maxWidth: '80px',
        lineHeight: 1.3,
        transition: 'color 0.25s',
      }}>
        {stage.title}
      </span>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Stage Detail Panel
───────────────────────────────────────────── */
const StageDetail: React.FC<{
  stage: EvolutionStage;
  stageIndex: number;
  totalStages: number;
  onPrev: () => void;
  onNext: () => void;
}> = ({ stage, stageIndex, totalStages, onPrev, onNext }) => {
  const accentColor = stage.color === '#000000' || stage.color === '#1a1a1a' || stage.color === '#333333' || stage.color === '#444444' || stage.color === '#555555'
    ? '#94a3b8' : stage.color;

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      {/* Stage header */}
      <div className="stage-header-row" style={{
        padding: '24px',
        borderRadius: '14px',
        border: `1px solid ${accentColor}33`,
        background: `${accentColor}08`,
        marginBottom: '20px',
      }}>
        <div style={{ flex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '3px 10px', borderRadius: '20px', marginBottom: '10px',
            background: `${accentColor}18`, border: `1px solid ${accentColor}33`,
            fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
            color: accentColor,
          }}>
            {stage.year}
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 4px 0' }}>{stage.title}</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, fontStyle: 'italic' }}>
            {stage.subtitle}
          </p>
        </div>

        {/* Prev / Next */}
        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
          <button
            onClick={onPrev} disabled={stageIndex === 0}
            style={{
              padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--border-glass)',
              background: 'transparent', color: stageIndex === 0 ? 'var(--text-muted)' : 'var(--text-secondary)',
              cursor: stageIndex === 0 ? 'not-allowed' : 'pointer', fontSize: '12px', fontWeight: 600,
              transition: 'all 0.2s',
            }}
          >
            ← Prev
          </button>
          <button
            onClick={onNext} disabled={stageIndex === totalStages - 1}
            style={{
              padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--border-glass)',
              background: 'transparent', color: stageIndex === totalStages - 1 ? 'var(--text-muted)' : 'var(--text-secondary)',
              cursor: stageIndex === totalStages - 1 ? 'not-allowed' : 'pointer', fontSize: '12px', fontWeight: 600,
              transition: 'all 0.2s',
            }}
          >
            Next →
          </button>
        </div>
      </div>

      {/* Scale stats */}
      <div className="grid-3-col" style={{ marginBottom: '20px' }}>
        {[
          { icon: <Users size={14} />, label: 'Scale', value: stage.scale.users },
          { icon: <Zap size={14} />, label: 'Traffic', value: stage.scale.requests },
          { icon: <Database size={14} />, label: 'Data', value: stage.scale.data },
        ].map(({ icon, label, value }) => (
          <div key={label} style={{
            padding: '14px 16px',
            borderRadius: '10px',
            border: '1px solid var(--border-glass)',
            background: 'var(--surface-obsidian)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
              {icon} {label}
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Architecture description */}
      <div style={{
        padding: '20px 24px',
        borderRadius: '12px',
        border: '1px solid var(--border-glass)',
        background: 'var(--surface-obsidian)',
        marginBottom: '20px',
      }}>
        <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Layers size={11} /> Architecture Overview
        </div>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0 }}>
          {stage.architecture}
        </p>
      </div>

      {/* Tech Stack */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '10px' }}>
          Tech Stack
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {stage.stack.map(tech => (
            <span key={tech} style={{
              padding: '5px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
              background: `${accentColor}10`, border: `1px solid ${accentColor}25`,
              color: accentColor === '#94a3b8' ? 'var(--text-secondary)' : accentColor,
            }}>
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Key Decisions */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CheckCircle2 size={12} style={{ color: accentColor }} /> Key Decisions
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {stage.keyDecisions.map((d, i) => (
            <div key={i} style={{
              padding: '16px 20px',
              borderRadius: '10px',
              border: `1px solid ${accentColor}22`,
              background: `${accentColor}06`,
            }}>
              <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: accentColor, fontSize: '11px', fontWeight: 800, background: `${accentColor}18`, padding: '2px 8px', borderRadius: '6px' }}>
                  Decision
                </span>
                {d.what}
              </div>
              <div className="grid-2-col" style={{ gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-teal)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                    Why
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>{d.why}</p>
                </div>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                    Tradeoff
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>{d.tradeoff}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pain Points */}
      <div>
        <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <AlertCircle size={12} style={{ color: '#ef4444' }} /> Pain Points at this Stage
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {stage.painPoints.map((pain, i) => (
            <div key={i} style={{ display: 'flex', gap: '10px', fontSize: '13px', color: 'var(--text-secondary)', alignItems: 'flex-start' }}>
              <ArrowRight size={13} style={{ color: '#ef4444', marginTop: '2px', flexShrink: 0 }} />
              <span>{pain}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */
export const SystemEvolution: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeStageIndex, setActiveStageIndex] = useState(0);

  const evolution = selectedId ? systemEvolutions.find(e => e.id === selectedId) : null;

  const handleSelectCompany = (id: string) => {
    setSelectedId(id);
    setActiveStageIndex(0);
  };

  const handleBack = () => {
    setSelectedId(null);
    setActiveStageIndex(0);
  };

  /* ── Detail view ── */
  if (evolution) {
    const activeStage = evolution.stages[activeStageIndex];
    const accentColor = activeStage.color === '#000000' || activeStage.color === '#1a1a1a' || activeStage.color === '#333333' || activeStage.color === '#444444' || activeStage.color === '#555555'
      ? '#94a3b8' : activeStage.color;

    return (
      <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
        {/* Back row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
          <button
            onClick={handleBack}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'transparent', border: '1px solid var(--border-glass)',
              color: 'var(--text-secondary)', borderRadius: '8px',
              padding: '8px 14px', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
              transition: 'all 0.2s',
            }}
          >
            <ChevronLeft size={15} /> All Companies
          </button>
          <span style={{ fontSize: '28px' }}>{evolution.emoji}</span>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>{evolution.company}</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>Architecture Evolution</p>
          </div>
        </div>

        {/* Lesson callout */}
        <div style={{
          padding: '14px 20px',
          borderRadius: '10px',
          border: `1px solid ${accentColor}33`,
          background: `${accentColor}06`,
          marginBottom: '28px',
          fontSize: '13px',
          color: 'var(--text-secondary)',
          lineHeight: 1.7,
          borderLeft: `3px solid ${accentColor}`,
        }}>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Key Lesson: </span>
          {evolution.lesson}
        </div>

        {/* Timeline row */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0',
          marginBottom: '32px',
          padding: '20px 24px',
          borderRadius: '12px',
          border: '1px solid var(--border-glass)',
          background: 'var(--surface-obsidian)',
          overflowX: 'auto',
        }}>
          {evolution.stages.map((stage, i) => (
            <TimelineDot
              key={stage.year}
              stage={stage}
              isActive={activeStageIndex === i}
              isFirst={i === 0}
              isLast={i === evolution.stages.length - 1}
              onClick={() => setActiveStageIndex(i)}
            />
          ))}
        </div>

        {/* Stage detail */}
        <StageDetail
          stage={activeStage}
          stageIndex={activeStageIndex}
          totalStages={evolution.stages.length}
          onPrev={() => setActiveStageIndex(i => Math.max(0, i - 1))}
          onNext={() => setActiveStageIndex(i => Math.min(evolution.stages.length - 1, i + 1))}
        />
      </div>
    );
  }

  /* ── Gallery view ── */
  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 className="glow-text section-h1">
          System Evolution
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', maxWidth: '600px' }}>
          See how real companies evolved their architecture from a weekend hack to a global platform — including the exact decisions made and tradeoffs accepted at each stage.
        </p>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          marginTop: '12px', padding: '6px 14px', borderRadius: '20px',
          background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)',
          fontSize: '11px', color: 'var(--color-primary)', fontWeight: 700,
        }}>
          ✦ Exclusive feature — no other platform shows you the evolution story
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {systemEvolutions.map(ev => (
          <CompanyCard key={ev.id} evolution={ev} onClick={() => handleSelectCompany(ev.id)} />
        ))}
      </div>
    </div>
  );
};
