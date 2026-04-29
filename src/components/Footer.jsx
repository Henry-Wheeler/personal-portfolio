import React from 'react'
import { W, H, C, FONT } from '../constants'
import CircButton from './CircButton'

export default function Footer({ dateStr }) {
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, pointerEvents: 'none', zIndex: 10 }}>

      <div style={{
        position: 'absolute',
        left: 0, top: 780,
        width: W, height: H - 780,
        backgroundColor: C.footerFill,
      }} />

      <div style={{ position: 'absolute', left: -9.5, top: 773, width: 1939.5, height: 319, pointerEvents: 'none' }}>
        <svg width="1939.5" height="319" viewBox="0 0 1939.5 319" style={{ display: 'block' }}>
          <defs>
            <linearGradient id="footerInnerShadow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(0,0,0,0.09)" />
              <stop offset="40%" stopColor="rgba(0,0,0,0)" />
            </linearGradient>
          </defs>
          <path
            d="M 0 0 L 305.147 0
               C 352.636 0 410.936 0 480.96 59.511
               C 528.955 100.3 573.918 125.992 661.319 125.992
               L 968.992 125.992 L 970.508 125.992
               L 1278.181 125.992
               C 1365.582 125.992 1410.545 100.3 1458.54 59.511
               C 1528.564 0 1586.864 0 1634.353 0
               L 1939.5 0 L 1939.5 319
               L 970.508 319 L 968.992 319
               L 0 319 L 0 0 Z"
            fill={C.footerFill}
            stroke="rgb(54,191,237)"
            strokeWidth={5}
          />
          <path
            d="M 0 0 L 305.147 0
               C 352.636 0 410.936 0 480.96 59.511
               C 528.955 100.3 573.918 125.992 661.319 125.992
               L 968.992 125.992 L 970.508 125.992
               L 1278.181 125.992
               C 1365.582 125.992 1410.545 100.3 1458.54 59.511
               C 1528.564 0 1586.864 0 1634.353 0
               L 1939.5 0 L 1939.5 160
               L 0 160 Z"
            fill="url(#footerInnerShadow)"
            style={{ pointerEvents: 'none' }}
          />
        </svg>
      </div>

      <div style={{
        position: 'absolute', left: 0, top: 773,
        width: W, height: 4,
        backgroundColor: 'rgb(32,32,32)',
        opacity: 0.18,
      }} />

      <div style={{
        position: 'absolute',
        left: 0, top: 930,
        width: W,
        textAlign: 'center',
        fontFamily: FONT,
        fontSize: 66,
        fontWeight: 400,
        color: C.dateGray,
        lineHeight: 1,
        letterSpacing: '0.01em',
      }}>
        {dateStr}
      </div>

      {/* Left side panel (Wii button) */}
      <div style={{
        position: 'absolute',
        left: -40, top: 811,
        width: 330, height: 200,
        borderRadius: '0 100px 100px 0',
        backgroundColor: C.btnSilver,
        border: `8px solid ${C.btnBorder}`,
        boxShadow: 'inset -10px -26px 20px 0px rgba(255,255,255,0.7), inset 0 0 0 0 rgb(217,217,217)',
        pointerEvents: 'auto',
        cursor: 'pointer',
      }}>
        <div style={{ position: 'absolute', left: 130, top: 1 }}>
          <CircButton>
            <svg xmlns="http://www.w3.org/2000/svg" width="83" height="40" viewBox="0 0 82.747 40"
              style={{ position: 'absolute', left: 40, top: 61, opacity: 0.55 }}>
              <path d="M 45.209 2.192 L 38.223 29.873 C 38.223 29.873 32.881 9.095 32.012 6.147 C 31.142 3.195 29.354 1.902 26.817 1.902 C 24.28 1.902 22.488 3.195 21.619 6.147 C 20.753 9.095 15.41 29.873 15.41 29.873 L 8.419 2.192 L 0 2.192 C 0 2.192 8.086 31.726 9.185 35.148 C 10.039 37.817 12.065 40 15.067 40 C 18.5 40 20.105 37.471 20.848 35.148 C 21.583 32.838 26.817 13.331 26.817 13.331 C 26.817 13.331 32.051 32.838 32.784 35.148 C 33.527 37.471 35.133 40 38.564 40 C 41.569 40 43.59 37.818 44.451 35.148 C 45.547 31.727 53.627 2.192 53.627 2.192 Z M 74.074 39.715 L 82.044 39.715 L 82.044 13.663 L 74.074 13.663 Z M 73.302 4.554 C 73.302 7.065 75.398 9.103 77.972 9.103 C 80.65 9.103 82.747 7.107 82.747 4.554 C 82.747 2.001 80.65 0 77.972 0 C 75.398 0 73.302 2.041 73.302 4.554 Z M 57.88 39.715 L 65.847 39.715 L 65.847 13.663 L 57.88 13.663 Z M 57.105 4.554 C 57.105 7.065 59.197 9.103 61.772 9.103 C 64.449 9.103 66.55 7.107 66.55 4.554 C 66.55 2.001 64.449 0 61.772 0 C 59.197 0 57.105 2.041 57.105 4.554 Z" fill="rgb(140,140,144)"/>
            </svg>
          </CircButton>
        </div>
      </div>

      {/* Right side panel (Envelope button) */}
      <div style={{
        position: 'absolute',
        left: 1630, top: 811,
        width: 330, height: 200,
        borderRadius: '100px 0 0 100px',
        backgroundColor: C.btnSilver,
        border: `8px solid ${C.btnBorder}`,
        boxShadow: 'inset 10px -26px 20px 0px rgba(255,255,255,0.7)',
        pointerEvents: 'auto',
        cursor: 'pointer',
      }}>
        <div style={{ position: 'absolute', left: 38, top: 1 }}>
          <CircButton>
            <svg
              width={96} height={64} viewBox="0 0 96 64"
              style={{ position: 'absolute', left: 33, top: 49, zIndex: 5 }}
            >
              <path
                d="M 0 4 L 0 12 L 46.681 34.854 C 47.513 35.262 48.487 35.262 49.319 34.854 L 96 12 L 96 4 C 96 1.791 94.209 0 92 0 L 4 0 C 1.791 0 0 1.791 0 4 Z"
                fill="rgb(162,162,162)"
              />
              <path
                d="M 46.658 43.829 L 0 20.5 L 0 60 C 0 62.209 1.791 64 4 64 L 92 64 C 94.209 64 96 62.209 96 60 L 96 20.5 L 49.342 43.829 C 48.497 44.251 47.503 44.251 46.658 43.829 Z"
                fill="rgb(162,162,162)"
              />
            </svg>
          </CircButton>
        </div>
      </div>

    </div>
  )
}
