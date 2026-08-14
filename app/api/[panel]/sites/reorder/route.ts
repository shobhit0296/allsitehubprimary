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
  const position = new Map(orderedIds.map((id, index) => [id, index]));
  const categoryIds = new Set(db.sites.filter(s => s.category === category).map(s => s.id));

  if (categoryIds.size !== orderedIds.length || ![...categoryIds].every(id => position.has(id))) {
    return NextResponse.json({ error: 'orderedIds must exactly match the sites currently in that category' }, { status: 400 });
  }

  db.sites = db.sites.map(site =>
    position.has(site.id) ? { ...site, order: position.get(site.id)! } : site
  );
  await writeDB(db);

  return NextResponse.json({ success: true });
}
