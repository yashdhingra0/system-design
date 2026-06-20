// Vercel Edge-compatible serverless function (no @vercel/node needed)
// Uses web-standard Request/Response API

const QUERIES: Record<string, string> = {
  all:      'artificial intelligence OR "large language model" OR "AI agent" OR LLM OR "generative AI"',
  llm:      '"large language model" OR GPT OR Claude OR Gemini OR Llama OR "foundation model"',
  agents:   '"AI agent" OR "agentic AI" OR LangChain OR LangGraph OR AutoGPT OR "multi-agent"',
  openai:   'OpenAI OR "GPT-4" OR "ChatGPT" OR "DALL-E" OR Sora',
  tools:    'Cursor AI OR "GitHub Copilot" OR Perplexity OR "AI tools" OR "AI coding"',
  research: 'AI research OR "machine learning" OR "deep learning" OR "neural network" OR "AI safety"',
};

export const config = { runtime: 'edge' };

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const NEWS_API_KEY = process.env.NEWS_API_KEY;
  if (!NEWS_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'NEWS_API_KEY not configured. Add it in Vercel → Settings → Environment Variables.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || 'all';
  const pageSize = Math.min(Number(searchParams.get('pageSize') || '20'), 30);
  const query = QUERIES[category] || QUERIES.all;

  const url = new URL('https://newsapi.org/v2/everything');
  url.searchParams.set('q', query);
  url.searchParams.set('language', 'en');
  url.searchParams.set('sortBy', 'publishedAt');
  url.searchParams.set('pageSize', String(pageSize));
  url.searchParams.set('apiKey', NEWS_API_KEY);

  try {
    const res = await fetch(url.toString());
    const data = await res.json();

    if (!res.ok) {
      return new Response(JSON.stringify({ error: data.message || 'NewsAPI error' }), {
        status: res.status, headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 's-maxage=900, stale-while-revalidate=1800',
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Failed to fetch news' }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
}
