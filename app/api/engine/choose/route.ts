import type { NextRequest } from 'next/server'
import { makeChoice, isEngineError } from '@/lib/engine'
import type { PlayerState } from '@/lib/engine'

interface ChooseRequestBody {
  choiceId: string
  state: PlayerState
}

/**
 * POST /api/engine/choose
 *
 * Process a player choice and return the next scene view and updated state.
 *
 * Body: { choiceId: string, state: PlayerState }
 *
 * Response 200: { newState: PlayerState, nextSceneView: SceneView }
 * Response 400: { error: string, code: EngineError['code'] }
 * Response 422: { error: string } — malformed request body
 * Response 500: { error: string }
 */
export async function POST(request: NextRequest) {
  let body: ChooseRequestBody
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Request body must be valid JSON' }, { status: 422 })
  }

  const { choiceId, state } = body

  if (typeof choiceId !== 'string' || !choiceId) {
    return Response.json({ error: '`choiceId` must be a non-empty string' }, { status: 422 })
  }

  if (!state || typeof state.currentSceneId !== 'string') {
    return Response.json({ error: '`state` must be a valid PlayerState object' }, { status: 422 })
  }

  try {
    const result = makeChoice(choiceId, state)

    if (isEngineError(result)) {
      const status = result.code === 'CHOICE_UNAVAILABLE' || result.code === 'ALREADY_ENDED' ? 400 : 404
      return Response.json({ error: result.message, code: result.code }, { status })
    }

    return Response.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected engine error'
    return Response.json({ error: message }, { status: 500 })
  }
}
