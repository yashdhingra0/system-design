import React, { useState, useEffect, useCallback } from 'react';
import { ExternalLink, RefreshCw, Clock, AlertCircle, Rss, Search } from 'lucide-react';

interface NewsArticle {
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  source: { name: string };
  author: string | null;
}

interface NewsApiResponse {
  status: string;
  articles: NewsArticle[];
  error?: string;
}

const CATEGORIES = [
  { id: 'all',      label: 'All AI News', emoji: '🌐' },
  { id: 'llm',      label: 'LLMs',        emoji: '🧠' },
  { id: 'agents',   label: 'Agents',      emoji: '🤖' },
  { id: 'openai',   label: 'OpenAI',      emoji: '🟢' },
  { id: 'tools',    label: 'AI Tools',    emoji: '🛠️' },
  { id: 'research', label: 'Research',    emoji: '🔬' },
];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const SkeletonCard = () => (
  <div style={{
    background: 'rgba(13,13,32,0.8)', border: '1px solid rgba(99,102,241,0.1)',
    borderRadius: 14, padding: '18px', overflow: 'hidden',
  }}>
    {['80%', '60%', '90%', '40%'].map((w, i) => (
      <div key={i} style={{
        height: i === 0 ? 14 : 12, width: w, borderRadius: 6, marginBottom: 10,
        background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
      }} />
    ))}
  </div>
);

export const AINewsFeed: React.FC = () => {
  const [category, setCategory] = useState('all');
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const fetchNews = useCallback(async (cat: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/news?category=${cat}&pageSize=24`);
      const data: NewsApiResponse = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to fetch news');
      }
      // Filter out removed/[Removed] articles
      const valid = (data.articles || []).filter(a =>
        a.title && a.title !== '[Removed]' && a.url && a.url !== 'https://removed.com'
      );
      setArticles(valid);
      setLastFetched(new Date());
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNews(category); }, [category, fetchNews]);

  const filtered = articles.filter(a => {
    if (!search) return true;
    const q = search.toLowerCase();
    return a.title.toLowerCase().includes(q) || (a.description || '').toLowerCase().includes(q);
  });

  const noApiKey = error?.includes('NEWS_API_KEY');

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 28, flexWrap: 'wrap', gap: 14,
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <span style={{ fontSize: 28 }}>📰</span>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--text-primary)' }}>AI News</h1>
            <span style={{
              fontSize: 10, padding: '3px 8px', borderRadius: 6, fontWeight: 800,
              background: 'rgba(34,211,238,0.12)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.2)',
            }}>LIVE</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            Latest AI news powered by NewsAPI · {lastFetched ? `Updated ${timeAgo(lastFetched.toISOString())}` : 'Loading…'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Filter articles…"
              style={{
                padding: '8px 10px 8px 28px', borderRadius: 9, fontSize: 13, width: 200,
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(99,102,241,0.14)',
                color: 'var(--text-primary)', outline: 'none',
              }}
            />
          </div>
          <button onClick={() => fetchNews(category)} disabled={loading} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', borderRadius: 9, cursor: 'pointer',
            background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
            color: '#818cf8', fontSize: 13, fontWeight: 600,
          }}>
            <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            Refresh
          </button>
        </div>
      </div>

      {/* Category tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
        {CATEGORIES.map(cat => (
          <button key={cat.id} onClick={() => setCategory(cat.id)} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 14px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600,
            background: category === cat.id ? 'rgba(99,102,241,0.14)' : 'transparent',
            border: `1px solid ${category === cat.id ? 'rgba(99,102,241,0.32)' : 'rgba(99,102,241,0.1)'}`,
            color: category === cat.id ? '#818cf8' : 'var(--text-secondary)',
            transition: 'all 0.2s',
          }}>
            <span>{cat.emoji}</span> {cat.label}
          </button>
        ))}
      </div>

      {/* No API key banner */}
      {noApiKey && (
        <div style={{
          background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.25)',
          borderRadius: 14, padding: '20px 24px', marginBottom: 28,
        }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <AlertCircle size={20} color="#fbbf24" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#fbbf24', marginBottom: 6 }}>NewsAPI key not configured</div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
                To enable live AI news, add your NewsAPI key to Vercel:
              </p>
              <ol style={{ margin: '8px 0 0 16px', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                <li>Get a free key at <a href="https://newsapi.org/register" target="_blank" rel="noreferrer" style={{ color: '#818cf8' }}>newsapi.org/register</a></li>
                <li>Go to your Vercel project → Settings → Environment Variables</li>
                <li>Add: <code style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 6px', borderRadius: 4, fontFamily: 'var(--font-mono)', fontSize: 12 }}>NEWS_API_KEY</code> = your key</li>
                <li>Redeploy your project</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Generic error */}
      {error && !noApiKey && (
        <div style={{
          display: 'flex', gap: 12, alignItems: 'center',
          background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)',
          borderRadius: 12, padding: '14px 18px', marginBottom: 24,
        }}>
          <AlertCircle size={16} color="#f87171" />
          <span style={{ fontSize: 13, color: '#f87171' }}>{error}</span>
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <>
          <style>{`
            @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
            @keyframes spin { 100%{transform:rotate(360deg)} }
          `}</style>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        </>
      )}

      {/* Articles grid */}
      {!loading && filtered.length > 0 && (
        <>
          <style>{`@keyframes spin { 100%{transform:rotate(360deg)} }`}</style>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {filtered.map((article, i) => (
              <a
                key={i}
                href={article.url}
                target="_blank"
                rel="noreferrer noopener"
                style={{ textDecoration: 'none' }}
              >
                <div style={{
                  background: 'rgba(13,13,32,0.85)', border: '1px solid rgba(99,102,241,0.1)',
                  borderRadius: 14, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column',
                  transition: 'all 0.2s',
                }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.borderColor = 'rgba(99,102,241,0.28)';
                    el.style.transform = 'translateY(-2px)';
                    el.style.boxShadow = '0 8px 24px rgba(99,102,241,0.12)';
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.borderColor = 'rgba(99,102,241,0.1)';
                    el.style.transform = 'translateY(0)';
                    el.style.boxShadow = 'none';
                  }}
                >
                  {/* Image */}
                  {article.urlToImage && (
                    <div style={{ height: 160, overflow: 'hidden', flexShrink: 0 }}>
                      <img
                        src={article.urlToImage}
                        alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={e => { (e.currentTarget as HTMLImageElement).parentElement!.style.display = 'none'; }}
                      />
                    </div>
                  )}
                  <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {/* Source + time */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 5,
                        background: 'rgba(99,102,241,0.12)', color: '#818cf8', letterSpacing: '0.04em',
                      }}>
                        {article.source.name}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)' }}>
                        <Clock size={11} /> {timeAgo(article.publishedAt)}
                      </span>
                    </div>
                    {/* Title */}
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.45, margin: 0 }}>
                      {article.title}
                    </h3>
                    {/* Description */}
                    {article.description && (
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0, flex: 1 }}>
                        {article.description.slice(0, 120)}{article.description.length > 120 ? '…' : ''}
                      </p>
                    )}
                    {/* Read more */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#818cf8', fontWeight: 600, marginTop: 4 }}>
                      Read article <ExternalLink size={11} />
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 24 }}>
            Showing {filtered.length} articles · Powered by <a href="https://newsapi.org" target="_blank" rel="noreferrer" style={{ color: '#818cf8' }}>NewsAPI</a>
          </p>
        </>
      )}

      {/* Empty state */}
      {!loading && !error && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <Rss size={40} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          <p>No articles found. Try a different category or search term.</p>
        </div>
      )}
    </div>
  );
};
