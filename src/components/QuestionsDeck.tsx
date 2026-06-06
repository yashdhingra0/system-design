import React, { useState, useEffect } from 'react';
import { interviewQuestions } from '../data/interviewQuestions';
import { Search, ChevronDown, ChevronUp, Flame, Star } from 'lucide-react';

interface QuestionsDeckProps {
  selectedQuestionId: number | null;
  onClearSelectedQuestion?: () => void;
  completedQuestions?: number[];
  onToggleCompleteQuestion?: (id: number) => void;
}

export const QuestionsDeck: React.FC<QuestionsDeckProps> = ({
  selectedQuestionId,
  onClearSelectedQuestion,
  completedQuestions = [],
  onToggleCompleteQuestion
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedFrequency, setSelectedFrequency] = useState<string>('All');
  const [showTopOnly, setShowTopOnly] = useState(false);
  
  // Bookmark state persisted in localStorage
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(() => {
    try {
      const saved = localStorage.getItem('sys_design_qa_bookmarks');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);
  
  // Accordion state: set of expanded question IDs
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const categories = [
    'All',
    'System Design Basics',
    'Databases & Sharding',
    'Caching & Networking',
    'Rate Limiters & Queues',
    'SOLID & LLD'
  ];

  const toggleExpand = (id: number) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        if (onToggleCompleteQuestion && !completedQuestions.includes(id)) {
          onToggleCompleteQuestion(id);
        }
      }
      return next;
    });
  };

  const toggleBookmark = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarkedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem('sys_design_qa_bookmarks', JSON.stringify([...next]));
      return next;
    });
  };

  useEffect(() => {
    if (selectedQuestionId !== null) {
      const targetQuestion = interviewQuestions.find(q => q.id === selectedQuestionId);
      if (!targetQuestion) return;

      const matchesSearch = targetQuestion.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            targetQuestion.answer.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || targetQuestion.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'All' || targetQuestion.difficulty === selectedDifficulty;
      
      let currentFiltered = filteredQuestions;

      if (!matchesSearch || !matchesCategory || !matchesDifficulty) {
        setSearchQuery('');
        setSelectedCategory('All');
        setSelectedDifficulty('All');
        setSelectedFrequency('All');
        setShowTopOnly(false);
        setShowBookmarkedOnly(false);
        currentFiltered = interviewQuestions;
      }

      const idx = currentFiltered.findIndex(q => q.id === selectedQuestionId);
      if (idx !== -1) {
        const targetPage = Math.floor(idx / pageSize) + 1;
        setCurrentPage(targetPage);
        setExpandedIds(prev => {
          const next = new Set(prev);
          next.add(selectedQuestionId);
          return next;
        });
        
        setTimeout(() => {
          const el = document.getElementById(`q-${selectedQuestionId}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('highlight-flash');
            setTimeout(() => {
              el.classList.remove('highlight-flash');
              if (onClearSelectedQuestion) {
                onClearSelectedQuestion();
              }
            }, 2000);
          }
        }, 300);
      }
    }
  }, [selectedQuestionId]);

  const filteredQuestions = interviewQuestions.filter(q => {
    const matchesSearch = q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          q.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || q.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'All' || q.difficulty === selectedDifficulty;
    const matchesFrequency = selectedFrequency === 'All' || q.frequency === selectedFrequency;
    const matchesTop = !showTopOnly || q.frequency === 'high';
    const matchesBookmarks = !showBookmarkedOnly || bookmarkedIds.has(q.id);
    return matchesSearch && matchesCategory && matchesDifficulty && matchesFrequency && matchesTop && matchesBookmarks;
  });

  // Calculate paginated list
  const totalQuestions = filteredQuestions.length;
  const totalPages = Math.ceil(totalQuestions / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedQuestions = filteredQuestions.slice(startIndex, startIndex + pageSize);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setExpandedIds(new Set()); // collapse all on page shift
  };

  const getFreqLabel = (freq: string) => {
    switch (freq) {
      case 'high': return '🔥 High';
      case 'medium': return '🟡 Medium';
      case 'low': return '🟢 Low';
      default: return freq;
    }
  };

  const highCount = interviewQuestions.filter(q => q.frequency === 'high').length;

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 className="glow-text" style={{ fontSize: '36px', fontWeight: 800, marginBottom: '8px' }}>200+ Interview Q&A Deck</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Quick-fire preparation deck covering hot questions frequently asked in system design loops.</p>
      </div>

      {/* Quick Filter Pills */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button
          onClick={() => { setShowTopOnly(!showTopOnly); setShowBookmarkedOnly(false); setCurrentPage(1); }}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 16px', borderRadius: '20px',
            border: '1px solid',
            borderColor: showTopOnly ? 'rgba(239, 68, 68, 0.3)' : 'var(--border-glass)',
            background: showTopOnly ? 'rgba(239, 68, 68, 0.08)' : 'transparent',
            color: showTopOnly ? '#ef4444' : 'var(--text-secondary)',
            fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            transition: 'var(--transition-smooth)'
          }}
        >
          <Flame size={14} />
          <span>Top {highCount} Most Asked</span>
        </button>

        <button
          onClick={() => { setShowBookmarkedOnly(!showBookmarkedOnly); setShowTopOnly(false); setCurrentPage(1); }}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 16px', borderRadius: '20px',
            border: '1px solid',
            borderColor: showBookmarkedOnly ? 'rgba(245, 158, 11, 0.3)' : 'var(--border-glass)',
            background: showBookmarkedOnly ? 'rgba(245, 158, 11, 0.08)' : 'transparent',
            color: showBookmarkedOnly ? 'var(--color-gold)' : 'var(--text-secondary)',
            fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            transition: 'var(--transition-smooth)'
          }}
        >
          <Star size={14} />
          <span>Bookmarked ({bookmarkedIds.size})</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '32px' }}>
        {/* Search */}
        <div style={{ display: 'flex', position: 'relative', width: '100%', marginBottom: '20px' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search questions and keywords..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--border-glass)',
              borderRadius: '12px',
              padding: '14px 14px 14px 48px',
              color: 'var(--text-primary)',
              fontSize: '15px',
              outline: 'none',
              transition: 'var(--transition-smooth)'
            }}
          />
        </div>

        {/* Category + Difficulty + Frequency selector */}
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ flex: '2 1 250px' }}>
            <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
              style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none' }}
            >
              {categories.map(c => <option key={c} value={c} style={{ background: '#0b0f19' }}>{c}</option>)}
            </select>
          </div>

          <div style={{ flex: '1 1 130px' }}>
            <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>Difficulty</label>
            <select
              value={selectedDifficulty}
              onChange={(e) => { setSelectedDifficulty(e.target.value); setCurrentPage(1); }}
              style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none' }}
            >
              <option value="All" style={{ background: '#0b0f19' }}>All</option>
              <option value="Easy" style={{ background: '#0b0f19' }}>Easy</option>
              <option value="Medium" style={{ background: '#0b0f19' }}>Medium</option>
              <option value="Hard" style={{ background: '#0b0f19' }}>Hard</option>
            </select>
          </div>

          <div style={{ flex: '1 1 130px' }}>
            <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>Frequency</label>
            <select
              value={selectedFrequency}
              onChange={(e) => { setSelectedFrequency(e.target.value); setCurrentPage(1); }}
              style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none' }}
            >
              <option value="All" style={{ background: '#0b0f19' }}>All</option>
              <option value="high" style={{ background: '#0b0f19' }}>🔥 High</option>
              <option value="medium" style={{ background: '#0b0f19' }}>🟡 Medium</option>
              <option value="low" style={{ background: '#0b0f19' }}>🟢 Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
        Showing {totalQuestions} question{totalQuestions !== 1 ? 's' : ''}
        {showTopOnly && ' · Top Most Asked'}
        {showBookmarkedOnly && ' · Bookmarked'}
      </div>

      {/* Questions Stack */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
        {paginatedQuestions.length > 0 ? (
          paginatedQuestions.map((q) => {
            const isExpanded = expandedIds.has(q.id);
            const isBookmarked = bookmarkedIds.has(q.id);
            return (
              <div
                key={q.id}
                id={`q-${q.id}`}
                className="glass-panel"
                style={{
                  padding: '20px 24px',
                  cursor: 'pointer',
                  borderLeft: isExpanded ? '4px solid var(--color-secondary)' : '1px solid var(--border-glass)',
                  transition: 'var(--transition-smooth)'
                }}
                onClick={() => toggleExpand(q.id)}
              >
                {/* Accordion Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Q{q.id.toString().padStart(3, '0')}</span>
                      <span className={`tag tag-${q.difficulty.toLowerCase()}`}>{q.difficulty}</span>
                      <span className={`freq-badge ${q.frequency}`}>{getFreqLabel(q.frequency)}</span>
                      {completedQuestions.includes(q.id) && (
                        <span style={{
                          fontSize: '10px',
                          background: 'rgba(16, 185, 129, 0.1)',
                          color: 'var(--color-teal)',
                          border: '1px solid rgba(16, 185, 129, 0.2)',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          textTransform: 'uppercase',
                          fontWeight: 700,
                          letterSpacing: '0.02em',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '2px'
                        }}>✓ Studied</span>
                      )}
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{q.category}</span>
                    </div>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>{q.question}</h3>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <button
                      className={`bookmark-btn ${isBookmarked ? 'active' : ''}`}
                      onClick={(e) => toggleBookmark(q.id, e)}
                      title={isBookmarked ? 'Remove bookmark' : 'Bookmark this question'}
                    >
                      <Star size={16} fill={isBookmarked ? 'currentColor' : 'none'} />
                    </button>
                    {isExpanded ? <ChevronUp size={18} style={{ color: 'var(--color-secondary)' }} /> : <ChevronDown size={18} />}
                  </div>
                </div>

                {/* Sliding Accordion Answer */}
                {isExpanded && (
                  <div
                    style={{
                      marginTop: '16px',
                      paddingTop: '16px',
                      borderTop: '1px solid var(--border-glass)',
                      fontSize: '14px',
                      color: 'var(--text-secondary)',
                      lineHeight: '1.7',
                      animation: 'fadeIn 0.2s ease-out'
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <p style={{ background: 'rgba(255,255,255,0.01)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                      <strong>Answer:</strong> {q.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
            {showBookmarkedOnly ? 'No bookmarked questions yet. Click the ⭐ icon on any question to bookmark it.' : 'No interview questions match your filter query.'}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid var(--border-glass)',
              background: 'transparent',
              color: currentPage === 1 ? 'var(--text-muted)' : 'var(--text-secondary)',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
            }}
          >
            Prev
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => {
            if (p !== 1 && p !== totalPages && Math.abs(p - currentPage) > 2) {
              if (Math.abs(p - currentPage) === 3) return <span key={p} style={{ color: 'var(--text-muted)' }}>...</span>;
              return null;
            }
            return (
              <button
                key={p}
                onClick={() => handlePageChange(p)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid',
                  borderColor: currentPage === p ? 'var(--color-secondary)' : 'var(--border-glass)',
                  background: currentPage === p ? 'rgba(14,165,233,0.1)' : 'transparent',
                  color: currentPage === p ? 'var(--text-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: currentPage === p ? 700 : 500
                }}
              >
                {p}
              </button>
            );
          })}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid var(--border-glass)',
              background: 'transparent',
              color: currentPage === totalPages ? 'var(--text-muted)' : 'var(--text-secondary)',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
