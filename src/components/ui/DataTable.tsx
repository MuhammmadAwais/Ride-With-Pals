/**
 * @fileoverview Generic DataTable — cinematic redesign.
 *
 * Features:
 *  - Generic over T (any row shape)
 *  - Uses useTableSort hook (3-state: asc → desc → null)
 *  - GSAP staggered row entrance animation on data change
 *  - Search text highlight in cells (amber glow mark)
 *  - Sortable column headers with animated sort icons
 *  - Cinematic empty state with animated icon
 *  - Rich skeleton rows with shimmer animation
 *  - Frosted glass header, banded rows, amber accent throughout
 *  - 100% design-token driven (bg-surface, text-text-muted, etc.)
 *
 * Usage:
 *   const columns: Column<User>[] = [
 *     { key: 'name', label: 'Name', sortable: true },
 *     { key: 'status', label: 'Status', sortable: true, render: (row) => <Badge>{row.status}</Badge> },
 *   ];
 *   <DataTable data={users} columns={columns} searchQuery={q} searchableKeys={['name','email']} />
 */
import React, { useRef } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, SearchX } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useTableSort } from '@/hooks/useTableSort';
import type { SortConfig } from '@/hooks/useTableSort';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  /** Custom cell renderer. Receives the full row. */
  render?: (row: T) => React.ReactNode;
  /** CSS class(es) applied to <td> cells in this column. */
  cellClass?: string;
  /** CSS class(es) applied to <th> header in this column. */
  headerClass?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  /** Text to highlight in cells (passed from parent search input). */
  searchQuery?: string;
  /** Keys to filter rows by (client-side search). */
  searchableKeys?: (keyof T)[];
  isLoading?: boolean;
  emptyMessage?: string;
  /** Allows the parent to pass a className to the table wrapper. */
  className?: string;
  /** External sort configuration */
  sortConfig?: SortConfig<T>;
  /** External sort request handler */
  onRequestSort?: (key: keyof T) => void;
}

// ─── Helper: Highlight matched text ──────────────────────────────────────────

function HighlightText({ text, query }: { text: string; query: string }): React.ReactElement {
  if (!query || !text) return <>{text}</>;
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            style={{
              background: 'rgba(235,113,43,0.28)',
              borderRadius: '3px',
              padding: '0 2px',
              color: '#EB712B',
              fontWeight: 700,
              boxShadow: '0 0 6px rgba(235,113,43,0.2)',
            }}
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

// ─── Sort Icon ────────────────────────────────────────────────────────────────

function SortIcon<T>({ col, sortConfig }: { col: Column<T>; sortConfig: SortConfig<T> }): React.ReactElement | null {
  if (!col.sortable) return null;
  const isActive = sortConfig.key === col.key;
  if (!isActive || sortConfig.direction === null)
    return <ChevronsUpDown size={13} style={{ opacity: 0.35, flexShrink: 0, transition: 'opacity 0.2s' }} />;
  if (sortConfig.direction === 'asc')
    return <ChevronUp size={13} style={{ color: '#EB712B', flexShrink: 0, filter: 'drop-shadow(0 0 4px rgba(235,113,43,0.7))' }} />;
  return <ChevronDown size={13} style={{ color: '#EB712B', flexShrink: 0, filter: 'drop-shadow(0 0 4px rgba(235,113,43,0.7))' }} />;
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function SkeletonRow({ colCount, index }: { colCount: number; index: number }): React.ReactElement {
  return (
    <tr style={{ borderBottom: '1px solid var(--color-border)', opacity: 1 - index * 0.12 }}>
      {Array.from({ length: colCount }).map((_, i) => (
        <td key={i} style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
          <div
            style={{
              height: i === 0 ? '34px' : '13px',
              borderRadius: i === 0 ? '10px' : '6px',
              width: i === 0 ? '55%' : ['70%', '45%', '60%', '50%', '40%'][i % 5],
              background: 'linear-gradient(90deg, var(--color-border) 25%, rgba(235,113,43,0.06) 50%, var(--color-border) 75%)',
              backgroundSize: '200% 100%',
              animation: 'dtShimmer 1.6s ease-in-out infinite',
            }}
          />
        </td>
      ))}
    </tr>
  );
}

// ─── DataTable Component ──────────────────────────────────────────────────────

function DataTable<T extends object>({
  data,
  columns,
  searchQuery = '',
  searchableKeys = [],
  isLoading = false,
  emptyMessage = 'No records found.',
  className,
  sortConfig: externalSortConfig,
  onRequestSort,
}: DataTableProps<T>): React.ReactElement {
  const internalSort = useTableSort(data);
  const sortConfig = externalSortConfig ?? internalSort.sortConfig;
  const requestSort = onRequestSort ?? internalSort.requestSort;
  const items = externalSortConfig ? data : internalSort.items;
  const tbodyRef = useRef<HTMLTableSectionElement>(null);

  // Client-side search filter
  const filteredItems = searchQuery && searchableKeys.length
    ? items.filter((row) =>
        searchableKeys.some((key) => {
          const val = row[key];
          return val !== null && val !== undefined &&
            String(val).toLowerCase().includes(searchQuery.toLowerCase());
        }),
      )
    : items;

  // GSAP staggered row entrance
  useGSAP(
    () => {
      if (!tbodyRef.current) return;
      const rows = tbodyRef.current.querySelectorAll('tr');
      if (!rows.length) return;
      gsap.fromTo(
        rows,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.35, stagger: 0.035, ease: 'power2.out', clearProps: 'all' },
      );
    },
    { dependencies: [filteredItems.length, searchQuery], scope: tbodyRef },
  );

  return (
    <>
      <style>{`
        @keyframes dtShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .dt-row:hover td {
          background: rgba(235,113,43,0.035) !important;
        }
        .dt-th-sort:hover {
          color: #EB712B !important;
        }
        .dt-th-sort:hover svg {
          opacity: 1 !important;
        }
      `}</style>

      <div
        className={cn('w-full', className)}
        style={{
          borderRadius: '14px',
          border: '1px solid var(--color-border)',
          overflow: 'hidden',
          background: 'var(--color-secondary-bg)',
          boxShadow: '0 0 0 1px rgba(0,0,0,0.6), 0 12px 40px rgba(0,0,0,0.5)',
        }}
      >
        {/* Scrollable table wrapper */}
        <div style={{ overflowX: 'auto' }} className="custom-scrollbar">
          <table style={{ width: '100%', borderCollapse: 'collapse', whiteSpace: 'nowrap' }}>

            {/* ── Header ── */}
            <thead>
              <tr
                style={{
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.015) 100%)',
                  borderBottom: '1px solid var(--color-border)',
                }}
              >
                {columns.map((col) => (
                  <th
                    key={String(col.key)}
                    onClick={() => col.sortable && requestSort(col.key as keyof T)}
                    className={cn(col.headerClass, col.sortable ? 'dt-th-sort' : '')}
                    style={{
                      padding: '16px 20px',
                      textAlign: 'left',
                      fontFamily: 'var(--font-poppins)',
                      fontWeight: 600,
                      fontSize: '11px',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: 'var(--color-secondary-text)',
                      cursor: col.sortable ? 'pointer' : 'default',
                      userSelect: 'none',
                      whiteSpace: 'nowrap',
                      transition: 'color 0.18s, background-color 0.18s',
                    }}
                    aria-sort={
                      sortConfig.key === col.key
                        ? sortConfig.direction === 'asc' ? 'ascending' : 'descending'
                        : undefined
                    }
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {col.label}
                      <SortIcon col={col} sortConfig={sortConfig} />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* ── Body ── */}
            <tbody ref={tbodyRef}>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonRow key={i} colCount={columns.length} index={i} />
                ))
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={columns.length}>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '72px 20px',
                        gap: '14px',
                      }}
                    >
                      {/* Cinematic empty state icon */}
                      <div
                        style={{
                          width: '64px',
                          height: '64px',
                          borderRadius: '20px',
                          background: 'linear-gradient(135deg, #2a170e 0%, #1c1410 50%, #120f0e 100%)',
                          border: '1px solid rgba(235,113,43,0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 0 28px rgba(235,113,43,0.07)',
                        }}
                      >
                        <SearchX size={26} style={{ color: 'rgba(235,113,43,0.55)' }} />
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ fontFamily: 'var(--font-poppins)', fontSize: '14px', fontWeight: 600, color: 'var(--color-main-text)', marginBottom: '4px' }}>
                          Nothing here yet
                        </p>
                        <p style={{ fontFamily: 'var(--font-roboto)', fontSize: '12px', color: 'var(--color-secondary-text)', opacity: 0.7 }}>
                          {emptyMessage}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map((row, rowIdx) => (
                  <tr
                    key={String((row as any).id ?? (row as any).userId ?? (row as any).name ?? rowIdx)}
                    className="dt-row"
                    style={{
                      borderBottom: rowIdx < filteredItems.length - 1 ? '1px solid var(--color-border)' : 'none',
                      background: rowIdx % 2 === 1 ? 'rgba(255,255,255,0.012)' : 'transparent',
                      transition: 'background 0.18s',
                    }}
                  >
                    {columns.map((col) => {
                      const rawValue = (row as Record<string, unknown>)[col.key as string];
                      const cellContent = col.render
                        ? col.render(row)
                        : searchQuery && searchableKeys.includes(col.key as keyof T)
                          ? <HighlightText text={String(rawValue ?? '')} query={searchQuery} />
                          : (rawValue !== null && rawValue !== undefined ? String(rawValue) : '—');

                      return (
                        <td
                          key={String(col.key)}
                          className={cn(col.cellClass)}
                          style={{
                            padding: '14px 20px',
                            fontFamily: 'var(--font-roboto)',
                            fontSize: '13.5px',
                            color: 'var(--color-main-text)',
                            verticalAlign: 'middle',
                          }}
                        >
                          {cellContent}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default DataTable;
