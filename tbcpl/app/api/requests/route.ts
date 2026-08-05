import { NextRequest, NextResponse } from 'next/server';
import { readDB, writeDB, generateId } from '@/lib/db';
import type { SiteRequest } from '@/lib/db';

/* Public POST — submit a site request */
export async function POST(req: NextRequest) {
  const body = await req.json() as Partial<SiteRequest>;

  if (!body.siteUrl?.trim() || !body.siteName?.trim()) {
    return NextResponse.json({ error: 'Site URL and name are required' }, { status: 400 });
  }

  const db = await readDB();
  const newReq: SiteRequest = {
    id: generateId(),
    siteName: body.siteName.trim(),
    siteUrl: body.siteUrl.trim(),
    targets: Array.isArray(body.targets) ? body.targets : [{ region: 'Global', category: 'Movies & Shows' }],
    reason: body.reason?.trim() ?? '',
    status: 'pending',
    submittedAt: Date.now(),
  };

  db.requests.push(newReq);
  await writeDB(db);
  return NextResponse.json(newReq, { status: 201 });
}
