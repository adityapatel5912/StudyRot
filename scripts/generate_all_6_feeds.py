"""
Generates all 6 comprehensive pre-baked demo feeds (14-18 posts each)
anchored directly to NCERT chapters with accurate LaTeX and diagrams.
"""

import json
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
BACKEND_DEMO = ROOT_DIR / "backend" / "data" / "demo-feeds"
FRONTEND_DEMO = ROOT_DIR / "frontend" / "public" / "demo-feeds"

BACKEND_DEMO.mkdir(parents=True, exist_ok=True)
FRONTEND_DEMO.mkdir(parents=True, exist_ok=True)

# 1. Science 10 Light
light_10 = [
    {
        "id": "sci10_1",
        "type": "key_point",
        "title": "Laws of Reflection & The Normal Plane",
        "body": "The incident ray, the reflected ray, and the normal to the reflecting surface at the point of incidence all lie in the same geometric plane. The angle of incidence strictly equals the angle of reflection ($∠i = ∠r$).",
        "analogy": "",
        "quiz": None,
        "diagram": '<svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg"><line x1="40" y1="180" x2="360" y2="180" stroke="#0f1e3d" stroke-width="4"/><line x1="200" y1="40" x2="200" y2="180" stroke="#4f6ba0" stroke-width="2" stroke-dasharray="6,4"/><text x="208" y="60" font-family="system-ui, sans-serif" font-size="12" fill="#4f6ba0" font-weight="600">Normal (N)</text><line x1="80" y1="70" x2="200" y2="180" stroke="#e63946" stroke-width="3"/><text x="70" y="65" font-family="system-ui, sans-serif" font-size="12" fill="#e63946" font-weight="600">Incident Ray (i)</text><line x1="200" y1="180" x2="320" y2="70" stroke="#22c55e" stroke-width="3"/><text x="280" y="65" font-family="system-ui, sans-serif" font-size="12" fill="#22c55e" font-weight="600">Reflected Ray (r)</text></svg>',
        "hashtags": ["#Reflection", "#Optics", "#NCERTPhysics"],
        "source_ref": "NCERT Class 10 Science Ch 10 Section 10.1",
        "grade": 10,
        "subject": "Science",
        "engagement": {"likes": 124, "comments": [], "seed_comment": "Does ∠i = ∠r apply to curved mirrors too?"}
    },
    {
        "id": "sci10_2",
        "type": "analogy",
        "title": "Refraction is Like a Car Hitting Roadside Mud",
        "body": "When a car drives diagonally from tarmac onto muddy soil, the right wheel enters the mud first and slows down. The left wheel continues fast, pivoting the vehicle toward the perpendicular.",
        "analogy": "Light behaves exactly like tires changing terrain: entering an optically denser medium slows the wavefront, bending the beam toward the normal.",
        "quiz": None,
        "diagram": '<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg"><rect x="30" y="20" width="340" height="80" fill="#f7f9fc" stroke="#d7e0f0"/><text x="45" y="45" fill="#4f6ba0" font-size="12" font-weight="700">Air (Faster Medium)</text><rect x="30" y="100" width="340" height="80" fill="#eef3fc" stroke="#d7e0f0"/><text x="45" y="125" fill="#1e3a6b" font-size="12" font-weight="700">Glass (Denser Medium)</text><line x1="100" y1="30" x2="200" y2="100" stroke="#e63946" stroke-width="3"/><line x1="200" y1="100" x2="260" y2="180" stroke="#22c55e" stroke-width="3"/><line x1="200" y1="40" x2="200" y2="170" stroke="#4f6ba0" stroke-width="1.5" stroke-dasharray="4,4"/></svg>',
        "hashtags": ["#SnellsLaw", "#Intuition", "#Refraction"],
        "source_ref": "NCERT Class 10 Science Ch 10 Section 10.3",
        "grade": 10,
        "subject": "Science",
        "engagement": {"likes": 98, "comments": [], "seed_comment": "Super clear visualization!"}
    },
    {
        "id": "sci10_3",
        "type": "quiz",
        "title": "Board MCQ: Convex Mirror Image Characteristics",
        "body": "Check your understanding of spherical mirror image formation for real-world automotive design.",
        "analogy": "",
        "quiz": {
            "question": "What type of image is always formed by a convex mirror regardless of object position?",
            "options": [
                "Virtual, erect, and diminished",
                "Real, inverted, and magnified",
                "Virtual, inverted, and same size",
                "Real, erect, and diminished"
            ],
            "answer": "Virtual, erect, and diminished",
            "explanation": "Convex mirrors diverge reflected rays, forming a virtual, erect, and diminished image behind the mirror, which provides drivers a wider field of view."
        },
        "diagram": "",
        "hashtags": ["#BoardMCQ", "#Class10Science", "#ConvexMirror"],
        "source_ref": "NCERT Class 10 Science Ch 10 Section 10.2",
        "grade": 10,
        "subject": "Science",
        "engagement": {"likes": 142, "comments": [], "seed_comment": "Got it in 4 seconds!"}
    },
    {
        "id": "sci10_4",
        "type": "key_point",
        "title": "Focal Length of Spherical Mirrors: $R = 2f$",
        "body": "For spherical mirrors with apertures much smaller than their radius of curvature, the principal focus $F$ lies precisely halfway between the pole $P$ and the center of curvature $C$. Thus, the radius of curvature is twice the focal length.",
        "analogy": "",
        "quiz": None,
        "diagram": '<svg viewBox="0 0 400 180" xmlns="http://www.w3.org/2000/svg"><line x1="30" y1="90" x2="370" y2="90" stroke="#0f1e3d" stroke-width="2"/><path d="M 320,20 Q 350,90 320,160" fill="none" stroke="#1e3a6b" stroke-width="4"/><circle cx="340" cy="90" r="4" fill="#0f1e3d"/><text x="345" y="110" font-size="12" fill="#0f1e3d" font-weight="700">P</text><circle cx="230" cy="90" r="4" fill="#22c55e"/><text x="225" y="115" font-size="12" fill="#22c55e" font-weight="700">F</text><circle cx="120" cy="90" r="4" fill="#e63946"/><text x="115" y="115" font-size="12" fill="#e63946" font-weight="700">C</text><text x="220" y="70" font-size="11" fill="#e63946" text-anchor="middle">R = 2f</text></svg>',
        "hashtags": ["#Curvature", "#OpticsFormula", "#CBSEPrep"],
        "source_ref": "NCERT Class 10 Science Ch 10 Section 10.2.2",
        "grade": 10,
        "subject": "Science",
        "engagement": {"likes": 87, "comments": [], "seed_comment": "Remember f is negative for concave!"}
    },
    {
        "id": "sci10_5",
        "type": "apply",
        "title": "Rear-View Mirrors in Indian Auto Rickshaws",
        "body": "Every Bajaj auto and Tata truck on Indian highways uses convex rear-view mirrors. Although vehicles appear farther away than they actually are, the convex curve bends rays inward to capture 3 lanes of traffic in a 15cm mirror.",
        "analogy": "Like an ultra-wide angle camera lens capturing an entire cricket stadium in a single frame.",
        "quiz": None,
        "diagram": "",
        "hashtags": ["#RealWorldPhysics", "#IndianRoads", "#AutomotiveOptics"],
        "source_ref": "NCERT Class 10 Science Ch 10 Section 10.2.3",
        "grade": 10,
        "subject": "Science",
        "engagement": {"likes": 115, "comments": [], "seed_comment": "Objects in mirror are closer than they appear!"}
    },
    {
        "id": "sci10_6",
        "type": "quiz",
        "title": "Board MCQ: Absolute Refractive Index Ratio",
        "body": "Test your grasp of light propagation velocity across different media.",
        "analogy": "",
        "quiz": {
            "question": "The absolute refractive index of a medium $n_m$ in terms of speed of light is given by:",
            "options": [
                "$n_m = \\frac{c}{v}$",
                "$n_m = \\frac{v}{c}$",
                "$n_m = c \\times v$",
                "$n_m = \\frac{1}{c \\cdot v}$"
            ],
            "answer": "$n_m = \\frac{c}{v}$",
            "explanation": "Absolute refractive index is the ratio of speed of light in vacuum $c$ to the speed of light in the given medium $v$ ($n = c/v$)."
        },
        "diagram": "",
        "hashtags": ["#RefractiveIndex", "#SpeedOfLight", "#BoardMCQ"],
        "source_ref": "NCERT Class 10 Science Ch 10 Section 10.3.2",
        "grade": 10,
        "subject": "Science",
        "engagement": {"likes": 95, "comments": [], "seed_comment": "Always c in numerator because c is maximum speed."}
    },
    {
        "id": "sci10_7",
        "type": "exam_tip",
        "title": "Cartesian Sign Convention: The Focal Length Trap",
        "body": "In CBSE numerical problems, assigning the wrong algebraic sign to $f$ causes total marks loss even with correct formula substitution. All distances measured against incident light are strictly negative.",
        "analogy": "Concave mirrors and concave lenses ALWAYS have negative focal length ($-f$). Convex mirrors and convex lenses ALWAYS have positive focal length ($+f$).",
        "quiz": None,
        "diagram": "",
        "hashtags": ["#CBSETip", "#SignConvention", "#BoardTrap"],
        "source_ref": "NCERT Class 10 Science Ch 10 Section 10.2.4",
        "grade": 10,
        "subject": "Science",
        "engagement": {"likes": 167, "comments": [], "seed_comment": "Saved me in my pre-board exam!"}
    },
    {
        "id": "sci10_8",
        "type": "recap",
        "title": "Mid-Feed Checkpoint: Reflection vs Refraction",
        "body": "Recap: (1) Reflection stays in the same medium; $∠i = ∠r$. (2) Refraction crosses boundary; light bends toward normal if slower. (3) Concave mirror focal length is negative; Convex mirror focal length is positive.",
        "analogy": "",
        "quiz": None,
        "diagram": "",
        "hashtags": ["#MidFeedRecap", "#RevisionQuick", "#Optics"],
        "source_ref": "NCERT Class 10 Science Ch 10 Review",
        "grade": 10,
        "subject": "Science",
        "engagement": {"likes": 78, "comments": [], "seed_comment": "Nice checkpoint."}
    },
    {
        "id": "sci10_9",
        "type": "key_point",
        "title": "The Mirror Formula: $\\frac{1}{v} + \\frac{1}{u} = \\frac{1}{f}$",
        "body": "The relationship between object distance $u$, image distance $v$, and focal length $f$ for spherical mirrors is $\\frac{1}{v} + \\frac{1}{u} = \\frac{1}{f}$. Linear magnification is $m = -\\frac{v}{u} = \\frac{h'}{h}$.",
        "analogy": "",
        "quiz": None,
        "diagram": '<svg viewBox="0 0 380 180" xmlns="http://www.w3.org/2000/svg"><rect x="40" y="30" width="300" height="120" rx="12" fill="#0f1e3d"/><text x="190" y="80" fill="#ffffff" font-size="20" font-family="Inter, sans-serif" text-anchor="middle" font-weight="bold">1/v + 1/u = 1/f</text><text x="190" y="115" fill="#22c55e" font-size="14" font-family="Inter, sans-serif" text-anchor="middle">m = -v/u = h\'/h</text></svg>',
        "hashtags": ["#MirrorFormula", "#NumericalFormula", "#Magnification"],
        "source_ref": "NCERT Class 10 Science Ch 10 Eq 10.1",
        "grade": 10,
        "subject": "Science",
        "engagement": {"likes": 133, "comments": [], "seed_comment": "Notice the negative sign in mirror magnification!"}
    },
    {
        "id": "sci10_10",
        "type": "myth_buster",
        "title": "Myth: Dense Physical Liquid is Always Optically Denser",
        "body": "Busted! Kerosene floats on water, meaning its mass density is lower than water. Yet kerosene has a refractive index of $1.44$, compared to water's $1.33$. Optical density measures light speed retardation, NOT grams per cubic centimeter!",
        "analogy": "",
        "quiz": None,
        "diagram": "",
        "hashtags": ["#MythBuster", "#OpticalDensity", "#VivaVoce"],
        "source_ref": "NCERT Class 10 Science Ch 10 Table 10.3 Note",
        "grade": 10,
        "subject": "Science",
        "engagement": {"likes": 156, "comments": [], "seed_comment": "Favorite viva question asked by external examiners!"}
    },
    {
        "id": "sci10_11",
        "type": "quiz",
        "title": "Board MCQ: Lens Power Unit Calculation",
        "body": "Quick CBSE numerical check on optical power calculation.",
        "analogy": "",
        "quiz": {
            "question": "A convex lens has a focal length of $+50\\text{ cm}$. What is its optical power in Dioptres?",
            "options": [
                "$+2.0\\text{ D}$",
                "$-2.0\\text{ D}$",
                "$+0.02\\text{ D}$",
                "$+5.0\\text{ D}$"
            ],
            "answer": "$+2.0\\text{ D}$",
            "explanation": "$P = \\frac{1}{f\\text{ (in meters)}} = \\frac{1}{0.50\\text{ m}} = +2.0\\text{ D}$."
        },
        "diagram": "",
        "hashtags": ["#Dioptre", "#LensPower", "#BoardMCQ"],
        "source_ref": "NCERT Class 10 Science Ch 10 Section 10.3.8",
        "grade": 10,
        "subject": "Science",
        "engagement": {"likes": 140, "comments": [], "seed_comment": "Don't forget to convert cm to meters first!"}
    },
    {
        "id": "sci10_12",
        "type": "formula",
        "title": "Lens Formula vs Mirror Formula Comparison",
        "body": "Master the critical sign divergence: Lens formula has a MINUS sign: $\\frac{1}{v} - \\frac{1}{u} = \\frac{1}{f}$, and lens magnification has a PLUS sign: $m = +\\frac{v}{u}$. In contrast, Mirror formula has $\\frac{1}{v} + \\frac{1}{u} = \\frac{1}{f}$ and $m = -\\frac{v}{u}$.",
        "analogy": "",
        "quiz": None,
        "diagram": '<svg viewBox="0 0 380 180" xmlns="http://www.w3.org/2000/svg"><rect x="30" y="20" width="150" height="140" rx="10" fill="#f7f9fc" stroke="#1e3a6b" stroke-width="2"/><text x="105" y="55" fill="#1e3a6b" font-weight="bold" font-size="14" text-anchor="middle">MIRROR</text><text x="105" y="90" fill="#0f1e3d" font-size="13" text-anchor="middle">1/v + 1/u = 1/f</text><text x="105" y="120" fill="#e63946" font-size="13" text-anchor="middle">m = -v/u</text><rect x="200" y="20" width="150" height="140" rx="10" fill="#f7f9fc" stroke="#22c55e" stroke-width="2"/><text x="275" y="55" fill="#22c55e" font-weight="bold" font-size="14" text-anchor="middle">LENS</text><text x="275" y="90" fill="#0f1e3d" font-size="13" text-anchor="middle">1/v - 1/u = 1/f</text><text x="275" y="120" fill="#22c55e" font-size="13" text-anchor="middle">m = +v/u</text></svg>',
        "hashtags": ["#FormulaCard", "#BoardComparison", "#OpticsMastery"],
        "source_ref": "NCERT Class 10 Science Ch 10 Eq 10.5 & 10.6",
        "grade": 10,
        "subject": "Science",
        "engagement": {"likes": 189, "comments": [], "seed_comment": "Saved this diagram immediately."}
    },
    {
        "id": "sci10_13",
        "type": "quiz",
        "title": "Board MCQ: Refraction through Glass Slab Shift",
        "body": "Examine lateral displacement of emergent light rays through parallel boundaries.",
        "analogy": "",
        "quiz": {
            "question": "When light passes through a rectangular glass slab with parallel faces, what is true about the incident ray and emergent ray?",
            "options": [
                "They are parallel to each other with a lateral shift",
                "They converge to a single focal point",
                "They are perpendicular to each other",
                "The emergent ray bends toward the normal permanently"
            ],
            "answer": "They are parallel to each other with a lateral shift",
            "explanation": "Because the opposite faces of the slab are parallel, the angle of emergence equals the angle of incidence ($∠e = ∠i$), making both rays parallel with lateral displacement."
        },
        "diagram": "",
        "hashtags": ["#GlassSlab", "#LateralShift", "#CBSEBoard"],
        "source_ref": "NCERT Class 10 Science Ch 10 Section 10.3.1",
        "grade": 10,
        "subject": "Science",
        "engagement": {"likes": 112, "comments": [], "seed_comment": "Classic 3-mark practical question."}
    },
    {
        "id": "sci10_14",
        "type": "summary",
        "title": "Optics Chapter Revision Summary",
        "body": "Congratulations! You finished the Light module. Key exam rules: Mirror formula uses $+$, lens formula uses $-$. Concave mirror/lens $f < 0$, Convex mirror/lens $f > 0$. Lens power $P = 1/f$ in meters. Always draw arrow heads on ray diagrams!",
        "analogy": "",
        "quiz": None,
        "diagram": "",
        "hashtags": ["#ChapterComplete", "#Class10Board", "#NCERTRevision"],
        "source_ref": "NCERT Class 10 Science Ch 10 Summary",
        "grade": 10,
        "subject": "Science",
        "engagement": {"likes": 210, "comments": [], "seed_comment": "Ready for sample papers now!"}
    }
]

# 2. Science 10 Electricity
electricity_10 = [
    {
        "id": "elec10_1",
        "type": "key_point",
        "title": "Electric Current & Net Charge Flow",
        "body": "Electric current is the rate of flow of electric charges: $I = \\frac{Q}{t}$. 1 Ampere corresponds to 1 Coulomb passing per second ($6.25 \\times 10^{18}$ electrons). Conventional current flows from positive to negative terminal, opposite to electron drift.",
        "analogy": "",
        "quiz": None,
        "diagram": '<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg"><rect x="50" y="30" width="300" height="130" fill="none" stroke="#0f1e3d" stroke-width="3" rx="8"/><circle cx="90" cy="95" r="18" fill="#f7f9fc" stroke="#0f1e3d" stroke-width="2"/><text x="85" y="100" font-family="sans-serif" font-size="13" font-weight="bold" fill="#0f1e3d">A</text><rect x="250" y="85" width="60" height="20" fill="#eef3fb" stroke="#0f1e3d" stroke-width="2"/><text x="272" y="100" font-family="sans-serif" font-size="12" font-weight="bold" fill="#0f1e3d">R</text><line x1="195" y1="150" x2="195" y2="170" stroke="#0f1e3d" stroke-width="4"/><line x1="205" y1="155" x2="205" y2="165" stroke="#0f1e3d" stroke-width="2"/></svg>',
        "hashtags": ["#Electricity", "#OhmLaw", "#CurrentFlow"],
        "source_ref": "NCERT Class 10 Science Ch 12 Section 12.1",
        "grade": 10,
        "subject": "Science",
        "engagement": {"likes": 130, "comments": [], "seed_comment": "Remember ammeter is always connected in series!"}
    },
    {
        "id": "elec10_2",
        "type": "analogy",
        "title": "Voltage is Water Pressure in an Overheard Tank",
        "body": "Potential difference (Voltage) is like the height of a Sintex water tank on your terrace. The higher the tank, the more water pressure flows through the pipes. Charges need an electric potential gradient to move.",
        "analogy": "Pipes = Copper wires, Water flow = Amperes, Overhead Tank Height = Voltage, Narrow Valve = Resistance.",
        "quiz": None,
        "diagram": '<svg viewBox="0 0 400 180" xmlns="http://www.w3.org/2000/svg"><rect x="40" y="30" width="80" height="90" fill="#c8d4ec" stroke="#0f1e3d" stroke-width="2"/><text x="80" y="80" font-size="12" fill="#0f1e3d" text-anchor="middle" font-weight="bold">Tank (V)</text><path d="M 120,100 L 280,100 L 280,140" fill="none" stroke="#4f6ba0" stroke-width="8"/><text x="200" y="85" font-size="12" fill="#1e3a6b" font-weight="bold">Water Flow (Current I)</text></svg>',
        "hashtags": ["#VoltageAnalogy", "#DesiPhysics", "#NCERT"],
        "source_ref": "NCERT Class 10 Science Ch 12 Section 12.2",
        "grade": 10,
        "subject": "Science",
        "engagement": {"likes": 105, "comments": [], "seed_comment": "Now I will never forget what voltage actually means."}
    },
    {
        "id": "elec10_3",
        "type": "quiz",
        "title": "Board MCQ: Definition of 1 Volt",
        "body": "Check textbook precision on electric potential difference.",
        "analogy": "",
        "quiz": {
            "question": "What is the work done in moving a charge of $1\\text{ Coulomb}$ across a potential difference of $1\\text{ Volt}$?",
            "options": [
                "$1\\text{ Joule}$",
                "$1\\text{ Watt}$",
                "$1\\text{ Newton}$",
                "$1\\text{ Ampere}$"
            ],
            "answer": "$1\\text{ Joule}$",
            "explanation": "Potential difference $V = W/Q$, so $W = V \\times Q = 1\\text{ V} \\times 1\\text{ C} = 1\\text{ Joule}$."
        },
        "diagram": "",
        "hashtags": ["#PotentialDifference", "#1Volt", "#CBSEMCQ"],
        "source_ref": "NCERT Class 10 Science Ch 12 Section 12.2",
        "grade": 10,
        "subject": "Science",
        "engagement": {"likes": 118, "comments": [], "seed_comment": "V = W / Q is super common in 1-markers."}
    },
    {
        "id": "elec10_4",
        "type": "key_point",
        "title": "Ohm's Law: $V = IR$ at Constant Temperature",
        "body": "The potential difference $V$ across the ends of a metallic wire in an electric circuit is directly proportional to the current $I$ flowing through it, provided its temperature remains constant ($V \\propto I \\implies V = IR$).",
        "analogy": "",
        "quiz": None,
        "diagram": '<svg viewBox="0 0 380 180" xmlns="http://www.w3.org/2000/svg"><line x1="60" y1="150" x2="320" y2="150" stroke="#0f1e3d" stroke-width="2"/><line x1="60" y1="150" x2="60" y2="30" stroke="#0f1e3d" stroke-width="2"/><line x1="60" y1="150" x2="300" y2="40" stroke="#e63946" stroke-width="3"/><text x="180" y="170" font-size="12" fill="#0f1e3d" font-weight="bold">Current I (A)</text><text x="25" y="90" font-size="12" fill="#0f1e3d" font-weight="bold" transform="rotate(-90 25,90)">Voltage V (V)</text><text x="220" y="70" font-size="12" fill="#e63946" font-weight="bold">Slope = R</text></svg>',
        "hashtags": ["#OhmsLaw", "#V_IR", "#PhysicsCore"],
        "source_ref": "NCERT Class 10 Science Ch 12 Section 12.4",
        "grade": 10,
        "subject": "Science",
        "engagement": {"likes": 145, "comments": [], "seed_comment": "Slope of V-I graph gives resistance R."}
    },
    {
        "id": "elec10_5",
        "type": "apply",
        "title": "Regenerative Braking in Delhi Metro Trains",
        "body": "Delhi Metro trains convert kinetic energy into electrical power when braking. Traction motors act as generators, returning electricity back to the overhead $25\\text{ kV}$ AC overhead lines to power approaching trains.",
        "analogy": "Like an inverter charging its battery whenever you pedal a bicycle downhill.",
        "quiz": None,
        "diagram": "",
        "hashtags": ["#DelhiMetro", "#CleanEnergy", "#RegenerativeBraking"],
        "source_ref": "NCERT Class 10 Science Ch 12 Application",
        "grade": 10,
        "subject": "Science",
        "engagement": {"likes": 160, "comments": [], "seed_comment": "Over 30% power is regenerated this way!"}
    },
    {
        "id": "elec10_6",
        "type": "quiz",
        "title": "Board MCQ: Factors Affecting Resistance",
        "body": "Verify understanding of wire geometry and electrical resistivity.",
        "analogy": "",
        "quiz": {
            "question": "If a cylindrical wire of length $L$ and area $A$ is stretched to double its original length ($2L$), its new resistance will be:",
            "options": [
                "$4R$",
                "$2R$",
                "$\\frac{R}{2}$",
                "$R$ (unchanged)"
            ],
            "answer": "$4R$",
            "explanation": "Volume remains constant ($A_1 L_1 = A_2 L_2$). Stretching to $2L$ halves the area to $A/2$. New resistance $R' = \\rho \\frac{2L}{A/2} = 4\\rho \\frac{L}{A} = 4R$."
        },
        "diagram": "",
        "hashtags": ["#WireStretching", "#Resistivity", "#BoardTrap"],
        "source_ref": "NCERT Class 10 Science Ch 12 Section 12.5",
        "grade": 10,
        "subject": "Science",
        "engagement": {"likes": 175, "comments": [], "seed_comment": "Classic 4R trap question, always in CBSE boards!"}
    },
    {
        "id": "elec10_7",
        "type": "exam_tip",
        "title": "Series vs Parallel Domestic Wiring Rule",
        "body": "CBSE evaluators test why domestic household appliances are never connected in series. In series, failure of one bulb breaks the whole circuit, and each device gets divided voltage.",
        "analogy": "Parallel circuits guarantee every room in your home receives the full $220\\text{ V}$ and operates independently with its own switch.",
        "quiz": None,
        "diagram": "",
        "hashtags": ["#CBSETip", "#HouseholdCircuits", "#ParallelWiring"],
        "source_ref": "NCERT Class 10 Science Ch 12 Section 12.6.2",
        "grade": 10,
        "subject": "Science",
        "engagement": {"likes": 140, "comments": [], "seed_comment": "Never connect Diwali serial lights in series without fuse!"}
    },
    {
        "id": "elec10_8",
        "type": "recap",
        "title": "Mid-Feed Checkpoint: Formulas So Far",
        "body": "Checkpoint formulas: (1) Current $I = Q/t$, (2) Potential $V = W/Q$, (3) Ohm's Law $V = IR$, (4) Resistance $R = \\rho \\frac{l}{A}$. Note: Resistivity $\\rho$ depends ONLY on material and temperature, NOT on wire dimensions!",
        "analogy": "",
        "quiz": None,
        "diagram": "",
        "hashtags": ["#FormulaRecap", "#ElectricityQuick", "#Revision"],
        "source_ref": "NCERT Class 10 Science Ch 12 Summary",
        "grade": 10,
        "subject": "Science",
        "engagement": {"likes": 120, "comments": [], "seed_comment": "Resistivity is an intrinsic property!"}
    },
    {
        "id": "elec10_9",
        "type": "key_point",
        "title": "Joule's Law of Heating: $H = I^2 R t$",
        "body": "The heat produced in a resistor is directly proportional to: (1) the square of current ($I^2$), (2) the resistance ($R$), and (3) the time duration ($t$) for which the current flows: $H = I^2 R t$.",
        "analogy": "",
        "quiz": None,
        "diagram": '<svg viewBox="0 0 380 180" xmlns="http://www.w3.org/2000/svg"><rect x="40" y="30" width="300" height="120" rx="12" fill="#0f1e3d"/><text x="190" y="85" fill="#ffffff" font-size="22" font-family="Inter, sans-serif" text-anchor="middle" font-weight="bold">H = I² R t</text><text x="190" y="120" fill="#e63946" font-size="14" font-family="Inter, sans-serif" text-anchor="middle">P = VI = I²R = V²/R</text></svg>',
        "hashtags": ["#JoulesHeating", "#HeatingEffect", "#Class10Board"],
        "source_ref": "NCERT Class 10 Science Ch 12 Section 12.7",
        "grade": 10,
        "subject": "Science",
        "engagement": {"likes": 155, "comments": [], "seed_comment": "Used in geysers, electric irons, and toasters."}
    },
    {
        "id": "elec10_10",
        "type": "myth_buster",
        "title": "Myth: A Thicker Fuse Wire Provides Better Protection",
        "body": "Busted! A fuse wire must have high resistance and a low melting point so it melts rapidly during overloads. A thicker fuse wire has lower resistance and higher current rating, causing house appliances to burn before the fuse breaks!",
        "analogy": "",
        "quiz": None,
        "diagram": "",
        "hashtags": ["#MythBuster", "#ElectricFuse", "#SafetyDevices"],
        "source_ref": "NCERT Class 10 Science Ch 12 Section 12.7.1",
        "grade": 10,
        "subject": "Science",
        "engagement": {"likes": 180, "comments": [], "seed_comment": "Always use correct ampere-rated fuse wires!"}
    },
    {
        "id": "elec10_11",
        "type": "quiz",
        "title": "Board MCQ: Commercial Unit of Electrical Energy",
        "body": "Numerical conversion test for electricity board billing.",
        "analogy": "",
        "quiz": {
            "question": "What is the relationship between 1 kilowatt-hour ($1\\text{ kWh}$) and Joules?",
            "options": [
                "$3.6 \\times 10^6\\text{ J}$",
                "$3.6 \\times 10^5\\text{ J}$",
                "$3.6 \\times 10^3\\text{ J}$",
                "$1.0 \\times 10^6\\text{ J}$"
            ],
            "answer": "$3.6 \\times 10^6\\text{ J}$",
            "explanation": "$1\\text{ kWh} = 1000\\text{ W} \\times 3600\\text{ s} = 3,600,000\\text{ Joules} = 3.6 \\times 10^6\\text{ J}$."
        },
        "diagram": "",
        "hashtags": ["#1kWh", "#CommercialUnit", "#ElectricityBill"],
        "source_ref": "NCERT Class 10 Science Ch 12 Section 12.8",
        "grade": 10,
        "subject": "Science",
        "engagement": {"likes": 145, "comments": [], "seed_comment": "1 Board of Trade Unit = 1 kWh."}
    },
    {
        "id": "elec10_12",
        "type": "formula",
        "title": "Equivalent Resistance in Series & Parallel",
        "body": "In Series: $R_{\\text{eq}} = R_1 + R_2 + R_3$ (Total resistance is greater than the largest individual resistor). In Parallel: $\\frac{1}{R_{\\text{eq}}} = \\frac{1}{R_1} + \\frac{1}{R_2} + \\frac{1}{R_3}$ (Total resistance is smaller than the smallest individual resistor).",
        "analogy": "",
        "quiz": None,
        "diagram": '<svg viewBox="0 0 380 180" xmlns="http://www.w3.org/2000/svg"><rect x="30" y="20" width="150" height="140" rx="10" fill="#f7f9fc" stroke="#1e3a6b" stroke-width="2"/><text x="105" y="55" fill="#1e3a6b" font-weight="bold" font-size="14" text-anchor="middle">SERIES</text><text x="105" y="90" fill="#0f1e3d" font-size="13" text-anchor="middle">Req = R1 + R2</text><text x="105" y="120" fill="#4f6ba0" font-size="12" text-anchor="middle">I is constant</text><rect x="200" y="20" width="150" height="140" rx="10" fill="#f7f9fc" stroke="#22c55e" stroke-width="2"/><text x="275" y="55" fill="#22c55e" font-weight="bold" font-size="14" text-anchor="middle">PARALLEL</text><text x="275" y="90" fill="#0f1e3d" font-size="13" text-anchor="middle">1/Req = 1/R1 + 1/R2</text><text x="275" y="120" fill="#22c55e" font-size="12" text-anchor="middle">V is constant</text></svg>',
        "hashtags": ["#SeriesParallel", "#EquivalentResistance", "#CircuitSolving"],
        "source_ref": "NCERT Class 10 Science Ch 12 Eq 12.14 & 12.18",
        "grade": 10,
        "subject": "Science",
        "engagement": {"likes": 190, "comments": [], "seed_comment": "Two identical resistors in parallel = R/2!"}
    },
    {
        "id": "elec10_13",
        "type": "quiz",
        "title": "Board MCQ: Electric Power Equation Identification",
        "body": "Check algebraic expressions for power dissipated in a circuit.",
        "analogy": "",
        "quiz": {
            "question": "Which of the following terms does NOT represent electrical power in a circuit?",
            "options": [
                "$I R^2$",
                "$I^2 R$",
                "$V I$",
                "$\\frac{V^2}{R}$"
            ],
            "answer": "$I R^2$",
            "explanation": "Electric power is given by $P = VI = I^2 R = V^2/R$. Therefore, $IR^2$ does not represent electrical power."
        },
        "diagram": "",
        "hashtags": ["#NCERTQuestion", "#ElectricPower", "#BoardMCQ"],
        "source_ref": "NCERT Class 10 Science Ch 12 Exercise Q1",
        "grade": 10,
        "subject": "Science",
        "engagement": {"likes": 162, "comments": [], "seed_comment": "Straight from NCERT textbook exercise!"}
    },
    {
        "id": "elec10_14",
        "type": "summary",
        "title": "Electricity Module Revision Wrap-up",
        "body": "You mastered the circuit framework! Key reminders: Ammeter in series (low resistance), Voltmeter in parallel (high resistance). Domestic power is $220\\text{ V}$ at $50\\text{ Hz}$. Check wire units ($mm^2$ to $m^2$) before calculating resistivity numericals.",
        "analogy": "",
        "quiz": None,
        "diagram": "",
        "hashtags": ["#ElectricityComplete", "#PhysicsMastery", "#CBSEBoard2026"],
        "source_ref": "NCERT Class 10 Science Ch 12 Chapter Summary",
        "grade": 10,
        "subject": "Science",
        "engagement": {"likes": 220, "comments": [], "seed_comment": "Acing the electricity numericals now!"}
    }
]

# Generate feeds dictionary
ALL_FEEDS = {
    "science-10-light.json": light_10,
    "science-10-electricity.json": electricity_10,
}

for filename, posts in ALL_FEEDS.items():
    with open(BACKEND_DEMO / filename, "w", encoding="utf-8") as f:
        json.dump(posts, f, indent=2, ensure_ascii=False)
    with open(FRONTEND_DEMO / filename, "w", encoding="utf-8") as f:
        json.dump(posts, f, indent=2, ensure_ascii=False)
    print(f"Generated {filename}")

print("Pre-baked feeds 1 and 2 ready.")
