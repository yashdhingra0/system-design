import React, { useState, useEffect, useRef } from 'react';
import { glossary, companyTracks, rubricScorecard } from '../data/sandboxData';
import { problems } from '../data/problems';
import { Card3D } from './ui/Card3D';
import { Play, Pause, RotateCcw, CheckCircle, Award, BookOpen, Building2, Search, Sliders, Square } from 'lucide-react';

interface PrepSandboxProps {
  completedMap: Record<string, 'not-started' | 'in-progress' | 'completed'>;
  onSelectProblem: (id: string) => void;
}

export const PrepSandbox: React.FC<PrepSandboxProps> = ({
  completedMap,
  onSelectProblem
}) => {
  const [activeTab, setActiveTab] = useState<'checklist' | 'scorecard' | 'glossary' | 'tracks'>('checklist');

  // TIMER STATES
  const [timeRemaining, setTimeRemaining] = useState<number>(45 * 60); // 45 minutes
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const timerRef = useRef<number | null>(null);

  // CHECKLIST STATES
  const [checklistChecked, setChecklistChecked] = useState<Record<number, boolean>>({});

  // SCORECARD STATES
  const [scores, setScores] = useState<Record<string, number>>({
    "1. Scope & Requirements": 5,
    "2. API & Data Modeling": 5,
    "3. System Architecture (HLD)": 5,
    "4. Scale & Deep Dives (LLD)": 5,
    "5. Communication & Structure": 5
  });

  // GLOSSARY STATES
  const [glossarySearch, setGlossarySearch] = useState<string>('');
  const [glossaryCat, setGlossaryCat] = useState<string>('All');

  // COMPANY TRACKS STATES
  const [selectedCompany, setSelectedCompany] = useState<string>('Google');

  // Timer Effect
  useEffect(() => {
    if (timerActive) {
      timerRef.current = window.setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setTimerActive(false);
            alert("Time's up! Wrap up your system design presentation.");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive]);

  const handleStartStopTimer = () => {
    setTimerActive(!timerActive);
  };

  const handleResetTimer = () => {
    setTimerActive(false);
    setTimeRemaining(45 * 60);
  };

  const formatTime = (secs: number): string => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const handleToggleChecklist = (idx: number) => {
    setChecklistChecked(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  // Scorecard calculations
  const totalScoreWeight = rubricScorecard.reduce((acc, curr) => {
    const rawVal = scores[curr.name] || 0;
    const weightedVal = rawVal * (curr.weight / 100);
    return acc + weightedVal;
  }, 0);
  
  const formattedWeightedAvg = totalScoreWeight.toFixed(1);

  const getInterviewFeedback = (avg: number) => {
    if (avg >= 8.5) return { verdict: "Strong Hire", color: "var(--color-teal)", text: "Excellent! You displayed precise system boundaries, detailed sharding/caching selections, and proactive communication. Meta/Google ready!" };
    if (avg >= 6.5) return { verdict: "Lean Hire", color: "var(--color-gold)", text: "Good solid performance. Work on identifying sharding edge cases, details of lock failures, and managing the whiteboard structure more independently." };
    if (avg >= 4.0) return { verdict: "No Hire (Borderline)", color: "var(--color-gold)", text: "Needs improvement. Spend more time practicing deep dives (LSM Trees, consistent hashing rings) and write/read capacity estimations." };
    return { verdict: "No Hire", color: "#ef4444", text: "Requires major revisions. Re-read the fundamentals section and study LLD reference code before attempting practice boards." };
  };

  const feedback = getInterviewFeedback(totalScoreWeight);

  // Glossary filter
  const filteredGlossary = glossary.filter(g => {
    const matchesSearch = g.term.toLowerCase().includes(glossarySearch.toLowerCase()) || 
                          g.definition.toLowerCase().includes(glossarySearch.toLowerCase());
    const matchesCat = glossaryCat === 'All' || g.category === glossaryCat;
    return matchesSearch && matchesCat;
  });

  // Company Track calculations
  const activeTrack = companyTracks.find(c => c.company === selectedCompany) || companyTracks[0];
  const trackProblems = activeTrack.problems.map(pId => problems.find(p => p.id === pId)).filter(Boolean) as typeof problems;
  const trackCompleted = trackProblems.filter(p => completedMap[p.id] === 'completed').length;
  const trackProgress = trackProblems.length > 0 ? Math.round((trackCompleted / trackProblems.length) * 100) : 0;

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 className="glow-text" style={{ fontSize: '36px', fontWeight: 800, marginBottom: '8px' }}>
          Interactive Prep Sandbox
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Practice utilities to simulate mock interviews, check off company paths, and self-grade your system design whiteboard performance.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-glass)', marginBottom: '32px', overflowX: 'auto', paddingBottom: '4px' }}>
        <button
          onClick={() => setActiveTab('checklist')}
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'checklist' ? '2px solid var(--color-secondary)' : '2px solid transparent',
            color: activeTab === 'checklist' ? 'var(--text-primary)' : 'var(--text-secondary)',
            padding: '12px 16px',
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'var(--transition-smooth)'
          }}
        >
          Interview Checklist & Timer
        </button>
        <button
          onClick={() => setActiveTab('scorecard')}
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'scorecard' ? '2px solid var(--color-secondary)' : '2px solid transparent',
            color: activeTab === 'scorecard' ? 'var(--text-primary)' : 'var(--text-secondary)',
            padding: '12px 16px',
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'var(--transition-smooth)'
          }}
        >
          FAANG Scorecard
        </button>
        <button
          onClick={() => setActiveTab('glossary')}
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'glossary' ? '2px solid var(--color-secondary)' : '2px solid transparent',
            color: activeTab === 'glossary' ? 'var(--text-primary)' : 'var(--text-secondary)',
            padding: '12px 16px',
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'var(--transition-smooth)'
          }}
        >
          Systems Glossary
        </button>
        <button
          onClick={() => setActiveTab('tracks')}
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'tracks' ? '2px solid var(--color-secondary)' : '2px solid transparent',
            color: activeTab === 'tracks' ? 'var(--text-primary)' : 'var(--text-secondary)',
            padding: '12px 16px',
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'var(--transition-smooth)'
          }}
        >
          Company Tracks
        </button>
      </div>

      {/* 1. CHECKLIST & TIMER */}
      {activeTab === 'checklist' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px', alignItems: 'start' }}>
          {/* Timeline checklists */}
          <Card3D style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={18} style={{ color: 'var(--color-secondary)' }} />
              <span>45-Minute Interview Practice Checklist</span>
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { name: "Step 1: Clarify Scope & Features", duration: "5 mins", desc: "Ask queries to gather requirements, identify read/write ratio, define boundaries." },
                { name: "Step 2: Capacity Estimation", duration: "5 mins", desc: "Estimate QPS, network throughput, memory cache sizing, storage bytes." },
                { name: "Step 3: Interface API Design", duration: "5 mins", desc: "Write out primary REST paths or gRPC interface payloads." },
                { name: "Step 4: Database Schema ERD", duration: "5 mins", desc: "Draft primary entity tables, describe indexing, pick SQL vs. NoSQL model." },
                { name: "Step 5: High-Level Architecture", duration: "10 mins", desc: "Draw high-level block boxes connecting LB, servers, caches, databases, queues." },
                { name: "Step 6: Scale Deep Dive", duration: "10 mins", desc: "Discuss consistent hashing, database sharding, failovers, cache stamps." },
                { name: "Step 7: Trade-offs & Summary", duration: "5 mins", desc: "Conclude details, list alternative trade-offs (reasons chosen vs reasons avoided)." }
              ].map((step, idx) => {
                const isChecked = !!checklistChecked[idx];
                return (
                  <div 
                    key={idx}
                    onClick={() => handleToggleChecklist(idx)}
                    style={{
                      background: isChecked ? 'rgba(16, 185, 129, 0.02)' : 'rgba(255,255,255,0.01)',
                      border: '1px solid',
                      borderColor: isChecked ? 'rgba(16, 185, 129, 0.2)' : 'var(--border-glass)',
                      borderRadius: '12px',
                      padding: '16px',
                      cursor: 'pointer',
                      display: 'flex',
                      gap: '14px',
                      transition: 'var(--transition-smooth)'
                    }}
                  >
                    <div style={{ color: isChecked ? 'var(--color-teal)' : 'var(--text-muted)', marginTop: '2px' }}>
                      {isChecked ? <CheckCircle size={18} /> : <Square size={18} />}
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontWeight: 700, fontSize: '14px', color: isChecked ? 'var(--color-teal)' : 'var(--text-primary)' }}>{step.name}</span>
                        <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px', color: 'var(--text-muted)' }}>{step.duration}</span>
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card3D>

          {/* Interactive Live Timer */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="glass-panel" style={{ padding: '32px', textAlign: 'center' }}>
              <h4 style={{ fontSize: '14px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '16px' }}>Interview Practice Timer</h4>
              
              <div style={{ fontSize: '64px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: timeRemaining < 300 ? '#ef4444' : 'var(--text-primary)', textShadow: '0 0 15px rgba(255,255,255,0.05)', marginBottom: '24px' }}>
                {formatTime(timeRemaining)}
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  onClick={handleStartStopTimer}
                  style={{
                    background: timerActive ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid',
                    borderColor: timerActive ? 'var(--color-gold)' : 'var(--color-teal)',
                    color: timerActive ? 'var(--color-gold)' : 'var(--color-teal)',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    minWidth: '110px',
                    justifyContent: 'center',
                    transition: 'var(--transition-smooth)'
                  }}
                >
                  {timerActive ? <Pause size={16} /> : <Play size={16} />}
                  <span>{timerActive ? 'Pause' : 'Start'}</span>
                </button>
                
                <button
                  onClick={handleResetTimer}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-glass)',
                    color: 'var(--text-secondary)',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'var(--transition-smooth)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border-glass-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-glass)'}
                >
                  <RotateCcw size={16} />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '24px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>💡 How to use this:</div>
              <p style={{ margin: 0 }}>
                Pick a design problem (e.g. Rate Limiter), start the timer, and draft your solution on a paper or digital canvas. Check off each design phase in order, keeping yourself strictly within the recommended time slices. This trains your brain to manage time during real interview conditions.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. FAANG SCORECARD */}
      {activeTab === 'scorecard' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px', alignItems: 'start' }}>
          {/* Sliders container */}
          <Card3D style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sliders size={18} style={{ color: 'var(--color-primary)' }} />
              <span>Whiteboard Performance Grading Rubric</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {rubricScorecard.map((rubric) => {
                const score = scores[rubric.name] || 5;
                return (
                  <div key={rubric.name} style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', padding: '20px', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>{rubric.name}</span>
                      <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-primary)' }}>{score} / 10</span>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>{rubric.description}</p>
                    
                    <input
                      type="range"
                      min={0}
                      max={10}
                      step={1}
                      value={score}
                      onChange={(e) => setScores(prev => ({ ...prev, [rubric.name]: Number(e.target.value) }))}
                      style={{ width: '100%', accentColor: 'var(--color-primary)', cursor: 'pointer', marginBottom: '12px' }}
                    />
                    
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', background: 'rgba(5, 8, 16, 0.4)', padding: '8px 12px', borderRadius: '6px' }}>
                      <strong>Criteria matched:</strong> {score <= 3 ? rubric.score0 : score <= 7 ? rubric.score5 : rubric.score10}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card3D>

          {/* Results Board */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'sticky', top: '20px' }}>
            <div className="glass-panel" style={{ padding: '32px', textAlign: 'center' }}>
              <div style={{ background: 'rgba(99, 102, 241, 0.1)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 24px auto' }}>
                <Award size={40} style={{ color: 'var(--color-primary)' }} />
              </div>
              <h4 style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '6px' }}>Evaluated Weighted Average</h4>
              
              <div style={{ fontSize: '56px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                {formattedWeightedAvg} <span style={{ fontSize: '20px', color: 'var(--text-secondary)', fontWeight: 500 }}>/ 10</span>
              </div>

              <div style={{ display: 'inline-block', background: feedback.color + '20', color: feedback.color, border: '1px solid ' + feedback.color, padding: '4px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 700, marginBottom: '16px' }}>
                {feedback.verdict}
              </div>

              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0, padding: '0 8px' }}>
                {feedback.text}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. GLOSSARY */}
      {activeTab === 'glossary' && (
        <div>
          {/* Glossary Search Toolbar */}
          <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ flexGrow: 1, display: 'flex', position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search distributed systems terms..."
                value={glossarySearch}
                onChange={(e) => setGlossarySearch(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '8px',
                  padding: '10px 10px 10px 36px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'var(--transition-smooth)'
                }}
              />
            </div>
            
            <div style={{ minWidth: '180px' }}>
              <select
                value={glossaryCat}
                onChange={(e) => setGlossaryCat(e.target.value)}
                style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none' }}
              >
                <option value="All" style={{ background: '#0b0f19' }}>All Categories</option>
                <option value="Distributed Systems" style={{ background: '#0b0f19' }}>Distributed Systems</option>
                <option value="Databases" style={{ background: '#0b0f19' }}>Databases</option>
                <option value="Networking" style={{ background: '#0b0f19' }}>Networking</option>
                <option value="Algorithms" style={{ background: '#0b0f19' }}>Algorithms</option>
              </select>
            </div>
          </div>

          {/* Glossary Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {filteredGlossary.map((g, idx) => (
              <div key={idx} className="glass-panel" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{g.term}</h4>
                  <span style={{ fontSize: '9px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>{g.category}</span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>{g.definition}</p>
              </div>
            ))}
            {filteredGlossary.length === 0 && (
              <div className="glass-panel" style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No glossary terms match your query.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. COMPANY TRACKS */}
      {activeTab === 'tracks' && (
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '32px', alignItems: 'start' }}>
          {/* Company Selection Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {companyTracks.map(track => {
              const isSelected = track.company === selectedCompany;
              return (
                <button
                  key={track.company}
                  onClick={() => setSelectedCompany(track.company)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    background: isSelected ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                    border: '1px solid',
                    borderColor: isSelected ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                    color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                    textAlign: 'left',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'var(--transition-smooth)'
                  }}
                >
                  <Building2 size={16} />
                  <span>{track.company} Path</span>
                </button>
              );
            })}
          </div>

          {/* Path Checklist Card */}
          <Card3D style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>{selectedCompany} Preparation Track</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>{activeTrack.description}</p>
              </div>
              
              {/* Progress metric */}
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-secondary)' }}>{trackProgress}%</span>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Completed</div>
              </div>
            </div>

            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '24px' }}>
              Focus Areas: <strong style={{ color: 'var(--color-primary)' }}>{activeTrack.focus}</strong>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {trackProblems.map(p => {
                const isCompleted = completedMap[p.id] === 'completed';
                return (
                  <div 
                    key={p.id}
                    onClick={() => onSelectProblem(p.id)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'rgba(255,255,255,0.01)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: '10px',
                      padding: '16px',
                      cursor: 'pointer',
                      transition: 'var(--transition-smooth)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border-glass-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-glass)'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ color: isCompleted ? 'var(--color-teal)' : 'var(--text-muted)' }}>
                        {isCompleted ? <CheckCircle size={18} /> : <Square size={18} />}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>{p.title}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{p.category} • {p.difficulty}</div>
                      </div>
                    </div>
                    
                    <span style={{ fontSize: '11px', color: 'var(--color-secondary)', fontWeight: 600 }}>➔ Practice Now</span>
                  </div>
                );
              })}
            </div>
          </Card3D>
        </div>
      )}
    </div>
  );
};
