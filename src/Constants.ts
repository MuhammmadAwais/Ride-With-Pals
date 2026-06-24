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
  DASHBOARD:          '/view/clubside/dashboard',
  ACTIVITIES:         '/view/clubside/activities',
  PRODUCT:            '/view/clubside/product',
  ADD_PRODUCT:        '/view/clubside/add-product',
  ORDER:              '/view/clubside/order',
  PROFILE:            '/view/clubside/profile',
  WALLET:             '/view/clubside/wallet',
  SUBSCRIPTION:       '/view/clubside/subscription',
  JOINING_REQUESTS:   '/view/clubside/joining-requests',
  LEADERBOARD:        '/view/clubside/leaderboard',
  NEWS:               '/view/clubside/news',
  DISCOUNT:           '/view/clubside/discount',
  MEMBERS:            '/view/clubside/members',
  TERMS:              '/view/clubside/terms-conditions',
  PRIVACY:            '/view/clubside/privacy-policy',
  SUPPORT_OWNER:      '/view/clubside/support',

  // ── Athlete Interface (protected, in AppLayout shell) ──
  CLUBS:              '/view/userside/clubs',
  RIDE:               '/view/userside/rides',
  MARKETPLACE:        '/view/userside/marketplace',
  PURCHASES:          '/view/userside/purchases',
  WALLET_ATHLETE:     '/view/userside/wallet',
  LEADERBOARD_ATHLETE:'/view/userside/leaderboard',
  NEWS_ATHLETE:       '/view/userside/news',
  MY_PROMOS:          '/view/userside/promos',
  PROFILE_ATHLETE:    '/view/userside/profile',
  SUPPORT_ATHLETE:    '/view/userside/support',

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
