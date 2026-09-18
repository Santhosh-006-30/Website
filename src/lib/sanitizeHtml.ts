import DOMPurify from 'dompurify';

/**
 * Robust HTML sanitizer for user/rich-text content.
 * Enforces strict tag & attribute allowlists and safe URI schemes.
 * Explicitly disallows: javascript:, data:, vbscript:, file:, blob:
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'a', 'hr', 'pre', 'code', 'img', 'span',
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel', 'class', 'src', 'alt', 'title', 'width', 'height',
    ],
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: [
      'script', 'style', 'iframe', 'form', 'object', 'embed', 'input', 'button', 'svg', 'canvas',
    ],
    FORBID_ATTR: [
      'onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'style',
    ],
    // Strictly whitelist safe URI protocols: http, https, mailto, tel
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    FORCE_BODY: false,
  });
}

/**
 * Deterministically calculate estimated reading time in minutes.
 */
export function calculateReadingTime(textOrHtml: string): number {
  if (!textOrHtml) return 1;
  const words = textOrHtml.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}
