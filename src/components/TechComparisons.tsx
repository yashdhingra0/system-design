import React, { useState } from 'react';
import { techComparisons } from '../data/techComparisons';
import type { TechComparison } from '../data/techComparisons';
import { CheckCircle, XCircle, Lightbulb, ArrowRight } from 'lucide-react';

type FilterCategory = 'All' | TechComparison['category'];

const CATEGORY_COLORS: Record<string, string> = {
  Databases:    'var(--color-primary)',
  Messaging:    'var(--color-secondary)',
  API:          'var(--color-teal)',
  Architecture: 'var(--color-gold)',
  Networking:   '#a78bfa',
  Caching:      '#fb7185',
  Storage:      '#34d399',
};

const CATEGORY_BG: Record<string, string> = {
  Databases:    'rgba(99,102,241,0.08)',
  Messaging:    'rgba(14,165,233,0.08)',
  API:          'rgba(16,185,129,0.08)',
  Architecture: 'rgba(245,158,11,0.08)',
  Networking:   'rgba(167,139,250,0.08)',
  Caching:      'rgba(251,113,133,0.08)',
  Storage:      'rgba(52,211,153,0.08)',
};

interface ComparisonDetailProps {
  comparison: TechComparison;
}

const ComparisonDetail: React.FC<ComparisonDetailProps> = ({ comparison }) => {
  const color = CATEGORY_COLORS[comparison.category] || 'var(--color-primary)';
  const bg = CATEGORY_BG[comparison.category] || 'rgba(99,102,241,0.08)';

  const options = [
    comparison.optionA,
    comparison.optionB,
    ...(comparison.optionC ? [comparison.optionC] : []),
  ];

  const colWidth = options.length === 3 ? '1fr 1fr 1fr' : '1fr 1fr';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: '28px', borderColor: `${color}33`, background: bg }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
          <span style={{ fontSize: '32px' }}>{comparison.emoji}</span>
          <div>
            <span style={{
              display: 'inline-block', fontSize: '10px', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.05em',
              padding: '2px 8px', borderRadius: '6px', marginBottom: '4px',
              background: bg, color, border: `1px solid ${color}44`
            }}>
              {comparison.category}
            </span>
            <h2 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>{comparison.title}</h2>
          </div>
        </div>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
          {comparison.summary}
        </p>
      </div>

      {/* Side-by-side comparison */}
      <div className="grid-compare" style={{ gridTemplateColumns: colWidth }}>
        {options.map((option, idx) => (
          <div key={idx} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Option Header */}
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '4px' }}>{option.name}</h3>
              <p style={{ fontSize: '12px', color, fontStyle: 'italic', margin: 0 }}>{option.tagline}</p>
            </div>

            {/* Pros */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-teal)', marginBottom: '8px' }}>
                ✓ Strengths
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {option.pros.map((pro, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <CheckCircle size={12} style={{ color: 'var(--color-teal)', marginTop: '2px', flexShrink: 0 }} />
                    <span>{pro}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cons */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#ef4444', marginBottom: '8px' }}>
                ✗ Weaknesses
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {option.cons.map((con, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <XCircle size={12} style={{ color: '#ef4444', marginTop: '2px', flexShrink: 0 }} />
                    <span>{con}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Use Cases */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Use Cases
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {option.useCases.map((uc, i) => (
                  <div key={i} style={{ display: 'flex', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <ArrowRight size={11} style={{ color, marginTop: '2px', flexShrink: 0 }} />
                    <span>{uc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Examples */}
            <div style={{ marginTop: 'auto' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Real Examples
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {option.examples.map((ex, i) => (
                  <span key={i} style={{
                    padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
                    background: bg, color, border: `1px solid ${color}33`
                  }}>
                    {ex}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Verdict */}
      <div className="glass-panel" style={{
        padding: '24px',
        background: 'rgba(245,158,11,0.04)',
        borderColor: 'rgba(245,158,11,0.2)',
      }}>
        <h4 style={{ fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px', color: 'var(--color-gold)' }}>
          <Lightbulb size={15} />
          When to Use Which
        </h4>
        <div className="grid-compare" style={{ gridTemplateColumns: options.length === 3 ? '1fr 1fr 1fr' : '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.15)' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-secondary)', marginBottom: '6px' }}>
              Use {comparison.optionA.name.split(' ')[0]}
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              {comparison.verdict.useA}
            </p>
          </div>
          <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-primary)', marginBottom: '6px' }}>
              Use {comparison.optionB.name.split(' ')[0]}
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              {comparison.verdict.useB}
            </p>
          </div>
          {comparison.optionC && comparison.verdict.useC && (
            <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-teal)', marginBottom: '6px' }}>
                Use {comparison.optionC.name.split(' ')[0]}
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                {comparison.verdict.useC}
              </p>
            </div>
          )}
        </div>
        <div style={{
          padding: '12px 16px', borderRadius: '8px',
          background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)'
        }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            TL;DR —
          </span>
          <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>
            {' '}{comparison.verdict.tldr}
          </span>
        </div>
      </div>
    </div>
  );
};

export const TechComparisons: React.FC = () => {
  const [filter, setFilter] = useState<FilterCategory>('All');
  const [selectedId, setSelectedId] = useState<string>(techComparisons[0].id);

  const categories: FilterCategory[] = [
    'All', 'Databases', 'Messaging', 'API', 'Architecture', 'Networking', 'Caching', 'Storage'
  ];

  const filtered = filter === 'All'
    ? techComparisons
    : techComparisons.filter(c => c.category === filter);

  const selected = techComparisons.find(c => c.id === selectedId) || techComparisons[0];

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 className="glow-text section-h1">
          Tech Comparisons
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
          12 essential side-by-side comparisons. Know exactly when to use which technology in your design.
        </p>
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {categories.map(cat => {
          const color = cat !== 'All' ? CATEGORY_COLORS[cat] : 'var(--color-primary)';
          const bg = cat !== 'All' ? CATEGORY_BG[cat] : 'rgba(99,102,241,0.08)';
          const isActive = filter === cat;
          return (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              style={{
                padding: '6px 14px', borderRadius: '20px', border: '1px solid',
                borderColor: isActive ? `${color}55` : 'var(--border-glass)',
                background: isActive ? bg : 'transparent',
                color: isActive ? color : 'var(--text-secondary)',
                fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                transition: 'var(--transition-smooth)',
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Grid + Detail layout */}
      <div className="tech-compare-layout">
        {/* Left: comparison list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filtered.map(c => {
            const color = CATEGORY_COLORS[c.category] || 'var(--color-primary)';
            const bg = CATEGORY_BG[c.category] || 'rgba(99,102,241,0.08)';
            const isSelected = selectedId === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                style={{
                  width: '100%', textAlign: 'left', padding: '14px 16px',
                  borderRadius: '10px', border: '1px solid',
                  borderColor: isSelected ? `${color}44` : 'var(--border-glass)',
                  background: isSelected ? bg : 'var(--surface-obsidian)',
                  cursor: 'pointer', transition: 'var(--transition-smooth)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '18px' }}>{c.emoji}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.title}
                    </div>
                    <span style={{
                      fontSize: '10px', fontWeight: 600, color,
                      textTransform: 'uppercase', letterSpacing: '0.04em'
                    }}>
                      {c.category}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              No comparisons in this category
            </div>
          )}
        </div>

        {/* Right: detail */}
        <ComparisonDetail comparison={selected} />
      </div>
    </div>
  );
};
