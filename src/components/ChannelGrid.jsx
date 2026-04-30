import React from 'react'
import { W, C, FONT } from '../constants'
import ChannelTile from './ChannelTile'
import aboutMiiTile from '../assets/about-mii-tile.png'

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
            <img
              src={aboutMiiTile}
              alt="About Mii channel"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </ChannelTile>
        )
        return <ChannelTile key={ch.id} delay={i * 30} />
      })}
    </div>
  )
}
