import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js'

const client = new Client({ name: 'viper-user-picky-console', version: '1.0.0' })
const browserMcpUrl = process.env.BROWSER_MCP_URL ?? 'http://127.0.0.1:8935/sse'
const appUrl = process.env.DOGFOOD_URL ?? 'http://127.0.0.1:4180'

try {
  await client.connect(new SSEClientTransport(new URL(browserMcpUrl)))
  await client.callTool({ name: 'browser_navigate', arguments: { url: appUrl } })
  await client.callTool({ name: 'browser_wait_for', arguments: { time: 1 } })
  const result = await client.callTool({
    name: 'browser_console_messages',
    arguments: { level: 'error', all: false },
  })
  const output = result.content
    ?.filter((item) => item.type === 'text')
    .map((item) => item.text)
    .join('\n')
  console.log(output)
} finally {
  await client.close()
}
