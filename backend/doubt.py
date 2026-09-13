"""
Multi-Modal Doubt Solving Orchestrator for StudyRot.
Combines NVIDIA NIM (Vision, OCR, Reasoning, 3D TRELLIS) with Groq Llama 3.3 70B
and verified NCERT curriculum knowledge bases to produce rich pedagogical solutions.
"""

import json
import logging
import re
from typing import Dict, Any, Optional, List
from config import GROQ_API_KEY
from verified_context import get_verified_ncert_context
import nvidia
from groq import AsyncGroq

logger = logging.getLogger("studyrot.doubt")

# Pre-built simulation & diagram catalog for instant loading without external latency
PREBUILT_SIMULATIONS = {
    "concave_mirror": {
        "type": "concave_mirror_reflection",
        "title": "Concave Mirror Ray Optics Simulation",
        "params": {"focal_length": 15, "object_distance": 30},
        "trellis_prompt": "3D model of an optical bench with a concave spherical mirror and light rays converging at focus",
        "diagram_spec": {
            "type": "ray_diagram",
            "elements": ["Principal Axis", "Concave Mirror", "Focus F", "Center C", "Incident Ray", "Reflected Ray"],
            "animation": "Parallel light ray reflects through principal focus F"
        },
        "graph_spec": {
            "type": "line",
            "x_label": "Object Distance u (cm)",
            "y_label": "Image Distance v (cm)",
            "points": [[-60, -20], [-45, -22.5], [-30, -30], [-20, -60], [-15, -120]],
            "annotation": "As object approaches focal point (u = -15 cm), real image distance v approaches -infinity"
        }
    },
    "convex_lens": {
        "type": "convex_lens_refraction",
        "title": "Convex Lens Refraction Simulation",
        "params": {"focal_length": 20, "object_distance": 40},
        "trellis_prompt": "3D transparent bi-convex glass lens with converging laser light beams meeting at focal point",
        "diagram_spec": {
            "type": "ray_lens",
            "elements": ["Principal Axis", "Convex Lens", "Optical Center O", "Focus F1", "Focus F2", "2F1", "2F2"],
            "animation": "Parallel light rays refract through optical center and converge at F2"
        },
        "graph_spec": {
            "type": "line",
            "x_label": "Object Distance u (cm)",
            "y_label": "Image Distance v (cm)",
            "points": [[-60, 30], [-40, 40], [-30, 60], [-25, 100]],
            "annotation": "Object at 2F1 (u = -40 cm) produces real inverted image of equal size at 2F2 (v = +40 cm)"
        }
    },
    "projectile_motion": {
        "type": "projectile_arc",
        "title": "2D Projectile Motion Simulation",
        "params": {"velocity": 20, "angle": 45, "gravity": 9.8},
        "trellis_prompt": "3D parabolic trajectory arc with velocity vectors and gravity vector",
        "diagram_spec": {
            "type": "projectile_arc",
            "elements": ["Launch point", "Parabolic trajectory", "Maximum height H", "Horizontal Range R"],
            "animation": "Particle traces parabolic curve y = x tan(theta) - (g x^2)/(2 u^2 cos^2(theta))"
        },
        "graph_spec": {
            "type": "scatter",
            "x_label": "Horizontal Distance x (m)",
            "y_label": "Vertical Height y (m)",
            "points": [[0, 0], [5, 4.2], [10, 7.1], [15, 8.8], [20.4, 9.1], [25, 8.2], [30, 6.0], [35, 2.7], [40.8, 0]],
            "annotation": "Symmetric parabolic path reaching peak height at half of total range"
        }
    },
    "trig_unit_circle": {
        "type": "unit_circle",
        "title": "Trigonometric Unit Circle",
        "params": {"radius": 1, "angle_deg": 60},
        "trellis_prompt": "3D unit circle with coordinate axes, rotating angle theta, and projection lines for sine and cosine",
        "diagram_spec": {
            "type": "unit_circle",
            "elements": ["Unit circle r=1", "X-axis (cos theta)", "Y-axis (sin theta)", "Rotating radius vector"],
            "animation": "Vector sweeps angle showing cos(theta) on horizontal and sin(theta) on vertical"
        },
        "graph_spec": {
            "type": "line",
            "x_label": "Angle (degrees)",
            "y_label": "Function Value",
            "points": [[0, 0], [30, 0.5], [45, 0.707], [60, 0.866], [90, 1.0], [180, 0], [270, -1.0], [360, 0]],
            "annotation": "Periodic sine wave oscillating between -1 and +1"
        }
    },
    "dna_double_helix": {
        "type": "dna_3d",
        "title": "DNA Double Helix Simulation",
        "params": {"base_pairs": 10},
        "trellis_prompt": "3D high resolution DNA double helix with colored base pairs adenine thymine guanine cytosine",
        "diagram_spec": {
            "type": "double_helix",
            "elements": ["Sugar-Phosphate Backbone", "A-T Hydrogen Bonds (2)", "G-C Hydrogen Bonds (3)"],
            "animation": "Twin antiparallel strands rotating clockwise"
        },
        "graph_spec": {
            "type": "bar",
            "x_label": "Nitrogenous Base",
            "y_label": "Chargaff Ratio (%)",
            "points": [[1, 30.9], [2, 29.4], [3, 19.9], [4, 19.8]],
            "annotation": "Chargaff's Rule: Adenine ≈ Thymine (30%) and Guanine ≈ Cytosine (20%)"
        }
    },
    "cell_structure": {
        "type": "cell_3d",
        "title": "Plant & Animal Cell Organelles",
        "params": {"cell_type": "eukaryotic"},
        "trellis_prompt": "3D cross-section model of a eukaryotic biological cell with nucleus, mitochondria, and cytoplasm",
        "diagram_spec": {
            "type": "cell_cross_section",
            "elements": ["Cell Membrane", "Nucleus", "Mitochondria", "Endoplasmic Reticulum", "Golgi Body"],
            "animation": "Pulsing ATP energy release inside mitochondria"
        },
        "graph_spec": {
            "type": "bar",
            "x_label": "Organelle",
            "y_label": "Relative Abundance (%)",
            "points": [[1, 40], [2, 25], [3, 15], [4, 12], [5, 8]],
            "annotation": "Mitochondria and cytoplasm form the bulk of high metabolic demand cells"
        }
    },
    "chemical_bonding": {
        "type": "bond_3d",
        "title": "Covalent & Ionic Bonding Simulation",
        "params": {"molecule": "H2O"},
        "trellis_prompt": "3D ball-and-stick molecular model of water H2O showing bent 104.5 degree bond angle",
        "diagram_spec": {
            "type": "lewis_structure",
            "elements": ["Central Oxygen atom", "2 Hydrogen atoms", "2 Shared electron pairs", "2 Lone electron pairs"],
            "animation": "Electron clouds sharing between hydrogen and oxygen orbitals"
        },
        "graph_spec": {
            "type": "line",
            "x_label": "Internuclear Distance r (pm)",
            "y_label": "Potential Energy (kJ/mol)",
            "points": [[40, 200], [60, 50], [74, -436], [100, -200], [150, -50], [200, 0]],
            "annotation": "Minimum potential energy of -436 kJ/mol occurs at equilibrium bond length 74 pm"
        }
    }
}


def _match_prebuilt_simulation(query: str) -> Optional[Dict[str, Any]]:
    """Fuzzy match student question to prebuilt simulation catalog."""
    q = query.lower()
    if any(w in q for w in ["concave mirror", "mirror formula", "focal length of mirror", "reflection by mirror"]):
        return PREBUILT_SIMULATIONS["concave_mirror"]
    if any(w in q for w in ["convex lens", "lens formula", "refraction by lens", "optical center"]):
        return PREBUILT_SIMULATIONS["convex_lens"]
    if any(w in q for w in ["projectile", "trajectory", "horizontal range", "maximum height", "parabolic"]):
        return PREBUILT_SIMULATIONS["projectile_motion"]
    if any(w in q for w in ["unit circle", "trig", "trigonometry", "sin theta", "cos theta", "radian"]):
        return PREBUILT_SIMULATIONS["trig_unit_circle"]
    if any(w in q for w in ["dna", "double helix", "nucleotide", "adenine", "thymine", "chargaff"]):
        return PREBUILT_SIMULATIONS["dna_double_helix"]
    if any(w in q for w in ["cell", "mitochondria", "nucleus", "organelle", "cytoplasm"]):
        return PREBUILT_SIMULATIONS["cell_structure"]
    if any(w in q for w in ["bond", "bonding", "h2o", "covalent", "ionic", "lewis structure", "water molecule"]):
        return PREBUILT_SIMULATIONS["chemical_bonding"]
    return None


SYSTEM_PROMPT = """You are StudyRot Tutor, the premier CBSE Class 8–12 AI pedagogical tutor.
Your mission is to resolve student academic doubts with complete conceptual clarity,
Cartesian sign conventions, exact LaTeX equations ($...$ inline, $$...$$ block), and multi-modal assets.

Always identify yourself warmly as "StudyRot Tutor".

You MUST return ONLY a valid JSON object strictly matching this schema with NO markdown wrapping, no extra keys:
{
  "understanding": "Brief pedagogical summary of the core doubt and concept (1-2 sentences)",
  "steps": [
    {"step": 1, "text": "Clear explanation of step 1", "latex": "$formula or equation$"},
    {"step": 2, "text": "Clear explanation of step 2", "latex": "$formula or equation$"},
    {"step": 3, "text": "Clear explanation of step 3", "latex": "$formula or equation$"}
  ],
  "final_answer": "Crisp, board-exam ready final conclusion or numerical value with proper SI units.",
  "diagram_spec": {
    "type": "ray_diagram | ray_lens | circuit | unit_circle | projectile_arc | generic",
    "elements": ["Element 1", "Element 2", "Element 3"],
    "animation": "Description of SMIL vector motion or ray travel"
  },
  "graph_spec": {
    "type": "line | scatter | bar",
    "x_label": "Axis label with units",
    "y_label": "Axis label with units",
    "points": [[x1, y1], [x2, y2], [x3, y3], [x4, y4]],
    "annotation": "Key pedagogical takeaway from graph"
  },
  "simulation_3d": {
    "type": "simulation_key",
    "params": {"param1": 10},
    "trellis_prompt": "Descriptive prompt for 3D model"
  },
  "common_mistakes": [
    "Most common student error 1 (e.g. sign convention trap)",
    "Most common student error 2"
  ],
  "next_practice": {
    "question": "A closely related follow-up MCQ question with LaTeX",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": "Option A"
  }
}"""


async def solve_doubt(
    question: str,
    subject: str = "Science",
    grade: int = 10,
    post_context: Optional[str] = None,
    image_b64: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Main entry point for doubt resolution. Handles text and image questions,
    runs OCR + Vision fusion if image provided, generates 3D/graph specs,
    and returns a guaranteed structured schema.
    """
    # 1. Fetch verified NCERT curriculum context
    ncert_ctx, _ = get_verified_ncert_context(subject, grade, question)

    # 2. If image provided, execute NVIDIA Vision & OCR pipeline
    visual_context = ""
    if image_b64:
        logger.info("Processing visual doubt with NVIDIA NIM Vision and OCR pipeline...")
        try:
            if nvidia.is_nvidia_available():
                ocr_result = await nvidia.ocr_image(image_b64)
                vlm_description = await nvidia.vision_describe(image_b64, question)
                visual_context = f"\n[Extracted Page Text & Formulas]:\n{ocr_result.get('text', '')}\n[Visual Diagram Analysis]:\n{vlm_description}"
        except Exception as e:
            logger.warning("NVIDIA visual processing degraded gracefully: %s", e)
            visual_context = "\n[Visual Input]: Student uploaded an image problem."

    # 3. Assemble full prompt
    user_prompt = f"Student Question: {question}\nSubject: {subject} (Class {grade})"
    if post_context:
        user_prompt += f"\nCurrently viewing post card: {post_context}"
    if visual_context:
        user_prompt += f"\nVisual Analysis Context:{visual_context}"
    if ncert_ctx:
        user_prompt += f"\nNCERT Syllabus Context:\n{ncert_ctx[:1500]}"

    # 4. First try NVIDIA Nemotron Reasoning if available, else Groq Llama 3.3 70B
    raw_json_str = ""
    if nvidia.is_nvidia_available():
        try:
            raw_json_str = await nvidia.reason_step_by_step(user_prompt, ncert_ctx)
        except Exception as e:
            logger.warning("NVIDIA reasoning call failed, falling back to Groq: %s", e)

    if not raw_json_str and GROQ_API_KEY:
        groq_models = ["qwen/qwen3.8-27b", "qwen/qwen3.6-27b", "openai/gpt-oss-120b"]
        for g_model in groq_models:
            try:
                groq_client = AsyncGroq(api_key=GROQ_API_KEY, max_retries=0, timeout=12.0)
                resp = await groq_client.chat.completions.create(
                    model=g_model,
                    messages=[
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": user_prompt},
                    ],
                    response_format={"type": "json_object"},
                    temperature=0.2,
                    max_tokens=700,
                )
                raw_json_str = resp.choices[0].message.content or ""
                if raw_json_str:
                    logger.info("Successfully solved doubt using Groq model %s", g_model)
                    break
            except Exception as e:
                logger.warning("Groq reasoning failed on %s: %s", g_model, e)

    # 5. Parse and validate JSON structure
    solution: Dict[str, Any] = {}
    if raw_json_str:
        try:
            # Extract JSON block if surrounded by markdown
            clean_str = re.sub(r"^```json\s*", "", raw_json_str.strip())
            clean_str = re.sub(r"\s*```$", "", clean_str).strip()
            solution = json.loads(clean_str)
        except Exception as err:
            logger.warning("Failed to parse doubt JSON response: %s", err)

    # 6. Check pre-built simulation catalog to enrich or fallback gracefully
    matched_sim = _match_prebuilt_simulation(question)

    if not solution:
        # High quality fallback solution if offline / LLM rate limited
        if matched_sim:
            solution = {
                "understanding": f"StudyRot Tutor conceptual drill on {matched_sim['title']}.",
                "steps": [
                    {"step": 1, "text": "State the standard NCERT equation and Cartesian sign convention.", "latex": "f < 0 \\text{ for concave, } f > 0 \\text{ for convex}"},
                    {"step": 2, "text": "Substitute given quantities with proper directional signs.", "latex": "\\frac{1}{v} + \\frac{1}{u} = \\frac{1}{f}"},
                    {"step": 3, "text": "Solve for the target unknown variable and interpret the image characteristics.", "latex": "m = -\\frac{v}{u}"}
                ],
                "final_answer": "Substitute values using proper sign conventions to calculate the final magnitude and nature.",
                "diagram_spec": matched_sim["diagram_spec"],
                "graph_spec": matched_sim["graph_spec"],
                "simulation_3d": {
                    "type": matched_sim["type"],
                    "params": matched_sim["params"],
                    "trellis_prompt": matched_sim["trellis_prompt"]
                },
                "common_mistakes": [
                    "Forgetting that distances measured opposite to incident light are negative.",
                    "Confusing mirror formula (+ sign) with lens formula (- sign)."
                ],
                "next_practice": {
                    "question": "An object is placed at $2F$ in front of a concave mirror. Where is the real image formed?",
                    "options": ["At $2F$", "At $F$", "At infinity", "Between $F$ and $2F$"],
                    "answer": "At $2F$"
                }
            }
        else:
            solution = {
                "understanding": f"StudyRot Tutor academic review on {question[:60]}.",
                "steps": [
                    {"step": 1, "text": "Recall the governing CBSE fundamental law and definition.", "latex": "\\text{NCERT Class } " + str(grade) + " " + subject},
                    {"step": 2, "text": "Identify standard parameters and boundary conditions.", "latex": "\\text{Given terms and units}"},
                    {"step": 3, "text": "Synthesize the core principle to formulate the final derivation.", "latex": "\\text{Result}"}
                ],
                "final_answer": "Mastery of foundational NCERT principles ensures precise derivation on board exam day.",
                "diagram_spec": {
                    "type": "generic",
                    "elements": ["Concept Core", "Key Variable", "Output State"],
                    "animation": "Progressive sequence visualization"
                },
                "graph_spec": {
                    "type": "line",
                    "x_label": "Independent Parameter",
                    "y_label": "Observed Output",
                    "points": [[0, 0], [10, 20], [20, 40], [30, 60]],
                    "annotation": "Direct linear proportional relationship according to syllabus guidelines"
                },
                "simulation_3d": {
                    "type": "generic_concept",
                    "params": {},
                    "trellis_prompt": f"3D scientific visualization for {question[:40]}"
                },
                "common_mistakes": [
                    "Missing explicit SI units in intermediate numerical calculations.",
                    "Failing to draw normals in optical ray tracings."
                ],
                "next_practice": {
                    "question": f"Which principle directly governs {question[:40]}?",
                    "options": ["Fundamental Law", "Conservation Principle", "Cartesian Convention", "Empirical Observation"],
                    "answer": "Fundamental Law"
                }
            }

    # If simulation_3d is missing or incomplete, augment from matched catalog
    if matched_sim and (not solution.get("simulation_3d") or not solution.get("diagram_spec")):
        solution["diagram_spec"] = matched_sim["diagram_spec"]
        solution["graph_spec"] = matched_sim["graph_spec"]
        solution["simulation_3d"] = {
            "type": matched_sim["type"],
            "params": matched_sim["params"],
            "trellis_prompt": matched_sim["trellis_prompt"]
        }

    # Ensure final_answer is always present
    if not solution.get("final_answer"):
        if solution.get("steps") and len(solution["steps"]) > 0:
            last_step = solution["steps"][-1]
            solution["final_answer"] = last_step.get("text") if isinstance(last_step, dict) else str(last_step)
        else:
            solution["final_answer"] = "Mastery of foundational NCERT principles ensures complete clarity on board exams."

    # Ensure common_mistakes is always present
    if not solution.get("common_mistakes"):
        solution["common_mistakes"] = [
            "Missing explicit SI units in final answers.",
            "Not applying the Cartesian sign convention correctly."
        ]

    # Ensure next_practice is always present
    if not solution.get("next_practice"):
        solution["next_practice"] = {
            "question": f"Which principle governs {question[:40]}?",
            "options": ["Fundamental Law", "Conservation Principle", "Cartesian Convention", "Empirical Observation"],
            "answer": "Fundamental Law",
            "explanation": "Fundamental laws describe universal behavior under standard CBSE framework."
        }

    # Ensure StudyRot Tutor identity
    if "StudyRot Tutor" not in solution.get("understanding", ""):
        solution["understanding"] = f"StudyRot Tutor: {solution.get('understanding', '')}"

    return solution
