import React, { useState } from 'react';
import { Card3D } from './ui/Card3D';
import { Award, CheckCircle2, XCircle, RotateCcw, ArrowRight, BookOpen } from 'lucide-react';

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  link?: {
    tab: 'concepts' | 'solid' | 'dashboard' | 'questions' | 'quiz' | 'prep-tools' | 'revision-notes' | 'prep-sandbox';
    id: string;
    label: string;
  };
}

const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "Under the CAP Theorem, which two attributes must a system choose between during an active network partition?",
    options: [
      "Latency vs. Throughput",
      "Consistency vs. Availability",
      "Partition Tolerance vs. Consistency",
      "Security vs. Performance"
    ],
    correctIndex: 1,
    explanation: "Under the CAP Theorem, network partitions (P) are inevitable in real networks. Thus, when a partition occurs, a system must choose between guaranteeing all nodes return the same data (Consistency - CP) or ensuring all nodes respond to queries immediately (Availability - AP).",
    link: {
      tab: 'concepts',
      id: 'databases',
      label: 'Learn about CAP Theorem & Databases'
    }
  },
  {
    id: 2,
    question: "Which caching strategy writes data to both the cache and the database simultaneously before returning an acknowledgement?",
    options: [
      "Cache-Aside (Lazy Loading)",
      "Write-Behind (Write-Back)",
      "Write-Through",
      "Refresh-Ahead"
    ],
    correctIndex: 2,
    explanation: "Write-Through caching writes data to the cache and the database in a synchronous block. This guarantees the cache is never stale, but incurs higher write latency since it performs two database updates consecutively.",
    link: {
      tab: 'concepts',
      id: 'caching',
      label: 'Learn about Caching Strategies'
    }
  },
  {
    id: 3,
    question: "How does Consistent Hashing minimize data migration during database sharding updates?",
    options: [
      "By locking all tables during database resizes.",
      "By mapping keys and nodes to a circular hash ring so only 1/N keys are remapped.",
      "By replicating every database shard across all nodes.",
      "By converting all data keys to UUIDs."
    ],
    correctIndex: 1,
    explanation: "Consistent Hashing maps servers and keys clockwise onto a 360-degree circle (Ring). When a node is added or removed, only keys residing on the immediately adjacent segment of the ring are shifted clockwise, meaning only 1/N keys are moved instead of re-indexing the entire database.",
    link: {
      tab: 'concepts',
      id: 'consistent-hashing',
      label: 'Learn about Consistent Hashing'
    }
  },
  {
    id: 4,
    question: "Which SOLID principle is violated if a subclass overrides a parent method to throw an 'UnsupportedOperationException'?",
    options: [
      "Single Responsibility Principle (SRP)",
      "Liskov Substitution Principle (LSP)",
      "Interface Segregation Principle (ISP)",
      "Dependency Inversion Principle (DIP)"
    ],
    correctIndex: 1,
    explanation: "The Liskov Substitution Principle (LSP) states that subclasses must be substitutable for their parent classes. Throwing exceptions or breaking expected behaviors of parent class contracts violates LSP because it breaks client code expectations.",
    link: {
      tab: 'solid',
      id: 'lsp',
      label: 'Learn about Liskov Substitution Principle (LSP)'
    }
  },
  {
    id: 5,
    question: "Why is a Wide-Column store like Cassandra preferred over MySQL for write-heavy chat log systems?",
    options: [
      "Cassandra supports complex SQL join queries natively.",
      "Cassandra stores all data tables directly in local memory.",
      "Cassandra uses an LSM Tree storage engine to write sequentially to disk at O(1) speeds.",
      "Cassandra locks rows to ensure transactional double-booking prevention."
    ],
    correctIndex: 2,
    explanation: "Cassandra uses Log-Structured Merge (LSM) Trees rather than in-place B-Trees. LSM Trees buffer writes in memory and append them sequentially to disk in sorted SSTables. This O(1) append bypasses random disk seek bottlenecks, making Cassandra exceptionally performant for write-heavy chat logs.",
    link: {
      tab: 'concepts',
      id: 'databases',
      label: 'Learn about Database Storage & Engines'
    }
  },
  {
    id: 6,
    question: "Which rate-limiting algorithm keeps an exact log of timestamps for all requests and drops logs older than the threshold window?",
    options: [
      "Token Bucket",
      "Leaky Bucket",
      "Fixed Window Counter",
      "Sliding Window Log"
    ],
    correctIndex: 3,
    explanation: "Sliding Window Log logs the timestamps of every client request (typically in a Redis sorted set). Old log timestamps are evicted periodically. While extremely accurate, it consumes massive memory because it must record every request timestamp.",
    link: {
      tab: 'dashboard',
      id: 'rate-limiter',
      label: 'Explore the Distributed Rate Limiter Problem'
    }
  },
  {
    id: 7,
    question: "In the context of the Dependency Inversion Principle, what should high-level classes depend on?",
    options: [
      "Low-level concrete implementation classes.",
      "Static global variable instances.",
      "Abstractions / Interfaces.",
      "Database connection drivers directly."
    ],
    correctIndex: 2,
    explanation: "The Dependency Inversion Principle (DIP) states that high-level modules should depend on abstractions (interfaces) rather than concrete implementations. This isolates business logic from underlying details like databases or payment gateways.",
    link: {
      tab: 'solid',
      id: 'dip',
      label: 'Learn about Dependency Inversion Principle (DIP)'
    }
  },
  {
    id: 8,
    question: "What does the 'E' stand for in the PACELC theorem?",
    options: [
      "Else (referring to normal system operation without partitions)",
      "Eventual (referring to eventual consistency models)",
      "Encryption (referring to TLS/SSL network security)",
      "Edge (referring to edge CDN computations)"
    ],
    correctIndex: 0,
    explanation: "PACELC stands for: If there is a Partition (P), trade off Availability (A) vs Consistency (C); Else (E), trade off Latency (L) vs Consistency (C). The 'E' dictates that even in healthy network conditions, latency must be traded for strong consistency.",
    link: {
      tab: 'concepts',
      id: 'databases',
      label: 'Learn about PACELC Theorem'
    }
  }
];

interface QuizProps {
  onNavigateToContent?: (tab: 'concepts' | 'solid' | 'dashboard' | 'questions' | 'quiz' | 'prep-tools' | 'revision-notes' | 'prep-sandbox', id: string) => void;
}

export const Quiz: React.FC<QuizProps> = ({ onNavigateToContent }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizDone, setQuizDone] = useState(false);

  const currentQuestion = quizQuestions[currentIdx];

  const handleOptionSelect = (idx: number) => {
    if (isAnswered) return;
    setSelectedOpt(idx);
  };

  const handleSubmit = () => {
    if (selectedOpt === null || isAnswered) return;
    
    setIsAnswered(true);
    if (selectedOpt === currentQuestion.correctIndex) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    setSelectedOpt(null);
    setIsAnswered(false);
    
    if (currentIdx < quizQuestions.length - 1) {
      setCurrentIdx(prev => prev + 1);
    } else {
      setQuizDone(true);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOpt(null);
    setIsAnswered(false);
    setScore(0);
    setQuizDone(false);
  };

  if (quizDone) {
    const successRate = Math.round((score / quizQuestions.length) * 100);
    return (
      <div style={{ maxWidth: '600px', margin: '40px auto', animation: 'fadeIn 0.4s ease-out' }}>
        <Card3D style={{ padding: '40px', textAlign: 'center' }} glowColor="rgba(16, 185, 129, 0.15)">
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 24px auto' }}>
            <Award size={40} style={{ color: 'var(--color-teal)' }} />
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>Quiz Completed!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Test your system design and LLD knowledge before heading into interviews.</p>
          
          <div style={{ fontSize: '48px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
            {score} / {quizQuestions.length}
          </div>
          <div style={{ fontSize: '15px', color: 'var(--text-secondary)', marginBottom: '40px' }}>
            Success Rate: <strong style={{ color: successRate >= 70 ? 'var(--color-teal)' : 'var(--color-gold)' }}>{successRate}%</strong>
          </div>

          <button
            onClick={handleRestart}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, var(--color-secondary) 0%, var(--color-primary) 100%)',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
            }}
          >
            <RotateCcw size={16} />
            <span>Try Again</span>
          </button>
        </Card3D>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', animation: 'fadeIn 0.4s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Self Assessment</span>
          <h2 style={{ fontSize: '24px', fontWeight: 800 }}>Design Readiness Quiz</h2>
        </div>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>
          Question {currentIdx + 1} of {quizQuestions.length}
        </span>
      </div>

      {/* Progress Bar */}
      <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', marginBottom: '32px' }}>
        <div 
          style={{ 
            height: '100%', 
            background: 'var(--color-primary)', 
            width: `${((currentIdx + 1) / quizQuestions.length) * 100}%`,
            transition: 'width 0.3s ease-out' 
          }} 
        />
      </div>

      <Card3D style={{ padding: '32px', marginBottom: '24px' }}>
        {/* Question Text */}
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px', color: 'var(--text-primary)', lineHeight: '1.5' }}>
          {currentQuestion.question}
        </h3>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          {currentQuestion.options.map((opt, oIdx) => {
            const isSelected = selectedOpt === oIdx;
            const isCorrect = oIdx === currentQuestion.correctIndex;
            
            let borderColor = 'var(--border-glass)';
            let bgColor = 'rgba(255,255,255,0.01)';
            
            if (isAnswered) {
              if (isCorrect) {
                borderColor = 'var(--color-teal)';
                bgColor = 'rgba(16, 185, 129, 0.05)';
              } else if (isSelected) {
                borderColor = '#ef4444';
                bgColor = 'rgba(239, 68, 68, 0.05)';
              }
            } else if (isSelected) {
              borderColor = 'var(--color-primary)';
              bgColor = 'rgba(99, 102, 241, 0.05)';
            }

            return (
              <button
                key={oIdx}
                onClick={() => handleOptionSelect(oIdx)}
                disabled={isAnswered}
                style={{
                  textAlign: 'left',
                  padding: '16px 20px',
                  borderRadius: '12px',
                  border: '1px solid',
                  borderColor,
                  background: bgColor,
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  cursor: isAnswered ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'var(--transition-smooth)'
                }}
              >
                <div style={{ 
                  width: '20px', 
                  height: '20px', 
                  borderRadius: '50%', 
                  border: '2px solid',
                  borderColor: isSelected ? 'transparent' : 'var(--border-glass)',
                  background: isSelected ? 'var(--color-primary)' : 'transparent',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexShrink: 0
                }}>
                  {isSelected && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fff' }} />}
                </div>
                <span>{opt}</span>
              </button>
            );
          })}
        </div>

        {/* Submit / Action Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          {!isAnswered ? (
            <button
              onClick={handleSubmit}
              disabled={selectedOpt === null}
              style={{
                background: selectedOpt === null ? 'rgba(255,255,255,0.05)' : 'var(--color-primary)',
                color: selectedOpt === null ? 'var(--text-muted)' : '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: selectedOpt === null ? 'not-allowed' : 'pointer',
                transition: 'var(--transition-smooth)'
              }}
            >
              Submit Answer
            </button>
          ) : (
            <button
              onClick={handleNext}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--color-teal)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <span>{currentIdx < quizQuestions.length - 1 ? 'Next Question' : 'View Results'}</span>
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </Card3D>

      {/* Explanation Box */}
      {isAnswered && (
        <div
          className="glass-panel"
          style={{
            padding: '24px',
            borderLeft: `4px solid ${selectedOpt === currentQuestion.correctIndex ? 'var(--color-teal)' : '#ef4444'}`,
            background: 'rgba(255,255,255,0.01)',
            animation: 'fadeIn 0.3s ease-out'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            {selectedOpt === currentQuestion.correctIndex ? (
              <>
                <CheckCircle2 size={18} style={{ color: 'var(--color-teal)' }} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-teal)' }}>Correct Answer!</span>
              </>
            ) : (
              <>
                <XCircle size={18} style={{ color: '#ef4444' }} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#ef4444' }}>Incorrect</span>
              </>
            )}
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: currentQuestion.link ? '0 0 16px 0' : 0 }}>
            {currentQuestion.explanation}
          </p>
          {currentQuestion.link && onNavigateToContent && (
            <button
              onClick={() => onNavigateToContent(currentQuestion.link!.tab, currentQuestion.link!.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                borderRadius: '6px',
                padding: '8px 14px',
                color: 'var(--color-primary)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'var(--transition-smooth)'
              }}
            >
              <BookOpen size={14} />
              <span>{currentQuestion.link.label}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
