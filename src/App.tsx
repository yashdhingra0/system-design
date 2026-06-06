import { useState, useEffect } from 'react';
import { problems } from './data/problems';
import { concepts } from './data/concepts';
import { solidPrinciples } from './data/solidData';
import { interviewQuestions } from './data/interviewQuestions';
import { Dashboard } from './components/Dashboard';
import { ProblemDetail } from './components/ProblemDetail';
import { ConceptDetail } from './components/ConceptDetail';
import { SolidPrinciples } from './components/SolidPrinciples';
import { QuestionsDeck } from './components/QuestionsDeck';
import { Quiz } from './components/Quiz';
import { PrepTools } from './components/PrepTools';
import { RevisionNotesView } from './components/RevisionNotesView';
import { PrepSandbox } from './components/PrepSandbox';
import { DesignPatterns } from './components/DesignPatterns';
import { TechComparisons } from './components/TechComparisons';
import { SystemDiagrams } from './components/SystemDiagrams';
import { SystemEvolution } from './components/SystemEvolution';
import {
  LayoutDashboard,
  BookOpen,
  Award,
  RefreshCw,
  Zap,
  ClipboardList,
  HelpCircle,
  Wrench,
  ChevronDown,
  ChevronRight,
  Search,
  CheckCircle,
  Play,
  Circle,
  Menu,
  X,
  ChevronLeft,
  BookOpenCheck,
  FolderGit2,
  Sun,
  Moon,
  GitBranch,
  ArrowLeftRight,
  Network,
  TrendingUp
} from 'lucide-react';

type Tab = 'concepts' | 'solid' | 'dashboard' | 'questions' | 'quiz' | 'prep-tools' | 'revision-notes' | 'prep-sandbox' | 'design-patterns' | 'tech-comparisons' | 'system-diagrams' | 'system-evolution';
type Status = 'not-started' | 'in-progress' | 'completed';

function App() {
  const [currentTab, setCurrentTab] = useState<Tab>('concepts');
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(null);
  
  // Controlled states for sidebar selection
  const [selectedConceptId, setSelectedConceptId] = useState<string>(concepts[0].id);
  const [selectedPrincipleId, setSelectedPrincipleId] = useState<string>(solidPrinciples[0].id);
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);

  // Collapsible sidebar states
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('sys_design_theme');
      return (saved === 'light') ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });

  // Apply theme class to body
  useEffect(() => {
    try {
      if (theme === 'light') {
        document.body.classList.add('light-mode');
      } else {
        document.body.classList.remove('light-mode');
      }
      localStorage.setItem('sys_design_theme', theme);
    } catch (e) {
      console.error('Failed to set theme:', e);
    }
  }, [theme]);

  // Sidebar accordion expansion states
  const [conceptsExpanded, setConceptsExpanded] = useState<boolean>(true);
  const [solidExpanded, setSolidExpanded] = useState<boolean>(false);
  const [problemsExpanded, setProblemsExpanded] = useState<boolean>(false);
  const [questionsExpanded, setQuestionsExpanded] = useState<boolean>(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [expandedProblemCategories, setExpandedProblemCategories] = useState<Record<string, boolean>>({});

  // Sidebar search filter states
  const [problemSearch, setProblemSearch] = useState<string>('');
  const [questionSearch, setQuestionSearch] = useState<string>('');

  // Load progress from LocalStorage
  const [completedMap, setCompletedMap] = useState<Record<string, Status>>(() => {
    try {
      const saved = localStorage.getItem('sys_design_progress');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('sys_design_progress', JSON.stringify(completedMap));
  }, [completedMap]);

  const [completedConcepts, setCompletedConcepts] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sys_design_completed_concepts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [completedPrinciples, setCompletedPrinciples] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sys_design_completed_principles');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [completedQuestions, setCompletedQuestions] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('sys_design_completed_questions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('sys_design_completed_concepts', JSON.stringify(completedConcepts));
  }, [completedConcepts]);

  useEffect(() => {
    localStorage.setItem('sys_design_completed_principles', JSON.stringify(completedPrinciples));
  }, [completedPrinciples]);

  useEffect(() => {
    localStorage.setItem('sys_design_completed_questions', JSON.stringify(completedQuestions));
  }, [completedQuestions]);

  const toggleStatus = (id: string) => {
    setCompletedMap(prev => {
      const current = prev[id] || 'not-started';
      let next: Status = 'not-started';
      if (current === 'not-started') next = 'in-progress';
      else if (current === 'in-progress') next = 'completed';
      
      return { ...prev, [id]: next };
    });
  };

  const setSpecificStatus = (id: string, newStatus: Status) => {
    setCompletedMap(prev => ({ ...prev, [id]: newStatus }));
  };

  const resetAllProgress = () => {
    if (window.confirm("Are you sure you want to reset all of your progress?")) {
      setCompletedMap({});
      setCompletedConcepts([]);
      setCompletedPrinciples([]);
      setCompletedQuestions([]);
    }
  };

  const toggleConceptComplete = (id: string) => {
    setCompletedConcepts(prev => 
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
    );
  };

  const togglePrincipleComplete = (id: string) => {
    setCompletedPrinciples(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const toggleQuestionComplete = (id: number) => {
    setCompletedQuestions(prev => 
      prev.includes(id) ? prev.filter(qId => qId !== id) : [...prev, id]
    );
  };

  const handleSelectProblem = (id: string) => {
    setSelectedProblemId(id);
    setCurrentTab('dashboard');
    setMobileOpen(false); // Close mobile drawer
  };

  const handleSelectTab = (tab: Tab) => {
    setCurrentTab(tab);
    setSelectedProblemId(null);
    setMobileOpen(false); // Close mobile drawer
  };

  const handleNavigateToContent = (tab: Tab, id: string) => {
    setCurrentTab(tab);
    setMobileOpen(false);
    if (tab === 'concepts') {
      setSelectedConceptId(id);
      setSelectedProblemId(null);
    } else if (tab === 'solid') {
      setSelectedPrincipleId(id);
      setSelectedProblemId(null);
    } else if (tab === 'dashboard') {
      setSelectedProblemId(id);
    }
  };

  const handleToggleCategory = (catName: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [catName]: !prev[catName]
    }));
  };

  // Filter problems for sidebar list
  const filteredProblems = problems.filter(p => 
    p.title.toLowerCase().includes(problemSearch.toLowerCase()) || 
    p.category.toLowerCase().includes(problemSearch.toLowerCase())
  );

  // Group filtered problems by category for sidebar list
  const sidebarProblemsByCategory: Record<string, typeof problems> = {};
  filteredProblems.forEach(p => {
    if (!sidebarProblemsByCategory[p.category]) {
      sidebarProblemsByCategory[p.category] = [];
    }
    sidebarProblemsByCategory[p.category].push(p);
  });

  const toggleProblemCategory = (catName: string) => {
    setExpandedProblemCategories(prev => ({
      ...prev,
      [catName]: prev[catName] === false ? true : false
    }));
  };

  // Filter questions for sidebar list
  const filteredQuestions = interviewQuestions.filter(q => 
    q.question.toLowerCase().includes(questionSearch.toLowerCase()) ||
    q.category.toLowerCase().includes(questionSearch.toLowerCase())
  );

  // Group filtered questions by category
  const questionsByCategory: Record<string, typeof interviewQuestions> = {};
  filteredQuestions.forEach(q => {
    if (!questionsByCategory[q.category]) {
      questionsByCategory[q.category] = [];
    }
    questionsByCategory[q.category].push(q);
  });

  const selectedProblem = problems.find(p => p.id === selectedProblemId);
  const totalCount = problems.length;
  const completedCount = Object.values(completedMap).filter(s => s === 'completed').length;

  const overallCompleted = completedConcepts.length + completedPrinciples.length + completedCount + completedQuestions.length;
  const overallTotal = 7 + 5 + totalCount + 200;
  const overallPercent = Math.round((overallCompleted / overallTotal) * 100);



  return (
    <div className={`app-container ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 999
          }}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}>
        
        {/* Sidebar Header (Brand & Collapse button) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', padding: '0 8px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'linear-gradient(135deg, #6d5df6 0%, #a78bfa 100%)', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 0 12px rgba(139, 124, 246, 0.25)' }}>
              <Zap size={18} style={{ color: '#fff' }} />
            </div>
            {!sidebarCollapsed && (
              <span style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.5px' }} className="glow-text">
                Systemic
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {!sidebarCollapsed && (
              <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '6px',
                  borderRadius: '6px',
                  transition: 'var(--transition-smooth)'
                }}
                title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              </button>
            )}

            {/* Desktop Collapse Toggle */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="desktop-toggle-btn"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px',
                borderRadius: '6px',
                transition: 'var(--transition-smooth)'
              }}
              title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="mobile-close-btn"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Tree Navigation */}
        <div style={{ flexGrow: 1, overflowY: 'auto', paddingRight: '4px', marginBottom: '20px' }} className="sidebar-scroll-container">
          {!sidebarCollapsed ? (
            <>
              {/* ===== 📚 LEARN ===== */}
              <div className="sidebar-section-label">
                <BookOpen size={12} />
                <span>Learn</span>
              </div>
              
              {/* Design Fundamentals Section */}
              <div className="sidebar-group">
                <button
                  onClick={() => { setConceptsExpanded(!conceptsExpanded); handleSelectTab('concepts'); }}
                  className={`sidebar-group-header ${currentTab === 'concepts' ? 'active' : ''}`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BookOpen size={16} />
                    <span>Design Fundamentals</span>
                  </div>
                  {conceptsExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
                
                {conceptsExpanded && (
                  <div className="sidebar-sublist">
                    {concepts.map(c => (
                      <button
                        key={c.id}
                        onClick={() => { setSelectedConceptId(c.id); handleSelectTab('concepts'); }}
                        className={`sidebar-subitem ${currentTab === 'concepts' && selectedConceptId === c.id ? 'active' : ''}`}
                      >
                        <span>{c.title}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* SOLID Principles Section */}
              <div className="sidebar-group">
                <button
                  onClick={() => { setSolidExpanded(!solidExpanded); handleSelectTab('solid'); }}
                  className={`sidebar-group-header ${currentTab === 'solid' ? 'active' : ''}`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Award size={16} />
                    <span>SOLID Principles</span>
                  </div>
                  {solidExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>

                {solidExpanded && (
                  <div className="sidebar-sublist">
                    {solidPrinciples.map(p => (
                      <button
                        key={p.id}
                        onClick={() => { setSelectedPrincipleId(p.id); handleSelectTab('solid'); }}
                        className={`sidebar-subitem ${currentTab === 'solid' && selectedPrincipleId === p.id ? 'active' : ''}`}
                      >
                        <span>{p.shortName} Principle</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Design Patterns */}
              <button
                onClick={() => handleSelectTab('design-patterns')}
                className={`nav-link ${currentTab === 'design-patterns' ? 'active' : ''}`}
                style={{ width: '100%', background: 'transparent', border: 'none', textAlign: 'left', margin: '4px 0 0 0', padding: '10px 12px', fontSize: '14px', borderRadius: '8px' }}
              >
                <GitBranch size={16} />
                <span>Design Patterns</span>
              </button>

              {/* Tech Comparisons */}
              <button
                onClick={() => handleSelectTab('tech-comparisons')}
                className={`nav-link ${currentTab === 'tech-comparisons' ? 'active' : ''}`}
                style={{ width: '100%', background: 'transparent', border: 'none', textAlign: 'left', margin: '4px 0 0 0', padding: '10px 12px', fontSize: '14px', borderRadius: '8px' }}
              >
                <ArrowLeftRight size={16} />
                <span>Tech Comparisons</span>
              </button>

              {/* ===== 💻 PRACTICE ===== */}
              <div className="sidebar-section-label">
                <LayoutDashboard size={12} />
                <span>Practice</span>
              </div>

              {/* 50 Interview Problems Section */}
              <div className="sidebar-group">
                <button
                  onClick={() => { setProblemsExpanded(!problemsExpanded); handleSelectTab('dashboard'); }}
                  className={`sidebar-group-header ${currentTab === 'dashboard' ? 'active' : ''}`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <LayoutDashboard size={16} />
                    <span>50 Design Problems</span>
                  </div>
                  {problemsExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>

                {problemsExpanded && (
                  <div className="sidebar-sublist-container">
                    <div style={{ display: 'flex', position: 'relative', margin: '6px 8px 8px 8px' }}>
                      <Search size={12} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input
                        type="text"
                        placeholder="Search problems..."
                        value={problemSearch}
                        onChange={(e) => setProblemSearch(e.target.value)}
                        className="sidebar-search-input"
                      />
                    </div>

                    <div className="sidebar-scrollable-sublist" style={{ padding: '4px 0' }}>
                      {Object.entries(sidebarProblemsByCategory).map(([catName, probs]) => {
                        const isExpanded = expandedProblemCategories[catName] !== false;
                        return (
                          <div key={catName} style={{ marginBottom: '6px' }}>
                            {/* Group Header */}
                            <button
                              onClick={() => toggleProblemCategory(catName)}
                              className="sidebar-category-header"
                              style={{ padding: '6px 8px 6px 12px' }}
                            >
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {catName}
                              </span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.05)', padding: '1px 5px', borderRadius: '10px', fontWeight: 600 }}>
                                  {probs.length}
                                </span>
                                {isExpanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                              </div>
                            </button>

                            {/* Group Items */}
                            {isExpanded && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '2px', paddingLeft: '8px', borderLeft: '1px solid var(--border-glass)', marginLeft: '12px' }}>
                                {probs.map((p) => {
                                  const status = completedMap[p.id] || 'not-started';
                                  const diffLower = p.difficulty.toLowerCase();
                                  return (
                                    <button
                                      key={p.id}
                                      onClick={() => handleSelectProblem(p.id)}
                                      className={`sidebar-subitem ${selectedProblemId === p.id ? 'active' : ''}`}
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: '8px',
                                        padding: '6px 10px',
                                        minHeight: '36px'
                                      }}
                                    >
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flexGrow: 1 }}>
                                        {/* Status Checkbox */}
                                        <div
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            toggleStatus(p.id);
                                          }}
                                          style={{
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            color: status === 'completed' ? 'var(--color-teal)' : status === 'in-progress' ? 'var(--color-gold)' : 'var(--text-muted)'
                                          }}
                                        >
                                          {status === 'completed' ? (
                                            <CheckCircle size={13} style={{ fill: 'rgba(16, 185, 129, 0.1)' }} />
                                          ) : status === 'in-progress' ? (
                                            <Play size={13} style={{ transform: 'rotate(90deg)', fill: 'rgba(245, 158, 11, 0.1)' }} />
                                          ) : (
                                            <Circle size={13} />
                                          )}
                                        </div>

                                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.title}>
                                          {p.title}
                                        </span>
                                      </div>

                                      <span
                                        style={{
                                          fontSize: '8.5px',
                                          fontWeight: 700,
                                          padding: '1px 4px',
                                          borderRadius: '3px',
                                          textTransform: 'uppercase',
                                          letterSpacing: '0.02em',
                                          flexShrink: 0,
                                          background: diffLower === 'easy' ? 'rgba(16, 185, 129, 0.1)' : diffLower === 'medium' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                          color: diffLower === 'easy' ? 'var(--color-teal)' : diffLower === 'medium' ? 'var(--color-gold)' : '#ef4444'
                                        }}
                                      >
                                        {p.difficulty[0]}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {filteredProblems.length === 0 && (
                        <div style={{ padding: '8px 12px', fontSize: '11px', color: 'var(--text-muted)' }}>No problems found</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 200+ Interview Q&As Section */}
              <div className="sidebar-group">
                <button
                  onClick={() => { setQuestionsExpanded(!questionsExpanded); handleSelectTab('questions'); }}
                  className={`sidebar-group-header ${currentTab === 'questions' ? 'active' : ''}`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ClipboardList size={16} />
                    <span>200+ Interview Q&As</span>
                  </div>
                  {questionsExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>

                {questionsExpanded && (
                  <div className="sidebar-sublist-container">
                    <div style={{ display: 'flex', position: 'relative', margin: '6px 8px 8px 8px' }}>
                      <Search size={12} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input
                        type="text"
                        placeholder="Search questions..."
                        value={questionSearch}
                        onChange={(e) => setQuestionSearch(e.target.value)}
                        className="sidebar-search-input"
                      />
                    </div>

                    <div className="sidebar-scrollable-sublist" style={{ maxHeight: '250px' }}>
                      {Object.entries(questionsByCategory).map(([catName, qList]) => {
                        const isCatExpanded = expandedCategories[catName] || questionSearch.length > 0;
                        return (
                          <div key={catName} style={{ marginBottom: '4px' }}>
                            <button
                              onClick={() => handleToggleCategory(catName)}
                              className="sidebar-category-header"
                            >
                              <span>{catName}</span>
                              {isCatExpanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                            </button>
                            
                            {isCatExpanded && (
                              <div style={{ paddingLeft: '8px', borderLeft: '1px solid var(--border-glass)', marginLeft: '8px' }}>
                                {qList.map(q => (
                                  <button
                                    key={q.id}
                                    onClick={() => {
                                      setSelectedQuestionId(q.id);
                                      handleSelectTab('questions');
                                    }}
                                    className="sidebar-subitem"
                                    style={{ fontSize: '11px', padding: '6px 8px', width: '100%', textAlign: 'left' }}
                                  >
                                    <span style={{ color: 'var(--color-secondary)', fontWeight: 600, marginRight: '4px' }}>Q{q.id}:</span>
                                    <span>{q.question}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {filteredQuestions.length === 0 && (
                        <div style={{ padding: '8px 12px', fontSize: '11px', color: 'var(--text-muted)' }}>No questions found</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* System Diagrams */}
              <button
                onClick={() => handleSelectTab('system-diagrams')}
                className={`nav-link ${currentTab === 'system-diagrams' ? 'active' : ''}`}
                style={{ width: '100%', background: 'transparent', border: 'none', textAlign: 'left', margin: '4px 0 0 0', padding: '10px 12px', fontSize: '14px', borderRadius: '8px' }}
              >
                <Network size={16} />
                <span>System Diagrams</span>
              </button>

              {/* System Evolution */}
              <button
                onClick={() => handleSelectTab('system-evolution')}
                className={`nav-link ${currentTab === 'system-evolution' ? 'active' : ''}`}
                style={{ width: '100%', background: 'transparent', border: 'none', textAlign: 'left', margin: '4px 0 0 0', padding: '10px 12px', fontSize: '14px', borderRadius: '8px' }}
              >
                <TrendingUp size={16} />
                <span>System Evolution ✦</span>
              </button>

              {/* Self-Assessment Quiz */}
              <button
                onClick={() => handleSelectTab('quiz')}
                className={`nav-link ${currentTab === 'quiz' ? 'active' : ''}`}
                style={{ width: '100%', background: 'transparent', border: 'none', textAlign: 'left', margin: '4px 0 0 0', padding: '10px 12px', fontSize: '14px', borderRadius: '8px' }}
              >
                <HelpCircle size={16} />
                <span>Self-Assessment Quiz</span>
              </button>

              {/* ===== 🛠 TOOLS ===== */}
              <div className="sidebar-section-label">
                <Wrench size={12} />
                <span>Tools</span>
              </div>

              {/* Product Prep Tools */}
              <button
                onClick={() => handleSelectTab('prep-tools')}
                className={`nav-link ${currentTab === 'prep-tools' ? 'active' : ''}`}
                style={{ width: '100%', background: 'transparent', border: 'none', textAlign: 'left', margin: '4px 0 0 0', padding: '10px 12px', fontSize: '14px', borderRadius: '8px' }}
              >
                <Wrench size={16} />
                <span>Prep Calculators</span>
              </button>

              {/* Last-Minute Revision Notes */}
              <button
                onClick={() => handleSelectTab('revision-notes')}
                className={`nav-link ${currentTab === 'revision-notes' ? 'active' : ''}`}
                style={{ width: '100%', background: 'transparent', border: 'none', textAlign: 'left', margin: '4px 0 0 0', padding: '10px 12px', fontSize: '14px', borderRadius: '8px' }}
              >
                <BookOpenCheck size={16} />
                <span>Revision Notes</span>
              </button>

              {/* Interactive Prep Sandbox */}
              <button
                onClick={() => handleSelectTab('prep-sandbox')}
                className={`nav-link ${currentTab === 'prep-sandbox' ? 'active' : ''}`}
                style={{ width: '100%', background: 'transparent', border: 'none', textAlign: 'left', margin: '4px 0 0 0', padding: '10px 12px', fontSize: '14px', borderRadius: '8px' }}
              >
                <FolderGit2 size={16} />
                <span>Prep Sandbox</span>
              </button>

            </>
          ) : (
            /* Collapsed Icons Only Menu */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginTop: '16px' }}>
              <button onClick={() => handleSelectTab('concepts')} className={`collapsed-icon-link ${currentTab === 'concepts' ? 'active' : ''}`} title="Fundamentals">
                <BookOpen size={20} />
              </button>
              <button onClick={() => handleSelectTab('solid')} className={`collapsed-icon-link ${currentTab === 'solid' ? 'active' : ''}`} title="SOLID">
                <Award size={20} />
              </button>
              <button onClick={() => handleSelectTab('dashboard')} className={`collapsed-icon-link ${currentTab === 'dashboard' ? 'active' : ''}`} title="50 Problems">
                <LayoutDashboard size={20} />
              </button>
              <button onClick={() => handleSelectTab('questions')} className={`collapsed-icon-link ${currentTab === 'questions' ? 'active' : ''}`} title="200+ Q&As">
                <ClipboardList size={20} />
              </button>
              <button onClick={() => handleSelectTab('quiz')} className={`collapsed-icon-link ${currentTab === 'quiz' ? 'active' : ''}`} title="Quiz">
                <HelpCircle size={20} />
              </button>
              <button onClick={() => handleSelectTab('prep-tools')} className={`collapsed-icon-link ${currentTab === 'prep-tools' ? 'active' : ''}`} title="Prep Tools">
                <Wrench size={20} />
              </button>
              <button onClick={() => handleSelectTab('revision-notes')} className={`collapsed-icon-link ${currentTab === 'revision-notes' ? 'active' : ''}`} title="Revision Notes">
                <BookOpenCheck size={20} />
              </button>
              <button onClick={() => handleSelectTab('prep-sandbox')} className={`collapsed-icon-link ${currentTab === 'prep-sandbox' ? 'active' : ''}`} title="Sandbox">
                <FolderGit2 size={20} />
              </button>
              <div style={{ width: '24px', height: '1px', background: 'var(--border-glass)', margin: '8px 0' }} />
              <button onClick={() => handleSelectTab('design-patterns')} className={`collapsed-icon-link ${currentTab === 'design-patterns' ? 'active' : ''}`} title="Design Patterns">
                <GitBranch size={20} />
              </button>
              <button onClick={() => handleSelectTab('tech-comparisons')} className={`collapsed-icon-link ${currentTab === 'tech-comparisons' ? 'active' : ''}`} title="Tech Comparisons">
                <ArrowLeftRight size={20} />
              </button>
              <button onClick={() => handleSelectTab('system-diagrams')} className={`collapsed-icon-link ${currentTab === 'system-diagrams' ? 'active' : ''}`} title="System Diagrams">
                <Network size={20} />
              </button>
              <button onClick={() => handleSelectTab('system-evolution')} className={`collapsed-icon-link ${currentTab === 'system-evolution' ? 'active' : ''}`} title="System Evolution">
                <TrendingUp size={20} />
              </button>
              <div style={{ width: '24px', height: '1px', background: 'var(--border-glass)', margin: '8px 0' }} />
              <button 
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} 
                className="collapsed-icon-link" 
                title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        {!sidebarCollapsed && (
          <div className="glass-panel" style={{ padding: '16px', background: 'rgba(255,255,255,0.01)', flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              <span>Overall Progress</span>
              <span style={{ fontWeight: 700 }}>{overallPercent}% ({overallCompleted}/{overallTotal})</span>
            </div>
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', marginBottom: '12px', overflow: 'hidden' }}>
              <div 
                style={{ 
                  height: '100%', 
                  background: 'linear-gradient(90deg, #6d5df6 0%, #a78bfa 100%)',
                  width: `${overallPercent}%`, 
                  borderRadius: '3px',
                  transition: 'width 0.5s ease-out'
                }} 
              />
            </div>

            <button
              onClick={resetAllProgress}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                width: '100%',
                background: 'transparent',
                border: '1px solid var(--border-glass)',
                color: 'var(--text-muted)',
                fontSize: '11px',
                padding: '6px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 500,
                transition: 'var(--transition-smooth)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#ef4444';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-muted)';
                e.currentTarget.style.borderColor = 'var(--border-glass)';
              }}
            >
              <RefreshCw size={10} />
              <span>Reset Progress</span>
            </button>
          </div>
        )}
      </aside>

      {/* Main Workspace Wrapper (includes mobile header bar) */}
      <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minWidth: 0 }}>
        {/* Mobile Header Bar */}
        <header className="mobile-header">
          <button onClick={() => setMobileOpen(true)} className="mobile-menu-btn">
            <Menu size={20} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={16} style={{ color: 'var(--color-secondary)' }} />
            <span style={{ fontWeight: 800, fontSize: '16px' }} className="glow-text">Systemic</span>
          </div>
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px'
            }}
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </header>

        <main className="main-content">
          {selectedProblemId && selectedProblem ? (
            <ProblemDetail
              problem={selectedProblem}
              onBack={() => setSelectedProblemId(null)}
              status={completedMap[selectedProblem.id] || 'not-started'}
              onChangeStatus={setSpecificStatus}
            />
          ) : currentTab === 'concepts' ? (
            <ConceptDetail 
              activeConceptId={selectedConceptId}
              onSelectConcept={setSelectedConceptId}
              isCompleted={completedConcepts.includes(selectedConceptId)}
              onToggleComplete={toggleConceptComplete}
            />
          ) : currentTab === 'solid' ? (
            <SolidPrinciples 
              activeId={selectedPrincipleId}
              onSelectPrinciple={setSelectedPrincipleId}
              isCompleted={completedPrinciples.includes(selectedPrincipleId)}
              onToggleComplete={togglePrincipleComplete}
            />
          ) : currentTab === 'dashboard' ? (
            <Dashboard
              onSelectProblem={handleSelectProblem}
              completedMap={completedMap}
              toggleStatus={toggleStatus}
              completedConcepts={completedConcepts}
              completedPrinciples={completedPrinciples}
              completedQuestions={completedQuestions}
              onNavigateToTab={(tab) => handleSelectTab(tab as Tab)}
            />
          ) : currentTab === 'questions' ? (
            <QuestionsDeck 
              selectedQuestionId={selectedQuestionId}
              onClearSelectedQuestion={() => setSelectedQuestionId(null)}
              completedQuestions={completedQuestions}
              onToggleCompleteQuestion={toggleQuestionComplete}
            />
          ) : currentTab === 'prep-tools' ? (
            <PrepTools />
          ) : currentTab === 'revision-notes' ? (
            <RevisionNotesView />
          ) : currentTab === 'prep-sandbox' ? (
            <PrepSandbox
              completedMap={completedMap}
              onSelectProblem={handleSelectProblem}
            />
          ) : currentTab === 'design-patterns' ? (
            <DesignPatterns />
          ) : currentTab === 'tech-comparisons' ? (
            <TechComparisons />
          ) : currentTab === 'system-diagrams' ? (
            <SystemDiagrams />
          ) : currentTab === 'system-evolution' ? (
            <SystemEvolution />
          ) : (
            <Quiz onNavigateToContent={handleNavigateToContent} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
