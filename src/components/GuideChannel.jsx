import { useState, useEffect, useRef } from 'react'
import { W, H, FONT } from '../constants'
import PillButton from './PillButton'
import aboutMiiTile from '../assets/about-mii-tile.png'
import forecastTile from '../assets/forecast-tile.png'

const INTRO = "Welcome to the guide. This portfolio is built as a Wii Menu — each tile opens a channel inspired by a real Nintendo Wii app. Below is a breakdown of what's here, how each piece was made, and what's still on the way."

const BUILT = [
  {
    key: 'about',
    name: 'About Mii',
    inspiration: 'Mii Channel',
    tile: aboutMiiTile,
    description: "Henry's Mii walks in from off-screen, waves, and types out a personal intro in a Wii Sports–style thought bubble. Background Miis populate the plaza.",
    tech: ['@react-three/fiber', 'Three.js skeletal animation', 'framer-motion'],
    credit: 'Mii heads generated via mii-unsecure API by ariankordi',
  },
  {
    key: 'forecast',
    name: 'Skills Forecast',
    inspiration: 'Forecast Channel',
    tile: forecastTile,
    description: 'Technical and soft skills mapped to a 5-day weather forecast. Toggle between categories from the top nav. The banner rotates between name and section.',
    tech: ['React', 'framer-motion'],
    credit: 'Weather icons via MarioCube · Background from the Wii Forecast Channel',
  },
]

const COMING = [
  { name: 'News Channel',    inspiration: 'Wii News Channel', teaser: 'Scrolling ticker and an expandable career and education timeline.' },
  { name: 'Project Plaza',   inspiration: 'Wii Plaza',        teaser: 'Project showcase — D3tection, InfoCraftic, and more.' },
  { name: 'Creative Corner', inspiration: 'Original',         teaser: 'Photography, drawing, and music.' },
]

const CREDITS = [
  ['Mii head models',  'mii-unsecure API by ariankordi'],
  ['Mii body rig',     'miiBodyMin.glb (custom rigged model)'],
  ['Weather icons',    'MarioCube · Yahoo Weather icon set'],
  ['Typeface',         'M PLUS Rounded 1c via Google Fonts'],
  ['BGM',              'Wii Plaza & Forecast Channel themes (Nintendo)'],
  ['Built with',       'React, Vite, Three.js / @react-three/fiber, framer-motion'],
]

const NAV_H   = 68
const NAV_BG  = 'linear-gradient(180deg, #dcdce4 0%, #c4c4d0 100%)'
const CONTENT_BG = '#f0eff5'
const NAVY    = '#1a1a3a'
const MID     = '#4a4a6a'
const MUTED   = '#8a8aaa'
const CYAN    = '#5bc8e8'

function SectionLabel({ children }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center',
      background: '#5a5a7a', color: '#fff',
      borderRadius: 20, padding: '6px 20px',
      fontSize: 18, fontWeight: 700, fontFamily: FONT,
      letterSpacing: '0.04em', marginBottom: 20,
    }}>
      {children}
    </div>
  )
}

function ChannelCard({ ch, onOpen }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      style={{
        display: 'flex', gap: 28, alignItems: 'center',
        background: '#fff',
        borderRadius: 16,
        border: `1.5px solid ${hov ? CYAN : 'rgba(0,0,0,0.1)'}`,
        padding: '22px 28px',
        cursor: 'pointer',
        transition: 'border-color 0.15s',
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => onOpen(ch.key)}
    >
      <img
        src={ch.tile}
        alt={ch.name}
        style={{ width: 190, height: 106, borderRadius: 10, objectFit: 'cover', flexShrink: 0, border: '1px solid rgba(0,0,0,0.08)' }}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontFamily: FONT, fontSize: 26, fontWeight: 800, color: NAVY }}>{ch.name}</span>
          <span style={{
            background: '#dde8f8', color: '#3060c8',
            borderRadius: 20, padding: '3px 14px',
            fontSize: 15, fontWeight: 600, fontFamily: FONT,
          }}>
            Inspired by: {ch.inspiration}
          </span>
        </div>
        <p style={{ fontFamily: FONT, fontSize: 18, color: MID, margin: 0, lineHeight: 1.55 }}>{ch.description}</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {ch.tech.map(t => (
            <span key={t} style={{
              background: '#ededf5', color: '#5a5a7a',
              borderRadius: 20, padding: '3px 12px',
              fontSize: 14, fontFamily: FONT,
            }}>{t}</span>
          ))}
        </div>
        <span style={{ fontFamily: FONT, fontSize: 14, color: MUTED, fontStyle: 'italic' }}>{ch.credit}</span>
      </div>
      <span style={{
        fontSize: 28, fontWeight: 700, flexShrink: 0, paddingLeft: 8,
        color: hov ? CYAN : MUTED, transition: 'color 0.15s',
      }}>→</span>
    </div>
  )
}

function ComingSoonCard({ ch }) {
  return (
    <div style={{
      flex: 1,
      background: '#e8e8f4',
      borderRadius: 16,
      border: '1.5px solid rgba(0,0,0,0.08)',
      padding: '20px 24px',
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: FONT, fontSize: 20, fontWeight: 700, color: NAVY }}>{ch.name}</span>
        <span style={{
          background: '#d0d0e4', color: '#5a5a8a',
          borderRadius: 20, padding: '2px 12px',
          fontSize: 13, fontWeight: 600, fontFamily: FONT,
        }}>{ch.inspiration}</span>
      </div>
      <p style={{ fontFamily: FONT, fontSize: 16, color: MID, margin: 0, lineHeight: 1.5 }}>{ch.teaser}</p>
      <span style={{
        display: 'inline-flex', alignItems: 'center',
        background: '#c8c8dc', color: '#5a5a7a',
        borderRadius: 20, padding: '3px 12px',
        fontSize: 13, fontFamily: FONT, fontWeight: 600,
        alignSelf: 'flex-start', marginTop: 4,
      }}>Coming soon</span>
    </div>
  )
}

function TypedIntro({ text }) {
  const [displayed, setDisplayed] = useState('')
  const idx = useRef(0)

  useEffect(() => {
    idx.current = 0
    setDisplayed('')
    const id = setInterval(() => {
      if (idx.current >= text.length) { clearInterval(id); return }
      idx.current++
      setDisplayed(text.slice(0, idx.current))
    }, 22)
    return () => clearInterval(id)
  }, [text])

  const done = displayed.length >= text.length

  return (
    <p style={{
      fontFamily: FONT, fontSize: 22, color: MID,
      lineHeight: 1.7, margin: 0, minHeight: '3.4em',
    }}>
      {displayed}
      {!done && <span style={{ opacity: 0.7 }}>▌</span>}
    </p>
  )
}

export default function GuideChannel({ onClose, onOpen }) {
  return (
    <div style={{
      position: 'absolute', left: 0, top: 0, width: W, height: H,
      zIndex: 50, overflow: 'hidden',
      animation: 'tileAppear 0.25s ease both',
      display: 'flex', flexDirection: 'column',
      fontFamily: FONT,
    }}>

      {/* Top nav */}
      <div style={{
        height: NAV_H, flexShrink: 0,
        background: NAV_BG,
        borderBottom: '1.5px solid #b0b0c4',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontFamily: FONT, fontSize: 28, fontWeight: 800, color: NAVY, letterSpacing: '0.02em' }}>
          Channel Guide
        </span>
      </div>

      {/* Scrollable content */}
      <div style={{
        flex: 1, overflowY: 'auto',
        background: CONTENT_BG,
        padding: '44px 120px 60px',
        display: 'flex', flexDirection: 'column', gap: 40,
      }}>

        {/* Typed intro */}
        <TypedIntro text={INTRO} />

        {/* Built channels */}
        <div>
          <SectionLabel>Built</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {BUILT.map(ch => <ChannelCard key={ch.key} ch={ch} onOpen={onOpen} />)}
          </div>
        </div>

        {/* Coming soon */}
        <div>
          <SectionLabel>Coming Soon</SectionLabel>
          <div style={{ display: 'flex', gap: 16 }}>
            {COMING.map(ch => <ComingSoonCard key={ch.name} ch={ch} />)}
          </div>
        </div>

        {/* Credits */}
        <div>
          <SectionLabel>Credits</SectionLabel>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            border: '1.5px solid rgba(0,0,0,0.08)',
            padding: '20px 28px',
            display: 'flex', flexDirection: 'column', gap: 12,
          }}>
            {CREDITS.map(([label, value]) => (
              <div key={label} style={{ display: 'flex', gap: 16, alignItems: 'baseline' }}>
                <span style={{ fontFamily: FONT, fontSize: 16, fontWeight: 700, color: NAVY, minWidth: 200 }}>{label}</span>
                <span style={{ fontFamily: FONT, fontSize: 16, color: MID }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom nav */}
      <div style={{
        height: NAV_H, flexShrink: 0,
        background: NAV_BG,
        borderTop: '1.5px solid #b0b0c4',
        display: 'flex', alignItems: 'center',
        padding: '0 48px',
      }}>
        <PillButton label="Wii Menu" onClick={onClose} width={300} height={76} fontSize={34} />
      </div>

    </div>
  )
}
