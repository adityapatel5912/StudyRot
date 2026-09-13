# StudyRot Deep Research Pipeline

A verified, structured knowledge base generator for CBSE Class 8–12 content across Science, Maths, and SST.

## Purpose
1. **Seed Demo Mode**: Pre-baked, accurate feeds for curated topics with zero network dependency.
2. **Ground Runtime AI**: Verified NCERT context injected directly into the prompt as `## VERIFIED NCERT CONTEXT`, prioritizing official textbook facts and marking schemes over general web search.

## Structure
- `manifest.json`: List of 30+ topics across Class 8–12 with NCERT chapter mappings.
- `index.json`: Fast lookup mapping `"{Subject}:{Grade}:{Topic}"` to corresponding output JSON file.
- `output/`: Pre-baked, quality-gate validated JSON files for each topic.
- `agent.py`: Multi-stage pipeline orchestrator (Retrieval, Fact Extraction, Verification, MCQs, Diagram Specs).
- `verifier.py`: Quality gate enforcer (checks verbatim MCQ options, LaTeX validity, source citations, confidence thresholds).
- `prompts.py`: System prompts with strict source attribution and LaTeX guidelines.

## Usage
Run the research CLI:
```bash
python3 research/agent.py
```

Force re-run even if cached within 90 days:
```bash
python3 research/agent.py --force
```

Filter by subject or grade:
```bash
python3 research/agent.py --subject Science --grade 10
```
