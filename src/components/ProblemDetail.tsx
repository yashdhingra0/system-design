import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Problem } from '../data/problems';
import { InteractiveSVG } from './ui/InteractiveSVG';
import { ArrowLeft, CheckCircle, Play, Circle, Code, Server, Database, Shuffle, AlertTriangle, Copy, Check, Info } from 'lucide-react';

interface ProblemDetailProps {
  problem: Problem;
  onBack: () => void;
  status: 'not-started' | 'in-progress' | 'completed';
  onChangeStatus: (id: string, newStatus: 'not-started' | 'in-progress' | 'completed') => void;
}

type Language = 'typescript' | 'python' | 'java' | 'go' | 'cpp';

export const ProblemDetail: React.FC<ProblemDetailProps> = ({
  problem,
  onBack,
  status,
  onChangeStatus
}) => {
  const [selectedLang, setSelectedLang] = useState<Language>('typescript');
  const [copied, setCopied] = useState(false);

  if (!problem.details) {
    return (
      <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
        <h2 style={{ color: 'red' }}>Error</h2>
        <p>Problem details could not be loaded.</p>
        <button onClick={onBack} className="nav-link">➔ Back to dashboard</button>
      </div>
    );
  }

  const { problemStatement, useCases, highLevelDesign, tradeoffs, lowLevelDesign, code } = problem.details;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code[selectedLang]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusIcon = (s: typeof status) => {
    switch (s) {
      case 'completed': return <CheckCircle size={18} style={{ color: 'var(--color-teal)' }} />;
      case 'in-progress': return <Play size={18} style={{ color: 'var(--color-gold)', transform: 'rotate(90deg)' }} />;
      default: return <Circle size={18} style={{ color: 'var(--text-muted)' }} />;
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      {/* Header Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <button 
          onClick={onBack} 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            fontSize: '15px',
            fontWeight: 500,
            cursor: 'pointer',
            padding: '8px 0',
            transition: 'var(--transition-smooth)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          <ArrowLeft size={18} />
          <span>Back to Dashboard</span>
        </button>

        {/* Status Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Status:</span>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '4px 12px', gap: '8px' }}>
            {getStatusIcon(status)}
            <select
              value={status}
              onChange={(e) => onChangeStatus(problem.id, e.target.value as any)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                outline: 'none',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <option value="not-started" style={{ background: '#0b0f19' }}>Not Started</option>
              <option value="in-progress" style={{ background: '#0b0f19' }}>In Progress</option>
              <option value="completed" style={{ background: '#0b0f19' }}>Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Info */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
          <span className={`tag tag-${problem.difficulty.toLowerCase()}`}>{problem.difficulty}</span>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{problem.category}</span>
          {problem.isDetailed ? (
            <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '6px', background: 'rgba(16,185,129,0.1)', color: 'var(--color-teal)', border: '1px solid rgba(16,185,129,0.2)' }}>✦ Deep Dive</span>
          ) : (
            <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '6px', background: 'rgba(234,179,8,0.1)', color: 'var(--color-gold)', border: '1px solid rgba(234,179,8,0.2)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Info size={12} /> Summary Only
            </span>
          )}
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '16px' }}>{problem.title}</h1>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
          {problem.companyTags.map(tag => (
            <span key={tag} className="company-tag" style={{ fontSize: '12px', padding: '4px 10px' }}>{tag}</span>
          ))}
        </div>
      </div>

      {!problem.isDetailed && (
        <div style={{
          background: 'rgba(234, 179, 8, 0.05)',
          border: '1px solid rgba(234, 179, 8, 0.2)',
          padding: '16px 20px',
          borderRadius: '12px',
          color: 'var(--text-secondary)',
          fontSize: '14px',
          marginBottom: '28px',
          lineHeight: '1.6',
          display: 'flex',
          gap: '12px',
          alignItems: 'start'
        }}>
          <Info size={20} style={{ color: 'var(--color-gold)', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong style={{ color: 'var(--text-primary)' }}>Summary Outline:</strong> This design pattern currently features a quick summary outline. A comprehensive multi-service deep dive, database schemas, and live architectural tradeoffs are being drafted by our content team. You can view the 8 complete deep dives marked with the <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>✦ Deep Dive</span> badge.
          </div>
        </div>
      )}

      {/* Grid Layout (Left: Design details, Right: Diagrams & LLD/Code) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '40px', alignItems: 'start' }}>
        {/* Left Side Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Problem Statement */}
          <section className="glass-panel" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} style={{ color: 'var(--color-primary)' }} />
              <span>Problem Statement & Scope</span>
            </h3>
            <div className="markdown-rendered" style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
              <ReactMarkdown>{problemStatement}</ReactMarkdown>
            </div>
          </section>

          {/* Use Cases */}
          <section className="glass-panel" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={18} style={{ color: 'var(--color-teal)' }} />
              <span>Core Requirements & Use Cases</span>
            </h3>
            <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '15px' }}>
              {useCases.map((uc, i) => (
                <li key={i} style={{ marginBottom: '8px' }}>{uc}</li>
              ))}
            </ul>
          </section>

          {/* High-Level Architecture Explanation */}
          <section className="glass-panel" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Server size={18} style={{ color: 'var(--color-secondary)' }} />
              <span>High-Level Architecture</span>
            </h3>
            <div className="markdown-rendered" style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.7' }}>
              <ReactMarkdown>{highLevelDesign}</ReactMarkdown>
            </div>
          </section>

          {/* Why vs Why NOT tradeoffs */}
          <section className="glass-panel" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shuffle size={18} style={{ color: 'var(--color-gold)' }} />
              <span>Why We Used This vs. Why We Can't Use Alternatives</span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {tradeoffs.map((t, idx) => {
                const unselected = t.selected === t.optionA ? t.optionB : t.optionA;
                return (
                  <div key={idx} style={{ padding: '20px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', borderRadius: '14px' }}>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px' }}>
                      {t.component}
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      {/* Why we used this */}
                      <div style={{ borderLeft: '3px solid var(--color-teal)', background: 'rgba(16, 185, 129, 0.02)', padding: '12px', borderRadius: '8px' }}>
                        <div style={{ color: 'var(--color-teal)', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                          Why we used this: {t.selected}
                        </div>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                          {t.reason}
                        </p>
                      </div>

                      {/* Why not alternatives */}
                      <div style={{ borderLeft: '3px solid #ef4444', background: 'rgba(239, 68, 68, 0.02)', padding: '12px', borderRadius: '8px' }}>
                        <div style={{ color: '#ef4444', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                          Why we CANNOT use: {unselected}
                        </div>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                          {unselected.includes("SQL") ? "Relational databases cannot handle distributed write scalability easily without complex manual partitioning." : 
                           unselected.includes("Hashing") ? "MD5/hashing forces database read queries on every write to resolve key collisions, adding millisecond network overhead." :
                           unselected.includes("301") ? "HTTP 301 caches the redirect inside the client's browser, preventing the server from collecting analytics on subsequent clicks." :
                           unselected.includes("Long Polling") ? "HTTP Long Polling keeps connections holding resources, creating header overheads on every loop cycle request." :
                           unselected.includes("RDBMS") ? "Relational tables do not support dynamic columns, clustering sort ordering, or scale write workloads without locking records." :
                           unselected.includes("S2") ? "S2 geometry scales using square shapes where diagonal distance is longer, causing distortions in local radial dispatcher zones." :
                           unselected.includes("PostGIS") ? "Direct disk writes from active driver coordinates every 4 seconds creates transaction locks that will crash the DB." :
                           unselected.includes("MP4") ? "Direct MP4 files stream fully, which wastes expensive network bandwidth if the user exits the video early." :
                           unselected.includes("DB Table") ? "B-Tree database indexes take O(log N) inserts, deteriorating under high throughput queuing concurrency." :
                           unselected.includes("Push Model") ? "Push queues overwhelm slow consumer workers, causing memory leaks and network dropouts." :
                           unselected.includes("Optimistic") ? "High contention on popular ticket booking seats will fail 99% of optimistic version commits, leading to retries storm." :
                           unselected.includes("NoSQL") ? "NoSQL lacks ACID transactions across multiple partitions, risking double booking seats." :
                           unselected.includes("DFS") ? "DFS traversal gets stuck in infinite directory structures and loops (spider traps) on external sites." :
                           "Alternatives fail to provide the same write scaling, lock safety, or low latency metrics needed at distributed load levels."}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Right Side Diagrams, LLD & Code */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', position: 'sticky', top: '20px' }}>
          {/* High-Level Diagram Widget */}
          <section className="glass-panel" style={{ padding: '28px' }}>
            <InteractiveSVG problemId={problem.id} />
          </section>

          {/* Low-Level Design (APIs & Database ERD) */}
          <section className="glass-panel" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Database size={18} style={{ color: 'var(--color-teal)' }} />
              <span>Low-Level Schema & APIs</span>
            </h3>

            {/* DB Tables */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '10px' }}>Database Entities</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {lowLevelDesign.entities.map((ent, idx) => (
                  <div key={idx} style={{ background: 'rgba(5, 8, 16, 0.5)', border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '12px' }}>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--color-teal)', marginBottom: '6px' }}>{ent.name}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)' }}>
                      {ent.fields.map((f, fIdx) => <div key={fIdx}>{f}</div>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* API Endpoints */}
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '10px' }}>API Interface</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {lowLevelDesign.apis.map((api, idx) => (
                  <div key={idx} style={{ background: 'rgba(5, 8, 16, 0.5)', border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '12px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{
                        padding: '2px 6px',
                        background: api.method === 'POST' ? 'rgba(16,185,129,0.1)' : 'rgba(14,165,233,0.1)',
                        color: api.method === 'POST' ? 'var(--color-teal)' : 'var(--color-secondary)',
                        fontSize: '10px',
                        fontWeight: 700,
                        borderRadius: '4px'
                      }}>{api.method}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{api.path}</span>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 8px 0' }}>{api.description}</p>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                      <div>Request: {api.request}</div>
                      <div>Response: {api.response}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Implementation Code */}
          <section className="glass-panel" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Code size={18} style={{ color: 'var(--color-primary)' }} />
                <span>Reference Implementation</span>
              </h3>
              
              {/* Copy Code */}
              <button
                onClick={handleCopyCode}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border-glass)',
                  color: 'var(--text-secondary)',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'var(--transition-smooth)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border-glass-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-glass)'}
              >
                {copied ? <Check size={14} style={{ color: 'var(--color-teal)' }} /> : <Copy size={14} />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>

            {/* Language Tabs */}
            <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.02)', padding: '4px', borderRadius: '8px', marginBottom: '16px', overflowX: 'auto' }}>
              {(['typescript', 'python', 'java', 'go', 'cpp'] as Language[]).map(lang => (
                <button
                  key={lang}
                  onClick={() => setSelectedLang(lang)}
                  style={{
                    flexGrow: 1,
                    background: selectedLang === lang ? 'rgba(99,102,241,0.1)' : 'transparent',
                    border: '1px solid',
                    borderColor: selectedLang === lang ? 'var(--color-primary)' : 'transparent',
                    color: selectedLang === lang ? 'var(--text-primary)' : 'var(--text-secondary)',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    transition: 'var(--transition-smooth)'
                  }}
                >
                  {lang === 'cpp' ? 'C++' : lang}
                </button>
              ))}
            </div>

            {/* Code CodeBlock */}
            <pre style={{ margin: 0, maxHeight: '420px' }}>
              <code>{code[selectedLang]}</code>
            </pre>
          </section>
        </div>
      </div>
    </div>
  );
};
