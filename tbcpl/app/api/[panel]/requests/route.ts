import { NextRequest, NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/db';
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

/* GET — all requests (admin) */
export async function GET(req: NextRequest, { params }: Params) {
  const blocked = await guard(req, params);
  if (blocked) return blocked;
  const db = await readDB();
  return NextResponse.json(db.requests.slice().reverse()); // newest first
}

/* PUT — update status */
export async function PUT(req: NextRequest, { params }: Params) {
  const blocked = await guard(req, params);
  if (blocked) return blocked;
  const { id, status } = await req.json() as { id: string; status: string };
  if (!id || !status) return NextResponse.json({ error: 'id and status required' }, { status: 400 });

  const db = await readDB();
  const idx = db.requests.findIndex(r => r.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  db.requests[idx] = { ...db.requests[idx], status: status as 'pending' | 'approved' | 'rejected' };
  await writeDB(db);
  return NextResponse.json(db.requests[idx]);
}

/* DELETE — remove request */
export async function DELETE(req: NextRequest, { params }: Params) {
  const blocked = await guard(req, params);
  if (blocked) return blocked;
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const db = await readDB();
  db.requests = db.requests.filter(r => r.id !== id);
  await writeDB(db);
  return new NextResponse(null, { status: 204 });
}
