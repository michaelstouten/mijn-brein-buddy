export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { createToken, makeSessionCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { email, wachtwoord } = await req.json();

  if (!email || !wachtwoord) {
    return NextResponse.json({ fout: 'Ontbrekende velden' }, { status: 400 });
  }

  const ouder = await prisma.ouder.findUnique({ where: { email } });
  if (!ouder) {
    return NextResponse.json({ fout: 'Onjuiste inloggegevens' }, { status: 401 });
  }

  const geldig = await bcrypt.compare(wachtwoord, ouder.wachtwoord);
  if (!geldig) {
    return NextResponse.json({ fout: 'Onjuiste inloggegevens' }, { status: 401 });
  }

  const kinderenIds = (
    await prisma.kind.findMany({ where: { ouderId: ouder.id }, select: { id: true } })
  ).map((k: { id: string }) => k.id);

  const token = await createToken(ouder.id);

  return NextResponse.json(
    {
      id: ouder.id,
      email: ouder.email,
      naam: ouder.naam,
      kinderenIds,
      aangemeldOp: ouder.aangemeldOp.toISOString(),
    },
    { headers: { 'Set-Cookie': makeSessionCookie(token) } }
  );
}
