import React, { useState } from 'react';
import { solidPrinciples } from '../data/solidData';
import { ShieldAlert, ShieldCheck, Code, Lightbulb, AlertTriangle, MessageSquare } from 'lucide-react';

interface SolidPrinciplesProps {
  activeId?: string;
  onSelectPrinciple?: (id: string) => void;
  isCompleted?: boolean;
  onToggleComplete?: (id: string) => void;
}

export const SolidPrinciples: React.FC<SolidPrinciplesProps> = ({
  activeId: propActiveId,
  onSelectPrinciple,
  isCompleted = false,
  onToggleComplete,
}) => {
  const [internalActiveId, setInternalActiveId] = useState(solidPrinciples[0].id);
  const [codeMode, setCodeMode] = useState<'violation' | 'solution'>('violation');

  const activeId = propActiveId !== undefined ? propActiveId : internalActiveId;

  const handleSelect = (id: string) => {
    setCodeMode('violation');
    if (onSelectPrinciple) onSelectPrinciple(id);
    else setInternalActiveId(id);
  };

  const p = solidPrinciples.find(x => x.id === activeId) || solidPrinciples[0];

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>

      {/* Page Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 className="glow-text section-h1" style={{ marginBottom: '6px' }}>SOLID Principles</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '560px' }}>
          Five principles of object-oriented design that make code maintainable, testable, and extensible. Master these and you'll never write a God class again.
        </p>
      </div>

      {/* Principle Tabs — S O L I D pills */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', flexWrap: 'wrap' }}>
        {solidPrinciples.map(pr => (
          <button
            key={pr.id}
            onClick={() => handleSelect(pr.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 18px',
              borderRadius: '10px',
              border: '1px solid',
              borderColor: activeId === pr.id ? `${pr.color}44` : 'var(--border-glass)',
              background: activeId === pr.id ? `${pr.color}0d` : 'transparent',
              cursor: 'pointer',
              transition: 'var(--transition-smooth)',
              flexShrink: 0,
            }}
          >
            {/* Big letter */}
            <span style={{
              width: '32px', height: '32px',
              borderRadius: '8px',
              background: activeId === pr.id ? `${pr.color}22` : 'rgba(255,255,255,0.04)',
              border: `1px solid ${activeId === pr.id ? pr.color + '55' : 'var(--border-glass)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '16px', fontWeight: 900,
              color: activeId === pr.id ? pr.color : 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              transition: 'all 0.2s',
            }}>
              {pr.letter}
            </span>
            <span style={{
              fontSize: '13px',
              fontWeight: 600,
              color: activeId === pr.id ? 'var(--text-primary)' : 'var(--text-secondary)',
            }}>
              {pr.shortName}
            </span>
          </button>
        ))}

        {/* Spacer + complete button */}
        {onToggleComplete && (
          <button
            onClick={() => onToggleComplete(p.id)}
            style={{
              marginLeft: 'auto',
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '10px 16px', borderRadius: '10px', border: '1px solid',
              borderColor: isCompleted ? 'rgba(45,212,191,0.35)' : 'var(--border-glass)',
              background: isCompleted ? 'rgba(45,212,191,0.07)' : 'transparent',
              color: isCompleted ? '#2dd4bf' : 'var(--text-muted)',
              fontSize: '12px', fontWeight: 600, cursor: 'pointer',
              transition: 'var(--transition-smooth)',
              flexShrink: 0,
            }}
          >
            {isCompleted ? '✓ Completed' : 'Mark done'}
          </button>
        )}
      </div>

      {/* ── HERO: Letter + mnemonic + analogy ── */}
      <div style={{
        padding: '28px 32px',
        borderRadius: '14px',
        border: `1px solid ${p.color}33`,
        background: `${p.color}07`,
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '28px',
        flexWrap: 'wrap',
      }}>
        {/* Giant letter */}
        <div style={{
          width: '80px', height: '80px', flexShrink: 0,
          borderRadius: '20px',
          background: `${p.color}15`,
          border: `2px solid ${p.color}44`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '48px', fontWeight: 900,
          color: p.color,
          fontFamily: 'var(--font-mono)',
        }}>
          {p.letter}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Label */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '3px 10px', borderRadius: '20px', marginBottom: '10px',
            background: `${p.color}18`, border: `1px solid ${p.color}33`,
            fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em',
            color: p.color,
          }}>
            {p.shortName} · {p.fullName}
          </div>

          {/* Mnemonic — the memory anchor */}
          <p style={{
            fontSize: '20px', fontWeight: 800,
            color: 'var(--text-primary)', margin: '0 0 10px 0',
            lineHeight: 1.3,
          }}>
            "{p.mnemonic}"
          </p>

          {/* Definition */}
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.7, fontStyle: 'italic' }}>
            {p.definition}
          </p>
        </div>
      </div>

      {/* ── ANALOGY + EXPLANATION row ── */}
      <div className="solid-learn-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '16px', marginBottom: '16px' }}>

        {/* Analogy card */}
        <div style={{
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid var(--border-glass)',
          background: 'var(--surface-obsidian)',
          display: 'flex', flexDirection: 'column', gap: '12px',
        }}>
          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Lightbulb size={12} style={{ color: p.color }} />
            Real-World Analogy
          </div>
          <div style={{ fontSize: '32px', textAlign: 'center', padding: '8px 0' }}>{p.analogyEmoji}</div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0 }}>
            {p.analogy}
          </p>
        </div>

        {/* Explanation bullets */}
        <div style={{
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid var(--border-glass)',
          background: 'var(--surface-obsidian)',
        }}>
          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '14px' }}>
            How It Works
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {p.explanation.map((exp, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                <span style={{
                  minWidth: '20px', height: '20px',
                  borderRadius: '50%',
                  background: `${p.color}18`,
                  border: `1px solid ${p.color}33`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '10px', fontWeight: 800, color: p.color,
                  flexShrink: 0, marginTop: '1px',
                }}>
                  {i + 1}
                </span>
                <span>{exp}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CODE: Violation vs Solution ── */}
      <div style={{
        borderRadius: '12px',
        border: '1px solid var(--border-glass)',
        background: 'var(--surface-obsidian)',
        marginBottom: '16px',
        overflow: 'hidden',
      }}>
        {/* Tab row */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-glass)' }}>
          <button
            onClick={() => setCodeMode('violation')}
            style={{
              flex: 1, padding: '12px 20px',
              background: codeMode === 'violation' ? 'rgba(239,68,68,0.06)' : 'transparent',
              border: 'none', borderRight: '1px solid var(--border-glass)',
              borderBottom: codeMode === 'violation' ? '2px solid #ef4444' : '2px solid transparent',
              color: codeMode === 'violation' ? '#ef4444' : 'var(--text-muted)',
              fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              transition: 'all 0.15s',
            }}
          >
            <ShieldAlert size={15} />
            ❌ Violation — what NOT to do
          </button>
          <button
            onClick={() => setCodeMode('solution')}
            style={{
              flex: 1, padding: '12px 20px',
              background: codeMode === 'solution' ? `${p.color}08` : 'transparent',
              border: 'none',
              borderBottom: codeMode === 'solution' ? `2px solid ${p.color}` : '2px solid transparent',
              color: codeMode === 'solution' ? p.color : 'var(--text-muted)',
              fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              transition: 'all 0.15s',
            }}
          >
            <ShieldCheck size={15} />
            ✓ Refactored — the SOLID way
          </button>
        </div>

        {/* Code label bar */}
        <div style={{
          padding: '8px 20px',
          borderBottom: '1px solid var(--border-glass)',
          background: 'rgba(255,255,255,0.01)',
          display: 'flex', alignItems: 'center', gap: '8px',
          fontSize: '11px', color: 'var(--text-muted)',
        }}>
          <Code size={12} />
          TypeScript
          <span style={{ marginLeft: 'auto', fontWeight: 700,
            color: codeMode === 'violation' ? '#ef4444' : p.color,
            background: codeMode === 'violation' ? 'rgba(239,68,68,0.08)' : `${p.color}12`,
            padding: '2px 8px', borderRadius: '4px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            {codeMode === 'violation' ? 'Violation' : 'Solution'}
          </span>
        </div>

        <pre style={{ margin: 0, padding: '20px', maxHeight: '400px', overflowY: 'auto', fontSize: '12.5px', lineHeight: 1.7 }}>
          <code style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            {codeMode === 'violation' ? p.violationCode : p.solutionCode}
          </code>
        </pre>
      </div>

      {/* ── BOTTOM ROW: Interview answer + Common mistakes ── */}
      <div className="solid-learn-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

        {/* Interview answer */}
        <div style={{
          padding: '20px',
          borderRadius: '12px',
          border: `1px solid ${p.color}25`,
          background: `${p.color}06`,
          borderLeft: `3px solid ${p.color}`,
        }}>
          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: p.color, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MessageSquare size={12} />
            Interview Answer
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.75, margin: 0, fontWeight: 500 }}>
            "{p.interviewAnswer}"
          </p>
        </div>

        {/* Common mistakes */}
        <div style={{
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid rgba(251,191,36,0.2)',
          background: 'rgba(251,191,36,0.04)',
        }}>
          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-gold)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertTriangle size={12} />
            Common Mistakes
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {p.commonMistakes.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                <span style={{ color: 'var(--color-gold)', flexShrink: 0, marginTop: '1px' }}>⚠</span>
                <span>{m}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
