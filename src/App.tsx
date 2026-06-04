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
  Circle 
} from 'lucide-react';

type Tab = 'concepts' | 'solid' | 'dashboard' | 'questions' | 'quiz' | 'prep-tools';
type Status = 'not-started' | 'in-progress' | 'completed';

function App() {
  const [currentTab, setCurrentTab] = useState<Tab>('concepts');
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(null);
  
  // Controlled states for sidebar selection
  const [selectedConceptId, setSelectedConceptId] = useState<string>(concepts[0].id);
  const [selectedPrincipleId, setSelectedPrincipleId] = useState<string>(solidPrinciples[0].id);
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);

  // Sidebar accordion expansion states
  const [conceptsExpanded, setConceptsExpanded] = useState<boolean>(true);
  const [solidExpanded, setSolidExpanded] = useState<boolean>(false);
  const [problemsExpanded, setProblemsExpanded] = useState<boolean>(false);
  const [questionsExpanded, setQuestionsExpanded] = useState<boolean>(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

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
    }
  };

  const handleSelectProblem = (id: string) => {
    setSelectedProblemId(id);
    setCurrentTab('dashboard');
  };

  const handleSelectTab = (tab: Tab) => {
    setCurrentTab(tab);
    setSelectedProblemId(null);
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
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const getStatusIcon = (probId: string) => {
    const s = completedMap[probId] || 'not-started';
    switch (s) {
      case 'completed': return <CheckCircle size={13} style={{ color: 'var(--color-teal)' }} />;
      case 'in-progress': return <Play size={13} style={{ color: 'var(--color-gold)', transform: 'rotate(90deg)' }} />;
      default: return <Circle size={13} style={{ color: 'var(--text-muted)' }} />;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', padding: '0 8px', flexShrink: 0 }}>
          <div style={{ background: 'linear-gradient(135deg, var(--color-secondary) 0%, var(--color-primary) 100%)', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)' }}>
            <Zap size={18} style={{ color: '#fff' }} />
          </div>
          <span style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.5px' }} className="glow-text">
            Systemic
          </span>
        </div>

        {/* Scrollable Tree Navigation */}
        <div style={{ flexGrow: 1, overflowY: 'auto', paddingRight: '4px', marginBottom: '20px' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, padding: '0 8px', marginBottom: '12px' }}>
            Preparation Roadmap
          </div>
          
          {/* 1. Design Fundamentals Section */}
          <div className="sidebar-group">
            <button
              onClick={() => { setConceptsExpanded(!conceptsExpanded); handleSelectTab('concepts'); }}
              className={`sidebar-group-header ${currentTab === 'concepts' ? 'active' : ''}`}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={16} />
                <span>1. Design Fundamentals</span>
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

          {/* 2. SOLID Principles Section */}
          <div className="sidebar-group">
            <button
              onClick={() => { setSolidExpanded(!solidExpanded); handleSelectTab('solid'); }}
              className={`sidebar-group-header ${currentTab === 'solid' ? 'active' : ''}`}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={16} />
                <span>2. SOLID Principles</span>
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

          {/* 3. 50 Interview Problems Section */}
          <div className="sidebar-group">
            <button
              onClick={() => { setProblemsExpanded(!problemsExpanded); handleSelectTab('dashboard'); }}
              className={`sidebar-group-header ${currentTab === 'dashboard' ? 'active' : ''}`}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <LayoutDashboard size={16} />
                <span>3. 50 Interview Problems</span>
              </div>
              {problemsExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>

            {problemsExpanded && (
              <div className="sidebar-sublist-container">
                {/* Search Bar for Problems */}
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

                <div className="sidebar-scrollable-sublist">
                  {filteredProblems.map(p => (
                    <button
                      key={p.id}
                      onClick={() => handleSelectProblem(p.id)}
                      className={`sidebar-subitem ${selectedProblemId === p.id ? 'active' : ''}`}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.title}
                      </span>
                      {getStatusIcon(p.id)}
                    </button>
                  ))}
                  {filteredProblems.length === 0 && (
                    <div style={{ padding: '8px 12px', fontSize: '11px', color: 'var(--text-muted)' }}>No problems found</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 4. 200+ Interview Q&As Section */}
          <div className="sidebar-group">
            <button
              onClick={() => { setQuestionsExpanded(!questionsExpanded); handleSelectTab('questions'); }}
              className={`sidebar-group-header ${currentTab === 'questions' ? 'active' : ''}`}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ClipboardList size={16} />
                <span>4. 200+ Interview Q&As</span>
              </div>
              {questionsExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>

            {questionsExpanded && (
              <div className="sidebar-sublist-container">
                {/* Search Bar for Questions */}
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

          {/* 5. Self-Assessment Quiz */}
          <button
            onClick={() => handleSelectTab('quiz')}
            className={`nav-link ${currentTab === 'quiz' ? 'active' : ''}`}
            style={{ width: '100%', background: 'transparent', border: 'none', textAlign: 'left', margin: '4px 0 0 0', padding: '10px 12px', fontSize: '14px', borderRadius: '8px' }}
          >
            <HelpCircle size={16} />
            <span>5. Self-Assessment Quiz</span>
          </button>

          {/* 6. Product Prep Tools */}
          <button
            onClick={() => handleSelectTab('prep-tools')}
            className={`nav-link ${currentTab === 'prep-tools' ? 'active' : ''}`}
            style={{ width: '100%', background: 'transparent', border: 'none', textAlign: 'left', margin: '4px 0 0 0', padding: '10px 12px', fontSize: '14px', borderRadius: '8px' }}
          >
            <Wrench size={16} />
            <span>6. Interactive Prep Tools</span>
          </button>
        </div>

        {/* Sidebar Footer */}
        <div className="glass-panel" style={{ padding: '16px', background: 'rgba(255,255,255,0.01)', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
            <span>Overall Progress</span>
            <span style={{ fontWeight: 700 }}>{completedCount}/{totalCount} Done</span>
          </div>
          <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', marginBottom: '12px', overflow: 'hidden' }}>
            <div 
              style={{ 
                height: '100%', 
                background: 'linear-gradient(90deg, var(--color-secondary) 0%, var(--color-primary) 100%)', 
                width: `${progressPercent}%`, 
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
      </aside>

      {/* Main Workspace */}
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
          />
        ) : currentTab === 'solid' ? (
          <SolidPrinciples 
            activeId={selectedPrincipleId}
            onSelectPrinciple={setSelectedPrincipleId}
          />
        ) : currentTab === 'dashboard' ? (
          <Dashboard
            onSelectProblem={handleSelectProblem}
            completedMap={completedMap}
            toggleStatus={toggleStatus}
          />
        ) : currentTab === 'questions' ? (
          <QuestionsDeck 
            selectedQuestionId={selectedQuestionId}
            onClearSelectedQuestion={() => setSelectedQuestionId(null)}
          />
        ) : currentTab === 'prep-tools' ? (
          <PrepTools />
        ) : (
          <Quiz />
        )}
      </main>
    </div>
  );
}

export default App;
