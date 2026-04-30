# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project snapshot (Apr 2026)

- **Public GitHub:** https://github.com/Henry-Wheeler/personal-portfolio — ship changes with normal `git add` / `commit` / `push` on meaningful milestones.
- **Names:** Browser tab + README title **“Personal Portfolio”**; npm package name `personal-portfolio` in `package.json`.
- **`.gitignore`:** Excludes `node_modules/`, `dist/`, `.env*`, local dumps (`.blend`, `.zip`, raw `Mii/` exports, etc.). Only the app + `public/` assets + `reference/` design refs are tracked.

## Roadmap

Product direction — **update this section when plans change.** Implementation order is not fixed here.

### New channels (Wii-inspired)

| Working name | Wii inspiration | Summary |
|--------------|-----------------|---------|
| **News Channel** | News Channel | Dark navy, white type, **scrolling ticker** with résumé highlights; click expands into a **timeline** (experience + education). |
| **Forecast Channel** | Weather Channel | **Tech stack as a weather forecast** — sunny = strong, cloudy = familiar. Stack: Python, React, Swift, C++, D3.js, SQL, Three.js. |
| **Creative Corner** | Original (not default blue-white) | **Warmer palette.** Sections: photography, drawing, music taste (The Hell, Tyler the Creator, Clairo, Uzi, Carti). |
| **Project Plaza** | Plaza-style sub-grid | **Project tiles:** D3tection (YOLOv8 real-time Rubik’s cube + Three.js), InfoCraftic (Adobe hackathon browser extension), TNTAuto/AMNH (phylogenetic pipeline). Short descriptions + **GitHub** where applicable. |
| **Website Guide** | Utility / meta | On open: **typed-out** explanation of **what each channel is**, **which Wii UI it echoes**, and a short **about this site** blurb. |
| **Mii Parade** (contact) | Mii Parade | Small Miis walking on the **tile**; opens to **contact** — GitHub (Henry-Wheeler), LinkedIn, email as **Wii-style buttons**. **Lowest priority** — may skip if another contact pattern wins. |

### About Mii channel (extras)

- **Background Miis:** a **few** additional figures in **idle** at different positions/angles so the plaza feels fuller (not a crowd). **Current live state in `MiiChannel.jsx`:** 2 extras (1 female + 1 male) from `/assets/miiBody.glb` (`torso_f_weights` / `torso_m_weights`) selected from a curated shuffled slot pool with center exclusion + min pair spacing. Female currently uses `/female-mii.glb` head + pink/light-gray outfit; male is body-only for now.

### UI / audio polish

- **Done:** Mii channel **BGM** + **channel-select** + **thought-bubble appear** + **walk-in footsteps** via `public/audio/*` and `src/audio/miiChannelSfx.js` (volumes tunable there).  
- **Later:** About Mii **tile cover art** refresh only (other grid tiles unchanged for now).

### Footer & hosting

- Wire **Footer** `CircButton`s (Wii / envelope) if desired.  
- **Deploy** (e.g. Vercel) + **custom domain** when ready.

## Dev Server

```bash
npm run dev
```

Open: `http://localhost:5173/`

Vite + React project. JSX is transpiled at build time (not runtime). No CDN dependencies.

## Architecture

### Canvas model
The entire UI lives inside a 1920×1080 div that scales to fit the viewport via `transform: scale(s)` with `transformOrigin: '0 0'`. All coordinates are authored at 1920×1080. Mouse coordinates are reverse-scaled back to canvas space: `(e.clientX - offset.x) / scale`.

### Component hierarchy
```
App                  — scale/offset/cursor/tilt/openChannel state
  Stripes            — decorative top gradient stripes
  ChannelGrid        — 4×3 grid; tile 0 = About Mii (shows HenryMii SVG preview)
    ChannelTile      — SVG tile shape (TILE_PATH from constants), shine/hover
    HenryMii         — SVG Mii character used as tile 0 preview icon
  NavArrow           — left/right arrows; left hidden until first scroll
  Footer             — curved Union SVG bar + CircButton (Wii) + CircButton (email) + date
  MiiChannel         — full-screen overlay (zIndex 50) opened by tile 0
  WiiCursor          — SVG cursor tracking mouse with tilt, zIndex 9999
```

### Design tokens (`src/constants.js`)
- `W = 1920`, `H = 1080`
- `C` — full Figma color palette
- `FONT` — `'M PLUS Rounded 1c'` (Google Fonts substitute for FOT-RodinBokutoh Pro)
- `TILE_PATH`, `CURSOR_HAND_PATH`, `CURSOR_POINTER_PATH` — inlined SVG paths

### Channel system
`openChannel` state in `App` (null = home). Panels are full-screen `position: absolute, zIndex: 50` divs rendered inside the canvas div. **About Mii** uses `openChannel === 'about'` (tile 0 calls `onOpen('about')`). To add a channel: (1) add tile in `ChannelGrid` with `onClick={() => onOpen('yourKey')}`, (2) build `YourPanel` component, (3) add `{openChannel === 'yourKey' && <YourPanel onClose=... />}` in `App`.

### Assets
**`src/assets/`** (imported via Vite):
- `mii-plaza.png` — floor tile + UI icon sprite sheet (too low-res to use at 1920×1080)
- `wii-menu-banner.png` — Mii character reference sheet (Miis overlap, not extractable)
- `body-part-icons.png` — Mii face/hair/eye part icons
- `mii-font.png` — Wii bitmap font reference
- `fleche-droite.png/.svg` — right navigation arrow

**`public/assets/`** (served at `/assets/`):
- `miiBodyMin.glb` — **default** full Mii body for `MiiChannel` (root bone bakes -90° X; no extra primitive rotation). Mesh is half-width; `mirrorGeometryX()` mirrors geometry and remaps L/R bone indices (supports both `thighL`-style and `thigh.L`-style names).
- `maleBody.glb` — alternate / failsafe rigged body. Use rotation `[Math.PI/2, 0, 0]` — stands upright AND faces camera. (`[-π/2, π, 0]` showed the back; `[-π/2, 0, 0]` was upside down.)
- `floor-quarter.png` — one quadrant of the Mii Plaza floor tile pattern
- `floor-tile.png` — individual floor tile
- `mii.png` — Mii render reference

**`public/`** (served at root):
- `mii.glb` — Mii head model (loaded at `/mii.glb`)
- `henry-mii.glb` — head-only GLB from mii-unsecure API (NOT a full body — body endpoint returns 400)
- `env0.png`, `env1.png` — environment map references
- `shadow.png` — drop shadow sprite

**`public/audio/`** (served at `/audio/` — wired in `src/audio/miiChannelSfx.js`):
- `mii-plaza-bgm.mp3` — looped BGM while About Mii is open  
- `channel-select.mp3` — channel tile open (from `App` → `onOpen`)  
- `thought-bubble-appear.wav` — when the thought bubble becomes visible (after wave)  
- `footstep-left.mp3` / `footstep-right.mp3` — walk-in, on alternating `sin(stepPhase)` zero crossings  

### Animations (`src/index.css`)
Four keyframes: `tileAppear` (panel/tile entry), `floatBob` (±4px vertical bob), `pulseGlow` (opacity pulse), `miiWalk` (CSS walk bob — currently unused, walk handled by Three.js bones). Add new keyframes here — they're accessible to all inline `animation:` props.

---

## FAILSAFE — Reverting to maleBody.glb (Option A)

**Today:** `MiiChannel` uses `/assets/miiBodyMin.glb` + `/mii.glb` (see component). If that approach is abandoned, restore the working maleBody.glb setup:

**Assets used:** `/assets/maleBody.glb` (body) + `/mii.glb` (head). Other bodies (`miiBody.glb`, `miiMaker.glb`, etc.) may exist in `public/assets/` but are not wired in the default channel.

**Constants to restore:**
```js
const WALK_SPEED  = 4.5
const UNIT_SCALE  = 0.013   // mii.glb head scale
const MII_BASE_Y  = -1.0
const WALK_DURATION = 3.0
const ENTRY_Y     = 2.8
const NECK_Y      = 1.561
const HEAD_Y      = 1.45    // formula: NECK_Y + 0.256 - 0.37
```
Camera: `position: [0, 0.5, 6.0]`, `fov: 48`. Remove `BODY_SCALE`.

**JSX primitive (inside the group):**
```jsx
<primitive object={bodyScene} scale={1} rotation={[Math.PI/2, 0, 0]} />
<primitive object={headScene} scale={UNIT_SCALE} position={[0, HEAD_Y, 0]} />
```
`rotation={[Math.PI/2, 0, 0]}` is required for maleBody.glb — its coordinate transform is NOT baked into bones (unlike miiBodyMin.glb). Do NOT add this rotation for miiBodyMin.glb.

**Bone setup in useEffect (maleBody.glb-specific):**
- Get bones from `skinnedMesh.skeleton.bones` (not from bodyNodes) — UUIDs match for hip
- Set material per polygon: `polyColors = ['#5b9bd5', '#4a7c59', '#2171b5']` → polygon0/1/2 in traverse order
- Hide shadow: find bone named `shadow_model` in skeleton.bones → `scale.set(0.0001, 0.0001, 0.0001)`
- Store arm rest poses in a ref: `restArm.lY = bodyNodes['arm_l1'].rotation.y`, same for `arm_r1`
- Set `matrixAutoUpdate = true` on ALL scene objects (GLTFLoader r152+ sets it false)

**Bone animation in useFrame (maleBody.glb confirmed axes):**
```js
// Legs — rotation.z = forward/back swing
foot_l1.rotation.z =  stride    (stride = sin(t * WALK_SPEED) * amp)
foot_l2.rotation.z =  stride * 0.5
foot_r1.rotation.z = -stride
foot_r2.rotation.z = -stride * 0.5
// Torso twist
chest.rotation.z =  sin(t * WALK_SPEED) * 0.05
hip.rotation.z   = -sin(t * WALK_SPEED) * 0.03
// Arms — ALWAYS add delta to the stored rest rotation, NEVER set to 0
arm_l1.rotation.y = restArm.lY + delta
arm_r1.rotation.y = restArm.rY - delta
```
After bone mutations: `groupRef.current.updateMatrixWorld(true)` then `skeleton.update()`.

**Idle vs walk amplitude:** During walk-in use amp=0.28, during idle use amp=0.15 (smoother).

---

## Mii Channel (`src/components/MiiChannel.jsx`)

The "About Mii" channel panel. Uses `framer-motion` for the thought-bubble entrance and `@react-three/fiber` + `@react-three/drei` for the 3D Mii model.

### Current status (2026)

**Working in `MiiChannel`:**
- **Walk-in:** Manual leg cycle (thigh / calf / foot via quaternion pre-multiply with `LEG_REST_Q`) plus group motion from `WALK_ENTRY_MODE`. **`top` is the production walk** (constant scale, descends from `ENTRY_TOP_Y`); `side`, `depth`, and `skip` remain in code for experiments / regression checks but are not the tuned default.
- **Idle:** `Idle` clip with arm tracks stripped + per-frame arm poses from `ARM_DOWN_QUATERNIONS` (biceps get a slight extra X rotation so arms read clearly “down” at sides).
- **Look-around:** `look around` clip with arm tracks stripped; same arm locking as idle.
- **Wave:** One-shot on arrival; then crossfade to idle and exponential slerp toward `ARM_DOWN_QUATERNIONS`.
- Head (`/mii.glb`) parented to `head` bone; Mii Plaza floor canvas; **thought-bubble** UI + typewriter; drop shadow plane under character.
- **Thought bubble (Wii Sports–style):** `ABOUT_SENTENCES` array — short, scannable lines (intro, majors, grad date, work/build, interests, sign-off). **One sentence per beat** with fixed SVG cloud size (no vertical grow-as-you-type). **Typewriter:** variable timing (`TYPEWRITER_MS_PER_CHAR` + extra pause on `,.;:!?`). **Tail:** three separate circles (large → small) from cloud bottom-left; **smallest circle** is the anchor. **`MiiModel`** each `useFrame` (while bubble visible) projects `bodyNodes.head` + `THOUGHT_HEAD_LOCAL_OFFSET`, then adds `MII_CANVAS_TRANSLATE_X` + `THOUGHT_HEAD_SCREEN_NUDGE_X/Y` so HTML aligns with the CSS-shifted `<Canvas>`. Writes **`headBubbleScreenRef`**; **`SpeechBubble`** polls ~32 ms and only re-renders when the point moves. Fallback `THOUGHT_HEAD_FALLBACK_*` until first sample.
- **Canvas / HTML sync:** `MII_CANVAS_TRANSLATE_X` constant must match `translateX` on `<Canvas>` and the `+ MII_CANVAS_TRANSLATE_X` in the projection math.
- **Background extras:** `BACKGROUND_SLOT_POOL` + `BACKGROUND_CHARACTER_VARIANTS` feed randomized (shuffled) but safe placements; `BackgroundMii` supports optional `headUrl`, `headOffset`, `headScale`, `bodyScaleMul`, and per-character `outfitColors`.

**Resolved:** Wave hand vs head clipping is no longer an issue in the current setup.

**Next (planned):** See **§ Roadmap** (channels, Mii extras, audio/art/SFX, footer, hosting). The last `ABOUT_SENTENCES` line already teases résumé/projects-style content.

**Loader / mesh gotcha:** GLTF exposes a `body` skinned mesh without `skeleton`; the code hides it so `skeleton.update()` never runs on an invalid skin. The visible body is the mirrored skinned mesh.

**Coordinate reminder (legs):** Thighs sit near 180° around local Z; **pre-multiply** a small world-space X-axis swing quaternion with each leg bone’s rest quaternion. Calf bend uses negative X for lift; feet get a smaller matching X correction. Do not assign `bone.rotation.x = stride` on these bones.

---

### Confirmed facts about miiBodyMin.glb (inspected via Node.js buffer parse)

- 1 SkinnedMesh: `Cube.002` (no materials embedded — code must assign)
- 123 joints in skin `"Mii Armature"`, 4 bone weights per vertex (standard)
- 5 animations: `"baked mii animation"`, `"Idle"`, `"look around"`, `"wave"`, `"wave transition"` — each has 366 channels
- Bone chain root → COG → ctrl.torso → hip → spine.001 → spine.002 → neck → head
- **Coordinate transform is baked into root bone** as quaternion `[-0.7071,0,0,0.7071]` (-90° X). Do NOT add `rotation={[Math.PI/2,0,0]}` to `<primitive>` — the body already stands upright.
- Mesh Y bounds at scale 1.0: min=0 (feet at origin), max=0.9486 (neck/top). The channel applies `BODY_SCALE` (1.7) on the body `<primitive>`.
- Head bone world Y at rest pose: **0.9454** (informative). **Current channel:** `/mii.glb` is parented to the `head` bone with `scale = UNIT_SCALE / BODY_SCALE` and local position `(0, -0.075, 0)` — no separate `HEAD_Y` group offset. The failsafe `maleBody.glb` path still uses a fixed `HEAD_Y` on the head primitive.

**`baked mii animation` is NOT a walk cycle.** It is a 12.5s single-arm-wave/greeting animation. Only 1 leg swing occurs at ~t=1s and ~t=8-9s. Do NOT use it for walk-in. Walk must be done manually.

**Idle animation drives arms to raised Mii-plaza stance** (`bicep.L = [-0.189, 0.341, 0.006, 0.921]`). Arms at sides is the GLTF rest/bind pose, not the Idle pose. Arm tracks are stripped from Idle and look-around; `useFrame` then applies **`ARM_DOWN_QUATERNIONS`** every frame (with a defensive slerp after wave) so the visible pose stays correct even if track parsing misbehaves.

---

### GLTF rest quaternions (from binary node data, [x,y,z,w])

In code, `bodyNodes` keys are **camelCase** (`collarL`, `thighL`, …). `ARM_REST_QUATERNIONS` holds bind-pose arm quats; runtime idle / walk / look-around copy from **`ARM_DOWN_QUATERNIONS`**, which applies a fixed ~-1.18 rad X rotation on **biceps only** so arms read clearly at the sides. `LEG_REST_Q` keys match `thighL`, `calfL`, `footL`, etc.

```
collarL / collarR, bicepL / bicepR, forearmL / R, handL / R  ← see MiiChannel.jsx for floats
thighL / thighR, calfL / calfR, footL / footR                 ← leg rest for walk math
```

---

### Walk animation — how it works (manual, not from GLB)

The GLB has NO walk animation. Walk is fully manual in `useFrame`.

**Coordinate system (still useful when tuning legs):**
- Hip local axes in world: X=worldX (right), Y=worldY (up), Z=worldZ (toward camera)
- thighL rest ≈ 178° around hip -Z. At rest, thigh points world -Y (downward).
- thigh local axes (at rest): localX=world-X, localY=world-Y, localZ=world+Z
- calf rest = 40° rotation around thigh local -X (≈ world +X). Calf points (0,-0.766,-0.643) in world.
- Adding more calf -X rotation → calf direction (0,-cos(θ+δ),-sin(θ+δ)) → Y more positive = foot LIFTS UP ✓

**Walk cycle (current):** `stepPhase = t * walkSpeed` where `walkSpeed` is `WALK_SPEED` or `SKIP_WALK_SPEED` when `WALK_ENTRY_MODE === 'skip'`. Stride `sin(stepPhase)` drives asymmetric swing amplitude, knee lift (pow of positive half-wave), calf bend strength, foot X compensation, and light `spine001` twist. Keys use camelCase (`thighL`, not `thigh.L`).

```js
const stride = Math.sin(stepPhase)
const swing  = stride * (WALK_ENTRY_MODE === 'skip' ? 0.62 : 0.34)
const liftL  = Math.pow(Math.max(0, -stride), 1.8)
const liftR  = Math.pow(Math.max(0,  stride), 1.8)
const bendStrength = WALK_ENTRY_MODE === 'skip' ? 1.65 : 0.58
// ... multiplyQuaternions(axisAngle(X, swing), LEG_REST_Q.thighL), etc.
// calves: axisAngle(X, -bendL/R * bendStrength); feet: smaller +X correction
```

**Do NOT use `bone.rotation.x = stride`** — Euler decomposition interacts badly with bones that are near-180° Z-rotated.

**mirrorGeometryX:** implements `oppositeBoneName()` for both `.L`/`.R` suffixes and camelCase `*L`/`*R` tails so L/R skin indices remap correctly for this GLB.

---

### Arm state machine

Arms go through distinct states, each controlled in `useFrame`:

| State | Condition | What runs |
|-------|-----------|-----------|
| Walk-in | `!arrivedRef` | Mixer idle (torso; arm tracks stripped) + manual legs. Arms forced to `ARM_DOWN_QUATERNIONS` each frame (unless waving/restoring). |
| Waving | `wavingRef` | Wave clip drives the arm; no per-frame arm copy. |
| Restoring | `armRestoringRef` | Exponential slerp toward `ARM_DOWN_QUATERNIONS` (`exp(-delta * 5)` style). |
| Idle | arrived + not waving + not restoring + not look-around | `bone.quaternion.copy(ARM_DOWN_QUATERNIONS[name])` each frame. |
| Look-around | `lookAroundActiveRef` | Same arm copy as idle; look clip handles head/neck/spine only. |

`wavingRef` is set true at arrival, false in `mixer.finished` for the wave action.

---

### Current constants (`miiBodyMin.glb` — check `MiiChannel.jsx` for source of truth)
```js
WALK_SPEED = 6.2
SKIP_WALK_SPEED = 3.5
WALK_ENTRY_MODE = 'top'   // production; 'side' | 'depth' | 'skip' = test / legacy
UNIT_SCALE = 0.013
BODY_SCALE = 1.7
MII_BASE_Y = -1.5
ENTRY_TOP_Y = 1.9         // start height when mode is 'top'
SKIP_ENTRY_Y = 3.0        // start height when mode is 'skip'
ENTRY_X = -4.8            // start X when mode is 'side'
ENTRY_Z = -8.5            // start Z when mode is 'depth'
WALK_DURATION = 3.2
MII_BASE_X = 0
MII_BASE_Z = 0.35
MII_CAMERA_Z = 6.0 // used by background apparent-size compensation
BACKGROUND_SLOT_POOL // curated safe transforms for background extras
BACKGROUND_BLOCK_RADIUS = 2.05
BACKGROUND_MIN_PAIR_DISTANCE = 2.25
BACKGROUND_CHARACTER_VARIANTS // female+male variants (female head wired)
```
Camera (Canvas): `position: [0, 1.8, 6.0]`, `fov: 48`. `CameraAim` (lookAt tweak) is only mounted when `WALK_ENTRY_MODE === 'depth'`. The R3F `<Canvas>` uses `transform: translateX(${MII_CANVAS_TRANSLATE_X}px)` (same constant as projection).

### Floor (`MiiPlazaFloor`)
A `<canvas>` element draws `/assets/floor-quarter.png` mirrored into four quadrants. Radial white bloom at center. Working correctly.

### Thought bubble / typewriter (`SpeechBubble` in `MiiChannel.jsx`)

- **Trigger:** Framer-motion bubble fade-in `onAnimationComplete` starts typing; **`onArrived`** (speech bubble visibility) still comes from the wave mixer **`finished`** event.
- **Copy:** Edit the **`ABOUT_SENTENCES`** string array (not a single `ABOUT_TEXT`). Keep lines short for the fixed cloud **`THOUGHT_DISPLAY_W`** × **`THOUGHT_DISPLAY_H`**; text uses **`THOUGHT_TEXT_INSET`** % box + `overflow: hidden` + `word-break`.
- **Typewriter:** `TYPEWRITER_MS_PER_CHAR`, `TYPEWRITER_PAUSE_COMMA_MS`, `TYPEWRITER_PAUSE_SENTENCE_MS`; `onComplete` advances sentence index after **`BETWEEN_SENTENCES_MS`**.
- **Anchor tuning (in order):** (1) `THOUGHT_HEAD_LOCAL_OFFSET` (head-bone local), (2) `THOUGHT_HEAD_SCREEN_NUDGE_X/Y` (channel px after project), (3) SVG **`THOUGHT_TAIL_TIP_*`** / cloud path if the *shape* of the trail changes.

### Back button
`PillButton` at bottom center, label "Wii Menu", calls `onClose`.

---

## HenryMii (`src/components/HenryMii.jsx`)
Pure SVG Mii character used as the tile 0 preview icon in `ChannelGrid`. Props: `width` (default 100), `height` (default 170). Features brown hair, teal eyes, dark navy outfit, blush marks.

## PillButton (`src/components/PillButton.jsx`)
Pill-shaped button (546×148, borderRadius 170). Cyan border with inset silver shading. Hover adds cyan glow. Props: `label` (string), `onClick`.

---

## Key decisions / things that didn't work
- **CSS perspective floor**: Tried `rotateX` on a uniform grid — looked like a flat checkerboard, not the Wii circular pattern. Replaced by 4-quadrant image mirror which looks correct.
- **Three.js standalone**: Attempted early, had canvas sizing/camera issues. Removed. Re-added with `@react-three/fiber`.
- **Sprite sheet floor**: `mii-plaza.png` floor section is 285×317px — too low-res at 1920×1080 scale.
- **Mii character extraction**: `wii-menu-banner.png` Miis overlap each other, can't be cleanly cropped.
- **mii-unsecure.ariankordi.net full-body API**: Does not exist. Only head renders are available. Body endpoint returns 400. Do not pursue this for full-body rendering.
- **bodyScene.clone(true) for bounding box**: Causes WebGL context loss — GPU memory leak. Replace with hard-coded constant.
- **Direct bone.rotation without matrixAutoUpdate**: GLTFLoader r152+ sets `matrixAutoUpdate=false` on all nodes. Must set `obj.matrixAutoUpdate = true` on bones in useEffect before bone animation will work.
- **bone.rotation.x = stride for legs**: WRONG for miiBodyMin.glb. Bones are near-180° Z-rotated; Euler decomposition puts X in wrong world-space direction. Use quaternion pre-multiply: `multiplyQuaternions(Q.setFromAxisAngle(X, swing), LEG_REST_Q['thighL'])` (see `useFrame`).
- **`body` SkinnedMesh without skeleton**: hide it; only the mirrored skinned mesh should drive `skeleton.update()`.
- **Capturing arm rest quaternions from bodyNodes at runtime**: Unreliable — depends on animation timing, possible stale closure, possible missing nodes. Instead hardcode from GLTF binary data and apply defensively each frame.
- **baked mii animation as walk cycle**: NOT a walk cycle. It's a greeting/wave animation with 1 brief leg lift in 12.5s. Do not use for walk-in.
- **ARM_BONES_SET deformClip stripping alone for arm rest**: Theoretically correct but unreliable in practice — track name parsing or Three.js version differences may prevent stripping. Must enforce arms in useFrame as backup.
- **Thought bubble vs guessed pixel anchor:** Guessing `left`/`top` in channel space drifted from the real head once the canvas was `translateX`’d. Fix: **project `head` bone** each frame + **screen nudge** constants; keep `MII_CANVAS_TRANSLATE_X` in sync with the Canvas transform.
