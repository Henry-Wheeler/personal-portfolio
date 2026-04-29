import React from 'react'
import { CURSOR_HAND_PATH, CURSOR_POINTER_PATH } from '../constants'

export default function WiiCursor({ x, y, tilt }) {
  return (
    <div style={{
      position: 'absolute',
      left: x - 24,
      top: y - 8,
      width: 80, height: 127,
      pointerEvents: 'none',
      zIndex: 9999,
      transform: `rotate(${tilt}deg)`,
      transformOrigin: '24px 8px',
      transition: 'transform 0.18s ease-out',
      filter: 'drop-shadow(5px 6px 2px rgba(0,0,0,0.3))',
    }}>
      <svg width={80} height={127} viewBox="0 0 228 362">
        <defs>
          <linearGradient id="cursorBodyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="rgb(255,255,255)" />
            <stop offset="56%"  stopColor="rgb(255,255,255)" />
            <stop offset="100%" stopColor="rgb(158,211,255)" />
          </linearGradient>
        </defs>
        <g transform="translate(14,22)">
          <path
            d={CURSOR_HAND_PATH}
            fill="url(#cursorBodyGrad)"
            stroke="rgb(0,0,0)"
            strokeWidth={13}
            strokeLinejoin="round"
            paintOrder="stroke fill"
          />
        </g>
        <g transform="translate(101,189)">
          <path d={CURSOR_POINTER_PATH} fill="rgb(0,140,255)" />
        </g>
      </svg>
    </div>
  )
}
