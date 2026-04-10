'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, EyeSlash } from '@phosphor-icons/react';
import { Mascot } from '@/components/Mascot';
import { store } from '@/lib/store';

export default function RegistreerPage() {
  const router = useRouter();
  const [naam, setNaam] = useState('');
  const [email, setEmail] = useState('');
  const [wachtwoord, setWachtwoord] = useState('');
  const [toonWachtwoord, setToonWachtwoord] = useState(false);
  const [fout, setFout] = useState('');
  const [laden, setLaden] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFout('');
    if (wachtwoord.length < 6) {
      setFout('Wachtwoord moet minimaal 6 tekens bevatten.');
      return;
    }
    setLaden(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, naam, wachtwoord }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFout(data.fout ?? 'Er is iets misgegaan. Probeer het opnieuw.');
        setLaden(false);
        return;
      }
      router.push('/dashboard');
    } catch {
      setFout('Kon geen verbinding maken met de server. Controleer je internetverbinding.');
      setLaden(false);
    }
  }

  return (
    <main className="min-h-[100dvh] flex flex-col items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        {/* Mascot */}
        <div className="flex justify-center mb-4">
          <Mascot kleur="#A855F7" modus="blij" grootte={100} />
        </div>

        <h1 className="text-3xl font-extrabold text-foreground text-center mb-1">
          Maak een account
        </h1>
        <p className="text-muted-DEFAULT text-sm text-center mb-8">
          Gratis voor ouders — geen creditcard nodig 🎈
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">
              Jouw naam
            </label>
            <input
              type="text"
              value={naam}
              onChange={(e) => setNaam(e.target.value)}
              required
              placeholder="Jan de Vries"
              className="w-full bg-white border border-border rounded-2xl px-4 py-3 text-sm text-foreground placeholder:text-muted-DEFAULT shadow-card focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">
              E-mailadres
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="naam@voorbeeld.nl"
              className="w-full bg-white border border-border rounded-2xl px-4 py-3 text-sm text-foreground placeholder:text-muted-DEFAULT shadow-card focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">
              Wachtwoord
            </label>
            <div className="relative">
              <input
                type={toonWachtwoord ? 'text' : 'password'}
                value={wachtwoord}
                onChange={(e) => setWachtwoord(e.target.value)}
                required
                placeholder="Minimaal 6 tekens"
                className="w-full bg-white border border-border rounded-2xl px-4 py-3 text-sm text-foreground placeholder:text-muted-DEFAULT shadow-card focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all pr-12"
              />
              <button
                type="button"
                onClick={() => setToonWachtwoord(!toonWachtwoord)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-DEFAULT hover:text-foreground p-1 transition-colors"
              >
                {toonWachtwoord ? <EyeSlash size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {fout && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl px-4 py-3"
            >
              {fout}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={laden}
            className="bg-primary text-white font-bold text-base py-3.5 rounded-full shadow-btn hover:bg-primary-dark active:scale-95 transition-all duration-150 disabled:opacity-60 mt-1 flex items-center justify-center gap-2"
          >
            {laden ? (
              <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
            ) : (
              '🌟 Account aanmaken'
            )}
          </button>
        </form>

        <p className="text-sm text-center text-muted-DEFAULT mt-6">
          Al een account?{' '}
          <Link href="/inloggen" className="font-bold underline underline-offset-2" style={{ color: '#F07329' }}>
            Inloggen
          </Link>
        </p>
      </motion.div>
    </main>
  );
}
