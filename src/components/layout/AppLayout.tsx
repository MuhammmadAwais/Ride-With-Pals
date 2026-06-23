/**
 * @fileoverview AppLayout — Shell for all protected routes.
 *
 * Z-Index Contract:
 *  z-10  → Main layout (sidebar + content column)
 *  z-30  → Navbar (sticky, above scrollable content)
 *  z-50  → Sidebar on mobile (drawer mode)
 *  z-200 → Portal Modals (mounted into #modal-root)
 *
 * Key design decisions:
 *  - Sidebar is sticky on desktop, drawer on mobile.
 *  - Navbar is sticky at top of the content column.
 *  - Page content is rendered via <Outlet /> — eliminates the old DashBoard shell duplication.
 *  - GSAP entry animation plays on every route change (opacity 0 → 1, y 18 → 0).
 */
import React, { useState, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { APP_NAME } from '@/Constants';

/** Derive a human-readable page title from the current pathname. */
function deriveTitle(pathname: string): string {
  const segment = pathname.split('/').filter(Boolean).at(-1) ?? 'dashboard';
  // Convert kebab-case to Title Case: 'leader-board' → 'Leader Board'
  return segment
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const contentRef = useRef<HTMLElement>(null);
  const pageTitle = deriveTitle(location.pathname);

  // ── GSAP: Page content entry animation on route change ───────────────────
  useGSAP(
    () => {
      if (!contentRef.current) return;
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', clearProps: 'all' },
      );
    },
    { dependencies: [location.pathname], scope: contentRef },
  );

  return (
    <>
      {/* Per-page <title> tag via react-helmet-async */}
      <Helmet>
        <title>{pageTitle} — {APP_NAME}</title>
      </Helmet>

      {/* Full-screen container, uses design token bg */}
      <div className="relative min-h-svh w-full bg-main-bg">

        {/* App Shell layer */}
        <div className="relative z-10 flex w-full">

          {/* Sidebar — sticky on desktop, drawer on mobile */}
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />

          {/* Main content column */}
          <div className="flex flex-col flex-1 min-w-0 relative lg:pl-[288px]">

            {/* Sticky Navbar */}
            <div className="sticky top-0 left-0 right-0 z-30">
              <Navbar
                onMenuClick={() => setSidebarOpen(true)}
                pageTitle={pageTitle}
              />
            </div>

            {/* Scrollable page content — Outlet renders the matched child route */}
            <main
              ref={contentRef}
              id="main-content"
              className="flex-1"
            >
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </>
  );
};

export default AppLayout;
