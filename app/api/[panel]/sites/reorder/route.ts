import { NextRequest, NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/db';
import { isAdminRequest, isPanelSegment } from '@/lib/admin-auth';

const NOT_FOUND = () => new NextResponse(null, { status: 404 });
const UNAUTHORIZED = () => NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

type Params = { params: Promise<{ panel: string }> };

/* POST — persist a new manual ranking for every site within one category */
export async function POST(req: NextRequest, { params }: Params) {
  const { panel } = await params;
  if (!isPanelSegment(panel)) return NOT_FOUND();
  if (!isAdminRequest(req)) return UNAUTHORIZED();

  const body = await req.json() as { category?: string; orderedIds?: string[] };
  const { category, orderedIds } = body;
  if (!category || !Array.isArray(orderedIds) || orderedIds.length === 0) {
    return NextResponse.json({ error: 'category and orderedIds are required' }, { status: 400 });
  }

  const db = await readDB();
  const normCat = category.trim().toLowerCase();
  const position = new Map(orderedIds.map((id, index) => [id, index]));

  let currentCategoryCount = 0;
  db.sites = db.sites.map(site => {
    const siteCat = (site.category || '').trim().toLowerCase();
    if (siteCat === normCat) {
      if (position.has(site.id)) {
        return { ...site, order: position.get(site.id)! };
      } else {
        const fallbackOrder = orderedIds.length + currentCategoryCount++;
        return { ...site, order: fallbackOrder };
      }
    }
    return site;
  });

  await writeDB(db);

  return NextResponse.json({ success: true, count: orderedIds.length });
}
