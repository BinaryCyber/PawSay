
/**
 * Security utilities for PawSay
 */

/**
 * Strips HTML tags and trims whitespace to prevent basic XSS
 */
export const sanitizeText = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/<[^>]*>?/gm, '') // Remove HTML tags
    .replace(/[^\w\s\p{P}]/gu, '') // Keep alphanumeric, whitespace, and punctuation only
    .trim();
};

/**
 * Validates that an image URL or data URI is safe for rendering
 */
export const isSafeImageUrl = (url: string | undefined): boolean => {
  if (!url) return true;
  
  // Allow safe web protocols
  if (url.startsWith('http://') || url.startsWith('https://')) return true;
  
  // Allow safe image data URIs
  const safeImageMimeTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
  if (url.startsWith('data:image/')) {
    return safeImageMimeTypes.some(mime => url.startsWith(`data:${mime};base64,`));
  }
  
  return false;
};

/**
 * Truncates and sanitizes strings specifically for use in AI prompts
 */
export const sanitizeForPrompt = (text: string, maxLength: number = 50): string => {
  const sanitized = sanitizeText(text);
  return sanitized.slice(0, maxLength);
};
