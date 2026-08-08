// Usage: node screenshot.mjs <url> [output-name] [--viewport=WxH] [--no-full-page]
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const screenshotsDir = path.join(__dirname, 'screenshots')
mkdirSync(screenshotsDir, { recursive: true })

const args = process.argv.slice(2)
const url = args.find((a) => !a.startsWith('--'))
const positional = args.filter((a) => !a.startsWith('--'))
const outputName = positional[1]
const viewportArg = args.find((a) => a.startsWith('--viewport='))
const fullPage = !args.includes('--no-full-page')

if (!url) {
  console.error('Usage: node screenshot.mjs <url> [output-name] [--viewport=WxH] [--no-full-page]')
  process.exit(1)
}

let width = 1280
let height = 800
if (viewportArg) {
  const [w, h] = viewportArg.split('=')[1].split('x').map(Number)
  if (w) width = w
  if (h) height = h
}

const safeName =
  outputName ??
  url
    .replace(/^https?:\/\//, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)

const outputPath = path.join(screenshotsDir, `${safeName}.png`)

const browser = await chromium.launch()
try {
  const page = await browser.newPage({ viewport: { width, height } })
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
  await page.screenshot({ path: outputPath, fullPage })
  console.log(outputPath)
} finally {
  await browser.close()
}
