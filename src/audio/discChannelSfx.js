const URL = {
  openChime: '/audio/disc-channel-open-chime.wav',
  search: '/audio/disc-channel-search.wav',
  noDiscTone: '/audio/disc-channel-no-disc-tone.wav',
  arrow: '/audio/disc-channel-arrow.wav',
  select: '/audio/disc-channel-select.wav',
  start: '/audio/disc-channel-start.wav',
}

function playOneShot(src, volume = 0.45) {
  try {
    const audio = new Audio(src)
    audio.volume = volume
    void audio.play().catch(() => {})
    return audio
  } catch (_) {
    return null
  }
}

export function playDiscChannelOpenSound() {
  playOneShot(URL.openChime, 0.3)
}

export function scheduleDiscChannelOpenSound(delayMs = 420) {
  const id = window.setTimeout(() => {
    playDiscChannelOpenSound()
  }, delayMs)
  return () => window.clearTimeout(id)
}

export function playDiscChannelArrowSound() {
  playOneShot(URL.arrow, 0.22)
}

export function playDiscChannelSelectSound() {
  playOneShot(URL.select, 0.26)
}

export function playDiscChannelStartSound() {
  playOneShot(URL.start, 0.32)
}
