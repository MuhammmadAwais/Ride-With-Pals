// @ts-nocheck
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector } from '@/hooks/useAppSelector';
import { setLocale } from '@/app/slices/languageSlice';
import { dynamicActivate, LANGUAGE_META, type Locale } from '@/lib/i18n';
import { useTheme } from '@/hooks/useTheme';

interface LanguageSwitcherProps {
  /** Optional override: 'light' or 'dark'. If omitted, automatically uses current active theme */
  variant?: 'dark' | 'light';
  className?: string;
}

const CountryFlag: React.FC<{ countryCode?: string; fallbackEmoji: string; alt: string; className?: string }> = ({
  countryCode,
  fallbackEmoji,
  alt,
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);

  if (imgError || !countryCode) {
    return <span className={`rwp-lang-flag-emoji ${className}`.trim()}>{fallbackEmoji}</span>;
  }

  return (
    <img
      src={`https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`}
      srcSet={`https://flagcdn.com/w80/${countryCode.toLowerCase()}.png 2x`}
      alt={alt}
      width={20}
      height={14}
      className={`rwp-lang-flag-img ${className}`.trim()}
      loading="lazy"
      onError={() => setImgError(true)}
    />
  );
};

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ variant, className = '' }) => {
  const dispatch = useAppDispatch();
  const currentLocale = useAppSelector((s) => s.language?.locale ?? 'en') as Locale;
  const [open, setOpen] = useState(false);
  const [isRtl, setIsRtl] = useState(document.documentElement.dir === 'rtl');
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const themeCtx = useTheme();
  const isDark = variant !== undefined ? variant === 'dark' : (themeCtx?.isDark ?? true);

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

  const current = LANGUAGE_META[currentLocale] || LANGUAGE_META.en;

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
      gap: 7px;
      padding: 7px 11px;
      border-radius: 12px;
      border: 1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'};
      background: ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'};
      color: ${isDark ? '#F4F4F5' : '#18181B'};
      font-family: Manrope, Inter, sans-serif;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s, border-color 0.2s, transform 0.15s, box-shadow 0.2s;
      white-space: nowrap;
      user-select: none;
      -webkit-user-select: none;
    }
    .rwp-lang-btn:hover {
      background: ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)'};
      border-color: ${isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.22)'};
      transform: translateY(-1px);
    }
    .rwp-lang-btn.active {
      background: ${isDark ? 'rgba(235,113,43,0.18)' : 'rgba(235,113,43,0.12)'};
      border-color: rgba(235,113,43,0.6);
      box-shadow: 0 0 0 1px rgba(235,113,43,0.4);
    }
    .rwp-lang-globe {
      width: 15px;
      height: 15px;
      opacity: 0.75;
      flex-shrink: 0;
    }
    .rwp-lang-flag-img {
      width: 19px;
      height: 13px;
      object-fit: cover;
      border-radius: 2px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.3);
      flex-shrink: 0;
      display: inline-block;
    }
    .rwp-lang-flag-emoji {
      font-size: 15px;
      line-height: 1;
      display: inline-block;
    }
    .rwp-lang-code {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .rwp-lang-chevron {
      width: 12px;
      height: 12px;
      opacity: 0.6;
      transition: transform 0.25s ease;
      flex-shrink: 0;
    }
    .rwp-lang-chevron.open { transform: rotate(180deg); }

    /* Dropdown panel */
    .rwp-lang-dropdown {
      position: absolute;
      top: calc(100% + 8px);
      ${isRtl ? 'left: 0;' : 'right: 0;'}
      z-index: 9999;
      width: 230px;
      background: ${isDark ? '#18181B' : '#FFFFFF'};
      border: 1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'};
      border-radius: 16px;
      box-shadow: ${isDark 
        ? '0 20px 45px -5px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06)' 
        : '0 20px 45px -5px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.04)'};
      overflow: hidden;
      opacity: 0;
      transform: translateY(-6px) scale(0.97);
      pointer-events: none;
      transition: opacity 0.18s cubic-bezier(0.16, 1, 0.3, 1), transform 0.18s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .rwp-lang-dropdown.open {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: all;
    }
    .rwp-lang-dropdown-header {
      padding: 12px 14px 8px;
      font-family: Manrope, Inter, sans-serif;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: ${isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)'};
      border-bottom: 1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'};
      margin-bottom: 4px;
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
      padding: 8px 10px;
      border-radius: 10px;
      border: none;
      background: transparent;
      cursor: pointer;
      transition: background 0.15s ease;
      text-align: left;
    }
    .rwp-lang-item:hover {
      background: ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'};
    }
    .rwp-lang-item.selected {
      background: ${isDark ? 'rgba(235,113,43,0.18)' : 'rgba(235,113,43,0.12)'};
    }
    .rwp-lang-item-flag-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      flex-shrink: 0;
      border-radius: 6px;
      background: ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'};
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
      color: ${isDark ? '#F4F4F5' : '#18181B'};
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .rwp-lang-item-english {
      font-family: Manrope, Inter, sans-serif;
      font-size: 11px;
      font-weight: 500;
      color: ${isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)'};
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

    /* Mobile responsive: center dropdown */
    @media (max-width: 480px) {
      .rwp-lang-dropdown {
        right: auto;
        left: 50%;
        transform: translateX(-50%) translateY(-6px) scale(0.97);
        width: 210px;
      }
      .rwp-lang-dropdown.open {
        transform: translateX(-50%) translateY(0) scale(1);
      }
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className={`rwp-lang-switcher ${className}`.trim()} ref={containerRef}>
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
          <CountryFlag
            countryCode={current.countryCode}
            fallbackEmoji={current.flag}
            alt={current.english}
          />
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
                    <div className="rwp-lang-item-flag-wrapper">
                      <CountryFlag
                        countryCode={meta.countryCode}
                        fallbackEmoji={meta.flag}
                        alt={meta.english}
                      />
                    </div>
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
