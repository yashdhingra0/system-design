import { useState, useEffect } from 'react';
import { problems } from './data/problems';
import { concepts } from './data/concepts';
import { solidPrinciples } from './data/solidData';
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
import { DesignDoctor } from './components/DesignDoctor';
import { TechComparisons } from './components/TechComparisons';
import { SystemDiagrams } from './components/SystemDiagrams';
import { SystemEvolution } from './components/SystemEvolution';
import { AIRoadmap } from './components/AIRoadmap';
import { AILearningHub } from './components/AILearningHub';
import { AINewsFeed } from './components/AINewsFeed';
import { TopNavbar, NAV_GROUPS } from './components/TopNavbar';
import type { Tab } from './components/TopNavbar';
import { LeftSidebar } from './components/LeftSidebar';

type Status = 'not-started' | 'in-progress' | 'completed';

const SIDEBAR_WIDTH = 220;

function App() {
  const [currentTab, setCurrentTab] = useState<Tab>('concepts');
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(null);
  const [selectedPatternId, setSelectedPatternId] = useState<string | undefined>(undefined);
  const [selectedAITopicId, setSelectedAITopicId] = useState<string | undefined>(undefined);

  const [selectedConceptId, setSelectedConceptId] = useState<string>(concepts[0].id);
  const [selectedPrincipleId, setSelectedPrincipleId] = useState<string>(solidPrinciples[0].id);
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);

  // Sidebar: which group is "active" in top nav, and collapsed state
  const [activeGroupLabel, setActiveGroupLabel] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    try { return localStorage.getItem('sidebar_collapsed') === 'true'; } catch { return false; }
  });

  useEffect(() => {
    try { localStorage.setItem('sidebar_collapsed', String(sidebarCollapsed)); } catch { /* noop */ }
  }, [sidebarCollapsed]);

  // Auto-set active group when tab changes
  useEffect(() => {
    const group = NAV_GROUPS.find(g => g.items.some(i => i.tab === currentTab));
    if (group) setActiveGroupLabel(group.label);
  }, [currentTab]);

  // Theme
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try { const s = localStorage.getItem('sys_design_theme'); return s === 'light' ? 'light' : 'dark'; }
    catch { return 'dark'; }
  });

  useEffect(() => {
    try {
      document.body.classList.toggle('light-mode', theme === 'light');
      localStorage.setItem('sys_design_theme', theme);
    } catch { /* noop */ }
  }, [theme]);

  // Progress
  const [completedMap, setCompletedMap] = useState<Record<string, Status>>(() => {
    try { const s = localStorage.getItem('sys_design_progress'); return s ? JSON.parse(s) : {}; }
    catch { return {}; }
  });
  useEffect(() => { localStorage.setItem('sys_design_progress', JSON.stringify(completedMap)); }, [completedMap]);

  const [completedConcepts, setCompletedConcepts] = useState<string[]>(() => {
    try { const s = localStorage.getItem('sys_design_completed_concepts'); return s ? JSON.parse(s) : []; }
    catch { return []; }
  });
  const [completedPrinciples, setCompletedPrinciples] = useState<string[]>(() => {
    try { const s = localStorage.getItem('sys_design_completed_principles'); return s ? JSON.parse(s) : []; }
    catch { return []; }
  });
  const [completedQuestions, setCompletedQuestions] = useState<number[]>(() => {
    try { const s = localStorage.getItem('sys_design_completed_questions'); return s ? JSON.parse(s) : []; }
    catch { return []; }
  });

  useEffect(() => { localStorage.setItem('sys_design_completed_concepts', JSON.stringify(completedConcepts)); }, [completedConcepts]);
  useEffect(() => { localStorage.setItem('sys_design_completed_principles', JSON.stringify(completedPrinciples)); }, [completedPrinciples]);
  useEffect(() => { localStorage.setItem('sys_design_completed_questions', JSON.stringify(completedQuestions)); }, [completedQuestions]);

  const toggleStatus = (id: string) => {
    setCompletedMap(prev => {
      const cur = prev[id] || 'not-started';
      const next: Status = cur === 'not-started' ? 'in-progress' : cur === 'in-progress' ? 'completed' : 'not-started';
      return { ...prev, [id]: next };
    });
  };
  const setSpecificStatus = (id: string, s: Status) => setCompletedMap(prev => ({ ...prev, [id]: s }));
  const toggleConceptComplete = (id: string) => setCompletedConcepts(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const togglePrincipleComplete = (id: string) => setCompletedPrinciples(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const toggleQuestionComplete = (id: number) => setCompletedQuestions(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const handleSelectProblem = (id: string) => { setSelectedProblemId(id); setCurrentTab('dashboard'); };
  const handleSelectTab = (tab: Tab) => { setCurrentTab(tab); setSelectedProblemId(null); };
  const handleNavigateToContent = (tab: Tab, id: string) => {
    setCurrentTab(tab);
    if (tab === 'concepts') { setSelectedConceptId(id); setSelectedProblemId(null); }
    else if (tab === 'solid') { setSelectedPrincipleId(id); setSelectedProblemId(null); }
    else if (tab === 'dashboard') { setSelectedProblemId(id); }
  };

  const selectedProblem = problems.find(p => p.id === selectedProblemId);
  const sidebarOffset = sidebarCollapsed ? 0 : SIDEBAR_WIDTH;
  const isHome = currentTab === 'dashboard' && !selectedProblemId;

  // Content renderer
  const renderContent = () => {
    if (selectedProblemId && selectedProblem) {
      return <ProblemDetail problem={selectedProblem} onBack={() => setSelectedProblemId(null)} status={completedMap[selectedProblem.id] || 'not-started'} onChangeStatus={setSpecificStatus} />;
    }
    switch (currentTab) {
      case 'concepts':
        return <ConceptDetail activeConceptId={selectedConceptId} onSelectConcept={setSelectedConceptId} isCompleted={completedConcepts.includes(selectedConceptId)} onToggleComplete={toggleConceptComplete} />;
      case 'solid':
        return <SolidPrinciples activeId={selectedPrincipleId} onSelectPrinciple={setSelectedPrincipleId} isCompleted={completedPrinciples.includes(selectedPrincipleId)} onToggleComplete={togglePrincipleComplete} />;
      case 'dashboard':
        return <Dashboard onSelectProblem={handleSelectProblem} completedMap={completedMap} toggleStatus={toggleStatus} completedConcepts={completedConcepts} completedPrinciples={completedPrinciples} completedQuestions={completedQuestions} onNavigateToTab={tab => handleSelectTab(tab as Tab)} onViewAINews={() => handleSelectTab('ai-news')} />;
      case 'questions':
        return <QuestionsDeck selectedQuestionId={selectedQuestionId} onClearSelectedQuestion={() => setSelectedQuestionId(null)} completedQuestions={completedQuestions} onToggleCompleteQuestion={toggleQuestionComplete} />;
      case 'quiz':
        return <Quiz onNavigateToContent={handleNavigateToContent} />;
      case 'prep-tools':
        return <PrepTools />;
      case 'revision-notes':
        return <RevisionNotesView />;
      case 'prep-sandbox':
        return <PrepSandbox completedMap={completedMap} onSelectProblem={handleSelectProblem} />;
      case 'design-patterns':
        return <DesignPatterns initialPatternId={selectedPatternId} />;
      case 'design-doctor':
        return <DesignDoctor onViewPattern={pid => { setSelectedPatternId(pid); handleSelectTab('design-patterns'); }} />;
      case 'tech-comparisons':
        return <TechComparisons />;
      case 'system-diagrams':
        return <SystemDiagrams />;
      case 'system-evolution':
        return <SystemEvolution />;
      case 'ai-roadmap':
        return <AIRoadmap onSelectTopic={tid => { setSelectedAITopicId(tid); handleSelectTab('ai-learning'); }} />;
      case 'ai-learning':
        return <AILearningHub initialTopicId={selectedAITopicId} />;
      case 'ai-news':
        return <AINewsFeed />;
      default:
        return null;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
      {/* Fixed top navbar */}
      <TopNavbar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        theme={theme}
        onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
        activeGroupLabel={activeGroupLabel}
        onSetActiveGroup={label => {
          if (label) {
            const group = NAV_GROUPS.find(g => g.label === label);
            // Always navigate to first item of clicked group
            if (group) handleSelectTab(group.items[0].tab);
            setSidebarCollapsed(false);
          }
          setActiveGroupLabel(label || null);
        }}
      />

      {/* Left sidebar */}
      <LeftSidebar
        currentTab={currentTab}
        activeGroupLabel={activeGroupLabel}
        onSelectTab={handleSelectTab}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(c => !c)}
      />

      {/* Main content area — offset by sidebar */}
      <div style={{
        marginLeft: sidebarOffset,
        paddingTop: 56,
        minHeight: '100vh',
        transition: 'margin-left 0.22s ease',
        display: 'flex',
      }}>
        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0, padding: isHome ? '28px 32px' : '28px 36px', overflowY: 'auto' }}>
          {renderContent()}
        </div>

        {/* Right news panel — only on home/dashboard */}
        {isHome && (
          <div style={{
            width: 300,
            flexShrink: 0,
            borderLeft: '1px solid var(--border-glass)',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{
              padding: '16px 16px 0',
              position: 'sticky', top: 0,
              background: 'var(--bg-main)',
              zIndex: 1,
              borderBottom: '1px solid var(--border-glass)',
              paddingBottom: 12,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14 }}>📡</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-primary)' }}>News</span>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                <button
                  onClick={() => handleSelectTab('ai-news')}
                  style={{ marginLeft: 'auto', fontSize: 10, color: '#10b981', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                >
                  See all →
                </button>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <AINewsFeed compact />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
