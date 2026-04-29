import React, { useState } from 'react'
import { C } from '../constants'

export default function NavArrow({ dir, onClick, visible = true }) {
  const [hov, setHov] = useState(false)
  if (!visible) return null

  const left = dir === 'right' ? 1766 : 114
  const top  = 370
  const gradId = `ag-${dir}`

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={onClick}
      style={{
        position: 'absolute',
        left, top,
        width: 51, height: 98,
        cursor: 'pointer',
        zIndex: 20,
        transform: dir === 'left' ? 'scaleX(-1)' : 'none',
        background: 'none',
        border: 'none',
      }}
    >
      <svg width={51} height={98} viewBox="0 0 51 98" style={{ display: 'block', overflow: 'visible' }}>
        <defs>
          <radialGradient id={gradId} cx="50%" cy="50%" r="60%" fx="50%" fy="50%">
            <stop offset="0%"   stopColor={hov ? 'rgb(230,252,255)' : 'rgb(203,246,255)'} />
            <stop offset="100%" stopColor={hov ? 'rgb(120,220,255)' : 'rgb(98,214,255)'} />
          </radialGradient>
        </defs>
        <path
          d="M 2.158 2.073 L 50.249 48.279 C 50.659 48.672 50.659 49.328 50.249 49.721 L 2.158 95.927 C 1.465 96.592 0.324 95.994 0.478 95.046 L 7.922 49 L 0.478 2.954 C 0.324 2.006 1.465 1.408 2.158 2.073 Z"
          fill={`url(#${gradId})`}
          stroke="rgb(36,71,155)"
          strokeWidth={3}
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}
