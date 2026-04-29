import React from 'react'
import { W, C, FONT } from '../constants'
import ChannelTile from './ChannelTile'
import HenryMii from './HenryMii'

const CHANNELS = Array.from({ length: 12 }, (_, i) => ({ id: i }))

export default function ChannelGrid({ onOpen }) {
  return (
    <div style={{
      position: 'absolute',
      left: 165, top: 83,
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 392px)',
      gridTemplateRows: 'repeat(3, 217px)',
      gap: 11,
    }}>
      {CHANNELS.map((ch, i) => {
        if (i === 0) return (
          <ChannelTile
            key={ch.id}
            delay={i * 30}
            bgColor="rgb(100,168,224)"
            borderColor="rgb(68,130,195)"
            onClick={() => onOpen('about')}
          >
            <div style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'space-between',
              height: '100%', paddingTop: 10, paddingBottom: 14,
            }}>
              <HenryMii width={84} height={143} />
              <span style={{
                fontFamily: FONT, fontSize: 22, fontWeight: 700,
                color: 'rgba(255,255,255,0.95)',
                textShadow: '0 1px 4px rgba(0,50,120,0.4)',
                letterSpacing: '0.01em',
              }}>
                About Mii
              </span>
            </div>
          </ChannelTile>
        )
        return <ChannelTile key={ch.id} delay={i * 30} />
      })}
    </div>
  )
}
