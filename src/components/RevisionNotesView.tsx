import React, { useState } from 'react';
import { revisionNotes } from '../data/revisionNotes';
import { Card3D } from './ui/Card3D';
import { CheckSquare, Square, Zap, ShieldAlert } from 'lucide-react';

export const RevisionNotesView: React.FC = () => {
  const [selectedCat, setSelectedCat] = useState<'All' | 'Checklist' | 'Scale Rules' | 'Tradeoffs' | 'Patterns'>('All');
  
  // Keep track of checkmarked item keys
  const [reviewedItems, setReviewedItems] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('sys_design_reviewed_notes');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const handleToggleReviewed = (cardId: string, itemIdx: number) => {
    const key = `${cardId}-${itemIdx}`;
    setReviewedItems(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      localStorage.setItem('sys_design_reviewed_notes', JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const filteredCards = selectedCat === 'All' 
    ? revisionNotes 
    : revisionNotes.filter(n => n.category === selectedCat);

  // Total calculations
  const totalItemsCount = revisionNotes.reduce((acc, curr) => acc + curr.items.length, 0);
  const reviewedItemsCount = reviewedItems.size;
  const reviewProgress = Math.round((reviewedItemsCount / totalItemsCount) * 100);

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="glow-text" style={{ fontSize: '36px', fontWeight: 800, marginBottom: '8px' }}>
            Last-Minute Revision Notes
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            High-impact frameworks, hardware constants, and system templates to review in the hours before your interview.
          </p>
        </div>

        {/* Progress Card */}
        <div className="glass-panel" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px', minWidth: '220px' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
            <Zap size={20} style={{ color: 'var(--color-teal)' }} />
          </div>
          <div style={{ flexGrow: 1 }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Revision Progress</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>{reviewProgress}% Reviewed</div>
            <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', marginTop: '6px', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'var(--color-teal)', width: `${reviewProgress}%`, transition: 'width 0.3s ease-out' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', overflowX: 'auto', paddingBottom: '4px' }}>
        {(['All', 'Checklist', 'Scale Rules', 'Tradeoffs', 'Patterns'] as const).map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCat(cat)}
            style={{
              background: selectedCat === cat ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
              border: '1px solid',
              borderColor: selectedCat === cat ? 'rgba(99, 102, 241, 0.2)' : 'var(--border-glass)',
              color: selectedCat === cat ? 'var(--text-primary)' : 'var(--text-secondary)',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'var(--transition-smooth)'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid View */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))', gap: '24px' }}>
        {filteredCards.map(card => (
          <Card3D key={card.id} style={{ padding: '28px' }} glowColor="rgba(14, 165, 233, 0.1)">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span className={`tag tag-${card.category === 'Checklist' ? 'easy' : card.category === 'Scale Rules' ? 'medium' : 'hard'}`}>
                {card.category}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{card.items.length} key notes</span>
            </div>

            <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)' }}>{card.title}</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.5' }}>{card.description}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {card.items.map((item, idx) => {
                const isChecked = reviewedItems.has(`${card.id}-${idx}`);
                return (
                  <div 
                    key={idx} 
                    onClick={() => handleToggleReviewed(card.id, idx)}
                    style={{ 
                      background: isChecked ? 'rgba(16, 185, 129, 0.02)' : 'rgba(255,255,255,0.01)', 
                      border: '1px solid', 
                      borderColor: isChecked ? 'rgba(16, 185, 129, 0.15)' : 'var(--border-glass)', 
                      borderRadius: '10px', 
                      padding: '16px', 
                      display: 'flex', 
                      gap: '12px',
                      cursor: 'pointer',
                      transition: 'var(--transition-smooth)'
                    }}
                    onMouseEnter={(e) => {
                      if (!isChecked) e.currentTarget.style.borderColor = 'var(--border-glass-hover)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isChecked) e.currentTarget.style.borderColor = 'var(--border-glass)';
                    }}
                  >
                    {/* Checkbox Icon */}
                    <div style={{ marginTop: '2px', color: isChecked ? 'var(--color-teal)' : 'var(--text-muted)' }}>
                      {isChecked ? <CheckSquare size={18} /> : <Square size={18} />}
                    </div>

                    <div style={{ flexGrow: 1 }}>
                      <h4 style={{ 
                        fontSize: '14px', 
                        fontWeight: 700, 
                        color: isChecked ? 'var(--color-teal)' : 'var(--text-primary)', 
                        marginBottom: '6px',
                        textDecoration: isChecked ? 'line-through' : 'none'
                      }}>
                        {item.title}
                      </h4>
                      <p style={{ 
                        fontSize: '13px', 
                        color: isChecked ? 'var(--text-muted)' : 'var(--text-secondary)', 
                        lineHeight: '1.6', 
                        margin: 0 
                      }}>
                        {item.content}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card3D>
        ))}
      </div>

      {/* Pro tip card */}
      <div className="glass-panel" style={{ padding: '24px', marginTop: '40px', display: 'flex', gap: '16px', borderLeft: '4px solid var(--color-gold)', background: 'rgba(245, 158, 11, 0.02)' }}>
        <div style={{ color: 'var(--color-gold)', flexShrink: 0 }}>
          <ShieldAlert size={22} />
        </div>
        <div>
          <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>Pro-Tip: Managing the Board</h4>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
            System design interviews are not a quiz; they are open-ended design discussions. If your interviewer challenges a component, do not get defensive. Say: "That is a great point. If we have high write contention here, my current SQL lock model will indeed create connection timeouts. Let's look at introducing an event buffer or partitioning the write queues to solve this."
          </p>
        </div>
      </div>
    </div>
  );
};
