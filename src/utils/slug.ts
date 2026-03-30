/**
 * Utility for generating URL-friendly slugs from strings.
 * Handles Hungarian accents specifically for best SEO.
 */
export function slugify(text: string): string {
  if (!text) return "";
  
  const charMap: { [key: string]: string } = {
    'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ö': 'o', 'ő': 'o', 'ú': 'u', 'ü': 'u', 'ű': 'u',
    'Á': 'a', 'É': 'e', 'Í': 'i', 'Ó': 'o', 'Ö': 'o', 'Ő': 'o', 'Ú': 'u', 'Ü': 'u', 'Ű': 'u',
    '(': '', ')': '', '/': '-', '\\': '-', '.': '', ',': ''
  };
  
  return text.toString()
    .replace(/[áéíóöőúüűÁÉÍÓÖŐÚÜŰ()\/\\.,]/g, m => charMap[m] !== undefined ? charMap[m] : m)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove any remaining special characters
    .trim()
    .replace(/\s+/g, '-')         // Replace spaces with hyphens
    .replace(/-+/g, '-')          // Replace multiple hyphens with single hyphen
    .replace(/^-+/, '')           // Trim leading hyphen
    .replace(/-+$/, '');          // Trim trailing hyphen
}

/**
 * Generates a full product slug combining keywords.
 */
export function getProductSlug(name: string, brand?: string | null, model?: string | null, sku?: string | null): string {
  const parts = [brand, model, name, sku].filter(Boolean) as string[];
  return slugify(parts.join(' '));
}

/**
 * Returns the friendly URL path for a product.
 * Format: /product/slugified-name-brand-model-id
 */
export function getProductUrl(product: { id: string, name: string, brandName?: string | null, modelName?: string | null, sku?: string | null }) {
  const slug = getProductSlug(product.name, product.brandName, product.modelName, product.sku);
  return `/product/${slug}-${product.id}`;
}

/**
 * Extracts the UUID from a friendly URL slug.
 * Assumes the UUID is the last 36 characters.
 */
export function extractIdFromSlug(slugId: string): string {
  // UUIDs are exactly 36 characters long
  if (slugId.length >= 36) {
    const potentialId = slugId.slice(-36);
    // Basic UUID validation
    const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(potentialId)) {
      return potentialId;
    }
  }
  return slugId; // Return as-is if no UUID pattern found at end
}
