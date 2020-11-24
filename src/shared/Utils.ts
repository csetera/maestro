/**
 * Combines Node development mode check with command-line flag for development
 */
export const isDevelopment = process.env.NODE_ENV !== "production" || process.argv.includes('--dev-mode');

/**
 * Returns a boolean if the specified value is not null or undefined
 * 
 * @param val
 */
export function hasValue(val: any): boolean {
    return (val !== undefined) && (val !== null);
}
