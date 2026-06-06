import React, { useState, useEffect } from 'react';
import { interviewQuestions } from '../data/interviewQuestions';
import { Search, ChevronDown, ChevronUp, Flame, Star, Layers, LayoutList, RotateCcw, ChevronRight, ChevronLeft } from 'lucide-react';

/* ─── Flashcard Mode ─────────────────────────────────────────────────────── */
const FlashcardMode: React.FC<{
  questions: typeof interviewQuestions;
  completedQuestions: number[];
  onToggleComplete: (id: number) => void;
}> = ({ questions, completedQuestions, onToggleComplete }) => {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [sessionAnswered, setSessionAnswered] = useState<Record<number, 'know' | 'review'>>({});

  if (questions.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
        No questions match your filters. Reset to start flashcard mode.
      </div>
    );
  }

  const current = questions[index];
  const knownCount = Object.values(sessionAnswered).filter(v => v === 'know').length;
  const reviewCount = Object.values(sessionAnswered).filter(v => v === 'review').length;

  const handleKnow = () => {
    setSessionAnswered(prev => ({ ...prev, [current.id]: 'know' }));
    if (!completedQuestions.includes(current.id)) onToggleComplete(current.id);
    setFlipped(false);
    setTimeout(() => setIndex(i => Math.min(questions.length - 1, i + 1)), 200);
  };

  const handleReview = () => {
    setSessionAnswered(prev => ({ ...prev, [current.id]: 'review' }));
    setFlipped(false);
    setTimeout(() => setIndex(i => Math.min(questions.length - 1, i + 1)), 200);
  };

  const diffColor = current.difficulty === 'Hard' ? '#ef4444' : current.difficulty === 'Medium' ? '#f59e0b' : '#10b981';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', paddingTop: '16px', animation: 'fadeIn 0.3s ease-out' }}>
      {/* Progress bar */}
      <div style={{ width: '100%', maxWidth: '640px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
          <span>{index + 1} / {questions.length}</span>
          <span style={{ display: 'flex', gap: '16px' }}>
            <span style={{ color: '#10b981' }}>✓ {knownCount} known</span>
            <span style={{ color: '#f59e0b' }}>↺ {reviewCount} to review</span>
          </span>
        </div>
        <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${((index) / questions.length) * 100}%`, background: 'linear-gradient(90deg, var(--color-secondary), var(--color-primary))', borderRadius: '2px', transition: 'width 0.3s' }} />
        </div>
      </div>

      {/* Card */}
      <div
        onClick={() => setFlipped(f => !f)}
        style={{
          width: '100%', maxWidth: '640px',
          minHeight: '280px',
          borderRadius: '16px',
          border: `1px solid ${flipped ? 'rgba(99,102,241,0.35)' : 'var(--border-glass)'}`,
          background: flipped ? 'rgba(99,102,241,0.05)' : 'var(--surface-obsidian)',
          padding: '36px',
          cursor: 'pointer',
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
          textAlign: 'center', gap: '16px',
          transition: 'all 0.3s',
          userSelect: 'none',
        }}
      >
        <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: diffColor }}>
          {flipped ? 'Answer' : 'Question'} · {current.category} · {current.difficulty}
        </div>

        {!flipped ? (
          <>
            <p style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.5, margin: 0 }}>
              {current.question}
            </p>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
              Tap to reveal answer
            </span>
          </>
        ) : (
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, textAlign: 'left' }}>
            {current.answer}
          </p>
        )}
      </div>

      {/* Action buttons */}
      {flipped ? (
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleReview}
            style={{
              padding: '12px 28px', borderRadius: '10px',
              border: '1px solid rgba(245,158,11,0.3)',
              background: 'rgba(245,158,11,0.06)',
              color: '#f59e0b', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            ↺ Need Review
          </button>
          <button
            onClick={handleKnow}
            style={{
              padding: '12px 28px', borderRadius: '10px',
              border: '1px solid rgba(16,185,129,0.3)',
              background: 'rgba(16,185,129,0.06)',
              color: '#10b981', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            ✓ Got It
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => { setFlipped(false); setIndex(i => Math.max(0, i - 1)); }}
            disabled={index === 0}
            style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid var(--border-glass)', background: 'transparent', color: index === 0 ? 'var(--text-muted)' : 'var(--text-secondary)', cursor: index === 0 ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <ChevronLeft size={14} /> Prev
          </button>
          <button
            onClick={() => setFlipped(true)}
            style={{ padding: '10px 24px', borderRadius: '8px', border: '1px solid rgba(99,102,241,0.3)', background: 'rgba(99,102,241,0.06)', color: 'var(--color-primary)', cursor: 'pointer', fontSize: '13px', fontWeight: 700 }}
          >
            Reveal Answer
          </button>
          <button
            onClick={() => { setFlipped(false); setIndex(i => Math.min(questions.length - 1, i + 1)); }}
            disabled={index === questions.length - 1}
            style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid var(--border-glass)', background: 'transparent', color: index === questions.length - 1 ? 'var(--text-muted)' : 'var(--text-secondary)', cursor: index === questions.length - 1 ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            Skip <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* Reset */}
      {index === questions.length - 1 && (
        <button
          onClick={() => { setIndex(0); setFlipped(false); setSessionAnswered({}); }}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: '1px solid var(--border-glass)', color: 'var(--text-muted)', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
        >
          <RotateCcw size={13} /> Restart Session
        </button>
      )}
    </div>
  );
};

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
  const [deckMode, setDeckMode] = useState<'list' | 'flashcard'>('list');
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
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="glow-text" style={{ fontSize: '36px', fontWeight: 800, marginBottom: '8px' }}>200+ Interview Q&A Deck</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Quick-fire preparation deck covering hot questions frequently asked in system design loops.</p>
        </div>
        {/* Mode toggle */}
        <div style={{ display: 'flex', gap: '6px', background: 'rgba(255,255,255,0.02)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-glass)', flexShrink: 0 }}>
          {([['list', 'List', LayoutList], ['flashcard', 'Flashcards', Layers]] as const).map(([m, label, Icon]) => (
            <button
              key={m}
              onClick={() => setDeckMode(m)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 14px', borderRadius: '7px', border: '1px solid',
                borderColor: deckMode === m ? 'rgba(99,102,241,0.3)' : 'transparent',
                background: deckMode === m ? 'rgba(99,102,241,0.08)' : 'transparent',
                color: deckMode === m ? 'var(--color-primary)' : 'var(--text-muted)',
                fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
      </div>

      {deckMode === 'flashcard' && (
        <FlashcardMode
          questions={filteredQuestions}
          completedQuestions={completedQuestions}
          onToggleComplete={onToggleCompleteQuestion || (() => {})}
        />
      )}
      {deckMode === 'flashcard' && <div style={{ height: '1px' }} />}
      {deckMode === 'list' && <div>

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
      </div>}
    </div>
  );
};
