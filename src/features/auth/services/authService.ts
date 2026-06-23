/**
 * @fileoverview Mock auth service.
 *
 * In production, replace mockLogin() with a real API call (e.g., Firebase Auth,
 * Supabase, or your own backend). The interface stays the same.
 *
 * Mock credentials (dev only):
 *   Email:    rider@ridewithpals.com
 *   Password: rider1234
 */
import type { AppUser, LoginSuccessPayload } from '@/features/auth/types/authTypes';

const MOCK_USER_EMAIL    = 'rider@ridewithpals.com';
const MOCK_USER_PASSWORD = 'rider1234';

/**
 * Simulates an async login API call with a 600ms delay.
 * Checks registered users in localStorage, falls back to default credentials.
 * Throws on invalid credentials.
 */
export async function mockLogin(
  email: string,
  password: string,
): Promise<LoginSuccessPayload> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 600));

  const trimmedEmail = email.trim().toLowerCase();

  // 1. Check default mock user
  if (
    trimmedEmail === MOCK_USER_EMAIL &&
    password === MOCK_USER_PASSWORD
  ) {
    const user: AppUser = {
      id:    'usr_001',
      email: MOCK_USER_EMAIL,
      name:  'Alex Rider',
      role:  'organizer',
    };
    return { user };
  }

  // 2. Check users list in localStorage
  const localUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
  const matchedUser = localUsers.find(
    (u: any) => u.email === trimmedEmail && u.password === password
  );

  if (matchedUser) {
    const user: AppUser = {
      id:    matchedUser.id || `usr_${Math.random().toString(36).substr(2, 9)}`,
      email: matchedUser.email,
      name:  matchedUser.name || 'New Rider',
      role:  'athlete',
    };
    return { user };
  }

  throw new Error('Invalid email or password. Please try again.');
}
