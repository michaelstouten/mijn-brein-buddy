'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mascot } from '@/components/Mascot';

const vakken = [
  { emoji: '🔢', label: 'Rekenen', omschrijving: 'Sommen, tafels & getallen' },
  { emoji: '📚', label: 'Taal',    omschrijving: 'Grammatica & woordenschat' },
  { emoji: '✏️', label: 'Spelling', omschrijving: 'Woorden correct schrijven' },
  { emoji: '🧩', label: 'Logica',  omschrijving: 'Redeneren & patronen' },
];

const voordelen = [
  { emoji: '🤖', titel: 'AI-gestuurde vragen', tekst: 'Elke oefening wordt op maat gemaakt voor het niveau en de groep van jouw kind.' },
  { emoji: '📈', titel: 'Automatische voortgang', tekst: 'De moeilijkheidsgraad past zich aan. Gaat het goed? Dan wordt het uitdagender.' },
  { emoji: '🔒', titel: 'Veilig & privé', tekst: 'Geen advertenties, geen tracking. Alleen leren.' },
];

export default function HomePage() {
  return (
    <div className="min-h-[100dvh] flex flex-col">

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <Mascot kleur="#F07329" modus="blij" grootte={36} />
            <span className="font-extrabold text-lg text-foreground group-hover:opacity-80 transition-opacity">
              Mijn Brein <span style={{ color: '#F07329' }}>Buddy</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/inloggen"
              className="text-sm font-semibold text-muted-DEFAULT hover:text-foreground transition-colors"
            >
              Inloggen
            </Link>
            <Link
              href="/registreer"
              className="text-sm font-bold bg-primary text-white px-4 py-2 rounded-full shadow-btn hover:bg-primary-dark active:scale-95 transition-all"
            >
              Registreren
            </Link>
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="flex-1">

        {/* Hero */}
        <section className="flex flex-col items-center text-center px-6 pt-16 pb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            className="mb-6"
          >
            <Mascot kleur="#F07329" modus="blij" grootte={120} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h1 className="text-5xl font-extrabold tracking-tight mb-4">
              <span className="text-foreground">Mijn Brein</span>{' '}
              <span style={{ color: '#F07329' }}>Buddy</span>
            </h1>
            <p className="text-muted-DEFAULT text-base md:text-lg max-w-md mx-auto leading-relaxed mb-8">
              Jouw persoonlijke leermaatje! Oefen rekenen, taal, spelling en meer — AI kiest de perfecte vragen voor jou.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mb-8"
          >
            <Link
              href="/registreer"
              className="inline-flex items-center gap-2 bg-primary text-white font-bold text-lg px-8 py-4 rounded-full shadow-btn hover:bg-primary-dark active:scale-95 transition-all duration-150"
            >
              🚀 Begin met leren!
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap gap-3 justify-center"
          >
            {vakken.map((v) => (
              <div
                key={v.label}
                className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-card text-sm font-medium text-foreground"
              >
                <span>{v.emoji}</span>
                {v.label}
              </div>
            ))}
          </motion.div>
        </section>

        {/* Subjects */}
        <section className="bg-white py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-extrabold text-foreground text-center mb-2">Wat oefent jouw kind?</h2>
            <p className="text-sm text-muted-DEFAULT text-center mb-10">Vier vakken, elk met vragen op maat voor groep 1 t/m 8.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {vakken.map((v) => (
                <motion.div
                  key={v.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="flex flex-col items-center text-center bg-[#FDF8F5] rounded-3xl p-5 shadow-card"
                >
                  <span className="text-4xl mb-3">{v.emoji}</span>
                  <p className="font-extrabold text-foreground text-sm">{v.label}</p>
                  <p className="text-xs text-muted-DEFAULT mt-1 leading-snug">{v.omschrijving}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-extrabold text-foreground text-center mb-10">Waarom Mijn Brein Buddy?</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {voordelen.map((v, i) => (
                <motion.div
                  key={v.titel}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-3xl shadow-card p-6"
                >
                  <span className="text-3xl mb-3 block">{v.emoji}</span>
                  <h3 className="font-extrabold text-foreground text-sm mb-2">{v.titel}</h3>
                  <p className="text-xs text-muted-DEFAULT leading-relaxed">{v.tekst}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA bottom */}
        <section className="py-16 px-6 text-center">
          <h2 className="text-2xl font-extrabold text-foreground mb-3">Klaar om te beginnen?</h2>
          <p className="text-sm text-muted-DEFAULT mb-6">Begin vandaag nog met oefenen.</p>
          <Link
            href="/registreer"
            className="inline-flex items-center gap-2 bg-primary text-white font-bold text-base px-8 py-4 rounded-full shadow-btn hover:bg-primary-dark active:scale-95 transition-all"
          >
            🌟 Registreren
          </Link>
        </section>

      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-border bg-white">
        <div className="max-w-4xl mx-auto px-6 py-10">

          {/* Top row */}
          <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-8">

            {/* Brand */}
            <div className="flex flex-col gap-2">
              <Link href="/" className="flex items-center gap-2 group">
                <Mascot kleur="#F07329" modus="blij" grootte={28} />
                <span className="font-extrabold text-sm text-foreground group-hover:opacity-70 transition-opacity">
                  Mijn Brein Buddy
                </span>
              </Link>
              <p className="text-xs text-muted-DEFAULT leading-relaxed max-w-[200px]">
                Gemaakt met ❤️ door Papa Stouten
              </p>
            </div>

            {/* Colofon */}
            <div className="flex flex-col gap-1.5">
              <p className="text-xs font-bold text-foreground uppercase tracking-wide mb-1">Colofon</p>
              <p className="text-xs text-muted-DEFAULT leading-relaxed max-w-xs">
                Mijn Brein Buddy is een persoonlijk project ontwikkeld voor educatief thuisgebruik.
              </p>
              <p className="text-xs text-muted-DEFAULT leading-relaxed max-w-xs">
                De oefeningen worden gegenereerd door kunstmatige intelligentie (AI) en zijn bedoeld
                als aanvulling op het reguliere onderwijs, niet als vervanging.
              </p>
              <p className="text-xs text-muted-DEFAULT leading-relaxed max-w-xs">
                Ontwerp &amp; ontwikkeling: Papa Stouten. Gebouwd met Next.js, Prisma en Claude AI.
              </p>
            </div>

            {/* Disclaimer */}
            <div className="flex flex-col gap-1.5">
              <p className="text-xs font-bold text-foreground uppercase tracking-wide mb-1">Disclaimer</p>
              <p className="text-xs text-muted-DEFAULT leading-relaxed max-w-xs">
                De gegenereerde inhoud is indicatief. Controleer antwoorden altijd samen met uw kind.
                Mijn Brein Buddy is niet verantwoordelijk voor eventuele onjuistheden in de oefeningen.
              </p>
            </div>

          </div>

          {/* Bottom row */}
          <div className="border-t border-border/50 pt-5 flex flex-col md:flex-row items-center justify-between gap-2">
            <p className="text-xs text-muted-DEFAULT">
              © {new Date().getFullYear()} Mijn Brein Buddy — alle rechten voorbehouden
            </p>
            <p className="text-xs text-muted-DEFAULT">
              Gemaakt met ❤️ door Papa Stouten
            </p>
          </div>

        </div>
      </footer>

    </div>
  );
}
