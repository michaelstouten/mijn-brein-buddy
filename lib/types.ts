export type Vak = 'rekenen' | 'taal' | 'spelling' | 'logica';

export interface Ouder {
  id: string;
  email: string;
  naam: string;
  wachtwoord?: string;
  kinderenIds: string[];
  aangemeldOp: string;
}

export interface Kind {
  id: string;
  naam: string;
  leeftijd: number;
  groep: number; // schoolgroep 1-8
  ouderId: string;
  kleur: string; // avatar kleur
  streak: number;
  lastActief: string | null;
  scores: OefeningScore[];
}

export interface OefeningScore {
  id: string;
  datum: string;
  vak: Vak;
  niveau: number; // 1-5
  aantalGoed: number;
  aantalTotaal: number;
  duurSeconden: number;
}

export interface Oefening {
  id: string;
  vraag: string;
  type: 'meerkeuze' | 'tekst';
  opties?: string[];
  antwoord: string;
  uitleg: string;
}

export interface AppStore {
  ouders: Ouder[];
  kinderen: Kind[];
  huidigOuderId: string | null;
  huidigKindId: string | null;
}

export const VAK_INFO: Record<Vak, { label: string; kleur: string; bg: string; emoji: string; omschrijving: string }> = {
  rekenen: {
    label: 'Rekenen',
    kleur: '#3B82F6',
    bg: '#EFF6FF',
    emoji: '🔢',
    omschrijving: 'Getallen, sommen & patronen',
  },
  taal: {
    label: 'Taal',
    kleur: '#06B6D4',
    bg: '#ECFEFF',
    emoji: '📚',
    omschrijving: 'Woorden, zinnen & verhalen',
  },
  spelling: {
    label: 'Spelling',
    kleur: '#F59E0B',
    bg: '#FFFBEB',
    emoji: '✏️',
    omschrijving: 'Woorden goed schrijven',
  },
  logica: {
    label: 'Logica',
    kleur: '#A855F7',
    bg: '#F5F3FF',
    emoji: '🧩',
    omschrijving: 'Puzzels, patronen & denken',
  },
};
