import { useCallback, useMemo, useState } from 'react'
import { Howl, Howler } from 'howler'
import { STORY_CONFIG } from '../config/story'

function wavData(frequency: number, duration = 0.12) {
  const rate = 8000,
    samples = Math.floor(rate * duration),
    bytes = 44 + samples * 2
  const buffer = new ArrayBuffer(bytes),
    view = new DataView(buffer)
  const write = (offset: number, value: string) =>
    [...value].forEach((c, i) => view.setUint8(offset + i, c.charCodeAt(0)))
  write(0, 'RIFF')
  view.setUint32(4, bytes - 8, true)
  write(8, 'WAVEfmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, rate, true)
  view.setUint32(28, rate * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  write(36, 'data')
  view.setUint32(40, samples * 2, true)
  for (let i = 0; i < samples; i++) {
    const fade = 1 - i / samples
    const value = Math.sin((i / rate) * Math.PI * 2 * frequency) * fade * fade * 0.45
    view.setInt16(44 + i * 2, value * 32767, true)
  }
  let binary = ''
  new Uint8Array(buffer).forEach((b) => {
    binary += String.fromCharCode(b)
  })
  return `data:audio/wav;base64,${btoa(binary)}`
}

export function useSound() {
  const [enabled, setEnabled] = useState<boolean>(STORY_CONFIG.audio.enabledByDefault)
  const sounds = useMemo(
    () => ({
      click: new Howl({ src: [wavData(520, 0.08)], volume: 0.18 }),
      thwip: new Howl({ src: [wavData(170, 0.18)], volume: 0.25, rate: 1.5 }),
      bloom: new Howl({ src: [wavData(660, 0.45)], volume: 0.16 }),
      cosmic: new Howl({ src: [wavData(310, 0.7)], volume: 0.1 }),
      reveal: new Howl({ src: [wavData(440, 1.1)], volume: 0.14 }),
    }),
    [],
  )
  Howler.volume(STORY_CONFIG.audio.volume)
  const play = useCallback(
    (name: keyof typeof sounds) => {
      if (enabled) sounds[name].play()
    },
    [enabled, sounds],
  )
  const toggle = useCallback(() => {
    setEnabled((v) => {
      if (!v) sounds.click.play()
      return !v
    })
  }, [sounds])
  return { enabled, toggle, play }
}
