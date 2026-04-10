import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

function formatKind(kind: {
  id: string;
  naam: string;
  leeftijd: number;
  groep: number;
  kleur: string;
  streak: number;
  lastActief: Date | null;
  ouderId: string;
  scores: {
    id: string;
    datum: Date;
    vak: string;
    niveau: number;
    aantalGoed: number;
    aantalTotaal: number;
    duurSeconden: number;
  }[];
}) {
  return {
    id: kind.id,
    naam: kind.naam,
    leeftijd: kind.leeftijd,
    groep: kind.groep,
    kleur: kind.kleur,
    streak: kind.streak,
    lastActief: kind.lastActief ? kind.lastActief.toISOString() : null,
    ouderId: kind.ouderId,
    scores: kind.scores.map((s) => ({ ...s, datum: s.datum.toISOString() })),
  };
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ fout: 'Niet ingelogd' }, { status: 401 });

  const kinderen = await prisma.kind.findMany({
    where: { ouderId: session.ouderId },
    include: { scores: { orderBy: { datum: 'asc' } } },
  });

  return NextResponse.json(kinderen.map(formatKind));
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ fout: 'Niet ingelogd' }, { status: 401 });

  const { naam, leeftijd, groep, kleur } = await req.json();

  if (!naam || !leeftijd || !groep || !kleur) {
    return NextResponse.json({ fout: 'Ontbrekende velden' }, { status: 400 });
  }

  const kind = await prisma.kind.create({
    data: { naam, leeftijd, groep, kleur, ouderId: session.ouderId },
    include: { scores: true },
  });

  return NextResponse.json(formatKind(kind));
}
