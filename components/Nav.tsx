'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SignOut, UserCirclePlus } from '@phosphor-icons/react';
import { Mascot } from '@/components/Mascot';
import { store } from '@/lib/store';

interface NavProps {
  ouderNaam?: string;
}

export function Nav({ ouderNaam }: NavProps) {
  const router = useRouter();

  async function handleUitloggen() {
    await store.uitloggen();
    router.push('/inloggen');
  }

  return (
    <nav className="sticky top-0 z-50 px-5 py-3 flex items-center justify-between bg-background/80 backdrop-blur-md border-b border-border/40">
      <Link href="/dashboard" className="flex items-center gap-2">
        <Mascot kleur="#F07329" modus="blij" grootte={40} className="flex-shrink-0" />
        <span className="font-extrabold text-foreground text-sm">Mijn Brein Buddy</span>
      </Link>

      <div className="flex items-center gap-2">
        {ouderNaam && (
          <Link
            href="/kind/nieuw"
            className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-foreground bg-white border border-border rounded-full px-4 py-2 shadow-card hover:shadow-card-hover transition-all"
          >
            <UserCirclePlus size={15} />
            Kind toevoegen
          </Link>
        )}
        <button
          onClick={handleUitloggen}
          className="flex items-center gap-1.5 text-xs font-semibold text-muted-DEFAULT hover:text-foreground bg-white border border-border rounded-full px-3 py-2 shadow-card transition-all"
        >
          <SignOut size={14} />
          <span className="hidden md:block">Uitloggen</span>
        </button>
      </div>
    </nav>
  );
}
