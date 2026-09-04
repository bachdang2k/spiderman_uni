import { expect, test, type Page } from '@playwright/test'

async function capture(page: Page, name: string) {
  await page.waitForTimeout(1_800)
  await page.screenshot({ path: `test-results/dogfood/${name}.png`, fullPage: false })
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(overflow, `${name} không được tràn ngang`).toBeLessThanOrEqual(1)
}

async function advanceToFinal(page: Page, prefix: string) {
  await page.locator('.web-target').click()
  await expect(page.locator('.scene-sense')).toBeVisible()
  await page.locator('.sense-object').nth(5).click()
  await page.locator('.scene-sense .continue').click()

  await expect(page.locator('.scene-wonder')).toBeVisible()
  await page.locator('.heroine-button').click()
  await capture(page, `${prefix}-02-wonder`)
  await page.locator('.scene-wonder .continue').click()

  await expect(page.locator('.scene-cosmos')).toBeVisible()
  await capture(page, `${prefix}-03-cosmos-6`)
  const galaxy = await page.locator('.galaxy-button').boundingBox()
  const viewport = page.viewportSize()
  expect(galaxy).not.toBeNull()
  expect(viewport).not.toBeNull()
  expect(galaxy!.x).toBeGreaterThanOrEqual(-1)
  expect(galaxy!.x + galaxy!.width).toBeLessThanOrEqual(viewport!.width + 1)
  const starCount = Number(await page.locator('.galaxy-morph').getAttribute('data-star-count'))
  expect(starCount).toBeGreaterThanOrEqual(5_000)
  await page.locator('.galaxy-button').click()
  await capture(page, `${prefix}-03-cosmos-sand`)
  await expect(page.locator('.scene-cosmos .continue')).toBeVisible({ timeout: 5_000 })
  await capture(page, `${prefix}-03-cosmos-l`)
  await page.locator('.scene-cosmos .continue').click()

  await expect(page.locator('.scene-rain')).toBeVisible()
  await page.locator('.rain-button').click()
  await capture(page, `${prefix}-04-rain`)
  await page.locator('.scene-rain .continue').click()

  await expect(page.locator('.scene-butterfly')).toBeVisible()
  await expect(page.locator('.scene-butterfly .continue')).toBeVisible({ timeout: 12_000 })
  await capture(page, `${prefix}-05-sakura-name`)
  await page.locator('.scene-butterfly .continue').click()

  await expect(page.locator('.scene-mystery')).toBeVisible()
  await page.locator('.mystery-button').click()
  await capture(page, `${prefix}-06-mystery`)
  await page.locator('.scene-mystery .continue').click()

  await expect(page.locator('.scene-final-invite')).toBeVisible()
  await page.waitForTimeout(1_200)
  await capture(page, `${prefix}-07-invitation`)
  await page.locator('.sunset-answer').click()
  await expect(page.locator('.sunset-after')).toBeVisible()
  await capture(page, `${prefix}-08-sunset`)
}

test('design dogfood — full cosmic path', async ({ page }, testInfo) => {
  const browserErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text())
  })
  page.on('pageerror', (error) => browserErrors.push(error.message))
  await page.goto('/')
  await capture(page, `${testInfo.project.name}-00-web`)
  await advanceToFinal(page, testInfo.project.name)
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
  await page.locator('.scene-cosmos .continue').click()
  await page.locator('.rain-button').click()
  await page.locator('.scene-rain .continue').click()

  await expect(page.locator('.scene-butterfly .continue')).toBeVisible({ timeout: 2_000 })
  await expect(page.locator('.sakura-name-fallback')).toHaveCSS('opacity', '0.92')
  await expect(page.locator('.sakura-name-reveal canvas')).toHaveCSS('opacity', '0')
  await page.locator('.scene-butterfly .continue').click()

  await page.locator('.mystery-button').click()
  await page.locator('.scene-mystery .continue').click()
  await expect(page.locator('.scene-final-invite')).toBeVisible()
})
