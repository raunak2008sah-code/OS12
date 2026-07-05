/**
 * Allowed users for the OS12 application.
 * This application is permanently designed for exactly two accounts.
 */
export const ALLOWED_EMAILS = [
  'raunak@os12.app',
  'aartuu@os12.app',
] as const

export type AllowedEmail = (typeof ALLOWED_EMAILS)[number]

export function isAllowedEmail(email: string): boolean {
  return ALLOWED_EMAILS.includes(email.toLowerCase() as AllowedEmail)
}
