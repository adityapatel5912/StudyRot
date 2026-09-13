/**
 * Curated CBSE sample demo feeds matching NCERT curriculum
 * 14-18 posts per topic covering:
 * - key_point (foundation)
 * - analogy (desi intuition)
 * - quiz (timed MCQ)
 * - formula / timeline
 * - apply (real-world Indian context)
 * - exam_tip (board trap & marking scheme)
 * - recap (mid-feed checkpoint)
 */

export const SAMPLE_FEEDS = {
  science_10: {
    subject: "Science",
    grade: 10,
    topic: "Light — Reflection and Refraction",
    posts: [
      {
        id: "sci_1",
        type: "key_point",
        title: "Laws of Reflection & The Normal Line",
        body: "The incident ray, reflected ray, and the normal to the mirror at the point of incidence all lie in the exact same plane. The angle of incidence strictly equals the angle of reflection (∠i = ∠r).",
        analogy: "",
        quiz: null,
        diagram: `<svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg">
  <line x1="40" y1="190" x2="360" y2="190" stroke="#0f1e3d" stroke-width="4"/>
  <line x1="60" y1="190" x2="50" y2="205" stroke="#4f6ba0" stroke-width="2"/>
  <line x1="120" y1="190" x2="110" y2="205" stroke="#4f6ba0" stroke-width="2"/>
  <line x1="180" y1="190" x2="170" y2="205" stroke="#4f6ba0" stroke-width="2"/>
  <line x1="240" y1="190" x2="230" y2="205" stroke="#4f6ba0" stroke-width="2"/>
  <line x1="300" y1="190" x2="290" y2="205" stroke="#4f6ba0" stroke-width="2"/>
  <line x1="200" y1="40" x2="200" y2="190" stroke="#4f6ba0" stroke-width="2" stroke-dasharray="6,4"/>
  <text x="208" y="60" font-family="system-ui, sans-serif" font-size="12" fill="#4f6ba0" font-weight="600">Normal (N)</text>
  <line x1="80" y1="70" x2="200" y2="190" stroke="#e63946" stroke-width="3"/>
  <text x="60" y="60" font-family="system-ui, sans-serif" font-size="12" fill="#e63946" font-weight="600">Incident Ray (i)</text>
  <line x1="200" y1="190" x2="320" y2="70" stroke="#22c55e" stroke-width="3"/>
  <text x="270" y="60" font-family="system-ui, sans-serif" font-size="12" fill="#22c55e" font-weight="600">Reflected Ray (r)</text>
  <path d="M 180,170 Q 190,160 200,165" fill="none" stroke="#e63946" stroke-width="2"/>
  <text x="175" y="155" font-family="system-ui, sans-serif" font-size="11" fill="#e63946">∠i</text>
  <path d="M 200,165 Q 210,160 220,170" fill="none" stroke="#22c55e" stroke-width="2"/>
  <text x="215" y="155" font-family="system-ui, sans-serif" font-size="11" fill="#22c55e">∠r</text>
</svg>`,
        hashtags: ["#Reflection", "#Optics", "#NCERTPhysics"],
        source_ref: "NCERT Ch 10 — Section 10.1",
        grade: 10,
        subject: "Science",
        engagement: { likes: 38, comments: [] }
      },
      {
        id: "sci_2",
        type: "analogy",
        title: "Snell's Law is Like a Car Hitting Mud",
        body: "When light travels obliquely from air into glass, it slows down and bends toward the normal. Just like a Maruti Swift hitting roadside mud at an angle: the front tire in the mud drags first, rotating the vehicle inward.",
        analogy: "One tire hits mud before the other, yawing the chassis toward the perpendicular.",
        quiz: null,
        diagram: `<svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg">
  <rect x="40" y="20" width="320" height="90" fill="#f7f9fc" stroke="#d7e0f0" stroke-width="1"/>
  <rect x="40" y="110" width="320" height="110" fill="#c8d4ec" opacity="0.4"/>
  <line x1="40" y1="110" x2="360" y2="110" stroke="#16294f" stroke-width="2"/>
  <text x="50" y="50" font-family="system-ui, sans-serif" font-size="12" fill="#1e3a6b" font-weight="700">Rarer Medium (Air, n₁)</text>
  <text x="50" y="140" font-family="system-ui, sans-serif" font-size="12" fill="#0f1e3d" font-weight="700">Denser Medium (Glass, n₂)</text>
  <line x1="200" y1="30" x2="200" y2="200" stroke="#4f6ba0" stroke-width="1.5" stroke-dasharray="4,4"/>
  <line x1="100" y1="40" x2="200" y2="110" stroke="#e63946" stroke-width="3"/>
  <line x1="200" y1="110" x2="250" y2="200" stroke="#1e3a6b" stroke-width="3"/>
  <circle cx="200" cy="110" r="4" fill="#e63946"/>
</svg>`,
        hashtags: ["#Refraction", "#SnellsLaw", "#Class10Science"],
        source_ref: "NCERT Ch 10 — Section 10.3",
        grade: 10,
        subject: "Science",
        engagement: { likes: 52, comments: [] }
      },
      {
        id: "sci_3",
        type: "quiz",
        title: "Board Check: Convex Mirror Virtual Image",
        body: "Test your ray diagram fundamentals before we tackle the mirror formula!",
        analogy: "",
        quiz: {
          question: "An object is placed at infinity in front of a convex mirror. Where is the image formed?",
          options: [
            "At the focus, behind the mirror, highly diminished",
            "At 2F, real and inverted",
            "Between F and 2F in front of the mirror",
            "At infinity, virtual and erect"
          ],
          correct_index: 0,
          explanation: "Convex mirrors always produce virtual, erect images behind the mirror. For an object at infinity, rays arrive parallel and diverge from the principal focus (F) behind the mirror."
        },
        diagram: "",
        hashtags: ["#CBSEQuiz", "#BoardExam", "#MCQ1Mark"],
        source_ref: "NCERT Table 10.2",
        grade: 10,
        subject: "Science",
        engagement: { likes: 64, comments: [] }
      },
      {
        id: "sci_4",
        type: "formula",
        title: "Mirror Formula & The Cartesian Sign Convention",
        body: "The mirror formula connects object distance (u), image distance (v), and focal length (f): 1/v + 1/u = 1/f. New Cartesian rule: Object distance u is ALWAYS negative (-u) because light travels from left to right.",
        analogy: "",
        quiz: null,
        diagram: `<svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg">
  <line x1="30" y1="120" x2="370" y2="120" stroke="#4f6ba0" stroke-width="1.5"/>
  <path d="M 330,30 Q 300,120 330,210" fill="none" stroke="#0f1e3d" stroke-width="4"/>
  <circle cx="160" cy="120" r="4" fill="#0f1e3d"/>
  <text x="155" y="145" font-family="system-ui, sans-serif" font-size="12" fill="#0f1e3d" font-weight="700">C</text>
  <circle cx="240" cy="120" r="4" fill="#0f1e3d"/>
  <text x="236" y="145" font-family="system-ui, sans-serif" font-size="12" fill="#0f1e3d" font-weight="700">F</text>
  <circle cx="315" cy="120" r="4" fill="#0f1e3d"/>
  <text x="312" y="145" font-family="system-ui, sans-serif" font-size="12" fill="#0f1e3d" font-weight="700">P</text>
  <text x="50" y="50" font-family="system-ui, sans-serif" font-size="16" fill="#1e3a6b" font-weight="800">1/v + 1/u = 1/f</text>
</svg>`,
        hashtags: ["#MirrorFormula", "#SignConvention", "#PhysicsNumerical"],
        source_ref: "NCERT Ch 10 — Section 10.2.4",
        grade: 10,
        subject: "Science",
        engagement: { likes: 45, comments: [] }
      },
      {
        id: "sci_5",
        type: "apply",
        title: "Rear-View Mirrors in Indian Auto Rickshaws & Cars",
        body: "Why does every car and auto in India have 'Objects in mirror are closer than they appear'? Convex mirrors give a wide, erect field of view enabling drivers to navigate congested bazaar traffic and overtaking buses with minimal blind spots.",
        analogy: "",
        quiz: null,
        diagram: "",
        hashtags: ["#RealWorldScience", "#IndianTraffic", "#ConvexMirror"],
        source_ref: "NCERT Ch 10 — Application Note",
        grade: 10,
        subject: "Science",
        engagement: { likes: 71, comments: [] }
      },
      {
        id: "sci_6",
        type: "recap",
        title: "Checkpoint 1: Reflection Essentials",
        body: "Review before refraction: (1) Concave mirrors converge rays; concave mirror focal length is NEGATIVE (-f). (2) Convex mirrors diverge rays; focal length is POSITIVE (+f). (3) Magnification m = -v/u.",
        analogy: "",
        quiz: null,
        diagram: "",
        hashtags: ["#Recap", "#QuickRevision", "#Class10Board"],
        source_ref: "NCERT Ch 10 Summary",
        grade: 10,
        subject: "Science",
        engagement: { likes: 82, comments: [] }
      },
      {
        id: "sci_7",
        type: "key_point",
        title: "Refraction Through a Glass Slab & Lateral Shift",
        body: "When a ray emerges from a rectangular glass slab, the emergent ray is parallel to the incident ray but laterally displaced. The angle of emergence equals the angle of incidence (∠i = ∠e).",
        analogy: "",
        quiz: null,
        diagram: `<svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg">
  <rect x="70" y="70" width="260" height="100" fill="#eaf0fa" stroke="#0f1e3d" stroke-width="2"/>
  <text x="85" y="95" font-family="system-ui, sans-serif" font-size="12" fill="#1e3a6b" font-weight="700">Glass Slab (n = 1.5)</text>
  <line x1="50" y1="20" x2="130" y2="70" stroke="#e63946" stroke-width="3"/>
  <line x1="130" y1="70" x2="190" y2="170" stroke="#1e3a6b" stroke-width="3"/>
  <line x1="190" y1="170" x2="270" y2="220" stroke="#22c55e" stroke-width="3"/>
  <text x="210" y="200" font-family="system-ui, sans-serif" font-size="11" fill="#22c55e" font-weight="700">Emergent Ray (|| Incident)</text>
</svg>`,
        hashtags: ["#GlassSlab", "#LateralShift", "#LabExperiment"],
        source_ref: "NCERT Ch 10 — Activity 10.10",
        grade: 10,
        subject: "Science",
        engagement: { likes: 58, comments: [] }
      },
      {
        id: "sci_8",
        type: "exam_tip",
        title: "Board Trap: Don't Confuse Mirror vs Lens Formula!",
        body: "In Board exams, over 30% of students lose 3 marks by using the mirror formula for lenses! Mirror formula has PLUS: 1/v + 1/u = 1/f. Lens formula has MINUS: 1/v - 1/u = 1/f.",
        analogy: "",
        quiz: null,
        diagram: "",
        hashtags: ["#CommonTrap", "#BoardMarks", "#FormulaCaution"],
        source_ref: "CBSE Marking Scheme Insights",
        grade: 10,
        subject: "Science",
        engagement: { likes: 95, comments: [] }
      },
      {
        id: "sci_9",
        type: "quiz",
        title: "Board MCQ: Power of Lens Calculation",
        body: "Calculate the power of a lens with given focal length.",
        analogy: "",
        quiz: {
          question: "A doctor prescribes a corrective lens of power -2.0 D. What is its focal length and type?",
          options: [
            "-0.5 m, Concave lens (diverging)",
            "+0.5 m, Convex lens (converging)",
            "-2.0 m, Concave lens",
            "+2.0 m, Convex lens"
          ],
          correct_index: 0,
          explanation: "Power P = 1/f(in meters). So f = 1/P = 1/(-2.0) = -0.5 m. Negative power and negative focal length always signify a concave (diverging) lens used for correcting myopia."
        },
        diagram: "",
        hashtags: ["#LensPower", "#Dioptres", "#CBSEBoard2024"],
        source_ref: "NCERT Ch 10 — Section 10.3.8",
        grade: 10,
        subject: "Science",
        engagement: { likes: 49, comments: [] }
      },
      {
        id: "sci_10",
        type: "formula",
        title: "Absolute Refractive Index & Speed of Light",
        body: "Absolute refractive index n = c / v, where c is speed of light in vacuum (3 × 10⁸ m/s) and v is speed in the medium. Higher refractive index = optically denser medium = slower speed of light.",
        analogy: "",
        quiz: null,
        diagram: `<svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg">
  <rect x="50" y="50" width="300" height="70" rx="10" fill="#0f1e3d"/>
  <text x="90" y="92" font-family="system-ui, sans-serif" font-size="22" fill="#ffffff" font-weight="800">n = c / v</text>
  <rect x="50" y="140" width="300" height="60" rx="10" fill="#eaf0fa" stroke="#4f6ba0"/>
  <text x="70" y="175" font-family="system-ui, sans-serif" font-size="14" fill="#0f1e3d" font-weight="600">Diamond has highest n = 2.42</text>
</svg>`,
        hashtags: ["#RefractiveIndex", "#SpeedOfLight", "#OpticsBasics"],
        source_ref: "NCERT Ch 10 — Section 10.3.2",
        grade: 10,
        subject: "Science",
        engagement: { likes: 40, comments: [] }
      },
      {
        id: "sci_11",
        type: "apply",
        title: "Atmospheric Refraction & The Twinkling of Stars",
        body: "Why do stars twinkle while planets don't? Earth's atmosphere has varying air temperature layers causing continuous fluctuating refraction of starlight. Planets are extended sources, so point-by-point fluctuations average out to zero.",
        analogy: "",
        quiz: null,
        diagram: "",
        hashtags: ["#AtmosphericRefraction", "#TwinklingStars", "#BoardQuestion"],
        source_ref: "NCERT Ch 11 preview",
        grade: 10,
        subject: "Science",
        engagement: { likes: 66, comments: [] }
      },
      {
        id: "sci_12",
        type: "recap",
        title: "Checkpoint 2: Lens & Refraction Recap",
        body: "Key points so far: (1) Convex lens converges, f is POSITIVE (+). (2) Concave lens diverges, f is NEGATIVE (-). (3) Power P = 1/f(m). (4) Diamond has highest refractive index (2.42).",
        analogy: "",
        quiz: null,
        diagram: "",
        hashtags: ["#Summary", "#Class10Optics", "#NCERTNotes"],
        source_ref: "NCERT Ch 10 Chapter Review",
        grade: 10,
        subject: "Science",
        engagement: { likes: 77, comments: [] }
      },
      {
        id: "sci_13",
        type: "myth_buster",
        title: "Myth: Dense Physical Liquid is Always Optically Denser",
        body: "Busted! Kerosene has lower mass density than water (it floats on water), BUT kerosene has higher refractive index (1.44) than water (1.33). Optical density measures light refraction speed, NOT mass density!",
        analogy: "",
        quiz: null,
        diagram: "",
        hashtags: ["#MythBuster", "#OpticalDensity", "#VivaVoce"],
        source_ref: "NCERT Table 10.3 Note",
        grade: 10,
        subject: "Science",
        engagement: { likes: 88, comments: [] }
      },
      {
        id: "sci_14",
        type: "exam_tip",
        title: "Ray Diagram Arrow Trap: Full Marks Checklist",
        body: "CBSE examiners will deduct 0.5 to 1 mark per diagram if you forget ARROWS showing light direction! Always draw arrow on incident ray, reflected/refracted ray, and label F and 2F.",
        analogy: "",
        quiz: null,
        diagram: "",
        hashtags: ["#ExaminerSecret", "#FullMarks", "#DiagramChecklist"],
        source_ref: "CBSE Evaluator Guidelines",
        grade: 10,
        subject: "Science",
        engagement: { likes: 110, comments: [] }
      },
      {
        id: "sci_15",
        type: "summary",
        title: "Complete Optics Mastery Card",
        body: "Congratulations! You completed the 15-card Light module. Remember: Mirror formula has +, Lens formula has -, Concave focal length is negative, Convex is positive, and P = 1/f in meters.",
        analogy: "",
        quiz: null,
        diagram: "",
        hashtags: ["#MasteryComplete", "#BoardReady", "#Class10Topper"],
        source_ref: "StudyRot CBSE Physics Deck",
        grade: 10,
        subject: "Science",
        engagement: { likes: 142, comments: [] }
      }
    ]
  },

  electricity_10: {
    subject: "Science",
    grade: 10,
    topic: "Electricity — Circuits & Ohm's Law",
    posts: [
      {
        id: "elec_1",
        type: "key_point",
        title: "Electric Current & Net Charge Flow",
        body: "Electric current is the rate of flow of electric charges: $I = Q/t$. 1 Ampere corresponds to 1 Coulomb passing per second ($6.25 \\times 10^{18}$ electrons). Conventional current flows from positive to negative terminal, opposite to electron motion.",
        analogy: "",
        quiz: null,
        diagram: `<svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg">
  <rect x="50" y="40" width="300" height="140" fill="none" stroke="#0f1e3d" stroke-width="3" rx="8"/>
  <line x1="200" y1="35" x2="200" y2="45" stroke="#e63946" stroke-width="4"/>
  <text x="210" y="30" font-family="sans-serif" font-size="12" fill="#e63946" font-weight="700">I (Current) →</text>
  <circle cx="90" cy="110" r="18" fill="#f7f9fc" stroke="#0f1e3d" stroke-width="2"/>
  <text x="85" y="115" font-family="sans-serif" font-size="13" font-weight="bold" fill="#0f1e3d">A</text>
  <text x="75" y="145" font-family="sans-serif" font-size="10" fill="#4f6ba0">Ammeter</text>
  <rect x="260" y="98" width="60" height="24" fill="#eef3fb" stroke="#0f1e3d" stroke-width="2"/>
  <text x="278" y="114" font-family="sans-serif" font-size="12" font-weight="bold" fill="#0f1e3d">R</text>
  <text x="270" y="142" font-family="sans-serif" font-size="10" fill="#4f6ba0">Resistor</text>
  <line x1="185" y1="180" x2="185" y2="180" stroke="#0f1e3d" stroke-width="4"/>
  <line x1="195" y1="170" x2="195" y2="190" stroke="#0f1e3d" stroke-width="4"/>
  <line x1="205" y1="175" x2="205" y2="185" stroke="#0f1e3d" stroke-width="3"/>
  <text x="175" y="210" font-family="sans-serif" font-size="11" font-weight="700" fill="#0f1e3d">Battery (V)</text>
</svg>`,
        hashtags: ["#ElectricCurrent", "#Class10Science", "#Amperes"],
        source_ref: "NCERT Ch 12 — Section 12.1",
        grade: 10,
        subject: "Science",
        engagement: { likes: 64, comments: [] }
      },
      {
        id: "elec_2",
        type: "analogy",
        title: "Potential Difference is Like Water Tank Pressure",
        body: "Water only flows down a pipe when there is a pressure difference created by an overhead Sintex tank. Similarly, electrons cannot move through a copper wire without electric pressure (Potential Difference $V = W/Q$) generated by chemical reactions inside a battery cell.",
        analogy: "Overhead water tank pressure = Electric potential difference driving charge flow.",
        quiz: null,
        diagram: "",
        hashtags: ["#Analogy", "#Voltage", "#IntuitivePhysics"],
        source_ref: "NCERT Ch 12 — Section 12.2",
        grade: 10,
        subject: "Science",
        engagement: { likes: 58, comments: [] }
      },
      {
        id: "elec_3",
        type: "formula",
        title: "Ohm's Law: V = IR & The V-I Linear Slope",
        body: "At constant temperature, current $I$ passing through a metallic conductor is directly proportional to the potential difference $V$ across its ends: $V = IR$. On a graph of $V$ (y-axis) vs $I$ (x-axis), the slope is equal to Resistance $R = \\Delta V / \\Delta I$.",
        analogy: "",
        quiz: null,
        diagram: `<svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg">
  <line x1="60" y1="180" x2="360" y2="180" stroke="#0f1e3d" stroke-width="2"/>
  <line x1="60" y1="180" x2="60" y2="30" stroke="#0f1e3d" stroke-width="2"/>
  <text x="40" y="25" font-family="sans-serif" font-size="12" font-weight="bold" fill="#0f1e3d">V (Volts)</text>
  <text x="320" y="205" font-family="sans-serif" font-size="12" font-weight="bold" fill="#0f1e3d">I (Amperes)</text>
  <line x1="60" y1="180" x2="320" y2="50" stroke="#e63946" stroke-width="3"/>
  <text x="210" y="90" font-family="sans-serif" font-size="13" font-weight="bold" fill="#e63946">Slope = R = V/I</text>
  <circle cx="60" cy="180" r="4" fill="#0f1e3d"/>
</svg>`,
        hashtags: ["#OhmsLaw", "#Formula", "#Resistance"],
        source_ref: "NCERT Ch 12 — Section 12.4",
        grade: 10,
        subject: "Science",
        engagement: { likes: 79, comments: [] }
      },
      {
        id: "elec_4",
        type: "quiz",
        title: "Board Check: Resistance vs Wire Geometry",
        body: "Guaranteed 1-mark CBSE question on wire stretching and resistance!",
        analogy: "",
        quiz: {
          question: "A cylindrical wire of length L and area A has resistance R. If the wire is stretched to double its length (2L), what is its new resistance?",
          options: ["4R", "2R", "R/2", "R/4"],
          answer: "4R",
          explanation: "Volume $V = A \\times L$ remains constant. If length doubles ($L' = 2L$), area halves ($A' = A/2$). Since $R = \\rho L/A$, $R' = \\rho(2L)/(A/2) = 4(\\rho L/A) = 4R$."
        },
        diagram: "",
        hashtags: ["#CBSEQuiz", "#Resistivity", "#Class10MCQ"],
        source_ref: "NCERT Ch 12 — Section 12.5",
        grade: 10,
        subject: "Science",
        engagement: { likes: 92, comments: [] }
      },
      {
        id: "elec_5",
        type: "apply",
        title: "Tungsten Filaments vs Nichrome in Indian Appliances",
        body: "Why is Tungsten used in incandescent lamps while Nichrome is used in geysers & electric irons? Tungsten has an ultra-high melting point (3380°C) to glow white without melting. Nichrome has high resistivity and does NOT oxidize (burn) even at red-hot temperatures.",
        analogy: "",
        quiz: null,
        diagram: "",
        hashtags: ["#RealWorldApplication", "#Nichrome", "#Tungsten"],
        source_ref: "NCERT Ch 12 — Heating Effects",
        grade: 10,
        subject: "Science",
        engagement: { likes: 88, comments: [] }
      },
      {
        id: "elec_6",
        type: "recap",
        title: "Checkpoint 1: Resistors in Series vs Parallel",
        body: "Crucial CBSE distinction: In Series, Current $I$ is identical across each resistor and $R_s = R_1 + R_2 + R_3$. In Parallel, Voltage $V$ is identical across each branch and $1/R_p = 1/R_1 + 1/R_2 + 1/R_3$. Parallel combination always yields equivalent resistance SMALLER than the smallest individual resistor.",
        analogy: "",
        quiz: null,
        diagram: "",
        hashtags: ["#SeriesParallel", "#QuickRecap", "#BoardEssentials"],
        source_ref: "NCERT Ch 12 — Sections 12.6.1 & 12.6.2",
        grade: 10,
        subject: "Science",
        engagement: { likes: 110, comments: [] }
      },
      {
        id: "elec_7",
        type: "exam_tip",
        title: "Circuit Instrument Connections: The #1 Board Trap!",
        body: "CBSE board-exam trap alert: An Ammeter has very low resistance and MUST always be connected in SERIES. A Voltmeter has high resistance and MUST always be connected in PARALLEL across the component. Reversing them burns out circuits or reads zero!",
        analogy: "",
        quiz: null,
        diagram: "",
        hashtags: ["#BoardExamTip", "#AmmeterVoltmeter", "#CircuitTrap"],
        source_ref: "CBSE Marking Scheme Notes",
        grade: 10,
        subject: "Science",
        engagement: { likes: 135, comments: [] }
      },
      {
        id: "elec_8",
        type: "formula",
        title: "Joule's Law of Heating: H = I²Rt",
        body: "The heat $H$ produced in a resistor of resistance $R$ carrying current $I$ for time $t$ is given by $H = I^2 R t = V I t = (V^2 / R) t$. Note: Heat is proportional to the square of current ($I^2$), so doubling current quadruples heat output!",
        analogy: "",
        quiz: null,
        diagram: "",
        hashtags: ["#JoulesHeating", "#Formulas", "#ElectricPower"],
        source_ref: "NCERT Ch 12 — Section 12.7",
        grade: 10,
        subject: "Science",
        engagement: { likes: 74, comments: [] }
      },
      {
        id: "elec_9",
        type: "quiz",
        title: "Commercial Unit of Energy: 1 kWh in Joules",
        body: "Frequently asked in CBSE Section A 1-mark questions!",
        analogy: "",
        quiz: {
          question: "What is the relationship between 1 kilowatt-hour (1 Board of Trade Unit) and Joules?",
          options: [
            "3.6 × 10⁶ J",
            "3.6 × 10⁵ J",
            "3.6 × 10³ J",
            "1.0 × 10⁶ J"
          ],
          answer: "3.6 × 10⁶ J",
          explanation: "1 kWh = 1000 W × 3600 s = 3,600,000 Joules = $3.6 \\times 10^6\\text{ J}$."
        },
        diagram: "",
        hashtags: ["#CBSEUnit", "#CommercialUnit", "#1kWh"],
        source_ref: "NCERT Ch 12 — Section 12.8",
        grade: 10,
        subject: "Science",
        engagement: { likes: 98, comments: [] }
      },
      {
        id: "elec_10",
        type: "summary",
        title: "Electricity Deck Complete: Ready for Numerical Revision",
        body: "You mastered the essential circuits framework: Ohm's law, series/parallel combinations, and Joule's heating formulas. Remember to verify units before calculating numerical problems in your CBSE board paper!",
        analogy: "",
        quiz: null,
        diagram: "",
        hashtags: ["#ElectricityComplete", "#NCERTChapter12", "#ReadyForBoards"],
        source_ref: "StudyRot CBSE Physics Deck",
        grade: 10,
        subject: "Science",
        engagement: { likes: 115, comments: [] }
      }
    ]
  },

  maths_12: {
    subject: "Maths",
    grade: 12,
    topic: "Parabola & Conic Sections",
    posts: [
      {
        id: "math_1",
        type: "key_point",
        title: "Standard Equation of Parabola: y² = 4ax",
        body: "A parabola is the locus of a point whose distance from a fixed point (focus) equals its distance from a fixed straight line (directrix). Eccentricity e = 1 strictly.",
        analogy: "",
        quiz: null,
        diagram: `<svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg">
  <line x1="20" y1="120" x2="380" y2="120" stroke="#0f1e3d" stroke-width="2"/>
  <line x1="140" y1="20" x2="140" y2="220" stroke="#0f1e3d" stroke-width="2"/>
  <line x1="80" y1="20" x2="80" y2="220" stroke="#e63946" stroke-width="2" stroke-dasharray="4,4"/>
  <path d="M 320,30 Q 140,120 320,210" fill="none" stroke="#1e3a6b" stroke-width="3"/>
  <circle cx="200" cy="120" r="4" fill="#22c55e"/>
  <text x="195" y="145" font-family="system-ui, sans-serif" font-size="12" fill="#22c55e" font-weight="700">F(a, 0)</text>
  <text x="60" y="45" font-family="system-ui, sans-serif" font-size="11" fill="#e63946" font-weight="700">x = -a</text>
</svg>`,
        hashtags: ["#Parabola", "#Class12Maths", "#ConicSections"],
        source_ref: "NCERT Ch 11 — Parabola",
        grade: 12,
        subject: "Maths",
        engagement: { likes: 45, comments: [] }
      },
      {
        id: "math_2",
        type: "formula",
        title: "Latus Rectum Length & Focal Distance",
        body: "For y² = 4ax, the chord passing through the focus perpendicular to the axis is the latus rectum. Its total length is exactly 4a. Distance of any point P(x₁, y₁) from the focus is SP = x₁ + a.",
        analogy: "",
        quiz: null,
        diagram: "",
        hashtags: ["#LatusRectum", "#CoordinateGeometry", "#FormulaCard"],
        source_ref: "NCERT Ch 11 — Section 11.5",
        grade: 12,
        subject: "Maths",
        engagement: { likes: 32, comments: [] }
      },
      {
        id: "math_3",
        type: "quiz",
        title: "Class 12 MCQ: Parabola Focus",
        body: "Test your recognition of non-standard parabola orientations.",
        analogy: "",
        quiz: {
          question: "What are the coordinates of the focus of the parabola x² = -16y?",
          options: [
            "(0, -4)",
            "(-4, 0)",
            "(0, 4)",
            "(4, -4)"
          ],
          correct_index: 0,
          explanation: "Compare with standard vertical downward form x² = -4ay. 4a = 16 => a = 4. The axis is along the y-axis opening downwards, so the focus is at (0, -a) = (0, -4)."
        },
        diagram: "",
        hashtags: ["#MathsQuiz", "#MCQ1Mark", "#CBSEBoard2024"],
        source_ref: "NCERT Ch 11 Exercise 11.2",
        grade: 12,
        subject: "Maths",
        engagement: { likes: 55, comments: [] }
      },
      {
        id: "math_4",
        type: "apply",
        title: "Tata Sky & ISRO Satellite Dish Antennas",
        body: "Every DTH dish antenna on Indian rooftops is a paraboloid of revolution. Radio signals from satellites arrive parallel and all reflect precisely into the low-noise block downconverter (LNB) placed at the geometric FOCUS.",
        analogy: "",
        quiz: null,
        diagram: "",
        hashtags: ["#RealWorldMaths", "#ISRO", "#SatelliteAntenna"],
        source_ref: "NCERT Ch 11 Real World Applications",
        grade: 12,
        subject: "Maths",
        engagement: { likes: 62, comments: [] }
      },
      {
        id: "math_5",
        type: "exam_tip",
        title: "Common Trap: Vertex vs Focus Coordinates",
        body: "When given (y - k)² = 4a(x - h), do NOT assume focus is (a, 0)! The vertex has shifted to (h, k). The new focus is (h + a, k) and directrix is x = h - a.",
        analogy: "",
        quiz: null,
        diagram: "",
        hashtags: ["#ShiftedOrigin", "#BoardMistake", "#JEEAlert"],
        source_ref: "CBSE Class 12 Common Errors",
        grade: 12,
        subject: "Maths",
        engagement: { likes: 81, comments: [] }
      },
      {
        id: "math_6",
        type: "recap",
        title: "Checkpoint 1: The 4 Standard Parabola Forms",
        body: "Summary: (1) y² = 4ax: opens RIGHT, focus (a, 0). (2) y² = -4ax: opens LEFT, focus (-a, 0). (3) x² = 4ay: opens UP, focus (0, a). (4) x² = -4ay: opens DOWN, focus (0, -a).",
        analogy: "",
        quiz: null,
        diagram: "",
        hashtags: ["#Recap", "#ConicSummary", "#QuickTable"],
        source_ref: "NCERT Summary Table 11.1",
        grade: 12,
        subject: "Maths",
        engagement: { likes: 73, comments: [] }
      },
      {
        id: "math_7",
        type: "formula",
        title: "Parametric Coordinates of Parabola",
        body: "Any point on y² = 4ax can be expressed in terms of parameter t as: x = at², y = 2at. This simplifies tangent and normal equations dramatically!",
        analogy: "",
        quiz: null,
        diagram: "",
        hashtags: ["#Parametric", "#CalculusPrep", "#IntegrationArea"],
        source_ref: "NCERT Appendix Conics",
        grade: 12,
        subject: "Maths",
        engagement: { likes: 48, comments: [] }
      },
      {
        id: "math_8",
        type: "apply",
        title: "Headlights of Cars & Searchlights",
        body: "If a light bulb is placed at the focus of a parabolic mirror reflector, all rays emerging from it reflect into a parallel beam of high intensity piercing through fog and night roads.",
        analogy: "",
        quiz: null,
        diagram: "",
        hashtags: ["#OpticsMaths", "#CarHeadlight", "#ReflectionProperty"],
        source_ref: "NCERT Application Problems",
        grade: 12,
        subject: "Maths",
        engagement: { likes: 59, comments: [] }
      },
      {
        id: "math_9",
        type: "exam_tip",
        title: "Area Under Parabola: Integration Shortcut",
        body: "Area bounded by y² = 4ax and its latus rectum x = a is exactly (8/3)a²! In Board 5-mark questions, show the full integration steps ∫ 2√(4ax) dx from 0 to a, but use (8/3)a² to check your answer instantly.",
        analogy: "",
        quiz: null,
        diagram: "",
        hashtags: ["#IntegrationShortcut", "#AreaUnderCurve", "#5MarkQuestion"],
        source_ref: "NCERT Application of Integrals Ch 8",
        grade: 12,
        subject: "Maths",
        engagement: { likes: 98, comments: [] }
      },
      {
        id: "math_10",
        type: "recap",
        title: "Mastery Card: Conic Sections Ready",
        body: "You mastered the fundamentals of parabolas! Next step in Class 12 syllabus: ellipse (e < 1) and hyperbola (e > 1).",
        analogy: "",
        quiz: null,
        diagram: "",
        hashtags: ["#MathsTopper", "#Class12Board", "#StudyRotDeck"],
        source_ref: "StudyRot CBSE Deck",
        grade: 12,
        subject: "Maths",
        engagement: { likes: 88, comments: [] }
      }
    ]
  },

  sst_10: {
    subject: "SST",
    grade: 10,
    topic: "Nationalism in India & Dandi March",
    posts: [
      {
        id: "sst_1",
        type: "key_point",
        title: "The Rowlatt Act (1919) & Black Act",
        body: "Passed hurriedly through the Imperial Legislative Council despite united Indian opposition. It gave the British government enormous powers to repress political activities and allowed detention of political prisoners without trial for up to 2 years.",
        analogy: "",
        quiz: null,
        diagram: "",
        hashtags: ["#RowlattAct", "#History10", "#CBSEHistory"],
        source_ref: "NCERT India & Contemporary World II — Ch 2",
        grade: 10,
        subject: "SST",
        engagement: { likes: 50, comments: [] }
      },
      {
        id: "sst_2",
        type: "timeline",
        title: "Jallianwala Bagh Massacre (13 April 1919)",
        body: "On Baisakhi day, a crowd gathered in Amritsar to protest arrests of leaders Kitchlew and Satyapal. General Dyer entered, blocked exits, and opened fire without warning, killing hundreds. His stated objective: to 'produce a moral effect and feeling of terror'.",
        analogy: "",
        quiz: null,
        diagram: "",
        hashtags: ["#JallianwalaBagh", "#Amritsar1919", "#GeneralDyer"],
        source_ref: "NCERT Ch 2 — Section 1.2",
        grade: 10,
        subject: "SST",
        engagement: { likes: 72, comments: [] }
      },
      {
        id: "sst_3",
        type: "quiz",
        title: "Board Check: Chauri Chaura & Movement Withdrawal",
        body: "Key landmark tested every year in CBSE Social Science Section A.",
        analogy: "",
        quiz: {
          question: "Why did Mahatma Gandhi suddenly withdraw the Non-Cooperation Movement in February 1922?",
          options: [
            "Violent incident at Chauri Chaura (Gorakhpur) where a police station was torched",
            "The British repealed the Rowlatt Act",
            "Congress leaders refused to participate in council elections",
            "Gandhiji was deported to South Africa"
          ],
          correct_index: 0,
          explanation: "At Chauri Chaura in Gorakhpur (UP), a peaceful demonstration turned violent, clashing with police and burning down the station, killing 22 policemen. Believing satyagrahis needed further training before mass struggle, Gandhi called off the movement."
        },
        diagram: "",
        hashtags: ["#ChauriChaura", "#NonCooperation", "#CBSEMCQ"],
        source_ref: "NCERT Ch 2 — Section 2",
        grade: 10,
        subject: "SST",
        engagement: { likes: 67, comments: [] }
      },
      {
        id: "sst_4",
        type: "timeline",
        title: "The Salt March: Sabarmati to Dandi (1930)",
        body: "On 12 March 1930, Mahatma Gandhi accompanied by 78 trusted volunteers walked 240 miles from Sabarmati Ashram to coastal Dandi. On 6 April, he reached Dandi, boiled seawater, and broke the salt law, launching the Civil Disobedience Movement.",
        analogy: "",
        quiz: null,
        diagram: "",
        hashtags: ["#DandiMarch", "#SaltSatyagraha", "#CivilDisobedience"],
        source_ref: "NCERT Ch 2 — Section 3.1",
        grade: 10,
        subject: "SST",
        engagement: { likes: 85, comments: [] }
      },
      {
        id: "sst_5",
        type: "apply",
        title: "Why Salt Was Chosen: A Universal Household Connector",
        body: "Why salt instead of income tax or land revenue? Salt was consumed by the poorest peasant and richest zamindar alike. By taxing a basic necessity of life, the British revealed the oppressive face of colonial rule to every single household in India.",
        analogy: "",
        quiz: null,
        diagram: "",
        hashtags: ["#WhySalt", "#SatyagrahaStrategy", "#IndianHistory"],
        source_ref: "NCERT Ch 2 Analysis",
        grade: 10,
        subject: "SST",
        engagement: { likes: 92, comments: [] }
      },
      {
        id: "sst_6",
        type: "recap",
        title: "Checkpoint 1: Non-Cooperation vs Civil Disobedience",
        body: "Crucial CBSE 3-mark distinction: Non-Cooperation (1920-22) urged refusal to cooperate with British institutions. Civil Disobedience (1930-34) went further: actively breaking colonial laws, starting with the Salt Law.",
        analogy: "",
        quiz: null,
        diagram: "",
        hashtags: ["#Recap", "#3MarkComparison", "#BoardExamTip"],
        source_ref: "CBSE Marking Scheme Comparison",
        grade: 10,
        subject: "SST",
        engagement: { likes: 89, comments: [] }
      },
      {
        id: "sst_7",
        type: "exam_tip",
        title: "Map Work Alert: 3 Locations Always Tested!",
        body: "CBSE SST Map Question (2 marks guarantee): (1) Chauri Chaura (UP) — calling off Non-Cooperation. (2) Dandi (Gujarat) — Civil Disobedience break. (3) Amritsar (Punjab) — Jallianwala Bagh.",
        analogy: "",
        quiz: null,
        diagram: "",
        hashtags: ["#MapWork", "#GuaranteedMarks", "#Class10SST"],
        source_ref: "CBSE Class 10 Map Syllabus",
        grade: 10,
        subject: "SST",
        engagement: { likes: 120, comments: [] }
      },
      {
        id: "sst_8",
        type: "key_point",
        title: "The Poona Pact (September 1932)",
        body: "Dr. B.R. Ambedkar clashed with Gandhi at the Second Round Table Conference demanding separate electorates for Dalits. After Gandhi fast unto death in Yerwada jail, the Poona Pact gave reserved seats in provincial and central councils, but voted by general electorate.",
        analogy: "",
        quiz: null,
        diagram: "",
        hashtags: ["#PoonaPact", "#Ambedkar", "#Gandhi"],
        source_ref: "NCERT Ch 2 — Section 3.3",
        grade: 10,
        subject: "SST",
        engagement: { likes: 78, comments: [] }
      },
      {
        id: "sst_9",
        type: "summary",
        title: "Sense of Collective Belonging",
        body: "Nationalism captured hearts through figures like Bharat Mata (painted by Abanindranath Tagore), reviving folk songs by Rabindranath Tagore, and the Swaraj tricolour flag designed by Gandhiji with a spinning wheel.",
        analogy: "",
        quiz: null,
        diagram: "",
        hashtags: ["#BharatMata", "#SwarajFlag", "#SSTRevisionDone"],
        source_ref: "NCERT Ch 2 — Section 4",
        grade: 10,
        subject: "SST",
        engagement: { likes: 104, comments: [] }
      }
    ]
  }
};
