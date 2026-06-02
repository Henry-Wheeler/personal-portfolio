import { useEffect, useMemo, useState } from 'react'
import { W, FONT } from '../constants'
import arrowRight from '../assets/fleche-droite.svg'
import d3tectionDisc from '../assets/project-disc-d3tection.svg'
import infocrafticDisc from '../assets/project-disc-infocraftic.svg'
import tntautoDisc from '../assets/project-disc-tntauto.svg'
import portfolioDisc from '../assets/project-disc-portfolio.svg'
import {
  playDiscChannelArrowSound,
  playDiscChannelSelectSound,
  playDiscChannelStartSound,
  scheduleDiscChannelOpenSound,
} from '../audio/discChannelSfx'

const SHELL_W = 1848
const SHELL_H = 994
const SHELL_X = (W - SHELL_W) / 2
const SHELL_Y = 30
const FOOTER_H = 234
const CONTENT_TOP = 116
const CONTENT_H = SHELL_H - CONTENT_TOP - FOOTER_H

const PROJECTS = [
  {
    id: 'd3tection',
    label: 'D3tection',
    subtitle: "YOLOv8 real-time Rubik's Cube solver",
    year: '2026',
    role: 'Computer vision + interaction design',
    stack: ['Python', 'YOLOv8', 'OpenCV', 'Three.js'],
    detail: 'A real-time Rubik’s cube assistant that detects cube stickers from camera input, solves the state, and visualizes the next move in a 3D scene.',
    highlights: ['Live cube-state detection', 'Solver-to-3D move rendering', 'Designed for fast visual feedback'],
    disc: d3tectionDisc,
    tint: 'drop-shadow(0 16px 20px rgba(15, 115, 170, 0.18))',
  },
  {
    id: 'infocraftic',
    label: 'InfoCraftic',
    subtitle: 'Adobe hackathon browser extension',
    year: '2025',
    role: 'Frontend + product prototyping',
    stack: ['JavaScript', 'Browser APIs', 'Figma'],
    detail: 'A hackathon-built extension concept for turning scattered browsing and research material into clearer creative context.',
    highlights: ['Browser-extension workflow', 'Rapid prototype under hackathon constraints', 'Research-to-output interaction model'],
    disc: infocrafticDisc,
    tint: 'drop-shadow(0 16px 20px rgba(32, 110, 170, 0.16))',
  },
  {
    id: 'tntauto',
    label: 'TNTAuto / AMNH',
    subtitle: 'Phylogenetic pipeline automation',
    year: '2025',
    role: 'Research software automation',
    stack: ['R', 'Python', 'TNT', 'Data pipelines'],
    detail: 'Research tooling for the American Museum of Natural History that streamlines phylogenetic analysis runs and downstream processing.',
    highlights: ['Automated repetitive analysis steps', 'Organized research outputs', 'Built for scientific workflow reliability'],
    disc: tntautoDisc,
    tint: 'drop-shadow(0 16px 20px rgba(30, 90, 145, 0.16))',
  },
  {
    id: 'portfolio',
    label: 'Personal Portfolio',
    subtitle: 'Wii-inspired interactive portfolio',
    year: '2026',
    role: 'Frontend, 3D, sound, and interaction',
    stack: ['React', 'Vite', 'Three.js', 'Framer Motion'],
    detail: 'This site: a Wii Menu-inspired portfolio with channels for identity, skills, projects, and creative work.',
    highlights: ['1920x1080 canvas scaled to viewport', '3D Mii channel with skeletal animation', 'Wii-inspired sound and channel art system'],
    disc: portfolioDisc,
    tint: 'drop-shadow(0 16px 20px rgba(30, 90, 145, 0.16))',
  },
]

const PROJECT_PAGES = Array.from({ length: Math.ceil(PROJECTS.length / 2) }, (_, page) =>
  PROJECTS.slice(page * 2, page * 2 + 2).map((project, slot) => ({ project, index: page * 2 + slot }))
)

function WiiPillButton({ children, onClick, disabled = false, width = 540 }) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{
        width,
        height: 144,
        border: disabled ? '4px solid rgba(176,176,176,0.55)' : '4px solid #4ec8ec',
        borderRadius: 999,
        background: disabled
          ? 'linear-gradient(180deg, #d7d7d7 0%, #c9c9c9 52%, #bdbdbd 100%)'
          : 'linear-gradient(180deg, #ffffff 0%, #f6f9fd 42%, #dfe8f5 100%)',
        boxShadow: disabled
          ? 'inset 0 14px 0 rgba(255,255,255,0.25), inset 0 -12px 16px rgba(120,120,120,0.12), 0 3px 8px rgba(60,60,60,0.22)'
          : '0 0 0 4px rgba(255,255,255,0.82), 0 0 16px rgba(62,198,236,0.5), inset 0 18px 0 rgba(255,255,255,0.55), inset 0 -14px 20px rgba(128,144,166,0.2), 0 3px 8px rgba(60,60,60,0.24)',
        color: disabled ? '#a8a8a8' : '#414141',
        fontFamily: FONT,
        fontSize: 72,
        fontWeight: 500,
        letterSpacing: 0,
        cursor: disabled ? 'default' : 'pointer',
        textShadow: disabled ? '0 1px 0 rgba(255,255,255,0.42)' : '0 1px 0 #fff',
      }}
    >
      {children}
    </button>
  )
}

function DiscArrow({ dir, onClick }) {
  const left = dir === 'left'
  return (
    <button
      aria-label={left ? 'Previous project' : 'Next project'}
      onClick={onClick}
      style={{
        position: 'absolute',
        [left ? 'left' : 'right']: 34,
        top: 224,
        width: 98,
        height: 138,
        border: 0,
        background: 'transparent',
        cursor: 'pointer',
      }}
    >
      <img
        src={arrowRight}
        alt=""
        draggable={false}
        style={{
          width: 72,
          height: 130,
          transform: left ? 'scaleX(-1)' : 'none',
          filter: 'drop-shadow(0 3px 2px rgba(255,255,255,0.72)) drop-shadow(0 5px 8px rgba(30,80,150,0.24))',
        }}
      />
    </button>
  )
}

function DiscSlot({ project, selected, loading, onClick, large = false }) {
  const discD = large ? 360 : 252
  const slotW = large ? 472 : 340
  const discLeft = large ? 56 : 44
  const discTop = large ? 0 : 96
  const slotLeft = large ? 492 : 1032
  const slotTop = large ? 8 : 8
  const reflectionW = large ? 372 : 264
  const reflectionH = large ? 210 : 142
  const reflectionTop = large ? 374 : 374
  const reflectionLeft = large ? 50 : 38
  const shadowLeft = large ? 52 : 52
  const shadowTop = large ? 344 : 342
  const shadowW = large ? 368 : 240
  const shadowH = large ? 22 : 15

  return (
    <button
      onClick={onClick}
      aria-pressed={selected}
      style={{
        position: 'absolute',
        left: slotLeft,
        top: slotTop,
        width: slotW,
        height: 542,
        border: 0,
        background: 'transparent',
        cursor: 'pointer',
        fontFamily: FONT,
      }}
    >
      <div style={{
        position: 'absolute',
        left: discLeft,
        top: discTop,
        width: discD,
        height: discD,
        borderRadius: '50%',
        transform: selected ? 'translateY(-5px) scale(1.025)' : 'translateY(0) scale(1)',
        transformOrigin: '50% 50%',
        transition: 'transform 160ms ease, filter 160ms ease',
        filter: selected ? 'drop-shadow(0 0 18px rgba(89,205,236,0.9))' : 'none',
      }}>
        <img
          src={project.disc}
          alt=""
          draggable={false}
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
            animation: loading ? 'discSpin 650ms linear infinite' : 'discIdleTurn 14s linear infinite',
            filter: project.tint,
          }}
        />
      </div>

      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: shadowLeft,
          top: shadowTop,
          width: shadowW,
          height: shadowH,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, rgba(80,80,80,0.24) 0%, rgba(120,120,120,0.18) 36%, rgba(190,190,190,0.08) 62%, transparent 74%)',
          filter: 'blur(4px)',
          transform: large ? 'scaleX(1.08)' : 'scaleX(0.96)',
          pointerEvents: 'none',
        }}
      />

      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: reflectionLeft,
          top: reflectionTop,
          width: reflectionW,
          height: reflectionH,
          opacity: large ? 0.34 : 0.26,
          overflow: 'hidden',
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.48) 0%, rgba(0,0,0,0.24) 36%, rgba(0,0,0,0.08) 68%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.48) 0%, rgba(0,0,0,0.24) 36%, rgba(0,0,0,0.08) 68%, transparent 100%)',
          pointerEvents: 'none',
        }}
      >
        <img
          src={project.disc}
          alt=""
          draggable={false}
          style={{
            position: 'absolute',
            left: (reflectionW - discD) / 2,
            top: -discD + reflectionH * 0.86,
            width: discD,
            height: discD,
            transform: large ? 'scaleY(-1) scaleX(1.03)' : 'scaleY(-1) scaleX(1.02)',
            filter: project.tint,
          }}
        />
      </div>
    </button>
  )
}

function DiscChannelFrame({ children, footer }) {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      zIndex: 50,
      background: '#050505',
      fontFamily: FONT,
      userSelect: 'none',
    }}>
      <div style={{
        position: 'absolute',
        left: SHELL_X,
        top: SHELL_Y,
        width: SHELL_W,
        height: SHELL_H,
        overflow: 'hidden',
          borderRadius: '108px',
          background: 'linear-gradient(180deg, #38bdec 0%, #20a8df 112px, #ffffff 112px, #f6f6f8 76%, #ececf0 100%)',
          boxShadow: '0 18px 70px rgba(0,0,0,0.8)',
      }}>
        <svg
          width={SHELL_W}
          height={180}
          viewBox={`0 0 ${SHELL_W} 180`}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            zIndex: 2,
            pointerEvents: 'none',
          }}
        >
          <path
            d={`M0 86 Q0 58 34 52 Q76 46 150 46 H1144 C1224 46 1276 58 1328 94 C1364 119 1394 124 1450 124 H${SHELL_W} V180 H0 Z`}
            fill="#fff"
          />
          <path
            d={`M0 86 Q0 58 34 52 Q76 46 150 46 H1144 C1224 46 1276 58 1328 94 C1364 119 1394 124 1450 124 H${SHELL_W}`}
            fill="none"
            stroke="rgba(88,88,88,0.34)"
            strokeWidth="4"
          />
        </svg>

        <div style={{
          position: 'absolute',
          left: 0,
          top: 0,
          right: 0,
          height: 116,
          overflow: 'hidden',
          background: 'linear-gradient(180deg, #39c3ef 0%, #25afe5 100%)',
          zIndex: 1,
        }} />

        <div style={{
          position: 'absolute',
          left: 0,
          top: CONTENT_TOP,
          right: 0,
          height: CONTENT_H,
          background: 'linear-gradient(180deg, #ffffff 0%, #f7f7f8 46%, #eeeeef 72%, #f7f7f8 100%)',
          zIndex: 0,
        }}>
          <div style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: 224,
            background: 'linear-gradient(180deg, transparent 0%, rgba(226,226,228,0.72) 82%)',
            pointerEvents: 'none',
          }} />
        </div>

        <div style={{
          position: 'absolute',
          left: 0,
          top: 0,
          right: 0,
          height: 116,
          zIndex: 3,
          pointerEvents: 'none',
        }}>
          <div style={{
            position: 'absolute',
            right: 170,
            top: 42,
            color: '#fff',
            fontSize: 52,
            fontWeight: 500,
            letterSpacing: 0,
            textShadow: '0 2px 8px rgba(0,75,145,0.34)',
          }}>
            Disc Channel
          </div>
        </div>

        <div style={{
          position: 'absolute',
          left: 0,
          top: CONTENT_TOP,
          right: 0,
          height: CONTENT_H,
          zIndex: 4,
        }}>
          {children}
        </div>

        <div style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: FOOTER_H,
          background: 'repeating-linear-gradient(180deg, #e0e1dc 0px, #e0e1dc 2px, #c7cac4 2px, #c7cac4 6px)',
          borderTop: '4px solid rgba(73,73,73,0.62)',
          boxShadow: 'inset 0 3px 0 rgba(255,255,255,0.72)',
          zIndex: 5,
        }}>
          <div style={{
            position: 'absolute',
            inset: '0 258px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            {footer}
          </div>
        </div>

        <img
          src="/assets/disc-panel.png"
          alt=""
          aria-hidden="true"
          draggable={false}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            opacity: 0.16,
            mixBlendMode: 'multiply',
            zIndex: 20,
          }}
        />
      </div>
    </div>
  )
}

export default function ProjectPlaza({ onClose }) {
  const [selectedIndex, setSelectedIndex] = useState(null)
  const [pageIndex, setPageIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [detail, setDetail] = useState(false)
  const activeProject = selectedIndex === null ? null : PROJECTS[selectedIndex]
  const statusText = loading ? 'Reading disc...' : activeProject ? activeProject.subtitle : 'Please insert a disc.'

  const visibleProjects = useMemo(() => PROJECT_PAGES[pageIndex], [pageIndex])

  useEffect(() => {
    return scheduleDiscChannelOpenSound()
  }, [])

  function moveSelection(delta) {
    if (loading) return
    playDiscChannelArrowSound()
    setPageIndex((idx) => (idx + delta + PROJECT_PAGES.length) % PROJECT_PAGES.length)
    setSelectedIndex(null)
  }

  function handleStart() {
    if (loading || selectedIndex === null) return
    playDiscChannelStartSound()
    setLoading(true)
    window.setTimeout(() => {
      setLoading(false)
      setDetail(true)
    }, 850)
  }

  if (detail) {
    return (
      <DiscChannelFrame
        footer={(
          <>
            <WiiPillButton onClick={() => setDetail(false)}>Back</WiiPillButton>
            <WiiPillButton onClick={onClose}>Wii Menu</WiiPillButton>
          </>
        )}
      >
        <div style={{
          position: 'absolute',
          left: 108,
          top: 38,
          width: 372,
          height: 372,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <img
            src={activeProject.disc}
            alt=""
            draggable={false}
            style={{
              width: 268,
              height: 268,
              animation: 'discSpin 5s linear infinite',
              filter: activeProject.tint,
            }}
          />
        </div>

        <div style={{
          position: 'absolute',
          left: 494,
          top: 58,
          width: 1010,
          color: '#343846',
        }}>
          <div style={{
            fontSize: 58,
            fontWeight: 800,
            letterSpacing: 0,
            lineHeight: 1.05,
            color: '#252a37',
            textShadow: '0 2px 0 #fff',
          }}>
            {activeProject.label}
          </div>
          <div style={{
            marginTop: 18,
            width: 900,
            fontSize: 32,
            lineHeight: 1.28,
            color: '#5f6878',
            fontStyle: 'italic',
          }}>
            {activeProject.subtitle}
          </div>
          <div style={{
            marginTop: 22,
            display: 'flex',
            gap: 14,
            flexWrap: 'wrap',
          }}>
            {[activeProject.year, activeProject.role, ...activeProject.stack].map(item => (
              <span key={item} style={{
                padding: '7px 16px',
                borderRadius: 999,
                background: 'linear-gradient(180deg, rgba(255,255,255,0.95), rgba(228,235,244,0.9))',
                border: '1.5px solid rgba(160,170,185,0.6)',
                color: '#4a5260',
                fontSize: 18,
                fontWeight: 700,
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9)',
              }}>
                {item}
              </span>
            ))}
          </div>
          <div style={{
            marginTop: 44,
            width: 930,
            minHeight: 244,
            borderRadius: 26,
            padding: '28px 38px',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.92), rgba(234,239,246,0.86))',
            border: '2px solid rgba(189,198,211,0.75)',
            boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.95)',
            color: '#414957',
            fontSize: 26,
            lineHeight: 1.38,
          }}>
            <div>{activeProject.detail}</div>
            <div style={{
              marginTop: 24,
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 14,
            }}>
              {activeProject.highlights.map(highlight => (
                <div key={highlight} style={{
                  minHeight: 76,
                  borderRadius: 18,
                  padding: '14px 16px',
                  background: 'rgba(255,255,255,0.66)',
                  border: '1px solid rgba(175,184,198,0.6)',
                  color: '#56606e',
                  fontSize: 18,
                  lineHeight: 1.25,
                  fontWeight: 700,
                }}>
                  {highlight}
                </div>
              ))}
            </div>
          </div>
        </div>
      </DiscChannelFrame>
    )
  }

  return (
    <DiscChannelFrame
      footer={(
        <>
          <WiiPillButton onClick={onClose}>Wii Menu</WiiPillButton>
          <WiiPillButton onClick={handleStart} disabled={loading || selectedIndex === null}>Start</WiiPillButton>
        </>
      )}
    >
      <DiscArrow dir="left" onClick={() => moveSelection(-1)} />
      <DiscArrow dir="right" onClick={() => moveSelection(1)} />

      <div style={{ position: 'absolute', inset: 0 }}>
        {visibleProjects.map(({ project, index }, slot) => (
          <DiscSlot
            key={`${project.id}-${slot}`}
            project={project}
            selected={index === selectedIndex}
            loading={loading && index === selectedIndex}
            large={slot === 0}
            onClick={() => {
              if (loading) return
              playDiscChannelSelectSound()
              setSelectedIndex(index)
            }}
          />
        ))}
      </div>

      <div style={{
        position: 'absolute',
        left: 280,
        right: 280,
        bottom: 90,
        height: 92,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#5e6472',
        fontSize: activeProject ? 42 : 78,
        lineHeight: 1.15,
        fontStyle: 'normal',
        textAlign: 'center',
        letterSpacing: 0,
        textShadow: '0 1px 0 #fff',
        zIndex: 8,
      }}>
        {statusText}
      </div>
    </DiscChannelFrame>
  )
}
