'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from '@phosphor-icons/react';
import { store } from '@/lib/store';
import { VAK_INFO, type Oefening, type Kind, type Vak } from '@/lib/types';
import { Mascot } from '@/components/Mascot';
import Link from 'next/link';

type Fase = 'laden' | 'oefenen' | 'resultaat' | 'fout';

export default function OefeningPage() {
  const { vak } = useParams<{ vak: string }>();
  const router = useRouter();
  const [kind, setKind] = useState<Kind | null>(null);
  const [fase, setFase] = useState<Fase>('laden');
  const [oefeningen, setOefeningen] = useState<Oefening[]>([]);
  const [huidigIndex, setHuidigIndex] = useState(0);
  const [antwoord, setAntwoord] = useState('');
  const [geselecteerdeOptieIndex, setGeselecteerdeOptieIndex] = useState<number | null>(null);
  const [bevestigd, setBevestigd] = useState(false);
  const [isGoed, setIsGoed] = useState<boolean | null>(null);
  const [aantalGoed, setAantalGoed] = useState(0);
  const aantalGoedRef = useRef(0); // ref to avoid stale closure when saving score
  const bevestigdRef = useRef(false); // ref guard against double-click race condition
  const [startTijd] = useState(() => Date.now());
  const [foutMelding, setFoutMelding] = useState('');
  const tekstInputRef = useRef<HTMLInputElement>(null);

  const vakInfo = VAK_INFO[vak as Vak];

  useEffect(() => {
    store.getHuidigKind().then((k) => {
      if (!k) { router.push('/leren'); return; }
      setKind(k);
    });
  }, [router]);

  const cacheSleutel = kind ? `mbb_oefening_${kind.id}_${vak}` : null;
  const CACHE_MAX_MS = 60 * 60 * 1000; // 1 hour

  const laadOefeningen = useCallback(async (forceerNieuw = false) => {
    if (!kind || !vakInfo) return;
    setFase('laden');
    setAntwoord('');
    setGeselecteerdeOptieIndex(null);
    setBevestigd(false);
    setIsGoed(null);
    setAantalGoed(0);
    aantalGoedRef.current = 0;
    bevestigdRef.current = false;
    setHuidigIndex(0);

    // Check sessionStorage cache (skip on explicit refresh)
    const sleutel = `mbb_oefening_${kind.id}_${vak}`;
    if (!forceerNieuw) {
      try {
        const cached = sessionStorage.getItem(sleutel);
        if (cached) {
          const { oefeningen: cachedOef, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_MAX_MS && cachedOef?.length) {
            setOefeningen(cachedOef);
            setFase('oefenen');
            return;
          }
        }
      } catch { /* ignore storage errors */ }
    }

    try {
      const niveau = store.getBerekenNiveau(kind, vak as Vak);
      const res = await fetch('/api/oefening', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vak, niveau, groep: kind.groep, naam: kind.naam, kindId: kind.id }),
      });
      if (!res.ok) throw new Error('API fout');
      const data = await res.json();
      if (!data.oefeningen?.length) throw new Error('Geen oefeningen');

      // Cache in sessionStorage
      try {
        sessionStorage.setItem(sleutel, JSON.stringify({ oefeningen: data.oefeningen, timestamp: Date.now() }));
      } catch { /* ignore storage errors */ }

      setOefeningen(data.oefeningen);
      setFase('oefenen');
    } catch {
      setFoutMelding('Kon oefeningen niet laden. Controleer je internetverbinding.');
      setFase('fout');
    }
  }, [kind, vak, vakInfo, CACHE_MAX_MS]);

  useEffect(() => {
    if (!kind) return;
    if (!vakInfo) { router.push('/leren'); return; }
    laadOefeningen();
  }, [laadOefeningen, kind, router, vakInfo]);

  function bevestigAntwoord() {
    if (!antwoord.trim() || bevestigdRef.current) return;
    bevestigdRef.current = true; // set ref immediately, before any async re-render
    const huidige = oefeningen[huidigIndex];
    const geaccepteerd = huidige.antwoord.split('|').map((a) => a.trim().toLowerCase());
    const goed = geaccepteerd.includes(antwoord.trim().toLowerCase());
    setIsGoed(goed);
    setBevestigd(true);
    if (goed) {
      aantalGoedRef.current += 1;
      setAantalGoed(aantalGoedRef.current);
    }

    // Record poging in DB (fire and forget)
    fetch('/api/oefening/poging', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kindId: kind!.id, oefeningId: huidige.id, goed }),
    }).catch(() => { /* non-critical */ });
  }

  async function volgende() {
    if (huidigIndex < oefeningen.length - 1) {
      setHuidigIndex((prev) => prev + 1);
      setAntwoord('');
      setGeselecteerdeOptieIndex(null);
      bevestigdRef.current = false;
      setBevestigd(false);
      setIsGoed(null);
      setTimeout(() => tekstInputRef.current?.focus(), 100);
    } else {
      const duur = Math.round((Date.now() - startTijd) / 1000);
      const niveau = store.getBerekenNiveau(kind!, vak as Vak);
      await store.slaScoreOp(kind!.id, vak as Vak, niveau, aantalGoedRef.current, oefeningen.length, duur);
      // Clear session cache so next session fetches fresh questions
      try { if (cacheSleutel) sessionStorage.removeItem(cacheSleutel); } catch { /* ignore */ }
      setFase('resultaat');
    }
  }

  if (!kind || !vakInfo) return null;

  const mascotKleur = fase === 'laden' ? vakInfo.kleur
    : fase === 'fout' ? '#EF4444'
    : !bevestigd ? vakInfo.kleur
    : isGoed ? '#10B981'
    : '#F59E0B';

  const mascotModus = !bevestigd ? 'blij' : isGoed ? 'blij' : 'denkt';

  return (
    <main className="min-h-[100dvh] flex flex-col">
      {/* Header */}
      <header className="px-5 py-4 flex items-center justify-between sticky top-0 z-50 bg-background/80 backdrop-blur-md">
        <Link
          href="/leren"
          className="flex items-center gap-1.5 text-sm font-semibold text-muted-DEFAULT hover:text-foreground bg-white border border-border rounded-full px-3 py-2 shadow-card transition-all"
        >
          <ArrowLeft size={14} />
          Terug
        </Link>
        <div
          className="flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-full"
          style={{ background: `${vakInfo.kleur}15`, color: vakInfo.kleur }}
        >
          <span>{vakInfo.emoji}</span>
          {vakInfo.label}
        </div>
        <div className="text-sm font-bold text-muted-DEFAULT w-16 text-right">
          {fase === 'oefenen' ? `${aantalGoed} / ${oefeningen.length}` : ''}
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-5 py-8">
        <div className="w-full max-w-sm">

          {/* === LADEN === */}
          {fase === 'laden' && (
            <motion.div key="laden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
              <div className="flex justify-center mb-4">
                <Mascot kleur={vakInfo.kleur} modus="denkt" grootte={100} />
              </div>
              <p className="font-bold text-foreground mb-1">Even nadenken...</p>
              <p className="text-sm text-muted-DEFAULT">Oefeningen worden klaargemaakt voor {kind.naam}</p>
              <div className="flex justify-center gap-1.5 mt-4">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full"
                    style={{ background: vakInfo.kleur }}
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* === FOUT === */}
          {fase === 'fout' && (
            <motion.div key="fout" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
              <div className="flex justify-center mb-4">
                <Mascot kleur="#EF4444" modus="neutraal" grootte={100} />
              </div>
              <h2 className="text-lg font-extrabold text-foreground mb-2">Oeps! 😅</h2>
              <p className="text-sm text-muted-DEFAULT mb-6">{foutMelding}</p>
              <button
                onClick={() => { laadOefeningen(true); }}
                className="bg-primary text-white font-bold px-6 py-3 rounded-full shadow-btn hover:bg-primary-dark active:scale-95 transition-all"
              >
                Probeer opnieuw
              </button>
            </motion.div>
          )}

          {/* === OEFENEN === */}
          {fase === 'oefenen' && oefeningen[huidigIndex] && (
            <AnimatePresence mode="wait">
              <motion.div
                key={huidigIndex}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
              >
                {/* Mascot reacts */}
                <div className="flex justify-center mb-4">
                  <Mascot kleur={mascotKleur} modus={mascotModus} grootte={80} />
                </div>

                {/* Progress bar */}
                <div className="mb-5">
                  <div className="h-3 bg-white rounded-full shadow-card overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: vakInfo.kleur }}
                      initial={{ width: `${(huidigIndex / oefeningen.length) * 100}%` }}
                      animate={{ width: `${((huidigIndex + (bevestigd ? 1 : 0)) / oefeningen.length) * 100}%` }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                  <p className="text-xs text-muted-DEFAULT mt-1.5 text-center">
                    Vraag {huidigIndex + 1} van {oefeningen.length}
                  </p>
                </div>

                {/* Question card */}
                <div className="bg-white rounded-3xl shadow-card p-5 mb-4">
                  <div className="flex items-start mb-5">
                    <p className="text-lg font-extrabold text-foreground leading-snug flex-1">
                      {oefeningen[huidigIndex].vraag}
                    </p>
                  </div>

                  {/* Multiple choice */}
                  {oefeningen[huidigIndex].type === 'meerkeuze' && (
                    <div className="grid grid-cols-2 gap-3">
                      {oefeningen[huidigIndex].opties?.map((optie, optieIndex) => {
                        const isGekozen = geselecteerdeOptieIndex === optieIndex;
                        const isCorrect = optie === oefeningen[huidigIndex].antwoord;

                        let style: React.CSSProperties = {
                          background: 'white',
                          border: '2px solid #F0EAE4',
                        };
                        if (bevestigd && isCorrect) {
                          style = { background: '#ECFDF5', border: '2px solid #4ADE80' };
                        } else if (bevestigd && isGekozen && !isCorrect) {
                          style = { background: '#FEF2F2', border: '2px solid #F87171' };
                        } else if (!bevestigd && isGekozen) {
                          style = { background: `${vakInfo.kleur}15`, border: `2px solid ${vakInfo.kleur}` };
                        }

                        return (
                          <button
                            key={optieIndex}
                            disabled={bevestigd}
                            onClick={() => { setAntwoord(optie); setGeselecteerdeOptieIndex(optieIndex); }}
                            className="p-4 rounded-2xl text-sm font-bold text-left transition-all active:scale-95 shadow-card"
                            style={style}
                          >
                            {optie}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Text input */}
                  {oefeningen[huidigIndex].type === 'tekst' && (
                    <input
                      ref={tekstInputRef}
                      type="text"
                      value={antwoord}
                      onChange={(e) => !bevestigd && setAntwoord(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') bevestigd ? volgende() : bevestigAntwoord();
                      }}
                      disabled={bevestigd}
                      placeholder="Schrijf je antwoord..."
                      className="w-full border-2 border-border rounded-2xl px-4 py-3 text-base font-bold bg-white text-foreground placeholder:text-muted-DEFAULT focus:outline-none transition-all"
                      style={bevestigd ? {
                        borderColor: isGoed ? '#4ADE80' : '#F87171',
                        background: isGoed ? '#ECFDF5' : '#FEF2F2',
                      } : undefined}
                      autoFocus
                    />
                  )}
                </div>

                {/* Feedback */}
                <AnimatePresence>
                  {bevestigd && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className={`rounded-2xl p-4 mb-4 ${
                        isGoed ? 'bg-emerald-50 border-2 border-emerald-200' : 'bg-amber-50 border-2 border-amber-200'
                      }`}
                    >
                      <p className="font-extrabold text-sm mb-1">
                        {isGoed ? '🎉 Super goed gedaan!' : `💡 Het goede antwoord is: ${oefeningen[huidigIndex].antwoord.split('|')[0].trim()}`}
                      </p>
                      <p className="text-xs text-muted-DEFAULT leading-relaxed">
                        {oefeningen[huidigIndex].uitleg}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action button */}
                {!bevestigd ? (
                  <button
                    onClick={bevestigAntwoord}
                    disabled={!antwoord.trim()}
                    className="w-full py-4 rounded-full font-extrabold text-base text-white transition-all active:scale-95 disabled:opacity-40"
                    style={{ background: vakInfo.kleur, boxShadow: `0 4px 14px ${vakInfo.kleur}40` }}
                  >
                    Controleer antwoord ✓
                  </button>
                ) : (
                  <button
                    onClick={volgende}
                    className="w-full py-4 rounded-full font-extrabold text-base text-white transition-all active:scale-95"
                    style={{ background: vakInfo.kleur, boxShadow: `0 4px 14px ${vakInfo.kleur}40` }}
                  >
                    {huidigIndex < oefeningen.length - 1 ? 'Volgende vraag →' : 'Resultaten bekijken 🏆'}
                  </button>
                )}
              </motion.div>
            </AnimatePresence>
          )}

          {/* === RESULTAAT === */}
          {fase === 'resultaat' && (() => {
            const eindScore = aantalGoed;
            const pct = Math.round((eindScore / oefeningen.length) * 100);
            const xpVerdiend = eindScore * 10;

            return (
              <motion.div
                key="resultaat"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 250, damping: 22 }}
                className="text-center"
              >
                {/* Mascot celebration */}
                <div className="flex justify-center mb-4">
                  <Mascot
                    kleur={pct >= 60 ? '#10B981' : '#F59E0B'}
                    modus="blij"
                    grootte={120}
                  />
                </div>

                <h2 className="text-2xl font-extrabold text-foreground mb-1">
                  {pct >= 80 ? 'Geweldig! 🌟' : pct >= 60 ? 'Goed gedaan! 👍' : 'Blijven oefenen! 💪'}
                </h2>

                <p className="text-muted-DEFAULT text-sm mb-6">
                  Je had {eindScore} van {oefeningen.length} vragen goed!
                </p>

                {/* Score ring */}
                <div className="bg-white rounded-3xl shadow-card p-6 mb-6">
                  <div
                    className="w-28 h-28 rounded-full border-8 mx-auto flex flex-col items-center justify-center mb-4"
                    style={{ borderColor: pct >= 60 ? '#10B981' : '#F59E0B' }}
                  >
                    <span className="text-3xl font-extrabold text-foreground">{pct}%</span>
                  </div>

                  {/* Stars */}
                  <div className="flex justify-center gap-3 mb-4">
                    {[1, 2, 3].map((n) => (
                      <motion.span
                        key={n}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 + n * 0.15, type: 'spring', stiffness: 300 }}
                        className="text-3xl"
                      >
                        {pct >= n * 33 ? '⭐' : '☆'}
                      </motion.span>
                    ))}
                  </div>

                  {/* XP gained */}
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 font-bold text-sm px-4 py-2 rounded-full"
                  >
                    ⚡ +{xpVerdiend} XP verdiend!
                  </motion.div>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => { laadOefeningen(true); }}
                    className="w-full py-4 rounded-full font-extrabold text-base text-white shadow-btn hover:opacity-90 active:scale-95 transition-all"
                    style={{ background: vakInfo.kleur }}
                  >
                    🔄 Nog een keer!
                  </button>
                  <Link
                    href="/leren"
                    className="w-full py-4 rounded-full font-extrabold text-base bg-white border border-border text-foreground shadow-card hover:shadow-card-hover active:scale-95 transition-all text-center"
                  >
                    Ander vak kiezen
                  </Link>
                </div>
              </motion.div>
            );
          })()}
        </div>
      </div>
    </main>
  );
}
