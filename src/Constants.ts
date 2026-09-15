/**
 * @fileoverview App-wide text constants and configuration values.
 * Centralised here so copy/headings/routes can be updated without hunting through components.
 * Mirrors admin panel Constants.ts — adapted for the web app's route structure.
 */

// ─── App Identity ─────────────────────────────────────────────────────────────
export const APP_NAME    = 'Ride With Pals' as const;
export const APP_TAGLINE = 'Move Together' as const;
export const APP_VERSION = '1.0.0' as const;

// ─── Routes ───────────────────────────────────────────────────────────────────
export const ROUTES = {
  HOME:               '/',
  SIGNUP:             '/signup',
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
  CLUB_OVERVIEW:      '/view/clubside/overview',
  ACTIVITIES:         '/view/clubside/activities',
  ADD_RIDE:           '/view/clubside/add-ride',
  EDIT_RIDE:          '/view/clubside/edit-ride/:id',
  PRODUCT:            '/view/clubside/product',
  SHOP_CLUB:          '/view/clubside/product',
  ADD_PRODUCT:        '/view/clubside/add-product',
  CLUB_MARKETPLACE:   '/view/clubside/marketplace',
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
  CLUB_PERMISSIONS:   '/view/clubside/permissions',
  CLUB_MEMBERSHIP:    '/view/clubside/membership',
  STRIPE_CONNECT:     '/view/clubside/stripe-connect',

  // ── Athlete Interface (protected, in AppLayout shell) ──
  CLUBS:              '/view/userside/clubs',
  CLUB_DETAILS:       '/view/userside/club/:clubId',
  CALENDAR:           '/view/userside/calendar',
  RIDE:               '/view/userside/activities',
  SAVED_RIDES:        '/view/userside/saved-activities',
  PURCHASES:          '/view/userside/purchases',
  SHOP:               '/view/userside/shop',
  MARKETPLACE:        '/view/userside/marketplace',
  WALLET_ATHLETE:     '/view/userside/wallet',
  PROFILE_ATHLETE:    '/view/userside/profile',
  SUBSCRIPTION_ATHLETE: '/view/userside/subscription',
  SUPPORT_ATHLETE:    '/view/userside/support',
  NOTIFICATIONS:      '/view/userside/notifications',
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
  LEFT_TAGLINE:         'Move Together. Manage your club, rides, and community — all in one place.',
  INVALID_CREDENTIALS:  'Invalid email or password. Please try again.',
  SUCCESS_MESSAGE:      'Welcome back! Redirecting...',
} as const;

// ─── Signup Page Copy ─────────────────────────────────────────────────────────
export const SIGNUP_COPY = {
  HEADING:        'Create Account',
  SUBHEADING:     'Move Together with your club and community',
  LEFT_TITLE:     'Ride with',
  LEFT_HIGHLIGHT: 'Pals',
  LEFT_TAGLINE:   'Move Together. Connect with your squad, organize rides, and keep your community engaged.',
} as const;

// ─── Stripe Payment Links & Launch Promotion Configuration ───────────────────
export const STRIPE_PAYMENT_LINKS = {
  // Direct Stripe Payment Links (https://buy.stripe.com/...) can be configured here
  ATHLETE_YEARLY_PROMO: '',
  GOLD_CLUB_YEARLY_PROMO: '',
} as const;

export const LAUNCH_PRICING = {
  CURRENCY_SYMBOL: '€',
  CURRENCY_CODE: 'EUR',
  ATHLETE_PROMO_PRICE: '14,99',
  ATHLETE_REGULAR_PRICE: '29,99',
  GOLD_CLUB_PROMO_PRICE: '89',
  GOLD_CLUB_REGULAR_PRICE: '130',
  VAT_NOTE: 'Prices include 21% VAT',
} as const;

