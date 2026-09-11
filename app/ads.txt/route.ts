import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const revalidate = 86400; // 24 hours

export async function GET() {
  const adsPath = path.join(process.cwd(), 'public', 'ads.txt');
  let content = 'google.com, pub-1348117799300846, DIRECT, f08c47fec0942fa0\n';

  try {
    if (fs.existsSync(adsPath)) {
      content = fs.readFileSync(adsPath, 'utf8');
    }
  } catch {
    // Fallback to default publisher record
  }

  return new NextResponse(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
