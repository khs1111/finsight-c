import React, { useRef, useState, useEffect } from 'react';
import './NewsCategoryTabs.css';
import SonIcon from '../../assets/newspng/Son.svg';
import SonIconBlack from '../../assets/newspng/Icon.svg';

export default function NewsCategoryTabs({ categories = [], activeCategory, onSelect }) {
  const viewportRef = useRef(null);
  const contentRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startTranslate = useRef(0);
  const [translateX, setTranslateX] = useState(0);
  const minTranslateRef = useRef(0);

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  useEffect(() => {
    const calc = () => {
      const vp = viewportRef.current;
      const ct = contentRef.current;
      if (!vp || !ct) return;
      const min = Math.min(0, vp.clientWidth - ct.scrollWidth);
      minTranslateRef.current = min;
      setTranslateX(prev => clamp(prev, min, 0));
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const wheel = (e) => {
      if (!contentRef.current || !viewportRef.current) return;
      e.preventDefault();
      const delta = e.deltaY || e.deltaX;
      setTranslateX(prev => clamp(prev - delta, minTranslateRef.current, 0));
    };
    vp.addEventListener('wheel', wheel, { passive: false });
    return () => vp.removeEventListener('wheel', wheel, { passive: false });
  }, []);

  useEffect(() => {
    // when categories change, recalc position
    const vp = viewportRef.current;
    const ct = contentRef.current;
    if (!vp || !ct) return;
    const min = Math.min(0, vp.clientWidth - ct.scrollWidth);
    minTranslateRef.current = min;
    setTranslateX(prev => clamp(prev, min, 0));
  }, [categories]);

  const handlePointerDown = (e) => {
    isDragging.current = true;
    startX.current = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    startTranslate.current = translateX;
    e.currentTarget.setPointerCapture && e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging.current) return;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const delta = clientX - startX.current;
    const next = clamp(startTranslate.current + delta, minTranslateRef.current, 0);
    setTranslateX(next);
  };

  const handlePointerUp = (e) => {
    isDragging.current = false;
    try { e.currentTarget.releasePointerCapture && e.currentTarget.releasePointerCapture(e.pointerId); } catch (err) {}
  };

  

  return (
    <nav className="category-tabs-viewport" ref={viewportRef}>
      <div
        className="category-tabs-content"
        ref={contentRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ transform: `translateX(${translateX}px)` }}
      >
        {categories.map(cat => {
          const isActive = cat === activeCategory;
          const isToday = cat === '오늘의 뉴스';
          return (
            <div
              key={cat}
              className={'category-tab' + (isActive ? ' active' : '')}
              onClick={() => onSelect && onSelect(cat)}
            >
              {isToday && (
                <span className="tab-icon" aria-hidden="true">
                  <img src={isActive ? SonIcon : SonIconBlack} alt="" />
                </span>
              )}
              {cat}
            </div>
          );
        })}
      </div>
    </nav>
  );
}

