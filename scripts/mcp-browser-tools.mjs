import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js'

const browserMcpUrl = process.env.BROWSER_MCP_URL ?? 'http://127.0.0.1:8935/sse'
const client = new Client({ name: 'linh-chu-dogfood', version: '1.0.0' })

try {
  await client.connect(new SSEClientTransport(new URL(browserMcpUrl)))
  const { tools } = await client.listTools()
  for (const tool of tools) {
    console.log(`\n${tool.name}`)
    console.log(JSON.stringify(tool.inputSchema, null, 2))
  }
} finally {
  await client.close()
}
