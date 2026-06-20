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
import { TopNavbar } from './components/TopNavbar';
// lucide-react icons used by sub-components via TopNavbar

type Tab = 'concepts' | 'solid' | 'dashboard' | 'questions' | 'quiz' | 'prep-tools' | 'revision-notes' | 'prep-sandbox' | 'design-patterns' | 'tech-comparisons' | 'system-diagrams' | 'system-evolution' | 'design-doctor' | 'ai-roadmap' | 'ai-learning' | 'ai-news';
type Status = 'not-started' | 'in-progress' | 'completed';

function App() {
  const [currentTab, setCurrentTab] = useState<Tab>('concepts');
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(null);
  const [selectedPatternId, setSelectedPatternId] = useState<string | undefined>(undefined);
  const [selectedAITopicId, setSelectedAITopicId] = useState<string | undefined>(undefined);
  
  // Controlled states for sidebar selection
  const [selectedConceptId, setSelectedConceptId] = useState<string>(concepts[0].id);
  const [selectedPrincipleId, setSelectedPrincipleId] = useState<string>(solidPrinciples[0].id);
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);


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
  };

  const handleSelectTab = (tab: Tab) => {
    setCurrentTab(tab);
    setSelectedProblemId(null);
  };

  const handleNavigateToContent = (tab: Tab, id: string) => {
    setCurrentTab(tab);
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





  const selectedProblem = problems.find(p => p.id === selectedProblemId);




  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
      {/* Top Navigation */}
      <TopNavbar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        theme={theme}
        onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
      />

      {/* Main Content — below fixed top nav */}
      <main className="main-with-topnav">
        <div className="content-area">
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
              onViewAINews={() => handleSelectTab('ai-news')}
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
            <DesignPatterns initialPatternId={selectedPatternId} />
          ) : currentTab === 'design-doctor' ? (
            <DesignDoctor
              onViewPattern={(patternId) => {
                setSelectedPatternId(patternId);
                handleSelectTab('design-patterns');
              }}
            />
          ) : currentTab === 'tech-comparisons' ? (
            <TechComparisons />
          ) : currentTab === 'system-diagrams' ? (
            <SystemDiagrams />
          ) : currentTab === 'system-evolution' ? (
            <SystemEvolution />
          ) : currentTab === 'ai-roadmap' ? (
            <AIRoadmap
              onSelectTopic={(topicId) => {
                setSelectedAITopicId(topicId);
                handleSelectTab('ai-learning');
              }}
            />
          ) : currentTab === 'ai-learning' ? (
            <AILearningHub initialTopicId={selectedAITopicId} />
          ) : currentTab === 'ai-news' ? (
            <AINewsFeed />
          ) : (
            <Quiz onNavigateToContent={handleNavigateToContent} />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
