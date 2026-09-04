import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js'

const client = new Client({ name: 'viper-galaxy-compare', version: '1.0.0' })
const browserMcpUrl = process.env.BROWSER_MCP_URL ?? 'http://127.0.0.1:8935/sse'
const appUrl = process.env.DOGFOOD_URL ?? 'http://127.0.0.1:4180'
const referenceUrl = new URL('/src/assets/references/Screenshot 2026-09-04 at 13.43.54.png', appUrl)
  .href

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

async function click(target, settle = 1) {
  await call('browser_click', { target, element: target })
  await call('browser_wait_for', { time: settle })
}

try {
  await client.connect(new SSEClientTransport(new URL(browserMcpUrl)))
  await call('browser_resize', { width: 1280, height: 800 })

  await call('browser_navigate', { url: referenceUrl })
  await call('browser_wait_for', { time: 1 })
  await call('browser_take_screenshot', {
    filename: 'galaxy-reference-mcp.png',
    fullPage: false,
    scale: 'css',
  })
  console.log('REFERENCE_FIRST')
  console.log(
    await call('browser_evaluate', {
      function: `() => {
        const image = document.images[0]
        const box = image?.getBoundingClientRect()
        return {
          url: location.href,
          viewport: { width: innerWidth, height: innerHeight },
          image: image && {
            naturalWidth: image.naturalWidth,
            naturalHeight: image.naturalHeight,
            ratio: image.naturalWidth / image.naturalHeight,
            rendered: box && { x: box.x, y: box.y, width: box.width, height: box.height },
          },
        }
      }`,
    }),
  )

  await call('browser_navigate', { url: appUrl })
  await call('browser_wait_for', { time: 1 })
  await click('.web-target', 2.3)
  await click('.sense-object:nth-child(6)', 0.3)
  await click('.scene-sense .continue', 1.8)
  await click('.heroine-button', 0.8)
  await click('.scene-wonder .continue', 2)
  await call('browser_wait_for', { time: 1.5 })
  await call('browser_take_screenshot', {
    filename: 'galaxy-current-mcp.png',
    fullPage: false,
    scale: 'css',
  })
  console.log('CURRENT_AFTER_REFERENCE')
  console.log(
    await call('browser_evaluate', {
      function: `() => {
        const stage = document.querySelector('.galaxy-button')?.getBoundingClientRect()
        const canvas = document.querySelector('.galaxy-morph canvas')
        return {
          viewport: { width: innerWidth, height: innerHeight },
          activeScene: document.querySelector('.is-active')?.id,
          overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          stage: stage && { x: stage.x, y: stage.y, width: stage.width, height: stage.height },
          canvas: canvas && { width: canvas.width, height: canvas.height },
          renderer: document.querySelector('.galaxy-morph')?.getAttribute('data-renderer'),
          stars: document.querySelector('.galaxy-morph')?.getAttribute('data-star-count'),
        }
      }`,
    }),
  )
  await click('.galaxy-button', 1.5)
  await call('browser_take_screenshot', {
    filename: 'galaxy-sand-morph-mcp.png',
    fullPage: false,
    scale: 'css',
  })
  await call('browser_wait_for', { time: 2.5 })
  await call('browser_take_screenshot', {
    filename: 'galaxy-letter-l-mcp.png',
    fullPage: false,
    scale: 'css',
  })
  console.log('MORPH_COMPLETE')
  console.log(
    await call('browser_evaluate', {
      function: `() => ({
        activeScene: document.querySelector('.is-active')?.id,
        continueVisible: Boolean(document.querySelector('.scene-cosmos .continue')),
        quote: document.querySelector('.quote-universe')?.textContent,
      })`,
    }),
  )
  await call('browser_resize', { width: 390, height: 844 })
  await call('browser_navigate', { url: appUrl })
  await call('browser_wait_for', { time: 1 })
  await click('.web-target', 2.3)
  await click('.sense-object:nth-child(6)', 0.3)
  await click('.scene-sense .continue', 1.8)
  await click('.heroine-button', 0.8)
  await click('.scene-wonder .continue', 2)
  await call('browser_wait_for', { time: 1.5 })
  await call('browser_take_screenshot', {
    filename: 'galaxy-current-mobile-mcp.png',
    fullPage: false,
    scale: 'css',
  })
  console.log('CURRENT_MOBILE')
  console.log(
    await call('browser_evaluate', {
      function: `() => {
        const stage = document.querySelector('.galaxy-button')?.getBoundingClientRect()
        const canvas = document.querySelector('.galaxy-morph canvas')
        return {
          viewport: { width: innerWidth, height: innerHeight },
          overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          stage: stage && { x: stage.x, y: stage.y, width: stage.width, height: stage.height },
          canvas: canvas && { width: canvas.width, height: canvas.height },
          stars: document.querySelector('.galaxy-morph')?.getAttribute('data-star-count'),
        }
      }`,
    }),
  )
  console.log('CONSOLE')
  console.log(await call('browser_console_messages', { level: 'error', all: true }))
} finally {
  await client.close()
}
