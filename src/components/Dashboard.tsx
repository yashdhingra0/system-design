import React, { useState } from 'react';
import { problems } from '../data/problems';
import { Card3D } from './ui/Card3D';
import { Search, CheckCircle, Circle, Play } from 'lucide-react';

interface DashboardProps {
  onSelectProblem: (id: string) => void;
  completedMap: Record<string, 'not-started' | 'in-progress' | 'completed'>;
  toggleStatus: (id: string) => void;
  completedConcepts: string[];
  completedPrinciples: string[];
  completedQuestions: number[];
}

export const Dashboard: React.FC<DashboardProps> = ({
  onSelectProblem,
  completedMap,
  toggleStatus,
  completedConcepts,
  completedPrinciples,
  completedQuestions
}) => {
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 className="glow-text" style={{ fontSize: '36px', fontWeight: 800, marginBottom: '8px' }}>System Design Path</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Master the top 50 trending system design questions asked in premium tech interviews.</p>
        </div>
      </div>

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
    </div>
  );
};
