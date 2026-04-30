/**
 * Mii / menu UI sounds — files live in `public/audio/` (see copy names below).
 * If a sting is wrong (e.g. channel vs thought), swap `channel-select.mp3` and `thought-bubble-appear.wav` in /public/audio/.
 */

const URL = {
  channelSelect: '/audio/channel-select.mp3',
  thoughtAppear: '/audio/thought-bubble-appear.wav',
  footLeft: '/audio/footstep-left.mp3',
  footRight: '/audio/footstep-right.mp3',
  bgm: '/audio/mii-plaza-bgm.mp3',
}

function playOneShot(src, volume) {
  try {
    const a = new Audio(src)
    a.volume = volume
    void a.play().catch(() => {})
  } catch (_) {}
}

export function playChannelSelectSound() {
  playOneShot(URL.channelSelect, 0.62)
}

export function playThoughtBubbleAppearSound() {
  playOneShot(URL.thoughtAppear, 0.52)
}

export function playFootstepLeft() {
  playOneShot(URL.footLeft, 0.48)
}

export function playFootstepRight() {
  playOneShot(URL.footRight, 0.48)
}

/** Looping plaza BGM — caller owns lifecycle (play on mount, pause + drop on unmount). */
export function createMiiPlazaBgm() {
  const a = new Audio(URL.bgm)
  a.loop = true
  a.volume = 0.3
  return a
}
