import React, { useState, useEffect, useRef, useCallback } from 'react'
import { W, H, C, FONT } from './constants'
import { playChannelSelectSound } from './audio/miiChannelSfx'
import Stripes from './components/Stripes'
import ChannelGrid from './components/ChannelGrid'
import NavArrow from './components/NavArrow'
import Footer from './components/Footer'
import MiiChannel from './components/MiiChannel'
import WiiCursor from './components/WiiCursor'

export default function App() {
  const [scale, setScale]   = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [cursor, setCursor] = useState({ x: 960, y: 400 })
  const [tilt, setTilt]     = useState(0)
  const [hasScrolled, setHasScrolled] = useState(false)
  const [openChannel, setOpenChannel] = useState(null)
  const openChannelWithSound = useCallback((key) => {
    playChannelSelectSound()
    setOpenChannel(key)
  }, [])
  const prevX = useRef(960)
  const tiltTarget = useRef(0)
  const animFrame = useRef(null)

  const now  = new Date()
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  const dateStr = `${days[now.getDay()]} ${String(now.getDate()).padStart(2,'0')}/${String(now.getMonth()+1).padStart(2,'0')}`

  useEffect(() => {
    const update = () => {
      const s  = Math.min(window.innerWidth / W, window.innerHeight / H)
      const ox = (window.innerWidth  - W * s) / 2
      const oy = (window.innerHeight - H * s) / 2
      setScale(s)
      setOffset({ x: ox, y: oy })
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  useEffect(() => {
    const onMove = (e) => {
      const x = (e.clientX - offset.x) / scale
      const y = (e.clientY - offset.y) / scale
      setCursor({ x, y })
      const dx = x - prevX.current
      tiltTarget.current = Math.max(-18, Math.min(18, dx * 0.6))
      prevX.current = x
    }

    const animate = () => {
      setTilt(prev => {
        const diff = tiltTarget.current - prev
        return Math.abs(diff) < 0.1 ? tiltTarget.current : prev + diff * 0.12
      })
      animFrame.current = requestAnimationFrame(animate)
    }
    animFrame.current = requestAnimationFrame(animate)

    window.addEventListener('mousemove', onMove)
    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(animFrame.current)
    }
  }, [scale, offset])

  return (
    <div style={{
      width: '100vw', height: '100vh',
      overflow: 'hidden',
      background: '#0d0d0d',
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute',
        left: offset.x,
        top: offset.y,
        width: W,
        height: H,
        transform: `scale(${scale})`,
        transformOrigin: '0 0',
        backgroundColor: C.bg,
        overflow: 'hidden',
        fontFamily: FONT,
      }}>
        <Stripes style={{
          position: 'absolute',
          left: 0, top: -8,
          width: W, height: 185,
        }} />
        <div style={{
          position: 'absolute',
          left: 0, top: -8,
          width: W, height: 185,
          background: `linear-gradient(180deg, rgba(242,242,242,0.1) 0%, ${C.bg} 100%)`,
          pointerEvents: 'none',
        }} />

        <ChannelGrid onOpen={openChannelWithSound} />

        <NavArrow dir="right" visible={true}  onClick={() => setHasScrolled(true)} />
        <NavArrow dir="left"  visible={hasScrolled} onClick={() => {}} />

        <Footer dateStr={dateStr} />

        {openChannel === 'about' && <MiiChannel onClose={() => setOpenChannel(null)} />}

        <WiiCursor x={cursor.x} y={cursor.y} tilt={tilt} />
      </div>
    </div>
  )
}
