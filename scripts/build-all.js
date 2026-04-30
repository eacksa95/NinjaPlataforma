import { execSync } from 'child_process'
import { readdirSync, mkdirSync, cpSync, existsSync } from 'fs'

const gamesDir = 'games'
const outDir   = 'dist'

const games = readdirSync(gamesDir, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name)

mkdirSync(outDir, { recursive: true })

for (const game of games) {
  console.log(`\n── Building ${game} ──`)
  execSync(`npm run build -w games/${game}`, { stdio: 'inherit' })
  const gameDist = `${gamesDir}/${game}/dist`
  if (existsSync(gameDist)) {
    cpSync(gameDist, `${outDir}/${game}`, { recursive: true })
  }
}

console.log('\nAll games built.')
