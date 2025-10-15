import type { User } from 'firebase/auth';

/**
 * Checks if the user is an admin.
 * In this prototype, we'll identify the admin by a specific email address.
 * In a production app, this would be handled by custom claims.
 * @param user The Firebase user object.
 * @returns True if the user is an admin, false otherwise.
 */
export function isAdmin(user: User | null): boolean {
  if (!user) {
    return false;
  }
  // For prototype purposes, the admin is identified by this specific email.
  return user.email === 'admin@fgluxury.com';
}
