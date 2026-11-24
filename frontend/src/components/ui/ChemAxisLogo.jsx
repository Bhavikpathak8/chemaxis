import React from 'react';

/**
 * ChemAxis — Official Corporate Brand Logo Component
 * Modern molecular axis & hexagonal chemical lattice icon with typography.
 *
 * @param {'light'|'dark'|'auto'} theme - Color theme (light for white backdrops, dark for dark shells)
 * @param {'full'|'compact'|'icon'} variant - full (icon+title+tagline), compact (icon+title), icon (symbol only)
 * @param {number} size - Base pixel height (default: 36)
 * @param {string} className - Additional CSS classes
 */
export function ChemAxisIcon({ size = 36, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
    >
      <defs>
        <linearGradient id="ca-grad-left" x1="8" y1="13" x2="20" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#0b7a55" />
        </linearGradient>
        <linearGradient id="ca-grad-right" x1="20" y1="6" x2="32" y2="27" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="ca-grad-bottom" x1="8" y1="27" x2="32" y2="27" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#064e3b" />
          <stop offset="100%" stopColor="#0b7a55" />
        </linearGradient>
        <filter id="ca-glow" x="2" y="2" width="36" height="36" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Hexagonal Outer Lattice Shadow */}
      <polygon
        points="20,5 34,13 34,29 20,37 6,29 6,13"
        fill="#0b7a55"
        fillOpacity="0.12"
      />

      {/* Top Left Facet Plane */}
      <polygon
        points="20,6 20,21 7,28.5 7,13.5"
        fill="url(#ca-grad-left)"
        stroke="#ffffff"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />

      {/* Top Right Facet Plane */}
      <polygon
        points="20,6 33,13.5 33,28.5 20,21"
        fill="url(#ca-grad-right)"
        stroke="#ffffff"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />

      {/* Bottom Facet Plane */}
      <polygon
        points="7,28.5 20,21 33,28.5 20,36"
        fill="url(#ca-grad-bottom)"
        stroke="#ffffff"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />

      {/* Central Axis Core Point */}
      <circle cx="20" cy="21" r="3.2" fill="#ffffff" filter="url(#ca-glow)" />
      <circle cx="20" cy="21" r="2" fill="#0b7a55" />

      {/* Satellite Coordinate Vertices */}
      <circle cx="20" cy="6" r="1.8" fill="#34d399" />
      <circle cx="33" cy="13.5" r="1.8" fill="#10b981" />
      <circle cx="33" cy="28.5" r="1.8" fill="#059669" />
      <circle cx="20" cy="36" r="1.8" fill="#10b981" />
      <circle cx="7" cy="28.5" r="1.8" fill="#34d399" />
      <circle cx="7" cy="13.5" r="1.8" fill="#10b981" />
    </svg>
  );
}

export default function ChemAxisLogo({
  theme = 'light',
  variant = 'full',
  size = 36,
  className = '',
}) {
  const isDark = theme === 'dark';

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <ChemAxisIcon size={size} />

      {variant !== 'icon' && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center text-xl font-extrabold tracking-tight">
            <span className={isDark ? 'text-white' : 'text-[#0f172a]'}>Chem</span>
            <span className="text-[#0b7a55]">Axis</span>
          </div>

          {variant === 'full' && (
            <span
              className={`text-[9.5px] uppercase tracking-wider font-semibold mt-0.5 ${
                isDark ? 'text-slate-400' : 'text-[#64748b]'
              }`}
            >
              Chemical Trade Desk
            </span>
          )}
        </div>
      )}
    </div>
  );
}
