import React, { useState } from 'react';
import { designPatterns } from '../data/designPatterns';
import type { DesignPattern } from '../data/designPatterns';
import { Code2, Layers, CheckCircle, AlertCircle, Zap, BookOpen, ChevronRight } from 'lucide-react';

type Category = 'All' | DesignPattern['category'];

const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  Architectural: { bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.25)', text: 'var(--color-primary)' },
  Creational:    { bg: 'rgba(14,165,233,0.08)', border: 'rgba(14,165,233,0.25)', text: 'var(--color-secondary)' },
  Structural:    { bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.25)', text: 'var(--color-teal)' },
  Behavioral:    { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)', text: 'var(--color-gold)' },
};

const CATEGORY_COUNTS: Record<string, number> = {
  Architectural: designPatterns.filter(p => p.category === 'Architectural').length,
  Creational:    designPatterns.filter(p => p.category === 'Creational').length,
  Structural:    designPatterns.filter(p => p.category === 'Structural').length,
  Behavioral:    designPatterns.filter(p => p.category === 'Behavioral').length,
};

interface PatternCardProps {
  pattern: DesignPattern;
  isSelected: boolean;
  onClick: () => void;
}

const PatternCard: React.FC<PatternCardProps> = ({ pattern, isSelected, onClick }) => {
  const colors = CATEGORY_COLORS[pattern.category];
  return (
    <button
      onClick={onClick}
      className="glass-panel glass-panel-interactive"
      style={{
        width: '100%',
        textAlign: 'left',
        background: isSelected ? colors.bg : 'var(--surface-obsidian)',
        borderColor: isSelected ? colors.border : 'var(--border-glass)',
        borderRadius: '12px',
        padding: '16px',
        cursor: 'pointer',
        transition: 'var(--transition-smooth)',
        boxShadow: isSelected ? `0 0 20px ${colors.border}` : undefined,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        <span style={{ fontSize: '20px' }}>{pattern.emoji}</span>
        <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>{pattern.name}</span>
        <ChevronRight size={14} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
      </div>
      <div style={{ marginBottom: '8px' }}>
        <span style={{
          display: 'inline-block',
          fontSize: '10px', fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.05em',
          padding: '2px 8px', borderRadius: '6px',
          background: colors.bg, color: colors.text, border: `1px solid ${colors.border}`
        }}>
          {pattern.category}
        </span>
      </div>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>
        {pattern.intent}
      </p>
    </button>
  );
};

export const DesignPatterns: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [selectedId, setSelectedId] = useState<string>(designPatterns[0].id);
  const [activeTab, setActiveTab] = useState<'overview' | 'code'>('overview');

  const filtered = activeCategory === 'All'
    ? designPatterns
    : designPatterns.filter(p => p.category === activeCategory);

  const selected = designPatterns.find(p => p.id === selectedId) || designPatterns[0];
  const colors = CATEGORY_COLORS[selected.category];

  const categories: Category[] = ['All', 'Architectural', 'Creational', 'Structural', 'Behavioral'];

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 className="glow-text section-h1">
          Design Patterns
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
          15 essential patterns — Architectural (HLD) and GoF (LLD) — with real-world examples and TypeScript code.
        </p>
      </div>

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', flexWrap: 'wrap' }}>
        {categories.map(cat => {
          const isActive = activeCategory === cat;
          const col = cat !== 'All' ? CATEGORY_COLORS[cat] : null;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                border: '1px solid',
                borderColor: isActive ? (col?.border || 'rgba(99,102,241,0.4)') : 'var(--border-glass)',
                background: isActive ? (col?.bg || 'rgba(99,102,241,0.08)') : 'transparent',
                color: isActive ? (col?.text || 'var(--color-primary)') : 'var(--text-secondary)',
                fontSize: '13px', fontWeight: 600,
                cursor: 'pointer',
                transition: 'var(--transition-smooth)',
              }}
            >
              {cat}
              {cat !== 'All' && (
                <span style={{
                  marginLeft: '6px', fontSize: '10px',
                  background: 'rgba(255,255,255,0.06)', padding: '1px 5px', borderRadius: '8px'
                }}>
                  {CATEGORY_COUNTS[cat]}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Two-column layout */}
      <div className="design-patterns-layout">
        {/* Left: Pattern List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filtered.map(p => (
            <PatternCard
              key={p.id}
              pattern={p}
              isSelected={selectedId === p.id}
              onClick={() => { setSelectedId(p.id); setActiveTab('overview'); }}
            />
          ))}
        </div>

        {/* Right: Detail Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
          {/* Header Card */}
          <div className="glass-panel" style={{
            padding: '28px',
            borderColor: colors.border,
            background: colors.bg,
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <span style={{ fontSize: '40px', lineHeight: 1 }}>{selected.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <span style={{
                    fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                    padding: '2px 8px', borderRadius: '6px',
                    background: colors.bg, color: colors.text, border: `1px solid ${colors.border}`
                  }}>
                    {selected.category}
                  </span>
                </div>
                <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>{selected.name}</h2>
                <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  {selected.intent}
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {(['overview', 'code'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '8px 18px', borderRadius: '8px', border: '1px solid',
                  borderColor: activeTab === tab ? colors.border : 'var(--border-glass)',
                  background: activeTab === tab ? colors.bg : 'transparent',
                  color: activeTab === tab ? colors.text : 'var(--text-secondary)',
                  fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '6px',
                  transition: 'var(--transition-smooth)',
                }}
              >
                {tab === 'overview' ? <Layers size={14} /> : <Code2 size={14} />}
                {tab === 'overview' ? 'Overview' : 'Code Example'}
              </button>
            ))}
          </div>

          {activeTab === 'overview' ? (
            <>
              {/* Problem / Solution */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="glass-panel" style={{ padding: '20px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#ef4444', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertCircle size={14} /> The Problem
                  </h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
                    {selected.problem}
                  </p>
                </div>
                <div className="glass-panel" style={{ padding: '20px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-teal)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Zap size={14} /> The Solution
                  </h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
                    {selected.solution}
                  </p>
                </div>
              </div>

              {/* When to Use */}
              <div className="glass-panel" style={{ padding: '20px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <BookOpen size={14} /> When to Use
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selected.whenToUse.map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: '10px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      <span style={{ color: colors.text, fontWeight: 800, flexShrink: 0 }}>→</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pros / Cons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="glass-panel" style={{ padding: '20px' }}>
                  <h4 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-teal)', marginBottom: '12px' }}>
                    ✓ Advantages
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selected.pros.map((p, i) => (
                      <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                        <CheckCircle size={12} style={{ color: 'var(--color-teal)', marginTop: '2px', flexShrink: 0 }} />
                        <span>{p}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="glass-panel" style={{ padding: '20px' }}>
                  <h4 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#ef4444', marginBottom: '12px' }}>
                    ✗ Tradeoffs
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selected.cons.map((c, i) => (
                      <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                        <span style={{ color: '#ef4444', fontWeight: 900, flexShrink: 0 }}>✗</span>
                        <span>{c}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Real World Examples */}
              <div className="glass-panel" style={{ padding: '20px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
                  🏢 Real-World Usage
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {selected.realWorldExamples.map((ex, i) => (
                    <div key={i} style={{
                      padding: '8px 12px', borderRadius: '8px',
                      background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)',
                      fontSize: '12px', color: 'var(--text-secondary)'
                    }}>
                      {ex}
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* Code Example */
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                  <Code2 size={16} style={{ color: colors.text }} />
                  TypeScript Implementation
                </h4>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)', padding: '2px 8px', borderRadius: '6px', border: '1px solid var(--border-glass)' }}>
                  {selected.name}
                </span>
              </div>
              <pre style={{
                background: 'rgba(5,8,16,0.8)',
                border: '1px solid var(--border-glass)',
                borderRadius: '10px',
                padding: '20px',
                overflowX: 'auto',
                fontSize: '12.5px',
                lineHeight: '1.6',
                color: '#e2e8f0',
                margin: 0,
                fontFamily: 'var(--font-mono)',
              }}>
                <code>{selected.codeExample}</code>
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
