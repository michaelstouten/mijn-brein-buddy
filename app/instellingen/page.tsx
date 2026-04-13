'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, PencilSimple, Trash, UserCirclePlus, Warning } from '@phosphor-icons/react';
import { store } from '@/lib/store';
import { Nav } from '@/components/Nav';
import { Mascot } from '@/components/Mascot';
import type { Kind, Ouder } from '@/lib/types';
import { groepLabel } from '@/lib/utils';

export default function InstellingenPage() {
  const router = useRouter();
  const [ouder, setOuder] = useState<Ouder | null>(null);
  const [kinderen, setKinderen] = useState<Kind[]>([]);
  const [verwijderKindId, setVerwijderKindId] = useState<string | null>(null);
  const [bezig, setBezig] = useState(false);

  useEffect(() => {
    (async () => {
      const o = await store.getHuidigeOuder();
      if (!o) { router.push('/inloggen'); return; }
      setOuder(o);
      setKinderen(await store.getKinderenVanOuder());
    })();
  }, [router]);

  async function handleVerwijder(id: string) {
    setBezig(true);
    await store.verwijderKind(id);
    setKinderen((prev) => prev.filter((k) => k.id !== id));
    setVerwijderKindId(null);
    setBezig(false);
  }

  if (!ouder) return null;

  const teVerwijderen = kinderen.find((k) => k.id === verwijderKindId);

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

        <h1 className="text-2xl font-extrabold text-foreground mb-1">Instellingen</h1>
        <p className="text-sm text-muted-DEFAULT mb-8">Beheer de kinderprofielen van jouw account.</p>

        {/* Children list */}
        <div className="flex flex-col gap-4 mb-6">
          {kinderen.length === 0 && (
            <div className="bg-white rounded-3xl shadow-card p-8 text-center text-muted-DEFAULT text-sm">
              Nog geen kinderen toegevoegd.
            </div>
          )}

          {kinderen.map((kind, i) => (
            <motion.div
              key={kind.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-white rounded-3xl shadow-card p-5 flex items-center gap-4"
            >
              <Mascot kleur={kind.kleur} modus="blij" grootte={56} />
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-foreground text-base leading-tight">{kind.naam}</p>
                <p className="text-xs text-muted-DEFAULT mt-0.5">
                  {groepLabel(kind.groep)} &middot; {kind.leeftijd} jaar
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/kind/${kind.id}/bewerken`}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-primary-light text-foreground hover:text-primary transition-all"
                  title="Bewerken"
                >
                  <PencilSimple size={16} weight="bold" />
                </Link>
                <button
                  onClick={() => setVerwijderKindId(kind.id)}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-red-50 text-foreground hover:text-red-500 transition-all"
                  title="Verwijderen"
                >
                  <Trash size={16} weight="bold" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Add child */}
        <Link
          href="/kind/nieuw"
          className="flex items-center justify-center gap-2 bg-white rounded-3xl shadow-card p-5 font-semibold text-sm text-muted-DEFAULT hover:text-primary hover:shadow-card-hover border-2 border-dashed border-border hover:border-primary/30 transition-all"
        >
          <UserCirclePlus size={20} />
          Kind toevoegen
        </Link>
      </main>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {verwijderKindId && teVerwijderen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-5 bg-black/40 backdrop-blur-sm"
            onClick={() => setVerwijderKindId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
                  <Warning size={28} weight="fill" className="text-red-500" />
                </div>
              </div>
              <h2 className="text-lg font-extrabold text-foreground text-center mb-1">
                {teVerwijderen.naam} verwijderen?
              </h2>
              <p className="text-sm text-muted-DEFAULT text-center mb-6">
                Dit verwijdert het profiel en alle voortgang van {teVerwijderen.naam}. Dit kan niet ongedaan worden gemaakt.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setVerwijderKindId(null)}
                  className="flex-1 py-3 rounded-full font-bold text-sm bg-gray-100 text-foreground hover:bg-gray-200 transition-all"
                >
                  Annuleren
                </button>
                <button
                  onClick={() => handleVerwijder(verwijderKindId)}
                  disabled={bezig}
                  className="flex-1 py-3 rounded-full font-bold text-sm bg-red-500 text-white hover:bg-red-600 active:scale-95 transition-all disabled:opacity-60"
                >
                  {bezig ? 'Verwijderen...' : 'Ja, verwijder'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
