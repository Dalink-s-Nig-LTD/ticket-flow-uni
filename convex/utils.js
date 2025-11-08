// HTML sanitization utilities to prevent XSS attacks
/**
 * Escapes HTML special characters to prevent XSS attacks
 */
export function escapeHtml(unsafe) {
    if (!unsafe)
        return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
/**
 * Sanitizes text for safe display in HTML emails
 * Escapes HTML but preserves line breaks
 */
export function sanitizeForEmail(text) {
    if (!text)
        return '';
    // First escape HTML
    const escaped = escapeHtml(text);
    // Then convert line breaks to <br> tags
    return escaped.replace(/\n/g, '<br>');
}
/**
 * Truncates text to a maximum length
 */
export function truncate(text, maxLength) {
    if (!text || text.length <= maxLength)
        return text;
    return text.substring(0, maxLength) + '...';
}
