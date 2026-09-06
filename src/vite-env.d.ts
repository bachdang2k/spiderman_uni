/// <reference types="vite/client" />

declare global {
  interface Window {
    /**
     * Deterministic driver for the closing sequence: an injected timestep instead of the wall
     * clock, so a capture or a test lands on an exact beat. Present once the scene has built.
     */
    heartSequence?: {
      duration: () => number
      seek: (seconds: number, step?: number) => void
      resume: () => void
    }
  }
}

export {}
