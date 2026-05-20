/**
 * Helper to map backend error messages to frontend translation keys.
 * Backend messages are often in English; this maps them to localized keys.
 */

const BACKEND_MESSAGE_MAP: Record<string, string> = {
  // Add mappings here as needed when backend messages are identified
  // Example:
  // "Email already in use": "backend_error_email_in_use",
  // "Invalid credentials": "backend_error_invalid_credentials",
};

/**
 * Map a backend error message to a translation key.
 * If no mapping exists, returns null to indicate the fallback should be used.
 */
export function mapBackendErrorMessage(
  backendMessage: string | undefined
): string | null {
  if (!backendMessage) return null;
  return BACKEND_MESSAGE_MAP[backendMessage] || null;
}

/**
 * Get a translated message for a backend error, with fallback.
 * Usage: t(mapBackendErrorMessage(err.response?.data?.message) || "default_key", fallback)
 */
export function getBackendErrorTranslation(
  backendMessage: string | undefined,
  defaultKey: string,
  fallback: string
): { key: string; fallback: string } {
  const mappedKey = mapBackendErrorMessage(backendMessage);
  return {
    key: mappedKey || defaultKey,
    fallback: mappedKey ? backendMessage || fallback : fallback,
  };
}
