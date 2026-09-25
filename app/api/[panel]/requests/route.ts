import { NextRequest, NextResponse } from 'next/server';
import { readDB, writeDB, generateId } from '@/lib/db';
import type { Site } from '@/lib/data';
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

/* GET — all requests (admin) */
export async function GET(req: NextRequest, { params }: Params) {
  const blocked = await guard(req, params);
  if (blocked) return blocked;
  const db = await readDB();
  return NextResponse.json(db.requests.slice().reverse()); // newest first
}

/* PUT — update status (Approve & auto-publish to live site) */
export async function PUT(req: NextRequest, { params }: Params) {
  const blocked = await guard(req, params);
  if (blocked) return blocked;
  const { id, status } = await req.json() as { id: string; status: string };
  if (!id || !status) return NextResponse.json({ error: 'id and status required' }, { status: 400 });

  const db = await readDB();
  const idx = db.requests.findIndex(r => r.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const requestItem = db.requests[idx];
  const newStatus = status as 'pending' | 'approved' | 'rejected';
  db.requests[idx] = { ...requestItem, status: newStatus };

  let createdSite: Site | null = null;

  // IF APPROVED: Automatically add site to db.sites so it goes LIVE instantly on the main website!
  if (newStatus === 'approved') {
    let domain = requestItem.siteUrl;
    try {
      domain = new URL(requestItem.siteUrl).hostname.replace(/^www\./, '');
    } catch {
      domain = requestItem.siteUrl.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    }

    // Check if a site with the same domain or URL already exists
    const alreadyExists = db.sites.some(
      s => s.domain.toLowerCase() === domain.toLowerCase() || s.url.toLowerCase() === requestItem.siteUrl.toLowerCase()
    );

    if (!alreadyExists) {
      const category = requestItem.targets[0]?.category || db.categories[0] || 'Movies & Shows';
      const targetRegions = Array.from(new Set(requestItem.targets.map(t => t.region).filter(Boolean)));
      const regions = targetRegions.length > 0 ? targetRegions : ['Global'];

      const maxOrder = db.sites.reduce(
        (max, s) => (s.category === category ? Math.max(max, s.order ?? 0) : max),
        -1
      );

      createdSite = {
        id: generateId(),
        name: requestItem.siteName.trim(),
        url: requestItem.siteUrl.trim(),
        domain: domain.trim(),
        category,
        regions,
        tags: ['new'],
        isTrusted: false,
        isNew: true,
        isFeatured: false,
        description: requestItem.reason ? requestItem.reason.trim() : `Watch on ${requestItem.siteName}.`,
        addedAt: Date.now(),
        order: maxOrder + 1,
      };

      db.sites.push(createdSite);
    }
  }

  await writeDB(db);

  return NextResponse.json({
    request: db.requests[idx],
    site: createdSite,
  });
}

/* DELETE — remove request(s) */
export async function DELETE(req: NextRequest, { params }: Params) {
  const blocked = await guard(req, params);
  if (blocked) return blocked;

  const url = new URL(req.url);
  const singleId = url.searchParams.get('id');
  const idsParam = url.searchParams.get('ids');

  let idsToDelete: string[] = [];

  if (singleId) {
    idsToDelete.push(singleId);
  }
  if (idsParam) {
    idsToDelete.push(...idsParam.split(',').map(s => s.trim()).filter(Boolean));
  }

  // Also check JSON body if no query params
  if (idsToDelete.length === 0) {
    try {
      const body = await req.json();
      if (body?.id) idsToDelete.push(body.id);
      if (Array.isArray(body?.ids)) idsToDelete.push(...body.ids);
    } catch {
      /* body was empty or not json */
    }
  }

  if (idsToDelete.length === 0) {
    return NextResponse.json({ error: 'id or ids required' }, { status: 400 });
  }

  const idsSet = new Set(idsToDelete);
  const db = await readDB();
  const initialCount = db.requests.length;
  db.requests = db.requests.filter(r => !idsSet.has(r.id));
  const deletedCount = initialCount - db.requests.length;

  await writeDB(db);
  return NextResponse.json({ success: true, deleted: deletedCount });
}
