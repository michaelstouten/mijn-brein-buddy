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

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ fout: 'Niet ingelogd' }, { status: 401 });

  const kind = await prisma.kind.findUnique({ where: { id: params.id } });
  if (!kind || kind.ouderId !== session.ouderId) {
    return NextResponse.json({ fout: 'Niet gevonden' }, { status: 404 });
  }

  const { naam, leeftijd, groep, kleur } = await req.json();
  const updated = await prisma.kind.update({
    where: { id: params.id },
    data: {
      ...(naam !== undefined && { naam }),
      ...(leeftijd !== undefined && { leeftijd }),
      ...(groep !== undefined && { groep }),
      ...(kleur !== undefined && { kleur }),
    },
    include: { scores: { orderBy: { datum: 'asc' } } },
  });

  return NextResponse.json({
    ...updated,
    lastActief: updated.lastActief ? updated.lastActief.toISOString() : null,
    scores: updated.scores.map((s: { id: string; datum: Date; vak: string; niveau: number; aantalGoed: number; aantalTotaal: number; duurSeconden: number; kindId: string }) => ({
      ...s,
      datum: s.datum.toISOString(),
    })),
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ fout: 'Niet ingelogd' }, { status: 401 });

  const kind = await prisma.kind.findUnique({ where: { id: params.id } });
  if (!kind || kind.ouderId !== session.ouderId) {
    return NextResponse.json({ fout: 'Niet gevonden' }, { status: 404 });
  }

  await prisma.kind.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
