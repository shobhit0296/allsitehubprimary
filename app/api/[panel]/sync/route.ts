import { NextRequest, NextResponse } from 'next/server';
import { readDB, writeDB, purgeCloudflareCache, tryWriteLocalDbFile } from '@/lib/db';
import { isAdminRequest, isPanelSegment } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

const NOT_FOUND = () => new NextResponse(null, { status: 404 });
const UNAUTHORIZED = () => NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

type Params = { params: Promise<{ panel: string }> };

async function guard(req: NextRequest, params: Params['params']) {
  const { panel } = await params;
  if (!isPanelSegment(panel)) return NOT_FOUND();
  if (!isAdminRequest(req)) return UNAUTHORIZED();
  return null;
}

/* GET — get sync health and stats */
export async function GET(req: NextRequest, { params }: Params) {
  const blocked = await guard(req, params);
  if (blocked) return blocked;

  try {
    const db = await readDB();
    return NextResponse.json({
      success: true,
      sitesCount: db.sites.length,
      requestsCount: (db.requests || []).length,
      categoriesCount: db.categories.length,
      timestamp: Date.now(),
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

/* POST — force full edge cache purge & re-sync to live */
export async function POST(req: NextRequest, { params }: Params) {
  const blocked = await guard(req, params);
  if (blocked) return blocked;

  try {
    const db = await readDB();
    
    // 1. Force writeDB which writes to Redis, updates memoryCache, and triggers revalidatePath
    await writeDB(db);

    // 2. Explicitly ensure local file sync
    const fileSaved = tryWriteLocalDbFile(db);

    // 3. Purge Cloudflare CDN Cache
    const cfResult = await purgeCloudflareCache();

    return NextResponse.json({
      success: true,
      message: 'Edge cache purged and website revalidated successfully!',
      sitesCount: db.sites.length,
      requestsCount: (db.requests || []).length,
      fileSaved,
      cloudflare: cfResult,
      timestamp: Date.now(),
    });
  } catch (err) {
    console.error('[Admin Sync] Force sync failed:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
