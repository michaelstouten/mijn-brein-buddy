export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ fout: 'Niet ingelogd' }, { status: 401 });
  }

  const ouder = await prisma.ouder.findUnique({
    where: { id: session.ouderId },
    include: { kinderen: { select: { id: true } } },
  });

  if (!ouder) {
    return NextResponse.json({ fout: 'Niet gevonden' }, { status: 404 });
  }

  return NextResponse.json({
    id: ouder.id,
    email: ouder.email,
    naam: ouder.naam,
    kinderenIds: ouder.kinderen.map((k: { id: string }) => k.id),
    aangemeldOp: ouder.aangemeldOp.toISOString(),
  });
}
