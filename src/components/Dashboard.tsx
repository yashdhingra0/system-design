import React, { useState } from 'react';
import { problems } from '../data/problems';
import { Card3D } from './ui/Card3D';
import { Search, CheckCircle, Circle, Play, Map, LayoutGrid } from 'lucide-react';

// ─── Learning Roadmap ───────────────────────────────────────────────────────

const ROADMAP_PHASES = [
  {
    phase: 1,
    title: 'Foundations',
    subtitle: 'Understand the building blocks before designing anything',
    color: 'var(--color-teal)',
    colorRaw: '#10b981',
    steps: [
      { label: 'Read all 15 Design Fundamentals concepts', tab: 'concepts', tip: 'Start with Scaling → Load Balancers → Caching → Databases' },
      { label: 'Complete SOLID Principles', tab: 'solid', tip: 'LLD foundations — frequently tested at Google, Meta' },
      { label: 'Memorize Latency Numbers (PrepTools)', tab: 'prep-tools', tip: 'Know L1 cache (0.5ns) vs disk (10ms) — expected in senior interviews' },
      { label: 'Review Tech Comparisons: SQL vs NoSQL, Kafka vs RabbitMQ', tab: 'tech-comparisons', tip: 'These tradeoff questions appear in 80% of system design rounds' },
    ],
  },
  {
    phase: 2,
    title: 'Core Patterns',
    subtitle: 'Learn the patterns you\'ll use in every design',
    color: 'var(--color-secondary)',
    colorRaw: '#0ea5e9',
    steps: [
      { label: 'Study all 15 Design Patterns (Architectural first)', tab: 'design-patterns', tip: 'Circuit Breaker, CQRS, Saga — must-know for distributed system rounds' },
      { label: 'Complete 10 Easy problems on the Dashboard', tab: 'dashboard', tip: 'URL Shortener, Pastebin, Rate Limiter — warm up your design muscle' },
      { label: 'Explore System Diagrams for 5 companies', tab: 'system-diagrams', tip: 'Click every node to understand each component\'s role' },
      { label: 'Study System Evolution for Twitter and Instagram', tab: 'system-diagrams', tip: 'Understand why architectures change — interviewers love this context' },
    ],
  },
  {
    phase: 3,
    title: 'Interview Practice',
    subtitle: 'Simulate real interview conditions',
    color: 'var(--color-primary)',
    colorRaw: '#6366f1',
    steps: [
      { label: 'Solve 15 Medium problems (timed, 45 min each)', tab: 'dashboard', tip: 'Use the timer in Prep Sandbox. Design out loud as you would in an interview.' },
      { label: 'Answer 100 Q&As in study mode', tab: 'questions', tip: 'Use flashcard mode — cover the answer, try yourself first' },
      { label: 'Take the Self-Assessment Quiz (target 80%+)', tab: 'quiz', tip: 'Below 80%? Review the linked concepts before continuing' },
      { label: 'Score yourself with the Interview Scorecard', tab: 'prep-sandbox', tip: 'Honest self-assessment — score each dimension of your design answers' },
    ],
  },
  {
    phase: 4,
    title: 'Mastery',
    subtitle: 'FAANG-level depth and breadth',
    color: 'var(--color-gold)',
    colorRaw: '#f59e0b',
    steps: [
      { label: 'Complete all 50 problems (including Hard)', tab: 'dashboard', tip: 'Hard problems test capacity estimation, bottleneck analysis, and edge cases' },
      { label: 'Review all Revision Notes + complete the checklist', tab: 'revision-notes', tip: 'Aim for 100% reviewed the night before your interview' },
      { label: 'Run a full 45-min mock with Interview Sandbox', tab: 'prep-sandbox', tip: 'Pick a Hard problem, use the timer, self-score at the end — repeat 3x' },
      { label: 'Study all 5 System Evolution timelines', tab: 'system-diagrams', tip: 'Can you explain why Twitter moved from fan-out-on-write to hybrid? This is FAANG-level depth.' },
    ],
  },
];

const LearningRoadmap: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => (
  <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
    <div style={{ marginBottom: '28px' }}>
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '580px', lineHeight: 1.7 }}>
        A structured path from zero to interview-ready. Follow the phases in order — each builds on the last.
      </p>
    </div>

    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      {ROADMAP_PHASES.map((phase, pi) => (
        <div key={phase.phase} style={{ display: 'flex', gap: '0', alignItems: 'stretch' }}>
          {/* Left: phase number + connector */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '56px', flexShrink: 0 }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%',
              border: `2px solid ${phase.colorRaw}`,
              background: `${phase.colorRaw}15`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px', fontWeight: 800, color: phase.colorRaw,
              flexShrink: 0, zIndex: 1,
            }}>
              {phase.phase}
            </div>
            {pi < ROADMAP_PHASES.length - 1 && (
              <div style={{ width: '2px', flex: 1, background: 'var(--border-glass)', marginTop: '4px', marginBottom: '4px' }} />
            )}
          </div>

          {/* Right: phase content */}
          <div style={{ flex: 1, paddingLeft: '20px', paddingBottom: pi < ROADMAP_PHASES.length - 1 ? '28px' : '0' }}>
            <div style={{ marginBottom: '14px', paddingTop: '8px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 2px 0', color: 'var(--text-primary)' }}>
                <span style={{ color: phase.colorRaw }}>Phase {phase.phase}:</span> {phase.title}
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>{phase.subtitle}</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {phase.steps.map((step, si) => (
                <button
                  key={si}
                  onClick={() => onNavigate(step.tab)}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: '12px',
                    padding: '12px 16px', borderRadius: '10px',
                    border: '1px solid var(--border-glass)',
                    background: 'var(--surface-obsidian)',
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'border-color 0.2s, background 0.2s',
                    width: '100%',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = `${phase.colorRaw}44`;
                    (e.currentTarget as HTMLElement).style.background = `${phase.colorRaw}06`;
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-glass)';
                    (e.currentTarget as HTMLElement).style.background = 'var(--surface-obsidian)';
                  }}
                >
                  <span style={{
                    width: '20px', height: '20px', borderRadius: '50%',
                    border: `1.5px solid ${phase.colorRaw}55`,
                    flexShrink: 0, marginTop: '1px',
                    background: `${phase.colorRaw}10`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '9px', fontWeight: 800, color: phase.colorRaw,
                  }}>
                    {si + 1}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '3px' }}>
                      {step.label}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                      💡 {step.tip}
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', color: phase.colorRaw, fontWeight: 700, flexShrink: 0, paddingTop: '1px' }}>→</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

interface DashboardProps {
  onSelectProblem: (id: string) => void;
  completedMap: Record<string, 'not-started' | 'in-progress' | 'completed'>;
  toggleStatus: (id: string) => void;
  completedConcepts: string[];
  completedPrinciples: string[];
  completedQuestions: number[];
  onNavigateToTab?: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onSelectProblem,
  completedMap,
  toggleStatus,
  completedConcepts,
  completedPrinciples,
  completedQuestions,
  onNavigateToTab,
}) => {
  const [dashView, setDashView] = useState<'problems' | 'roadmap'>('problems');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedCompany, setSelectedCompany] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Derive unique company tags
  const allCompanies = Array.from(
    new Set(problems.flatMap(p => p.companyTags))
  ).sort();

  const categories = ['All', 'System Architecture', 'Distributed Systems', 'API Design', 'Real-time Systems', 'Low-Level Design'];

  const filteredProblems = problems.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'All' || p.difficulty === selectedDifficulty;
    const matchesCompany = selectedCompany === 'All' || p.companyTags.includes(selectedCompany);
    
    const statusVal = completedMap[p.id] || 'not-started';
    const matchesStatus = selectedStatus === 'All' ||
                          (selectedStatus === 'Not Started' && statusVal === 'not-started') ||
                          (selectedStatus === 'In Progress' && statusVal === 'in-progress') ||
                          (selectedStatus === 'Completed' && statusVal === 'completed');

    return matchesSearch && matchesCategory && matchesDifficulty && matchesCompany && matchesStatus;
  });

  // Calculate Progress Stats
  const completedCount = Object.values(completedMap).filter(s => s === 'completed').length;

  // Overall Unified Progress
  const overallCompleted = completedConcepts.length + completedPrinciples.length + completedCount + completedQuestions.length;
  const overallTotal = 7 + 5 + 50 + 200;
  const overallPercent = Math.round((overallCompleted / overallTotal) * 100);

  // Difficulty counts
  const easyTotal = problems.filter(p => p.difficulty === 'Easy').length;
  const easyDone = problems.filter(p => p.difficulty === 'Easy' && completedMap[p.id] === 'completed').length;
  const medTotal = problems.filter(p => p.difficulty === 'Medium').length;
  const medDone = problems.filter(p => p.difficulty === 'Medium' && completedMap[p.id] === 'completed').length;
  const hardTotal = problems.filter(p => p.difficulty === 'Hard').length;
  const hardDone = problems.filter(p => p.difficulty === 'Hard' && completedMap[p.id] === 'completed').length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="glow-text" style={{ fontSize: '36px', fontWeight: 800, marginBottom: '8px' }}>System Design Path</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Master the top 50 trending system design questions asked in premium tech interviews.</p>
        </div>
        {/* View toggle */}
        <div style={{ display: 'flex', gap: '6px', background: 'rgba(255,255,255,0.02)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
          {([['problems', 'Problems', LayoutGrid], ['roadmap', 'Roadmap', Map]] as const).map(([v, label, Icon]) => (
            <button
              key={v}
              onClick={() => setDashView(v)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px', borderRadius: '7px', border: '1px solid',
                borderColor: dashView === v ? 'rgba(99,102,241,0.3)' : 'transparent',
                background: dashView === v ? 'rgba(99,102,241,0.08)' : 'transparent',
                color: dashView === v ? 'var(--color-primary)' : 'var(--text-muted)',
                fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
      </div>

      {dashView === 'roadmap' && (
        <LearningRoadmap onNavigate={(tab) => { onNavigateToTab?.(tab); }} />
      )}
      {dashView === 'roadmap' && <div style={{ height: '24px' }} />}
      {dashView === 'roadmap' && (
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <button onClick={() => setDashView('problems')} style={{ background: 'transparent', border: '1px solid var(--border-glass)', color: 'var(--text-secondary)', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
            View 50 Problems →
          </button>
        </div>
      )}
      {dashView === 'problems' && <div>


      {/* Analytics Dashboard Grid */}
      <div className="dashboard-grid" style={{ marginBottom: '40px' }}>
        {/* Progress Counter */}
        <Card3D style={{ padding: '24px', display: 'flex', gap: '24px', alignItems: 'center', minHeight: '160px' }}>
          <div style={{ position: 'relative', width: '100px', height: '100px', flexShrink: 0 }}>
            <svg width="100" height="100">
              <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="transparent" />
              <circle
                className="progress-circle"
                cx="50"
                cy="50"
                r="40"
                stroke="var(--color-primary)"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * overallPercent) / 100}
                style={{
                  transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                  filter: 'drop-shadow(0 0 4px var(--color-primary))'
                }}
              />
            </svg>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>{overallPercent}%</span>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Overall</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flexGrow: 1 }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '2px' }}>Unified Prep Progress</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 20px' }}>
              {/* Concepts */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '3px' }}>
                  <span>Fundamentals</span>
                  <span style={{ fontWeight: 600 }}>{completedConcepts.length}/7</span>
                </div>
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: 'var(--color-primary)', width: `${(completedConcepts.length / 7) * 100}%` }} />
                </div>
              </div>
              {/* SOLID */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '3px' }}>
                  <span>SOLID Principles</span>
                  <span style={{ fontWeight: 600 }}>{completedPrinciples.length}/5</span>
                </div>
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: 'var(--color-teal)', width: `${(completedPrinciples.length / 5) * 100}%` }} />
                </div>
              </div>
              {/* Problems */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '3px' }}>
                  <span>Design Problems</span>
                  <span style={{ fontWeight: 600 }}>{completedCount}/50</span>
                </div>
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: 'var(--color-gold)', width: `${(completedCount / 50) * 100}%` }} />
                </div>
              </div>
              {/* Questions */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '3px' }}>
                  <span>Q&A Studied</span>
                  <span style={{ fontWeight: 600 }}>{completedQuestions.length}/200</span>
                </div>
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: 'var(--color-secondary)', width: `${(completedQuestions.length / 200) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>
        </Card3D>

        {/* Difficulty Breakdown */}
        <Card3D style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '160px' }}>
          <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '14px', fontWeight: 600 }}>Breakdown by Difficulty</h3>
          
          {/* Easy */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--color-teal)', fontWeight: 600 }}>Easy</span>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>{easyDone} / {easyTotal}</span>
          </div>
          <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', marginBottom: '12px', overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'var(--color-teal)', width: `${easyTotal > 0 ? (easyDone/easyTotal)*100 : 0}%`, borderRadius: '3px' }} />
          </div>

          {/* Medium */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--color-gold)', fontWeight: 600 }}>Medium</span>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>{medDone} / {medTotal}</span>
          </div>
          <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', marginBottom: '12px', overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'var(--color-gold)', width: `${medTotal > 0 ? (medDone/medTotal)*100 : 0}%`, borderRadius: '3px' }} />
          </div>

          {/* Hard */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#ef4444', fontWeight: 600 }}>Hard</span>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>{hardDone} / {hardTotal}</span>
          </div>
          <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ height: '100%', background: '#ef4444', width: `${hardTotal > 0 ? (hardDone/hardTotal)*100 : 0}%`, borderRadius: '3px' }} />
          </div>
        </Card3D>
      </div>

      {/* Filter and Search Panel */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '32px' }}>
        {/* Search */}
        <div style={{ display: 'flex', position: 'relative', width: '100%', marginBottom: '20px' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search problems, concepts, or companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
            onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border-glass)'}
          />
        </div>

        {/* Row Filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
          {/* Category */}
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none' }}
            >
              {categories.map(c => <option key={c} value={c} style={{ background: '#0b0f19' }}>{c}</option>)}
            </select>
          </div>

          {/* Difficulty */}
          <div style={{ flex: '1 1 120px' }}>
            <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>Difficulty</label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none' }}
            >
              <option value="All" style={{ background: '#0b0f19' }}>All</option>
              <option value="Easy" style={{ background: '#0b0f19' }}>Easy</option>
              <option value="Medium" style={{ background: '#0b0f19' }}>Medium</option>
              <option value="Hard" style={{ background: '#0b0f19' }}>Hard</option>
            </select>
          </div>

          {/* Company */}
          <div style={{ flex: '1 1 150px' }}>
            <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>Company Tag</label>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none' }}
            >
              <option value="All" style={{ background: '#0b0f19' }}>All Companies</option>
              {allCompanies.map(comp => <option key={comp} value={comp} style={{ background: '#0b0f19' }}>{comp}</option>)}
            </select>
          </div>

          {/* Status */}
          <div style={{ flex: '1 1 150px' }}>
            <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none' }}
            >
              <option value="All" style={{ background: '#0b0f19' }}>All Statuses</option>
              <option value="Not Started" style={{ background: '#0b0f19' }}>Not Started</option>
              <option value="In Progress" style={{ background: '#0b0f19' }}>In Progress</option>
              <option value="Completed" style={{ background: '#0b0f19' }}>Completed</option>
            </select>
          </div>
        </div>

        {/* Company Quick filter buttons */}
        <div style={{ marginTop: '20px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginRight: '8px' }}>Popular Tags:</span>
          {['Google', 'Meta', 'Amazon', 'Netflix', 'Uber', 'Stripe', 'Microsoft'].map(c => {
            const isSelected = selectedCompany === c;
            return (
              <button
                key={c}
                onClick={() => setSelectedCompany(isSelected ? 'All' : c)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  border: '1px solid',
                  background: isSelected ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.02)',
                  borderColor: isSelected ? 'var(--color-primary)' : 'var(--border-glass)',
                  color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                  transition: 'var(--transition-smooth)'
                }}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      {/* Problems List */}
      {/* Problems List */}
      <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>Problems List</span>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px' }}>{filteredProblems.length} found</span>
      </h3>

      {(() => {
        const problemsByCategory: Record<string, typeof problems> = {};
        filteredProblems.forEach(p => {
          if (!problemsByCategory[p.category]) {
            problemsByCategory[p.category] = [];
          }
          problemsByCategory[p.category].push(p);
        });

        const categoriesToRender = Object.entries(problemsByCategory);

        if (categoriesToRender.length === 0) {
          return (
            <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No problems match your current filter selections. Try resetting filters.
            </div>
          );
        }

        return categoriesToRender.map(([categoryName, probs]) => (
          <div key={categoryName} style={{ marginBottom: '32px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>{categoryName}</span>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-primary)', background: 'var(--color-primary-glow)', padding: '1px 8px', borderRadius: '20px' }}>
                {probs.length}
              </span>
            </h4>

            <div className="glass-panel" style={{ overflow: 'hidden' }}>
              {probs.map((prob) => {
                const status = completedMap[prob.id] || 'not-started';
                return (
                  <div
                    key={prob.id}
                    className="problem-row"
                    onClick={() => onSelectProblem(prob.id)}
                    style={{
                      borderLeft: prob.isDetailed ? '3px solid var(--color-primary)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexGrow: 1, minWidth: 0 }}>
                      {/* Checkbox toggle status */}
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStatus(prob.id);
                        }}
                        style={{
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          color: status === 'completed' ? 'var(--color-teal)' : status === 'in-progress' ? 'var(--color-gold)' : 'var(--text-muted)',
                          transition: 'var(--transition-smooth)'
                        }}
                        title={`Status: ${status === 'completed' ? 'Completed' : status === 'in-progress' ? 'In Progress' : 'Not Started'}. Click to toggle.`}
                      >
                        {status === 'completed' ? (
                          <CheckCircle size={18} style={{ fill: 'rgba(16, 185, 129, 0.1)' }} />
                        ) : status === 'in-progress' ? (
                          <Play size={18} style={{ transform: 'rotate(90deg)', fill: 'rgba(245, 158, 11, 0.1)' }} />
                        ) : (
                          <Circle size={18} />
                        )}
                      </div>

                      <span className="problem-row-title" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {prob.title}
                      </span>

                      {prob.isDetailed ? (
                        <span style={{ fontSize: '9px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--color-primary)', border: '1px solid rgba(99, 102, 241, 0.2)', padding: '1px 6px', borderRadius: '3px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>✦ Deep Dive</span>
                      ) : (
                        <span style={{ fontSize: '9px', background: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-muted)', border: '1px solid var(--border-glass)', padding: '1px 6px', borderRadius: '3px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>📝 Summary</span>
                      )}
                    </div>

                    <div className="problem-row-meta" style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
                      {/* Company tags list */}
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        {prob.companyTags.slice(0, 2).map(tag => (
                          <span key={tag} className="company-tag" style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px' }}>{tag}</span>
                        ))}
                        {prob.companyTags.length > 2 && (
                          <span className="company-tag" style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', opacity: 0.6 }}>+{prob.companyTags.length - 2}</span>
                        )}
                      </div>

                      <span className={`tag tag-${prob.difficulty.toLowerCase()}`} style={{ fontSize: '11px', padding: '2px 8px', minWidth: '60px', textAlign: 'center' }}>
                        {prob.difficulty}
                      </span>

                      <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500, paddingLeft: '4px' }}>
                        ➔
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ));
      })()}
      </div>}
    </div>
  );
};
