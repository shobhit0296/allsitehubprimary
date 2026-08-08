import { NextRequest, NextResponse } from 'next/server';
import { readDB, writeDB, generateId } from '@/lib/db';
import type { Site } from '@/lib/data';
import { isAdminRequest, isPanelSegment } from '@/lib/admin-auth';

const NOT_FOUND = () => new NextResponse(null, { status: 404 });
const UNAUTHORIZED = () => NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

type Params = { params: Promise<{ panel: string }> };

async function guard(req: NextRequest, params: Params['params']) {
  const { panel } = await params;
  if (!isPanelSegment(panel)) return NOT_FOUND();
  if (!isAdminRequest(req)) return UNAUTHORIZED();
  return null;
}

/* GET — list all sites (admin) */
export async function GET(req: NextRequest, { params }: Params) {
  const blocked = await guard(req, params);
  if (blocked) return blocked;
  const db = await readDB();
  return NextResponse.json(db.sites);
}

/* POST — create site */
export async function POST(req: NextRequest, { params }: Params) {
  const blocked = await guard(req, params);
  if (blocked) return blocked;
  const body = await req.json() as Partial<Site>;
  const { name, url, domain } = body;
  if (!name || !url) {
    return NextResponse.json({ error: 'name and url are required' }, { status: 400 });
  }
  const db = await readDB();
  const category = body.category ?? db.categories[0] ?? 'Movies & Shows';
  const maxOrder = db.sites.reduce((max, s) => s.category === category ? Math.max(max, s.order) : max, -1);
  const newSite: Site = {
    id: generateId(),
    name: name.trim(),
    url: url.trim(),
    domain: domain?.trim() ?? new URL(url.trim()).hostname.replace(/^www\./, ''),
    category,
    regions: body.regions ?? ['Global'],
    tags: body.tags ?? [],
    isTrusted: body.isTrusted ?? false,
    isNew: body.isNew ?? false,
    isFeatured: body.isFeatured ?? false,
    description: body.description?.trim() ?? '',
    addedAt: Date.now(),
    order: maxOrder + 1,
  };
  db.sites.push(newSite);
  await writeDB(db);
  return NextResponse.json(newSite, { status: 201 });
}

/* PUT — update site */
export async function PUT(req: NextRequest, { params }: Params) {
  const blocked = await guard(req, params);
  if (blocked) return blocked;
  const body = await req.json() as Partial<Site> & { id: string };
  if (!body.id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const db = await readDB();
  const idx = db.sites.findIndex(s => s.id === body.id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const current = db.sites[idx];
  // Moving to a different category drops the site to the bottom of the new
  // category's ranking — its old `order` value has no meaning there.
  if (body.category && body.category !== current.category) {
    const maxOrder = db.sites.reduce((max, s) => s.category === body.category ? Math.max(max, s.order) : max, -1);
    body.order = maxOrder + 1;
  }
  db.sites[idx] = { ...current, ...body };
  await writeDB(db);
  return NextResponse.json(db.sites[idx]);
}

/* DELETE — remove site */
export async function DELETE(req: NextRequest, { params }: Params) {
  const blocked = await guard(req, params);
  if (blocked) return blocked;
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const db = await readDB();
  db.sites = db.sites.filter(s => s.id !== id);
  await writeDB(db);
  return new NextResponse(null, { status: 204 });
}
