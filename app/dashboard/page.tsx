'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Lightning, UserCirclePlus, ArrowRight, ChartLineUp } from '@phosphor-icons/react';
import { store } from '@/lib/store';
import { Nav } from '@/components/Nav';
import { Mascot } from '@/components/Mascot';
import type { Kind, Ouder, Vak } from '@/lib/types';
import { VAK_INFO } from '@/lib/types';
import { groepLabel, getXPLevel } from '@/lib/utils';

export default function DashboardPage() {
  const router = useRouter();
  const [ouder, setOuder] = useState<Ouder | null>(null);
  const [kinderen, setKinderen] = useState<Kind[]>([]);

  useEffect(() => {
    (async () => {
      const o = await store.getHuidigeOuder();
      if (!o) { router.push('/inloggen'); return; }
      setOuder(o);
      setKinderen(await store.getKinderenVanOuder());
    })();
  }, [router]);

  if (!ouder) return null;

  return (
    <div className="min-h-[100dvh]">
      <Nav ouderNaam={ouder.naam} />

      <main className="max-w-2xl mx-auto px-5 py-10">
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="flex justify-center mb-3">
            <Mascot kleur="#F07329" modus="blij" grootte={80} />
          </div>
          <h1 className="text-2xl font-extrabold text-foreground">
            Hoi, {ouder.naam.split(' ')[0]}! 👋
          </h1>
          <p className="text-sm text-muted-DEFAULT mt-1">
            Bekijk de kinderen of voeg een nieuw kind toe.
          </p>
        </motion.div>

        {kinderen.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-card p-10 text-center"
          >
            <div className="text-5xl mb-4">🧒</div>
            <h2 className="text-lg font-bold text-foreground mb-2">
              Voeg je eerste kind toe
            </h2>
            <p className="text-sm text-muted-DEFAULT mb-6 max-w-xs mx-auto">
              Maak een profiel aan en begin meteen met oefenen.
            </p>
            <Link
              href="/kind/nieuw"
              className="inline-flex items-center gap-2 bg-primary text-white font-bold px-6 py-3 rounded-full shadow-btn hover:bg-primary-dark active:scale-95 transition-all"
            >
              Kind toevoegen
              <ArrowRight size={15} weight="bold" />
            </Link>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-4">
            {kinderen.map((kind, i) => (
              <KindKaart
                key={kind.id}
                kind={kind}
                index={i}
              />
            ))}

            {/* Add child */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: kinderen.length * 0.08 }}
            >
              <Link
                href="/kind/nieuw"
                className="flex items-center justify-center gap-2 bg-white rounded-3xl shadow-card p-5 font-semibold text-sm text-muted-DEFAULT hover:text-primary hover:shadow-card-hover border-2 border-dashed border-border hover:border-primary/30 transition-all"
              >
                <UserCirclePlus size={20} />
                Kind toevoegen
              </Link>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}

function KindKaart({ kind, index }: { kind: Kind; index: number }) {
  const scores = store.getScoresPerVak(kind);
  const xp = store.getXP(kind);
  const aantalSessies = kind.scores.length;
  const vakken = Object.entries(VAK_INFO) as [Vak, typeof VAK_INFO[Vak]][];
  const level = getXPLevel(xp);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="bg-white rounded-3xl shadow-card overflow-hidden hover:shadow-card-hover transition-all"
    >
      {/* Top bar */}
      <div className="px-5 pt-5 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Mascot kleur={kind.kleur} modus="blij" grootte={52} />
          <div>
            <h3 className="font-extrabold text-foreground text-lg leading-tight">{kind.naam}</h3>
            <p className="text-xs text-muted-DEFAULT">{groepLabel(kind.groep)} &middot; {kind.leeftijd} jaar</p>
            <p className="text-xs font-bold mt-0.5" style={{ color: kind.kleur }}>
              {level.emoji} {level.titel}
            </p>
          </div>
        </div>

        {/* XP + streak */}
        <div className="flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full">
            <Lightning size={12} weight="fill" className="text-amber-500" />
            {xp} XP
          </div>
          {kind.streak > 0 && (
            <div className="flex items-center gap-1 text-xs font-bold text-orange-500 px-2 py-1 bg-orange-50 border border-orange-200 rounded-full">
              🔥 {kind.streak} dag{kind.streak !== 1 ? 'en' : ''}
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-0 border-t border-border/60 divide-x divide-border/60">
        {[
          { emoji: '❓', value: String(aantalSessies * 5), label: 'Vragen' },
          { emoji: '🎓', value: String(kind.groep), label: 'Groep' },
          { emoji: '🏆', value: '4', label: 'Vakken' },
        ].map((s) => (
          <div key={s.label} className="py-3 flex flex-col items-center">
            <span className="text-lg">{s.emoji}</span>
            <span className="text-base font-extrabold text-foreground">{s.value}</span>
            <span className="text-xs text-muted-DEFAULT">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Vakken */}
      <div className="px-5 pb-5 pt-4 grid grid-cols-2 gap-3">
        {vakken.map(([vak, info]) => {
          const s = scores[vak];
          const niveau = store.getBerekenNiveau(kind, vak);
          return (
            <div
              key={vak}
              className="rounded-2xl p-3 flex items-center gap-3"
              style={{ background: info.bg }}
            >
              <span className="text-2xl">{info.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-foreground truncate">{info.label}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className="text-xs font-bold px-1.5 py-0.5 rounded-md text-white"
                    style={{ background: info.kleur }}
                  >
                    Niv. {niveau}
                  </span>
                  {s.totaal > 0 && (
                    <span className="text-xs text-muted-DEFAULT">{s.gem}%</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="px-5 pb-5 flex gap-3">
        <Link
          href="/leren"
          onClick={() => store.setHuidigKind(kind.id)}
          className="flex-1 flex items-center justify-center gap-2 bg-primary text-white font-bold text-sm py-3 rounded-2xl shadow-btn hover:bg-primary-dark active:scale-95 transition-all"
        >
          🚀 Laten oefenen
        </Link>
        <Link
          href={`/kind/${kind.id}`}
          className="flex items-center justify-center gap-1.5 bg-white border border-border text-foreground font-semibold text-sm py-3 px-4 rounded-2xl shadow-card hover:shadow-card-hover transition-all"
        >
          <ChartLineUp size={16} />
          Profiel
        </Link>
      </div>
    </motion.div>
  );
}
