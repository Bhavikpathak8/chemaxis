import { useState } from 'react';

/**
 * Animated SVG Molecule visualizer with rotating orbital valence rings and glowing bonds.
 * Styled in C-Tech's signature Green & White brand aesthetic.
 */
export default function MoleculeVisualizer({
  chemical = 'Phenol',
  formula = 'C₆H₅OH',
  cas = '108-95-2',
}) {
  const [activeAtom, setActiveAtom] = useState(null);

  // Carbon ring nodes for Benzene/Phenol nucleus
  const ringNodes = [
    { id: 'C1', x: 150, y: 70, label: 'C', type: 'carbon', detail: 'Carbon 1 (Attached to Hydroxyl group)' },
    { id: 'C2', x: 210, y: 105, label: 'C', type: 'carbon', detail: 'Carbon 2 (Aromatic ring ortho position)' },
    { id: 'C3', x: 210, y: 175, label: 'C', type: 'carbon', detail: 'Carbon 3 (Aromatic ring meta position)' },
    { id: 'C4', x: 150, y: 210, label: 'C', type: 'carbon', detail: 'Carbon 4 (Aromatic ring para position)' },
    { id: 'C5', x: 90, y: 175, label: 'C', type: 'carbon', detail: 'Carbon 5 (Aromatic ring meta position)' },
    { id: 'C6', x: 90, y: 105, label: 'C', type: 'carbon', detail: 'Carbon 6 (Aromatic ring ortho position)' },
    { id: 'O1', x: 150, y: 18, label: 'O', type: 'oxygen', detail: 'Oxygen (Polar electronegative hydroxyl)' },
    { id: 'H1', x: 198, y: 8, label: 'H', type: 'hydrogen', detail: 'Hydrogen (Active hydrogen bond donor)' },
  ];

  return (
    <div className="relative flex flex-col items-center justify-center p-6 select-none">
      {/* Ambient soft emerald glow */}
      <div className="absolute inset-0 -z-10 rounded-full bg-gradient-to-tr from-emerald-500/15 via-teal-500/10 to-amber-500/10 blur-2xl anim-pulse-glow" />

      {/* Rotating orbital rings */}
      <div className="pointer-events-none absolute h-[290px] w-[290px] rounded-full border border-dashed border-[#0b7a55]/25 anim-orbit" />
      <div className="pointer-events-none absolute h-[235px] w-[235px] rounded-full border border-[#0b7a55]/15 anim-orbit-reverse" />
      <div className="pointer-events-none absolute h-[320px] w-[320px] rounded-full border border-[#d68f12]/20 anim-orbit" />

      {/* SVG Molecule Diagram */}
      <svg
        viewBox="0 0 300 240"
        className="relative z-10 h-64 w-72 drop-shadow-[0_4px_16px_rgba(11,122,85,0.2)]"
      >
        <defs>
          <linearGradient id="bondGradLight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0B7A55" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.6" />
          </linearGradient>
          <radialGradient id="carbonGlowLight" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="60%" stopColor="#0B7A55" />
            <stop offset="100%" stopColor="#064E3B" />
          </radialGradient>
          <radialGradient id="oxygenGlowLight" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="70%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#92400E" />
          </radialGradient>
        </defs>

        {/* Inner conjugated resonant circle */}
        <circle
          cx="150"
          cy="140"
          r="45"
          fill="none"
          stroke="#0B7A55"
          strokeWidth="1.75"
          strokeDasharray="4 3"
          opacity="0.45"
        />

        {/* C1-C2-C3-C4-C5-C6 hexagonal bonds */}
        <line x1="150" y1="70" x2="210" y2="105" stroke="url(#bondGradLight)" strokeWidth="3" />
        <line x1="210" y1="105" x2="210" y2="175" stroke="url(#bondGradLight)" strokeWidth="3" />
        <line x1="210" y1="175" x2="150" y2="210" stroke="url(#bondGradLight)" strokeWidth="3" />
        <line x1="150" y1="210" x2="90" y2="175" stroke="url(#bondGradLight)" strokeWidth="3" />
        <line x1="90" y1="175" x2="90" y2="105" stroke="url(#bondGradLight)" strokeWidth="3" />
        <line x1="90" y1="105" x2="150" y2="70" stroke="url(#bondGradLight)" strokeWidth="3" />

        {/* Hydroxyl bonds: C1-O1 and O1-H1 */}
        <line x1="150" y1="70" x2="150" y2="22" stroke="#D97706" strokeWidth="2.5" />
        <line x1="150" y1="22" x2="195" y2="10" stroke="#2563EB" strokeWidth="2" strokeDasharray="3 2" />

        {/* Atom Nodes */}
        {ringNodes.map((atom) => {
          const isHovered = activeAtom?.id === atom.id;
          const isOxygen = atom.type === 'oxygen';
          const isHydrogen = atom.type === 'hydrogen';

          return (
            <g
              key={atom.id}
              className="cursor-pointer transition-transform duration-200"
              onMouseEnter={() => setActiveAtom(atom)}
              onMouseLeave={() => setActiveAtom(null)}
            >
              {/* Outer pulse when active */}
              {isHovered && (
                <circle
                  cx={atom.x}
                  cy={atom.y}
                  r="18"
                  fill="none"
                  stroke={isOxygen ? '#D97706' : '#0B7A55'}
                  strokeWidth="2"
                  className="animate-ping"
                />
              )}
              {/* Main circle */}
              <circle
                cx={atom.x}
                cy={atom.y}
                r={isHydrogen ? 9 : 13}
                fill={isOxygen ? 'url(#oxygenGlowLight)' : isHydrogen ? '#2563EB' : 'url(#carbonGlowLight)'}
                stroke="#FFFFFF"
                strokeWidth="2"
                filter="drop-shadow(0 2px 4px rgba(0,0,0,0.15))"
              />
              <text
                x={atom.x}
                y={atom.y + 4}
                textAnchor="middle"
                fontSize={isHydrogen ? '10' : '12'}
                fontWeight="bold"
                fill="#FFFFFF"
                className="pointer-events-none font-mono"
              >
                {atom.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Floating chemical spec pill on white card */}
      <div className="mt-3 flex items-center gap-2.5 rounded-full border border-[#d0ded7] bg-white px-4 py-1.5 shadow-md">
        <span className="font-semibold text-[#1b2433]">{chemical}</span>
        <span className="rounded bg-[#e4f2ec] px-2 py-0.5 font-mono text-[11.5px] font-semibold text-[#0b7a55]">
          {formula}
        </span>
        <span className="font-mono text-[11.5px] text-[#4a5666]">CAS: {cas}</span>
      </div>

      {/* Live tooltip */}
      <div className="h-6 mt-1.5 text-center text-[12.5px] text-[#0b7a55] font-mono font-medium">
        {activeAtom ? activeAtom.detail : 'Hover atoms to examine chemical bonds'}
      </div>
    </div>
  );
}
