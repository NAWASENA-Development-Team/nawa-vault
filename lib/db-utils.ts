import { db } from '@/db';
import { assets } from '@/db/schema';
import { like } from 'drizzle-orm';

export async function generateAssetId(categoryPrefix: string, assetName: string): Promise<string> {
  const itemCode = assetName.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase().padEnd(3, 'X');
  const baseId = `${categoryPrefix}-${itemCode}`;
  
  const existingAssets = await db.select()
    .from(assets)
    .where(like(assets.assetId, `${baseId}-%`));
    
  const sequence = (existingAssets.length + 1).toString().padStart(3, '0');
  return `${baseId}-${sequence}`;
}

export function getLoanCode(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomNum = Math.floor(100 + Math.random() * 900);
  return `LN-${dateStr}-${randomNum}`;
}
