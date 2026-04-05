import { readFileSync } from 'fs'
import { join } from 'path'
import type { Scene } from './types'

export interface Manifest {
  startSceneId: string
  initialState: {
    traits: Record<string, number>
    relationships: Record<string, number>
  }
  scenes: string[]
}

const CONTENT_DIR = join(process.cwd(), 'content')

/**
 * Load a single scene by ID from the content/scenes directory.
 * Throws if the scene file does not exist or is malformed.
 */
export function loadScene(sceneId: string): Scene {
  const filePath = join(CONTENT_DIR, 'scenes', `${sceneId}.json`)
  let raw: string
  try {
    raw = readFileSync(filePath, 'utf-8')
  } catch {
    throw new Error(`Scene not found: "${sceneId}" (expected at ${filePath})`)
  }
  const scene = JSON.parse(raw) as Scene
  if (scene.id !== sceneId) {
    throw new Error(`Scene file id mismatch: file says "${scene.id}", expected "${sceneId}"`)
  }
  return scene
}

/**
 * Load the game manifest (start scene, initial state shape, scene list).
 */
export function loadManifest(): Manifest {
  const filePath = join(CONTENT_DIR, 'manifest.json')
  const raw = readFileSync(filePath, 'utf-8')
  return JSON.parse(raw) as Manifest
}
