'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Lightning } from '@phosphor-icons/react';
import { store } from '@/lib/store';
import { Mascot } from '@/components/Mascot';
import type { Kind, Vak } from '@/lib/types';
import { VAK_INFO } from '@/lib/types';

export default function LerenPage() {
  const router = useRouter();
  const [kind, setKind] = useState<Kind | null>(null);

  useEffect(() => {
    store.getHuidigKind().then((k) => {
      if (!k) { router.push('/dashboard'); return; }
      setKind(k);
    });
  }, [router]);

  if (!kind) return null;

  const scores = store.getScoresPerVak(kind);
  const xp = store.getXP(kind);
  const vakken = Object.entries(VAK_INFO) as [Vak, typeof VAK_INFO[Vak]][];

  return (
    <main className="min-h-[100dvh]">
      {/* Top bar */}
      <header className="px-5 py-4 flex items-center justify-between sticky top-0 z-50 bg-background/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Mascot kleur={kind.kleur} modus="blij" grootte={40} />
          <div>
            <p className="text-xs text-muted-DEFAULT">Klaar om te leren,</p>
            <p className="text-sm font-extrabold text-foreground">{kind.naam}! 👋</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white border border-amber-200 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full shadow-card">
            <Lightning size={12} weight="fill" className="text-amber-500" />
            {xp} XP
          </div>
        </div>
      </header>

      <div className="max-w-sm mx-auto px-5 py-6">
        <h2 className="text-lg font-extrabold text-foreground mb-5">Kies een vak</h2>

        {/* Subject cards */}
        <div className="grid grid-cols-2 gap-3 mb-6 items-stretch">
          {vakken.map(([vak, info], i) => {
            const s = scores[vak];
            const niveau = store.getBerekenNiveau(kind, vak);
            const isAanbevolen = s.totaal > 0 && s.gem < 70;

            return (
              <motion.div
                key={vak}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
              >
                <Link href={`/leren/${vak}`} className="flex flex-col bg-white rounded-3xl shadow-card hover:shadow-card-hover transition-all active:scale-95 overflow-hidden h-full">
                  <div className="p-4 flex flex-col flex-1">
                    {/* Subject icon */}
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-3"
                      style={{ background: info.bg }}
                    >
                      {info.emoji}
                    </div>

                    <h3 className="font-extrabold text-foreground text-base leading-tight">{info.label}</h3>
                    <p className="text-xs text-muted-DEFAULT mt-0.5 leading-snug flex-1">{info.omschrijving}</p>

                    {/* Level badge */}
                    <div className="mt-3">
                      <span
                        className="inline-block text-xs font-bold px-2.5 py-1 rounded-full text-white"
                        style={{ background: info.kleur }}
                      >
                        Niveau {niveau}
                      </span>
                    </div>

                    {/* Score / aanbeveling */}
                    <p className="text-xs text-muted-DEFAULT mt-1.5 min-h-[1rem]">
                      {s.totaal > 0
                        ? <>Laatste score: <span className="font-bold" style={{ color: info.kleur }}>{s.gem}%</span></>
                        : isAanbevolen ? 'Oefen meer!'
                        : null}
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Back */}
        <Link
          href="/dashboard"
          className="flex items-center justify-center gap-2 bg-white rounded-full shadow-card border border-border text-sm font-semibold text-muted-DEFAULT hover:text-foreground py-3 transition-all"
        >
          <ArrowLeft size={14} />
          Terug naar ouderoverzicht
        </Link>
      </div>
    </main>
  );
}
