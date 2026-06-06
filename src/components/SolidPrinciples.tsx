import React, { useState } from 'react';
import { solidPrinciples } from '../data/solidData';
import { Card3D } from './ui/Card3D';
import { Award, ShieldAlert, ShieldCheck, Code } from 'lucide-react';

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
  onToggleComplete
}) => {
  const [internalActiveId, setInternalActiveId] = useState(solidPrinciples[0].id);
  const [codeMode, setCodeMode] = useState<'violation' | 'solution'>('violation');

  const activeId = propActiveId !== undefined ? propActiveId : internalActiveId;
  const handleSelect = (id: string) => {
    setCodeMode('violation');
    if (onSelectPrinciple) {
      onSelectPrinciple(id);
    } else {
      setInternalActiveId(id);
    }
  };

  const activePrinciple = solidPrinciples.find(p => p.id === activeId) || solidPrinciples[0];

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 className="glow-text" style={{ fontSize: '36px', fontWeight: 800, marginBottom: '8px' }}>SOLID Design Principles</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Master the five core design patterns for writing maintainable, reusable, and robust Object-Oriented software.</p>
      </div>

      {/* Principle Tabs */}
      <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.02)', padding: '4px', borderRadius: '12px', marginBottom: '32px', border: '1px solid var(--border-glass)', overflowX: 'auto' }}>
        {solidPrinciples.map(p => (
          <button
            key={p.id}
            onClick={() => handleSelect(p.id)}
            style={{
              flexGrow: 1,
              background: activeId === p.id ? 'rgba(99,102,241,0.08)' : 'transparent',
              border: '1px solid',
              borderColor: activeId === p.id ? 'rgba(99,102,241,0.2)' : 'transparent',
              color: activeId === p.id ? 'var(--text-primary)' : 'var(--text-secondary)',
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'var(--transition-smooth)'
            }}
          >
            {p.shortName}
          </button>
        ))}
      </div>

      {/* Grid Layout (Left: Explanation, Right: Code) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '40px', alignItems: 'start' }}>
        {/* Left Side Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Definition Panel */}
          <Card3D style={{ padding: '32px' }} glowColor="rgba(16, 185, 129, 0.15)">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-teal)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                <Award size={16} />
                <span>{activePrinciple.fullName}</span>
              </div>
              {onToggleComplete && (
                <button
                  onClick={() => onToggleComplete(activePrinciple.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: isCompleted ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid',
                    borderColor: isCompleted ? 'var(--color-teal)' : 'var(--border-glass)',
                    color: isCompleted ? 'var(--color-teal)' : 'var(--text-secondary)',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'var(--transition-smooth)'
                  }}
                >
                  <span>{isCompleted ? '✓ Completed' : 'Mark as Read'}</span>
                </button>
              )}
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '16px' }}>{activePrinciple.fullName}</h2>
            <blockquote style={{ fontSize: '15px', color: 'var(--text-primary)', fontStyle: 'italic', fontWeight: 500, borderLeft: '4px solid var(--color-teal)', paddingLeft: '16px', marginBottom: '24px' }}>
              "{activePrinciple.definition}"
            </blockquote>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {activePrinciple.explanation.map((exp, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '10px', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  <span style={{ color: 'var(--color-teal)' }}>•</span>
                  <span>{exp}</span>
                </div>
              ))}
            </div>
          </Card3D>

          {/* UML Class Structural Mapping */}
          <div className="glass-panel" style={{ padding: '24px', background: 'rgba(6,9,19,0.3)', borderStyle: 'dashed', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '8px' }}>UML Class Mapping</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)' }}>
              {activePrinciple.umlExplanation}
            </div>
          </div>
        </div>

        {/* Right Side Code Playground */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Toggle Playground */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={() => setCodeMode('violation')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '8px',
                border: '1px solid',
                background: codeMode === 'violation' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(255,255,255,0.02)',
                borderColor: codeMode === 'violation' ? 'rgba(239, 68, 68, 0.2)' : 'var(--border-glass)',
                color: codeMode === 'violation' ? '#ef4444' : 'var(--text-secondary)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'var(--transition-smooth)'
              }}
            >
              <ShieldAlert size={16} />
              <span>Violation Code</span>
            </button>

            <button
              onClick={() => setCodeMode('solution')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '8px',
                border: '1px solid',
                background: codeMode === 'solution' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255,255,255,0.02)',
                borderColor: codeMode === 'solution' ? 'rgba(16, 185, 129, 0.2)' : 'var(--border-glass)',
                color: codeMode === 'solution' ? 'var(--color-teal)' : 'var(--text-secondary)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'var(--transition-smooth)'
              }}
            >
              <ShieldCheck size={16} />
              <span>SOLID Refactored</span>
            </button>
          </div>

          {/* Code display panel */}
          <div className="glass-panel" style={{ padding: '24px', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                <Code size={14} />
                <span>TypeScript Playground</span>
              </div>
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                padding: '2px 8px',
                borderRadius: '4px',
                background: codeMode === 'violation' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                color: codeMode === 'violation' ? '#ef4444' : 'var(--color-teal)'
              }}>
                {codeMode === 'violation' ? 'Violation' : 'Refactored'}
              </span>
            </div>

            <pre style={{ margin: 0, maxHeight: '480px', overflowY: 'auto' }}>
              <code>
                {codeMode === 'violation' ? activePrinciple.violationCode : activePrinciple.solutionCode}
              </code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
