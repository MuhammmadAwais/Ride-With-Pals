// @ts-nocheck
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector } from '@/hooks/useAppSelector';
import { setLocale } from '@/app/slices/languageSlice';
import { dynamicActivate, LANGUAGE_META, type Locale } from '@/lib/i18n';

interface LanguageSwitcherProps {
  /** 'light' for in-app navbar, 'dark' for landing page navbar (default) */
  variant?: 'dark' | 'light';
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ variant = 'dark' }) => {
  const dispatch = useAppDispatch();
  const currentLocale = useAppSelector((s) => s.language?.locale ?? 'en') as Locale;
  const [open, setOpen] = useState(false);
  const [isRtl, setIsRtl] = useState(document.documentElement.dir === 'rtl');
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const isDark = variant === 'dark';

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  const handleSelect = useCallback(async (locale: Locale) => {
    setOpen(false);
    await dynamicActivate(locale);
    dispatch(setLocale(locale));
    setIsRtl(['ar', 'ur'].includes(locale));
  }, [dispatch]);

  const current = LANGUAGE_META[currentLocale];

  const css = `
    .rwp-lang-switcher {
      position: relative;
      display: inline-flex;
      align-items: center;
      flex-shrink: 0;
    }
    .rwp-lang-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 12px;
      border-radius: 10px;
      border: 1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'};
      background: ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'};
      color: ${isDark ? 'rgba(255,255,255,0.8)' : 'rgba(20,20,20,0.8)'};
      font-family: Manrope, Inter, sans-serif;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s, border-color 0.2s, transform 0.15s;
      white-space: nowrap;
      user-select: none;
      -webkit-user-select: none;
    }
    .rwp-lang-btn:hover {
      background: ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'};
      border-color: ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'};
      transform: translateY(-1px);
    }
    .rwp-lang-btn.active {
      background: ${isDark ? 'rgba(235,113,43,0.15)' : 'rgba(235,113,43,0.1)'};
      border-color: rgba(235,113,43,0.4);
    }
    .rwp-lang-globe {
      width: 15px;
      height: 15px;
      opacity: 0.7;
      flex-shrink: 0;
    }
    .rwp-lang-flag {
      font-size: 14px;
      line-height: 1;
    }
    .rwp-lang-code {
      font-size: 13px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .rwp-lang-chevron {
      width: 12px;
      height: 12px;
      opacity: 0.5;
      transition: transform 0.25s ease;
      flex-shrink: 0;
    }
    .rwp-lang-chevron.open { transform: rotate(180deg); }

    /* Dropdown panel */
    .rwp-lang-dropdown {
      position: absolute;
      top: calc(100% + 10px);
      ${isRtl ? 'left: 0;' : 'right: 0;'}
      z-index: 9999;
      width: 220px;
      background: ${isDark ? 'rgba(12,12,12,0.97)' : 'rgba(255,255,255,0.98)'};
      border: 1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'};
      backdrop-filter: blur(40px);
      -webkit-backdrop-filter: blur(40px);
      overflow: hidden;
      opacity: 0;
      transform: translateY(-8px) scale(0.97);
      pointer-events: none;
      transition: opacity 0.2s ease, transform 0.2s ease;
    }
    .rwp-lang-dropdown.open {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: all;
    }
    .rwp-lang-dropdown-header {
      padding: 12px 16px 8px;
      font-family: Manrope, Inter, sans-serif;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: ${isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.35)'};
    }
    .rwp-lang-list {
      list-style: none;
      margin: 0;
      padding: 0 6px 6px;
      max-height: 340px;
      overflow-y: auto;
      scrollbar-width: thin;
      scrollbar-color: ${isDark ? 'rgba(255,255,255,0.15) transparent' : 'rgba(0,0,0,0.15) transparent'};
    }
    .rwp-lang-list::-webkit-scrollbar { width: 4px; }
    .rwp-lang-list::-webkit-scrollbar-track { background: transparent; }
    .rwp-lang-list::-webkit-scrollbar-thumb { background: ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}; border-radius: 4px; }
    .rwp-lang-item {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      padding: 9px 10px;
      border-radius: 10px;
      border: none;
      background: transparent;
      cursor: pointer;
      transition: background 0.15s ease;
      text-align: left;
    }
    .rwp-lang-item:hover {
      background: ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'};
    }
    .rwp-lang-item.selected {
      background: ${isDark ? 'rgba(235,113,43,0.15)' : 'rgba(235,113,43,0.1)'};
    }
    .rwp-lang-item-flag {
      font-size: 18px;
      line-height: 1;
      flex-shrink: 0;
      width: 24px;
      text-align: center;
    }
    .rwp-lang-item-text {
      display: flex;
      flex-direction: column;
      gap: 1px;
      flex: 1;
      min-width: 0;
    }
    .rwp-lang-item-native {
      font-family: Manrope, Inter, sans-serif;
      font-size: 13px;
      font-weight: 600;
      color: ${isDark ? 'rgba(255,255,255,0.9)' : 'rgba(10,10,10,0.9)'};
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .rwp-lang-item-english {
      font-family: Manrope, Inter, sans-serif;
      font-size: 11px;
      font-weight: 400;
      color: ${isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)'};
    }
    .rwp-lang-item-check {
      flex-shrink: 0;
      width: 16px;
      height: 16px;
      color: #EB712B;
      opacity: 0;
      transition: opacity 0.15s;
    }
    .rwp-lang-item.selected .rwp-lang-item-check { opacity: 1; }

    /* Mobile responsive: full-width dropdown */
    @media (max-width: 480px) {
      .rwp-lang-dropdown {
        right: auto;
        left: 50%;
        transform: translateX(-50%) translateY(-8px) scale(0.97);
        width: 200px;
      }
      .rwp-lang-dropdown.open {
        transform: translateX(-50%) translateY(0) scale(1);
      }
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="rwp-lang-switcher" ref={containerRef}>
        <button
          className={`rwp-lang-btn${open ? ' active' : ''}`}
          onClick={() => setOpen((v) => !v)}
          aria-label="Select language"
          aria-expanded={open}
          aria-haspopup="listbox"
          title="Change language"
        >
          {/* Globe icon */}
          <svg className="rwp-lang-globe" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <span className="rwp-lang-flag">{current.flag}</span>
          <span className="rwp-lang-code">{currentLocale}</span>
          <svg className={`rwp-lang-chevron${open ? ' open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        <div className={`rwp-lang-dropdown${open ? ' open' : ''}`} role="listbox" aria-label="Available languages">
          <div className="rwp-lang-dropdown-header">Language / Sprache / Langue</div>
          <ul className="rwp-lang-list" ref={listRef}>
            {(Object.keys(LANGUAGE_META) as Locale[]).map((locale) => {
              const meta = LANGUAGE_META[locale];
              const isSelected = locale === currentLocale;
              return (
                <li key={locale} role="option" aria-selected={isSelected}>
                  <button
                    className={`rwp-lang-item${isSelected ? ' selected' : ''}`}
                    onClick={() => handleSelect(locale)}
                    tabIndex={open ? 0 : -1}
                  >
                    <span className="rwp-lang-item-flag">{meta.flag}</span>
                    <span className="rwp-lang-item-text">
                      <span className="rwp-lang-item-native">{meta.native}</span>
                      <span className="rwp-lang-item-english">{meta.english}</span>
                    </span>
                    {/* Checkmark for selected */}
                    <svg className="rwp-lang-item-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </>
  );
};
