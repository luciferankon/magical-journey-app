import type { NextRequest } from 'next/server'
import { resumeGame, isEngineError } from '@/lib/engine'
import type { PlayerState } from '@/lib/engine'

/**
 * POST /api/engine/resume
 *
 * Hydrate a scene view from a saved PlayerState (e.g. after page reload).
 *
 * Body: { state: PlayerState }
 *
 * Response 200: SceneView
 * Response 404: { error: string, code: EngineError['code'] }
 * Response 422: { error: string } — malformed body
 */
export async function POST(request: NextRequest) {
  let body: { state: PlayerState }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Request body must be valid JSON' }, { status: 422 })
  }

  const { state } = body
  if (!state || typeof state.currentSceneId !== 'string') {
    return Response.json({ error: '`state` must be a valid PlayerState object' }, { status: 422 })
  }

  const result = resumeGame(state)

  if (isEngineError(result)) {
    return Response.json({ error: result.message, code: result.code }, { status: 404 })
  }

  return Response.json(result)
}
