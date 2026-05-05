import React, { useState } from 'react'
import { C, FONT } from '../constants'

export default function PillButton({ label, onClick, width = 546, height = 148, fontSize = 59 }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={onClick}
      style={{
        width, height,
        borderRadius: 170,
        backgroundColor: 'rgb(227,232,239)',
        border: `4px solid ${C.cyan}`,
        boxShadow: hov
          ? `inset 0px -10px 19px 16px rgb(177,188,202), inset 10px 9px 60px 0px #fff, 0 0 55px 0px ${C.cyan}`
          : 'inset 0px -10px 19px 16px rgb(177,188,202), inset 10px 9px 60px 0px #fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
        transition: 'box-shadow 0.15s ease',
      }}
    >
      <span style={{ fontFamily: FONT, fontSize, fontWeight: 500, color: C.textDark }}>
        {label}
      </span>
    </div>
  )
}
