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
 * Throws on invalid credentials so createAsyncThunk can call rejectWithValue.
 */
export async function mockLogin(
  email: string,
  password: string,
): Promise<LoginSuccessPayload> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 600));

  if (
    email.trim().toLowerCase() === MOCK_USER_EMAIL &&
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

  throw new Error('Invalid email or password. Please try again.');
}
