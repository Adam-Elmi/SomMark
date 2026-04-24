/**
 * Makes a string safe to display in HTML by replacing special characters.
 * This helps prevent security issues and formatting errors.
 * 
 * @param {string} str - The raw string to escape.
 * @returns {string} - The HTML-safe string.
 */
export default function escapeHTML(str) {
        return String(str)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#39;");
}
