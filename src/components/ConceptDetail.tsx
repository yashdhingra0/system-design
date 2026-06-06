import React from 'react';
import ReactMarkdown from 'react-markdown';
import { concepts } from '../data/concepts';
import { Card3D } from './ui/Card3D';
import { BookOpen, AlertCircle, Shuffle } from 'lucide-react';

interface ConceptDetailProps {
  activeConceptId?: string;
  onSelectConcept?: (id: string) => void;
  isCompleted?: boolean;
  onToggleComplete?: (id: string) => void;
}

export const ConceptDetail: React.FC<ConceptDetailProps> = ({
  activeConceptId: propActiveConceptId,
  isCompleted = false,
  onToggleComplete
}) => {
  const activeConceptId = propActiveConceptId !== undefined ? propActiveConceptId : concepts[0].id;
  const activeConcept = concepts.find(c => c.id === activeConceptId) || concepts[0];

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 className="glow-text" style={{ fontSize: '36px', fontWeight: 800, marginBottom: '8px' }}>System Design Fundamentals</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Master core distributed systems, database strategies, and network architecture patterns.</p>
      </div>

      {/* Content Viewer Panel — Full Width (sidebar handles navigation) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '900px' }}>
        {/* Main Info */}
        <Card3D style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-primary)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
              <BookOpen size={16} />
              <span>{activeConcept.category}</span>
            </div>
            {onToggleComplete && (
              <button
                onClick={() => onToggleComplete(activeConcept.id)}
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
          <h2 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '16px' }}>{activeConcept.title}</h2>
          <p style={{ fontSize: '16px', color: 'var(--text-primary)', fontWeight: 500, lineHeight: '1.6', marginBottom: '24px', borderLeft: '4px solid var(--color-secondary)', paddingLeft: '16px' }}>
            {activeConcept.summary}
          </p>
          <div className="markdown-rendered" style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.8' }}>
            <ReactMarkdown>{activeConcept.description}</ReactMarkdown>
          </div>
        </Card3D>

        {/* Key Takeaways */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} style={{ color: 'var(--color-teal)' }} />
            <span>Key Takeaways</span>
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {activeConcept.keyPoints.map((kp, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '10px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                <span style={{ color: 'var(--color-teal)', fontWeight: 900 }}>✔</span>
                <span>{kp}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Comparisons and Trade-offs */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shuffle size={18} style={{ color: 'var(--color-gold)' }} />
            <span>Architectural Comparisons</span>
          </h3>
          {activeConcept.tradeoffs.map((t, idx) => (
            <div key={idx}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '24px', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.1)', padding: '12px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, textAlign: 'center', color: 'var(--color-primary)' }}>
                    {t.optionA}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>VS</div>
                  <div style={{ background: 'rgba(14,165,233,0.05)', border: '1px solid rgba(14,165,233,0.1)', padding: '12px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, textAlign: 'center', color: 'var(--color-secondary)' }}>
                    {t.optionB}
                  </div>
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)' }}>Trade-off Summary</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{t.comparison}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mental Model / Visual Aid */}
        <div className="glass-panel" style={{ padding: '24px', background: 'rgba(6,9,19,0.3)', borderStyle: 'dashed', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '6px' }}>System Mental Model</div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
            🧠 {activeConcept.visualAid}
          </div>
        </div>
      </div>
    </div>
  );
};
