import React, { useState, useEffect } from 'react';

/**
 * FloatingQuizCTA
 * Positions a full-width (within 412px max) CTA button above the bottom nav.
 * Props:
 *  - label: button text (default '퀴즈 풀러가기')
 *  - onClick: click handler
 *  - gradient: boolean (default true). If false renders white outline style.
 *  - shadow: toggle custom shadow
 */
export default function FloatingQuizCTA({
  label = '퀴즈 풀러가기',
  onClick,
  gradient = true,
  shadow = true,
  style = {},
  buttonStyle = {},
  offsetOverride,
  stackIndex = 0,
  stackGap = 16,
  buttonHeight = 60,
  recalcKey,
}) {
  const [offset, setOffset] = useState(16);

  useEffect(() => {
    let frame; let interval; let mo; let ro;
    function calc() {
      frame && cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const nav = document.querySelector('.bottom-nav');
        if (nav) {
          const h = nav.getBoundingClientRect().height;
          setOffset(h + 16);
        } else {
          setOffset(16);
        }
      });
    }
    calc();
    let stableCount = 0;
    interval = setInterval(() => {
      const nav = document.querySelector('.bottom-nav');
      if (nav) {
        calc();
        stableCount++;
        if (stableCount > 3) clearInterval(interval);
      }
    }, 200);
    window.addEventListener('resize', calc);
    if ('MutationObserver' in window) {
      mo = new MutationObserver(muts => {
        for (const m of muts) {
          if ([...m.addedNodes].some(n => n.classList && n.classList.contains('bottom-nav'))) {
            calc();
          }
        }
      });
      mo.observe(document.body, { childList: true, subtree: true });
    }
    const navEl = document.querySelector('.bottom-nav');
    if (navEl && 'ResizeObserver' in window) {
      ro = new ResizeObserver(calc);
      ro.observe(navEl);
    }
    return () => {
      window.removeEventListener('resize', calc);
      interval && clearInterval(interval);
      frame && cancelAnimationFrame(frame);
      mo && mo.disconnect();
      ro && ro.disconnect();
    };
  }, [recalcKey]);

  const baseBottom = offsetOverride != null ? offsetOverride : offset;
  const bottom = baseBottom + (stackIndex * (buttonHeight + stackGap));

  return (
    <div
      data-floating-cta
      className="floating-quiz-cta-wrap"
      style={{ bottom, ...style }}
    >
      <div
        className={
          'floating-quiz-cta-btn' +
          (gradient ? ' floating-quiz-cta-btn-gradient' : ' floating-quiz-cta-btn-outline') +
          (shadow ? ' floating-quiz-cta-btn-shadow' : '')
        }
        onClick={onClick}
        style={{ height: buttonHeight, ...buttonStyle }}
      >
        {label}
      </div>
    </div>
  );
}
