# Contributing to StudyRot

Thank you for your interest in improving StudyRot for students and educators! We welcome pull requests, bug reports, curriculum additions, and design improvements.

---

## Code of Conduct

We are dedicated to providing a respectful, welcoming, and inclusive experience for everyone. Please be considerate, kind, and collaborative in all communications.

---

## Development Workflow

1. **Fork and Clone**:
   ```bash
   git clone https://github.com/your-username/studyrot.git
   cd "Study Rot"
   ```

2. **Branch Naming**:
   - `feat/feature-name`
   - `fix/bug-description`
   - `curriculum/class-subject-topic`

3. **Backend Setup**:
   ```bash
   cd backend
   python -m pip install -r requirements.txt
   pytest tests/test_endpoints.py -v
   ```

4. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   npm run build
   ```

5. **Commit Conventions**:
   Follow conventional commits:
   - `feat: add Tamil language support for Science Class 10`
   - `fix: resolve mobile overflow on battle podium view`
   - `docs: update deployment instructions for Render`

---

## Curriculum Contribution Guidelines

When adding new pre-baked NCERT topics:
1. Ensure the chapter aligns with the latest official CBSE syllabus.
2. Provide at least 14 posts including foundation key points, desi analogies, timed MCQs, formulas/timelines, and board exam traps.
3. Validate that every MCQ has exactly 4 unique options and the answer strictly matches one of the options.
4. Ensure all mathematical expressions are enclosed in valid LaTeX syntax (`$...$` or `$$...$$`).
5. Include an inline SVG diagram with clean viewBox coordinates (`viewBox="0 0 400 240"` recommended).
