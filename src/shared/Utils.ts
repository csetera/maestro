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

/**
 * Returns the specified string with the leading character capitalized.
 *
 * @param str
 * @returns
 */
export function withLeadingCapital(str: string) {
    return str[0].toUpperCase() + str.slice(1);
}