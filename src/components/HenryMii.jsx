import React from 'react'

export default function HenryMii({ width = 100, height = 170 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 100 170" style={{ overflow: 'visible' }}>
      {/* Arms behind body */}
      <path d="M 14 102 Q 4 118 7 136 L 18 133 Q 15 118 22 106 Z" fill="#2d2d3a" />
      <path d="M 86 102 Q 96 118 93 136 L 82 133 Q 85 118 78 106 Z" fill="#2d2d3a" />
      <ellipse cx="10" cy="138" rx="8" ry="7" fill="#ffdab3" />
      <ellipse cx="90" cy="138" rx="8" ry="7" fill="#ffdab3" />

      {/* Body */}
      <path d="M 14 102 Q 18 96 42 96 L 50 106 L 58 96 Q 82 96 86 102 L 90 150 L 10 150 Z" fill="#2d2d3a" />
      <path d="M 42 96 L 50 106 L 58 96 L 58 102 L 50 112 L 42 102 Z" fill="white" />
      <path d="M 40 98 L 50 110 L 43 122 L 28 108 Z" fill="#3a3a4a" />
      <path d="M 60 98 L 50 110 L 57 122 L 72 108 Z" fill="#3a3a4a" />

      {/* Legs */}
      <rect x="26" y="148" width="20" height="18" rx="5" fill="#252535" />
      <rect x="54" y="148" width="20" height="18" rx="5" fill="#252535" />
      <ellipse cx="36" cy="168" rx="13" ry="5" fill="#181825" />
      <ellipse cx="64" cy="168" rx="13" ry="5" fill="#181825" />

      {/* Hair base */}
      <ellipse cx="50" cy="44" rx="29" ry="22" fill="#4a2c17" />

      {/* Head */}
      <rect x="24" y="40" width="52" height="52" rx="18" fill="#ffdab3" />

      {/* Ears */}
      <ellipse cx="24" cy="67" rx="6" ry="9" fill="#ffdab3" />
      <ellipse cx="76" cy="67" rx="6" ry="9" fill="#ffdab3" />

      {/* Hair front */}
      <ellipse cx="50" cy="42" rx="27" ry="14" fill="#4a2c17" />
      <rect x="23" y="40" width="10" height="24" rx="5" fill="#4a2c17" />
      <rect x="67" y="40" width="10" height="24" rx="5" fill="#4a2c17" />
      <path d="M 42 44 C 44 32 53 32 54 42" fill="#4a2c17" />
      <path d="M 37 47 C 39 35 46 35 48 44" fill="#4a2c17" />

      {/* Neck */}
      <rect x="42" y="90" width="16" height="10" fill="#ffdab3" />

      {/* Eyebrows */}
      <path d="M 33 62 Q 38 58 43 62" stroke="#3d2008" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M 57 62 Q 62 58 67 62" stroke="#3d2008" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* Eyes */}
      <ellipse cx="38" cy="69" rx="7" ry="6" fill="white" />
      <ellipse cx="62" cy="69" rx="7" ry="6" fill="white" />
      <ellipse cx="38" cy="70" rx="4.5" ry="4.5" fill="#5b9e8f" />
      <ellipse cx="62" cy="70" rx="4.5" ry="4.5" fill="#5b9e8f" />
      <ellipse cx="38.5" cy="70.5" rx="2.2" ry="2.5" fill="#1a1a1a" />
      <ellipse cx="62.5" cy="70.5" rx="2.2" ry="2.5" fill="#1a1a1a" />
      <ellipse cx="40" cy="68.5" rx="1.1" ry="1.3" fill="rgba(255,255,255,0.85)" />
      <ellipse cx="64" cy="68.5" rx="1.1" ry="1.3" fill="rgba(255,255,255,0.85)" />

      {/* Nose */}
      <path d="M 47 77 Q 50 80 53 77" stroke="#d4956b" strokeWidth="1.8" fill="none" strokeLinecap="round" />

      {/* Mouth */}
      <path d="M 41 84 Q 50 92 59 84" stroke="#c06850" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* Blush */}
      <ellipse cx="31" cy="76" rx="6" ry="4" fill="rgba(255,160,130,0.25)" />
      <ellipse cx="69" cy="76" rx="6" ry="4" fill="rgba(255,160,130,0.25)" />
    </svg>
  )
}
