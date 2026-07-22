import * as esbuild from 'esbuild'
import { readFileSync, writeFileSync, cpSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'

const args = process.argv.slice(2)
const watchMode = args.includes('--watch')
const targetArg = args.find(a => a.startsWith('--target='))
const target = targetArg ? targetArg.split('=')[1] : 'all'

const VERSION = JSON.parse(readFileSync('package.json', 'utf8')).version

const userscriptBanner = `// ==UserScript==
// @name         CREA-GO OTP Autofill
// @version      ${VERSION}
// @description  Preenchimento automático de OTP para o portal CREANET
// @match        https://creanet.crea-go.org.br/usuario/valida-login
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_listValues
// @grant        GM_addStyle
// @connect      script.google.com
// @run-at       document-start
// @homepageURL  https://github.com/qgustavor/crea-otp-autofill
// @supportURL   https://github.com/qgustavor/crea-otp-autofill/issues
// @license      MIT
// ==/UserScript==
`

const distDir = 'dist'

async function buildUserscript () {
  const result = await esbuild.build({
    entryPoints: ['src/userscript/entry.js'],
    bundle: true,
    format: 'iife',
    write: false,
    target: 'es2020',
    define: {
      __VERSION__: JSON.stringify(VERSION),
      __BUILD_TARGET__: JSON.stringify('userscript')
    }
  })

  mkdirSync(join(distDir, 'userscript'), { recursive: true })
  const code = userscriptBanner + '\n' + result.outputFiles[0].text
  writeFileSync(join(distDir, 'userscript', 'crea-otp-autofill.user.js'), code)
  console.log('[userscript] built → dist/userscript/crea-otp-autofill.user.js')
}

async function buildExtension () {
  const outDir = join(distDir, 'extension')
  mkdirSync(outDir, { recursive: true })

  await esbuild.build({
    entryPoints: ['src/extension/content.js'],
    bundle: true,
    format: 'iife',
    outfile: join(outDir, 'content.js'),
    target: 'es2020',
    define: {
      __VERSION__: JSON.stringify(VERSION),
      __BUILD_TARGET__: JSON.stringify('extension')
    }
  })

  // Copy extension static files
  const staticFiles = ['manifest.json', 'icons']
  for (const file of staticFiles) {
    const src = join('src/extension', file)
    if (existsSync(src)) {
      cpSync(src, join(outDir, file), { recursive: true })
    }
  }

  // Inject current version in the extension's manifest
  const manifestPath = join(outDir, 'manifest.json')
  if (existsSync(manifestPath)) {
    let manifest = readFileSync(manifestPath, 'utf8')
    manifest = manifest.replace('"0.0.0"', JSON.stringify(VERSION))
    writeFileSync(manifestPath, manifest)
  }

  console.log('[extension] built → dist/extension/')
}

async function main () {
  if (target === 'all' || target === 'userscript') await buildUserscript()
  if (target === 'all' || target === 'extension') await buildExtension()

  if (watchMode) {
    console.log('\nWatching for changes…')
    const { watch } = await import('fs')
    watch('src', { recursive: true }, async (event, filename) => {
      console.log(`\n[${new Date().toLocaleTimeString()}] ${filename} changed, rebuilding…`)
      try {
        if (target === 'all' || target === 'userscript') await buildUserscript()
        if (target === 'all' || target === 'extension') await buildExtension()
      } catch (e) {
        console.error('Build error:', e.message)
      }
    })
  }
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
