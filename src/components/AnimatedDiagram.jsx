import React, { useEffect, useRef, useState } from 'react';
import DOMPurify from 'dompurify';

/**
 * AnimatedDiagram
 * - Renders sanitized raw SVG with SMIL animations
 * - Triggers IntersectionObserver at 0.4 threshold
 * - Clones & re-inserts SVG whenever entering view to restart SMIL animations
 * - Fade-in + translateY entering transition
 */
export default function AnimatedDiagram({ svg }) {
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [sanitizedSvg, setSanitizedSvg] = useState('');

  // Sanitize SVG allowing safe SMIL animation tags and attributes
  useEffect(() => {
    if (!svg || typeof svg !== 'string') {
      setSanitizedSvg('');
      return;
    }

    try {
      const clean = DOMPurify.sanitize(svg, {
        USE_PROFILES: { svg: true, svgFilters: true },
        ADD_TAGS: [
          'svg',
          'g',
          'rect',
          'circle',
          'ellipse',
          'line',
          'polyline',
          'polygon',
          'path',
          'text',
          'tspan',
          'defs',
          'linearGradient',
          'stop',
          'animate',
          'animateTransform',
          'animateMotion',
          'mpath',
        ],
        ADD_ATTR: [
          'viewBox',
          'xmlns',
          'cx',
          'cy',
          'r',
          'x',
          'y',
          'x1',
          'y1',
          'x2',
          'y2',
          'width',
          'height',
          'd',
          'points',
          'fill',
          'stroke',
          'stroke-width',
          'stroke-dasharray',
          'stroke-dashoffset',
          'opacity',
          'transform',
          'attributeName',
          'from',
          'to',
          'dur',
          'begin',
          'repeatCount',
          'path',
          'font-family',
          'font-size',
          'font-weight',
          'text-anchor',
          'dx',
          'dy',
          'offset',
          'stop-color',
          'stop-opacity',
        ],
      });
      setSanitizedSvg(clean);
    } catch (e) {
      console.error('Failed to sanitize SVG diagram:', e);
      setSanitizedSvg('');
    }
  }, [svg]);

  // IntersectionObserver to detect when diagram enters viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.4) {
            setIsVisible(true);
            // Replay SMIL animation by re-mounting the SVG node
            const svgNode = el.querySelector('svg');
            if (svgNode && svgNode.parentNode) {
              const clone = svgNode.cloneNode(true);
              svgNode.parentNode.replaceChild(clone, svgNode);
            }
          } else if (!entry.isIntersecting) {
            setIsVisible(false);
          }
        });
      },
      {
        threshold: 0.4,
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [sanitizedSvg]);

  if (!sanitizedSvg) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={`diagram-wrapper ${isVisible ? 'anim-enter' : 'anim-leave'}`}
    >
      <div
        className="diagram-svg-container"
        dangerouslySetInnerHTML={{ __html: sanitizedSvg }}
      />
    </div>
  );
}
