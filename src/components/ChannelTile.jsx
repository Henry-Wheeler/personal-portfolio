import React, { useState, useId } from 'react'
import { C, FONT, TILE_PATH } from '../constants'

export default function ChannelTile({ bgColor, borderColor, label, labelColor, children, onClick, delay = 0 }) {
  const [hov, setHov] = useState(false)
  const uid = useId()
  const clipId = `clip-${uid}`
  const gradId = `shine-${uid}`

  return (
    <div
      style={{
        position: 'relative',
        width: 392, height: 217,
        cursor: 'pointer',
        userSelect: 'none',
        animation: 'tileAppear 0.35s ease both',
        animationDelay: `${delay}ms`,
        filter: hov ? `drop-shadow(0 0 10px ${C.cyanGlow})` : 'drop-shadow(0 3px 6px rgba(0,0,0,0.12))',
        transition: 'filter 0.12s ease',
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={onClick}
    >
      <svg
        width={380} height={205}
        viewBox="0 0 380 205"
        style={{
          position: 'absolute', left: 6, top: 6,
          transform: hov ? 'scale(1.022)' : 'scale(1)',
          transformOrigin: '190px 102px',
          transition: 'transform 0.12s ease',
          overflow: 'visible',
        }}
      >
        <defs>
          <clipPath id={clipId}>
            <path d={TILE_PATH} />
          </clipPath>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="rgba(255,255,255,0.44)" />
            <stop offset="46%"  stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>

        <path d={TILE_PATH} fill={bgColor || C.tileFill} />
        <path d={TILE_PATH} fill={`url(#${gradId})`} clipPath={`url(#${clipId})`} />
        <path d={TILE_PATH} fill="rgba(0,0,0,0.045)" clipPath={`url(#${clipId})`}
          style={{ transform: 'scaleY(-1)', transformOrigin: '190px 102px' }} />
        <path d={TILE_PATH} fill="none"
          stroke={hov ? C.cyan : (borderColor || C.tileBorder)}
          strokeWidth={5}
        />
      </svg>

      <div style={{
        position: 'absolute', left: 6, top: 6, width: 380, height: 205,
        clipPath: `path('${TILE_PATH}')`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {children}
      </div>

      {label && (
        <div style={{
          position: 'absolute', bottom: -28, left: 0, right: 0,
          textAlign: 'center', fontFamily: FONT, fontSize: 20, fontWeight: 500,
          color: labelColor || C.dateGray,
          opacity: hov ? 1 : 0, transition: 'opacity 0.15s ease', pointerEvents: 'none',
        }}>{label}</div>
      )}
    </div>
  )
}
