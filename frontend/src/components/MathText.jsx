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

export function MathText({ children, className = '' }) {
  if (typeof children !== 'string' || !children) {
    return <span className={className}>{children}</span>;
  }

  const text = children;
  const ESCAPED_DOLLAR_PLACEHOLDER = '___ESCAPED_DOLLAR_SIGN___';
  const preparedText = text.replace(/\\\$/g, ESCAPED_DOLLAR_PLACEHOLDER);

  const regex = /(\$\$[\s\S]*?\$\$|\$[^$\n]+?\$)/g;
  const parts = preparedText.split(regex);

  return (
    <span className={`math-text-wrapper ${className}`}>
      {parts.map((part, index) => {
        if (!part) return null;

        const unescapedPart = part.replaceAll(ESCAPED_DOLLAR_PLACEHOLDER, '$');

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

        return <React.Fragment key={index}>{unescapedPart}</React.Fragment>;
      })}
    </span>
  );
}

export default MathText;
