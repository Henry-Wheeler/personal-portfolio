import React, { useCallback, useEffect, useRef, useState, useMemo, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js'
import { W, H, FONT } from '../constants'
import PillButton from './PillButton'
import {
  createMiiPlazaBgm,
  playFootstepLeft,
  playFootstepRight,
  playThoughtBubbleAppearSound,
} from '../audio/miiChannelSfx'

// ─── Floor ────────────────────────────────────────────────────────────────────

function MiiPlazaFloor() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    const CW = canvas.width
    const CH = canvas.height
    const cx = CW / 2
    const cy = CH / 2

    const img = new Image()
    img.src = '/assets/floor-quarter.png'
    img.onload = () => {
      const scale = 1.25
      const q = Math.max(CW, CH) / 2 * scale

      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, CW, CH)

      ctx.save()
      ctx.beginPath()
      ctx.rect(0, 0, CW, cy)
      ctx.clip()
      ctx.save()
      ctx.translate(cx, cy); ctx.scale(-1, -1)
      ctx.drawImage(img, 0, 0, q, q)
      ctx.restore()
      ctx.save()
      ctx.translate(cx, cy); ctx.scale(1, -1)
      ctx.drawImage(img, 0, 0, q, q)
      ctx.restore()
      ctx.restore()

      ctx.save()
      ctx.beginPath()
      ctx.rect(0, cy, CW, CH - cy)
      ctx.clip()
      ctx.drawImage(img, cx, cy, q, q)
      ctx.save()
      ctx.translate(cx, cy); ctx.scale(-1, 1)
      ctx.drawImage(img, 0, 0, q, q)
      ctx.restore()
      ctx.restore()

      const bloom = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(CW, CH) * 0.07)
      bloom.addColorStop(0, 'rgba(255,255,255,0.95)')
      bloom.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = bloom
      ctx.fillRect(0, 0, CW, CH)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      style={{ position: 'absolute', inset: 0, display: 'block', zIndex: 1 }}
    />
  )
}

// ─── Typewriter (light Nintendo / RPG dialogue rhythm) ────────────────────────

const TYPEWRITER_MS_PER_CHAR = 54
/** Extra delay after these (ms), on top of TYPEWRITER_MS_PER_CHAR */
const TYPEWRITER_PAUSE_COMMA_MS = 130
const TYPEWRITER_PAUSE_SENTENCE_MS = 320

function typewriterDelayAfterChar(ch) {
  if ('.!?'.includes(ch)) return TYPEWRITER_MS_PER_CHAR + TYPEWRITER_PAUSE_SENTENCE_MS
  if (',;:'.includes(ch)) return TYPEWRITER_MS_PER_CHAR + TYPEWRITER_PAUSE_COMMA_MS
  return TYPEWRITER_MS_PER_CHAR
}

function useTypewriter(text, active, onComplete) {
  const [displayed, setDisplayed] = useState('')
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    if (!active || !text) {
      setDisplayed('')
      return
    }
    setDisplayed('')
    let i = 0
    let cancelled = false
    let timeoutId
    let firedComplete = false

    const tick = () => {
      if (cancelled) return
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) {
        if (!firedComplete) {
          firedComplete = true
          onCompleteRef.current?.()
        }
        return
      }
      const prev = text[i - 1]
      timeoutId = setTimeout(tick, typewriterDelayAfterChar(prev))
    }

    timeoutId = setTimeout(tick, TYPEWRITER_MS_PER_CHAR)
    return () => {
      cancelled = true
      clearTimeout(timeoutId)
    }
  }, [active, text])
  return displayed
}

// ─── Speech bubble ────────────────────────────────────────────────────────────

/** One line per beat — fixed bubble; no rambling, Wii-scan-friendly. */
const ABOUT_SENTENCES = [
  "Hi! I'm Henry.",
  "I'm studying two majors — CS + Math @ Santa Clara University.",
  "Graduating June 2027.",
  "Last summer I did research at the AMNH — evolution and phylogenetics.",
  "I'm currently building out the physical build for my computer vision project — and the rest of this site.",
  "I'm interested in skiing, hockey, aviation history, classical music, and photography.",
  "Nice to meet you!",
]

const BETWEEN_SENTENCES_MS = 560
/** Readable inside compact cloud — tune down if copy grows */
const BUBBLE_FONT_SIZE = 23

/** Same horizontal shift as `<Canvas style={{ transform: translateX(...) }}>` — tail anchor ties to scene framing. */
const MII_CANVAS_TRANSLATE_X = 340

/** Wii Sports–style thought graphic (SVG viewBox space). Tail exits bottom-left; dots shrink toward the player’s head. */
const THOUGHT_VIEWBOX_W = 640
const THOUGHT_VIEWBOX_H = 378
/** Rendered CSS width — height scales from viewBox aspect ratio */
const THOUGHT_DISPLAY_W = 556
const THOUGHT_DISPLAY_H = THOUGHT_DISPLAY_W * (THOUGHT_VIEWBOX_H / THOUGHT_VIEWBOX_W)
/** Center of smallest tail orb (maps to forehead via positioning math below) */
const THOUGHT_TAIL_TIP_U = 236
const THOUGHT_TAIL_TIP_V = 352

const THOUGHT_BORDER = '#26263a'
const THOUGHT_FILL = '#ffffff'

/**
 * Fallback head anchor (channel px) before first `head` bone projection arrives — only used briefly.
 * Live position comes from projecting `bodyNodes.head` + THOUGHT_HEAD_LOCAL_OFFSET each frame.
 */
const THOUGHT_HEAD_FALLBACK_X = W * 0.5 + MII_CANVAS_TRANSLATE_X - 168
const THOUGHT_HEAD_FALLBACK_Y = 452

/** Forehead vs `head` bone origin (head local space). Imprecise alone — pair with screen nudge below. */
const THOUGHT_HEAD_LOCAL_OFFSET = new THREE.Vector3(-0.09, 0.2, 0.03)

/** After `project()`: **left = negative X**, **up = negative Y** (1920×1080 channel pixels). */
const THOUGHT_HEAD_SCREEN_NUDGE_X = -56
/** More negative = higher on screen; less negative = lower (use if cloud clips the top). */
const THOUGHT_HEAD_SCREEN_NUDGE_Y = -40

/** Inner HTML inset vs SVG — generous padding keeps glyphs inside lobes (see overflow:hidden). */
const THOUGHT_TEXT_INSET = { leftPct: 11.5, topPct: 13, widthPct: 76.5, heightPct: 50 }

const _headProjScratch = new THREE.Vector3()

function SpeechBubble({ visible, headScreenRef }) {
  const [sentenceIndex, setSentenceIndex] = useState(0)
  const [typing, setTyping] = useState(false)
  const betweenTimerRef = useRef(null)
  const sentenceIndexRef = useRef(0)

  const currentSentence = ABOUT_SENTENCES[sentenceIndex] ?? ''

  useEffect(() => {
    sentenceIndexRef.current = sentenceIndex
  }, [sentenceIndex])

  useEffect(() => {
    if (!visible) {
      setSentenceIndex(0)
      setTyping(false)
      if (betweenTimerRef.current) clearTimeout(betweenTimerRef.current)
    }
    return () => {
      if (betweenTimerRef.current) clearTimeout(betweenTimerRef.current)
    }
  }, [visible])

  const onSentenceTyped = useCallback(() => {
    const i = sentenceIndexRef.current
    if (i >= ABOUT_SENTENCES.length - 1) return
    if (betweenTimerRef.current) clearTimeout(betweenTimerRef.current)
    betweenTimerRef.current = setTimeout(() => {
      setSentenceIndex(i + 1)
    }, BETWEEN_SENTENCES_MS)
  }, [])

  const displayed = useTypewriter(currentSentence, typing && visible, onSentenceTyped)

  const cursorOn = typing && displayed.length < currentSentence.length

  const [headPx, setHeadPx] = useState(null)
  useEffect(() => {
    if (!visible || !headScreenRef) {
      setHeadPx(null)
      return
    }
    const id = setInterval(() => {
      const p = headScreenRef.current
      if (!p || typeof p.x !== 'number') return
      setHeadPx(prev => {
        if (prev && Math.abs(prev.x - p.x) < 0.75 && Math.abs(prev.y - p.y) < 0.75) return prev
        return { x: p.x, y: p.y }
      })
    }, 32)
    return () => clearInterval(id)
  }, [visible, headScreenRef])

  /** Uniform scale viewBox → CSS px (width/height ratio fixed → one scale factor). */
  const vbScale = THOUGHT_DISPLAY_W / THOUGHT_VIEWBOX_W
  const headTargetX = headPx?.x ?? THOUGHT_HEAD_FALLBACK_X
  const headTargetY = headPx?.y ?? THOUGHT_HEAD_FALLBACK_Y
  const bubbleLeft = headTargetX - THOUGHT_TAIL_TIP_U * vbScale
  const bubbleTop = headTargetY - THOUGHT_TAIL_TIP_V * vbScale
  const tailTipPct = `${100 * THOUGHT_TAIL_TIP_U / THOUGHT_VIEWBOX_W}% ${100 * THOUGHT_TAIL_TIP_V / THOUGHT_VIEWBOX_H}%`

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          lang="en"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          onAnimationComplete={() => setTyping(true)}
          style={{
            position: 'absolute',
            left: bubbleLeft,
            top: bubbleTop,
            zIndex: 6,
            width: THOUGHT_DISPLAY_W,
            height: THOUGHT_DISPLAY_H,
            filter: 'drop-shadow(0 5px 14px rgba(0,0,0,0.12))',
            transformOrigin: tailTipPct,
          }}
        >
          <svg
            aria-hidden
            width={THOUGHT_DISPLAY_W}
            height={THOUGHT_DISPLAY_H}
            viewBox={`0 0 ${THOUGHT_VIEWBOX_W} ${THOUGHT_VIEWBOX_H}`}
            style={{ position: 'absolute', left: 0, top: 0, display: 'block' }}
          >
            {/* Multi-lobe cloud (Wii Sports–style outline), gaps between cloud and beads */}
            <path
              fill={THOUGHT_FILL}
              stroke={THOUGHT_BORDER}
              strokeWidth={3.5}
              strokeLinejoin="round"
              strokeLinecap="round"
              d={
                'M 148 246 C 104 238 76 206 74 164 C 72 118 106 74 156 56 ' +
                'C 218 38 294 42 362 52 C 438 62 508 82 548 126 ' +
                'C 578 162 574 212 538 246 C 504 274 446 274 392 262 ' +
                'C 332 274 266 266 216 248 C 188 238 164 238 148 246 Z'
              }
            />
            {/* Tail: largest near bottom-left of cloud — gaps, diagonal toward player */}
            <circle cx={164} cy={286} r={14} fill={THOUGHT_FILL} stroke={THOUGHT_BORDER} strokeWidth={3.5} />
            <circle cx={198} cy={318} r={9} fill={THOUGHT_FILL} stroke={THOUGHT_BORDER} strokeWidth={3.5} />
            <circle cx={THOUGHT_TAIL_TIP_U} cy={THOUGHT_TAIL_TIP_V} r={6} fill={THOUGHT_FILL} stroke={THOUGHT_BORDER} strokeWidth={3} />
          </svg>

          <div
            style={{
              position: 'absolute',
              left: `${THOUGHT_TEXT_INSET.leftPct}%`,
              top: `${THOUGHT_TEXT_INSET.topPct}%`,
              width: `${THOUGHT_TEXT_INSET.widthPct}%`,
              height: `${THOUGHT_TEXT_INSET.heightPct}%`,
              zIndex: 1,
              boxSizing: 'border-box',
              padding: '6px 10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              pointerEvents: 'none',
              overflow: 'hidden',
            }}
          >
            <span style={{
              fontFamily: FONT,
              fontSize: BUBBLE_FONT_SIZE,
              fontWeight: 700,
              color: THOUGHT_BORDER,
              letterSpacing: '0.01em',
              lineHeight: 1.32,
              display: 'block',
              width: '100%',
              maxHeight: '100%',
              overflow: 'hidden',
              wordBreak: 'break-word',
              hyphens: 'auto',
            }}>
              {displayed}
              <span style={{ opacity: cursorOn ? 1 : 0 }}>|</span>
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Outfit colors (shirt / pants) ────────────────────────────────────────────
// Geometry splits always jag along triangle edges. Use **one mesh + MeshStandardMaterial**
// with `onBeforeCompile`: bind-pose `position.y` varying + fragment `smoothstep` blends
// shirt/pants per-pixel (anti-aliased waist). Tune OUTFIT_WAIST_SOFTNESS / HEIGHT_FRAC.
const OUTFIT_PIPELINE_VERSION = 2

const OUTFIT_SHIRT_HEX = '#141414'
const OUTFIT_PANTS_HEX = '#238551'
/** 0 = feet, 1 = top — waist cutoff in bind-pose Y (mesh local space) */
const OUTFIT_WAIST_HEIGHT_FRAC = 0.445
/** Half-width of smooth transition in mesh Y units (~2× this is full blend span). Larger = softer, less “saw tooth”. */
const OUTFIT_WAIST_SOFTNESS = 0.028

/** Cache-bust GLTF once after outfit pipeline changes (avoids stale modified geometry in Loader cache). */
const MII_BODY_GLB_URL = '/assets/miiBodyMin.glb?v=outfitShader'

function disposeOutfitMaterials(mat) {
  if (!mat) return
  const list = Array.isArray(mat) ? mat : [mat]
  list.forEach((m) => m?.dispose?.())
}

function applyOutfitWaistShader(skinnedMesh, options = {}) {
  const shirtHex = options.shirtHex ?? OUTFIT_SHIRT_HEX
  const pantsHex = options.pantsHex ?? OUTFIT_PANTS_HEX
  const waistFrac = options.waistHeightFrac ?? OUTFIT_WAIST_HEIGHT_FRAC
  const waistSoftness = options.waistSoftness ?? OUTFIT_WAIST_SOFTNESS
  const pipelineKey = `${OUTFIT_PIPELINE_VERSION}:${shirtHex}:${pantsHex}:${waistFrac}:${waistSoftness}`
  if (skinnedMesh.userData.outfitPipelineKey === pipelineKey) return

  const geo = skinnedMesh.geometry
  const pos = geo.getAttribute('position')
  if (!pos) return

  let minY = Infinity
  let maxY = -Infinity
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i)
    if (y < minY) minY = y
    if (y > maxY) maxY = y
  }
  const waistY = minY + Math.max(1e-6, maxY - minY) * waistFrac

  disposeOutfitMaterials(skinnedMesh.material)

  const shirtCol = new THREE.Color(shirtHex)
  const pantsCol = new THREE.Color(pantsHex)
  const shirtRgb = new THREE.Vector3(shirtCol.r, shirtCol.g, shirtCol.b)
  const pantsRgb = new THREE.Vector3(pantsCol.r, pantsCol.g, pantsCol.b)

  const mat = new THREE.MeshStandardMaterial({
    color:     0xffffff,
    roughness: 0.8,
    metalness: 0.05,
  })

  mat.customProgramCacheKey = () => `outfitWaist:${pipelineKey}`

  mat.userData.uOutfitWaist = { value: waistY }
  mat.userData.uOutfitBand = { value: waistSoftness }
  mat.userData.uOutfitShirt = { value: shirtRgb }
  mat.userData.uOutfitPants = { value: pantsRgb }

  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uOutfitWaist = mat.userData.uOutfitWaist
    shader.uniforms.uOutfitBand = mat.userData.uOutfitBand
    shader.uniforms.uOutfitShirt = mat.userData.uOutfitShirt
    shader.uniforms.uOutfitPants = mat.userData.uOutfitPants

    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        '#include <common>\nvarying float vOutfitBindY;\n',
      )
      .replace(
        '#include <begin_vertex>',
        '#include <begin_vertex>\nvOutfitBindY = position.y;\n',
      )

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
uniform float uOutfitWaist;
uniform float uOutfitBand;
uniform vec3 uOutfitShirt;
uniform vec3 uOutfitPants;
varying float vOutfitBindY;
`,
      )
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
{
  float outfitMix = smoothstep(uOutfitWaist - uOutfitBand, uOutfitWaist + uOutfitBand, vOutfitBindY);
  diffuseColor.rgb = mix(uOutfitPants, uOutfitShirt, outfitMix);
}
`,
      )
  }

  skinnedMesh.material = mat
  skinnedMesh.userData.outfitPipelineKey = pipelineKey
}

// ─── Geometry mirror ──────────────────────────────────────────────────────────
// miiBodyMin.glb was exported without applying the Blender Mirror modifier,
// so the mesh only covers X: 0→0.556 (one side). This function mirrors the
// geometry across X=0 and remaps bone indices (.L↔.R) so animation works.
function mirrorGeometryX(skinnedMesh) {
  const SEAM_EPS = 0.001          // vertices closer than this to X=0 are on the seam
  const skeleton = skinnedMesh.skeleton
  const geo      = skinnedMesh.geometry
  const bones    = skeleton.bones

  // Build L ↔ R bone index map. This GLB uses camelCase bone names
  // (thighL/thighR), but keep .L/.R support in case the export changes.
  const mirrorBone = new Int16Array(bones.length).fill(-1)
  const oppositeBoneName = (name) => {
    if (name.endsWith('.L')) return name.slice(0, -2) + '.R'
    if (name.endsWith('.R')) return name.slice(0, -2) + '.L'
    if (/[A-Za-z]L$/.test(name)) return name.slice(0, -1) + 'R'
    if (/[A-Za-z]R$/.test(name)) return name.slice(0, -1) + 'L'
    return null
  }
  bones.forEach((bone, i) => {
    const opposite = oppositeBoneName(bone.name)
    if (opposite) {
      const j = bones.findIndex(b => b.name === opposite)
      if (j !== -1) { mirrorBone[i] = j; mirrorBone[j] = i }
    }
  })

  const pos = geo.getAttribute('position')
  const uv  = geo.getAttribute('uv')
  const si  = geo.getAttribute('skinIndex')
  const sw  = geo.getAttribute('skinWeight')
  const idx = geo.getIndex()
  const n   = pos.count
  const is  = si.itemSize

  // Seam vertices (|X| < SEAM_EPS) are shared between both halves — don't duplicate them.
  // Non-seam vertices get a new mirrored copy.
  let mirroredCount = 0
  const toMirrorIdx = new Int32Array(n).fill(-1)
  const isSeam      = new Uint8Array(n)
  for (let i = 0; i < n; i++) {
    if (Math.abs(pos.getX(i)) < SEAM_EPS) { isSeam[i] = 1 }
    else                                    { toMirrorIdx[i] = n + mirroredCount++ }
  }

  const total = n + mirroredCount
  const p2  = new Float32Array(total * 3)
  const u2  = uv ? new Float32Array(total * 2) : null
  const si2 = new Uint16Array(total * is)
  const sw2 = new Float32Array(total * is)

  p2.set(pos.array)
  if (u2) u2.set(uv.array)
  si2.set(si.array)
  sw2.set(sw.array)

  for (let i = 0; i < n; i++) {
    if (isSeam[i]) continue
    const b = toMirrorIdx[i]
    p2[b*3]     = -pos.getX(i)
    p2[b*3 + 1] =  pos.getY(i)
    p2[b*3 + 2] =  pos.getZ(i)
    if (u2) { u2[b*2] = uv.getX(i); u2[b*2+1] = uv.getY(i) }
    for (let j = 0; j < is; j++) {
      const orig = si.getComponent(i, j)
      si2[b*is + j] = mirrorBone[orig] >= 0 ? mirrorBone[orig] : orig
      sw2[b*is + j] = sw.getComponent(i, j)
    }
  }

  // Combine indices: original + mirrored with reversed winding.
  // Use Uint16 since total vertices is always < 65536 for this mesh.
  const oi = idx.array
  const ni = new Uint16Array(oi.length * 2)
  ni.set(oi)
  for (let i = 0, ti = oi.length / 3; i < ti; i++) {
    const a = oi[i*3], b = oi[i*3+1], c = oi[i*3+2]
    const ma = isSeam[a] ? a : toMirrorIdx[a]
    const mb = isSeam[b] ? b : toMirrorIdx[b]
    const mc = isSeam[c] ? c : toMirrorIdx[c]
    ni[oi.length + i*3]     = ma
    ni[oi.length + i*3 + 1] = mc  // swap b↔c to flip winding
    ni[oi.length + i*3 + 2] = mb
  }

  const g2 = new THREE.BufferGeometry()
  g2.setAttribute('position',   new THREE.BufferAttribute(p2, 3))
  if (u2) g2.setAttribute('uv', new THREE.BufferAttribute(u2, 2))
  g2.setAttribute('skinIndex',  new THREE.Uint16BufferAttribute(si2, is))
  g2.setAttribute('skinWeight', new THREE.Float32BufferAttribute(sw2, is))
  g2.setIndex(new THREE.Uint16BufferAttribute(ni, 1))
  // Recompute normals across the full symmetric mesh — eliminates seam shading discontinuity
  g2.computeVertexNormals()

  // Don't dispose geo — let GC handle it. Calling dispose() while the GPU may
  // still reference the buffer (e.g. via Three.js internal caches) risks context loss.
  skinnedMesh.geometry = g2
}

// ─── Animation filter ─────────────────────────────────────────────────────────
// Strip IK targets, pose drivers, pickers, and viz helpers — they don't affect the mesh.
// ctrltorso is kept: it has a translation offset in every clip that positions the torso correctly.
const SKIP_BONE = /^(IK|pose|picker|neutral_bone|ctrlfoot|target|viz|switch)/

// Arm bones to lock out of Idle and look-around so arms stay in GLTF rest pose.
// Node names in miiBodyMin.glb use camelCase without dots (thighL, not thigh.L).
const ARM_BONES_SET = new Set([
  'bicepL', 'forearmL', 'handL', 'collarL',
  'bicepR', 'forearmR', 'handR', 'collarR',
])

// Hardcoded GLTF rest quaternions for arm bones (from node data, [x,y,z,w] → Three.js Quaternion).
// Used defensively in useFrame so arms are ALWAYS at sides regardless of mixer state.
const ARM_REST_QUATERNIONS = {
  'collarL':  new THREE.Quaternion(-0.63300, -0.32135, -0.62691,  0.32098).normalize(),
  'collarR':  new THREE.Quaternion(-0.63301,  0.32135,  0.62691,  0.32098).normalize(),
  'bicepL':   new THREE.Quaternion( 0.29918, -0.00073,  0.00434,  0.95419).normalize(),
  'bicepR':   new THREE.Quaternion( 0.29918,  0.00073, -0.00434,  0.95419).normalize(),
  'forearmL': new THREE.Quaternion( 0.01264,  0.70569, -0.01273,  0.70829).normalize(),
  'forearmR': new THREE.Quaternion( 0.01264, -0.70569,  0.01273,  0.70829).normalize(),
  'handL':    new THREE.Quaternion( 0.00018, -0.70448,  0.01413,  0.70959).normalize(),
  'handR':    new THREE.Quaternion( 0.00018,  0.70448, -0.01413,  0.70959).normalize(),
}

// Leg rest quaternions (GLTF bind pose)
const LEG_REST_Q = {
  'thighL': new THREE.Quaternion(-0.00399, -0.03085, -0.99943,  0.01348).normalize(),
  'thighR': new THREE.Quaternion(-0.00399,  0.03085,  0.99943,  0.01348).normalize(),
  'calfL':  new THREE.Quaternion(-0.34025,  0.00842, -0.01018,  0.94024).normalize(),
  'calfR':  new THREE.Quaternion(-0.34025, -0.00842,  0.01018,  0.94024).normalize(),
  'footL':  new THREE.Quaternion( 0.77800,  0.00100,  0.00400,  0.62800).normalize(),
  'footR':  new THREE.Quaternion( 0.77800, -0.00100, -0.00400,  0.62800).normalize(),
}

const _X_AXIS = new THREE.Vector3(1, 0, 0)
const _tmpQ   = new THREE.Quaternion()

const ARM_DOWN_ROTATION = new THREE.Quaternion().setFromAxisAngle(_X_AXIS, -1.18)
const ARM_DOWN_QUATERNIONS = Object.fromEntries(
  Object.entries(ARM_REST_QUATERNIONS).map(([name, restQ]) => {
    const q = restQ.clone()
    if (name === 'bicepL' || name === 'bicepR') q.multiplyQuaternions(ARM_DOWN_ROTATION, restQ)
    return [name, q]
  })
)

function deformClip(clip, extraSkip = null) {
  const c = clip.clone()
  c.tracks = c.tracks.filter(track => {
    const parts    = track.name.split('.')
    const lastPart = parts[parts.length - 1]
    const boneName = ['position', 'quaternion', 'scale'].includes(lastPart)
      ? parts.slice(0, -1).join('.')
      : track.name
    if (SKIP_BONE.test(boneName)) return false
    if (extraSkip?.has(boneName)) return false
    return true
  })
  return c
}

// ─── 3D Mii ───────────────────────────────────────────────────────────────────

const WALK_SPEED    = 6.2
const SKIP_WALK_SPEED = 3.5
const UNIT_SCALE    = 0.013
const BODY_SCALE    = 1.7
// Failsafe: set to 'skip' to restore the earlier same-size skipping walk-in.
// 'depth' is the later experimental forward/depth walk-in where size changes.
// 'side'/'top' are Wii-style passes: constant-size walk from offscreen.
const WALK_ENTRY_MODE = 'top'
const MII_BASE_X    = 0
const ENTRY_X       = -4.8
const MII_BASE_Y    = -1.5
const ENTRY_TOP_Y   = 1.9
const MII_BASE_Z    = 0.35
const WALK_DURATION = 3.2
const SKIP_ENTRY_Y  = 3.0
const ENTRY_Z       = -8.5
const MII_CAMERA_Z  = 6.0

/** Curated safe transforms; randomized by shuffle each channel open. */
const BACKGROUND_SLOT_POOL = [
  { position: [-2.35, MII_BASE_Y, -0.70], rotationY: 0.53, scale: 1.0, shadowOpacity: 0.20 },
  { position: [2.25, MII_BASE_Y, -0.66], rotationY: -0.49, scale: 1.0, shadowOpacity: 0.20 },
  { position: [-1.65, MII_BASE_Y, -0.86], rotationY: 0.2, scale: 1.0, shadowOpacity: 0.18 },
  { position: [1.72, MII_BASE_Y, -0.88], rotationY: -0.26, scale: 1.0, shadowOpacity: 0.18 },
  { position: [-3.05, MII_BASE_Y, -0.62], rotationY: 0.86, scale: 1.0, shadowOpacity: 0.17 },
  { position: [2.95, MII_BASE_Y, -0.60], rotationY: -0.82, scale: 1.0, shadowOpacity: 0.17 },
  { position: [-2.65, MII_BASE_Y, -0.96], rotationY: Math.PI - 0.35, scale: 1.0, shadowOpacity: 0.16 },
  { position: [2.7, MII_BASE_Y, -0.98], rotationY: -(Math.PI - 0.45), scale: 1.0, shadowOpacity: 0.16 },
  { position: [-1.12, MII_BASE_Y, -1.06], rotationY: Math.PI, scale: 1.0, shadowOpacity: 0.14 },
  { position: [1.15, MII_BASE_Y, -1.08], rotationY: -Math.PI, scale: 1.0, shadowOpacity: 0.14 },
  { position: [-3.3, MII_BASE_Y, -0.76], rotationY: 1.15, scale: 1.0, shadowOpacity: 0.15 },
  { position: [3.2, MII_BASE_Y, -0.78], rotationY: -1.12, scale: 1.0, shadowOpacity: 0.15 },
]

/** Keep random extras away from hero walk lane + thought area. */
const BACKGROUND_BLOCK_CENTER = { x: MII_BASE_X, z: MII_BASE_Z }
const BACKGROUND_BLOCK_RADIUS = 2.05
/** Ensure the two random extras are visually separated. */
const BACKGROUND_MIN_PAIR_DISTANCE = 2.25

/**
 * Head contract for future variants:
 * - `headUrl`: optional GLB URL, omit/null for body-only extras.
 * - `headOffset`: local offset relative to the `head` bone.
 * - `headScale`: scalar multiplier on UNIT_SCALE/bodyScale.
 */
const BACKGROUND_CHARACTER_VARIANTS = [
  {
    id: 'female',
    bodyUrl: '/assets/miiBody.glb',
    bodyMeshName: 'torso_f_weights',
    headUrl: '/female-mii.glb',
    headOffset: [0, -0.075, 0],
    headScale: 0.64,
    bodyScaleMul: 0.86,
    enableCustomOutfitShader: true,
    outfitColors: { shirtHex: '#ef86b7', pantsHex: '#bebec4', waistHeightFrac: 0.352 },
  },
  {
    id: 'male',
    bodyUrl: '/assets/miiBody.glb',
    bodyMeshName: 'torso_m_weights',
    headUrl: '/male-mii.glb',
    headOffset: [0, -0.075, 0],
    headScale: 0.64,
    bodyScaleMul: 0.94,
    enableCustomOutfitShader: true,
    outfitColors: { shirtHex: '#4e79d9', pantsHex: '#6b4b34', waistHeightFrac: 0.445 },
  },
]

/** Locked composition requested: hero appears to look between both background Miis. */
const LOCKED_BACKGROUND_SLOTS_BY_ID = {
  male: {
    position: [3.2, MII_BASE_Y, -0.78],
    rotationY: -1.12,
    scale: 1.0,
    shadowOpacity: 0.15,
  },
  female: {
    position: [-3.3, MII_BASE_Y, -0.76],
    rotationY: 1.15,
    scale: 1.0,
    shadowOpacity: 0.15,
  },
}

function shuffleArray(list) {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function isOutsideHeroBlock(slot) {
  const [x, , z] = slot.position
  const dx = x - BACKGROUND_BLOCK_CENTER.x
  const dz = z - BACKGROUND_BLOCK_CENTER.z
  return Math.hypot(dx, dz) >= BACKGROUND_BLOCK_RADIUS
}

function pairDistance(a, b) {
  const [ax, , az] = a.position
  const [bx, , bz] = b.position
  return Math.hypot(ax - bx, az - bz)
}

function pickBackgroundSlots(pool, count) {
  const valid = shuffleArray(pool).filter(isOutsideHeroBlock)
  if (valid.length <= count) return valid.slice(0, count)

  if (count === 2) {
    let bestPair = [valid[0], valid[1]]
    let bestDist = pairDistance(valid[0], valid[1])
    for (let i = 0; i < valid.length; i++) {
      for (let j = i + 1; j < valid.length; j++) {
        const d = pairDistance(valid[i], valid[j])
        if (d >= BACKGROUND_MIN_PAIR_DISTANCE) return [valid[i], valid[j]]
        if (d > bestDist) {
          bestDist = d
          bestPair = [valid[i], valid[j]]
        }
      }
    }
    return bestPair
  }

  return valid.slice(0, count)
}

function backgroundIdlePhaseOffset(position, rotationY) {
  const [x, , z] = position
  const seed = Math.sin(x * 12.9898 + z * 78.233 + rotationY * 37.719) * 43758.5453
  return seed - Math.floor(seed)
}

function CameraAim() {
  const { camera } = useThree()

  useEffect(() => {
    camera.position.set(0, 1.8, 6.0)
    camera.lookAt(0, -1.0, 0)
    camera.fov = 48
    camera.updateProjectionMatrix()
  }, [camera])

  return null
}

function BackgroundMii({
  bodyUrl,
  bodyMeshName,
  headUrl = null,
  headOffset = [0, -0.075, 0],
  headScale = 1,
  bodyScaleMul = 1,
  position = [0, MII_BASE_Y, -0.35],
  rotationY = 0,
  scale = 1.5,
  shadowOpacity = 0.22,
  enableCustomOutfitShader = false,
  outfitColors = null,
}) {
  const { scene: bodySourceScene, animations } = useGLTF(bodyUrl)
  const { scene: headSourceScene }             = useGLTF(headUrl || '/mii.glb')
  const shadowTexture                          = useTexture('/assets/shadow.png')

  const groupRef = useRef(null)
  const mixerRef = useRef(null)
  const bodySkeletonRef = useRef(null)
  const frameBudgetRef = useRef(0)
  const [renderReady, setRenderReady] = useState(false)

  const preparedBodyScene = useMemo(() => {
    if (!bodySourceScene) return null
    const cloned = cloneSkeleton(bodySourceScene)

    cloned.traverse((obj) => {
      obj.matrixAutoUpdate = true
      obj.matrixWorldAutoUpdate = true
    })

    cloned.traverse((obj) => {
      if (!obj.isMesh) return
      if (!obj.isSkinnedMesh) {
        obj.visible = false
        return
      }
      if (!obj.skeleton) {
        obj.visible = false
        return
      }
      if (bodyMeshName && obj.name !== bodyMeshName) {
        obj.visible = false
        return
      }

      obj.visible = true
      obj.frustumCulled = true
      bodySkeletonRef.current = obj.skeleton
      if (!obj.geometry?.userData?.mirroredX) {
        mirrorGeometryX(obj)
        if (obj.geometry) obj.geometry.userData.mirroredX = true
      }
      if (enableCustomOutfitShader) applyOutfitWaistShader(obj, outfitColors || undefined)
    })

    return cloned
  }, [bodySourceScene, bodyMeshName, enableCustomOutfitShader, outfitColors])

  const backgroundHeadScene = useMemo(() => {
    if (!headUrl || !headSourceScene) return null
    const cloned = headSourceScene.clone(true)
    cloned.traverse((obj) => {
      if (!obj.isMesh) return
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
      mats.forEach((mat) => {
        mat.roughness = 0.8
        mat.metalness = 0.05
        mat.needsUpdate = true
      })
    })
    return cloned
  }, [headSourceScene, headUrl])

  const bodyBones = useMemo(() => {
    const map = {}
    if (!preparedBodyScene) return map
    preparedBodyScene.traverse((obj) => {
      if (obj.isBone) map[obj.name] = obj
    })
    return map
  }, [preparedBodyScene])

  useEffect(() => {
    setRenderReady(false)
  }, [preparedBodyScene, headUrl])

  useEffect(() => {
    if (!headUrl) return
    const headBone = bodyBones?.head
    if (!headBone || !backgroundHeadScene) return
    const [hx, hy, hz] = headOffset
    backgroundHeadScene.scale.setScalar((UNIT_SCALE / scale) * headScale)
    backgroundHeadScene.position.set(hx, hy, hz)
    headBone.add(backgroundHeadScene)
    return () => {
      headBone.remove(backgroundHeadScene)
      backgroundHeadScene.position.set(0, 0, 0)
      backgroundHeadScene.scale.setScalar(1)
    }
  }, [bodyBones, backgroundHeadScene, headUrl, headOffset, headScale, scale])

  useEffect(() => {
    if (!preparedBodyScene || !animations?.length) {
      setRenderReady(!!preparedBodyScene)
      return
    }
    const rawIdle = animations.find((a) => a.name === 'Idle')
    if (!rawIdle) {
      setRenderReady(true)
      return
    }

    let cancelled = false
    const mixer = new THREE.AnimationMixer(preparedBodyScene)
    const idleClip = deformClip(rawIdle, ARM_BONES_SET)
    const idleAction = mixer.clipAction(idleClip)
    idleAction.setLoop(THREE.LoopRepeat, Infinity)
    const phase = backgroundIdlePhaseOffset(position, rotationY)
    idleAction.time = phase * Math.max(0.001, idleClip.duration)
    idleAction.play()
    mixer.update(0)
    Object.entries(ARM_DOWN_QUATERNIONS).forEach(([name, q]) => {
      const bone = bodyBones?.[name]
      if (bone) bone.quaternion.copy(q)
    })
    bodySkeletonRef.current?.update()
    if (!cancelled) setRenderReady(true)
    mixerRef.current = mixer

    return () => {
      cancelled = true
      mixer.stopAllAction()
      mixer.uncacheRoot(preparedBodyScene)
      mixerRef.current = null
    }
  }, [preparedBodyScene, animations, position, rotationY, bodyBones])

  useFrame((_state, delta) => {
    if (!groupRef.current) return
    frameBudgetRef.current += delta
    if (frameBudgetRef.current < 1 / 30) return
    const tick = frameBudgetRef.current
    frameBudgetRef.current = 0
    if (mixerRef.current) mixerRef.current.update(tick)

    Object.entries(ARM_DOWN_QUATERNIONS).forEach(([name, q]) => {
      const bone = bodyBones?.[name]
      if (bone) bone.quaternion.copy(q)
    })
    groupRef.current.updateMatrixWorld(true)
    bodySkeletonRef.current?.update()
  })

  // Match apparent size to hero under perspective: scale ∝ cameraDistance.
  const heroDistance = Math.max(0.0001, MII_CAMERA_Z - MII_BASE_Z)
  const bgDistance = Math.max(0.0001, MII_CAMERA_Z - position[2])
  const perspectiveComp = bgDistance / heroDistance
  const finalScale = scale * BODY_SCALE * perspectiveComp * bodyScaleMul

  return (
    <group ref={groupRef} position={position} rotation={[0, rotationY, 0]} visible={renderReady}>
      <mesh rotation={[-Math.PI / 2 + 0.4, 0, 0]} position={[0, -0.02, 0]}>
        <planeGeometry args={[1.1, 1.1]} />
        <meshBasicMaterial alphaMap={shadowTexture} transparent opacity={0.45} color={0x000000} depthWrite={false} />
      </mesh>
      {preparedBodyScene && <primitive object={preparedBodyScene} scale={finalScale} />}
    </group>
  )
}

function MiiModel({ onArrived, bubbleVisibleRef, headBubbleScreenRef }) {
  const { scene: bodyScene, nodes: bodyNodes, animations } = useGLTF(MII_BODY_GLB_URL)
  const { scene: headScene }                               = useGLTF('/mii.glb')
  const shadowTexture                                      = useTexture('/assets/shadow.png')

  const groupRef              = useRef()
  const bodySkeletonRef       = useRef(null)
  const mixerRef              = useRef(null)
  const idleActionRef         = useRef(null)
  const waveActionRef         = useRef(null)
  const lookAroundRef         = useRef(null)
  const idleTimerRef          = useRef(null)
  const startRef              = useRef(null)
  const arrivedRef            = useRef(false)
  const callbackRef           = useRef(onArrived)
  const lookAroundActiveRef   = useRef(false)
  const armRestoringRef       = useRef(false) // true while slerping arms back to rest after wave
  const wavingRef             = useRef(false) // true while wave action is playing
  /** Walk-in stride sign; used to fire left/right footstep SFX on zero crossings. */
  const prevStrideRef         = useRef(null)
  const [renderReady, setRenderReady] = useState(false)
  callbackRef.current = onArrived


  // Must be useMemo (synchronous during render), NOT useEffect.
  // The GLB has two nodes referencing mesh 0: 'body' (node 0, no skin) and 'torso m weights'
  // (node 124, skin 0). GLTFLoader creates a SkinnedMesh for 'body' but never calls bind(),
  // so skeleton=undefined. Three.js r184 has no null check before skeleton.update() and
  // crashes every frame. Hiding it in useEffect is too late — the crash happens on frame 1.
  const processedBody = useMemo(() => {
    if (!bodyScene) return null
    bodyScene.traverse(obj => {
      obj.matrixAutoUpdate      = true
      obj.matrixWorldAutoUpdate = true
    })
    bodyScene.traverse(obj => {
      if (!obj.isMesh) return
      if (obj.isSkinnedMesh && !obj.skeleton) {
        obj.visible = false   // 'body' node — no skeleton, would crash renderer
        return
      }
      obj.visible       = true
      obj.frustumCulled = false
      if (obj.isSkinnedMesh && obj.skeleton) bodySkeletonRef.current = obj.skeleton
      // Mirror first (doubles verts), then outfit vertex colors use final skin weights.
      // Guards survive on cached GLTF scene — don't dispose mirrored geo (GPU leak risk).
      if (obj.isSkinnedMesh && obj.skeleton && !obj.userData.mirrored) {
        mirrorGeometryX(obj)
        obj.userData.mirrored = true
      }
      if (obj.isSkinnedMesh && obj.skeleton) {
        applyOutfitWaistShader(obj)
      }
    })
    return bodyScene
  }, [bodyScene])

  const processedHead = useMemo(() => {
    if (!headScene) return null
    headScene.traverse(obj => {
      if (!obj.isMesh) return
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
      mats.forEach(mat => { mat.roughness = 0.8; mat.metalness = 0.05; mat.needsUpdate = true })
    })
    return headScene
  }, [headScene])

  useEffect(() => {
    setRenderReady(false)
  }, [processedBody, processedHead])

  // Parent mii.glb to the skeleton's 'head' joint so it follows all animations.
  // processedHead lives inside bodyScene (rendered at BODY_SCALE=1.7), so scale
  // must be UNIT_SCALE / BODY_SCALE. Position -0.075 keeps the visual position
  // consistent with the old fixed HEAD_Y (head covers neck, no gap visible).
  useEffect(() => {
    const headBone = bodyNodes?.['head']
    if (!headBone || !processedHead) return
    processedHead.scale.setScalar(UNIT_SCALE / BODY_SCALE)
    processedHead.position.set(0, -0.075, 0)
    headBone.add(processedHead)
    return () => {
      headBone.remove(processedHead)
      processedHead.position.set(0, 0, 0)
      processedHead.scale.setScalar(1)
    }
  }, [bodyNodes, processedHead])

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.set(
        WALK_ENTRY_MODE === 'side' ? ENTRY_X : MII_BASE_X,
        WALK_ENTRY_MODE === 'skip' ? SKIP_ENTRY_Y : WALK_ENTRY_MODE === 'top' ? ENTRY_TOP_Y : MII_BASE_Y,
        WALK_ENTRY_MODE === 'depth' ? ENTRY_Z : MII_BASE_Z
      )
    }
    startRef.current   = null
    arrivedRef.current = false
    return () => { startRef.current = null; arrivedRef.current = false }
  }, [])

  // AnimationMixer — full sequence:
  //   walk-in (manual legs) → wave once → arms slerp to rest → idle → look around every 5s
  useEffect(() => {
    if (!bodyScene || !animations?.length) {
      setRenderReady(!!bodyScene)
      return
    }

    const mixer   = new THREE.AnimationMixer(bodyScene)
    const rawIdle = animations.find(a => a.name === 'Idle')
    const rawWave = animations.find(a => a.name === 'wave')
    const rawLook = animations.find(a => a.name === 'look around')

    if (rawIdle) {
      // Strip arm tracks from Idle — arms stay in GLTF rest (naturally at sides).
      // The Idle animation raises arms to a Mii-plaza stance; we don't want that.
      const a = mixer.clipAction(deformClip(rawIdle, ARM_BONES_SET))
      a.setLoop(THREE.LoopRepeat, Infinity)
      a.play()   // start immediately for torso/leg animations during walk-in
      idleActionRef.current = a
    }
    if (rawWave) {
      const a = mixer.clipAction(deformClip(rawWave))
      a.setLoop(THREE.LoopOnce)
      a.clampWhenFinished = true
      waveActionRef.current = a
    }
    if (rawLook) {
      // Strip arm tracks — only head/neck/spine animate during look-around.
      // Arm bones are locked to saved idle pose in useFrame while look-around is active.
      const a = mixer.clipAction(deformClip(rawLook, ARM_BONES_SET))
      a.setLoop(THREE.LoopOnce)
      a.clampWhenFinished = true
      lookAroundRef.current = a
    }

    const scheduleLookAround = () => {
      idleTimerRef.current = setTimeout(() => {
        if (!lookAroundRef.current || !idleActionRef.current) return
        lookAroundActiveRef.current = true
        lookAroundRef.current.reset().play()
        lookAroundRef.current.crossFadeFrom(idleActionRef.current, 0.3, true)
      }, 5000)
    }

    const onFinished = (e) => {
      if (e.action === waveActionRef.current) {
        wavingRef.current       = false
        armRestoringRef.current = true   // begin slerping arms back to rest
        if (idleActionRef.current) {
          idleActionRef.current.reset().play()
          idleActionRef.current.crossFadeFrom(waveActionRef.current, 0.4, true)
        }
        callbackRef.current()
        scheduleLookAround()
      } else if (e.action === lookAroundRef.current) {
        lookAroundActiveRef.current = false   // release manual arm lock
        if (idleActionRef.current) {
          idleActionRef.current.reset().play()
          idleActionRef.current.crossFadeFrom(lookAroundRef.current, 0.4, true)
        }
        scheduleLookAround()
      }
    }
    mixer.addEventListener('finished', onFinished)
    mixerRef.current = mixer
    mixer.update(0)
    Object.entries(ARM_DOWN_QUATERNIONS).forEach(([name, restQ]) => {
      const bone = bodyNodes?.[name]
      if (bone) bone.quaternion.copy(restQ)
    })
    bodySkeletonRef.current?.update()
    setRenderReady(true)

    return () => {
      clearTimeout(idleTimerRef.current)
      mixer.removeEventListener('finished', onFinished)
      mixer.stopAllAction()
      mixer.uncacheRoot(bodyScene)
      mixerRef.current            = null
      idleActionRef.current       = null
      waveActionRef.current       = null
      lookAroundRef.current       = null
      lookAroundActiveRef.current = false
      armRestoringRef.current     = false
      wavingRef.current           = false
      setRenderReady(false)
    }
  }, [bodyScene, animations, bodyNodes])

  useFrame(({ clock, camera, size }, delta) => {
    if (!groupRef.current) return
    const t = clock.getElapsedTime()

    // Tick mixer first — then manual overrides run on top
    if (mixerRef.current) mixerRef.current.update(delta)

    // Smooth arm restore after wave: exponential slerp toward GLTF rest quaternions.
    if (armRestoringRef.current) {
      let settled = true
      Object.entries(ARM_DOWN_QUATERNIONS).forEach(([name, restQ]) => {
        const bone = bodyNodes?.[name]
        if (!bone) return
        bone.quaternion.slerp(restQ, 1 - Math.exp(-delta * 5))
        if (bone.quaternion.angleTo(restQ) > 0.01) settled = false
      })
      if (settled) armRestoringRef.current = false
    }

    // Force arms to GLTF rest every frame — covers walk-in, idle, and look-around.
    // Only skip during wave (arm tracks needed) and restore (slerp runs above instead).
    if (!wavingRef.current && !armRestoringRef.current) {
      Object.entries(ARM_DOWN_QUATERNIONS).forEach(([name, restQ]) => {
        const bone = bodyNodes?.[name]
        if (bone) bone.quaternion.copy(restQ)
      })
    }

    if (arrivedRef.current) {
      prevStrideRef.current = null
      groupRef.current.position.x = MII_BASE_X
      groupRef.current.position.y = MII_BASE_Y
      groupRef.current.position.z = MII_BASE_Z
      groupRef.current.rotation.z = 0
    } else {
      if (startRef.current === null) startRef.current = t
      const p    = Math.min((t - startRef.current) / WALK_DURATION, 1)
      const walkSpeed = WALK_ENTRY_MODE === 'skip' ? SKIP_WALK_SPEED : WALK_SPEED
      const stepPhase = t * walkSpeed
      groupRef.current.position.x = WALK_ENTRY_MODE === 'side'
        ? ENTRY_X + (MII_BASE_X - ENTRY_X) * p
        : MII_BASE_X
      if (WALK_ENTRY_MODE === 'skip') {
        const ease = p * p * (3 - 2 * p)
        const bob = Math.abs(Math.sin(stepPhase)) * 0.06
        groupRef.current.position.y = SKIP_ENTRY_Y + (MII_BASE_Y - SKIP_ENTRY_Y) * ease + bob
      } else if (WALK_ENTRY_MODE === 'top') {
        groupRef.current.position.y = ENTRY_TOP_Y + (MII_BASE_Y - ENTRY_TOP_Y) * p
      } else {
        groupRef.current.position.y = MII_BASE_Y
      }
      groupRef.current.position.z = WALK_ENTRY_MODE !== 'depth'
        ? MII_BASE_Z
        : ENTRY_Z + (MII_BASE_Z - ENTRY_Z) * p
      groupRef.current.rotation.z = Math.sin(stepPhase) * (WALK_ENTRY_MODE === 'skip' ? 0.025 : 0.012)

      // Manual walk cycle — pre-multiply rest quaternions so bones that sit near
      // 180° around Z still swing around the intended hip-space axis.
      const tl = bodyNodes?.['thighL']
      const tr = bodyNodes?.['thighR']
      const cl = bodyNodes?.['calfL']
      const cr = bodyNodes?.['calfR']
      const fl = bodyNodes?.['footL']
      const fr = bodyNodes?.['footR']
      const sp = bodyNodes?.['spine001']
      if (tl && tr) {
        const stride = Math.sin(stepPhase)
        if (prevStrideRef.current !== null && prevStrideRef.current * stride < 0) {
          if (prevStrideRef.current < 0) playFootstepRight()
          else playFootstepLeft()
        }
        prevStrideRef.current = stride

        const swing  = stride * (WALK_ENTRY_MODE === 'skip' ? 0.62 : 0.34)
        const liftL  = Math.pow(Math.max(0, -stride), 1.8)
        const liftR  = Math.pow(Math.max(0,  stride), 1.8)
        const bendStrength = WALK_ENTRY_MODE === 'skip' ? 1.65 : 0.58
        const bendL  = liftL * bendStrength
        const bendR  = liftR * bendStrength

        _tmpQ.setFromAxisAngle(_X_AXIS, swing)
        tl.quaternion.multiplyQuaternions(_tmpQ, LEG_REST_Q['thighL'])
        _tmpQ.setFromAxisAngle(_X_AXIS, -swing)
        tr.quaternion.multiplyQuaternions(_tmpQ, LEG_REST_Q['thighR'])

        if (cl) {
          _tmpQ.setFromAxisAngle(_X_AXIS, -bendL)
          cl.quaternion.multiplyQuaternions(_tmpQ, LEG_REST_Q['calfL'])
        }
        if (cr) {
          _tmpQ.setFromAxisAngle(_X_AXIS, -bendR)
          cr.quaternion.multiplyQuaternions(_tmpQ, LEG_REST_Q['calfR'])
        }
        if (fl) {
          _tmpQ.setFromAxisAngle(_X_AXIS, bendL * (WALK_ENTRY_MODE === 'skip' ? 0.65 : 0.22))
          fl.quaternion.multiplyQuaternions(_tmpQ, LEG_REST_Q['footL'])
        }
        if (fr) {
          _tmpQ.setFromAxisAngle(_X_AXIS, bendR * (WALK_ENTRY_MODE === 'skip' ? 0.65 : 0.22))
          fr.quaternion.multiplyQuaternions(_tmpQ, LEG_REST_Q['footR'])
        }
      }
      if (sp) sp.rotation.z = Math.sin(stepPhase) * (WALK_ENTRY_MODE === 'skip' ? 0.04 : 0.01)

      if (p >= 1) {
        arrivedRef.current          = true
        groupRef.current.position.x = MII_BASE_X
        groupRef.current.position.y = MII_BASE_Y
        groupRef.current.position.z = MII_BASE_Z
        groupRef.current.rotation.z = 0

        // CrossFade from idle so arms transition smoothly to wave pose
        wavingRef.current = true
        if (waveActionRef.current && idleActionRef.current) {
          waveActionRef.current.reset().play()
          waveActionRef.current.crossFadeFrom(idleActionRef.current, 0.25, true)
        }
      }
    }

    groupRef.current.updateMatrixWorld(true)
    bodySkeletonRef.current?.update()

    // Project forehead (head bone + offset) into channel pixel space for HTML thought bubble.
    // Add MII_CANVAS_TRANSLATE_X so HTML lines up with the CSS-shifted WebGL canvas.
    if (bubbleVisibleRef?.current && headBubbleScreenRef && bodyNodes?.head) {
      _headProjScratch.copy(THOUGHT_HEAD_LOCAL_OFFSET)
      bodyNodes.head.localToWorld(_headProjScratch)
      _headProjScratch.project(camera)
      const sx = (_headProjScratch.x * 0.5 + 0.5) * size.width + MII_CANVAS_TRANSLATE_X + THOUGHT_HEAD_SCREEN_NUDGE_X
      const sy = (-_headProjScratch.y * 0.5 + 0.5) * size.height + THOUGHT_HEAD_SCREEN_NUDGE_Y
      headBubbleScreenRef.current = { x: sx, y: sy }
    }
  })

  return (
    <group ref={groupRef} visible={renderReady}>
      <mesh rotation={[-Math.PI / 2 + 0.4, 0, 0]} position={[0, -0.02, 0]}>
        <planeGeometry args={[1.1, 1.1]} />
        <meshBasicMaterial alphaMap={shadowTexture} transparent opacity={0.45} color={0x000000} depthWrite={false} />
      </mesh>
      {processedBody && <primitive object={processedBody} scale={BODY_SCALE} />}
      {/* processedHead is attached imperatively to the 'head' bone in useEffect */}
    </group>
  )
}

useGLTF.preload(MII_BODY_GLB_URL)
useGLTF.preload('/assets/miiBody.glb')
useGLTF.preload('/mii.glb')
useGLTF.preload('/female-mii.glb')
useGLTF.preload('/male-mii.glb')
useGLTF.preload('/henry-mii.glb')

// ─── Main component ───────────────────────────────────────────────────────────

export default function MiiChannel({ onClose }) {
  const [bubbleVisible, setBubbleVisible] = useState(false)
  const bubbleVisibleRef = useRef(false)
  const headBubbleScreenRef = useRef(null)

  const backgroundConfigs = useMemo(() => {
    const fallbackSlots = pickBackgroundSlots(BACKGROUND_SLOT_POOL, BACKGROUND_CHARACTER_VARIANTS.length)
    return BACKGROUND_CHARACTER_VARIANTS.map((c, i) => ({
      id: `bg-${c.id}-${i}`,
      ...c,
      ...(LOCKED_BACKGROUND_SLOTS_BY_ID[c.id] || fallbackSlots[i]),
    }))
  }, [])

  useEffect(() => {
    bubbleVisibleRef.current = bubbleVisible
  }, [bubbleVisible])

  useEffect(() => {
    const bgm = createMiiPlazaBgm()
    void bgm.play().catch(() => {})
    return () => {
      bgm.pause()
      bgm.removeAttribute('src')
      bgm.load()
    }
  }, [])

  useEffect(() => {
    if (!bubbleVisible) return
    playThoughtBubbleAppearSound()
  }, [bubbleVisible])

  return (
    <div style={{
      position: 'absolute', left: 0, top: 0, width: W, height: H,
      zIndex: 50, overflow: 'hidden',
      animation: 'tileAppear 0.25s ease both',
    }}>
      <MiiPlazaFloor />

      <Canvas
        style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none', transform: `translateX(${MII_CANVAS_TRANSLATE_X}px)` }}
        gl={{ alpha: true, antialias: false, powerPreference: 'high-performance' }}
        camera={{ position: [0, 1.8, 6.0], fov: 48 }}
        dpr={1}
      >
        {WALK_ENTRY_MODE === 'depth' && <CameraAim />}
        <ambientLight intensity={1.5} />
        <directionalLight position={[3, 6, 4]}  intensity={1.8} />
        <directionalLight position={[-2, 3, -2]} intensity={0.4} />
        <Suspense fallback={null}>
          {backgroundConfigs.map((cfg) => (
            <BackgroundMii key={cfg.id} {...cfg} />
          ))}
          <MiiModel
            onArrived={() => setBubbleVisible(true)}
            bubbleVisibleRef={bubbleVisibleRef}
            headBubbleScreenRef={headBubbleScreenRef}
          />
        </Suspense>
      </Canvas>

      <SpeechBubble visible={bubbleVisible} headScreenRef={headBubbleScreenRef} />

      <div style={{
        position: 'absolute', bottom: 28, left: 48, zIndex: 10,
      }}>
        <PillButton label="Wii Menu" onClick={onClose} width={300} height={76} fontSize={34} />
      </div>
    </div>
  )
}
