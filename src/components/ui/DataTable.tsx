/**
 * @fileoverview Generic DataTable — ported from admin panel.
 *
 * Features:
 *  - Generic over T (any row shape)
 *  - Uses useTableSort hook (3-state: asc → desc → null)
 *  - GSAP staggered row entrance animation on data change
 *  - Search text highlight in cells
 *  - Sortable column headers with ChevronUp/Down/ChevronsUpDown icons
 *  - Empty and loading states
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
          <mark key={i} style={{ background: 'rgba(235,113,43,0.3)', borderRadius: '2px', padding: '0 1px', color: 'inherit' }}>
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
  if (!isActive || sortConfig.direction === null) return <ChevronsUpDown size={14} style={{ opacity: 0.4, flexShrink: 0 }} />;
  if (sortConfig.direction === 'asc')  return <ChevronUp size={14} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />;
  return <ChevronDown size={14} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />;
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function SkeletonRow({ colCount }: { colCount: number }): React.ReactElement {
  return (
    <tr>
      {Array.from({ length: colCount }).map((_, i) => (
        <td key={i} style={{ padding: '16px 20px' }}>
          <div style={{
            height: '14px',
            borderRadius: '6px',
            background: 'var(--color-border)',
            width: i === 0 ? '60%' : '80%',
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
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

  // ── GSAP: staggered row entrance on data/filter change ────────────────────
  useGSAP(
    () => {
      if (!tbodyRef.current) return;
      const rows = tbodyRef.current.querySelectorAll('tr');
      if (!rows.length) return;
      gsap.fromTo(
        rows,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.04, ease: 'power2.out', clearProps: 'all' },
      );
    },
    { dependencies: [filteredItems.length, searchQuery], scope: tbodyRef },
  );

  return (
    <div
      className={cn('w-full', className)}
      style={{
        borderRadius: '16px',
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
        background: 'var(--color-secondary-bg)',
      }}
    >
      {/* Scrollable table wrapper */}
      <div style={{ overflowX: 'auto' }} className="custom-scrollbar">
        <table style={{ width: '100%', borderCollapse: 'collapse', whiteSpace: 'nowrap' }}>
          {/* ── Header ── */}
          <thead>
            <tr style={{ background: 'var(--color-table-header)', borderBottom: '1px solid var(--color-border)' }}>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  onClick={() => col.sortable && requestSort(col.key as keyof T)}
                  className={cn(col.headerClass)}
                  style={{
                    padding: '14px 20px',
                    textAlign: 'left',
                    fontFamily: 'var(--font-poppins)',
                    fontWeight: 600,
                    fontSize: '12px',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: 'var(--color-secondary-text)',
                    cursor: col.sortable ? 'pointer' : 'default',
                    userSelect: 'none',
                    whiteSpace: 'nowrap',
                    transition: 'color 0.2s',
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
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} colCount={columns.length} />)
            ) : filteredItems.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    padding: '60px 20px', gap: '12px',
                  }}>
                    <SearchX size={36} style={{ opacity: 0.3, color: 'var(--color-secondary-text)' }} />
                    <p style={{ fontFamily: 'var(--font-roboto)', fontSize: '14px', color: 'var(--color-secondary-text)' }}>
                      {emptyMessage}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredItems.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  style={{
                    borderBottom: rowIdx < filteredItems.length - 1 ? '1px solid var(--color-border)' : 'none',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'var(--color-hover)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'; }}
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
                          fontSize: '14px',
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
  );
}

export default DataTable;
