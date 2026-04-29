import React from 'react'
import { C } from '../constants'

export default function CircButton({ children }) {
  return (
    <div style={{ position: 'relative', width: 162, height: 162 }}>
      <div style={{
        position: 'absolute', inset: 0,
        borderRadius: '50%',
        backgroundColor: C.btnSilver,
        border: `4px solid ${C.cyan}`,
        boxShadow: `18px 18px 2px -3px ${C.btnShadow}, inset -6px -6px 14px 0px rgba(0,0,0,0.26)`,
      }} />
      <svg width={131} height={128} viewBox="0 0 131 128"
        style={{ position: 'absolute', left: 8, top: 7, pointerEvents: 'none' }}>
        <path
          d="M 103.15 52.253 C 118.738 37.646 120.095 11.919 100.046 4.543
             C 92.058 1.604 83.428 0 74.425 0
             C 33.321 0 0 33.435 0 74.679
             C 0 81.851 1.008 88.788 2.889 95.353
             C 8.8 115.984 34.686 116.41 50.346 101.735 L 103.15 52.253 Z"
          fill={C.btnHighlight}
        />
      </svg>
      {children}
    </div>
  )
}
