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
 * If contextBrand/Model are provided and different from primary, creates a virtual SEO slug.
 */
export function getProductSlug(
  name: string, 
  brand?: string | null, 
  model?: string | null, 
  sku?: string | null,
  contextBrand?: string | null,
  contextModel?: string | null
): string {
  const sName = slugify(name || "");
  const sBrand = brand ? slugify(brand) : "";
  const sModel = model ? slugify(model) : "";
  
  const sContextBrand = contextBrand ? slugify(contextBrand) : "";
  const sContextModel = contextModel ? slugify(contextModel) : "";

  let finalSlug = "";

  // CASE 1: Dynamic Context (e.g. searching for Skoda but part is Seat)
  if (sContextBrand && sContextBrand !== sBrand) {
    finalSlug = sContextBrand;
    if (sContextModel && !sName.includes(sContextModel)) {
      finalSlug += "-" + sContextModel;
    }
    
    // Add part description
    finalSlug += "-" + sName;
    
    // Add "kompatibilis" bridge
    finalSlug += "-kompatibilis";
    
    // Add original brand if useful
    if (sBrand) finalSlug += "-" + sBrand;
  } 
  // CASE 2: Normal/Canonical Slug
  else {
    let prefix = "";
    if (sBrand && !sName.startsWith(sBrand)) {
      prefix += sBrand + "-";
    }
    if (sModel && !sName.includes(sModel)) {
      prefix += sModel + "-";
    }
    finalSlug = prefix + sName;
  }
  
  // Add SKU at the end if it's not already in the slug
  if (sku) {
    const sSku = slugify(sku);
    if (sSku && !finalSlug.includes(sSku)) {
      finalSlug += "-" + sSku;
    }
  }

  // Final cleanup of hyphens
  return finalSlug
    .replace(/-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

/**
 * Returns the friendly URL path for a product.
 * Supports optional context for SEO virtual URLs.
 */
export function getProductUrl(
  product: { id: string, name: string, brandName?: string | null, modelName?: string | null, sku?: string | null },
  context?: { brandName?: string | null, modelName?: string | null }
) {
  const slug = getProductSlug(
    product.name, 
    product.brandName, 
    product.modelName, 
    product.sku,
    context?.brandName,
    context?.modelName
  );
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
