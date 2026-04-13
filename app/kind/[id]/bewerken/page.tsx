'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from '@phosphor-icons/react';
import { store } from '@/lib/store';
import { Mascot } from '@/components/Mascot';
import { Nav } from '@/components/Nav';
import type { Ouder } from '@/lib/types';

const KIND_KLEUREN = [
  { kleur: '#F07329', label: 'Oranje' },
  { kleur: '#A855F7', label: 'Paars' },
  { kleur: '#3B82F6', label: 'Blauw' },
  { kleur: '#06B6D4', label: 'Cyaan' },
  { kleur: '#F59E0B', label: 'Geel' },
  { kleur: '#10B981', label: 'Groen' },
];

const GROEP_EMOJIS: Record<number, string> = {
  1: '🌱', 2: '🌿', 3: '🌳', 4: '⭐', 5: '🌟', 6: '🚀', 7: '💫', 8: '🏆',
};

export default function BewerkKindPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [ouder, setOuder] = useState<Ouder | null>(null);
  const [naam, setNaam] = useState('');
  const [leeftijd, setLeeftijd] = useState('');
  const [groep, setGroep] = useState('');
  const [kleur, setKleur] = useState(KIND_KLEUREN[0].kleur);
  const [fout, setFout] = useState('');
  const [laden, setLaden] = useState(false);
  const [geladen, setGeladen] = useState(false);

  useEffect(() => {
    (async () => {
      const o = await store.getHuidigeOuder();
      if (!o) { router.push('/inloggen'); return; }
      setOuder(o);
      const kind = await store.getKind(id);
      if (!kind) { router.push('/instellingen'); return; }
      setNaam(kind.naam);
      setLeeftijd(String(kind.leeftijd));
      setGroep(String(kind.groep));
      setKleur(kind.kleur);
      setGeladen(true);
    })();
  }, [id, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFout('');
    const leeftijdNum = parseInt(leeftijd);
    const groepNum = parseInt(groep);
    if (!naam.trim()) { setFout('Voer een naam in.'); return; }
    if (isNaN(leeftijdNum) || leeftijdNum < 4 || leeftijdNum > 13) {
      setFout('Voer een geldige leeftijd in (4–13 jaar).'); return;
    }
    if (isNaN(groepNum) || groepNum < 1 || groepNum > 8) {
      setFout('Kies een schoolgroep.'); return;
    }
    setLaden(true);
    await store.wijzigKind(id, { naam: naam.trim(), leeftijd: leeftijdNum, groep: groepNum, kleur });
    router.push('/instellingen');
  }

  if (!ouder || !geladen) return null;

  return (
    <div className="min-h-[100dvh]">
      <Nav ouderNaam={ouder?.naam} />

      <main className="max-w-sm mx-auto px-5 py-10">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Link
            href="/instellingen"
            className="inline-flex items-center gap-1.5 text-sm text-muted-DEFAULT hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft size={14} />
            Terug naar instellingen
          </Link>

          {/* Preview mascot */}
          <div className="flex flex-col items-center mb-6">
            <Mascot kleur={kleur} modus="blij" grootte={100} />
            <p className="text-xl font-extrabold text-foreground mt-2">
              {naam || 'Naam kind'} {naam && '👋'}
            </p>
            <p className="text-sm text-muted-DEFAULT">
              {groep ? `Groep ${groep}` : 'Kies een groep'} &middot; {leeftijd ? `${leeftijd} jaar` : ''}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Naam */}
            <div>
              <label className="block text-sm font-bold text-foreground mb-1.5">
                Naam van het kind
              </label>
              <input
                type="text"
                value={naam}
                onChange={(e) => setNaam(e.target.value)}
                required
                placeholder="bijv. Emma"
                className="w-full bg-white border border-border rounded-2xl px-4 py-3 text-sm text-foreground placeholder:text-muted-DEFAULT shadow-card focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
            </div>

            {/* Leeftijd */}
            <div>
              <label className="block text-sm font-bold text-foreground mb-1.5">
                Leeftijd
              </label>
              <input
                type="number"
                value={leeftijd}
                onChange={(e) => setLeeftijd(e.target.value)}
                required
                min={4}
                max={13}
                placeholder="bijv. 8"
                className="w-full bg-white border border-border rounded-2xl px-4 py-3 text-sm text-foreground placeholder:text-muted-DEFAULT shadow-card focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
            </div>

            {/* Groep */}
            <div>
              <label className="block text-sm font-bold text-foreground mb-2">
                Schoolgroep
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGroep(String(g))}
                    className={`flex flex-col items-center py-3 rounded-2xl border-2 transition-all font-bold text-xs
                      ${groep === String(g)
                        ? 'border-primary bg-primary-light text-primary'
                        : 'border-border bg-white text-foreground shadow-card hover:shadow-card-hover'
                      }`}
                  >
                    <span className="text-xl mb-1">{GROEP_EMOJIS[g]}</span>
                    Groep {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Kleur */}
            <div>
              <label className="block text-sm font-bold text-foreground mb-2">
                Profielkleur
              </label>
              <div className="flex gap-3">
                {KIND_KLEUREN.map((k) => (
                  <button
                    key={k.kleur}
                    type="button"
                    onClick={() => setKleur(k.kleur)}
                    className="w-10 h-10 rounded-full transition-all hover:scale-110 active:scale-95"
                    style={{
                      background: k.kleur,
                      outline: kleur === k.kleur ? `3px solid ${k.kleur}` : 'none',
                      outlineOffset: '2px',
                      opacity: kleur === k.kleur ? 1 : 0.5,
                    }}
                  />
                ))}
              </div>
            </div>

            <AnimatePresence>
              {fout && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl px-4 py-3"
                >
                  {fout}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={laden}
              className="bg-primary text-white font-bold text-base py-3.5 rounded-full shadow-btn hover:bg-primary-dark active:scale-95 transition-all duration-150 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {laden ? (
                <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
              ) : (
                '💾 Wijzigingen opslaan'
              )}
            </button>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
