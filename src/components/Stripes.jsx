import React from 'react'
import { C } from '../constants'

export default function Stripes({ style }) {
  return (
    <div style={{
      backgroundImage: `repeating-linear-gradient(
        180deg,
        transparent 0px,
        transparent 4px,
        ${C.stripe} 4px,
        ${C.stripe} 5px
      )`,
      pointerEvents: 'none',
      ...style,
    }} />
  )
}
