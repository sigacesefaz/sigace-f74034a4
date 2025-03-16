
/**
 * Utility functions for handling process-related operations
 */

/**
 * Safely converts a process ID to string (used in many component functions)
 */
export function processIdToString(id: string | number | undefined): string {
  if (id === undefined || id === null) return '';
  return String(id);
}

/**
 * Safely converts a process ID to number (used in database operations)
 */
export function processIdToNumber(id: string | number | undefined): number | undefined {
  if (id === undefined || id === null) return undefined;
  
  if (typeof id === 'number') return id;
  
  const parsed = parseInt(id, 10);
  if (isNaN(parsed)) return undefined;
  
  return parsed;
}

/**
 * Checks if a process ID is valid
 */
export function isValidProcessId(id: string | number | undefined): boolean {
  if (id === undefined || id === null) return false;
  
  if (typeof id === 'number') return !isNaN(id);
  
  return id.trim() !== '';
}
