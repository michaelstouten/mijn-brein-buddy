import type { Kind, Ouder, Vak } from './types';

const HUIDIG_KIND_KEY = 'mbb-huidig-kind';

export const store = {
  // ── Auth ────────────────────────────────────────────────────────────────

  async registreerOuder(email: string, naam: string, wachtwoord: string): Promise<Ouder | null> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, naam, wachtwoord }),
    });
    if (!res.ok) return null;
    return res.json();
  },

  async inloggen(email: string, wachtwoord: string): Promise<Ouder | null> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, wachtwoord }),
    });
    if (!res.ok) return null;
    return res.json();
  },

  async uitloggen(): Promise<void> {
    await fetch('/api/auth/logout', { method: 'POST' });
    if (typeof window !== 'undefined') {
      localStorage.removeItem(HUIDIG_KIND_KEY);
    }
  },

  async getHuidigeOuder(): Promise<Ouder | null> {
    const res = await fetch('/api/auth/me');
    if (!res.ok) return null;
    return res.json();
  },

  // ── Kinderen ─────────────────────────────────────────────────────────────

  async voegKindToe(naam: string, leeftijd: number, groep: number, kleur: string): Promise<Kind | null> {
    const res = await fetch('/api/kinderen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ naam, leeftijd, groep, kleur }),
    });
    if (!res.ok) return null;
    return res.json();
  },

  async getKinderenVanOuder(): Promise<Kind[]> {
    const res = await fetch('/api/kinderen');
    if (!res.ok) return [];
    return res.json();
  },

  async getKind(id: string): Promise<Kind | null> {
    const res = await fetch(`/api/kinderen/${id}`);
    if (!res.ok) return null;
    return res.json();
  },

  async wijzigKind(id: string, data: { naam?: string; leeftijd?: number; groep?: number; kleur?: string }): Promise<Kind | null> {
    const res = await fetch(`/api/kinderen/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) return null;
    return res.json();
  },

  async verwijderKind(id: string): Promise<boolean> {
    const res = await fetch(`/api/kinderen/${id}`, { method: 'DELETE' });
    return res.ok;
  },

  setHuidigKind(id: string | null): void {
    if (typeof window === 'undefined') return;
    if (id) {
      localStorage.setItem(HUIDIG_KIND_KEY, id);
    } else {
      localStorage.removeItem(HUIDIG_KIND_KEY);
    }
  },

  getHuidigKindId(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(HUIDIG_KIND_KEY);
  },

  async getHuidigKind(): Promise<Kind | null> {
    const id = this.getHuidigKindId();
    if (!id) return null;
    return this.getKind(id);
  },

  // ── Scores ───────────────────────────────────────────────────────────────

  async slaScoreOp(
    kindId: string,
    vak: Vak,
    niveau: number,
    aantalGoed: number,
    aantalTotaal: number,
    duurSeconden: number
  ): Promise<void> {
    await fetch('/api/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kindId, vak, niveau, aantalGoed, aantalTotaal, duurSeconden }),
    });
  },

  // ── Pure berekeningen (werken op Kind object) ─────────────────────────────

  getXP(kind: Kind): number {
    return kind.scores.reduce((sum, sc) => sum + sc.aantalGoed * 10, 0);
  },

  getBerekenNiveau(kind: Kind, vak: Vak): number {
    const vakScores = kind.scores.filter((sc) => sc.vak === vak).slice(-5);
    if (vakScores.length === 0) return Math.max(1, Math.floor(kind.groep / 2));
    const gemPercent =
      vakScores.reduce((sum, sc) => sum + sc.aantalGoed / sc.aantalTotaal, 0) /
      vakScores.length;
    if (gemPercent >= 0.85) return Math.min(5, (vakScores[vakScores.length - 1].niveau ?? 2) + 1);
    if (gemPercent <= 0.5) return Math.max(1, (vakScores[vakScores.length - 1].niveau ?? 2) - 1);
    return vakScores[vakScores.length - 1].niveau ?? 2;
  },

  getScoresPerVak(kind: Kind): Record<Vak, { gem: number; totaal: number }> {
    const vakken: Vak[] = ['rekenen', 'taal', 'spelling', 'logica'];
    const result = {} as Record<Vak, { gem: number; totaal: number }>;
    for (const vak of vakken) {
      const vakScores = kind.scores.filter((sc) => sc.vak === vak);
      const totaal = vakScores.length;
      const gem =
        totaal > 0
          ? vakScores.reduce((sum, sc) => sum + (sc.aantalGoed / sc.aantalTotaal) * 100, 0) /
            totaal
          : 0;
      result[vak] = { gem: Math.round(gem), totaal };
    }
    return result;
  },
};
