/**
 * Curated CBSE sample demo feeds matching NCERT curriculum
 * Covers:
 * 1. Science Class 10: "Light — Reflection and Refraction"
 * 2. Maths Class 12: "Parabola and Conic Sections"
 * 3. SST Class 10: "Indian National Movement"
 */

export const SAMPLE_FEEDS = {
  science_10: {
    subject: "Science",
    grade: 10,
    topic: "Light — Reflection and Refraction",
    posts: [
      {
        type: "key_point",
        title: "Laws of Reflection & The Normal Line",
        body: "The incident ray, reflected ray, and the normal to the mirror at the point of incidence all lie in the exact same plane. Angle of incidence always equals angle of reflection (∠i = ∠r).",
        analogy: "",
        quiz: null,
        diagram: `<svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg">
  <!-- Mirror Surface -->
  <line x1="40" y1="190" x2="360" y2="190" stroke="#0f1e3d" stroke-width="4"/>
  <!-- Mirror Hatching -->
  <line x1="60" y1="190" x2="50" y2="205" stroke="#4f6ba0" stroke-width="2"/>
  <line x1="120" y1="190" x2="110" y2="205" stroke="#4f6ba0" stroke-width="2"/>
  <line x1="180" y1="190" x2="170" y2="205" stroke="#4f6ba0" stroke-width="2"/>
  <line x1="240" y1="190" x2="230" y2="205" stroke="#4f6ba0" stroke-width="2"/>
  <line x1="300" y1="190" x2="290" y2="205" stroke="#4f6ba0" stroke-width="2"/>
  <!-- Normal Line -->
  <line x1="200" y1="40" x2="200" y2="190" stroke="#4f6ba0" stroke-width="2" stroke-dasharray="6,4"/>
  <text x="208" y="60" font-family="Inter, system-ui, sans-serif" font-size="12" fill="#4f6ba0" font-weight="600">Normal (N)</text>
  <!-- Incident Ray -->
  <line x1="80" y1="70" x2="200" y2="190" stroke="#e63946" stroke-width="3">
    <animate attributeName="stroke-dashoffset" from="200" to="0" dur="1.2s" fill="freeze"/>
  </line>
  <text x="70" y="60" font-family="Inter, system-ui, sans-serif" font-size="12" fill="#e63946" font-weight="600">Incident Ray (i)</text>
  <!-- Reflected Ray -->
  <line x1="200" y1="190" x2="320" y2="70" stroke="#22c55e" stroke-width="3">
    <animate attributeName="stroke-dashoffset" from="200" to="0" dur="1.2s" begin="1.2s" fill="freeze"/>
  </line>
  <text x="270" y="60" font-family="Inter, system-ui, sans-serif" font-size="12" fill="#22c55e" font-weight="600">Reflected Ray (r)</text>
  <!-- Angle arcs -->
  <path d="M 180,170 Q 190,160 200,165" fill="none" stroke="#e63946" stroke-width="2"/>
  <text x="175" y="155" font-family="Inter, system-ui, sans-serif" font-size="11" fill="#e63946">∠i</text>
  <path d="M 200,165 Q 210,160 220,170" fill="none" stroke="#22c55e" stroke-width="2"/>
  <text x="215" y="155" font-family="Inter, system-ui, sans-serif" font-size="11" fill="#22c55e">∠r</text>
</svg>`,
        hashtags: ["#Reflection", "#Optics", "#NCERTPhysics"],
        source_ref: "NCERT Ch 10 — Light",
        grade: 10,
        subject: "Science"
      },
      {
        type: "analogy",
        title: "Snell's Law is Like a Car Hitting Mud",
        body: "When light travels from air into denser glass, it bends towards the normal. Think of your bicycle wheels going from smooth Delhi tarmac into monsoon mud at an angle: the first wheel slows down, swinging the frame inwards.",
        analogy: "One wheel slows in muddy grass before the other, steering the whole bike toward the perpendicular.",
        quiz: null,
        diagram: `<svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg">
  <rect x="40" y="20" width="320" height="90" fill="#f7f9fc" stroke="#d7e0f0" stroke-width="1"/>
  <rect x="40" y="110" width="320" height="110" fill="#c8d4ec" opacity="0.4"/>
  <line x1="40" y1="110" x2="360" y2="110" stroke="#16294f" stroke-width="2"/>
  <text x="50" y="50" font-family="Inter, system-ui, sans-serif" font-size="12" fill="#1e3a6b" font-weight="700">Rarer Medium (Air, n₁)</text>
  <text x="50" y="140" font-family="Inter, system-ui, sans-serif" font-size="12" fill="#0f1e3d" font-weight="700">Denser Medium (Glass, n₂)</text>
  <!-- Normal -->
  <line x1="200" y1="30" x2="200" y2="200" stroke="#4f6ba0" stroke-width="1.5" stroke-dasharray="4,4"/>
  <!-- Ray bending -->
  <line x1="100" y1="40" x2="200" y2="110" stroke="#e63946" stroke-width="3"/>
  <line x1="200" y1="110" x2="250" y2="200" stroke="#1e3a6b" stroke-width="3">
    <animate attributeName="stroke-dashoffset" from="150" to="0" dur="1.2s" fill="freeze"/>
  </line>
  <circle cx="200" cy="110" r="4" fill="#e63946"/>
  <circle r="6" fill="#22c55e">
    <animateMotion dur="2.4s" repeatCount="indefinite" path="M 100,40 L 200,110 L 250,200"/>
  </circle>
</svg>`,
        hashtags: ["#Refraction", "#SnellsLaw", "#Class10Science"],
        source_ref: "NCERT Ch 10 — Refraction",
        grade: 10,
        subject: "Science"
      },
      {
        type: "formula",
        title: "Mirror Formula & Focal Length",
        body: "The mirror formula connects object distance (u), image distance (v), and focal length (f): 1/v + 1/u = 1/f. In spherical mirrors, focal length is exactly half the radius of curvature: f = R/2.",
        analogy: "",
        quiz: null,
        diagram: `<svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg">
  <!-- Principal axis -->
  <line x1="30" y1="120" x2="370" y2="120" stroke="#4f6ba0" stroke-width="1.5"/>
  <!-- Concave mirror curve -->
  <path d="M 330,30 Q 300,120 330,210" fill="none" stroke="#0f1e3d" stroke-width="4"/>
  <!-- Optical marks -->
  <circle cx="160" cy="120" r="4" fill="#0f1e3d"/>
  <text x="155" y="145" font-family="Inter, system-ui, sans-serif" font-size="12" fill="#0f1e3d" font-weight="700">C</text>
  <circle cx="240" cy="120" r="4" fill="#0f1e3d"/>
  <text x="236" y="145" font-family="Inter, system-ui, sans-serif" font-size="12" fill="#0f1e3d" font-weight="700">F</text>
  <circle cx="315" cy="120" r="4" fill="#0f1e3d"/>
  <text x="312" y="145" font-family="Inter, system-ui, sans-serif" font-size="12" fill="#0f1e3d" font-weight="700">P</text>
  <!-- Formula label box -->
  <rect x="50" y="40" width="160" height="50" rx="8" fill="#ffffff" stroke="#e63946" stroke-width="2"/>
  <text x="65" y="70" font-family="Inter, system-ui, sans-serif" font-size="16" fill="#e63946" font-weight="800">1/v + 1/u = 1/f</text>
</svg>`,
        hashtags: ["#MirrorFormula", "#BoardPrep", "#Class10"],
        source_ref: "NCERT Ch 10 — Spherical Mirrors",
        grade: 10,
        subject: "Science"
      },
      {
        type: "quiz",
        title: "Board Exam Speed MCQ: Focal Length",
        body: "Answer this frequent CBSE Class 10 board exam question before the ticking timer runs out!",
        analogy: "",
        quiz: {
          question: "A spherical concave mirror has a radius of curvature of 30 cm. What is its focal length?",
          options: [
            "15 cm",
            "30 cm",
            "60 cm",
            "7.5 cm"
          ],
          answer: "15 cm",
          explanation: "Focal length f = R / 2. For R = 30 cm, f = 30 / 2 = 15 cm (negative in Cartesian sign convention)."
        },
        diagram: "",
        hashtags: ["#CBSEQuiz", "#Target100", "#ScienceMCQ"],
        source_ref: "NCERT Ch 10 — Practice MCQ",
        grade: 10,
        subject: "Science"
      },
      {
        type: "myth_buster",
        title: "Myth: Light Travels at 3×10⁸ m/s Everywhere",
        body: "Busted! 3×10⁸ m/s is light's speed ONLY in vacuum. Inside water it drops to ~2.25×10⁸ m/s, and in diamond down to ~1.24×10⁸ m/s. The refractive index n = c / v measures how much it decelerates.",
        analogy: "",
        quiz: null,
        diagram: `<svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg">
  <rect x="50" y="30" width="300" height="35" rx="6" fill="#0f1e3d"/>
  <text x="65" y="53" font-family="Inter, system-ui, sans-serif" font-size="12" fill="#ffffff">Vacuum: 3.00 × 10⁸ m/s (n = 1.0)</text>
  <rect x="50" y="80" width="240" height="35" rx="6" fill="#1e3a6b">
    <animate attributeName="width" from="300" to="240" dur="1s" fill="freeze"/>
  </rect>
  <text x="65" y="103" font-family="Inter, system-ui, sans-serif" font-size="12" fill="#ffffff">Water: 2.25 × 10⁸ m/s (n = 1.33)</text>
  <rect x="50" y="130" width="180" height="35" rx="6" fill="#4f6ba0">
    <animate attributeName="width" from="300" to="180" dur="1s" fill="freeze"/>
  </rect>
  <text x="65" y="153" font-family="Inter, system-ui, sans-serif" font-size="12" fill="#ffffff">Glass: 2.00 × 10⁸ m/s (n = 1.5)</text>
  <rect x="50" y="180" width="120" height="35" rx="6" fill="#e63946">
    <animate attributeName="width" from="300" to="120" dur="1s" fill="freeze"/>
  </rect>
  <text x="65" y="203" font-family="Inter, system-ui, sans-serif" font-size="12" fill="#ffffff">Diamond: 1.24 × 10⁸ m/s (n = 2.42)</text>
</svg>`,
        hashtags: ["#MythBuster", "#RefractiveIndex", "#OpticsFacts"],
        source_ref: "NCERT Ch 10 — Refraction Index",
        grade: 10,
        subject: "Science"
      },
      {
        type: "summary",
        title: "2-Minute Light Revision Recap",
        body: "Concave mirrors form real & inverted images (except when object is between F and P). Convex mirrors ALWAYS produce virtual, erect, diminished images — which is why they are fitted as rear-view mirrors in cars.",
        analogy: "",
        quiz: null,
        diagram: `<svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg">
  <circle cx="120" cy="120" r="60" fill="none" stroke="#1e3a6b" stroke-width="2"/>
  <circle cx="280" cy="120" r="60" fill="none" stroke="#22c55e" stroke-width="2"/>
  <text x="75" y="115" font-family="Inter, system-ui, sans-serif" font-size="12" fill="#1e3a6b" font-weight="700">Concave</text>
  <text x="65" y="135" font-family="Inter, system-ui, sans-serif" font-size="10" fill="#4f6ba0">Real / Magnified</text>
  <text x="245" y="115" font-family="Inter, system-ui, sans-serif" font-size="12" fill="#22c55e" font-weight="700">Convex</text>
  <text x="240" y="135" font-family="Inter, system-ui, sans-serif" font-size="10" fill="#4f6ba0">Virtual / Wide View</text>
</svg>`,
        hashtags: ["#Summary", "#Class10Boards", "#Flashcard"],
        source_ref: "NCERT Ch 10 — Chapter Summary",
        grade: 10,
        subject: "Science"
      }
    ]
  },

  maths_12: {
    subject: "Maths",
    grade: 12,
    topic: "Parabola & Conic Sections",
    posts: [
      {
        type: "key_point",
        title: "Standard Equation of Parabola: y² = 4ax",
        body: "A parabola is the locus of a point whose distance from a fixed point (focus) equals its distance from a fixed line (directrix). For y² = 4ax, the focus sits at (a, 0) and the directrix equation is x = -a.",
        analogy: "",
        quiz: null,
        diagram: `<svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg">
  <line x1="40" y1="120" x2="360" y2="120" stroke="#4f6ba0" stroke-width="1.5"/>
  <line x1="140" y1="20" x2="140" y2="220" stroke="#4f6ba0" stroke-width="1.5"/>
  <!-- Directrix x = -a -->
  <line x1="80" y1="20" x2="80" y2="220" stroke="#e63946" stroke-width="2" stroke-dasharray="4,4"/>
  <text x="50" y="40" font-family="Inter, system-ui, sans-serif" font-size="11" fill="#e63946" font-weight="700">x = -a</text>
  <!-- Focus S(a, 0) -->
  <circle cx="200" cy="120" r="4" fill="#0f1e3d"/>
  <text x="195" y="140" font-family="Inter, system-ui, sans-serif" font-size="11" fill="#0f1e3d" font-weight="700">S(a,0)</text>
  <!-- Parabola curve -->
  <path d="M 330,30 Q 140,120 330,210" fill="none" stroke="#e63946" stroke-width="3"
        stroke-dasharray="400" stroke-dashoffset="400">
    <animate attributeName="stroke-dashoffset" from="400" to="0" dur="1.6s" fill="freeze"/>
  </path>
</svg>`,
        hashtags: ["#Parabola", "#Class12Maths", "#CoordinateGeometry"],
        source_ref: "NCERT Ch 11 — Conic Sections",
        grade: 12,
        subject: "Maths"
      },
      {
        type: "quiz",
        title: "Class 12 Numerical: Length of Latus Rectum",
        body: "Calculate the latus rectum for the standard CBSE board parabola problem.",
        analogy: "",
        quiz: {
          question: "What is the length of the latus rectum of the parabola y² = 12x?",
          options: [
            "12",
            "6",
            "3",
            "24"
          ],
          answer: "12",
          explanation: "Comparing y² = 12x with y² = 4ax gives 4a = 12. The length of the latus rectum is strictly 4a = 12 units."
        },
        diagram: "",
        hashtags: ["#LatusRectum", "#CBSEMaths", "#Score100"],
        source_ref: "NCERT Ch 11 — Parabola Exercises",
        grade: 12,
        subject: "Maths"
      }
    ]
  },

  sst_10: {
    subject: "SST",
    grade: 10,
    topic: "Indian National Movement",
    posts: [
      {
        type: "timeline",
        title: "Key Milestones of Freedom Struggle",
        body: "From the Champaran Satyagraha in 1917 to the Dandi Salt March in 1930 and Quit India Movement in 1942, Mahatma Gandhi mobilized millions across India through non-violent resistance.",
        analogy: "",
        quiz: null,
        diagram: `<svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg">
  <line x1="40" y1="120" x2="360" y2="120" stroke="#4f6ba0" stroke-width="3"/>
  <circle cx="80" cy="120" r="10" fill="#0f1e3d" opacity="0">
    <animate attributeName="opacity" from="0" to="1" dur="0.5s" begin="0.1s" fill="freeze"/>
  </circle>
  <text x="50" y="90" font-family="Inter, system-ui, sans-serif" font-size="11" fill="#0f1e3d" font-weight="700">1919: Rowlatt</text>
  <circle cx="180" cy="120" r="10" fill="#1e3a6b" opacity="0">
    <animate attributeName="opacity" from="0" to="1" dur="0.5s" begin="0.6s" fill="freeze"/>
  </circle>
  <text x="145" y="160" font-family="Inter, system-ui, sans-serif" font-size="11" fill="#1e3a6b" font-weight="700">1930: Dandi March</text>
  <circle cx="300" cy="120" r="10" fill="#22c55e" opacity="0">
    <animate attributeName="opacity" from="0" to="1" dur="0.5s" begin="1.1s" fill="freeze"/>
  </circle>
  <text x="260" y="90" font-family="Inter, system-ui, sans-serif" font-size="11" fill="#22c55e" font-weight="700">1942: Quit India</text>
</svg>`,
        hashtags: ["#NationalismInIndia", "#Class10History", "#NCERT"],
        source_ref: "NCERT History Ch 2 — Nationalism in India",
        grade: 10,
        subject: "SST"
      },
      {
        type: "quiz",
        title: "Nationalism in India: Dandi March",
        body: "Test your board history knowledge on the Civil Disobedience Movement.",
        analogy: "",
        quiz: {
          question: "From which ashram did Mahatma Gandhi begin his historic Dandi March on 12-Mar-1930?",
          options: [
            "Sabarmati Ashram",
            "Sevagram Ashram",
            "Wardha Ashram",
            "Kochrab Ashram"
          ],
          answer: "Sabarmati Ashram",
          explanation: "Gandhiji marched 240 miles from Sabarmati Ashram in Ahmedabad to the coastal village of Dandi to break the British salt tax."
        },
        diagram: "",
        hashtags: ["#DandiMarch", "#SSTBoards", "#HistoryQuiz"],
        source_ref: "NCERT History Ch 2",
        grade: 10,
        subject: "SST"
      }
    ]
  },
  electricity_10: {
    subject: "Science",
    grade: 10,
    topic: "Electricity — Circuits & Ohm's Law",
    posts: [
      {
        type: "key_point",
        title: "Ohm's Law: The Heart of Circuit Theory",
        body: "The electric current (I) through a metallic conductor is directly proportional to the potential difference (V) across its ends, provided temperature remains constant: V = I × R.",
        analogy: "",
        quiz: null,
        diagram: `<svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg">
  <!-- Circuit loop wire -->
  <rect x="50" y="40" width="300" height="150" rx="8" fill="none" stroke="#0f1e3d" stroke-width="3"/>
  <!-- Battery symbol at bottom -->
  <rect x="170" y="186" width="60" height="8" fill="#ffffff"/>
  <line x1="185" y1="175" x2="185" y2="205" stroke="#e63946" stroke-width="3"/>
  <line x1="205" y1="180" x2="205" y2="200" stroke="#0f1e3d" stroke-width="2"/>
  <text x="175" y="222" font-family="Inter, system-ui, sans-serif" font-size="12" fill="#e63946" font-weight="700">+ V -</text>
  <!-- Resistor zigzag on top -->
  <rect x="150" y="36" width="100" height="8" fill="#ffffff"/>
  <path d="M 150,40 L 160,25 L 175,55 L 190,25 L 205,55 L 220,25 L 235,55 L 245,40" fill="none" stroke="#1e3a6b" stroke-width="3"/>
  <text x="175" y="18" font-family="Inter, system-ui, sans-serif" font-size="13" fill="#1e3a6b" font-weight="700">Resistor (R)</text>
  <!-- Ammeter on right -->
  <circle cx="350" cy="115" r="16" fill="#ffffff" stroke="#0f1e3d" stroke-width="2"/>
  <text x="345" y="120" font-family="Inter, system-ui, sans-serif" font-size="12" fill="#0f1e3d" font-weight="700">A</text>
  <!-- Current Flow moving dot -->
  <circle r="6" fill="#22c55e">
    <animateMotion dur="2.4s" repeatCount="indefinite"
      path="M 185,190 L 50,190 L 50,40 L 350,40 L 350,190 L 205,190"/>
  </circle>
  <text x="80" y="115" font-family="Inter, system-ui, sans-serif" font-size="13" fill="#22c55e" font-weight="700">Current (I) →</text>
</svg>`,
        hashtags: ["#OhmsLaw", "#Class10Physics", "#NCERT"],
        source_ref: "NCERT Ch 12 — Electricity",
        grade: 10,
        subject: "Science"
      },
      {
        type: "analogy",
        title: "Voltage is Like Water Tank Height",
        body: "Think of an overhead Sintex water tank on a Delhi terrace. Voltage is the water level: higher tank creates more pressure. Current is how fast water gushes out of the tap. Resistance is a narrow or silted pipe slowing the flow.",
        analogy: "Voltage = Water pressure; Current = Gallons per second flowing; Resistance = Pipe constriction.",
        quiz: null,
        diagram: `<svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg">
  <!-- Tank on left -->
  <rect x="50" y="40" width="80" height="90" rx="4" fill="#c8d4ec" stroke="#1e3a6b" stroke-width="2"/>
  <rect x="52" y="70" width="76" height="58" fill="#4f6ba0" opacity="0.6"/>
  <text x="62" y="60" font-family="Inter, system-ui, sans-serif" font-size="11" fill="#0f1e3d" font-weight="700">Pressure (V)</text>
  <!-- Pipe with constriction -->
  <path d="M 130,110 L 200,110 L 220,120 L 250,120 L 270,110 L 340,110" fill="none" stroke="#1e3a6b" stroke-width="6"/>
  <rect x="215" y="105" width="40" height="20" rx="4" fill="#fde8ea" stroke="#e63946" stroke-width="2"/>
  <text x="218" y="145" font-family="Inter, system-ui, sans-serif" font-size="11" fill="#e63946" font-weight="700">Resistance (R)</text>
  <text x="280" y="90" font-family="Inter, system-ui, sans-serif" font-size="11" fill="#22c55e" font-weight="700">Flow Rate (I)</text>
  <circle r="5" fill="#22c55e">
    <animateMotion dur="1.8s" repeatCount="indefinite" path="M 130,110 L 340,110"/>
  </circle>
</svg>`,
        hashtags: ["#DesiAnalogy", "#CurrentElectricity", "#PhysicsConcepts"],
        source_ref: "NCERT Ch 12 — Potential Difference",
        grade: 10,
        subject: "Science"
      },
      {
        type: "quiz",
        title: "Board Exam MCQ: Resistors in Parallel",
        body: "Calculate equivalent resistance before the timer expires!",
        analogy: "",
        quiz: {
          question: "Three resistors of values 2 Ω, 3 Ω, and 6 Ω are connected in parallel. What is their combined equivalent resistance?",
          options: [
            "1 Ω",
            "11 Ω",
            "3 Ω",
            "0.5 Ω"
          ],
          answer: "1 Ω",
          explanation: "1/Rp = 1/2 + 1/3 + 1/6 = (3 + 2 + 1)/6 = 6/6 = 1. Hence equivalent resistance Rp = 1 Ω."
        },
        diagram: "",
        hashtags: ["#ParallelResistors", "#CBSEBoardPrep", "#ElectricityQuiz"],
        source_ref: "NCERT Ch 12 — Resistors in Parallel",
        grade: 10,
        subject: "Science"
      },
      {
        type: "myth_buster",
        title: "Myth: Current Gets Consumed By The Bulb",
        body: "Busted! The current entering a light bulb equals the exact current exiting it. Electrons are not 'eaten'. What gets consumed is the electrical potential energy, converted into heat and radiant light photons.",
        analogy: "",
        quiz: null,
        diagram: `<svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg">
  <circle cx="200" cy="100" r="35" fill="#fde8ea" stroke="#e63946" stroke-width="2"/>
  <text x="185" y="105" font-family="Inter, system-ui, sans-serif" font-size="14" fill="#e63946" font-weight="700">Bulb</text>
  <line x1="60" y1="100" x2="165" y2="100" stroke="#0f1e3d" stroke-width="3"/>
  <text x="80" y="85" font-family="Inter, system-ui, sans-serif" font-size="12" fill="#0f1e3d" font-weight="700">Current In: 2 A</text>
  <line x1="235" y1="100" x2="340" y2="100" stroke="#0f1e3d" stroke-width="3"/>
  <text x="250" y="85" font-family="Inter, system-ui, sans-serif" font-size="12" fill="#0f1e3d" font-weight="700">Current Out: 2 A</text>
  <rect x="100" y="160" width="200" height="40" rx="8" fill="#e6f9ee" stroke="#22c55e" stroke-width="1.5"/>
  <text x="115" y="185" font-family="Inter, system-ui, sans-serif" font-size="12" fill="#166534" font-weight="600">Energy Delivered: Light + Heat</text>
</svg>`,
        hashtags: ["#MythBuster", "#ConservationOfCharge", "#BoardPrep"],
        source_ref: "NCERT Ch 12 — Electric Current",
        grade: 10,
        subject: "Science"
      },
      {
        type: "formula",
        title: "Joule's Law of Heating & Electrical Power",
        body: "The heat produced in a resistor is proportional to the square of current, resistance, and time: H = I²Rt. Electrical power P = V × I = I²R = V²/R. 1 kWh = 3.6 × 10⁶ Joules.",
        analogy: "",
        quiz: null,
        diagram: `<svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg">
  <rect x="50" y="40" width="300" height="60" rx="8" fill="#ffffff" stroke="#e63946" stroke-width="2"/>
  <text x="110" y="78" font-family="Inter, system-ui, sans-serif" font-size="20" fill="#e63946" font-weight="800">H = I² · R · t</text>
  <rect x="50" y="120" width="300" height="60" rx="8" fill="#ffffff" stroke="#0f1e3d" stroke-width="2"/>
  <text x="95" y="158" font-family="Inter, system-ui, sans-serif" font-size="18" fill="#0f1e3d" font-weight="700">P = V · I = I²R = V²/R</text>
</svg>`,
        hashtags: ["#JoulesHeating", "#PowerFormula", "#NCERTPhysics"],
        source_ref: "NCERT Ch 12 — Heating Effects",
        grade: 10,
        subject: "Science"
      }
    ]
  },
  trigonometry_10: {
    subject: "Maths",
    grade: 10,
    topic: "Trigonometry & Heights and Distances",
    posts: [
      {
        type: "key_point",
        title: "The Golden Triad: Sin, Cos & Tan",
        body: "In any right triangle with acute angle θ: sin θ = Perpendicular / Hypotenuse, cos θ = Base / Hypotenuse, tan θ = Perpendicular / Base. Always locate the side opposite to θ first — that is your Perpendicular!",
        analogy: "",
        quiz: null,
        diagram: `<svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg">
  <!-- Right triangle -->
  <polygon points="80,180 300,180 300,50" fill="#f7f9fc" stroke="#0f1e3d" stroke-width="3"/>
  <!-- Right angle marker -->
  <polyline points="280,180 280,160 300,160" fill="none" stroke="#0f1e3d" stroke-width="2"/>
  <!-- Angle theta arc -->
  <path d="M 120,180 A 40,40 0 0,0 115,160" fill="none" stroke="#e63946" stroke-width="2.5"/>
  <text x="125" y="168" font-family="Inter, system-ui, sans-serif" font-size="14" fill="#e63946" font-weight="700">θ</text>
  <!-- Side labels -->
  <text x="170" y="202" font-family="Inter, system-ui, sans-serif" font-size="13" fill="#0f1e3d" font-weight="700">Base (B)</text>
  <text x="310" y="120" font-family="Inter, system-ui, sans-serif" font-size="13" fill="#1e3a6b" font-weight="700">Perpendicular (P)</text>
  <text x="150" y="105" font-family="Inter, system-ui, sans-serif" font-size="13" fill="#22c55e" font-weight="700">Hypotenuse (H)</text>
  <!-- Animated ray along hypotenuse -->
  <line x1="80" y1="180" x2="300" y2="50" stroke="#e63946" stroke-width="3" stroke-dasharray="260" stroke-dashoffset="260">
    <animate attributeName="stroke-dashoffset" from="260" to="0" dur="1.5s" fill="freeze"/>
  </line>
</svg>`,
        hashtags: ["#Trigonometry", "#Class10Maths", "#BoardRevision"],
        source_ref: "NCERT Ch 8 — Introduction to Trigonometry",
        grade: 10,
        subject: "Maths"
      },
      {
        type: "analogy",
        title: "Measuring Qutub Minar from the Ground",
        body: "Stand 72 meters from Qutub Minar and look at the tip. Your clinometer records an angle of elevation of 45°. Since tan 45° = 1 = Height / 72m, the minar is 72 meters tall! Trigonometry gives you the power to measure monuments without climbing them.",
        analogy: "Angle of elevation + distance along ground + tan θ = instant height of any monument.",
        quiz: null,
        diagram: `<svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg">
  <!-- Ground line -->
  <line x1="40" y1="200" x2="360" y2="200" stroke="#4f6ba0" stroke-width="2"/>
  <!-- Monument Tower on right -->
  <rect x="290" y="50" width="30" height="150" fill="#1e3a6b"/>
  <polygon points="280,50 305,25 330,50" fill="#0f1e3d"/>
  <text x="280" y="22" font-family="Inter, system-ui, sans-serif" font-size="11" fill="#0f1e3d" font-weight="700">Tower Height (h)</text>
  <!-- Observer point -->
  <circle cx="80" cy="200" r="6" fill="#e63946"/>
  <text x="65" y="218" font-family="Inter, system-ui, sans-serif" font-size="11" fill="#0f1e3d" font-weight="700">Observer</text>
  <!-- Sight line -->
  <line x1="80" y1="200" x2="305" y2="25" stroke="#e63946" stroke-width="2" stroke-dasharray="6,4"/>
  <!-- Elevation Arc -->
  <path d="M 120,200 A 40,40 0 0,0 115,180" fill="none" stroke="#22c55e" stroke-width="2.5"/>
  <text x="125" y="190" font-family="Inter, system-ui, sans-serif" font-size="12" fill="#22c55e" font-weight="700">45°</text>
  <text x="160" y="218" font-family="Inter, system-ui, sans-serif" font-size="12" fill="#4f6ba0" font-weight="600">Distance = 72 m</text>
</svg>`,
        hashtags: ["#HeightsAndDistances", "#NCERTMaths", "#RealLifeMath"],
        source_ref: "NCERT Ch 9 — Some Applications of Trigonometry",
        grade: 10,
        subject: "Maths"
      },
      {
        type: "quiz",
        title: "Board Exam MCQ: Angle of Elevation",
        body: "Calculate the sun's angle before the timer buzzes!",
        analogy: "",
        quiz: {
          question: "If a 6 m vertical pole casts a shadow of 2√3 m on flat ground, what is the Sun's angle of elevation?",
          options: [
            "60°",
            "30°",
            "45°",
            "90°"
          ],
          answer: "60°",
          explanation: "tan θ = Height / Shadow = 6 / (2√3) = 3 / √3 = √3. Since tan 60° = √3, the Sun's angle of elevation is 60°."
        },
        diagram: "",
        hashtags: ["#MathsMCQ", "#BoardExam100", "#TrigQuiz"],
        source_ref: "NCERT Ch 9 — Practice MCQ",
        grade: 10,
        subject: "Maths"
      },
      {
        type: "myth_buster",
        title: "Myth: sin(A + B) = sin A + sin B",
        body: "Busted! Trigonometric functions are NOT algebraic multipliers! You cannot distribute 'sin' like a number into brackets. For example: sin(30° + 60°) = sin 90° = 1, but sin 30° + sin 60° = 1/2 + √3/2 ≈ 1.366.",
        analogy: "",
        quiz: null,
        diagram: `<svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg">
  <rect x="50" y="40" width="300" height="60" rx="8" fill="#fde8ea" stroke="#e63946" stroke-width="2"/>
  <text x="70" y="76" font-family="Inter, system-ui, sans-serif" font-size="16" fill="#e63946" font-weight="800">sin(A + B) ≠ sin A + sin B</text>
  <rect x="50" y="125" width="300" height="65" rx="8" fill="#e6f9ee" stroke="#22c55e" stroke-width="2"/>
  <text x="65" y="152" font-family="Inter, system-ui, sans-serif" font-size="14" fill="#166534" font-weight="700">sin(30° + 60°) = sin 90° = 1</text>
  <text x="65" y="175" font-family="Inter, system-ui, sans-serif" font-size="13" fill="#166534">sin 30° + sin 60° = 0.5 + 0.866 = 1.366</text>
</svg>`,
        hashtags: ["#CommonMistakes", "#CBSEExamTips", "#TrigPitfall"],
        source_ref: "NCERT Ch 8 — Identities",
        grade: 10,
        subject: "Maths"
      },
      {
        type: "formula",
        title: "Core Trigonometric Identities",
        body: "The 3 foundational identities tested every year in Section D: (1) sin²θ + cos²θ = 1; (2) 1 + tan²θ = sec²θ; (3) 1 + cot²θ = cosec²θ. All derived directly from Pythagoras' Theorem!",
        analogy: "",
        quiz: null,
        diagram: `<svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg">
  <rect x="40" y="30" width="320" height="50" rx="8" fill="#ffffff" stroke="#1e3a6b" stroke-width="2"/>
  <text x="100" y="62" font-family="Inter, system-ui, sans-serif" font-size="18" fill="#1e3a6b" font-weight="800">sin²θ + cos²θ = 1</text>
  <rect x="40" y="95" width="320" height="50" rx="8" fill="#0f1e3d" stroke-width="2"/>
  <text x="100" y="127" font-family="Inter, system-ui, sans-serif" font-size="16" fill="#0f1e3d" font-weight="700">1 + tan²θ = sec²θ</text>
  <rect x="40" y="160" width="320" height="50" rx="8" fill="#ffffff" stroke="#e63946" stroke-width="2"/>
  <text x="95" y="192" font-family="Inter, system-ui, sans-serif" font-size="16" fill="#e63946" font-weight="700">1 + cot²θ = cosec²θ</text>
</svg>`,
        hashtags: ["#Identities", "#Class10Board", "#SectionD"],
        source_ref: "NCERT Ch 8 — Trigonometric Identities",
        grade: 10,
        subject: "Maths"
      }
    ]
  }
};
