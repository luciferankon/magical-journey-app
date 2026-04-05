import { startGame } from '@/lib/engine'

/**
 * POST /api/engine/start
 *
 * Initialise a new game. Returns the starting state and scene view.
 * Body: none required.
 *
 * Response 200: { state: PlayerState, sceneView: SceneView }
 * Response 500: { error: string }
 */
export async function POST() {
  try {
    const result = startGame()
    return Response.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to start game'
    return Response.json({ error: message }, { status: 500 })
  }
}
