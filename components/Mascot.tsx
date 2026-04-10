'use client';

import { motion } from 'framer-motion';

interface MascotProps {
  kleur?: string;
  modus?: 'blij' | 'denkt' | 'neutraal';
  grootte?: number;
  className?: string;
}

export function Mascot({ kleur = '#F07329', modus = 'blij', grootte = 120, className = '' }: MascotProps) {
  // Slightly darker shade for shading
  const donker = shadeColor(kleur, -15);
  const licht = shadeColor(kleur, 30);

  return (
    <motion.div
      className={className}
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
      style={{ width: grootte, height: grootte, display: 'inline-block' }}
    >
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        width={grootte}
        height={grootte}
      >
        {/* Left ear */}
        <ellipse cx="30" cy="28" rx="16" ry="16" fill={kleur} />
        <ellipse cx="30" cy="28" rx="10" ry="10" fill={licht} opacity="0.5" />

        {/* Right ear */}
        <ellipse cx="90" cy="28" rx="16" ry="16" fill={kleur} />
        <ellipse cx="90" cy="28" rx="10" ry="10" fill={licht} opacity="0.5" />

        {/* Head / body */}
        <rect x="10" y="30" width="100" height="82" rx="40" fill={kleur} />

        {/* Shine highlight */}
        <ellipse cx="42" cy="52" rx="10" ry="6" fill="white" opacity="0.25" transform="rotate(-20 42 52)" />

        {/* Face */}
        {modus === 'blij' && (
          <>
            {/* Left eye — closed curve */}
            <path d="M42 72 Q46 68 50 72" stroke="#1A1A2E" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            {/* Right eye — closed curve */}
            <path d="M70 72 Q74 68 78 72" stroke="#1A1A2E" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            {/* Nose dot */}
            <ellipse cx="60" cy="79" rx="3" ry="2" fill="#1A1A2E" opacity="0.6" />
            {/* Smile */}
            <path d="M50 86 Q60 94 70 86" stroke="#1A1A2E" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </>
        )}

        {modus === 'denkt' && (
          <>
            {/* Left eye — dot */}
            <circle cx="46" cy="70" r="3" fill="#1A1A2E" />
            {/* Right eye — closed curve */}
            <path d="M70 72 Q74 68 78 72" stroke="#1A1A2E" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            {/* Nose */}
            <ellipse cx="60" cy="79" rx="3" ry="2" fill="#1A1A2E" opacity="0.6" />
            {/* Wavy mouth */}
            <path d="M50 87 Q55 83 60 87 Q65 91 70 87" stroke="#1A1A2E" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </>
        )}

        {modus === 'neutraal' && (
          <>
            {/* Left eye — closed curve */}
            <path d="M42 72 Q46 68 50 72" stroke="#1A1A2E" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            {/* Right eye — closed curve */}
            <path d="M70 72 Q74 68 78 72" stroke="#1A1A2E" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            {/* Nose */}
            <ellipse cx="60" cy="79" rx="3" ry="2" fill="#1A1A2E" opacity="0.6" />
            {/* Straight mouth */}
            <path d="M52 88 L68 88" stroke="#1A1A2E" strokeWidth="2.5" strokeLinecap="round" />
          </>
        )}
      </svg>
    </motion.div>
  );
}

function shadeColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + percent));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + percent));
  const b = Math.min(255, Math.max(0, (num & 0xff) + percent));
  return `rgb(${r},${g},${b})`;
}
