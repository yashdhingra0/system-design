import React, { useState } from 'react';
import { designPatterns } from '../data/designPatterns';
import type { DesignPattern } from '../data/designPatterns';
import { Code2, Layers, CheckCircle, AlertCircle, Zap, BookOpen, ChevronRight, Table2, Maximize2, Minimize2, ArrowLeft } from 'lucide-react';

type Category = 'All' | DesignPattern['category'];

const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  Architectural:  { bg: 'rgba(99,102,241,0.08)',  border: 'rgba(99,102,241,0.25)',  text: 'var(--color-primary)' },
  Creational:     { bg: 'rgba(14,165,233,0.08)',   border: 'rgba(14,165,233,0.25)',  text: 'var(--color-secondary)' },
  Structural:     { bg: 'rgba(16,185,129,0.08)',   border: 'rgba(16,185,129,0.25)',  text: 'var(--color-teal)' },
  Behavioral:     { bg: 'rgba(245,158,11,0.08)',   border: 'rgba(245,158,11,0.25)',  text: 'var(--color-gold)' },
  Scaling:        { bg: 'rgba(139,124,246,0.08)',  border: 'rgba(139,124,246,0.25)', text: '#8b7cf6' },
  Caching:        { bg: 'rgba(45,212,191,0.08)',   border: 'rgba(45,212,191,0.25)',  text: '#2dd4bf' },
  Messaging:      { bg: 'rgba(56,189,248,0.08)',   border: 'rgba(56,189,248,0.25)',  text: '#38bdf8' },
  Reliability:    { bg: 'rgba(248,113,113,0.08)',  border: 'rgba(248,113,113,0.25)', text: '#f87171' },
  Microservices:  { bg: 'rgba(251,191,36,0.08)',   border: 'rgba(251,191,36,0.25)',  text: '#fbbf24' },
};

const DEFAULT_COLORS = { bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.25)', text: 'var(--color-primary)' };

const ALL_CATEGORIES: DesignPattern['category'][] = [
  'Architectural', 'Creational', 'Structural', 'Behavioral',
  'Scaling', 'Caching', 'Messaging', 'Reliability', 'Microservices',
];

interface PatternCardProps {
  pattern: DesignPattern;
  isSelected: boolean;
  onClick: () => void;
}

const PatternCard: React.FC<PatternCardProps> = ({ pattern, isSelected, onClick }) => {
  const colors = CATEGORY_COLORS[pattern.category] ?? DEFAULT_COLORS;
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

// ── Cheatsheet view ──────────────────────────────────────────────────────────
const CheatsheetView: React.FC = () => {
  const groups = ALL_CATEGORIES.map(cat => ({
    category: cat,
    patterns: designPatterns.filter(p => p.category === cat),
  })).filter(g => g.patterns.length > 0);

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      {groups.map(({ category, patterns }) => {
        const col = CATEGORY_COLORS[category] ?? DEFAULT_COLORS;
        return (
          <div key={category} style={{ marginBottom: '32px' }}>
            {/* Group header */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              marginBottom: '12px',
            }}>
              <span style={{
                fontSize: '11px', fontWeight: 800, textTransform: 'uppercase',
                letterSpacing: '0.07em', padding: '4px 12px', borderRadius: '20px',
                background: col.bg, color: col.text, border: `1px solid ${col.border}`,
              }}>
                {category}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {patterns.length} pattern{patterns.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Table */}
            <div style={{ borderRadius: '12px', border: '1px solid var(--border-glass)', overflow: 'hidden' }}>
              {/* Table header */}
              <div style={{
                display: 'grid', gridTemplateColumns: '200px 1fr 1fr',
                background: 'rgba(255,255,255,0.02)',
                borderBottom: '1px solid var(--border-glass)',
                padding: '8px 16px',
              }}>
                {['Pattern', 'Pick It When', 'Main Trade-off'].map(h => (
                  <span key={h} style={{
                    fontSize: '10px', fontWeight: 800,
                    textTransform: 'uppercase', letterSpacing: '0.07em',
                    color: 'var(--text-muted)',
                  }}>{h}</span>
                ))}
              </div>

              {/* Table rows */}
              {patterns.map((p, i) => (
                <div
                  key={p.id}
                  style={{
                    display: 'grid', gridTemplateColumns: '200px 1fr 1fr',
                    padding: '12px 16px', gap: '16px',
                    borderBottom: i < patterns.length - 1 ? '1px solid var(--border-glass)' : undefined,
                    background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.012)',
                  }}
                >
                  {/* Pattern name + emoji */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px' }}>{p.emoji}</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {p.name}
                    </span>
                  </div>
                  {/* Pick It When */}
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {p.pickItWhen ?? '—'}
                  </span>
                  {/* Main Trade-off */}
                  <span style={{
                    fontSize: '12px', color: '#f87171', lineHeight: 1.5,
                  }}>
                    {p.mainTradeoff ?? '—'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ── Main component ───────────────────────────────────────────────────────────
interface DesignPatternsProps {
  initialPatternId?: string;
}

export const DesignPatterns: React.FC<DesignPatternsProps> = ({ initialPatternId }) => {
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [selectedId, setSelectedId] = useState<string>(initialPatternId ?? designPatterns[0].id);
  const [activeTab, setActiveTab] = useState<'overview' | 'code'>('overview');
  const [viewMode, setViewMode] = useState<'detail' | 'cheatsheet'>('detail');
  const [expanded, setExpanded] = useState(false); // full-page reading mode

  const filtered = activeCategory === 'All'
    ? designPatterns
    : designPatterns.filter(p => p.category === activeCategory);

  const selected = designPatterns.find(p => p.id === selectedId) || designPatterns[0];
  const colors = CATEGORY_COLORS[selected.category] ?? DEFAULT_COLORS;

  const categories: Category[] = ['All', ...ALL_CATEGORIES];

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      {/* Header — hide when in full-page read mode */}
      {!expanded && (
        <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 className="glow-text section-h1">Design Patterns</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px', margin: 0 }}>
              30 patterns — System Design (HLD) and GoF (LLD) — with real-world examples and code.
            </p>
          </div>

          {/* View mode toggle */}
          <div style={{ display: 'flex', gap: '6px', background: 'rgba(255,255,255,0.04)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-glass)', alignSelf: 'flex-start' }}>
            {([
              { id: 'detail', label: 'Detail', icon: <Layers size={13} /> },
              { id: 'cheatsheet', label: 'Cheatsheet', icon: <Table2 size={13} /> },
            ] as const).map(({ id, label, icon }) => (
              <button
                key={id}
                onClick={() => setViewMode(id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '7px 14px', borderRadius: '7px', border: 'none',
                  background: viewMode === id ? 'var(--color-primary)' : 'transparent',
                  color: viewMode === id ? '#fff' : 'var(--text-secondary)',
                  fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {icon}{label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Full-page reading view ─────────────────────────────────── */}
      {expanded && (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
          {/* Back bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
            <button
              onClick={() => setExpanded(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                padding: '8px 14px', borderRadius: '8px',
                border: '1px solid var(--border-glass)', background: 'transparent',
                color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              }}
            >
              <ArrowLeft size={14} />
              Back to list
            </button>
            <button
              onClick={() => setExpanded(false)}
              style={{
                marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 14px', borderRadius: '8px',
                border: '1px solid var(--border-glass)', background: 'transparent',
                color: 'var(--text-muted)', fontSize: '12px', cursor: 'pointer',
              }}
            >
              <Minimize2 size={13} />
              Collapse
            </button>
          </div>

          {/* Article hero */}
          <div style={{
            padding: '36px 40px', borderRadius: '18px',
            border: `1px solid ${colors.border}`, background: colors.bg,
            marginBottom: '32px',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '64px', lineHeight: 1, flexShrink: 0 }}>{selected.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '3px 10px', borderRadius: '6px', background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}>
                    {selected.category}
                  </span>
                  {selected.pickItWhen && (
                    <span style={{ fontSize: '11px', color: '#2dd4bf', background: 'rgba(45,212,191,0.08)', border: '1px solid rgba(45,212,191,0.2)', padding: '3px 10px', borderRadius: '6px' }}>
                      ✓ {selected.pickItWhen}
                    </span>
                  )}
                  {selected.mainTradeoff && (
                    <span style={{ fontSize: '11px', color: '#f87171', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', padding: '3px 10px', borderRadius: '6px' }}>
                      ⚠ {selected.mainTradeoff}
                    </span>
                  )}
                </div>
                <h1 style={{ fontSize: '32px', fontWeight: 900, margin: '0 0 12px 0', lineHeight: 1.2 }}>{selected.name}</h1>
                <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0 }}>{selected.intent}</p>
              </div>
            </div>
          </div>

          {/* Two-column article body */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            {/* Problem */}
            <div style={{ padding: '28px', borderRadius: '14px', border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.04)' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#ef4444', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '7px' }}>
                <AlertCircle size={14} /> The Problem
              </h3>
              <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.85, margin: 0 }}>{selected.problem}</p>
            </div>
            {/* Solution */}
            <div style={{ padding: '28px', borderRadius: '14px', border: '1px solid rgba(45,212,191,0.2)', background: 'rgba(45,212,191,0.04)' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-teal)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '7px' }}>
                <Zap size={14} /> The Solution
              </h3>
              <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.85, margin: 0 }}>{selected.solution}</p>
            </div>
          </div>

          {/* When to use — full width */}
          <div style={{ padding: '28px', borderRadius: '14px', border: '1px solid var(--border-glass)', background: 'var(--surface-obsidian)', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '7px' }}>
              <BookOpen size={14} /> When to Use
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {selected.whenToUse.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  <span style={{ color: colors.text, fontWeight: 900, flexShrink: 0, fontSize: '16px' }}>→</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pros / Cons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            <div style={{ padding: '24px', borderRadius: '14px', border: '1px solid rgba(45,212,191,0.2)', background: 'rgba(45,212,191,0.04)' }}>
              <h3 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-teal)', marginBottom: '16px' }}>✓ Advantages</h3>
              {selected.pros.map((p, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '10px' }}>
                  <CheckCircle size={14} style={{ color: 'var(--color-teal)', flexShrink: 0, marginTop: '3px' }} />
                  <span>{p}</span>
                </div>
              ))}
            </div>
            <div style={{ padding: '24px', borderRadius: '14px', border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.04)' }}>
              <h3 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#ef4444', marginBottom: '16px' }}>✗ Trade-offs</h3>
              {selected.cons.map((c, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '10px' }}>
                  <span style={{ color: '#ef4444', fontWeight: 900, flexShrink: 0, fontSize: '16px' }}>✗</span>
                  <span>{c}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Real-world examples */}
          <div style={{ padding: '28px', borderRadius: '14px', border: '1px solid var(--border-glass)', background: 'var(--surface-obsidian)', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '16px' }}>🏢 Real-World Usage</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
              {selected.realWorldExamples.map((ex, i) => (
                <div key={i} style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {ex}
                </div>
              ))}
            </div>
          </div>

          {/* Code example — full width, bigger */}
          <div style={{ borderRadius: '14px', border: '1px solid var(--border-glass)', overflow: 'hidden', marginBottom: '24px' }}>
            <div style={{ padding: '14px 24px', borderBottom: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Code2 size={15} style={{ color: colors.text }} />
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>Code Example</span>
              <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.04)', padding: '2px 8px', borderRadius: '5px', border: '1px solid var(--border-glass)' }}>
                {selected.name}
              </span>
            </div>
            <pre style={{ margin: 0, padding: '28px', overflowX: 'auto', fontSize: '13.5px', lineHeight: 1.75, color: '#e2e8f0', background: 'rgba(5,8,16,0.8)', fontFamily: 'var(--font-mono)' }}>
              <code>{selected.codeExample}</code>
            </pre>
          </div>

          {/* Related patterns */}
          {selected.relatedPatterns.length > 0 && (
            <div style={{ padding: '20px 24px', borderRadius: '12px', border: '1px solid var(--border-glass)', background: 'var(--surface-obsidian)', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>Related:</span>
              {selected.relatedPatterns.map(rid => {
                const rel = designPatterns.find(p => p.id === rid);
                if (!rel) return null;
                const rc = CATEGORY_COLORS[rel.category] ?? DEFAULT_COLORS;
                return (
                  <button
                    key={rid}
                    onClick={() => { setSelectedId(rid); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '6px 12px', borderRadius: '8px',
                      border: `1px solid ${rc.border}`, background: rc.bg,
                      color: rc.text, fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    {rel.emoji} {rel.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Cheatsheet view */}
      {!expanded && viewMode === 'cheatsheet' && <CheatsheetView />}

      {/* Detail view */}
      {!expanded && viewMode === 'detail' && (
        <>
          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap' }}>
            {categories.map(cat => {
              const isActive = activeCategory === cat;
              const col = cat !== 'All' ? (CATEGORY_COLORS[cat] ?? DEFAULT_COLORS) : null;
              const count = cat !== 'All' ? designPatterns.filter(p => p.category === cat).length : null;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    padding: '6px 13px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: isActive ? (col?.border || 'rgba(139,124,246,0.4)') : 'var(--border-glass)',
                    background: isActive ? (col?.bg || 'rgba(139,124,246,0.08)') : 'transparent',
                    color: isActive ? (col?.text || '#8b7cf6') : 'var(--text-secondary)',
                    fontSize: '12px', fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'var(--transition-smooth)',
                  }}
                >
                  {cat}
                  {count !== null && (
                    <span style={{
                      marginLeft: '5px', fontSize: '10px',
                      background: 'rgba(255,255,255,0.06)', padding: '1px 5px', borderRadius: '8px'
                    }}>
                      {count}
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                        padding: '2px 8px', borderRadius: '6px',
                        background: colors.bg, color: colors.text, border: `1px solid ${colors.border}`
                      }}>
                        {selected.category}
                      </span>
                      {/* Pick It When / Trade-off chips */}
                      {selected.pickItWhen && (
                        <span style={{
                          fontSize: '11px', color: '#2dd4bf', background: 'rgba(45,212,191,0.08)',
                          border: '1px solid rgba(45,212,191,0.2)', padding: '2px 8px', borderRadius: '6px',
                        }}>
                          ✓ {selected.pickItWhen}
                        </span>
                      )}
                      {selected.mainTradeoff && (
                        <span style={{
                          fontSize: '11px', color: '#f87171', background: 'rgba(248,113,113,0.08)',
                          border: '1px solid rgba(248,113,113,0.2)', padding: '2px 8px', borderRadius: '6px',
                        }}>
                          ⚠ {selected.mainTradeoff}
                        </span>
                      )}
                    </div>
                    <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>{selected.name}</h2>
                    <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                      {selected.intent}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tabs + Expand */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
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
                <button
                  onClick={() => setExpanded(true)}
                  title="Read full article"
                  style={{
                    marginLeft: 'auto', padding: '8px 14px', borderRadius: '8px',
                    border: '1px solid var(--border-glass)', background: 'transparent',
                    color: 'var(--text-muted)', cursor: 'pointer', display: 'flex',
                    alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600,
                    transition: 'var(--transition-smooth)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'rgba(139,124,246,0.4)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border-glass)'; }}
                >
                  <Maximize2 size={13} />
                  Read full
                </button>
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
                      Implementation
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
        </>
      )}
    </div>
  );
};
