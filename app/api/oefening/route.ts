import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import type { Vak } from '@/lib/types';

const client = new Anthropic();

const VAK_BESCHRIJVINGEN: Record<Vak, string> = {
  rekenen:
    'rekensommen zoals optellen, aftrekken, vermenigvuldigen en delen. Schrijf de vraag als een korte wiskundige som (bijv. "24 ÷ 4 =", "7 × 8 =", "153 + 48 ="). Geen woordproblemen, gewoon de som.',
  taal:
    'Nederlandse taalopgaven zoals zinsontleding, grammatica (de/het, enkelvoud/meervoud, werkwoordsvormen), begrijpend lezen en woordbegrip.',
  spelling:
    'spellingsoefeningen voor Nederlandse woorden. Vraag het kind om het juiste gespelde woord te kiezen of een woord te schrijven. Gebruik moeilijkheden passend bij de groep.',
  logica:
    'logische redeneeropgaven, getallenreeksen, patroonherkenning en eenvoudige puzzels. Geen rekensommen, maar denkvragen.',
};

const GROEP_BESCHRIJVINGEN: Record<number, string> = {
  1: 'kleuters (4-5 jaar), zeer eenvoudig, tellen tot 10, eenvoudste woorden',
  2: 'kleuters (5-6 jaar), tellen tot 20, eenvoudige woorden herkennen',
  3: 'eerste klas (6-7 jaar), optellen tot 20, eenvoudige zinnen, eerste woordjes schrijven',
  4: 'tweede klas (7-8 jaar), optellen en aftrekken tot 100, tafels van 2/5/10, eenvoudige spelling',
  5: 'derde klas (8-9 jaar), tafels tot 10, vermenigvuldigen, langere teksten, spelling van verdubbeling',
  6: 'vierde klas (9-10 jaar), delen, breuken introductie, complexere spelling, grammatica',
  7: 'vijfde klas (10-11 jaar), procenten, decimalen, complexe grammatica, werkwoordsvormen',
  8: 'zesde klas (11-12 jaar), verhoudingen, algebra introductie, complexe teksten en werkwoorden',
};

const TOTAAL_VRAGEN = 5;
const MAX_HERHAAL_VRAGEN = 3; // max previously-wrong questions to reuse

export async function POST(req: NextRequest) {
  try {
    const { vak, niveau, groep, naam, kindId } = (await req.json()) as {
      vak: Vak;
      niveau: number;
      groep: number;
      naam: string;
      kindId: string;
    };

    if (!vak || !niveau || !groep || !kindId) {
      return NextResponse.json({ error: 'Ontbrekende parameters' }, { status: 400 });
    }

    // Verify session ownership
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    const kind = await prisma.kind.findFirst({ where: { id: kindId, ouderId: session.ouderId } });
    if (!kind) return NextResponse.json({ error: 'Kind niet gevonden' }, { status: 404 });

    // --- Step 1: find previously wrong exercises not yet mastered ---
    // "not yet mastered" = most recent poging for this exercise was wrong
    const foutePogingen = await prisma.oefeningPoging.findMany({
      where: { kindId, oefening: { vak } },
      orderBy: { datum: 'desc' },
      include: { oefening: true },
    });

    // Group by oefeningId, keep only most recent poging per exercise
    const meestRecent = new Map<string, typeof foutePogingen[0]>();
    for (const p of foutePogingen) {
      if (!meestRecent.has(p.oefeningId)) meestRecent.set(p.oefeningId, p);
    }

    // Keep exercises where most recent answer was wrong
    const teHerhalen = Array.from(meestRecent.values())
      .filter((p) => !p.goed)
      .map((p) => p.oefening)
      .slice(0, MAX_HERHAAL_VRAGEN);

    // --- Step 2: generate remaining questions via AI ---
    const aantalNieuw = TOTAAL_VRAGEN - teHerhalen.length;
    let nieuweOefeningen: Array<{
      id: string; vraag: string; type: string; opties?: string[]; antwoord: string; uitleg: string;
    }> = [];

    if (aantalNieuw > 0) {
      const groepBeschrijving = GROEP_BESCHRIJVINGEN[groep] ?? GROEP_BESCHRIJVINGEN[4];
      const vakBeschrijving = VAK_BESCHRIJVINGEN[vak];

      const herhaalVragen = teHerhalen.map((o) => `- ${o.vraag}`).join('\n');
      const herhaalInstructie = teHerhalen.length > 0
        ? `\nDe volgende vragen worden al herhaald (maak géén duplicaten hiervan):\n${herhaalVragen}\n`
        : '';

      const prompt = `Je bent een Nederlandse onderwijsassistent voor basisschoolkinderen. Genereer precies ${aantalNieuw} oefeningen voor ${naam} die in ${groepBeschrijving} zit.

Vak: ${vak}
Beschrijving: ${vakBeschrijving}
Moeilijkheidsgraad: ${niveau} van 5 (${niveau <= 2 ? 'makkelijk' : niveau <= 3 ? 'gemiddeld' : 'uitdagend'})
${herhaalInstructie}
Regels:
- Alle teksten in correct Nederlands
- Passend bij het niveau van de groep
- Afwisselend en leuk
- Voor meerkeuze: altijd precies 4 opties, precies 1 correct antwoord
- Alle 4 opties bij meerkeuze MOETEN onderling verschillend zijn — geen duplicaten
- Het antwoord moet exact overeenkomen met één van de opties (bij meerkeuze)
- Uitleg is kort en begrijpelijk voor een kind
${vak === 'rekenen' ? '- Voor rekenen: de vraag is ALTIJD een korte som zoals "7 × 8 =", "45 − 18 =" of "120 ÷ 6 =". Geen verhalen of woordproblemen.' : ''}

Antwoord ALLEEN met geldige JSON in dit exacte formaat (geen uitleg, geen markdown):
[
  {
    "vraag": "...",
    "type": "meerkeuze",
    "opties": ["optie1", "optie2", "optie3", "optie4"],
    "antwoord": "optie1",
    "uitleg": "..."
  },
  {
    "vraag": "...",
    "type": "tekst",
    "antwoord": "het juiste antwoord",
    "uitleg": "..."
  }
]`;

      const message = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
      });

      const rawText = message.content[0].type === 'text' ? message.content[0].text : '';
      const jsonMatch = rawText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('Geen geldige JSON ontvangen van AI');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const parsed: any[] = JSON.parse(jsonMatch[0]);

      // Deduplicate options safety net
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const gesaneerd = parsed.map((o: any) => {
        if (o.type !== 'meerkeuze' || !Array.isArray(o.opties)) return o;
        return { ...o, opties: Array.from(new Set<string>(o.opties)) };
      });

      // Store new exercises in DB
      const opgeslagen = await Promise.all(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        gesaneerd.map((o: any) =>
          prisma.geslagenOefening.create({
            data: {
              vak,
              groep,
              niveau,
              vraag: o.vraag,
              type: o.type,
              opties: o.opties ? JSON.stringify(o.opties) : null,
              antwoord: o.antwoord,
              uitleg: o.uitleg,
            },
          })
        )
      );

      nieuweOefeningen = opgeslagen.map((o) => ({
        id: o.id,
        vraag: o.vraag,
        type: o.type,
        opties: o.opties ? JSON.parse(o.opties) : undefined,
        antwoord: o.antwoord,
        uitleg: o.uitleg,
      }));
    }

    // --- Step 3: combine herhaal + nieuw, shuffle ---
    const herhaalGemapped = teHerhalen.map((o) => ({
      id: o.id,
      vraag: o.vraag,
      type: o.type,
      opties: o.opties ? JSON.parse(o.opties) : undefined,
      antwoord: o.antwoord,
      uitleg: o.uitleg,
      isHerhaling: true,
    }));

    const combined = [...herhaalGemapped, ...nieuweOefeningen];
    // Shuffle
    for (let i = combined.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [combined[i], combined[j]] = [combined[j], combined[i]];
    }

    return NextResponse.json({ oefeningen: combined, aantalHerhaling: teHerhalen.length });
  } catch (err) {
    console.error('Fout bij genereren oefeningen:', err);
    return NextResponse.json({ error: 'Oefeningen konden niet worden geladen' }, { status: 500 });
  }
}
