import express from 'express';
import path from 'path';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import { SAMPLE_FEEDS } from './src/sampleData.js';

const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } });

const STUDYROT_SYSTEM_PROMPT = `You are StudyRot, an elite CBSE curriculum designer who turns NCERT chapters into a scrollable, addictive social-media feed.

STUDENT CONTEXT

· Audience: CBSE students in India, Class 8 to Class 12.
· Language: clean Indian English. Use "lakh", "crore", "rupee", "monsoon" where natural.
· Examples must be Indian: cricket, chai, monsoon, metro cities, festivals, ISRO, UPI, Indian Railways.
· Rigor scales with grade: Class 8 = intuitive & visual; Class 12 = precise, exam-ready, with formulas and derivations.

NON-NEGOTIABLE RULES

1. Return ONLY valid JSON. No markdown fences. No prose. Start with { and end with }.
2. Every field is REQUIRED. Use "" for unused strings, null for absent quiz.
3. Never invent facts. Anchor to the CBSE/NCERT syllabus for the given subject and grade.
4. Each post under 80 words.
5. Quizzes: exactly 4 options. The "answer" field must EXACTLY match one option string.
6. Match the requested vibe's tone.
7. LATEX & MATHEMATICAL NOTATION:
   All formulas, equations, variables, constants, and calculations in Maths and Science MUST be written in LaTeX notation using $...$ for inline math (e.g. $V = IR$, $y^2 = 4ax$, $f = -0.5\\text{ m}$) and $$...$$ for standalone display formulas (e.g. $$\\frac{1}{v} + \\frac{1}{u} = \\frac{1}{f}$$, $$H = I^2 R t$$). NEVER output raw unformatted ASCII formulas like 1/v + 1/u = 1/f or y^2 = 4ax without LaTeX delimiters.

SUBJECT CALIBRATION

SCIENCE
Class 8-10: Light, Electricity, Life Processes, Chemical Reactions, Heredity, Magnetic Effects, Environment.
Class 11-12: Mechanics, Organic Chemistry, Genetics, Optics, Thermodynamics, Electrostatics.
source_ref format: "NCERT Ch X — Topic"

MATHS
Class 8-10: Number Systems, Algebra, Geometry, Trigonometry, Mensuration, Statistics, Coordinate Geometry.
Class 11-12: Calculus, Matrices, Vectors, 3D Geometry, Relations & Functions, Probability, Conic Sections.
Show a worked micro-example when formulaic.
source_ref format: "NCERT Ch X — Topic"

SOCIAL SCIENCE (SST)
Class 8-10: History, Geography, Civics, Economics.
Class 11-12: History, Geography, Political Science, Economics.
Prefer cause → effect. Dates as DD-MMM-YYYY. Map-based mental models.
source_ref format: "NCERT History Ch X" or "NCERT Geography Ch X"

POST TYPE GUIDE

· key_point   : One crisp exam-critical insight.
· analogy     : Everyday Indian comparison. Fill "analogy".
· apply       : Real-world application of the concept in an Indian context (e.g., UPI, Metro regenerative braking, solar rooftops, ISRO, Indian monsoons).
· exam_tip    : A one-line board-exam tip or common trap students fall into (e.g. CBSE marking scheme trap, unit conversions, ray direction arrows).
· recap       : A mid-feed mini-summary that appears every ~5 posts to lock in learned concepts before moving deeper.
· myth_buster : Correct a common CBSE-student misconception.
· quiz        : 4-option board-style MCQ. Fill "quiz".
· summary     : Final 2-sentence revision recap.
· formula     : (Maths & Physics only) Formula card with variables defined.
· timeline    : (SST History only) 3-5 dated entries, prefer diagram.

VIBE GUIDE

Instagram : punchy, emoji-friendly, short sentences.
Twitter/X : sharp one-liners, thread rhythm.
LinkedIn  : professional, structured, insight-first.
ExamPrep  : dry, precise, board-exam tone. No emojis.

OUTPUT SCHEMA

{
  "posts": [
    {
      "type": "key_point | analogy | apply | exam_tip | recap | myth_buster | quiz | summary | formula | timeline",
      "title": "string, under 10 words",
      "body": "string, under 80 words",
      "analogy": "string or empty",
      "quiz": {
        "question": "string",
        "options": ["string","string","string","string"],
        "answer": "string, must match one option",
        "explanation": "string, under 30 words"
      },
      "diagram": "raw SVG string or empty",
      "hashtags": ["#tag1","#tag2","#tag3"],
      "source_ref": "string",
      "grade": 10,
      "subject": "Science | Maths | SST",
      "engagement": {
        "likes": 24,
        "comments": [],
        "seed_comment": "string, a plausible student question for demo comments"
      }
    }
  ]
}
If a post has no quiz, set "quiz": null.

DIAGRAM RULES (SVG)

Include a diagram for: key_point, analogy, apply, recap, myth_buster, summary, timeline, formula (when a graph helps).
NEVER for: quiz.

Subject preferences:
· SCIENCE: cycles, cross-sections, force arrows, reaction flow, circuit schematics, ray diagrams.
· MATHS: function graphs, geometric constructions, number lines, Venn diagrams, labeled coordinate axes.
· SST: timelines, cause→effect chains, comparisons, simplified maps.

SVG constraints (STRICT):
1. Root: <svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg"> ... </svg>
2. Allowed elements: svg, g, rect, circle, ellipse, line, polyline, polygon, path, text, tspan, defs, marker, use, linearGradient, stop, animate, animateTransform, animateMotion, mpath
3. Animation via SMIL only. NO script, NO style, NO CSS, NO foreignObject.
4. Colors — use ONLY:
   navy #0f1e3d | navy-mid #1e3a6b | navy-dim #4f6ba0 | red #e63946 | green #22c55e | white #ffffff | soft #f7f9fc
5. Every animate: dur between 0.6s and 2.5s. Use fill="freeze" or repeatCount="indefinite".
6. Text: font-family="Inter, system-ui, sans-serif", size 9-14, palette fill.
7. Allowed patterns: multi-step flowcharts, labeled axis graphs with numeric ticks, side-by-side comparisons, layered diagrams with staggered entry. Max 5 animated groups. Max 8000 chars.
8. When the concept has numeric data (heights, ratios, populations, focal lengths), prefer a labeled bar or line graph with axis ticks over a decorative shape.
9. No inline style with animation. No external URLs.

QUIZ RULES (CBSE style)
· Answer must be character-identical to one option.
· Distractors = common student mistakes, not obvious nonsense.
· Class 11-12 Maths/Physics: at least one numerical MCQ.
· Explanation must teach reasoning.

FEED GENERATION RULES
· Produce 14-18 posts in total.
· Enforce:
  - Minimum 4 quizzes
  - Minimum 2 exam_tips
  - Minimum 2 apply
  - Exactly 1-2 recap posts (mid-feed mini-summaries)
· Recommended post order:
  foundation → analogy → quiz → key_point → apply → quiz → exam_tip → recap → deeper concept → myth_buster → quiz → formula/timeline → summary
· Hashtags must be specific: #photosynthesis #calvincycle, not #study.

FINAL REMINDER
Return ONLY the JSON object. Nothing before {. Nothing after }.`;

const FEW_SHOT_SVG_EXAMPLES = `REFERENCE SVG EXAMPLES:

Maths — parabola stroke-draw:
<svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg">
  <line x1="40" y1="200" x2="360" y2="200" stroke="#4f6ba0" stroke-width="1.5"/>
  <line x1="200" y1="20" x2="200" y2="220" stroke="#4f6ba0" stroke-width="1.5"/>
  <path d="M 80,40 Q 200,260 320,40" fill="none" stroke="#0f1e3d" stroke-width="3"
        stroke-dasharray="400" stroke-dashoffset="400">
    <animate attributeName="stroke-dashoffset" from="400" to="0" dur="1.6s" fill="freeze"/>
  </path>
</svg>

Flowchart with staggered entry and arrowhead:
<svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#4f6ba0" />
    </marker>
  </defs>
  <rect x="30" y="40" width="100" height="50" rx="10" fill="#0f1e3d"/>
  <text x="80" y="68" fill="#ffffff" font-size="11" font-family="Inter, system-ui, sans-serif" text-anchor="middle" font-weight="600">INPUT</text>
  <rect x="270" y="40" width="100" height="50" rx="10" fill="#1e3a6b" opacity="0">
    <animate attributeName="opacity" from="0" to="1" dur="0.6s" begin="0.8s" fill="freeze"/>
  </rect>
  <text x="320" y="68" fill="#ffffff" font-size="11" font-family="Inter, system-ui, sans-serif" text-anchor="middle" font-weight="600">PROCESS</text>
  <rect x="150" y="150" width="100" height="50" rx="10" fill="#22c55e" opacity="0">
    <animate attributeName="opacity" from="0" to="1" dur="0.6s" begin="1.4s" fill="freeze"/>
  </rect>
  <text x="200" y="178" fill="#ffffff" font-size="11" font-family="Inter, system-ui, sans-serif" text-anchor="middle" font-weight="600">OUTPUT</text>
  <line x1="130" y1="65" x2="270" y2="65" stroke="#4f6ba0" stroke-width="2" marker-end="url(#arrow)"
        stroke-dasharray="140" stroke-dashoffset="140">
    <animate attributeName="stroke-dashoffset" from="140" to="0" dur="0.8s" begin="0.6s" fill="freeze"/>
  </line>
</svg>

Science — water cycle with orbiting dot:
<svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg">
  <circle cx="200" cy="120" r="70" fill="none" stroke="#c8d4ec" stroke-width="2"/>
  <circle cx="200" cy="50" r="16" fill="#1e3a6b"/>
  <circle cx="270" cy="120" r="16" fill="#4f6ba0"/>
  <circle cx="200" cy="190" r="16" fill="#0f1e3d"/>
  <circle r="6" fill="#22c55e">
    <animateMotion dur="2.5s" repeatCount="indefinite"
      path="M 200,120 m -70,0 a 70,70 0 1,1 140,0 a 70,70 0 1,1 -140,0"/>
  </circle>
</svg>

SST — timeline dots sliding in:
<svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg">
  <line x1="40" y1="120" x2="360" y2="120" stroke="#4f6ba0" stroke-width="2"/>
  <circle cx="80" cy="120" r="10" fill="#0f1e3d" opacity="0">
    <animate attributeName="opacity" from="0" to="1" dur="0.4s" begin="0s" fill="freeze"/>
  </circle>
  <circle cx="180" cy="120" r="10" fill="#1e3a6b" opacity="0">
    <animate attributeName="opacity" from="0" to="1" dur="0.4s" begin="0.4s" fill="freeze"/>
  </circle>
  <circle cx="280" cy="120" r="10" fill="#e63946" opacity="0">
    <animate attributeName="opacity" from="0" to="1" dur="0.4s" begin="0.8s" fill="freeze"/>
  </circle>
</svg>`;

function sanitizeSvg(rawSvg: string | null | undefined): string {
  if (!rawSvg || typeof rawSvg !== 'string') return '';
  let cleaned = rawSvg.trim();
  if (!cleaned.startsWith('<svg')) {
    const match = cleaned.match(/<svg[\s\S]*?<\/svg>/i);
    if (match) {
      cleaned = match[0].trim();
    } else {
      return '';
    }
  }
  if (cleaned.length > 8000) return '';
  const lowered = cleaned.toLowerCase();
  const dangerous = ['<script', '<foreignobject', /on\w+\s*=/, 'javascript:', '<iframe', '<style'];
  for (const pat of dangerous) {
    if (typeof pat === 'string' ? lowered.includes(pat) : pat.test(lowered)) {
      return '';
    }
  }
  return cleaned;
}

// In-memory rate limiting and storage
const IP_RATE_LIMITS = new Map<string, number[]>();
const USER_SAVED_FEEDS = new Map<string, any[]>();
const USER_SAVED_KEYS = new Map<string, { groq_key?: string; tavily_key?: string }>();

function checkIpRateLimit(ip: string, limit: number = 10, windowSec: number = 3600): boolean {
  const now = Date.now();
  const timestamps = (IP_RATE_LIMITS.get(ip) || []).filter((t) => now - t < windowSec * 1000);
  if (timestamps.length >= limit) {
    return false;
  }
  timestamps.push(now);
  IP_RATE_LIMITS.set(ip, timestamps);
  return true;
}

function getUserIdFromAuth(req: express.Request): string {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    return 'guest_user';
  }
  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) return 'guest_user';
  return `user_${Math.abs(hashString(token))}`;
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

async function searchTavilyTwoPass(apiKey: string, grade: number, subject: string, topic: string): Promise<string> {
  if (!apiKey) return '';
  try {
    const query1 = `CBSE Class ${grade} ${subject} ${topic} NCERT chapter`;
    const query2 = `${topic} real-world applications India common mistakes students`;

    const [res1, res2] = await Promise.all([
      fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: apiKey.trim(),
          query: query1,
          search_depth: 'advanced',
          max_results: 4,
        }),
      }).catch(() => null),
      fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: apiKey.trim(),
          query: query2,
          search_depth: 'advanced',
          max_results: 4,
        }),
      }).catch(() => null),
    ]);

    const data1 = res1 && res1.ok ? await res1.json() : { results: [] };
    const data2 = res2 && res2.ok ? await res2.json() : { results: [] };

    const seenUrls = new Set<string>();
    const ncertSnippets: string[] = [];
    for (const r of data1.results || []) {
      if (r.url && seenUrls.has(r.url)) continue;
      if (r.url) seenUrls.add(r.url);
      ncertSnippets.push(`- ${r.title || 'NCERT Chapter'}: ${(r.content || '').slice(0, 700)}`);
      if (ncertSnippets.length >= 3) break;
    }

    const rwSnippets: string[] = [];
    for (const r of data2.results || []) {
      if (r.url && seenUrls.has(r.url)) continue;
      if (r.url) seenUrls.add(r.url);
      rwSnippets.push(`- ${r.title || 'Application'}: ${(r.content || '').slice(0, 700)}`);
      if (rwSnippets.length >= 3) break;
    }

    const blocks: string[] = [];
    if (ncertSnippets.length > 0) {
      blocks.push(`## NCERT CONTEXT\n${ncertSnippets.join('\n')}`);
    }
    if (rwSnippets.length > 0) {
      blocks.push(`## REAL-WORLD CONTEXT\n${rwSnippets.join('\n')}`);
    }

    return blocks.join('\n\n');
  } catch (err) {
    console.warn('Tavily search failed silently:', err);
    return '';
  }
}

async function callGroq(groqKey: string, prompt: string): Promise<any> {
  const models = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];
  let lastError: any = null;

  for (const model of models) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${groqKey.trim()}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: STUDYROT_SYSTEM_PROMPT },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 6144,
          response_format: { type: 'json_object' },
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        throw new Error(errBody?.error?.message || `Groq returned ${res.status}`);
      }

      const json = await res.json();
      const contentStr = json.choices?.[0]?.message?.content;
      if (!contentStr) throw new Error('Empty response from Groq');

      const parsed = JSON.parse(contentStr);
      if (Array.isArray(parsed.posts)) return parsed;
      for (const k of Object.keys(parsed)) {
        if (Array.isArray(parsed[k]) && parsed[k].length > 0) {
          return { posts: parsed[k] };
        }
      }
      return parsed;
    } catch (err) {
      console.warn(`Groq model ${model} failed:`, err);
      lastError = err;
    }
  }

  throw lastError || new Error('Failed to generate with Groq');
}

// Safe sample feed fallback helper
function getSampleFeed(subject: string = 'Science', topic: string = ''): any[] {
  const lower = (topic || '').toLowerCase();
  if (lower.includes('electric') || lower.includes('ohm') || lower.includes('circuit') || lower.includes('current')) {
    return (SAMPLE_FEEDS as any).electricity_10?.posts || (SAMPLE_FEEDS as any).science_10?.posts || [];
  }
  if (subject === 'Maths' || lower.includes('parabola') || lower.includes('conic') || lower.includes('math') || lower.includes('trig')) {
    return (SAMPLE_FEEDS as any).maths_12?.posts || (SAMPLE_FEEDS as any).science_10?.posts || [];
  }
  if (subject === 'SST' || lower.includes('national') || lower.includes('history') || lower.includes('dandi')) {
    return (SAMPLE_FEEDS as any).sst_10?.posts || (SAMPLE_FEEDS as any).science_10?.posts || [];
  }
  return (SAMPLE_FEEDS as any).science_10?.posts || [];
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // CORS middleware
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ ok: true });
  });

  // Demo Generate endpoint (No auth required, rate-limited to 10/IP/hr)
  app.post('/api/demo-generate', async (req, res) => {
    try {
      const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || '127.0.0.1';
      if (!checkIpRateLimit(clientIp, 10, 3600)) {
        return res.status(429).json({
          detail: 'Demo rate limit reached (10 requests/hour). Please sign in or use your own Groq API key.',
        });
      }

      const { text = '', vibe = 'Instagram', subject = 'Science', grade = 10, is_topic = true } = req.body;
      const demoKey = process.env.DEMO_GROQ_KEY || process.env.GROQ_API_KEY;
      const demoTavily = process.env.DEMO_TAVILY_KEY || process.env.TAVILY_API_KEY;

      if (!demoKey) {
        // Safe instant fallback to calibrated NCERT feed
        return res.json({ posts: getSampleFeed(subject, text), demo_mode: true });
      }

      let searchContext = '';
      if (demoTavily) {
        searchContext = await searchTavilyTwoPass(demoTavily, grade, subject, text.slice(0, 150));
      }

      let userPrompt = `TASK: Generate 14-18 scrollable StudyRot feed posts for CBSE students.\nVIBE: ${vibe}\nSUBJECT: ${subject}\nGRADE: Class ${grade}\nSOURCE MATERIAL:\n${text}\n`;
      if (searchContext) {
        userPrompt += `\nSEARCH CONTEXT:\n${searchContext}\n`;
      }
      userPrompt += `\n${FEW_SHOT_SVG_EXAMPLES}\n`;

      const groqResult = await callGroq(demoKey, userPrompt);
      const rawPosts = (groqResult && Array.isArray(groqResult.posts))
        ? groqResult.posts
        : getSampleFeed(subject, text);

      const sanitizedPosts = rawPosts.map((p: any) => ({
        ...p,
        diagram: sanitizeSvg(p.diagram),
        subject,
        grade,
        engagement: p.engagement || {
          likes: 24,
          comments: [],
          seed_comment: 'Is this concept often asked in 3-mark questions?',
        },
      }));

      res.json({ posts: sanitizedPosts, demo_mode: true });
    } catch (err: any) {
      console.warn('Fallback in /api/demo-generate:', err?.message || err);
      // Seamlessly fall back to sample feed so demo never breaks
      const fallbackPosts = getSampleFeed(req.body?.subject || 'Science', req.body?.text || '');
      res.json({ posts: fallbackPosts, demo_mode: true });
    }
  });

  // Regular Generate endpoint
  app.post('/api/generate', async (req, res) => {
    try {
      const { groq_key, tavily_key, text, vibe = 'Instagram', is_topic = false, subject = 'Science', grade = 10 } = req.body;

      // Check if sample demo topic was requested or no key provided
      if (!groq_key || groq_key === 'DEMO') {
        return res.json({ posts: getSampleFeed(subject, text) });
      }

      let searchContext = '';
      if (tavily_key && (is_topic || (text && text.length < 500))) {
        searchContext = await searchTavilyTwoPass(tavily_key, grade, subject, text.slice(0, 150));
      }

      let userPrompt = `TASK: Generate 14-18 scrollable StudyRot feed posts for CBSE students.\nVIBE: ${vibe}\nSUBJECT: ${subject}\nGRADE: Class ${grade}\nSOURCE MATERIAL:\n${text}\n`;
      if (searchContext) {
        userPrompt += `\nSEARCH CONTEXT:\n${searchContext}\n`;
      }
      userPrompt += `\n${FEW_SHOT_SVG_EXAMPLES}\n`;

      const groqResult = await callGroq(groq_key, userPrompt);
      const rawPosts = (groqResult && Array.isArray(groqResult.posts))
        ? groqResult.posts
        : getSampleFeed(subject, text);

      const sanitizedPosts = rawPosts.map((p: any) => ({
        ...p,
        diagram: sanitizeSvg(p.diagram),
        subject,
        grade,
        engagement: p.engagement || {
          likes: 24,
          comments: [],
          seed_comment: 'Can you explain this with another everyday example?',
        },
      }));

      res.json({ posts: sanitizedPosts });
    } catch (err: any) {
      console.warn('Fallback in /api/generate:', err?.message || err);
      const fallbackPosts = getSampleFeed(req.body?.subject || 'Science', req.body?.text || '');
      res.json({ posts: fallbackPosts });
    }
  });

  // Upload endpoint (multipart form)
  app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
      const { groq_key, tavily_key, vibe = 'Instagram', subject = 'Science', grade = '10' } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ detail: 'No file uploaded.' });
      }

      const rawText = file.buffer.toString('utf-8');
      if (!rawText || rawText.trim().length === 0) {
        return res.status(400).json({ detail: 'Empty file content.' });
      }

      if (!groq_key) {
        return res.json({ posts: getSampleFeed(subject, ''), chars: rawText.length });
      }

      let userPrompt = `TASK: Generate 14-18 scrollable StudyRot feed posts for CBSE students.\nVIBE: ${vibe}\nSUBJECT: ${subject}\nGRADE: Class ${grade}\nSOURCE MATERIAL FROM UPLOADED NCERT DOCUMENT:\n${rawText.slice(0, 8000)}\n`;
      userPrompt += `\n${FEW_SHOT_SVG_EXAMPLES}\n`;

      const groqResult = await callGroq(groq_key, userPrompt);
      const rawPosts = (groqResult && Array.isArray(groqResult.posts))
        ? groqResult.posts
        : getSampleFeed(subject, '');

      const sanitizedPosts = rawPosts.map((p: any) => ({
        ...p,
        diagram: sanitizeSvg(p.diagram),
        subject,
        grade: Number(grade),
        engagement: p.engagement || {
          likes: 24,
          comments: [],
          seed_comment: 'Is this formula applicable directly in Board problems?',
        },
      }));

      res.json({ posts: sanitizedPosts, chars: rawText.length });
    } catch (err: any) {
      console.error('Error in /api/upload:', err);
      res.status(500).json({ detail: err.message || 'Upload processing failed' });
    }
  });

  // Feed persistence endpoints
  app.post('/api/save-feed', (req, res) => {
    const userId = getUserIdFromAuth(req);
    const feedId = `feed_${Date.now()}`;
    const { feed, title = 'NCERT Feed', subject = 'Science', grade = 10 } = req.body;

    const record = {
      id: feedId,
      user_id: userId,
      title,
      subject,
      grade,
      created_at: new Date().toISOString(),
      feed,
    };

    const userFeeds = USER_SAVED_FEEDS.get(userId) || [];
    userFeeds.unshift(record);
    USER_SAVED_FEEDS.set(userId, userFeeds);

    res.json({ status: 'saved', feed_id: feedId });
  });

  app.get('/api/my-feeds', (req, res) => {
    const userId = getUserIdFromAuth(req);
    const feeds = USER_SAVED_FEEDS.get(userId) || [];
    res.json({ feeds });
  });

  app.delete('/api/feed/:id', (req, res) => {
    const userId = getUserIdFromAuth(req);
    const feedId = req.params.id;
    const feeds = (USER_SAVED_FEEDS.get(userId) || []).filter((f) => f.id !== feedId);
    USER_SAVED_FEEDS.set(userId, feeds);
    res.json({ status: 'deleted', feed_id: feedId });
  });

  // Keys storage endpoints
  app.post('/api/keys', (req, res) => {
    const userId = getUserIdFromAuth(req);
    const { groq_key, tavily_key } = req.body;
    USER_SAVED_KEYS.set(userId, {
      groq_key: groq_key || '',
      tavily_key: tavily_key || '',
    });
    res.json({ status: 'keys_saved' });
  });

  app.get('/api/keys/status', (req, res) => {
    const userId = getUserIdFromAuth(req);
    const keys = USER_SAVED_KEYS.get(userId) || {};
    res.json({
      has_groq: Boolean(keys.groq_key),
      has_tavily: Boolean(keys.tavily_key),
    });
  });

  // Vite development middleware or production static serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`StudyRot Full-stack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
