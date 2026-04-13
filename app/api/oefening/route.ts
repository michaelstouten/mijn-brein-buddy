export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import type { Vak } from '@/lib/types';

const client = new Anthropic();

const VAK_BESCHRIJVINGEN: Record<Vak, string> = {
  rekenen:
    'ALLEEN wiskundige sommen. De vraag bestaat UITSLUITEND uit getallen en rekentekens (+, -, ×, ÷), zoals "7 × 8 =", "45 − 18 =", "120 ÷ 6 =". ABSOLUUT VERBODEN: woordproblemen, verhalen, kleuren, reeksen, categorieën, logica, meerkeuze. Formaat altijd: getal rekenteken getal =',
  taal:
    `Nederlandse taalopgaven. Gebruik uitsluitend de volgende vraagtypen:
- De/het: "Schrijf het juiste lidwoord: ___ fiets" → antwoord: "de"
- Enkelvoud/meervoud: "Wat is het meervoud van 'appel'?" → antwoord: "appels"
- Werkwoordsvorm: "Vul in: Ik ___ naar school. (lopen)" → antwoord: "loop"
- Zinsontleding (groep 6+): "Wat is het onderwerp in: 'De hond rent snel.'?" → antwoord: "de hond"
- Begrijpend lezen: geef een korte zin, stel dan een vraag over de inhoud
Vragen zijn altijd volledige, correcte Nederlandse zinnen. Het antwoord is één woord of een korte woordgroep.`,
  spelling:
    `Spellingsoefeningen voor Nederlandse woorden. Gebruik uitsluitend de volgende vraagtypen:
- Schrijf het woord: geef een beschrijving die PRECIES ÉÉN woord als antwoord heeft. Gebruik onderscheidende kenmerken: "Schrijf het woord: het tegenovergestelde van 'koud'." → antwoord: "warm". VERBODEN: vage omschrijvingen als 'iets wat je eet' of 'een dier' — te veel woorden passen dan.
- Dictee-stijl: noem één specifiek kenmerk dat het woord uniek identificeert: "Schrijf het woord: het dier dat 'woef' zegt." → antwoord: "hond". Of: "Schrijf het woord: de grote gele vrucht met schil die apen eten." → antwoord: "banaan"
- Meerkeuze: "Welk woord is juist gespeld?" met 1 correct gespeld woord en 3 fout gespelde versies van HETZELFDE woord
Bij meerkeuze: de 3 foute opties zijn ALTIJD fout gespelde varianten van het juiste woord (bijv. "roos" → "rooz", "rooes", "rohz") — gebruik NOOIT andere echte Nederlandse woorden als afleidopties.
KRITIEKE REGEL: elke beschrijving mag maar één logisch correct antwoord hebben. Controleer: past er maar één woord bij de beschrijving? Zo niet, maak de beschrijving specifieker.
Antwoorden zijn altijd één correct gespeld Nederlands woord. Als echt meerdere woorden correct zijn, gebruik dan het | teken: "hond|kat".`,
  logica:
    `Logische denkvragen passend bij de basisschool. Gebruik uitsluitend de volgende vraagtypen:

1. Getallenreeks (altijd meerkeuze):
   Vraag: "Welk getal komt hierna? 2, 4, 6, 8, ..."
   Opties: vier getallen waarvan er één correct is
   Antwoord: het getal dat de reeks logisch voortzet

2. Uitzondering aanwijzen (altijd meerkeuze):
   Vraag: "Welk woord hoort er niet bij: appel, peer, wortel, banaan?"
   Opties: UITSLUITEND de woorden die in de vraag staan (appel, peer, wortel, banaan) — NOOIT een categorie-naam of extra woord toevoegen
   Antwoord: het woord uit de lijst dat niet in de categorie past

3. Analogie (altijd meerkeuze, groep 4+):
   Vraag: "Een vis zwemt. Een vogel ___?"
   Opties: vier werkwoorden waarvan er één correct is
   Antwoord: het woord dat de analogie compleet maakt

4. Redeneren (meerkeuze ja/nee of meerkeuze met 4 opties, groep 5+):
   Vraag: "Tim heeft meer snoep dan Lisa. Lisa heeft meer snoep dan Sara. Wie heeft het meeste snoep?"
   Antwoord: "Tim"

5. Woordpatroon (meerkeuze, groep 3+):
   Vraag: "Roos, tulp, madelief — wat zijn dit allemaal?"
   Opties: vier categorieën waarvan er één correct is
   Antwoord: de juiste categorie

VERBODEN: rekensommen, lichaamsdelen, fysieke handelingen, afbeeldingen of aanwijzingen die de tekst alleen niet begrijpelijk maken.
Vragen zijn altijd volledige correcte Nederlandse zinnen. Antwoorden zijn altijd één woord of getal.`,
};

const GROEP_BESCHRIJVINGEN: Record<number, string> = {
  1: 'kleuters (4-5 jaar), zeer eenvoudig, tellen tot 10, eenvoudste woorden. Voor logica: simpele reeksen (rood, blauw, rood, blauw, ___?), wat hoort er niet bij uit 3 dingen.',
  2: 'kleuters (5-6 jaar), tellen tot 20, eenvoudige woorden herkennen. Voor logica: eenvoudige reeksen met vormen of kleuren, simpele categorieën (dieren/voedsel/voertuigen).',
  3: 'eerste klas (6-7 jaar), optellen tot 20, eenvoudige zinnen. Voor logica: getallenreeksen tot 20 (stappen van 2 of 5), uitzondering uit 4 woorden aanwijzen.',
  4: 'tweede klas (7-8 jaar), optellen en aftrekken tot 100, tafels van 2/5/10. Voor logica: getallenreeksen met stap 2/5/10, eenvoudige analogieën (kat→mauwen, hond→?).',
  5: 'derde klas (8-9 jaar), tafels tot 10, vermenigvuldigen. Voor logica: getallenreeksen met wisselende stappen, analogieën met categorieën, eenvoudig redeneren.',
  6: 'vierde klas (9-10 jaar), delen, breuken introductie. Voor logica: complexere reeksen, analogieën met meerdere stappen, syllogismen (Als A dan B...).',
  7: 'vijfde klas (10-11 jaar), procenten, decimalen. Voor logica: reeksen met vermenigvuldiging/deling, woordanalogieën, redeneerketens.',
  8: 'zesde klas (11-12 jaar), verhoudingen, algebra introductie. Voor logica: complexe analogieën, meerstaps redeneren, patroonherkenning in reeksen met meerdere regels.',
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
Algemene regels:
- Alle vragen en antwoorden zijn in correct, vloeiend Nederlands
- Gebruik correcte lidwoorden: "de/het", "dit/dat", "deze/die" (bijv. "dit plaatje" want "plaatje" is een het-woord)
- Gebruik correcte zinsbouw: "Welk woord hoort er niet bij?" — NIET "Welk woord hoort niet bij?" (het woordje "er" is verplicht in deze constructie)
- Elke vraag is een volledige, grammaticaal correcte Nederlandse zin eindigend op een vraagteken
- Passend bij de leeftijd en het groepsniveau
- Afwisselend: wissel vraagtypen af, herhaal niet hetzelfde patroon
- Voor meerkeuze: altijd precies 4 opties, precies 1 correct antwoord, alle 4 opties zijn onderling verschillend
- Het antwoord bij meerkeuze staat altijd exact als één van de opties
- Als bij tekst meerdere antwoorden correct zijn, gebruik het | teken: "kat|poes" — het eerste woord is het hoofdantwoord
- De uitleg is maximaal 1 zin, geschreven op kindniveau (max. 8-jarig begripsniveau), begint met het correcte antwoord
- Vraag en antwoord sluiten altijd precies op elkaar aan — geen ambiguïteit
- Het antwoord is altijd het meest specifieke, precieze woord dat past (bijv. "onderarm" niet "arm" als de vraag specifiek het deel tussen hand en elleboog beschrijft)
${vak === 'rekenen' ? '- Voor rekenen: ALLEEN getallen en rekentekens (+, -, ×, ÷). ABSOLUUT VERBODEN: tekst, kleuren, patronen, categorieën, logica, meerkeuze.' : ''}
${vak === 'logica' ? `- Voor logica: gebruik UITSLUITEND de 5 toegestane vraagtypen zoals beschreven. VERBODEN: rekensommen, lichaamsdelen, fysieke handelingen.
- Bij "uitzondering aanwijzen": de 4 meerkeuze-opties zijn ALTIJD EN ALLEEN de woorden die in de vraag zelf staan — voeg NOOIT een categorienaam of extra woord toe als optie.
- Controleer voor elk gegenereerde vraag: (1) is de zin grammaticaal correct? (2) heeft het antwoord precies één goede oplossing? (3) past de moeilijkheid bij de groep?` : ''}
${vak === 'spelling' ? '- Voor spelling meerkeuze: de 3 foute opties zijn ALTIJD fout gespelde varianten van hetzelfde woord — gebruik NOOIT andere echte Nederlandse woorden als afleiding.' : ''}
${vak === 'taal' ? '- Voor taal: elke vraag test precies één taalregel. De zinscontext en gevraagde antwoord moeten overeenkomen (vraag naar "ik" → antwoord in eerste persoon enkelvoud).' : ''}

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
