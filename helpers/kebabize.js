/**
 * Changes CamelCase or PascalCase names into kebab-case.
 * 
 * @param {string} str - The string to convert.
 * @returns {string} - The kebab-cased string.
 */
const kebabize = str => str.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);
export default kebabize;
