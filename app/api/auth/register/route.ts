export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { createToken, makeSessionCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { email, naam, wachtwoord } = await req.json();

  if (!email || !naam || !wachtwoord) {
    return NextResponse.json({ fout: 'Ontbrekende velden' }, { status: 400 });
  }

  const bestaand = await prisma.ouder.findUnique({ where: { email } });
  if (bestaand) {
    return NextResponse.json({ fout: 'E-mailadres al in gebruik' }, { status: 409 });
  }

  const hash = await bcrypt.hash(wachtwoord, 12);
  const ouder = await prisma.ouder.create({
    data: { email, naam, wachtwoord: hash },
  });

  const token = await createToken(ouder.id);

  return NextResponse.json(
    {
      id: ouder.id,
      email: ouder.email,
      naam: ouder.naam,
      kinderenIds: [],
      aangemeldOp: ouder.aangemeldOp.toISOString(),
    },
    { headers: { 'Set-Cookie': makeSessionCookie(token) } }
  );
}
