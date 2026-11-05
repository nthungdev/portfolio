import type { NextConfig } from 'next'
import { execSync } from 'node:child_process'

function git(args: string): string {
  return execSync(`git ${args}`, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim()
}

function buildSha(): { short: string; full: string } {
  try {
    const full = git('rev-parse HEAD')
    const short = git('rev-parse --short HEAD')
    const dirty = git('status --porcelain') !== ''
    return { short: dirty ? `${short}-dirty` : short, full }
  } catch {
    return { short: 'dev', full: 'dev' }
  }
}

const sha = buildSha()

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_BUILD_SHA: process.env.NEXT_PUBLIC_BUILD_SHA || sha.short,
    NEXT_PUBLIC_BUILD_SHA_FULL: process.env.NEXT_PUBLIC_BUILD_SHA_FULL || sha.full,
    NEXT_PUBLIC_BUILD_DATE: new Date().toISOString().slice(0, 10),
  },
}

export default nextConfig
