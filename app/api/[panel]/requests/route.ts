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

  // Ensure any rejected requests are purged completely from the database
  const hadRejected = db.requests.some(r => r.status === 'rejected');
  if (hadRejected) {
    db.requests = db.requests.filter(r => r.status !== 'rejected');
    await writeDB(db);
  }

  return NextResponse.json(db.requests.slice().reverse()); // newest first
}

/* PUT — update status (Approve & auto-publish to live site, or Reject & completely remove) */
export async function PUT(req: NextRequest, { params }: Params) {
  const blocked = await guard(req, params);
  if (blocked) return blocked;

  const body = await req.json() as { id?: string; ids?: string[]; status: string };
  const { id, ids, status } = body;
  if ((!id && (!ids || ids.length === 0)) || !status) {
    return NextResponse.json({ error: 'id or ids and status required' }, { status: 400 });
  }

  const idsToProcess = ids && ids.length > 0 ? ids : (id ? [id] : []);
  const idsSet = new Set(idsToProcess);
  const db = await readDB();

  // If rejected: REMOVE COMPLETELY from database per policy
  if (status === 'rejected') {
    const initialCount = db.requests.length;
    db.requests = db.requests.filter(r => !idsSet.has(r.id));
    const removedCount = initialCount - db.requests.length;
    await writeDB(db);
    return NextResponse.json({ success: true, removedCount, deleted: true });
  }

  // If approved: Auto-publish each site live and update status
  const addedSites: Site[] = [];
  let updatedSingleReq: typeof db.requests[0] | null = null;

  for (let i = 0; i < db.requests.length; i++) {
    const requestItem = db.requests[i];
    if (idsSet.has(requestItem.id)) {
      db.requests[i] = { ...requestItem, status: 'approved' };
      if (id && requestItem.id === id) updatedSingleReq = db.requests[i];

      let domain = requestItem.siteUrl;
      try {
        domain = new URL(requestItem.siteUrl).hostname.replace(/^www\./, '');
      } catch {
        domain = requestItem.siteUrl.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
      }

      // Check if site already exists
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

        const createdSite: Site = {
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
        addedSites.push(createdSite);
      }
    }
  }

  await writeDB(db);

  return NextResponse.json({
    success: true,
    approvedCount: idsToProcess.length,
    request: updatedSingleReq,
    site: addedSites[0] || null,
    addedSites,
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
