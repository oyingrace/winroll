import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** Liveness check for the app's hosting platform. */
export async function GET() {
  return NextResponse.json({ status: 'ok', service: 'winroll', time: new Date().toISOString() });
}
