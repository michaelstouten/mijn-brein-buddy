'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Lightning } from '@phosphor-icons/react';
import { store } from '@/lib/store';
import { Nav } from '@/components/Nav';
import { Mascot } from '@/components/Mascot';
import { VAK_INFO, type Kind, type Ouder, type Vak } from '@/lib/types';
import { formatDatum, groepLabel, getXPLevel, XPLevel } from '@/lib/utils';

const LEVEL_TITELS = ['Beginner','Leerling','Denker','Ster','Superkind','Breinmeester'];
function XP_LEVELS_NEXT(level: XPLevel): string {
  return LEVEL_TITELS[level.niveau] ?? '';
}

export default function KindProfielPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [ouder, setOuder] = useState<Ouder | null>(null);
  const [kind, setKind] = useState<Kind | null>(null);

  useEffect(() => {
    (async () => {
      const o = await store.getHuidigeOuder();
      if (!o) { router.push('/inloggen'); return; }
      setOuder(o);
      const k = await store.getKind(id);
      if (!k) { router.push('/dashboard'); return; }
      setKind(k);
    })();
  }, [id, router]);

  if (!kind || !ouder) return null;

  const scores = store.getScoresPerVak(kind);
  const vakken = Object.entries(VAK_INFO) as [Vak, typeof VAK_INFO[Vak]][];
  const xp = store.getXP(kind);
  const level = getXPLevel(xp);
  const xpVoortgang = level.volgendeXP
    ? Math.round(((xp - level.minXP) / (level.volgendeXP - level.minXP)) * 100)
    : 100;
  const recenteScores = [...kind.scores].reverse().slice(0, 8);
  const totaalGoed = kind.scores.reduce((s, sc) => s + sc.aantalGoed, 0);
  const totaalVragen = kind.scores.reduce((s, sc) => s + sc.aantalTotaal, 0);
  const gemGoed = totaalVragen > 0 ? Math.round((totaalGoed / totaalVragen) * 100) : 0;

  return (
    <div className="min-h-[100dvh]">
      <Nav ouderNaam={ouder.naam} />

      <main className="max-w-lg mx-auto px-5 py-10">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted-DEFAULT hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft size={14} />
          Terug naar dashboard
        </Link>

        {/* Kind header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-card p-6 mb-5 flex flex-col items-center text-center"
        >
          <Mascot kleur={kind.kleur} modus="blij" grootte={100} />
          <h1 className="text-2xl font-extrabold text-foreground mt-2">{kind.naam} 👋</h1>
          <p className="text-sm text-muted-DEFAULT">{groepLabel(kind.groep)} &middot; {kind.leeftijd} jaar</p>

          {/* Level + XP */}
          <div className="flex items-center gap-2 mt-3">
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-sm font-bold px-4 py-2 rounded-full">
              <Lightning size={14} weight="fill" className="text-amber-500" />
              {xp} XP
            </div>
            {kind.streak > 0 && (
              <div className="flex items-center gap-1 text-sm font-bold text-orange-500 px-3 py-2 bg-orange-50 border border-orange-200 rounded-full">
                🔥 {kind.streak} dag{kind.streak !== 1 ? 'en' : ''} op rij
              </div>
            )}
          </div>

          {/* Level title + progress to next */}
          <div className="w-full mt-4 px-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-extrabold text-foreground">
                {level.emoji} {level.titel}
              </span>
              {level.volgendeXP && (
                <span className="text-xs text-muted-DEFAULT">
                  {level.volgendeXP - xp} XP tot {XP_LEVELS_NEXT(level)}
                </span>
              )}
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpVoortgang}%` }}
                transition={{ delay: 0.3, duration: 0.7, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ background: kind.kleur }}
              />
            </div>
          </div>

          <Link
            href="/leren"
            onClick={() => store.setHuidigKind(kind.id)}
            className="mt-4 inline-flex items-center gap-2 bg-primary text-white font-bold text-sm px-6 py-3 rounded-full shadow-btn hover:bg-primary-dark active:scale-95 transition-all"
          >
            🚀 Laten oefenen
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="grid grid-cols-3 gap-3 mb-5"
        >
          {[
            { emoji: '🏆', label: 'Gem. score', value: totaalVragen > 0 ? `${gemGoed}%` : '–' },
            { emoji: '🎯', label: 'Sessies', value: String(kind.scores.length) },
            { emoji: '✅', label: 'Goed', value: totaalVragen > 0 ? String(totaalGoed) : '–' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl shadow-card p-4 text-center">
              <div className="text-2xl mb-1">{s.emoji}</div>
              <p className="text-xl font-extrabold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-DEFAULT">{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Per vak */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="bg-white rounded-3xl shadow-card p-5 mb-5"
        >
          <h2 className="font-extrabold text-foreground text-base mb-4">Voortgang per vak</h2>
          <div className="flex flex-col gap-4">
            {vakken.map(([vak, info]) => {
              const s = scores[vak];
              const niveau = store.getBerekenNiveau(kind, vak);
              return (
                <div key={vak}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{info.emoji}</span>
                      <span className="font-bold text-sm text-foreground">{info.label}</span>
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                        style={{ background: info.kleur }}
                      >
                        Niveau {niveau}
                      </span>
                    </div>
                    <span className="text-sm font-extrabold" style={{ color: s.totaal > 0 ? info.kleur : '#9CA3AF' }}>
                      {s.totaal > 0 ? `${s.gem}%` : '–'}
                    </span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: s.totaal > 0 ? `${s.gem}%` : '0%' }}
                      transition={{ delay: 0.3, duration: 0.7, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ background: info.kleur }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Recente activiteit */}
        {recenteScores.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="bg-white rounded-3xl shadow-card p-5"
          >
            <h2 className="font-extrabold text-foreground text-base mb-4">Recente sessies</h2>
            <div className="flex flex-col gap-2">
              {recenteScores.map((sc) => {
                const info = VAK_INFO[sc.vak as Vak];
                const pct = Math.round((sc.aantalGoed / sc.aantalTotaal) * 100);
                return (
                  <div
                    key={sc.id}
                    className="flex items-center gap-3 rounded-2xl p-3 transition-colors hover:bg-gray-50"
                  >
                    <span className="text-xl">{info.emoji}</span>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-foreground">{info.label}</p>
                      <p className="text-xs text-muted-DEFAULT">{formatDatum(sc.datum)} &middot; {sc.aantalGoed}/{sc.aantalTotaal} goed</p>
                    </div>
                    <span
                      className="text-sm font-extrabold px-2.5 py-1 rounded-full text-white"
                      style={{ background: pct >= 70 ? info.kleur : '#F87171' }}
                    >
                      {pct}%
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
