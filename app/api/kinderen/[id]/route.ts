export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ fout: 'Niet ingelogd' }, { status: 401 });

  const kind = await prisma.kind.findUnique({
    where: { id: params.id },
    include: { scores: { orderBy: { datum: 'asc' } } },
  });

  if (!kind || kind.ouderId !== session.ouderId) {
    return NextResponse.json({ fout: 'Niet gevonden' }, { status: 404 });
  }

  return NextResponse.json({
    ...kind,
    lastActief: kind.lastActief ? kind.lastActief.toISOString() : null,
    scores: kind.scores.map((s: { id: string; datum: Date; vak: string; niveau: number; aantalGoed: number; aantalTotaal: number; duurSeconden: number; kindId: string }) => ({
      ...s,
      datum: s.datum.toISOString(),
    })),
  });
}
