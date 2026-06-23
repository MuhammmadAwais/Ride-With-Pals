/**
 * @fileoverview App-wide text constants and configuration values.
 * Centralised here so copy/headings/routes can be updated without hunting through components.
 * Mirrors admin panel Constants.ts — adapted for the web app's route structure.
 */

// ─── App Identity ─────────────────────────────────────────────────────────────
export const APP_NAME    = 'Ride With Pals' as const;
export const APP_TAGLINE = 'Your Elite Riding Community' as const;
export const APP_VERSION = '1.0.0' as const;

// ─── Routes ───────────────────────────────────────────────────────────────────
export const ROUTES = {
  // ── Auth (public) ──
  SIGNUP:             '/',
  LOGIN:              '/login',
  FORGOT_PASSWORD:    '/forgot-password',
  VERIFY_EMAIL:       '/verify-email',
  AUTH_SUBSCRIPTION:  '/auth-subscription',

  // ── Post-auth setup (public) ──
  SELECT_ROLE:        '/select-role',
  CREATE_PROFILE:     '/create-profile',
  ATHLETE_PROFILE:    '/athlete-profile',
  CLUB_PROFILE_SETUP: '/club-profile-setup',
  CLUB_SUBSCRIPTIONS: '/club-subscriptions',
  SELECT_ROLE_CLUB:   '/select-role-club',

  // ── Club Management (protected, in AppLayout shell) ──
  DASHBOARD:          '/dashboard',
  ACTIVITIES:         '/activities',
  PRODUCT:            '/product',
  ADD_PRODUCT:        '/add-product',
  ORDER:              '/order',
  PROFILE:            '/profile',
  WALLET:             '/wallet',
  SUBSCRIPTION:       '/subscription',
  JOINING_REQUESTS:   '/joining-requests',
  LEADERBOARD:        '/leader-board',
  NEWS:               '/news',
  DISCOUNT:           '/discount',
  MEMBERS:            '/members',
  TERMS:              '/terms-conditions',
  PRIVACY:            '/privacy-policy',
  SUPPORT_OWNER:      '/support/owner',

  // ── Athlete Interface (protected, in AppLayout shell) ──
  CLUBS:              '/clubs',
  RIDE:               '/athlete/rides',
  MARKETPLACE:        '/athlete/marketplace',
  PURCHASES:          '/athlete/purchases',
  WALLET_ATHLETE:     '/athlete/wallet',
  LEADERBOARD_ATHLETE:'/athlete/leaderboard',
  NEWS_ATHLETE:       '/athlete/news',
  MY_PROMOS:          '/athlete/promos',
  PROFILE_ATHLETE:    '/athlete/profile',
  SUPPORT_ATHLETE:    '/support/athlete',

  // ── Standalone (no shell) ──
  MANAGE_CLUB_HOME:   '/manage-club-home',
  MANAGE_CLUB:        '/manage-club',
  ABOUT_APP:          '/about-app',
  EDIT_CLUB:          '/edit-club',
} as const;

// ─── Local Storage Keys ───────────────────────────────────────────────────────
export const STORAGE_KEYS = {
  THEME:        'rwp-web-theme',
  AUTH:         'rwp-web-auth',
  PERSIST_ROOT: 'ride-web-root',
} as const;

// ─── Login Page Copy ──────────────────────────────────────────────────────────
export const LOGIN_COPY = {
  HEADING:              'Welcome Back',
  SUBHEADING:           'Sign in to your Ride With Pals account',
  EMAIL_LABEL:          'Email Address',
  EMAIL_PLACEHOLDER:    'rider@ridewithpals.com',
  PASSWORD_LABEL:       'Password',
  PASSWORD_PLACEHOLDER: 'Enter your password',
  SUBMIT_LABEL:         'Sign In',
  SUBMITTING_LABEL:     'Signing in...',
  LEFT_TAGLINE:         'Manage your club, rides, and community — all in one place.',
  INVALID_CREDENTIALS:  'Invalid email or password. Please try again.',
  SUCCESS_MESSAGE:      'Welcome back! Redirecting...',
} as const;

// ─── Signup Page Copy ─────────────────────────────────────────────────────────
export const SIGNUP_COPY = {
  HEADING:    'Create Account',
  SUBHEADING: 'Join the elite riding community',
  LEFT_TITLE: 'Ride with',
  LEFT_HIGHLIGHT: 'Power',
  LEFT_TAGLINE: 'Join the elite community of high-performance riders. Experience the trail like never before.',
} as const;
