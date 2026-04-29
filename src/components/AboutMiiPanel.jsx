import React, { useEffect, useRef } from 'react'
import { W, H, FONT } from '../constants'
import PillButton from './PillButton'

function MiiBlock() {
  return (
    <div style={{ position: 'relative', width: 80, height: 120 }}>
      {/* Front face */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundColor: '#64a8e0',
        borderRadius: 16,
        boxShadow: 'inset 0 6px 18px rgba(255,255,255,0.45), inset 0 -6px 12px rgba(0,50,100,0.25), 4px 8px 0 #3a78b0',
      }} />
      {/* Right side face */}
      <div style={{
        position: 'absolute', top: 8, left: 80, width: 8, height: 112,
        backgroundColor: '#3a78b0',
        borderRadius: '0 6px 6px 0',
        transform: 'skewY(-2deg)',
      }} />
      {/* Top face */}
      <div style={{
        position: 'absolute', top: 0, left: 4, width: 80, height: 8,
        backgroundColor: '#90c4f0',
        borderRadius: '8px 8px 0 0',
        transform: 'skewX(-2deg)',
      }} />
    </div>
  );
}

const TILE_SIZE    = 55;
const RING_SPACING = 110;
const RINGS        = 20;
const ROTATE_X     = 52;
const SCALE        = 1.6;
const PERSPECTIVE  = 1200;
const COLOR_LIGHT  = '#f0efeb';
const COLOR_DARK   = '#cec8bb';
const CANVAS_SIZE  = RINGS * RING_SPACING * 2 + TILE_SIZE * 2;

function MiiPlazaFloor() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const cx = CANVAS_SIZE / 2;
    const cy = CANVAS_SIZE / 2;
    const half = TILE_SIZE / 2;

    ctx.fillStyle = COLOR_LIGHT;
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    for (let r = 0; r < RINGS; r++) {
      const radius = r * RING_SPACING;
      const count  = r === 0 ? 1 : r * 8;
      for (let i = 0; i < count; i++) {
        const angle   = (i / count) * Math.PI * 2;
        const x       = cx + Math.cos(angle) * radius;
        const y       = cy + Math.sin(angle) * radius;
        const isLight = (r + i) % 2 === 0;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle + Math.PI / 4);
        ctx.fillStyle = isLight ? COLOR_LIGHT : COLOR_DARK;
        ctx.beginPath();
        ctx.roundRect(-half, -half, TILE_SIZE, TILE_SIZE, 6);
        ctx.fill();
        ctx.restore();
      }
    }
  }, []);

  return (
    <div style={{
      position: 'absolute', inset: 0,
      backgroundColor: COLOR_LIGHT,
      perspective: `${PERSPECTIVE}px`,
      perspectiveOrigin: '50% 40%',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      overflow: 'hidden',
    }}>
      <div style={{ transform: `rotateX(${ROTATE_X}deg) scale(${SCALE})`, transformStyle: 'preserve-3d' }}>
        <canvas ref={canvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE} style={{ display: 'block' }} />
      </div>
    </div>
  );
}

export default function AboutMiiPanel({ onClose }) {
  return (
    <div style={{
      position: 'absolute', left: 0, top: 0, width: W, height: H,
      zIndex: 50, overflow: 'hidden',
      animation: 'tileAppear 0.25s ease both',
    }}>
      <MiiPlazaFloor />

      {/* Block placeholder — centered, standing on floor */}
      <div style={{
        position: 'absolute',
        left: 960 - 40,
        top: 680,
        zIndex: 5,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>
        {/* Speech bubble */}
        <div style={{
          position: 'relative',
          marginBottom: 24,
          backgroundColor: '#f4f1ec',
          borderRadius: 999,
          padding: '18px 48px',
          border: '4px solid #26263a',
          boxShadow: '0 6px 20px rgba(0,0,0,0.18)',
          minWidth: 540,
          textAlign: 'center',
          animation: 'floatBob 2.2s ease-in-out infinite',
        }}>
          {/* Tail border layer */}
          <div style={{
            position: 'absolute', bottom: -28, left: '50%',
            transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '16px solid transparent',
            borderRight: '16px solid transparent',
            borderTop: '26px solid #26263a',
          }} />
          {/* Tail fill layer */}
          <div style={{
            position: 'absolute', bottom: -20, left: '50%',
            transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '12px solid transparent',
            borderRight: '12px solid transparent',
            borderTop: '20px solid #f4f1ec',
          }} />
          <span style={{ fontFamily: FONT, fontSize: 36, fontWeight: 700, color: '#26263a', letterSpacing: '0.01em' }}>
            Hi! I'm Henry 👋
          </span>
        </div>

        <div style={{ animation: 'floatBob 2.2s ease-in-out infinite' }}>
          <MiiBlock />
        </div>
        <div style={{
          width: 120, height: 20, marginTop: 4,
          background: 'radial-gradient(ellipse, rgba(0,40,80,0.22) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'floatBob 2.2s ease-in-out infinite reverse',
          transformOrigin: 'center center',
        }} />
      </div>

      <div style={{
        position: 'absolute', bottom: 28, left: 0, width: W,
        display: 'flex', justifyContent: 'center', zIndex: 10,
      }}>
        <PillButton label="Wii Menu" onClick={onClose} />
      </div>
    </div>
  );
}
