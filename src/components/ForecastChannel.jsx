import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FONT } from '../constants'

// ─── Icon file map ────────────────────────────────────────────────────────────
const ICON_FILES = {
  'partly-cloudy': '/assets/wii-icon-partly-cloudy.png',
  'sunny':         '/assets/wii-icon-sunny.png',
  'cloudy':        '/assets/wii-icon-cloudy.png',
  'storm':         '/assets/wii-icon-storm.png',
  'moon':          '/assets/wii-icon-31.png',
  'rain':          '/assets/wii-icon-12.png',
  'snow':          '/assets/wii-icon-16.png',
  'sleet':         '/assets/wii-icon-8.png',
  'fog':           '/assets/wii-icon-34.png',
  'snowflakes':    '/assets/wii-icon-13.png',
}

function WeatherIcon({ type }) {
  const src = ICON_FILES[type] ?? ICON_FILES.sunny
  return (
    <img
      src={src}
      alt={type}
      style={{ width: '100%', height: 'auto', objectFit: 'contain', display: 'block' }}
    />
  )
}

// shared tab style for nav bars
const NAV_TAB = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(180deg, #F8F8F8 0%, #E2E2E2 50%, #D0D0D0 100%)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(0,0,0,0.12), inset 1px 0 0 rgba(255,255,255,0.6)',
}

// ─── Wii-style top navigation bar ────────────────────────────────────────────
function TopNav({ view, onToggleView }) {
  const tabLabel = view === 'hard' ? 'Soft Skills' : 'Technical'
  return (
    <div style={{
      position: 'absolute',
      top: 0, left: 0, right: 0,
      height: 72,
      background: 'linear-gradient(180deg, #E8E8E8 0%, #CACACA 100%)',
      borderBottom: '2px solid #A8A8A8',
      display: 'flex',
      alignItems: 'stretch',
      fontFamily: FONT,
    }}>
      {/* Empty left section */}
      <div style={{ flex: 1, borderRight: '1px solid #B8B8B8', ...NAV_TAB }} />

      {/* View toggle tab */}
      <div
        onClick={onToggleView}
        style={{
          width: 380,
          gap: 12,
          borderRight: '1px solid #B8B8B8',
          color: '#2A2A2A',
          fontSize: 26,
          fontWeight: 700,
          cursor: 'pointer',
          userSelect: 'none',
          ...NAV_TAB,
        }}
      >
        <span style={{ fontSize: 18 }}>▲</span>
        <span>{tabLabel}</span>
      </div>

      {/* Settings tab — no label */}
      <div style={{ width: 300, borderLeft: '1px solid #D8D8D8', ...NAV_TAB }} />
    </div>
  )
}

// ─── Green header banner with rotating pill text ──────────────────────────────
function GreenBanner({ view }) {
  const [showName, setShowName] = useState(true)

  // Toggle between "Henry Wheeler" and the section label every 3 s
  useEffect(() => {
    const id = setInterval(() => setShowName(p => !p), 3000)
    return () => clearInterval(id)
  }, [])

  const sectionLabel = view === 'hard' ? 'Technical Skills' : 'Soft Skills'
  const pillText = showName ? 'Henry Wheeler' : sectionLabel

  return (
    <div style={{
      position: 'absolute',
      top: 72,
      left: 0, right: 0,
      height: 108,
      background: 'linear-gradient(180deg, #62C462 0%, #3E963E 18%, #2E7A2E 60%, #1E5A1E 100%)',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35), 0 4px 10px rgba(0,0,0,0.35)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 32px',
      gap: 32,
      borderBottom: '3px solid #174A17',
    }}>
      {/* Skills Forecast label */}
      <div style={{
        color: 'white',
        fontFamily: FONT,
        fontWeight: 800,
        fontSize: 38,
        lineHeight: 1.1,
        textShadow: '0 2px 6px rgba(0,0,0,0.45)',
        whiteSpace: 'nowrap',
      }}>
        SKILLS<br />FORECAST
      </div>

      {/* Rotating name/section pill */}
      <div style={{
        flex: 1,
        background: 'linear-gradient(180deg, #72D472 0%, #52B852 45%, #3A9A3A 100%)',
        borderRadius: 50,
        height: 62,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.45), inset 0 -2px 4px rgba(0,0,0,0.2), 0 3px 10px rgba(0,0,0,0.3)',
      }}>
        <AnimatePresence mode="wait">
          <motion.span
            key={pillText}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{
              color: 'white',
              fontFamily: FONT,
              fontSize: 36,
              fontWeight: 700,
              fontStyle: 'italic',
              textShadow: '0 1px 4px rgba(0,0,0,0.3)',
            }}
          >
            {pillText}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  )
}

// ─── Single skill forecast card ───────────────────────────────────────────────
function DayCard({ day, icon, label, isWeekend, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{
        flex: 1,
        background: 'linear-gradient(180deg, #3060D8 0%, #1E48B8 30%, #142E98 70%, #0E2070 100%)',
        borderRadius: 8,
        border: '1px solid #5070D8',
        boxShadow: 'inset 0 1px 0 rgba(120,150,255,0.4), 0 4px 12px rgba(0,0,0,0.4)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Skill name header */}
      <div style={{
        width: '100%',
        padding: '14px 8px 10px',
        background: 'linear-gradient(180deg, #2A3EA8 0%, #1A2E90 40%, #102070 100%)',
        borderBottom: '2px solid #3A50C0',
        boxShadow: 'inset 0 1px 0 rgba(150,180,255,0.3)',
        textAlign: 'center',
        color: isWeekend ? '#FAC80C' : 'white',
        fontFamily: FONT,
        fontSize: 34,
        fontWeight: 800,
        letterSpacing: 0.5,
        textShadow: '0 2px 6px rgba(0,0,0,0.5)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}>
        {day}
      </div>

      {/* Weather icon */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px 8px 8px',
        width: '100%',
      }}>
        <WeatherIcon type={icon} />
      </div>

      {/* Descriptor label */}
      <div style={{
        width: '100%',
        padding: '14px 12px 20px',
        textAlign: 'center',
        color: 'rgba(255,255,255,0.85)',
        fontFamily: FONT,
        fontSize: 24,
        fontWeight: 600,
        fontStyle: 'italic',
        textShadow: '0 1px 4px rgba(0,0,0,0.4)',
        letterSpacing: 0.3,
      }}>
        {label}
      </div>
    </motion.div>
  )
}

// ─── Bottom attribution strip ─────────────────────────────────────────────────
function BottomStrip() {
  const now   = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day   = String(now.getDate()).padStart(2, '0')
  const hrs   = now.getHours()
  const mins  = String(now.getMinutes()).padStart(2, '0')
  const ampm  = hrs >= 12 ? 'p.m.' : 'a.m.'
  const h12   = hrs % 12 || 12

  return (
    <div style={{
      position: 'absolute',
      bottom: 72,
      left: 0, right: 0,
      height: 48,
      background: 'linear-gradient(to right, #2184E2, #AE1937)',
      display: 'flex',
      alignItems: 'center',
    }}>
      <div style={{
        flex: 1,
        paddingLeft: 32,
        color: 'rgba(255,255,255,0.8)',
        fontFamily: FONT,
        fontSize: 20,
        fontStyle: 'italic',
      }}>
        supported by wheelernews
      </div>
      <div style={{
        paddingRight: 32,
        color: 'white',
        fontFamily: FONT,
        fontSize: 22,
        fontWeight: 600,
        whiteSpace: 'nowrap',
      }}>
        As of {h12}:{mins} {ampm}, {month}/{day}
      </div>
    </div>
  )
}

// ─── Wii-style bottom navigation bar ─────────────────────────────────────────
function BottomNav({ onClose }) {
  return (
    <div style={{
      position: 'absolute',
      bottom: 0, left: 0, right: 0,
      height: 72,
      background: 'linear-gradient(180deg, #D8D8D8 0%, #EBEBEB 100%)',
      borderTop: '2px solid #B4B4B4',
      display: 'flex',
      alignItems: 'stretch',
      fontFamily: FONT,
    }}>
      <div
        onClick={onClose}
        style={{
          width: 340,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRight: '1px solid #C0C0C0',
          color: '#2A2A2A',
          fontSize: 28,
          fontWeight: 700,
          cursor: 'pointer',
          ...NAV_TAB,
        }}
      >
        Wii Menu
      </div>
      <div style={{ flex: 1, borderRight: '1px solid #B8B8B8', ...NAV_TAB }} />
      <div style={{ width: 280, borderLeft: '1px solid #D8D8D8', ...NAV_TAB }} />
    </div>
  )
}

// ─── Skill data ───────────────────────────────────────────────────────────────
const HARD_DAYS = [
  { day: 'C++',      icon: 'sunny',         label: 'Primary Language',       isWeekend: false },
  { day: 'Python',   icon: 'sunny',         label: 'ML Research & Pipelines', isWeekend: false },
  { day: 'Three.js', icon: 'partly-cloudy', label: 'Used in D3tection',      isWeekend: false },
  { day: 'JS',       icon: 'partly-cloudy', label: 'Used in InfoCraftic',    isWeekend: false },
  { day: 'R',        icon: 'cloudy',        label: 'Used at AMNH',           isWeekend: false },
]

const SOFT_DAYS = [
  { day: 'Excel',    icon: 'sunny',         label: 'Daily Use',         isWeekend: false },
  { day: 'G-Suite',  icon: 'sunny',         label: 'Daily Use',         isWeekend: false },
  { day: 'Figma',    icon: 'partly-cloudy', label: 'UI Design',         isWeekend: false },
  { day: 'Communication', icon: 'sunny', label: 'Cross-team & Client', isWeekend: false },
  { day: 'Leadership',   icon: 'sunny', label: 'Exec Board Role',      isWeekend: false },
]

// ─── Main component ───────────────────────────────────────────────────────────
export default function ForecastChannel({ onClose }) {
  const bgmRef = useRef(null)
  const [view, setView] = useState('hard')

  useEffect(() => {
    const audio = new Audio('/audio/forecast-bgm.mp3')
    audio.loop   = true
    audio.volume = 0.45
    bgmRef.current = audio
    audio.play().catch(() => {})
    return () => { audio.pause(); audio.src = '' }
  }, [])

  const days = view === 'hard' ? HARD_DAYS : SOFT_DAYS

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      zIndex: 50,
      fontFamily: FONT,
      overflow: 'hidden',
      background: `url('/assets/forecast-bg.png') center / cover no-repeat, #1192d3`,
    }}>
      <TopNav view={view} onToggleView={() => setView(v => v === 'hard' ? 'soft' : 'hard')} />
      <GreenBanner view={view} />

      {/* Card row — AnimatePresence fades between views */}
      <div style={{
        position: 'absolute',
        top: 180,
        bottom: 120,
        left: 40,
        right: 40,
      }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ display: 'flex', gap: 12, width: '100%', height: '100%' }}
          >
            {days.map((d, i) => (
              <DayCard
                key={d.day}
                day={d.day}
                icon={d.icon}
                label={d.label}
                isWeekend={d.isWeekend}
                delay={0.05 + i * 0.06}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      <BottomStrip />
      <BottomNav onClose={onClose} />
    </div>
  )
}
