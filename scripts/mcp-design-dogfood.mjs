import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const browserMcpUrl = process.env.BROWSER_MCP_URL ?? 'http://127.0.0.1:8935/sse'
const appUrl = process.env.DOGFOOD_URL ?? 'http://127.0.0.1:4180'
const client = new Client({ name: 'viper-user-picky', version: '1.0.0' })
const evidenceDir = join(process.cwd(), 'artifacts', 'dogfood')

function textFrom(result) {
  return result.content
    ?.filter((item) => item.type === 'text')
    .map((item) => item.text)
    .join('\n')
}

async function call(name, args = {}) {
  const result = await client.callTool({ name, arguments: args })
  if (result.isError) throw new Error(`${name}: ${textFrom(result)}`)
  return textFrom(result)
}

async function wait(seconds) {
  await call('browser_wait_for', { time: seconds })
}

async function screenshot(name) {
  const result = await client.callTool({
    name: 'browser_take_screenshot',
    arguments: {
      filename: name,
      fullPage: false,
      scale: 'css',
    },
  })
  if (result.isError) throw new Error(`browser_take_screenshot: ${textFrom(result)}`)
  const shot = result.content?.find((item) => item.type === 'image')
  if (shot?.data) {
    await mkdir(evidenceDir, { recursive: true })
    await writeFile(join(evidenceDir, name), Buffer.from(shot.data, 'base64'))
  }
}

async function click(target, settle = 1.8) {
  await call('browser_click', { target, element: target })
  await wait(settle)
}

async function measureCompactViewport() {
  return call('browser_evaluate', {
    function: `() => {
      const h1 = document.querySelector('.star-invitation h1')?.getBoundingClientRect()
      const cta = document.querySelector('.sunset-answer')?.getBoundingClientRect()
      return {
        viewport: { width: innerWidth, height: innerHeight },
        overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        invitation: h1 && { x: h1.x, y: h1.y, width: h1.width, height: h1.height },
        cta: cta && { x: cta.x, y: cta.y, width: cta.width, height: cta.height },
      }
    }`,
  })
}

async function runStory(prefix) {
  await screenshot(`${prefix}-00-web.png`)
  await click('.web-target', 3.2)
  await screenshot(`${prefix}-01-sense.png`)
  await click('.sense-object:nth-child(6)', 0.4)
  await click('.scene-sense .continue', 2.4)
  await click('.heroine-button', 1.8)
  await screenshot(`${prefix}-02-wonder.png`)
  await click('.scene-wonder .continue', 2.4)
  await screenshot(`${prefix}-03-cosmos-six.png`)
  // Touching the six is the last interaction; everything after it runs on by itself.
  await click('.galaxy-button', 8.4)
  await screenshot(`${prefix}-04-heart-inherited-l.png`)
  await call('browser_evaluate', {
    function: `async () => {
      const until = Date.now() + 40000
      while (!('heartSequence' in window) && Date.now() < until) {
        await new Promise((resolve) => setTimeout(resolve, 150))
      }
      return 'heartSequence' in window
    }`,
  })
  for (const [name, at] of Object.entries({
    '05-heart-hold': 4.8,
    '06-mid-dissolve': 7.8,
    '07-name-alone': 18.6,
    '08-both-lines': 26.8,
  })) {
    await call('browser_evaluate', {
      function: `() => window.heartSequence.seek(${at})`,
    })
    await screenshot(`${prefix}-${name}.png`)
  }

  return call('browser_evaluate', {
    function: `() => {
      const selectors = ['.scene-heart .heart-writing', '.scene-heart .sr-only', '.scene-heart button']
      const styles = selectors.map(selector => {
        const element = document.querySelector(selector)
        if (!element) return { selector, missing: true }
        const box = element.getBoundingClientRect()
        const style = getComputedStyle(element)
        return {
          selector,
          box: { x: box.x, y: box.y, width: box.width, height: box.height },
          color: style.color,
          background: style.backgroundColor,
          fontFamily: style.fontFamily,
          fontSize: style.fontSize,
          opacity: style.opacity,
        }
      })
      return {
        viewport: { width: innerWidth, height: innerHeight },
        activeScene: document.querySelector('.is-active')?.id,
        overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        styles,
      }
    }`,
  })
}

try {
  await client.connect(new SSEClientTransport(new URL(browserMcpUrl)))

  await call('browser_resize', { width: 1280, height: 800 })
  await call('browser_navigate', { url: appUrl })
  await wait(1.8)
  const desktopEvidence = await runStory('picky-mcp-desktop')

  await call('browser_resize', { width: 390, height: 844 })
  await call('browser_navigate', { url: appUrl })
  await wait(1.2)
  const mobileEvidence = await runStory('picky-mcp-mobile')

  await call('browser_resize', { width: 360, height: 640 })
  await wait(0.5)
  const compactEvidence = await measureCompactViewport()
  await call('browser_resize', { width: 844, height: 390 })
  await wait(0.5)
  const landscapeEvidence = await measureCompactViewport()

  const consoleEvidence = await call('browser_console_messages', { level: 'error', all: true })
  console.log('DESKTOP_EVIDENCE')
  console.log(desktopEvidence)
  console.log('MOBILE_EVIDENCE')
  console.log(mobileEvidence)
  console.log('CONSOLE_EVIDENCE')
  console.log(consoleEvidence)
  console.log('COMPACT_EVIDENCE')
  console.log(compactEvidence)
  console.log('LANDSCAPE_EVIDENCE')
  console.log(landscapeEvidence)
} finally {
  await client.close()
}
