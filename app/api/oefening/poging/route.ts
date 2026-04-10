export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { kindId, oefeningId, goed } = (await req.json()) as {
      kindId: string;
      oefeningId: string;
      goed: boolean;
    };

    if (!kindId || !oefeningId || goed === undefined) {
      return NextResponse.json({ error: 'Ontbrekende parameters' }, { status: 400 });
    }

    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });

    // Verify ownership
    const kind = await prisma.kind.findFirst({ where: { id: kindId, ouderId: session.ouderId } });
    if (!kind) return NextResponse.json({ error: 'Kind niet gevonden' }, { status: 404 });

    // Verify exercise exists
    const oefening = await prisma.geslagenOefening.findUnique({ where: { id: oefeningId } });
    if (!oefening) return NextResponse.json({ error: 'Oefening niet gevonden' }, { status: 404 });

    await prisma.oefeningPoging.create({
      data: { kindId, oefeningId, goed },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Fout bij opslaan poging:', err);
    return NextResponse.json({ error: 'Kon poging niet opslaan' }, { status: 500 });
  }
}
