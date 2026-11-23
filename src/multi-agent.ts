/**
 * Demo 2: multi-agente con el patrón "agents as tools".
 *
 * Un agente orquestador decide a qué especialista delegar. En el SDK de
 * TypeScript basta con pasar otro Agent dentro de `tools`: Strands lo
 * envuelve como herramienta usando su `name` y `description`.
 *
 * Ejecuta:  npm run multi
 */
import { Agent } from '@strands-agents/sdk'
import { getModel } from './models.js'
import { calculadora } from './tools.js'

const expertoMatematicas = new Agent({
  name: 'experto_matematicas',
  description: 'Resuelve problemas de matemáticas paso a paso.',
  model: getModel(),
  systemPrompt: 'Eres un profesor de matemáticas. Explica paso a paso y en español.',
  tools: [calculadora],
  printer: false, // no imprime: solo devuelve su texto al orquestador
})

const expertoViajes = new Agent({
  name: 'experto_viajes',
  description: 'Da recomendaciones de viaje: destinos, itinerarios y consejos.',
  model: getModel(),
  systemPrompt: 'Eres un agente de viajes experto. Responde breve y en español.',
  printer: false,
})

const orquestador = new Agent({
  model: getModel(),
  systemPrompt:
    'Eres un coordinador. Delega las preguntas de matemáticas a experto_matematicas ' +
    'y las de viajes a experto_viajes. Luego entrega una respuesta final clara en español.',
  tools: [expertoMatematicas, expertoViajes],
})

await orquestador.invoke(
  'Quiero viajar 5 días a Cartagena con un presupuesto de 1200 USD. ' +
    '¿Cuánto puedo gastar por día si reservo 300 USD para el vuelo? ' +
    'Y dame un itinerario corto.',
)
console.log()
