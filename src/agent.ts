/**
 * Demo 1: un agente con herramientas, en un chat por terminal.
 *
 * Ejecuta:  npm run agent
 */
import { Agent, type AgentConfig } from '@strands-agents/sdk'
import { stdin as input, stdout as output } from 'node:process'
import * as readline from 'node:readline/promises'
import { pathToFileURL } from 'node:url'
import { getModel } from './models.js'
import { todasLasHerramientas } from './tools.js'

const SYSTEM_PROMPT = `Eres un asistente amable que responde en español.
Usa tus herramientas cuando sirvan: calculadora, hora actual,
conversión de monedas, contar letras y lanzar dados.`

export function crearAgente(config: Partial<AgentConfig> = {}): Agent {
  return new Agent({
    systemPrompt: SYSTEM_PROMPT,
    tools: todasLasHerramientas,
    ...config,
    model: config.model ?? getModel(),
  })
}

async function main() {
  const agente = crearAgente() // printer activado: la respuesta se imprime en streaming
  const rl = readline.createInterface({ input, output })
  console.log("🤖 Agente Strands listo. Escribe 'salir' para terminar.\n")
  console.log("Prueba: ¿Cuántas 'r' tiene 'ferrocarril'? / Convierte 250 EUR a MXN / ¿Qué hora es en Tokio?\n")

  while (true) {
    const pregunta = (await rl.question('Tú: ')).trim()
    if (['salir', 'exit', 'quit'].includes(pregunta.toLowerCase())) break
    if (pregunta) {
      await agente.invoke(pregunta)
      console.log('\n')
    }
  }
  rl.close()
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main().catch((err) => {
    console.error(err instanceof Error ? err.message : err)
    process.exit(1)
  })
}
