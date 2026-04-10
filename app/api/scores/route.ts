export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

function isSameDay(a: Date, b: Date) {
  return a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate();
}

function isYesterday(date: Date, today: Date) {
  const yesterday = new Date(today);
  yesterday.setUTCDate(today.getUTCDate() - 1);
  return isSameDay(date, yesterday);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ fout: 'Niet ingelogd' }, { status: 401 });

  const { kindId, vak, niveau, aantalGoed, aantalTotaal, duurSeconden } = await req.json();

  const kind = await prisma.kind.findUnique({ where: { id: kindId } });
  if (!kind || kind.ouderId !== session.ouderId) {
    return NextResponse.json({ fout: 'Niet gevonden' }, { status: 404 });
  }

  // Calculate new streak
  const today = new Date();
  let nieuweStreak = kind.streak;

  if (!kind.lastActief) {
    nieuweStreak = 1;
  } else if (isSameDay(kind.lastActief, today)) {
    // Already practiced today — streak unchanged
  } else if (isYesterday(kind.lastActief, today)) {
    // Practiced yesterday — extend streak
    nieuweStreak = kind.streak + 1;
  } else {
    // Gap of 2+ days — reset
    nieuweStreak = 1;
  }

  // Save score + update streak atomically
  const [score] = await prisma.$transaction([
    prisma.oefeningScore.create({
      data: { kindId, vak, niveau, aantalGoed, aantalTotaal, duurSeconden },
    }),
    prisma.kind.update({
      where: { id: kindId },
      data: { streak: nieuweStreak, lastActief: today },
    }),
  ]);

  return NextResponse.json({ ...score, datum: score.datum.toISOString() });
}
