// ── AI Learning Curriculum Data ──────────────────────────────────────────────

export interface AICodeBlock {
  title: string;
  language: string;
  code: string;
}

export interface AISection {
  type: 'text' | 'code' | 'tip' | 'warning' | 'grid' | 'steps';
  title?: string;
  content?: string;
  code?: AICodeBlock;
  items?: Array<{ title: string; desc: string; emoji?: string; badge?: string }>;
}

export interface AITopic {
  id: string;
  title: string;
  emoji: string;
  phase: 1 | 2 | 3 | 4 | 5;
  phaseName: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  readTime: number;
  summary: string;
  tags: string[];
  sections: AISection[];
  relatedTopics: string[];
}

export const AI_PHASES = [
  { id: 1, name: 'Foundations', emoji: '🧱', color: '#34d399', desc: 'Core AI/ML concepts every developer must know' },
  { id: 2, name: 'LLM Ecosystem', emoji: '🧠', color: '#818cf8', desc: 'Understanding and using Large Language Models' },
  { id: 3, name: 'Building with AI', emoji: '🔧', color: '#22d3ee', desc: 'LangChain, RAG, Vector DBs, and real apps' },
  { id: 4, name: 'Agentic AI', emoji: '🤖', color: '#f59e0b', desc: 'LangGraph, autonomous agents, multi-agent systems' },
  { id: 5, name: 'Production', emoji: '🚀', color: '#f87171', desc: 'Deploy, monitor, scale, and optimize AI systems' },
];

export const aiTopics: AITopic[] = [
  // ── PHASE 1: FOUNDATIONS ─────────────────────────────────────────────────
  {
    id: 'ai-fundamentals',
    title: 'AI, ML & Deep Learning — The Big Picture',
    emoji: '🧩',
    phase: 1,
    phaseName: 'Foundations',
    category: 'Foundations',
    difficulty: 'Beginner',
    readTime: 10,
    summary: 'Understand the difference between AI, ML, and Deep Learning, and why the current wave is different from all previous ones.',
    tags: ['AI', 'ML', 'Deep Learning', 'Basics'],
    sections: [
      {
        type: 'text',
        title: 'What is the difference?',
        content: `People use "AI", "ML", and "Deep Learning" interchangeably, but they describe different levels of the same hierarchy.

**Artificial Intelligence (AI)** is the broadest term — any technique that enables machines to mimic human intelligence. A rule-based chess engine from 1997 is AI.

**Machine Learning (ML)** is a subset of AI where systems *learn from data* rather than following hand-coded rules. You feed it thousands of labeled examples and it finds the patterns.

**Deep Learning (DL)** is a subset of ML that uses multi-layered neural networks. It powers everything transformative in AI today — image recognition, speech, and LLMs.

The key insight: we didn't write rules for what a cat looks like. We showed the model 1 million cat photos, and it learned on its own.`,
      },
      {
        type: 'grid',
        title: 'The three levels at a glance',
        items: [
          { emoji: '🤖', title: 'Artificial Intelligence', desc: 'Any machine mimicking human intelligence. Includes rule-based systems, search algorithms, expert systems.' },
          { emoji: '📊', title: 'Machine Learning', desc: 'Systems that improve from experience. Linear regression, random forests, SVMs. Requires feature engineering.' },
          { emoji: '🧠', title: 'Deep Learning', desc: 'Neural networks with many layers. Learns features automatically. Powers LLMs, image models, speech recognition.' },
        ],
      },
      {
        type: 'text',
        title: 'Why now?',
        content: `Three things converged around 2017–2020 to make this AI wave different from all previous "AI winters":

1. **Data** — The internet produced exponentially more text, images, and code to train on
2. **Compute** — GPUs (originally for gaming) turned out to be perfect for matrix math — the core of deep learning
3. **Transformers** — The 2017 "Attention Is All You Need" paper introduced an architecture that scales beautifully with more data and compute

These three together created a virtuous cycle: more data + more compute + better architecture = dramatically better models every year.`,
      },
      {
        type: 'tip',
        content: 'You do not need a math PhD to build with AI. Most developers work at the API layer — calling pre-trained models like GPT-4 or Claude via an API. Understanding the concepts here makes you a better builder, not a researcher.',
      },
    ],
    relatedTopics: ['neural-networks', 'transformers', 'llm-landscape'],
  },

  {
    id: 'neural-networks',
    title: 'Neural Networks — How Machines Actually Learn',
    emoji: '🕸️',
    phase: 1,
    phaseName: 'Foundations',
    category: 'Foundations',
    difficulty: 'Beginner',
    readTime: 12,
    summary: 'Demystify neurons, weights, backpropagation and gradient descent with intuitive analogies and real code.',
    tags: ['Neural Networks', 'Backpropagation', 'PyTorch'],
    sections: [
      {
        type: 'text',
        title: 'The neuron — a weighted vote',
        content: `A single artificial neuron does something simple: it takes several inputs, multiplies each by a *weight*, sums them up, and passes the result through an *activation function*.

Think of it like a committee vote. Each voter (input) has influence (weight). The committee adds up all the weighted opinions and decides yes/no based on a threshold (activation).

A neural network stacks thousands of these neurons into *layers*. Data flows forward through these layers (forward pass), and the network produces a prediction.`,
      },
      {
        type: 'text',
        title: 'How learning actually happens — Backpropagation',
        content: `After the forward pass produces a prediction, we compare it to the correct answer using a **loss function** (e.g., cross-entropy for classification). The loss tells us "how wrong" we are.

**Backpropagation** works backwards from the loss, calculating how much each weight contributed to the error using the chain rule of calculus.

**Gradient descent** then nudges every weight slightly in the direction that reduces the loss. Repeat this millions of times over your training data, and the network gradually learns.

- Learning rate too high → weights bounce around, never converge
- Learning rate too low → training takes forever
- Modern optimizers like **Adam** adapt the learning rate automatically`,
      },
      {
        type: 'code',
        code: {
          title: 'A neural network from scratch in PyTorch',
          language: 'python',
          code: `import torch
import torch.nn as nn
import torch.optim as optim

# Define a simple 3-layer network
class SimpleNet(nn.Module):
    def __init__(self):
        super().__init__()
        self.layers = nn.Sequential(
            nn.Linear(784, 256),   # Input: 28x28 image pixels
            nn.ReLU(),             # Activation: keep positive values
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Linear(128, 10),    # Output: 10 digit classes (0-9)
        )

    def forward(self, x):
        return self.layers(x)

model = SimpleNet()
optimizer = optim.Adam(model.parameters(), lr=1e-3)
loss_fn = nn.CrossEntropyLoss()

# One training step
def train_step(inputs, labels):
    optimizer.zero_grad()        # Clear previous gradients
    predictions = model(inputs)  # Forward pass
    loss = loss_fn(predictions, labels)  # Compute loss
    loss.backward()              # Backpropagation
    optimizer.step()             # Update weights
    return loss.item()`,
        },
      },
      {
        type: 'tip',
        content: 'You rarely write neural networks from scratch in production AI work. Libraries like PyTorch and HuggingFace handle this. But understanding the mechanics helps you debug, tune, and choose the right architecture.',
      },
    ],
    relatedTopics: ['transformers', 'ai-fundamentals', 'open-source-models'],
  },

  {
    id: 'transformers',
    title: 'Transformers — The Architecture Behind Every LLM',
    emoji: '⚡',
    phase: 1,
    phaseName: 'Foundations',
    category: 'Foundations',
    difficulty: 'Intermediate',
    readTime: 15,
    summary: 'The 2017 paper "Attention Is All You Need" changed everything. Understand self-attention, positional encoding, and why transformers scale so well.',
    tags: ['Transformers', 'Attention', 'Architecture', 'Tokens'],
    sections: [
      {
        type: 'text',
        title: 'The problem before transformers',
        content: `Before transformers, sequences (text, audio) were processed by RNNs and LSTMs. These processed tokens one at a time, left to right. Two big problems:

1. **Long-range dependencies were lost** — By the time the model processed word 200, it had almost "forgotten" word 1
2. **No parallelism** — You had to process token 1 before token 2, which made training slow

Transformers solved both by introducing **self-attention**: every token can look at every other token simultaneously, regardless of distance.`,
      },
      {
        type: 'text',
        title: 'Self-Attention — tokens talking to each other',
        content: `Self-attention lets each token "attend" to all other tokens and decide how much to focus on each one.

For the sentence "The animal didn't cross the street because **it** was tired" — the word "it" attends heavily to "animal", learning the correct reference.

Every token is projected into three vectors:
- **Query (Q)**: "What am I looking for?"
- **Key (K)**: "What do I contain?"
- **Value (V)**: "What information do I pass along?"

Attention(Q, K, V) = softmax(QK^T / √d_k) × V

The dot product of Q and K measures relevance between tokens. Softmax turns that into weights (summing to 1). We then take a weighted sum of all Values.`,
      },
      {
        type: 'text',
        title: 'Tokens and Embeddings',
        content: `LLMs don't read words — they read **tokens**. A token is roughly 3–4 characters (sub-word units). "unbelievable" might be tokenized as ["un", "believ", "able"].

Each token is mapped to a high-dimensional vector (an **embedding**) — typically 768 to 12,288 dimensions depending on model size. These vectors capture semantic meaning: "king" - "man" + "woman" ≈ "queen" in embedding space.

GPT-4 has roughly 100,000 token vocabulary. Claude uses a similar tokenizer. The **context window** is the maximum number of tokens the model can see at once — GPT-4 supports 128k, Claude 3.5 Sonnet supports 200k.`,
      },
      {
        type: 'grid',
        title: 'Transformer key concepts',
        items: [
          { emoji: '👁️', title: 'Self-Attention', desc: 'Every token attends to every other token. Captures long-range dependencies. O(n²) complexity.' },
          { emoji: '🔢', title: 'Positional Encoding', desc: 'Adds position info to embeddings since attention is order-agnostic. RoPE used in modern LLMs.' },
          { emoji: '🏠', title: 'Multi-Head Attention', desc: 'Run attention 8–96 times in parallel with different learned projections. Each head specializes.' },
          { emoji: '⚡', title: 'Feed-Forward Network', desc: 'After attention, each token goes through 2 linear layers with GELU activation. Stores "knowledge".' },
        ],
      },
      {
        type: 'tip',
        content: 'The transformer architecture scales almost perfectly — doubling parameters generally improves performance. This "scaling law" is why OpenAI and Google keep training bigger models. GPT-1 had 117M parameters. GPT-4 is estimated at ~1.8 trillion.',
      },
    ],
    relatedTopics: ['llm-landscape', 'neural-networks', 'prompt-engineering'],
  },

  // ── PHASE 2: LLM ECOSYSTEM ────────────────────────────────────────────────
  {
    id: 'llm-landscape',
    title: 'LLM Landscape — Every Major Model Explained',
    emoji: '🌍',
    phase: 2,
    phaseName: 'LLM Ecosystem',
    category: 'LLM Ecosystem',
    difficulty: 'Beginner',
    readTime: 14,
    summary: 'Compare GPT-4, Claude, Gemini, Llama, Mistral and 10+ others. Understand open vs. closed source, benchmarks, and how to choose the right model.',
    tags: ['GPT-4', 'Claude', 'Gemini', 'Llama', 'Mistral', 'Open Source'],
    sections: [
      {
        type: 'text',
        title: 'Closed-source vs Open-source models',
        content: `**Closed-source models** (OpenAI, Anthropic, Google) are only accessible via API. You pay per token. The weights are secret. They're usually the most capable.

**Open-source models** (Meta's Llama, Mistral, Alibaba's Qwen) release their weights publicly. You can download and run them locally on your GPU, or via providers like Together.ai, Groq, or Ollama.

The gap is closing fast — Llama 3.3 70B rivals GPT-4 in many benchmarks. Open source wins on privacy, cost, and control. Closed wins on convenience and top-tier reasoning.`,
      },
      {
        type: 'grid',
        title: 'The major closed-source models',
        items: [
          { emoji: '🟢', title: 'GPT-4o (OpenAI)', desc: 'Best general-purpose multimodal model. 128k context. Strong coding and reasoning. ~$5/1M input tokens. Use via api.openai.com', badge: 'Best for: General apps' },
          { emoji: '🟣', title: 'Claude 3.5 Sonnet (Anthropic)', desc: '200k context window. Excellent at long documents, coding, nuanced writing. Strong safety alignment. Best instruction-following.', badge: 'Best for: Long docs, coding' },
          { emoji: '🔵', title: 'Gemini 1.5 Pro (Google)', desc: '1M context window — the longest available. Great for analyzing large codebases or books. Strong multimodal (video, audio).', badge: 'Best for: Massive context' },
          { emoji: '⚡', title: 'Grok (xAI)', desc: 'Access to real-time X/Twitter data. Strong math and reasoning. Available via xAI API or X Premium.', badge: 'Best for: Real-time info' },
        ],
      },
      {
        type: 'grid',
        title: 'Top open-source models',
        items: [
          { emoji: '🦙', title: 'Llama 3.3 70B (Meta)', desc: 'Current top open-source model. Rivals GPT-4 on many benchmarks. Available free on Ollama, Together.ai, Groq.' },
          { emoji: '🌬️', title: 'Mistral Large (Mistral AI)', desc: 'French startup making excellent efficient models. Mixtral 8x22B (MoE) is extremely capable per compute dollar.' },
          { emoji: '🔮', title: 'Qwen 2.5 72B (Alibaba)', desc: 'Strong multilingual model. Excellent for Chinese + English. Top coding performance among open models.' },
          { emoji: '💎', title: 'Phi-3 / Phi-4 (Microsoft)', desc: 'Small but mighty. Phi-4 (14B) outperforms many 70B models. Ideal for edge deployment or low-cost inference.' },
        ],
      },
      {
        type: 'tip',
        content: 'For production: use Claude 3.5 Sonnet or GPT-4o for best quality, Llama 3.3 70B via Groq for free/fast inference, Phi-4 for edge or mobile deployment. Always test on your specific use case — benchmarks don\'t tell the full story.',
      },
    ],
    relatedTopics: ['prompt-engineering', 'ai-apis', 'open-source-models'],
  },

  {
    id: 'prompt-engineering',
    title: 'Prompt Engineering — Get 10× Better Results',
    emoji: '✍️',
    phase: 2,
    phaseName: 'LLM Ecosystem',
    category: 'LLM Ecosystem',
    difficulty: 'Beginner',
    readTime: 12,
    summary: 'Master system prompts, few-shot examples, chain-of-thought, structured output, and advanced techniques used by production AI apps.',
    tags: ['Prompting', 'Few-shot', 'Chain-of-thought', 'System prompts', 'JSON output'],
    sections: [
      {
        type: 'text',
        title: 'Why prompt engineering matters',
        content: `The same model can give you a mediocre or an exceptional response — the difference is entirely in how you prompt it. Good prompt engineering often beats using a bigger model.

The core principles:
- **Be specific** — vague instructions produce vague results
- **Show don't tell** — examples beat descriptions
- **Give context** — who you are, what the output is for, what to avoid
- **Constrain the format** — tell it exactly how to respond`,
      },
      {
        type: 'code',
        code: {
          title: 'System prompt best practices',
          language: 'python',
          code: `from anthropic import Anthropic

client = Anthropic()

# ❌ Bad — vague, no context
response = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Review my code"}]
)

# ✅ Good — specific role, output format, constraints
system_prompt = """You are a senior Python engineer conducting a code review.

For each issue found:
1. Identify the problem clearly
2. Explain WHY it's a problem (security risk, performance, readability)
3. Provide a fixed version of the code

Format: Use markdown. Lead with the most critical issues.
Tone: Direct and constructive. No fluff."""

response = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=2048,
    system=system_prompt,
    messages=[{"role": "user", "content": f"Review this code:\\n\\n{code}"}]
)`,
        },
      },
      {
        type: 'code',
        code: {
          title: 'Chain-of-thought prompting',
          language: 'python',
          code: `# Chain-of-thought: force the model to reason step by step
# before giving the answer — dramatically improves accuracy on complex tasks

prompt = """Analyze whether this startup idea is viable.

Think through each step carefully:
1. Market size — is there a large enough audience?
2. Problem severity — how painful is this problem?
3. Competition — what exists already, and why would users switch?
4. Moat — what prevents copycats in 12 months?
5. Team fit — what expertise does this require?

Then give your final verdict with a confidence score 1-10.

Startup idea: {idea}"""

# Few-shot prompting: show examples before asking
few_shot_prompt = """Extract the date and amount from these invoices:

Invoice: "Please pay $1,250.00 by March 15, 2024"
Output: {{"amount": 1250.00, "due_date": "2024-03-15"}}

Invoice: "Total due: USD 890 — Payment required by 2024-01-31"
Output: {{"amount": 890.00, "due_date": "2024-01-31"}}

Invoice: "{user_invoice}"
Output:"""`,
        },
      },
      {
        type: 'grid',
        title: 'Core prompting techniques',
        items: [
          { emoji: '0️⃣', title: 'Zero-shot', desc: 'Just ask. No examples. Works for simple, well-defined tasks. "Translate this to French."' },
          { emoji: '🎯', title: 'Few-shot', desc: 'Provide 2-5 input/output examples. Dramatically improves extraction, classification, formatting tasks.' },
          { emoji: '💭', title: 'Chain-of-thought', desc: 'Add "Think step by step" or lay out explicit reasoning steps. Best for math, logic, multi-step analysis.' },
          { emoji: '📋', title: 'Structured output', desc: 'Request JSON or XML. Use function calling / tool use to enforce schema. Parse reliably downstream.' },
        ],
      },
    ],
    relatedTopics: ['ai-apis', 'langchain', 'llm-landscape'],
  },

  {
    id: 'ai-apis',
    title: 'AI APIs — OpenAI, Anthropic, Gemini, Groq',
    emoji: '🔌',
    phase: 2,
    phaseName: 'LLM Ecosystem',
    category: 'LLM Ecosystem',
    difficulty: 'Beginner',
    readTime: 13,
    summary: 'A practical guide to every major AI API with code examples. Includes free options like Groq and Google AI Studio.',
    tags: ['OpenAI API', 'Anthropic API', 'Gemini API', 'Groq', 'Free APIs'],
    sections: [
      {
        type: 'grid',
        title: 'API comparison at a glance',
        items: [
          { emoji: '🟢', title: 'OpenAI', desc: 'Most ecosystem support. GPT-4o, embeddings, DALL-E, Whisper. Starts at $0.15/1M tokens (GPT-4o mini). api.openai.com', badge: 'Most popular' },
          { emoji: '🟣', title: 'Anthropic Claude', desc: 'Best for long context, coding, following complex instructions. 200k context. Free tier via Claude.ai. console.anthropic.com', badge: 'Best instruction-following' },
          { emoji: '🔵', title: 'Google Gemini', desc: 'Free tier via Google AI Studio (60 requests/min). Gemini 1.5 Flash is very fast and cheap. aistudio.google.com', badge: 'Best free tier' },
          { emoji: '⚡', title: 'Groq', desc: 'FREE inference on Llama 3, Mixtral, Gemma. Insanely fast (300+ tokens/sec). 14,400 requests/day free. console.groq.com', badge: 'Fastest + free' },
        ],
      },
      {
        type: 'code',
        code: {
          title: 'OpenAI API — getting started',
          language: 'python',
          code: `# pip install openai
from openai import OpenAI

client = OpenAI(api_key="sk-...")  # or set OPENAI_API_KEY env var

# Basic chat completion
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Explain REST APIs in 3 sentences."}
    ],
    temperature=0.7,    # 0 = deterministic, 1 = creative
    max_tokens=500,
)
print(response.choices[0].message.content)

# Streaming response (for chat UIs)
stream = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Write a haiku about Python"}],
    stream=True,
)
for chunk in stream:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="", flush=True)`,
        },
      },
      {
        type: 'code',
        code: {
          title: 'Groq API — free and blazing fast',
          language: 'python',
          code: `# pip install groq
# Free API key at: console.groq.com
from groq import Groq

client = Groq(api_key="gsk_...")

response = client.chat.completions.create(
    model="llama-3.3-70b-versatile",   # Free Llama 3.3 70B!
    messages=[
        {"role": "system", "content": "You are an expert software engineer."},
        {"role": "user", "content": "Review this code and suggest improvements:\\n\\n{code}"}
    ],
    temperature=0.6,
    max_tokens=2048,
)
print(response.choices[0].message.content)

# Available free models on Groq:
# - llama-3.3-70b-versatile   (best quality, ~300 tok/sec)
# - llama-3.1-8b-instant      (ultra fast, ~800 tok/sec)
# - mixtral-8x7b-32768        (32k context)
# - gemma2-9b-it              (Google's Gemma)`,
        },
      },
      {
        type: 'tip',
        content: 'Start with Groq for prototyping — it\'s completely free, extremely fast, and uses Llama 3.3 70B which rivals GPT-4. Switch to Claude or GPT-4o for production if you need the absolute best quality. Use Google AI Studio (Gemini Flash) for high-volume free tasks.',
      },
    ],
    relatedTopics: ['open-source-models', 'prompt-engineering', 'langchain'],
  },

  {
    id: 'open-source-models',
    title: 'Open Source Models — Run AI Locally with Ollama',
    emoji: '📦',
    phase: 2,
    phaseName: 'LLM Ecosystem',
    category: 'LLM Ecosystem',
    difficulty: 'Intermediate',
    readTime: 11,
    summary: 'Download and run Llama 3, Mistral, Phi, Qwen and more locally using Ollama and LM Studio. Zero cost, full privacy, no rate limits.',
    tags: ['Ollama', 'Hugging Face', 'LM Studio', 'Llama', 'Local AI'],
    sections: [
      {
        type: 'text',
        title: 'Why run models locally?',
        content: `Running models locally gives you:
- **Zero cost** — no API bills after hardware
- **Full privacy** — data never leaves your machine
- **No rate limits** — run as many requests as you want
- **Offline capability** — works without internet
- **Control** — run any version, fine-tune, modify

The main tradeoff: you need a decent GPU. A 16GB RAM MacBook can run 7B-13B models well. An RTX 3090 (24GB VRAM) can run 70B models quantized.`,
      },
      {
        type: 'code',
        code: {
          title: 'Ollama — the easiest way to run local models',
          language: 'bash',
          code: `# 1. Install Ollama (Mac/Linux/Windows)
# Download from: https://ollama.ai

# 2. Pull and run a model
ollama run llama3.3          # Meta's Llama 3.3 70B (40GB) — best quality
ollama run llama3.2          # Llama 3.2 3B (2GB) — ultra lightweight
ollama run mistral           # Mistral 7B (4GB) — great all-rounder
ollama run phi4              # Microsoft Phi-4 14B (8GB) — punches above weight
ollama run qwen2.5:72b       # Alibaba Qwen 72B — excellent coding
ollama run codellama         # Meta's code-specialized model
ollama run nomic-embed-text  # For embeddings / RAG

# 3. Use the OpenAI-compatible API (Ollama runs a local server)
curl http://localhost:11434/api/chat -d '{
  "model": "llama3.2",
  "messages": [{"role": "user", "content": "Why is the sky blue?"}]
}'`,
        },
      },
      {
        type: 'code',
        code: {
          title: 'Use Ollama from Python (OpenAI-compatible)',
          language: 'python',
          code: `# pip install openai  (yes, OpenAI library works with Ollama!)
from openai import OpenAI

# Point to local Ollama server
client = OpenAI(
    base_url="http://localhost:11434/v1",
    api_key="ollama",  # Required but ignored by Ollama
)

response = client.chat.completions.create(
    model="llama3.2",
    messages=[
        {"role": "system", "content": "You are a helpful coding assistant."},
        {"role": "user", "content": "Write a Python function to validate email addresses."}
    ],
)
print(response.choices[0].message.content)

# Or use the official Ollama Python library
# pip install ollama
import ollama
response = ollama.chat(
    model='phi4',
    messages=[{'role': 'user', 'content': 'Explain Docker in simple terms'}]
)
print(response['message']['content'])`,
        },
      },
      {
        type: 'grid',
        title: 'Where to find and download models',
        items: [
          { emoji: '🤗', title: 'Hugging Face Hub', desc: '500,000+ models. Filter by task, license, size. Download with transformers library or use the inference API. huggingface.co', badge: 'huggingface.co' },
          { emoji: '🦙', title: 'Ollama Library', desc: 'Curated models optimized for local running. One command to download and run. ollama.ai/library', badge: 'ollama.ai/library' },
          { emoji: '🖥️', title: 'LM Studio', desc: 'GUI app for running local models. Download any GGUF model. Great for non-developers. Built-in chat UI.', badge: 'lmstudio.ai' },
          { emoji: '🔧', title: 'Jan', desc: 'Open-source ChatGPT alternative. Runs locally with multiple backends. Great UI. jan.ai', badge: 'jan.ai' },
        ],
      },
    ],
    relatedTopics: ['ai-apis', 'rag-systems', 'llm-landscape'],
  },

  // ── PHASE 3: BUILDING WITH AI ─────────────────────────────────────────────
  {
    id: 'langchain',
    title: 'LangChain — Build LLM Applications Fast',
    emoji: '🔗',
    phase: 3,
    phaseName: 'Building with AI',
    category: 'Building with AI',
    difficulty: 'Intermediate',
    readTime: 18,
    summary: 'LangChain is the most popular framework for building LLM apps. Master chains, memory, document loaders, tools, and the LCEL expression language.',
    tags: ['LangChain', 'Chains', 'Memory', 'Tools', 'LCEL'],
    sections: [
      {
        type: 'text',
        title: 'What is LangChain and when to use it?',
        content: `LangChain is a Python/JavaScript framework that provides high-level abstractions for building LLM-powered applications. Instead of writing raw API calls and manually chaining logic, LangChain gives you:

- **Chains** — composable sequences of LLM calls and operations
- **Memory** — persist conversation history across turns
- **Tools** — let LLMs call external APIs, search, or run code
- **Document loaders** — ingest PDFs, web pages, databases
- **Output parsers** — reliably extract structured data from LLM responses

**When to use LangChain:** For applications that go beyond a single LLM call — chatbots with memory, RAG systems, document Q&A, multi-step reasoning pipelines.

**When to skip it:** Simple one-shot API calls don't need LangChain. The overhead isn't worth it.`,
      },
      {
        type: 'code',
        code: {
          title: 'LangChain setup and first chain',
          language: 'python',
          code: `# pip install langchain langchain-openai langchain-anthropic

from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

# Initialize a model
llm = ChatOpenAI(model="gpt-4o", temperature=0.7)
# or: llm = ChatAnthropic(model="claude-3-5-sonnet-20241022")

# Create a prompt template
prompt = ChatPromptTemplate.from_messages([
    ("system", "You are an expert {role}. Answer concisely."),
    ("human", "{question}")
])

# Build a chain using LCEL (LangChain Expression Language)
# The | operator pipes output from one step to the next
chain = prompt | llm | StrOutputParser()

# Run it
result = chain.invoke({
    "role": "Python developer",
    "question": "What is a decorator and when should I use one?"
})
print(result)

# Stream it (for chat UIs)
for chunk in chain.stream({"role": "Python developer", "question": "Explain async/await"}):
    print(chunk, end="", flush=True)`,
        },
      },
      {
        type: 'code',
        code: {
          title: 'Conversation memory — multi-turn chat',
          language: 'python',
          code: `from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.chat_history import InMemoryChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory

llm = ChatOpenAI(model="gpt-4o")

prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful assistant. Be concise."),
    MessagesPlaceholder("history"),   # <-- conversation history slot
    ("human", "{input}"),
])

chain = prompt | llm

# Wrap with message history
store = {}
def get_session_history(session_id: str):
    if session_id not in store:
        store[session_id] = InMemoryChatMessageHistory()
    return store[session_id]

with_history = RunnableWithMessageHistory(
    chain,
    get_session_history,
    input_messages_key="input",
    history_messages_key="history",
)

config = {"configurable": {"session_id": "user-123"}}

# Turn 1
r1 = with_history.invoke({"input": "My name is Alex."}, config=config)
# Turn 2 — it remembers!
r2 = with_history.invoke({"input": "What's my name?"}, config=config)
print(r2.content)  # "Your name is Alex."`,
        },
      },
      {
        type: 'tip',
        content: 'LCEL (the | pipe syntax) is the modern way to build LangChain chains. It gives you streaming, async, and observability for free. Avoid the older "LLMChain" and "ConversationalChain" classes — they\'re deprecated.',
      },
    ],
    relatedTopics: ['rag-systems', 'langraph', 'ai-agents'],
  },

  {
    id: 'rag-systems',
    title: 'RAG — Teach Your AI About Your Own Data',
    emoji: '📚',
    phase: 3,
    phaseName: 'Building with AI',
    category: 'Building with AI',
    difficulty: 'Intermediate',
    readTime: 16,
    summary: 'Retrieval-Augmented Generation lets LLMs answer questions about your documents, codebase, or database without expensive fine-tuning.',
    tags: ['RAG', 'Embeddings', 'Vector Database', 'Chroma', 'Pinecone', 'Semantic Search'],
    sections: [
      {
        type: 'text',
        title: 'The problem RAG solves',
        content: `LLMs have a knowledge cutoff and don't know about your private data — your company docs, codebase, customer data, or recent news.

**Fine-tuning** updates the model weights with new data, but it's expensive ($10k–$100k), slow, and the model can forget old knowledge (catastrophic forgetting).

**RAG** is cheaper and more flexible: at query time, retrieve relevant chunks from your data store, inject them into the prompt, and let the LLM answer using that context.

The pipeline: Ingest → Chunk → Embed → Store → Retrieve → Generate`,
      },
      {
        type: 'text',
        title: 'Embeddings and vector search',
        content: `**Embeddings** convert text into vectors (arrays of numbers). Semantically similar text ends up with similar vectors. "dog" and "puppy" will be close in vector space even though they share no characters.

A **vector database** stores these vectors and lets you find the nearest neighbors (most similar chunks) to a query vector in milliseconds, even across millions of documents.

Popular vector databases:
- **Chroma** — local, open-source, great for development
- **Pinecone** — managed cloud, production-grade, free tier
- **Weaviate** — open-source with cloud option, powerful filtering
- **Qdrant** — fast, open-source, great Rust implementation
- **pgvector** — if you already use Postgres, just add a column!`,
      },
      {
        type: 'code',
        code: {
          title: 'Complete RAG pipeline with LangChain + Chroma',
          language: 'python',
          code: `# pip install langchain langchain-openai chromadb pypdf

from langchain_community.document_loaders import PyPDFLoader, WebBaseLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores import Chroma
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

# ── 1. INGEST — Load your documents ──────────────────────────────
loader = PyPDFLoader("company_handbook.pdf")
# or: loader = WebBaseLoader("https://docs.yoursite.com")
documents = loader.load()

# ── 2. CHUNK — Split into smaller pieces ─────────────────────────
splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,      # characters per chunk
    chunk_overlap=200,    # overlap prevents context loss at boundaries
)
chunks = splitter.split_documents(documents)
print(f"Split into {len(chunks)} chunks")

# ── 3. EMBED + STORE ─────────────────────────────────────────────
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
vectorstore = Chroma.from_documents(
    documents=chunks,
    embedding=embeddings,
    persist_directory="./chroma_db",  # saves to disk
)
retriever = vectorstore.as_retriever(search_kwargs={"k": 4})

# ── 4. RETRIEVE + GENERATE ───────────────────────────────────────
llm = ChatOpenAI(model="gpt-4o-mini")

prompt = ChatPromptTemplate.from_template("""
Answer the question using only the context below.
If the answer isn't in the context, say "I don't know."

Context: {context}

Question: {question}
""")

def format_docs(docs):
    return "\\n\\n".join(doc.page_content for doc in docs)

rag_chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)

# Ask questions about your documents!
answer = rag_chain.invoke("What is the vacation policy?")
print(answer)`,
        },
      },
      {
        type: 'tip',
        content: 'Chunk size matters a lot. Too small (< 200 chars) = lost context. Too large (> 2000 chars) = irrelevant content dilutes the answer. 500–1000 chars with 10–20% overlap is a good starting point. Experiment with your specific data.',
      },
    ],
    relatedTopics: ['langchain', 'langraph', 'ai-agents'],
  },

  // ── PHASE 4: AGENTIC AI ──────────────────────────────────────────────────
  {
    id: 'ai-agents',
    title: 'AI Agents — Autonomous Problem Solvers',
    emoji: '🤖',
    phase: 4,
    phaseName: 'Agentic AI',
    category: 'Agentic AI',
    difficulty: 'Intermediate',
    readTime: 15,
    summary: 'Build agents that can use tools, search the web, write code, and solve multi-step problems autonomously. Covers ReAct, function calling, and tool design.',
    tags: ['AI Agents', 'ReAct', 'Tool Use', 'Function Calling', 'Autonomous AI'],
    sections: [
      {
        type: 'text',
        title: 'What makes something an agent?',
        content: `A regular LLM call is a one-shot exchange: you ask, it answers. An **agent** is different — it can:

1. **Reason** about what steps are needed
2. **Use tools** (web search, code execution, APIs) to gather information or take action
3. **Observe** the results of tool calls
4. **Iterate** — if a tool call fails or the result is unexpected, it tries a different approach
5. **Stop** when the task is complete

This loop — Reason → Act → Observe → Reason again — is called the **ReAct** pattern (Reasoning + Acting).`,
      },
      {
        type: 'code',
        code: {
          title: 'Build an agent with function calling (OpenAI)',
          language: 'python',
          code: `import json
import openai
import requests

client = openai.OpenAI()

# Define the tools (functions) the agent can use
tools = [
    {
        "type": "function",
        "function": {
            "name": "search_web",
            "description": "Search the web for current information about a topic",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "The search query"}
                },
                "required": ["query"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "run_python",
            "description": "Execute Python code and return the output",
            "parameters": {
                "type": "object",
                "properties": {
                    "code": {"type": "string", "description": "Python code to execute"}
                },
                "required": ["code"]
            }
        }
    }
]

def search_web(query: str) -> str:
    # In production: use Tavily, Serper, or Brave Search API
    return f"Search results for '{query}': [mock results]"

def run_python(code: str) -> str:
    import io, contextlib
    output = io.StringIO()
    with contextlib.redirect_stdout(output):
        exec(code)
    return output.getvalue()

# The ReAct loop
messages = [{"role": "user", "content": "What is the square root of the current year?"}]

while True:
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        tools=tools,
        tool_choice="auto",
    )
    msg = response.choices[0].message

    if msg.tool_calls:
        messages.append(msg)
        for tool_call in msg.tool_calls:
            fn_name = tool_call.function.name
            fn_args = json.loads(tool_call.function.arguments)

            # Execute the tool
            if fn_name == "search_web":
                result = search_web(**fn_args)
            elif fn_name == "run_python":
                result = run_python(**fn_args)

            messages.append({
                "role": "tool",
                "tool_call_id": tool_call.id,
                "content": result
            })
    else:
        print(msg.content)   # Final answer
        break`,
        },
      },
      {
        type: 'grid',
        title: 'Essential agent tools to build',
        items: [
          { emoji: '🔍', title: 'Web Search', desc: 'Use Tavily (tavily.com, free tier) or Brave Search API. Better than Google for AI use cases.' },
          { emoji: '💻', title: 'Code Execution', desc: 'Run Python safely in a sandbox. E2B.dev offers secure cloud code execution.' },
          { emoji: '📄', title: 'File Read/Write', desc: 'Read PDFs, CSVs, text files. Write results to files. Critical for data analysis agents.' },
          { emoji: '🌐', title: 'HTTP Requests', desc: 'Call external APIs, fetch web pages. Combine with RAG for live data retrieval.' },
        ],
      },
    ],
    relatedTopics: ['langraph', 'langchain', 'rag-systems'],
  },

  {
    id: 'langraph',
    title: 'LangGraph — Multi-Agent Workflows',
    emoji: '🕸️',
    phase: 4,
    phaseName: 'Agentic AI',
    category: 'Agentic AI',
    difficulty: 'Advanced',
    readTime: 20,
    summary: 'LangGraph extends LangChain with graph-based workflows. Build stateful, multi-agent systems with cycles, conditional routing, and human-in-the-loop controls.',
    tags: ['LangGraph', 'Multi-Agent', 'State Machine', 'Workflows', 'Supervisor'],
    sections: [
      {
        type: 'text',
        title: 'Why LangGraph? What LangChain can\'t do',
        content: `LangChain chains flow in one direction (A → B → C). But real agent workflows need:

- **Cycles** — an agent that retries until it gets a good result
- **Conditional branching** — route to different agents based on the task type
- **Persistent state** — remember what happened across many steps
- **Human-in-the-loop** — pause and wait for human approval before taking an action
- **Multiple agents** — a researcher, a writer, and an editor working together

LangGraph models workflows as a **directed graph** where nodes are Python functions (or LLM calls) and edges define the flow between them. State is passed through the graph and persisted automatically.`,
      },
      {
        type: 'code',
        code: {
          title: 'LangGraph: a research + writing agent',
          language: 'python',
          code: `# pip install langgraph langchain-openai

from typing import TypedDict, Annotated
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage
import operator

# ── 1. Define State ──────────────────────────────────────────────
class AgentState(TypedDict):
    messages: Annotated[list, operator.add]  # Messages accumulate
    topic: str
    research: str
    draft: str
    iteration: int

# ── 2. Define Nodes (each is a Python function) ──────────────────
llm = ChatOpenAI(model="gpt-4o")

def research_node(state: AgentState) -> AgentState:
    """Researcher agent: gather information on the topic"""
    response = llm.invoke([
        HumanMessage(content=f"Research this topic and provide key facts: {state['topic']}")
    ])
    return {"research": response.content, "iteration": state.get("iteration", 0) + 1}

def writer_node(state: AgentState) -> AgentState:
    """Writer agent: turn research into a draft"""
    response = llm.invoke([
        HumanMessage(content=f"""
Write a concise blog post about: {state['topic']}

Using this research:
{state['research']}
""")
    ])
    return {"draft": response.content}

def quality_check(state: AgentState) -> str:
    """Router: decide if draft is good enough or needs revision"""
    if len(state.get("draft", "")) < 200 and state["iteration"] < 3:
        return "research"   # Loop back for more research
    return "end"

# ── 3. Build the Graph ───────────────────────────────────────────
workflow = StateGraph(AgentState)

workflow.add_node("research", research_node)
workflow.add_node("writer", writer_node)

workflow.set_entry_point("research")
workflow.add_edge("research", "writer")
workflow.add_conditional_edges(
    "writer",
    quality_check,
    {"research": "research", "end": END}
)

app = workflow.compile()

# ── 4. Run it ────────────────────────────────────────────────────
result = app.invoke({"topic": "How transformers changed AI", "messages": [], "iteration": 0})
print(result["draft"])`,
        },
      },
      {
        type: 'tip',
        content: 'LangGraph has built-in persistence via checkpointers (SQLite, Postgres). Use `MemorySaver` in development and `PostgresSaver` in production. This enables "time travel" — you can replay or branch from any previous state.',
      },
    ],
    relatedTopics: ['ai-agents', 'langchain', 'rag-systems'],
  },

  // ── PHASE 5: PRODUCTION ──────────────────────────────────────────────────
  {
    id: 'build-chatbot',
    title: 'Build a Chatbot — Step-by-Step Tutorial',
    emoji: '💬',
    phase: 5,
    phaseName: 'Production',
    category: 'Production',
    difficulty: 'Intermediate',
    readTime: 20,
    summary: 'Build a full-stack AI chatbot from scratch using Next.js, the AI SDK, streaming responses, conversation memory, and deploy it to Vercel in under an hour.',
    tags: ['Chatbot', 'Next.js', 'AI SDK', 'Streaming', 'Vercel', 'Tutorial'],
    sections: [
      {
        type: 'steps',
        title: 'What we\'re building',
        items: [
          { title: 'Next.js frontend', desc: 'React chat UI with streaming responses and auto-scroll' },
          { title: 'API route', desc: 'Server-side endpoint using the Vercel AI SDK' },
          { title: 'Streaming', desc: 'Tokens appear word-by-word, just like ChatGPT' },
          { title: 'Memory', desc: 'Full conversation history maintained client-side' },
          { title: 'Deploy', desc: 'Push to Vercel — live in minutes' },
        ],
      },
      {
        type: 'code',
        code: {
          title: 'Step 1: Setup',
          language: 'bash',
          code: `# Create Next.js app
npx create-next-app@latest my-chatbot --typescript --tailwind --app
cd my-chatbot

# Install the Vercel AI SDK (supports OpenAI, Anthropic, Google, Groq)
npm install ai @ai-sdk/openai
# or for Anthropic: npm install @ai-sdk/anthropic
# or for Groq: npm install @ai-sdk/groq

# Add your API key to .env.local
echo "OPENAI_API_KEY=sk-..." > .env.local`,
        },
      },
      {
        type: 'code',
        code: {
          title: 'Step 2: API Route (app/api/chat/route.ts)',
          language: 'typescript',
          code: `import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4o-mini'),  // Cheap and fast for chatbots
    system: 'You are a helpful assistant. Be concise and friendly.',
    messages,
  });

  return result.toDataStreamResponse();
}`,
        },
      },
      {
        type: 'code',
        code: {
          title: 'Step 3: Chat UI (app/page.tsx)',
          language: 'typescript',
          code: `'use client';

import { useChat } from 'ai/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">AI Chatbot</h1>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map(m => (
          <div key={m.id} className={\`flex \${m.role === 'user' ? 'justify-end' : 'justify-start'}\`}>
            <div className={\`max-w-[80%] p-3 rounded-2xl \${
              m.role === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-white'
            }\`}>
              {m.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 text-white p-3 rounded-2xl">
              <span className="animate-pulse">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Type a message..."
          className="flex-1 p-3 rounded-xl bg-gray-800 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}`,
        },
      },
      {
        type: 'code',
        code: {
          title: 'Step 4: Deploy to Vercel',
          language: 'bash',
          code: `# Push to GitHub
git add -A && git commit -m "feat: AI chatbot" && git push

# Deploy via Vercel CLI
npx vercel deploy

# Add environment variable in Vercel dashboard:
# Settings → Environment Variables → OPENAI_API_KEY = sk-...
# Or use Vercel CLI:
vercel env add OPENAI_API_KEY

# Your chatbot is now live!`,
        },
      },
    ],
    relatedTopics: ['ai-apis', 'langchain', 'ai-agents'],
  },

  {
    id: 'ai-tools-landscape',
    title: 'AI Tools Landscape — Every Tool You Need to Know',
    emoji: '🛠️',
    phase: 5,
    phaseName: 'Production',
    category: 'Production',
    difficulty: 'Beginner',
    readTime: 10,
    summary: 'A comprehensive map of the AI tools ecosystem: coding assistants, image generation, voice, automation, vector databases, and observability tools.',
    tags: ['Cursor', 'GitHub Copilot', 'Midjourney', 'ElevenLabs', 'Pinecone', 'LangSmith'],
    sections: [
      {
        type: 'grid',
        title: 'Coding & Development',
        items: [
          { emoji: '⚡', title: 'Cursor', desc: 'AI-native code editor (VS Code fork). Tab autocomplete, Cmd+K inline edits, AI chat. Best AI coding experience. cursor.com', badge: 'Recommended' },
          { emoji: '🤖', title: 'GitHub Copilot', desc: 'Integrates into VS Code, JetBrains, Neovim. Best for teams already on GitHub. $10/month. copilot.github.com', badge: 'Most popular' },
          { emoji: '🔧', title: 'Continue.dev', desc: 'Open-source Copilot alternative. Works with any local or cloud model. Free forever. continue.dev' },
          { emoji: '🌊', title: 'Windsurf', desc: 'Codeium\'s IDE. "Flows" feature lets AI take larger autonomous actions. Free tier. codeium.com' },
        ],
      },
      {
        type: 'grid',
        title: 'AI Image & Video Generation',
        items: [
          { emoji: '🎨', title: 'Midjourney', desc: 'Best image quality for artistic/stylized work. Discord-based. $10-60/month. midjourney.com' },
          { emoji: '🖼️', title: 'DALL-E 3', desc: 'OpenAI\'s image model. Best at following text prompts accurately. Available via ChatGPT Plus or API.' },
          { emoji: '🎭', title: 'Stable Diffusion', desc: 'Open source. Run locally with ComfyUI or Automatic1111. Full control. No cost except compute.' },
          { emoji: '🎬', title: 'Runway ML', desc: 'AI video generation and editing. Gen-2 creates video from text. runwayml.com' },
        ],
      },
      {
        type: 'grid',
        title: 'Automation & AI Orchestration',
        items: [
          { emoji: '🔄', title: 'n8n', desc: 'Open-source workflow automation with 400+ integrations and AI nodes. Self-host free or $20/month cloud. n8n.io', badge: 'Best for automation' },
          { emoji: '🔗', title: 'Make (Integromat)', desc: 'Visual no-code automation. Strong AI integrations. Good for non-developers. make.com' },
          { emoji: '📡', title: 'LangSmith', desc: 'LangChain\'s observability platform. Trace every LLM call, debug, evaluate. Free tier. smith.langchain.com' },
          { emoji: '🗣️', title: 'ElevenLabs', desc: 'Best-in-class text-to-speech and voice cloning. Free tier: 10,000 chars/month. elevenlabs.io' },
        ],
      },
    ],
    relatedTopics: ['ai-apis', 'build-chatbot', 'ai-agents'],
  },
];

export default aiTopics;
