/**
 * App-wide constants.
 *
 * Keep this file dependency-free so it can be imported from anywhere
 * (server components, client components, services) without pulling in
 * runtime modules.
 */

/**
 * Interval at which the auth token should be refreshed silently.
 * 230 minutes — chosen to comfortably stay ahead of the typical 4h
 * token lifetime on the backend.
 */
export const REFRESH_TOKEN_INTERVAL_IN_MILLISECONDS = 13800 * 1000; // 230 minutes

/** Default number of items per page in lists / tables. */
export const paginationSize = 25;

/** Selectable page-size options for paginated lists. */
export const pageSizeOptions = ['25', '50', '75', '100', '125', '150'] as const;

export type PageSizeOption = (typeof pageSizeOptions)[number];
