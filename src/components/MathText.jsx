/** Renders inline and block LaTeX formulas using KaTeX with robust syntax parsing and fallback error boundaries. */
import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';

class MathErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <span className="font-mono text-xs text-navy-600 dark:text-navy-300">{this.props.rawText}</span>;
    }
    return this.props.children;
  }
}

/**
 * Detects common plain-text math formulas and converts them into LaTeX delimiters ($ and $$).
 * Preserves existing LaTeX segments untouched.
 */
function autoFormatPlainMath(raw) {
  if (!raw || typeof raw !== 'string') return raw;

  // Split by existing LaTeX blocks ($$...$$ or $...$) so we don't modify what is already LaTeX
  const mathBlockRegex = /(\$\$[\s\S]*?\$\$|\$[^$\n]+?\$)/g;
  const tokens = raw.split(mathBlockRegex);

  return tokens.map((segment) => {
    if (segment.startsWith('$')) return segment; // Already formatted LaTeX

    let s = segment;

    // 1. Triple-fraction relations like 1/v + 1/u = 1/f or 1/v - 1/u = 1/f
    s = s.replace(/\b(\w+)\/(\w+)\s*([\+\-])\s*(\w+)\/(\w+)\s*=\s*(\w+)\/(\w+)\b/g,
      (m, a, b, op, c, d, e, f) => `$$\\frac{${a}}{${b}} ${op} \\frac{${c}}{${d}} = \\frac{${e}}{${f}}$$`);

    // 2. Parallel / series resistor formulas
    s = s.replace(/\b1\/R_?p\s*=\s*1\/R_?1\s*\+\s*1\/R_?2(?:\s*\+\s*1\/R_?3)?\b/gi,
      (m) => m.includes('R_3') || m.includes('R3')
        ? '$$\\frac{1}{R_p} = \\frac{1}{R_1} + \\frac{1}{R_2} + \\frac{1}{R_3}$$'
        : '$$\\frac{1}{R_p} = \\frac{1}{R_1} + \\frac{1}{R_2}$$');
    s = s.replace(/\bR_?s\s*=\s*R_?1\s*\+\s*R_?2(?:\s*\+\s*R_?3)?\b/gi,
      (m) => m.includes('R_3') || m.includes('R3')
        ? '$$R_s = R_1 + R_2 + R_3$$'
        : '$$R_s = R_1 + R_2$$');

    // 3. Simple fractions with single variable on LHS: e.g. n = c / v, P = 1/f, V = W/Q, R = V/I
    s = s.replace(/\b([a-zA-Z])\s*=\s*([a-zA-Z0-9]+)\s*\/\s*([a-zA-Z0-9]+)(?:\s*\((?:in\s+)?m(?:eters)?\))?\b/gi,
      (m, lhs, num, den) => `$$${lhs} = \\frac{${num}}{${den}}$$`);

    // 4. Negative fraction: e.g. m = -v/u
    s = s.replace(/\b([a-zA-Z])\s*=\s*-\s*([a-zA-Z0-9]+)\s*\/\s*([a-zA-Z0-9]+)\b/g,
      (m, lhs, num, den) => `$${lhs} = -\\frac{${num}}{${den}}$`);

    // 5. Common physics laws: V = IR, H = I²Rt
    s = s.replace(/\bV\s*=\s*IR\b/g, '$V = IR$');
    s = s.replace(/\bH\s*=\s*I[²\^2]\s*R\s*t\b/gi, '$H = I^2 R t$');

    // 6. Conic section formulas: y² = 4ax, x² = -16y, etc.
    s = s.replace(/\b([xy])²\s*=\s*(-?\d*[a-z]*[xy])\b/gi, '$$$1^2 = $2$$');
    s = s.replace(/\bSP\s*=\s*x₁\s*\+\s*a\b/g, '$SP = x_1 + a$');
    s = s.replace(/\bP\((x₁|x1),\s*(y₁|y1)\)/g, '$P(x_1, y_1)$');
    s = s.replace(/\b([xy])\s*=\s*(-?\d*a?t)²\b/g, '$$$1 = $2^2$$');
    s = s.replace(/\b([xy])\s*=\s*(\d*at)\b/g, '$$$1 = $2$$');

    // 7. Scientific notations: e.g. 3 × 10⁸ m/s
    s = s.replace(/3\s*[×x]\s*10⁸\s*(m\/s)?/gi, '$3 \\times 10^8\\text{ m/s}$');

    // 8. Optical variable indicators: (u), (v), (f), (-u), (+f), (-f)
    s = s.replace(/\(([uvf])\)/gi, '($$$1$$)');
    s = s.replace(/\(([\+\-][uvf])\)/gi, '($$$1$$)');

    return s;
  }).join('');
}

/**
 * Splits text into normal text, inline math ($...$), and block math ($$...$$).
 * Handles escaped \$ as literal dollar signs.
 */
export function MathText({ children, className = '' }) {
  if (typeof children !== 'string' || !children) {
    return <span className={className}>{children}</span>;
  }

  // Preprocess text to auto-wrap plain math notations
  const normalizedText = autoFormatPlainMath(children);

  // Placeholder token for escaped dollar signs "\$"
  const ESCAPED_DOLLAR_PLACEHOLDER = '___ESCAPED_DOLLAR_SIGN___';
  const preparedText = normalizedText.replace(/\\\$/g, ESCAPED_DOLLAR_PLACEHOLDER);

  // Regex to match block math $$...$$ first, then inline math $...$
  const regex = /(\$\$[\s\S]*?\$\$|\$[^$\n]+?\$)/g;
  const parts = preparedText.split(regex);

  return (
    <span className={`math-text-wrapper ${className}`}>
      {parts.map((part, index) => {
        if (!part) return null;

        // Restore escaped dollar signs
        const unescapedPart = part.replaceAll(ESCAPED_DOLLAR_PLACEHOLDER, '$');

        // Check if block math $$...$$
        if (part.startsWith('$$') && part.endsWith('$$') && part.length >= 4) {
          const formula = part.slice(2, -2).trim();
          return (
            <MathErrorBoundary key={index} rawText={unescapedPart}>
              <span className="block-math-container my-2 overflow-x-auto block text-center max-w-full">
                <BlockMath math={formula} />
              </span>
            </MathErrorBoundary>
          );
        }

        // Check if inline math $...$
        if (part.startsWith('$') && part.endsWith('$') && part.length >= 2) {
          const formula = part.slice(1, -1).trim();
          return (
            <MathErrorBoundary key={index} rawText={unescapedPart}>
              <span className="inline-math-container inline-block max-w-full overflow-x-auto align-middle px-0.5">
                <InlineMath math={formula} />
              </span>
            </MathErrorBoundary>
          );
        }

        // Standard prose text
        return <React.Fragment key={index}>{unescapedPart}</React.Fragment>;
      })}
    </span>
  );
}

export default MathText;
