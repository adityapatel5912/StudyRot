"""
Builds pre-baked feeds 3, 4, 5, and 6:
- maths-12-parabola.json
- maths-10-trigonometry.json
- sst-10-nationalism-in-india.json
- sst-10-resources-and-development.json
"""

import json
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
BACKEND_DEMO = ROOT_DIR / "backend" / "data" / "demo-feeds"
FRONTEND_DEMO = ROOT_DIR / "frontend" / "public" / "demo-feeds"

# 3. Maths 12 Parabola
maths_12_posts = [
    {
        "id": "m12_1",
        "type": "key_point",
        "title": "Standard Equation of Parabola: $y^2 = 4ax$",
        "body": "A parabola is the locus of a point whose distance from a fixed point (focus) strictly equals its perpendicular distance from a fixed straight line (directrix). Its eccentricity is identically $e = 1$.",
        "analogy": "",
        "quiz": None,
        "diagram": '<svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg"><line x1="20" y1="110" x2="380" y2="110" stroke="#0f1e3d" stroke-width="2"/><line x1="140" y1="20" x2="140" y2="200" stroke="#0f1e3d" stroke-width="2"/><line x1="80" y1="20" x2="80" y2="200" stroke="#e63946" stroke-width="2" stroke-dasharray="4,4"/><path d="M 320,30 Q 140,110 320,190" fill="none" stroke="#1e3a6b" stroke-width="3"/><circle cx="200" cy="110" r="4" fill="#22c55e"/><text x="195" y="135" font-family="system-ui, sans-serif" font-size="12" fill="#22c55e" font-weight="700">F(a, 0)</text><text x="50" y="45" font-family="system-ui, sans-serif" font-size="11" fill="#e63946" font-weight="700">x = -a</text></svg>',
        "hashtags": ["#Parabola", "#Class12Maths", "#ConicSections"],
        "source_ref": "NCERT Class 11/12 Maths Ch 11 Section 11.2",
        "grade": 12,
        "subject": "Maths",
        "engagement": {"likes": 115, "comments": [], "seed_comment": "Vertex is always at (0,0) for standard form."}
    },
    {
        "id": "m12_2",
        "type": "analogy",
        "title": "ISRO Satellite Dishes & Dish Antennas",
        "body": "Every Tata Play DTH dish and ISRO deep-space ground antenna uses a paraboloid of revolution. Signals from geostationary satellites arrive as parallel rays and reflect inward to concentrate at the receiver located at the focus.",
        "analogy": "Parallel rays bounce off any parabolic reflector to converge at the exact same focus point $F(a, 0)$.",
        "quiz": None,
        "diagram": '<svg viewBox="0 0 400 180" xmlns="http://www.w3.org/2000/svg"><path d="M 300,20 Q 160,90 300,160" fill="none" stroke="#0f1e3d" stroke-width="4"/><circle cx="210" cy="90" r="6" fill="#e63946"/><line x1="360" y1="40" x2="270" y2="40" stroke="#22c55e" stroke-width="2"/><line x1="270" y1="40" x2="210" y2="90" stroke="#22c55e" stroke-width="2"/><line x1="360" y1="140" x2="270" y2="140" stroke="#22c55e" stroke-width="2"/><line x1="270" y1="140" x2="210" y2="90" stroke="#22c55e" stroke-width="2"/><text x="200" y="115" font-size="11" fill="#e63946" font-weight="bold">Receiver (Focus)</text></svg>',
        "hashtags": ["#ReflectiveProperty", "#ISROPhysics", "#AntennaOptics"],
        "source_ref": "NCERT Class 11/12 Maths Ch 11 Application",
        "grade": 12,
        "subject": "Maths",
        "engagement": {"likes": 140, "comments": [], "seed_comment": "Same principle for car headlights in reverse!"}
    },
    {
        "id": "m12_3",
        "type": "quiz",
        "title": "Board MCQ: Latus Rectum of $y^2 = 12x$",
        "body": "Test your rapid evaluation of focal chord parameters.",
        "analogy": "",
        "quiz": {
            "question": "What is the length of the latus rectum for the parabola $y^2 = 12x$?",
            "options": [
                "$12$",
                "$3$",
                "$6$",
                "$24$"
            ],
            "answer": "$12$",
            "explanation": "Comparing $y^2 = 12x$ with standard form $y^2 = 4ax$, we have $4a = 12$. The length of latus rectum is $4a = 12$."
        },
        "diagram": "",
        "hashtags": ["#LatusRectum", "#ConicsMCQ", "#Class12Board"],
        "source_ref": "NCERT Class 11/12 Maths Ch 11 Section 11.2",
        "grade": 12,
        "subject": "Maths",
        "engagement": {"likes": 98, "comments": [], "seed_comment": "Semi latus rectum would be 2a = 6."}
    },
    {
        "id": "m12_4",
        "type": "formula",
        "title": "Four Standard Forms of Parabola",
        "body": "(1) $y^2 = 4ax$: opens right, focus $(a, 0)$, directrix $x = -a$. (2) $y^2 = -4ax$: opens left, focus $(-a, 0)$, directrix $x = a$. (3) $x^2 = 4ay$: opens up, focus $(0, a)$, directrix $y = -a$. (4) $x^2 = -4ay$: opens down, focus $(0, -a)$, directrix $y = a$.",
        "analogy": "",
        "quiz": None,
        "diagram": '<svg viewBox="0 0 380 180" xmlns="http://www.w3.org/2000/svg"><rect x="30" y="20" width="150" height="140" rx="10" fill="#f7f9fc" stroke="#1e3a6b" stroke-width="2"/><text x="105" y="55" fill="#1e3a6b" font-weight="bold" font-size="13" text-anchor="middle">y² = 4ax</text><text x="105" y="85" fill="#0f1e3d" font-size="12" text-anchor="middle">Focus: (a, 0)</text><text x="105" y="115" fill="#4f6ba0" font-size="12" text-anchor="middle">Directrix: x = -a</text><rect x="200" y="20" width="150" height="140" rx="10" fill="#f7f9fc" stroke="#22c55e" stroke-width="2"/><text x="275" y="55" fill="#22c55e" font-weight="bold" font-size="13" text-anchor="middle">x² = 4ay</text><text x="275" y="85" fill="#0f1e3d" font-size="12" text-anchor="middle">Focus: (0, a)</text><text x="275" y="115" fill="#22c55e" font-size="12" text-anchor="middle">Directrix: y = -a</text></svg>',
        "hashtags": ["#ConicFormula", "#CheatSheet", "#MathsRevision"],
        "source_ref": "NCERT Class 11/12 Maths Ch 11 Table 11.1",
        "grade": 12,
        "subject": "Maths",
        "engagement": {"likes": 165, "comments": [], "seed_comment": "Memorize this grid before entering the exam hall."}
    },
    {
        "id": "m12_5",
        "type": "apply",
        "title": "Suspension Bridges: Golden Gate and Bandra-Worli Sea Link",
        "body": "The main suspension cables of bridges like Mumbai's Bandra-Worli Sea Link hang under uniform vertical roadway dead-load in the shape of a parabola. Engineers use $x^2 = 4ay$ to calculate cable tension at varying tower heights.",
        "analogy": "A uniformly loaded string bends into a pure parabolic arc.",
        "quiz": None,
        "diagram": "",
        "hashtags": ["#CivilEngineering", "#BandraWorli", "#AppliedCalculus"],
        "source_ref": "NCERT Class 11/12 Maths Ch 11 Practical Applications",
        "grade": 12,
        "subject": "Maths",
        "engagement": {"likes": 130, "comments": [], "seed_comment": "Freely hanging rope without load is a catenary, but with uniform roadway load it becomes a parabola!"}
    },
    {
        "id": "m12_6",
        "type": "quiz",
        "title": "Board MCQ: Parametric Coordinates of Parabola",
        "body": "Test parametric substitution in calculus integration problems.",
        "analogy": "",
        "quiz": {
            "question": "What are the standard parametric coordinates for any point on the parabola $y^2 = 4ax$?",
            "options": [
                "$(at^2, 2at)$",
                "$(2at, at^2)$",
                "$(a\\cos t, a\\sin t)$",
                "$(at, 2at^2)$"
            ],
            "answer": "$(at^2, 2at)$",
            "explanation": "Substituting $x = at^2$ and $y = 2at$ into $y^2 = (2at)^2 = 4a^2t^2 = 4a(at^2) = 4ax$, satisfying the equation identically for all parameter values $t$."
        },
        "diagram": "",
        "hashtags": ["#ParametricCoordinates", "#CalculusPrep", "#BoardMCQ"],
        "source_ref": "NCERT Class 11/12 Maths Ch 11 Section 11.2",
        "grade": 12,
        "subject": "Maths",
        "engagement": {"likes": 150, "comments": [], "seed_comment": "Crucial for area under curves integration problems in Class 12!"}
    },
    {
        "id": "m12_7",
        "type": "exam_tip",
        "title": "Integration Area Under Curves: Symmetry Doubling",
        "body": "When asked to find the area bounded by $y^2 = 4ax$ and its latus rectum $x = a$, students routinely forget to multiply by 2. The parabola is symmetric across the x-axis, spanning quadrant 1 and quadrant 4.",
        "analogy": "Total Area $= 2 \\times \\int_0^a 2\\sqrt{a}\\sqrt{x}\\,dx = 4\\sqrt{a} \\left[\\frac{2}{3}x^{3/2}\\right]_0^a = \\frac{8}{3}a^2\\text{ sq units}$.",
        "quiz": None,
        "diagram": "",
        "hashtags": ["#CBSETip", "#AreaUnderCurves", "#BoardTrap"],
        "source_ref": "NCERT Class 12 Maths Ch 8 Section 8.2",
        "grade": 12,
        "subject": "Maths",
        "engagement": {"likes": 185, "comments": [], "seed_comment": "Lost 2 marks in pre-boards because I forgot the x2 factor!"}
    },
    {
        "id": "m12_8",
        "type": "recap",
        "title": "Mid-Feed Checkpoint: Focal Chord Properties",
        "body": "Recap: (1) Eccentricity $e = 1$. (2) Latus rectum length is $4a$. (3) Any focal chord with ends $t_1$ and $t_2$ satisfies $t_1 t_2 = -1$. (4) Tangent at vertex is the y-axis ($x = 0$).",
        "analogy": "",
        "quiz": None,
        "diagram": "",
        "hashtags": ["#MidFeedCheckpoint", "#FocalChord", "#MathsRevision"],
        "source_ref": "NCERT Class 11/12 Maths Ch 11 Review",
        "grade": 12,
        "subject": "Maths",
        "engagement": {"likes": 95, "comments": [], "seed_comment": "t1 * t2 = -1 is so useful for coordinate geometry."}
    },
    {
        "id": "m12_9",
        "type": "key_point",
        "title": "Focal Distance of Any Point $P(x_1, y_1)$",
        "body": "For $y^2 = 4ax$, the distance of any point $P(x_1, y_1)$ from the focus $S(a, 0)$ is simply $SP = x_1 + a$. By definition of parabola, $SP$ equals the distance $PM$ to the directrix line $x = -a$, giving $SP = |x_1 - (-a)| = x_1 + a$.",
        "analogy": "",
        "quiz": None,
        "diagram": '<svg viewBox="0 0 380 180" xmlns="http://www.w3.org/2000/svg"><rect x="40" y="30" width="300" height="120" rx="12" fill="#0f1e3d"/><text x="190" y="80" fill="#ffffff" font-size="20" font-family="Inter, sans-serif" text-anchor="middle" font-weight="bold">SP = x₁ + a</text><text x="190" y="115" fill="#22c55e" font-size="13" font-family="Inter, sans-serif" text-anchor="middle">Focal distance depends only on x-coordinate</text></svg>',
        "hashtags": ["#FocalDistance", "#GeometryTrick", "#Class12Maths"],
        "source_ref": "NCERT Class 11/12 Maths Ch 11 Section 11.2",
        "grade": 12,
        "subject": "Maths",
        "engagement": {"likes": 122, "comments": [], "seed_comment": "No square roots needed to compute distance from focus!"}
    },
    {
        "id": "m12_10",
        "type": "myth_buster",
        "title": "Myth: A Parabola and a Catenary are the Same Curve",
        "body": "Busted! A cable hanging purely under its own self-weight forms a hyperbolic cosine catenary ($y = c \\cosh(x/c)$). It only becomes a true parabola ($y = ax^2$) when carrying a uniform horizontal load, such as a bridge deck.",
        "analogy": "",
        "quiz": None,
        "diagram": "",
        "hashtags": ["#MythBuster", "#CalculusTruth", "#EngineeringMaths"],
        "source_ref": "NCERT Class 11/12 Maths Conic Appendix",
        "grade": 12,
        "subject": "Maths",
        "engagement": {"likes": 140, "comments": [], "seed_comment": "Galileo initially thought it was a parabola too!"}
    },
    {
        "id": "m12_11",
        "type": "quiz",
        "title": "Board MCQ: Area Bounded by Parabola & Latus Rectum",
        "body": "Test your evaluation of standard CBSE 5-mark definite integral problem.",
        "analogy": "",
        "quiz": {
            "question": "What is the total area bounded by $y^2 = 4ax$ and its latus rectum $x = a$?",
            "options": [
                "$\\frac{8}{3}a^2$",
                "$\\frac{4}{3}a^2$",
                "$\\frac{16}{3}a^2$",
                "$4a^2$"
            ],
            "answer": "$\\frac{8}{3}a^2$",
            "explanation": "Area $= 2 \\int_0^a 2\\sqrt{a}\\sqrt{x}\\,dx = 4\\sqrt{a} \\left[\\frac{2}{3}x^{3/2}\\right]_0^a = \\frac{8}{3}a^2\\text{ sq units}$."
        },
        "diagram": "",
        "hashtags": ["#DefiniteIntegrals", "#AreaCalculation", "#BoardMCQ"],
        "source_ref": "NCERT Class 12 Maths Ch 8 Exercise 8.1",
        "grade": 12,
        "subject": "Maths",
        "engagement": {"likes": 170, "comments": [], "seed_comment": "Standard result, can be used to crosscheck 5-mark answers."}
    },
    {
        "id": "m12_12",
        "type": "formula",
        "title": "Tangent in Slope Form: $y = mx + \\frac{a}{m}$",
        "body": "The straight line $y = mx + c$ touches the parabola $y^2 = 4ax$ if and only if $c = \\frac{a}{m}$. The point of contact in terms of slope $m$ is $\\left(\\frac{a}{m^2}, \\frac{2a}{m}\\right)$.",
        "analogy": "",
        "quiz": None,
        "diagram": '<svg viewBox="0 0 380 180" xmlns="http://www.w3.org/2000/svg"><rect x="40" y="30" width="300" height="120" rx="12" fill="#0f1e3d"/><text x="190" y="75" fill="#ffffff" font-size="18" font-family="Inter, sans-serif" text-anchor="middle" font-weight="bold">y = mx + a/m</text><text x="190" y="110" fill="#22c55e" font-size="13" font-family="Inter, sans-serif" text-anchor="middle">Point of contact: (a/m², 2a/m)</text></svg>',
        "hashtags": ["#TangentFormula", "#SlopeForm", "#ConicsGeometry"],
        "source_ref": "NCERT Class 11/12 Maths Ch 11 Tangents",
        "grade": 12,
        "subject": "Maths",
        "engagement": {"likes": 155, "comments": [], "seed_comment": "Notice m cannot be zero (tangent would be horizontal)."}
    },
    {
        "id": "m12_13",
        "type": "quiz",
        "title": "Board MCQ: Locus of Perpendicular Tangents (Director Circle)",
        "body": "Test your conceptual mastery of conic intersections.",
        "analogy": "",
        "quiz": {
            "question": "The locus of the point of intersection of two perpendicular tangents to the parabola $y^2 = 4ax$ is:",
            "options": [
                "Its directrix ($x = -a$)",
                "Its axis ($y = 0$)",
                "The latus rectum ($x = a$)",
                "A circle of radius $2a$"
            ],
            "answer": "Its directrix ($x = -a$)",
            "explanation": "Perpendicular tangents have product of slopes $m_1 m_2 = -1$. The equation becomes $x = -a$, proving that tangents intersect at right angles on the directrix (the director circle degenerates into a straight line)."
        },
        "diagram": "",
        "hashtags": ["#DirectorCircle", "#PerpendicularTangents", "#ConicProperty"],
        "source_ref": "NCERT Class 11/12 Maths Ch 11 Theorem",
        "grade": 12,
        "subject": "Maths",
        "engagement": {"likes": 165, "comments": [], "seed_comment": "One of the most elegant geometric results in maths!"}
    },
    {
        "id": "m12_14",
        "type": "summary",
        "title": "Parabola Revision Deck Complete",
        "body": "Parabola mastery achieved! Remember: (1) Standard form $y^2 = 4ax$, (2) Latus rectum $= 4a$, (3) Parametric point is $(at^2, 2at)$, (4) Area bounded by latus rectum is $\\frac{8}{3}a^2$, and (5) Perpendicular tangents meet on the directrix $x = -a$.",
        "analogy": "",
        "quiz": None,
        "diagram": "",
        "hashtags": ["#ParabolaComplete", "#Class12Topper", "#StudyRotRevision"],
        "source_ref": "NCERT Class 11/12 Maths Ch 11 Summary",
        "grade": 12,
        "subject": "Maths",
        "engagement": {"likes": 230, "comments": [], "seed_comment": "Solid revision deck for board exams!"}
    }
]

# 4. Maths 10 Trigonometry
maths_10_posts = [
    {
        "id": "trig10_1",
        "type": "key_point",
        "title": "The Core Ratios in a Right-Angled Triangle",
        "body": "In a right-angled triangle $ABC$ with acute angle $\\theta$: $\\sin\\theta = \\frac{\\text{Perpendicular}}{\\text{Hypotenuse}}$, $\\cos\\theta = \\frac{\\text{Base}}{\\text{Hypotenuse}}$, and $\\tan\\theta = \\frac{\\text{Perpendicular}}{\\text{Base}}$.",
        "analogy": "",
        "quiz": None,
        "diagram": '<svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg"><polygon points="60,180 300,180 300,40" fill="#f7f9fc" stroke="#0f1e3d" stroke-width="3"/><text x="180" y="200" font-size="12" fill="#0f1e3d" font-weight="bold">Base (b)</text><text x="315" y="110" font-size="12" fill="#0f1e3d" font-weight="bold">Perpendicular (p)</text><text x="160" y="95" font-size="12" fill="#e63946" font-weight="bold">Hypotenuse (h)</text><path d="M 100,180 Q 95,160 85,165" fill="none" stroke="#22c55e" stroke-width="2"/><text x="105" y="165" font-size="12" fill="#22c55e" font-weight="bold">θ</text></svg>',
        "hashtags": ["#Trigonometry", "#RightTriangle", "#Class10Maths"],
        "source_ref": "NCERT Class 10 Maths Ch 8 Section 8.2",
        "grade": 10,
        "subject": "Maths",
        "engagement": {"likes": 140, "comments": [], "seed_comment": "Pandit Badri Prasad Har Har Bole mnemonic!"}
    },
    {
        "id": "trig10_2",
        "type": "analogy",
        "title": "Pyramid Shadows in Giza & Qutub Minar Heights",
        "body": "Ancient mathematician Thales calculated pyramid heights by measuring their shadows when his own shadow equaled his height (at $\\theta = 45^\\circ$, where $\\tan 45^\\circ = 1$). Today, Indian surveyors use the same angle of elevation to measure the $72.5\\text{ m}$ Qutub Minar without climbing it.",
        "analogy": "When angle of elevation is $45^\\circ$, shadow length equals tower height exactly.",
        "quiz": None,
        "diagram": "",
        "hashtags": ["#HeightsAndDistances", "#QutubMinar", "#RealWorldMaths"],
        "source_ref": "NCERT Class 10 Maths Ch 9 Section 9.1",
        "grade": 10,
        "subject": "Maths",
        "engagement": {"likes": 125, "comments": [], "seed_comment": "tan 45 = 1 makes life so easy!"}
    },
    {
        "id": "trig10_3",
        "type": "quiz",
        "title": "Board MCQ: Pythagorean Identity",
        "body": "Test your recognition of the core trigonometric identity.",
        "analogy": "",
        "quiz": {
            "question": "For any acute angle $\\theta$, what is the exact value of $\\sin^2\\theta + \\cos^2\\theta$?",
            "options": [
                "$1$",
                "$0$",
                "$\\tan\\theta$",
                "$2$"
            ],
            "answer": "$1$",
            "explanation": "From the Pythagorean theorem $p^2 + b^2 = h^2$. Dividing both sides by $h^2$ gives $(p/h)^2 + (b/h)^2 = 1 \\implies \\sin^2\\theta + \\cos^2\\theta = 1$."
        },
        "diagram": "",
        "hashtags": ["#TrigIdentity", "#BoardMCQ", "#Class10Maths"],
        "source_ref": "NCERT Class 10 Maths Ch 8 Section 8.5",
        "grade": 10,
        "subject": "Maths",
        "engagement": {"likes": 160, "comments": [], "seed_comment": "The most famous identity in trigonometry."}
    },
    {
        "id": "trig10_4",
        "type": "key_point",
        "title": "The Golden Angle Table: $0^\\circ, 30^\\circ, 45^\\circ, 60^\\circ, 90^\\circ$",
        "body": "Remember sine values using the $\\sqrt{n}/2$ rule for $n = 0, 1, 2, 3, 4$: $\\sin 0^\\circ = 0$, $\\sin 30^\\circ = 1/2$, $\\sin 45^\\circ = 1/\\sqrt{2}$, $\\sin 60^\\circ = \\sqrt{3}/2$, and $\\sin 90^\\circ = 1$. Cosine is the exact reverse sequence.",
        "analogy": "",
        "quiz": None,
        "diagram": '<svg viewBox="0 0 380 180" xmlns="http://www.w3.org/2000/svg"><rect x="30" y="20" width="320" height="140" rx="10" fill="#0f1e3d"/><text x="60" y="55" fill="#22c55e" font-size="12" font-weight="bold">θ</text><text x="120" y="55" fill="#ffffff" font-size="12">30°</text><text x="190" y="55" fill="#ffffff" font-size="12">45°</text><text x="260" y="55" fill="#ffffff" font-size="12">60°</text><text x="320" y="55" fill="#ffffff" font-size="12">90°</text><text x="60" y="95" fill="#22c55e" font-size="12" font-weight="bold">sin</text><text x="120" y="95" fill="#ffffff" font-size="12">1/2</text><text x="190" y="95" fill="#ffffff" font-size="12">1/√2</text><text x="260" y="95" fill="#ffffff" font-size="12">√3/2</text><text x="320" y="95" fill="#ffffff" font-size="12">1</text><text x="60" y="135" fill="#22c55e" font-size="12" font-weight="bold">cos</text><text x="120" y="135" fill="#ffffff" font-size="12">√3/2</text><text x="190" y="135" fill="#ffffff" font-size="12">1/√2</text><text x="260" y="135" fill="#ffffff" font-size="12">1/2</text><text x="320" y="135" fill="#ffffff" font-size="12">0</text></svg>',
        "hashtags": ["#TrigTable", "#QuickRecall", "#BoardPrep"],
        "source_ref": "NCERT Class 10 Maths Ch 8 Table 8.1",
        "grade": 10,
        "subject": "Maths",
        "engagement": {"likes": 195, "comments": [], "seed_comment": "sqrt(n)/2 trick never fails!"}
    },
    {
        "id": "trig10_5",
        "type": "apply",
        "title": "Sundials at Jantar Mantar, Jaipur",
        "body": "The Vrihat Samrat Yantra at Jaipur's Jantar Mantar is a massive $27\\text{ m}$ high right-angled triangular gnomon. By calculating shadow lengths with $\\tan\\theta$, Maharaja Sawai Jai Singh II measured local solar time to an accuracy of 2 seconds!",
        "analogy": "Nature's giant trigonometric calculator etched in stone and sunlight.",
        "quiz": None,
        "diagram": "",
        "hashtags": ["#JantarMantar", "#JaipurHeritage", "#SolarTime"],
        "source_ref": "NCERT Class 10 Maths Ch 9 Indian Heritage Note",
        "grade": 10,
        "subject": "Maths",
        "engagement": {"likes": 150, "comments": [], "seed_comment": "Visited Jantar Mantar last year, mind blowing precision!"}
    },
    {
        "id": "trig10_6",
        "type": "quiz",
        "title": "Board MCQ: Height of Pole from Shadow",
        "body": "Standard CBSE 1-mark application question.",
        "analogy": "",
        "quiz": {
            "question": "If a vertical pole of height $6\\text{ m}$ casts a shadow of $2\\sqrt{3}\\text{ m}$ on the ground, what is the Sun's elevation angle?",
            "options": [
                "$60^\\circ$",
                "$30^\\circ$",
                "$45^\\circ$",
                "$90^\\circ$"
            ],
            "answer": "$60^\\circ$",
            "explanation": "$\\tan\\theta = \\frac{\\text{height}}{\\text{shadow}} = \\frac{6}{2\\sqrt{3}} = \\frac{3}{\\sqrt{3}} = \\sqrt{3}$. Since $\\tan 60^\\circ = \\sqrt{3}$, the angle is $60^\\circ$."
        },
        "diagram": "",
        "hashtags": ["#ElevationAngle", "#CBSEBoard2024", "#MCQ"],
        "source_ref": "NCERT Class 10 Maths Ch 9 Exercise 9.1",
        "grade": 10,
        "subject": "Maths",
        "engagement": {"likes": 180, "comments": [], "seed_comment": "Appears almost every year in CBSE sets!"}
    },
    {
        "id": "trig10_7",
        "type": "exam_tip",
        "title": "Angle of Depression vs Angle of Elevation Trap",
        "body": "CBSE examiners frequently deduct marks when students draw the angle of depression measured from the vertical building wall instead of the horizontal sightline.",
        "analogy": "The angle of depression is ALWAYS measured downward from a HORIZONTAL line of sight, and equals the alternate interior angle of elevation at the target point.",
        "quiz": None,
        "diagram": "",
        "hashtags": ["#DepressionAngle", "#ExaminerTrap", "#CBSEMarks"],
        "source_ref": "NCERT Class 10 Maths Ch 9 Section 9.1",
        "grade": 10,
        "subject": "Maths",
        "engagement": {"likes": 165, "comments": [], "seed_comment": "Always draw the horizontal dotted line first!"}
    },
    {
        "id": "trig10_8",
        "type": "recap",
        "title": "Mid-Feed Checkpoint: The 3 Pythagorean Identities",
        "body": "Lock these 3 identities into muscle memory: (1) $\\sin^2\\theta + \\cos^2\\theta = 1$, (2) $1 + \\tan^2\\theta = \\sec^2\\theta \\implies \\sec^2\\theta - \\tan^2\\theta = 1$, (3) $1 + \\cot^2\\theta = \\csc^2\\theta \\implies \\csc^2\\theta - \\cot^2\\theta = 1$.",
        "analogy": "",
        "quiz": None,
        "diagram": "",
        "hashtags": ["#IdentitiesRecap", "#RevisionCard", "#CBSE10"],
        "source_ref": "NCERT Class 10 Maths Ch 8 Section 8.5",
        "grade": 10,
        "subject": "Maths",
        "engagement": {"likes": 135, "comments": [], "seed_comment": "sec^2 - tan^2 = 1 is super useful for algebraic factorization."}
    },
    {
        "id": "trig10_9",
        "type": "key_point",
        "title": "Factorization Trick: $\\sec\\theta - \\tan\\theta = \\frac{1}{\\sec\\theta + \\tan\\theta}$",
        "body": "Because $\\sec^2\\theta - \\tan^2\\theta = 1$, difference of squares gives $(\\sec\\theta - \\tan\\theta)(\\sec\\theta + \\tan\\theta) = 1$. If $\\sec\\theta + \\tan\\theta = p$, then $\\sec\\theta - \\tan\\theta = 1/p$ automatically!",
        "analogy": "",
        "quiz": None,
        "diagram": '<svg viewBox="0 0 380 180" xmlns="http://www.w3.org/2000/svg"><rect x="40" y="30" width="300" height="120" rx="12" fill="#0f1e3d"/><text x="190" y="75" fill="#ffffff" font-size="18" font-family="Inter, sans-serif" text-anchor="middle" font-weight="bold">sec θ - tan θ = 1 / (sec θ + tan θ)</text><text x="190" y="115" fill="#22c55e" font-size="13" font-family="Inter, sans-serif" text-anchor="middle">Adding both yields: 2 sec θ = p + 1/p</text></svg>',
        "hashtags": ["#ProvingIdentities", "#MathsShortcut", "#CBSETopper"],
        "source_ref": "NCERT Class 10 Maths Ch 8 Exemplar",
        "grade": 10,
        "subject": "Maths",
        "engagement": {"likes": 205, "comments": [], "seed_comment": "Solved a 4-mark board proof in 3 steps with this!"}
    },
    {
        "id": "trig10_10",
        "type": "myth_buster",
        "title": "Myth: $\\sin(\\theta)$ Means $\\sin$ Multiplied by $\\theta$",
        "body": "Busted! The abbreviation 'sin' is NOT an algebraic multiplier; it is a mathematical function operating on an angle. $\\sin$ separated from $\\theta$ has no meaning whatsoever. $\\sin(A + B) \\ne \\sin A + \\sin B$!",
        "analogy": "",
        "quiz": None,
        "diagram": "",
        "hashtags": ["#MythBuster", "#FunctionNotation", "#CommonMistake"],
        "source_ref": "NCERT Class 10 Maths Ch 8 Section 8.2 Note",
        "grade": 10,
        "subject": "Maths",
        "engagement": {"likes": 175, "comments": [], "seed_comment": "So many students cancel out sin in numerators and denominators!"}
    },
    {
        "id": "trig10_11",
        "type": "quiz",
        "title": "Board MCQ: Value of $\\sin 30^\\circ + \\cos 60^\\circ$",
        "body": "Direct numeric substitution from standard trigonometric table.",
        "analogy": "",
        "quiz": {
            "question": "What is the numerical value of $\\sin 30^\\circ + \\cos 60^\\circ$?",
            "options": [
                "$1$",
                "$\\frac{1}{2}$",
                "$\\frac{\\sqrt{3}}{2}$",
                "$\\sqrt{2}$"
            ],
            "answer": "$1$",
            "explanation": "$\\sin 30^\\circ = 1/2$ and $\\cos 60^\\circ = 1/2$. Their sum is $1/2 + 1/2 = 1$."
        },
        "diagram": "",
        "hashtags": ["#AngleValues", "#TableLookup", "#BoardMCQ"],
        "source_ref": "NCERT Class 10 Maths Ch 8 Exercise 8.2",
        "grade": 10,
        "subject": "Maths",
        "engagement": {"likes": 150, "comments": [], "seed_comment": "Fastest 1 mark in Section A."}
    },
    {
        "id": "trig10_12",
        "type": "formula",
        "title": "Reciprocal and Quotient Relations",
        "body": "Reciprocal pairs: $\\csc\\theta = \\frac{1}{\\sin\\theta}$, $\\sec\\theta = \\frac{1}{\\cos\\theta}$, and $\\cot\\theta = \\frac{1}{\\tan\\theta}$. Quotient pairs: $\\tan\\theta = \\frac{\\sin\\theta}{\\cos\\theta}$ and $\\cot\\theta = \\frac{\\cos\\theta}{\\sin\\theta}$.",
        "analogy": "",
        "quiz": None,
        "diagram": '<svg viewBox="0 0 380 180" xmlns="http://www.w3.org/2000/svg"><rect x="30" y="20" width="150" height="140" rx="10" fill="#f7f9fc" stroke="#1e3a6b" stroke-width="2"/><text x="105" y="55" fill="#1e3a6b" font-weight="bold" font-size="13" text-anchor="middle">RECIPROCALS</text><text x="105" y="85" fill="#0f1e3d" font-size="12" text-anchor="middle">csc θ = 1 / sin θ</text><text x="105" y="115" fill="#0f1e3d" font-size="12" text-anchor="middle">sec θ = 1 / cos θ</text><rect x="200" y="20" width="150" height="140" rx="10" fill="#f7f9fc" stroke="#22c55e" stroke-width="2"/><text x="275" y="55" fill="#22c55e" font-weight="bold" font-size="13" text-anchor="middle">QUOTIENTS</text><text x="275" y="85" fill="#0f1e3d" font-size="12" text-anchor="middle">tan θ = sin θ / cos θ</text><text x="275" y="115" fill="#0f1e3d" font-size="12" text-anchor="middle">cot θ = cos θ / sin θ</text></svg>',
        "hashtags": ["#FormulaSummary", "#CheatSheet", "#NCERTTrigonometry"],
        "source_ref": "NCERT Class 10 Maths Ch 8 Summary",
        "grade": 10,
        "subject": "Maths",
        "engagement": {"likes": 185, "comments": [], "seed_comment": "Essential when converting equations into sines and cosines."}
    },
    {
        "id": "trig10_13",
        "type": "quiz",
        "title": "Board MCQ: Identity Involving Tangent and Secant",
        "body": "Identify the correct algebraic rearrangement of trigonometric identity.",
        "analogy": "",
        "quiz": {
            "question": "If $\\tan\\theta = \\frac{4}{3}$, then what is the value of $\\sec\\theta$ for acute angle $\\theta$?",
            "options": [
                "$\\frac{5}{3}$",
                "$\\frac{3}{5}$",
                "$\\frac{5}{4}$",
                "$\\frac{7}{3}$"
            ],
            "answer": "$\\frac{5}{3}$",
            "explanation": "$\\sec^2\\theta = 1 + \\tan^2\\theta = 1 + (16/9) = 25/9 \\implies \\sec\\theta = \\sqrt{25/9} = 5/3$."
        },
        "diagram": "",
        "hashtags": ["#345Triangle", "#TrigRatio", "#BoardMCQ"],
        "source_ref": "NCERT Class 10 Maths Ch 8 Section 8.5",
        "grade": 10,
        "subject": "Maths",
        "engagement": {"likes": 160, "comments": [], "seed_comment": "Recognize the 3-4-5 right triangle triplet immediately!"}
    },
    {
        "id": "trig10_14",
        "type": "summary",
        "title": "Trigonometry Chapter Complete",
        "body": "Congratulations on completing Class 10 Trigonometry! You've mastered: ratio definitions, the 5 standard angles, the 3 Pythagorean identities, algebraic factorization tricks, and angles of elevation in height problems.",
        "analogy": "",
        "quiz": None,
        "diagram": "",
        "hashtags": ["#TrigComplete", "#BoardReady2026", "#Class10Maths"],
        "source_ref": "NCERT Class 10 Maths Ch 8 & 9 Summary",
        "grade": 10,
        "subject": "Maths",
        "engagement": {"likes": 240, "comments": [], "seed_comment": "Full marks on trigonometry guaranteed!"}
    }
]

# 5. SST 10 Nationalism in India
sst_10_nationalism = [
    {
        "id": "sst10_1",
        "type": "key_point",
        "title": "The Rowlatt Act (1919) & Black Act",
        "body": "Passed hurriedly through the Imperial Legislative Council despite united Indian opposition. It armed the British colonial government with enormous powers to repress political activities and allowed detention of political prisoners without trial for up to 2 years.",
        "analogy": "",
        "quiz": None,
        "diagram": '<svg viewBox="0 0 400 180" xmlns="http://www.w3.org/2000/svg"><rect x="40" y="30" width="320" height="120" rx="10" fill="#0f1e3d"/><text x="200" y="70" fill="#e63946" font-size="16" font-weight="bold" text-anchor="middle">Rowlatt Act (March 1919)</text><text x="200" y="105" fill="#ffffff" font-size="13" text-anchor="middle">Detention without trial for 2 years</text><text x="200" y="130" fill="#4f6ba0" font-size="11" text-anchor="middle">Triggered nationwide Satyagraha Hartal</text></svg>',
        "hashtags": ["#RowlattAct", "#History10", "#CBSEHistory"],
        "source_ref": "NCERT India & Contemporary World II — Ch 2 Section 1.1",
        "grade": 10,
        "subject": "SST",
        "engagement": {"likes": 120, "comments": [], "seed_comment": "Mahatma Gandhi organized a nationwide hartal on 6 April 1919."}
    },
    {
        "id": "sst10_2",
        "type": "analogy",
        "title": "Satyagraha is Soul-Force, Not Passive Resistance",
        "body": "Gandhiji insisted Satyagraha is not passive weakness; it is the weapon of the morally strongest. It does not inflict pain upon the adversary, but appeals to their conscience through self-suffering and unyielding adherence to truth.",
        "analogy": "Like an unbreakable banyan tree standing steadfast against cyclone winds without striking back.",
        "quiz": None,
        "diagram": "",
        "hashtags": ["#Satyagraha", "#MahatmaGandhi", "#Ahimsa"],
        "source_ref": "NCERT Class 10 History Ch 2 Section 1.1",
        "grade": 10,
        "subject": "SST",
        "engagement": {"likes": 110, "comments": [], "seed_comment": "Champaran, Kheda, Ahmedabad were his first 3 satyagrahas in India."}
    },
    {
        "id": "sst10_3",
        "type": "quiz",
        "title": "Board MCQ: Jallianwala Bagh Massacre Date",
        "body": "Recall key chronological dates in Indian independence movement.",
        "analogy": "",
        "quiz": {
            "question": "On which date did the infamous Jallianwala Bagh massacre take place in Amritsar?",
            "options": [
                "13-Apr-1919",
                "6-Apr-1919",
                "10-May-1857",
                "26-Jan-1930"
            ],
            "answer": "13-Apr-1919",
            "explanation": "On 13 April 1919 (the day of Baisakhi festival), General Dyer blocked exit gates and opened fire on peaceful villagers gathered at Jallianwala Bagh."
        },
        "diagram": "",
        "hashtags": ["#JallianwalaBagh", "#GeneralDyer", "#BoardMCQ"],
        "source_ref": "NCERT Class 10 History Ch 2 Section 1.2",
        "grade": 10,
        "subject": "SST",
        "engagement": {"likes": 160, "comments": [], "seed_comment": "Rabindranath Tagore renounced his knighthood in protest."}
    },
    {
        "id": "sst10_4",
        "type": "timeline",
        "title": "Timeline: Non-Cooperation to Civil Disobedience",
        "body": "(1) 1919: Rowlatt Satyagraha & Jallianwala Bagh. (2) Dec 1920: Nagpur Congress Session adopts Non-Cooperation program. (3) Feb 1922: Chauri Chaura incident halts NCM. (4) Dec 1929: Lahore Congress demands Purna Swaraj. (5) Mar 1930: Salt Dandi March begins.",
        "analogy": "",
        "quiz": None,
        "diagram": '<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg"><line x1="50" y1="100" x2="350" y2="100" stroke="#0f1e3d" stroke-width="3"/><circle cx="80" cy="100" r="8" fill="#e63946"/><text x="80" y="75" font-size="11" font-weight="bold" fill="#e63946" text-anchor="middle">1919</text><text x="80" y="130" font-size="9" fill="#0f1e3d" text-anchor="middle">Rowlatt</text><circle cx="160" cy="100" r="8" fill="#4f6ba0"/><text x="160" y="75" font-size="11" font-weight="bold" fill="#4f6ba0" text-anchor="middle">1920</text><text x="160" y="130" font-size="9" fill="#0f1e3d" text-anchor="middle">NCM</text><circle cx="240" cy="100" r="8" fill="#e63946"/><text x="240" y="75" font-size="11" font-weight="bold" fill="#e63946" text-anchor="middle">1922</text><text x="240" y="130" font-size="9" fill="#0f1e3d" text-anchor="middle">Chauri Chaura</text><circle cx="320" cy="100" r="8" fill="#22c55e"/><text x="320" y="75" font-size="11" font-weight="bold" fill="#22c55e" text-anchor="middle">1930</text><text x="320" y="130" font-size="9" fill="#22c55e" text-anchor="middle">Dandi March</text></svg>',
        "hashtags": ["#HistoryTimeline", "#CBSEChronology", "#NCERTDate"],
        "source_ref": "NCERT Class 10 History Ch 2 Timeline",
        "grade": 10,
        "subject": "SST",
        "engagement": {"likes": 175, "comments": [], "seed_comment": "Memorize these 4 dates for chronological arrangement questions."}
    },
    {
        "id": "sst10_5",
        "type": "apply",
        "title": "Khadi and Boycott of Foreign Cloth in Indian Markets",
        "body": "Between 1921 and 1922, the import of foreign cloth dropped by half from ₹102 crore to ₹57 crore as merchants refused to trade imported goods. Millions took to handspun Khadi produced by local weavers across rural India.",
        "analogy": "The earliest nationwide 'Make in India' and Vocal for Local economic movement.",
        "quiz": None,
        "diagram": "",
        "hashtags": ["#Swadeshi", "#KhadiMovement", "#EconomicBoycott"],
        "source_ref": "NCERT Class 10 History Ch 2 Section 2.1",
        "grade": 10,
        "subject": "SST",
        "engagement": {"likes": 140, "comments": [], "seed_comment": "Foreign cloth bonfires were held in major town squares."}
    },
    {
        "id": "sst10_6",
        "type": "quiz",
        "title": "Board MCQ: Reason for Withdrawing Non-Cooperation",
        "body": "Check textbook accuracy on Gandhiji's sudden strategic withdrawal.",
        "analogy": "",
        "quiz": {
            "question": "Why did Mahatma Gandhi decide to abruptly call off the Non-Cooperation Movement in February 1922?",
            "options": [
                "Violent clash at Chauri Chaura",
                "Arrest of Jawaharlal Nehru",
                "Signing of Gandhi-Irwin Pact",
                "Failure of the Khilafat leaders"
            ],
            "answer": "Violent clash at Chauri Chaura",
            "explanation": "At Chauri Chaura (Gorakhpur, UP), a peaceful demonstration turned violent and protestors burnt a police station killing 22 policemen. Feeling satyagrahis needed proper training in ahimsa, Gandhiji halted the movement."
        },
        "diagram": "",
        "hashtags": ["#ChauriChaura", "#GandhianStrategy", "#BoardMCQ"],
        "source_ref": "NCERT Class 10 History Ch 2 Section 3.1",
        "grade": 10,
        "subject": "SST",
        "engagement": {"likes": 155, "comments": [], "seed_comment": "Many Congress leaders like Subhas Bose were upset by this sudden call-off."}
    },
    {
        "id": "sst10_7",
        "type": "exam_tip",
        "title": "Map Work Checklist: Mandatory Indian History Locations",
        "body": "CBSE Class 10 board exam assigns 2 compulsory marks for locating Indian national movement centers. Locating the wrong state or mislabeling costs full marks.",
        "analogy": "Must locate: (1) Champaran (Bihar) - Indigo planters, (2) Kheda (Gujarat) - Peasant satyagraha, (3) Ahmedabad (Gujarat) - Cotton mill workers, (4) Amritsar (Punjab) - Jallianwala Bagh, (5) Chauri Chaura (UP), (6) Dandi (Gujarat) - Salt March.",
        "quiz": None,
        "diagram": "",
        "hashtags": ["#CBSEMapWork", "#FullMarks", "#HistoryMap"],
        "source_ref": "NCERT Class 10 History Ch 2 Map Work Guidelines",
        "grade": 10,
        "subject": "SST",
        "engagement": {"likes": 215, "comments": [], "seed_comment": "Guaranteed 2 marks every single year!"}
    },
    {
        "id": "sst10_8",
        "type": "recap",
        "title": "Mid-Feed Checkpoint: Different Strands in the Movement",
        "body": "Remember how diverse groups interpreted Swaraj differently: (1) Middle class in towns boycotted schools and courts, (2) Peasants in Awadh led by Baba Ramchandra demanded revenue reduction, (3) Tribals in Gudem Hills led by Alluri Sitaram Raju used guerrilla methods, (4) Plantation workers in Assam demanded freedom of movement.",
        "analogy": "",
        "quiz": None,
        "diagram": "",
        "hashtags": ["#DifferentStrands", "#SocialGroups", "#NCERT10"],
        "source_ref": "NCERT Class 10 History Ch 2 Section 2",
        "grade": 10,
        "subject": "SST",
        "engagement": {"likes": 130, "comments": [], "seed_comment": "Great 5-mark answer structure."}
    },
    {
        "id": "sst10_9",
        "type": "key_point",
        "title": "The Salt March: 240 Miles from Sabarmati to Dandi",
        "body": "On 12 March 1930, Mahatma Gandhi accompanied by 78 trusted volunteers began the historic march spanning 240 miles from Sabarmati Ashram to the coastal town of Dandi in Gujarat, walking 10 miles a day for 24 days to manufacture salt and break colonial monopoly.",
        "analogy": "",
        "quiz": None,
        "diagram": '<svg viewBox="0 0 380 180" xmlns="http://www.w3.org/2000/svg"><rect x="40" y="30" width="300" height="120" rx="12" fill="#0f1e3d"/><text x="190" y="70" fill="#22c55e" font-size="16" font-weight="bold" text-anchor="middle">Dandi Salt March (1930)</text><text x="190" y="100" fill="#ffffff" font-size="12" text-anchor="middle">240 Miles • 24 Days • 78 Volunteers</text><text x="190" y="125" fill="#c8d4ec" font-size="11" text-anchor="middle">Broke Salt Law on 6 April 1930</text></svg>',
        "hashtags": ["#DandiMarch", "#SaltLaw", "#CivilDisobedience"],
        "source_ref": "NCERT Class 10 History Ch 2 Section 3.1",
        "grade": 10,
        "subject": "SST",
        "engagement": {"likes": 185, "comments": [], "seed_comment": "Salt was chosen because rich and poor consumed it equally."}
    },
    {
        "id": "sst10_10",
        "type": "myth_buster",
        "title": "Myth: Non-Cooperation and Civil Disobedience Were Identical",
        "body": "Busted! In Non-Cooperation (1920-22), people were asked ONLY not to cooperate with the British administration. In Civil Disobedience (1930-34), people were asked to actively break colonial laws (like manufacturing salt and refusing chowkidari taxes).",
        "analogy": "",
        "quiz": None,
        "diagram": "",
        "hashtags": ["#MythBuster", "#NCMvsCDM", "#BoardDifference"],
        "source_ref": "NCERT Class 10 History Ch 2 Section 3.1",
        "grade": 10,
        "subject": "SST",
        "engagement": {"likes": 190, "comments": [], "seed_comment": "Very common 3-mark distinction question!"}
    },
    {
        "id": "sst10_11",
        "type": "quiz",
        "title": "Board MCQ: Poona Pact Agreement of 1932",
        "body": "Test your grasp of agreements between national leaders.",
        "analogy": "",
        "quiz": {
            "question": "The Poona Pact of September 1932 between Mahatma Gandhi and Dr. B.R. Ambedkar resulted in:",
            "options": [
                "Reserved seats for Depressed Classes in provincial councils with joint electorates",
                "Separate electorates for Depressed Classes in all elections",
                "Declaration of immediate Dominion Status",
                "Boycott of the Second Round Table Conference"
            ],
            "answer": "Reserved seats for Depressed Classes in provincial councils with joint electorates",
            "explanation": "The Poona Pact gave the Depressed Classes (later Scheduled Castes) reserved seats in provincial and central legislative councils, but they were to be voted in by a joint electorate rather than separate electorates."
        },
        "diagram": "",
        "hashtags": ["#PoonaPact", "#Ambedkar", "#BoardMCQ"],
        "source_ref": "NCERT Class 10 History Ch 2 Section 3.3",
        "grade": 10,
        "subject": "SST",
        "engagement": {"likes": 160, "comments": [], "seed_comment": "Signed at Yerwada Central Jail in Pune."}
    },
    {
        "id": "sst10_12",
        "type": "key_point",
        "title": "Cultural Symbols: Bharat Mata & Tricolour Flag",
        "body": "Nationalism was forged through cultural identity: Bankim Chandra Chattopadhyay wrote 'Vande Mataram' in the 1870s; Abanindranath Tagore painted the iconic visual of Bharat Mata as an ascetic, calm, divine figure dispensing food and cloth.",
        "analogy": "",
        "quiz": None,
        "diagram": '<svg viewBox="0 0 380 180" xmlns="http://www.w3.org/2000/svg"><rect x="30" y="20" width="320" height="140" rx="10" fill="#f7f9fc" stroke="#1e3a6b" stroke-width="2"/><text x="190" y="55" fill="#1e3a6b" font-weight="bold" font-size="14" text-anchor="middle">CULTURAL ROOTS OF NATIONALISM</text><text x="190" y="85" fill="#0f1e3d" font-size="12" text-anchor="middle">Vande Mataram by Bankim Chandra</text><text x="190" y="110" fill="#0f1e3d" font-size="12" text-anchor="middle">Bharat Mata painting by Abanindranath Tagore</text><text x="190" y="135" fill="#22c55e" font-size="12" text-anchor="middle">Swaraj Flag with spinning wheel by Gandhiji (1921)</text></svg>',
        "hashtags": ["#BharatMata", "#VandeMataram", "#SenseOfBelonging"],
        "source_ref": "NCERT Class 10 History Ch 2 Section 4",
        "grade": 10,
        "subject": "SST",
        "engagement": {"likes": 175, "comments": [], "seed_comment": "Reinterpretation of history gave Indians pride in their heritage."}
    },
    {
        "id": "sst10_13",
        "type": "quiz",
        "title": "Board MCQ: Lahore Congress Session President",
        "body": "Historical session where Purna Swaraj was officially proclaimed.",
        "analogy": "",
        "quiz": {
            "question": "Who presided over the historic Lahore Congress session of December 1929 where Purna Swaraj was declared?",
            "options": [
                "Jawaharlal Nehru",
                "Subhas Chandra Bose",
                "Mahatma Gandhi",
                "Motilal Nehru"
            ],
            "answer": "Jawaharlal Nehru",
            "explanation": "In December 1929, under the presidency of Jawaharlal Nehru, the Lahore Congress formalized the demand for 'Purna Swaraj' (Full Independence) and celebrated 26 January 1930 as Independence Day."
        },
        "diagram": "",
        "hashtags": ["#PurnaSwaraj", "#LahoreSession", "#JawaharlalNehru"],
        "source_ref": "NCERT Class 10 History Ch 2 Section 3.1",
        "grade": 10,
        "subject": "SST",
        "engagement": {"likes": 180, "comments": [], "seed_comment": "This is why 26 January was chosen as Republic Day in 1950!"}
    },
    {
        "id": "sst10_14",
        "type": "summary",
        "title": "Nationalism in India Chapter Revision Complete",
        "body": "You mastered the freedom struggle! Remember: (1) Rowlatt Act & Jallianwala Bagh (1919), (2) Non-Cooperation (1920-22), (3) Simon Commission & Lahore Session (1928-29), (4) Salt March & Civil Disobedience (1930), (5) Poona Pact (1932), (6) Cultural symbols of unity.",
        "analogy": "",
        "quiz": None,
        "diagram": "",
        "hashtags": ["#NationalismComplete", "#CBSEHistoryTopper", "#StudyRotNotes"],
        "source_ref": "NCERT Class 10 History Ch 2 Chapter Summary",
        "grade": 10,
        "subject": "SST",
        "engagement": {"likes": 260, "comments": [], "seed_comment": "Best quick revision for Class 10 board exam!"}
    }
]

# 6. SST 10 Resources and Development
sst_10_resources = [
    {
        "id": "res10_1",
        "type": "key_point",
        "title": "Resource Classification & Interdependence",
        "body": "Everything available in our environment that satisfies human needs, is technologically accessible, economically feasible, and culturally acceptable is a resource. Nature, technology, and institutions form an interdependent triangle mediated by human agency.",
        "analogy": "",
        "quiz": None,
        "diagram": '<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg"><polygon points="200,40 320,160 80,160" fill="#f7f9fc" stroke="#0f1e3d" stroke-width="3"/><circle cx="200" cy="120" r="28" fill="#1e3a6b"/><text x="200" y="125" font-size="11" fill="#ffffff" font-weight="bold" text-anchor="middle">HUMAN</text><text x="200" y="30" font-size="12" fill="#0f1e3d" font-weight="bold" text-anchor="middle">Physical Nature</text><text x="325" y="180" font-size="12" fill="#0f1e3d" font-weight="bold" text-anchor="middle">Technology</text><text x="75" y="180" font-size="12" fill="#0f1e3d" font-weight="bold" text-anchor="middle">Institutions</text></svg>',
        "hashtags": ["#Resources", "#Geography10", "#InterdependentTriangle"],
        "source_ref": "NCERT Class 10 Geography Ch 1 Section 1.1",
        "grade": 10,
        "subject": "SST",
        "engagement": {"likes": 115, "comments": [], "seed_comment": "Resources are a function of human activities, not free gifts of nature."}
    },
    {
        "id": "res10_2",
        "type": "analogy",
        "title": "Soil Formation is Like Aging Basmati Rice",
        "body": "It takes millions of years to form soil up to a few centimeters in depth. Parent rock, climate, vegetation, and time slowly decompose minerals. Just like fine aged Basmati rice develops aroma through undisturbed patience, fertile topsoil cannot be manufactured overnight.",
        "analogy": "A single centimeter of topsoil takes 500 to 1,000 years to regenerate through natural weathering.",
        "quiz": None,
        "diagram": "",
        "hashtags": ["#SoilFormation", "#Pedogenesis", "#Conservation"],
        "source_ref": "NCERT Class 10 Geography Ch 1 Section 1.4",
        "grade": 10,
        "subject": "SST",
        "engagement": {"likes": 120, "comments": [], "seed_comment": "That is why preventing soil erosion is so critical."}
    },
    {
        "id": "res10_3",
        "type": "quiz",
        "title": "Board MCQ: Black Soil State Identification",
        "body": "Verify regional distribution of major Indian soil types.",
        "analogy": "",
        "quiz": {
            "question": "Which Indian state is predominantly covered with black soil (Regur soil), ideal for growing cotton?",
            "options": [
                "Maharashtra",
                "Punjab",
                "Rajasthan",
                "Kerala"
            ],
            "answer": "Maharashtra",
            "explanation": "Black soil is typical of the Deccan trap (Basalt) region spread over northwest Deccan plateau and covers the plateaus of Maharashtra, Saurashtra, Malwa, and Madhya Pradesh."
        },
        "diagram": "",
        "hashtags": ["#BlackSoil", "#RegurSoil", "#CottonSoil"],
        "source_ref": "NCERT Class 10 Geography Ch 1 Section 1.4.2",
        "grade": 10,
        "subject": "SST",
        "engagement": {"likes": 155, "comments": [], "seed_comment": "High moisture retention capacity!"}
    },
    {
        "id": "res10_4",
        "type": "key_point",
        "title": "Sustainable Development & Rio Summit (1992)",
        "body": "Development should take place without damaging the environment, and development in the present should not compromise the needs of future generations. The First Earth Summit in Rio de Janeiro (1992) adopted Agenda 21 for global sustainable development.",
        "analogy": "",
        "quiz": None,
        "diagram": '<svg viewBox="0 0 380 180" xmlns="http://www.w3.org/2000/svg"><rect x="40" y="30" width="300" height="120" rx="12" fill="#0f1e3d"/><text x="190" y="70" fill="#22c55e" font-size="16" font-weight="bold" text-anchor="middle">Rio Earth Summit 1992</text><text x="190" y="100" fill="#ffffff" font-size="13" text-anchor="middle">Adoption of Agenda 21</text><text x="190" y="125" fill="#c8d4ec" font-size="11" text-anchor="middle">Combating environmental damage, poverty, & disease</text></svg>',
        "hashtags": ["#Agenda21", "#RioSummit1992", "#SustainableDevelopment"],
        "source_ref": "NCERT Class 10 Geography Ch 1 Section 1.2",
        "grade": 10,
        "subject": "SST",
        "engagement": {"likes": 140, "comments": [], "seed_comment": "Every local government should draw its own local Agenda 21."}
    },
    {
        "id": "res10_5",
        "type": "apply",
        "title": "Rooftop Rainwater Harvesting in Rajasthan",
        "body": "Traditional 'Tanka' underground water tanks built in houses across Bikaner, Phalodi, and Barmer collect rooftop rainwater during monsoons. Stored 'Palar Pani' provides clean drinking water through the scorching summer months when other sources dry up.",
        "analogy": "Ancient decentralized water security long before piped tap infrastructure existed.",
        "quiz": None,
        "diagram": "",
        "hashtags": ["#PalarPani", "#RainwaterHarvesting", "#RajasthanWater"],
        "source_ref": "NCERT Class 10 Geography Ch 3 Section 3.2",
        "grade": 10,
        "subject": "SST",
        "engagement": {"likes": 160, "comments": [], "seed_comment": "Tamil Nadu made rooftop rainwater harvesting legally compulsory for all houses!"}
    },
    {
        "id": "res10_6",
        "type": "quiz",
        "title": "Board MCQ: Gandhiji's Resource Conservation Quote",
        "body": "Check textbook recall on philosophical conservation roots.",
        "analogy": "",
        "quiz": {
            "question": "Complete the famous quote by Mahatma Gandhi: 'There is enough for everybody\'s need and not for anybody\'s ______.'",
            "options": [
                "greed",
                "demand",
                "profit",
                "wealth"
            ],
            "answer": "greed",
            "explanation": "Gandhiji voiced deep concern about resource conservation: 'There is enough for everybody\'s need and not for anybody\'s greed', blaming greedy exploitative individuals and modern mass production."
        },
        "diagram": "",
        "hashtags": ["#GandhianPhilosophy", "#ResourceConservation", "#BoardMCQ"],
        "source_ref": "NCERT Class 10 Geography Ch 1 Section 1.2",
        "grade": 10,
        "subject": "SST",
        "engagement": {"likes": 190, "comments": [], "seed_comment": "Advocated production by the masses, not mass production."}
    },
    {
        "id": "res10_7",
        "type": "exam_tip",
        "title": "Soil Classification Table: Key Distinctions",
        "body": "CBSE examiners test soil differences regularly. For Alluvial soil, differentiate Khadar (new, fine alluvial, more fertile) from Bangar (old alluvial with higher concentration of calcareous kankars).",
        "analogy": "Khadar = New, fertile, low floodplains; Bangar = Old, clayey, higher river terraces with kankar nodules.",
        "quiz": None,
        "diagram": "",
        "hashtags": ["#KhadarVsBangar", "#AlluvialSoil", "#ExaminerTip"],
        "source_ref": "NCERT Class 10 Geography Ch 1 Section 1.4.1",
        "grade": 10,
        "subject": "SST",
        "engagement": {"likes": 175, "comments": [], "seed_comment": "Never mix up Khadar and Bangar in 2-mark definitions!"}
    },
    {
        "id": "res10_8",
        "type": "recap",
        "title": "Mid-Feed Checkpoint: 3 Stages of Resource Planning",
        "body": "Resource planning in India involves 3 systematic steps: (1) Identification and inventory through surveying and mapping, (2) Evolving a planning structure with appropriate technology and skills, (3) Matching resource plans with overall national development goals.",
        "analogy": "",
        "quiz": None,
        "diagram": "",
        "hashtags": ["#ResourcePlanning", "#FiveYearPlans", "#NCERT10"],
        "source_ref": "NCERT Class 10 Geography Ch 1 Section 1.2",
        "grade": 10,
        "subject": "SST",
        "engagement": {"likes": 125, "comments": [], "seed_comment": "Arunachal has water surplus but lacks infrastructure; Rajasthan has solar but lacks water."}
    },
    {
        "id": "res10_9",
        "type": "key_point",
        "title": "Land Degradation Causes across Indian States",
        "body": "Causes of land degradation vary regionally in India: (1) Deforestation and mining in Jharkhand, Chhattisgarh, and Odisha, (2) Over-irrigation leading to waterlogging and salinity in Punjab and Haryana, (3) Over-grazing in Gujarat, Rajasthan, and Madhya Pradesh.",
        "analogy": "",
        "quiz": None,
        "diagram": '<svg viewBox="0 0 380 180" xmlns="http://www.w3.org/2000/svg"><rect x="30" y="20" width="320" height="140" rx="10" fill="#f7f9fc" stroke="#1e3a6b" stroke-width="2"/><text x="190" y="55" fill="#1e3a6b" font-weight="bold" font-size="13" text-anchor="middle">REGIONAL LAND DEGRADATION CAUSES</text><text x="190" y="85" fill="#e63946" font-size="12" text-anchor="middle">Mining: Jharkhand, Chhattisgarh, Odisha</text><text x="190" y="110" fill="#4f6ba0" font-size="12" text-anchor="middle">Over-irrigation: Punjab, Haryana, Western UP</text><text x="190" y="135" fill="#22c55e" font-size="12" text-anchor="middle">Over-grazing: Gujarat, Rajasthan, MP</text></svg>',
        "hashtags": ["#LandDegradation", "#OverIrrigation", "#CBSEGeography"],
        "source_ref": "NCERT Class 10 Geography Ch 1 Section 1.3",
        "grade": 10,
        "subject": "SST",
        "engagement": {"likes": 160, "comments": [], "seed_comment": "Important 3-mark state matching question."}
    },
    {
        "id": "res10_10",
        "type": "myth_buster",
        "title": "Myth: Red Soil is Red Because of High Iron Content Everywhere",
        "body": "Busted! Red soil develops a reddish color due to diffusion of iron in crystalline and metamorphic rocks in low rainfall areas. However, it looks YELLOW when it occurs in a hydrated form (when mixed with excess moisture)!",
        "analogy": "",
        "quiz": None,
        "diagram": "",
        "hashtags": ["#MythBuster", "#RedAndYellowSoil", "#Pedology"],
        "source_ref": "NCERT Class 10 Geography Ch 1 Section 1.4.3",
        "grade": 10,
        "subject": "SST",
        "engagement": {"likes": 145, "comments": [], "seed_comment": "Red when dehydrated, yellow when hydrated."}
    },
    {
        "id": "res10_11",
        "type": "quiz",
        "title": "Board MCQ: Gully Erosion and Badlands",
        "body": "Test your knowledge of soil erosion landforms in central India.",
        "analogy": "",
        "quiz": {
            "question": "Which river basin in India is notoriously famous for extensive gully erosion creating 'badlands' (ravines)?",
            "options": [
                "Chambal basin",
                "Ganga basin",
                "Brahmaputra basin",
                "Godavari basin"
            ],
            "answer": "Chambal basin",
            "explanation": "Running water cuts through clayey soils and makes deep channels as gullies, rendering the land unfit for cultivation. In the Chambal basin, such lands are called ravines or badlands."
        },
        "diagram": "",
        "hashtags": ["#ChambalRavines", "#GullyErosion", "#Badlands"],
        "source_ref": "NCERT Class 10 Geography Ch 1 Section 1.5",
        "grade": 10,
        "subject": "SST",
        "engagement": {"likes": 170, "comments": [], "seed_comment": "The Chambal badlands are famous in Indian geography."}
    },
    {
        "id": "res10_12",
        "type": "key_point",
        "title": "Soil Conservation Techniques: Contour Ploughing & Shelter Belts",
        "body": "Methods to prevent erosion: (1) Contour ploughing along contour lines decelerates water flow down slopes, (2) Terrace farming on hill slopes (Western Himalayas), (3) Strip cropping dividing fields with grass strips, (4) Shelter belts of trees stabilizing sand dunes in western Rajasthan.",
        "analogy": "",
        "quiz": None,
        "diagram": '<svg viewBox="0 0 380 180" xmlns="http://www.w3.org/2000/svg"><rect x="30" y="20" width="320" height="140" rx="10" fill="#f7f9fc" stroke="#22c55e" stroke-width="2"/><text x="190" y="55" fill="#166534" font-weight="bold" font-size="13" text-anchor="middle">SOIL CONSERVATION STRATEGIES</text><text x="190" y="85" fill="#0f1e3d" font-size="12" text-anchor="middle">Contour Ploughing & Terrace Cultivation (Hills)</text><text x="190" y="110" fill="#0f1e3d" font-size="12" text-anchor="middle">Strip Cropping (Plain Farmland)</text><text x="190" y="135" fill="#4f6ba0" font-size="12" text-anchor="middle">Shelter Belts of Trees (Desert Margins)</text></svg>',
        "hashtags": ["#ShelterBelts", "#ContourPloughing", "#SoilConservation"],
        "source_ref": "NCERT Class 10 Geography Ch 1 Section 1.5",
        "grade": 10,
        "subject": "SST",
        "engagement": {"likes": 150, "comments": [], "seed_comment": "Shelter belts have significantly stabilized Thar desert dunes."}
    },
    {
        "id": "res10_13",
        "type": "quiz",
        "title": "Board MCQ: Net Sown Area in India",
        "body": "Examine land-use pattern statistical insights.",
        "analogy": "",
        "quiz": {
            "question": "According to the National Forest Policy (1952), what percentage of geographical area should be under forest cover for ecological balance?",
            "options": [
                "$33\\%$",
                "$24\\%$",
                "$40\\%$",
                "$50\\%$"
            ],
            "answer": "$33\\%$",
            "explanation": "The National Forest Policy of 1952 outlines that 33% of geographical land area should ideally be under forest cover to maintain ecological equilibrium."
        },
        "diagram": "",
        "hashtags": ["#ForestCover", "#NationalForestPolicy", "#33Percent"],
        "source_ref": "NCERT Class 10 Geography Ch 1 Section 1.3",
        "grade": 10,
        "subject": "SST",
        "engagement": {"likes": 180, "comments": [], "seed_comment": "India currently hovers around 24% forest cover."}
    },
    {
        "id": "res10_14",
        "type": "summary",
        "title": "Resources & Development Revision Complete",
        "body": "You mastered Resource Geography! Remember: (1) Interdependent triangle of nature, technology, and institutions, (2) Agenda 21 & Rio 1992, (3) Khadar vs Bangar soils, (4) Regur black soil for cotton, (5) Regional causes of degradation, (6) 33% forest cover target.",
        "analogy": "",
        "quiz": None,
        "diagram": "",
        "hashtags": ["#GeographyComplete", "#Class10Board", "#NCERTRevision"],
        "source_ref": "NCERT Class 10 Geography Ch 1 Summary",
        "grade": 10,
        "subject": "SST",
        "engagement": {"likes": 230, "comments": [], "seed_comment": "Complete chapter covered in 14 cards!"}
    }
]

ALL_FEEDS = {
    "maths-12-parabola.json": maths_12_posts,
    "maths-10-trigonometry.json": maths_10_posts,
    "sst-10-nationalism-in-india.json": sst_10_nationalism,
    "sst-10-resources-and-development.json": sst_10_resources,
}

for filename, posts in ALL_FEEDS.items():
    with open(BACKEND_DEMO / filename, "w", encoding="utf-8") as f:
        json.dump(posts, f, indent=2, ensure_ascii=False)
    with open(FRONTEND_DEMO / filename, "w", encoding="utf-8") as f:
        json.dump(posts, f, indent=2, ensure_ascii=False)
    print(f"Generated {filename} ({len(posts)} posts)")

print("All remaining feeds 3, 4, 5, 6 built successfully.")
