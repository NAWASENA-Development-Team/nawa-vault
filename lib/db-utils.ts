import { db } from '@/db';
import { assets, categories, ownerInstances } from '@/db/schema';
import { like, eq } from 'drizzle-orm';

/**
 * Generate asset ID in format: [SUBCAT_CODE][NNNN]/[OWNER_CODE]
 * e.g. EAS0001/TU, EPD0034/TU
 *
 * @param subcategoryCode - 3-char code of the leaf category (e.g. 'EAS', 'EPD')
 * @param ownerCode       - Owner instance code (e.g. 'TU', 'PE')
 */
export async function generateAssetId(
  subcategoryCode: string,
  ownerCode: string
): Promise<string> {
  const prefix = subcategoryCode.toUpperCase();

  // Count existing assets with this prefix to determine next sequence number
  const existing = await db
    .select({ assetId: assets.assetId })
    .from(assets)
    .where(like(assets.assetId, `${prefix}%`));

  // Extract all used sequence numbers for this prefix
  const usedNumbers = existing
    .map((a) => {
      const match = a.assetId.match(new RegExp(`^${prefix}(\\d{4})`));
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((n) => n > 0)
    .sort((a, b) => a - b);

  // Find first gap or use next after max
  let nextNum = 1;
  for (const n of usedNumbers) {
    if (n === nextNum) nextNum++;
    else break;
  }

  const sequence = nextNum.toString().padStart(4, '0');
  return `${prefix}${sequence}/${ownerCode.toUpperCase()}`;
}

/**
 * Parse an assetId string into its components.
 * Input: "EAS0001/TU"  →  { subcatCode: "EAS", uid: "0001", ownerCode: "TU" }
 */
export function parseAssetId(assetId: string): {
  subcatCode: string;
  uid: string;
  ownerCode: string;
} | null {
  const match = assetId.match(/^([A-Z]{2,4})(\d{4})\/([A-Z0-9]+)$/);
  if (!match) return null;
  return { subcatCode: match[1], uid: match[2], ownerCode: match[3] };
}

/**
 * Generate a unique loan code.
 */
export function getLoanCode(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomNum = Math.floor(100 + Math.random() * 900);
  return `LN-${dateStr}-${randomNum}`;
}

/**
 * Fetch the full category tree (all 3 levels) in a single query,
 * returning structured { types: [...{ categories: [...{ subcategories: [] }] }] }
 */
export async function getCategoryTree() {
  const allCats = await db
    .select()
    .from(categories)
    .orderBy(categories.level, categories.code);

  const level1 = allCats.filter((c) => c.level === 1);
  const level2 = allCats.filter((c) => c.level === 2);
  const level3 = allCats.filter((c) => c.level === 3);

  return level1.map((type) => ({
    ...type,
    categories: level2
      .filter((cat) => cat.parentId === type.id)
      .map((cat) => ({
        ...cat,
        subcategories: level3.filter((sub) => sub.parentId === cat.id),
      })),
  }));
}
