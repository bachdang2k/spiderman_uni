/**
 * Captures the frames the motion direction asks to be reviewed by eye, plus the two degraded
 * paths that are otherwise impossible to see: a browser with no WebGL, and a GPU that cannot
 * render half-float colour buffers.
 *
 * Needs the dev server up:  make dev
 * Then:                     node scripts/capture-evidence.mjs
 *
 * Output lands in docs/evidence/, which is gitignored — these are regenerable artifacts, not
 * source. Frame timings follow the beat map in context/STATE.md.
 */
import { chromium } from '@playwright/test'
import { mkdir } from 'node:fs/promises'

const APP_URL = process.env.EVIDENCE_URL ?? 'http://127.0.0.1:4180'
const OUT = 'docs/evidence'

/** Denies a class of GPU capability so the drawn fallback can be photographed. */
const DENY = {
  webgl: () => {
    const getContext = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
      if (typeof type === 'string' && type.startsWith('webgl')) return null
      return getContext.call(this, type, ...rest)
    }
  },
  halfFloat: () => {
    const getContext = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
      const ctx = getContext.call(this, type, ...rest)
      if (ctx && typeof type === 'string' && type.startsWith('webgl')) {
        const getExtension = ctx.getExtension.bind(ctx)
        ctx.getExtension = (name) =>
          name === 'EXT_color_buffer_half_float' || name === 'EXT_color_buffer_float'
            ? null
            : getExtension(name)
      }
      return ctx
    }
  },
}

async function reachTheHeart(page) {
  await page.goto(APP_URL)
  await page.locator('.web-target').click()
  await page.locator('.sense-object').nth(5).click()
  await page.locator('.scene-sense .continue').click()
  await page.locator('.heroine-button').click()
  await page.locator('.scene-wonder .continue').click()
  await page.locator('.galaxy-button').click()
  await page.locator('.scene-heart').waitFor({ timeout: 40_000 })
  await page
    .waitForFunction(
      () => 'heartSequence' in window || document.querySelector('.heart-writing.is-fallback'),
      null,
      { timeout: 40_000 },
    )
    .catch(() => {})
}

async function shoot(browser, { tag, width, height, deny, beats, stopAtCosmos }) {
  const context = await browser.newContext({
    viewport: { width, height },
    reducedMotion: 'no-preference',
  })
  const page = await context.newPage()
  if (deny) await page.addInitScript(DENY[deny])

  if (stopAtCosmos) {
    await page.goto(APP_URL)
    await page.locator('.web-target').click()
    await page.locator('.sense-object').nth(5).click()
    await page.locator('.scene-sense .continue').click()
    await page.locator('.heroine-button').click()
    await page.locator('.scene-wonder .continue').click()
    await page.locator('.scene-cosmos').waitFor()
    await page.waitForTimeout(2_500)
    await page.screenshot({ path: `${OUT}/${tag}.png` })
    console.log(tag)
    await context.close()
    return
  }

  await reachTheHeart(page)
  const meta = await page.evaluate(() => ({
    renderer: document.querySelector('.heart-writing').dataset.renderer ?? 'svg-fallback',
    particles: document.querySelector('.heart-writing').dataset.particles ?? null,
  }))
  const marks = await page.evaluate(() => window.heartSequence?.beats() ?? null)
  for (const name of beats) {
    if (marks) await page.evaluate((t) => window.heartSequence.seek(t), marks[name] ?? 0)
    await page.waitForTimeout(450)
    await page.screenshot({ path: `${OUT}/${tag}-${name}.png` })
  }
  console.log(tag, JSON.stringify(meta))
  await context.close()
}

await mkdir(OUT, { recursive: true })
const browser = await chromium.launch()
try {
  await shoot(browser, { tag: '1280-galaxy-six', width: 1280, height: 800, stopAtCosmos: true })
  await shoot(browser, {
    tag: '1280',
    width: 1280,
    height: 800,
    beats: ['dissolve', 'nameAlone', 'bothLines'],
  })
  await shoot(browser, { tag: '390', width: 390, height: 844, beats: ['bothLines'] })
  await shoot(browser, { tag: '360', width: 360, height: 640, beats: ['bothLines'] })
  await shoot(browser, {
    tag: '1280-webgl-fallback',
    width: 1280,
    height: 800,
    deny: 'webgl',
    beats: ['frame'],
  })
  await shoot(browser, {
    tag: '1280-halffloat-fallback',
    width: 1280,
    height: 800,
    deny: 'halfFloat',
    beats: ['frame'],
  })
} finally {
  await browser.close()
}
