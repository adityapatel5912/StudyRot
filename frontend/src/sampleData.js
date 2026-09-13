/**
 * Sandboxed Static Data for Ephemeral Demo Tours Only.
 * Notice: Likes start at 0. Never injected into real feeds.
 */

export const SANDBOX_FEED_POSTS = [
  {
    id: 'demo-sandbox-0',
    type: 'key_point',
    title: 'Reflection & Cartesian Sign Convention',
    body: 'For concave mirrors, focal length $f$ is negative. For convex mirrors, $f$ is always positive according to standard Cartesian sign convention.',
    analogy: 'Think of the pole as the origin $(0,0)$ on the Cartesian coordinate plane.',
    diagram: `<svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="opticsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1e3a6b" />
          <stop offset="100%" stop-color="#3b82f6" />
        </linearGradient>
      </defs>
      <rect width="400" height="240" rx="12" fill="#f8fafc"/>
      <line x1="40" y1="120" x2="360" y2="120" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4,4"/>
      <path d="M 280 40 Q 240 120 280 200" stroke="#1e3a6b" stroke-width="6" fill="none"/>
      <circle cx="200" cy="120" r="5" fill="#ef4444"/>
      <text x="195" y="145" font-family="Inter, sans-serif" font-size="12" font-weight="bold" fill="#ef4444">Focus (F)</text>
      <circle cx="260" cy="120" r="5" fill="#1e3a6b"/>
      <text x="250" y="145" font-family="Inter, sans-serif" font-size="12" font-weight="bold" fill="#1e3a6b">Pole (P)</text>
    </svg>`,
    grade: 10,
    subject: 'Science',
    source_ref: 'NCERT Class 10 Science Ch 10 — Light',
    hashtags: ['#CBSE', '#LightReflection', '#Physics10'],
    engagement: { likes: 0, comments: [] },
  },
  {
    id: 'demo-sandbox-1',
    type: 'formula',
    title: 'Mirror Formula & Linear Magnification',
    body: 'The mirror formula relates object distance $u$, image distance $v$, and focal length $f$:\n$$\\frac{1}{f} = \\frac{1}{v} + \\frac{1}{u}$$\nMagnification is $m = -\\frac{v}{u} = \\frac{h_i}{h_o}$.',
    analogy: 'Notice the minus sign in mirror magnification! Lens formula uses opposite signs.',
    grade: 10,
    subject: 'Science',
    source_ref: 'NCERT Class 10 Science Ch 10 — Light',
    hashtags: ['#MirrorFormula', '#Numericals'],
    engagement: { likes: 0, comments: [] },
  },
  {
    id: 'demo-sandbox-2',
    type: 'quiz',
    title: 'Board Exam Challenge: Rear-View Mirrors',
    body: 'Test your understanding of image formation in vehicle mirrors.',
    quiz: {
      question: 'Why are convex mirrors used as rear-view mirrors in automobiles?',
      options: [
        'They always produce erect, diminished images with a wider field of view',
        'They produce inverted, magnified images for close inspection',
        'They have zero chromatic aberration in daylight',
        'They reflect 100% of incident light without absorption'
      ],
      answer: 'They always produce erect, diminished images with a wider field of view',
      explanation: 'Convex mirrors curve outwards, giving the driver a much wider field of view than a plane mirror.'
    },
    grade: 10,
    subject: 'Science',
    source_ref: 'NCERT Class 10 Science Ch 10 — Light',
    hashtags: ['#Quiz', '#BoardExam'],
    engagement: { likes: 0, comments: [] },
  },
  {
    id: 'demo-sandbox-3',
    type: 'exam_tip',
    title: '3-Mark Board Marking Scheme Tip',
    body: 'In CBSE board numericals, ALWAYS draw ray arrows indicating propagation direction before writing calculations. Missing direction arrows costs 0.5 to 1 full mark.',
    analogy: 'Arrows turn geometry into physics. Don\'t lose free presentation marks!',
    grade: 10,
    subject: 'Science',
    source_ref: 'NCERT Class 10 Science Ch 10 — Light',
    hashtags: ['#ExamTip', '#ToppersSecret'],
    engagement: { likes: 0, comments: [] },
  }
];

export const SANDBOX_REVIEW_CARDS = [
  {
    card_id: 'sandbox-card-1',
    subject: 'Science',
    grade: 10,
    topic: 'Light — Reflection',
    title: 'Concave vs Convex Focal Sign',
    fact: 'Focal length of concave mirror is always negative (-f); convex mirror is positive (+f).',
    retrievability_pct: 68,
  },
  {
    card_id: 'sandbox-card-2',
    subject: 'Science',
    grade: 10,
    topic: 'Electricity',
    title: "Ohm's Law Condition",
    fact: 'V = IR applies strictly at constant temperature and physical dimensions.',
    retrievability_pct: 82,
  },
  {
    card_id: 'sandbox-card-3',
    subject: 'Maths',
    grade: 10,
    topic: 'Trigonometry',
    title: 'Pythagorean Trigonometric Identity',
    fact: 'sin^2(theta) + cos^2(theta) = 1 for all 0 <= theta <= 90 deg.',
    retrievability_pct: 94,
  },
];
