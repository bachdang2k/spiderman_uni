import { expect, test, type Page } from '@playwright/test'

async function capture(page: Page, name: string) {
  await page.waitForTimeout(1_200)
  await page.screenshot({ path: `test-results/dogfood/${name}.png`, fullPage: false })
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(overflow, `${name} không được tràn ngang`).toBeLessThanOrEqual(1)
}

/** Every scene has to fit the viewport, or its bottom-anchored CTA lands below the fold. */
async function expectFitsViewport(page: Page, selector: string) {
  const overshoot = await page.evaluate((sel) => {
    const section = document.querySelector(sel)
    return section ? Math.round(section.getBoundingClientRect().height - innerHeight) : -1
  }, selector)
  expect(
    overshoot,
    `${selector} cao hơn viewport nên nút bị đẩy khỏi màn hình`,
  ).toBeLessThanOrEqual(1)
}

async function reachTheHeart(page: Page, prefix: string) {
  await page.locator('.web-target').click()
  await expect(page.locator('.scene-sense')).toBeVisible()
  await expectFitsViewport(page, '.scene-sense')
  await page.locator('.sense-object').nth(5).click()
  await page.locator('.scene-sense .continue').click()

  await expect(page.locator('.scene-wonder')).toBeVisible()
  await expectFitsViewport(page, '.scene-wonder')
  await page.locator('.heroine-button').click()
  await expect(page.locator('.scene-wonder .continue')).toBeVisible()
  await capture(page, `${prefix}-02-wonder`)
  await page.locator('.scene-wonder .continue').click()

  await expect(page.locator('.scene-cosmos')).toBeVisible()
  await expectFitsViewport(page, '.scene-cosmos')
  await capture(page, `${prefix}-03-cosmos-six`)
  const galaxy = await page.locator('.galaxy-button').boundingBox()
  const viewport = page.viewportSize()
  expect(galaxy).not.toBeNull()
  expect(viewport).not.toBeNull()
  expect(galaxy!.x).toBeGreaterThanOrEqual(-1)
  expect(galaxy!.x + galaxy!.width).toBeLessThanOrEqual(viewport!.width + 1)
  const starCount = Number(await page.locator('.galaxy-morph').getAttribute('data-star-count'))
  expect(starCount).toBeGreaterThanOrEqual(5_000)

  // Touching the six is the last interaction; the ending runs on from there by itself.
  await page.locator('.galaxy-button').click()
  await expect(page.locator('.scene-cosmos .continue')).toHaveCount(0)
  await expect(page.locator('.scene-heart')).toBeVisible({ timeout: 20_000 })
  await capture(page, `${prefix}-04-heart-inherited-l`)
}

test('design dogfood — the six, the heart, the name and the question', async ({
  page,
}, testInfo) => {
  const browserErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text())
  })
  page.on('pageerror', (error) => browserErrors.push(error.message))
  await page.goto('/')
  await capture(page, `${testInfo.project.name}-00-web`)
  await reachTheHeart(page, testInfo.project.name)

  await page.waitForFunction(() => 'heartSequence' in window, null, { timeout: 40_000 })
  const particles = Number(await page.locator('.heart-writing').getAttribute('data-particles'))
  expect(particles).toBeGreaterThanOrEqual(30_000)

  // Named by the sequence itself, so retiming a phase moves the captures with it.
  const beats = await page.evaluate(() => window.heartSequence.beats())
  for (const [name, at] of Object.entries(beats)) {
    await page.evaluate((seconds) => window.heartSequence.seek(seconds), at)
    await capture(page, `${testInfo.project.name}-${name}`)
  }

  // Both lines reach assistive technology as real text, her name with its marks intact.
  await expect(page.locator('.scene-heart .sr-only').first()).toHaveText('Diệu Linh')
  await expect(page.locator('.scene-heart .sr-only').nth(1)).toHaveText(
    'Would you watch the sunset with me?',
  )
  // The last frame holds and asks for nothing: no button, no progress, no toggle.
  await expect(page.locator('.scene-heart button')).toHaveCount(0)
  await expect(page.locator('.scene-heart .progress')).toHaveCount(0)
  await expect(page.locator('.sound-toggle')).toHaveCount(0)

  expect(browserErrors).toEqual([])
})

test('reduced motion and keyboard keep the complete story reachable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.locator('.web-target').focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('.scene-sense')).toBeVisible({ timeout: 1_500 })
  await page.locator('.sense-object').nth(5).focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('.scene-sense .continue')).toBeVisible()
  await page.locator('.scene-sense .continue').click()

  await page.locator('.heroine-button').click()
  await page.locator('.scene-wonder .continue').click()
  await page.locator('.galaxy-button').click()

  await expect(page.locator('.scene-heart')).toBeVisible({ timeout: 10_000 })
  await page.waitForFunction(() => 'heartSequence' in window, null, { timeout: 40_000 })
  // Reduced motion still ends on both lines, complete and non-blank.
  await page.evaluate(() => window.heartSequence.seek(3.4))
  await page.waitForTimeout(400)
  const lit = await page.evaluate(() => {
    const canvas = document.querySelector('.heart-writing canvas') as HTMLCanvasElement
    return canvas.width > 0 && canvas.height > 0
  })
  expect(lit).toBe(true)
  await expect(page.locator('.scene-heart .sr-only').first()).toHaveText('Diệu Linh')
})

test('a browser without WebGL still gets the whole ending, uncropped', async ({ page }) => {
  // Deny every WebGL context so the renderer's construction throws, exactly as an old
  // machine or a blocklisted driver would.
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (type: string, ...rest: unknown[]) {
      if (typeof type === 'string' && type.startsWith('webgl')) return null
      return (getContext as (...args: unknown[]) => unknown).call(this, type, ...rest)
    }
  })
  await page.goto('/')
  await reachTheHeart(page, 'fallback')

  const mount = page.locator('.heart-writing')
  // The attributes have to describe the frame on screen, not the one that was attempted.
  await expect(mount).toHaveAttribute('data-renderer', 'svg-fallback')
  await expect(mount).not.toHaveAttribute('data-particles', /.+/)
  await expect(page.locator('.scene-heart canvas')).toHaveCount(0)

  // A fixed viewBox used to crop the question's last line the moment the viewport went wide.
  const cropped = await page.evaluate(() => {
    const svg = document.querySelector('.heart-fallback') as SVGSVGElement
    const ink = svg.getBBox()
    const view = svg.viewBox.baseVal
    return (
      ink.x < view.x - 0.01 ||
      ink.y < view.y - 0.01 ||
      ink.x + ink.width > view.x + view.width + 0.01 ||
      ink.y + ink.height > view.y + view.height + 0.01
    )
  })
  expect(cropped, 'nét chữ của fallback bị cắt ngoài viewBox').toBe(false)

  await expect(page.locator('.scene-heart .sr-only').first()).toHaveText('Diệu Linh')
  await expect(page.locator('.scene-heart button')).toHaveCount(0)
})

test('a GPU without half-float colour buffers falls back instead of going blank', async ({
  page,
}) => {
  // WebGL2 works, but the trail buffer and bloom chain are not renderable. This used to paint
  // nothing at all — no exception, no console error, an empty ending.
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (type: string, ...rest: unknown[]) {
      const ctx = (getContext as (...args: unknown[]) => unknown).call(this, type, ...rest)
      if (ctx && typeof type === 'string' && type.startsWith('webgl')) {
        const context = ctx as WebGL2RenderingContext
        const getExtension = context.getExtension.bind(context)
        context.getExtension = ((name: string) =>
          name === 'EXT_color_buffer_half_float' || name === 'EXT_color_buffer_float'
            ? null
            : getExtension(name)) as typeof context.getExtension
      }
      return ctx
    }
  })
  await page.goto('/')
  await reachTheHeart(page, 'half-float')

  await expect(page.locator('.heart-writing')).toHaveAttribute('data-renderer', 'svg-fallback')
  await expect(page.locator('.scene-heart canvas')).toHaveCount(0)
  const ink = await page.evaluate(() => {
    const svg = document.querySelector('.heart-fallback') as SVGSVGElement
    const box = svg.getBBox()
    return { width: box.width, height: box.height, strokes: svg.querySelectorAll('path').length }
  })
  expect(ink.strokes, 'fallback phải vẽ đủ nét').toBeGreaterThan(10)
  expect(ink.width * ink.height, 'fallback không được rỗng').toBeGreaterThan(0)
})
