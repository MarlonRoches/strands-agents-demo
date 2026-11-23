/**
 * Pruebas sin API key: un modelo falso pide usar una herramienta y
 * verificamos que el ciclo del agente de Strands la ejecuta.
 *
 * Ejecuta:  npm test
 */
import { Model, type BaseModelConfig, type Message, type ModelStreamEvent } from '@strands-agents/sdk'
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { crearAgente } from '../src/agent.js'
import { evaluarExpresion } from '../src/tools.js'

/** Primer turno: pide la herramienta contar_letras. Segundo: responde con texto. */
class ModeloFalso extends Model<BaseModelConfig> {
  llamadas = 0
  updateConfig(): void {}
  getConfig(): BaseModelConfig {
    return { modelId: 'modelo-falso' }
  }

  async *stream(messages: Message[]): AsyncIterable<ModelStreamEvent> {
    this.llamadas++
    yield { type: 'modelMessageStartEvent', role: 'assistant' }
    if (this.llamadas === 1) {
      yield { type: 'modelContentBlockStartEvent', start: { type: 'toolUseStart', name: 'contar_letras', toolUseId: 't1' } }
      yield {
        type: 'modelContentBlockDeltaEvent',
        delta: { type: 'toolUseInputDelta', input: JSON.stringify({ texto: 'ferrocarril', letra: 'r' }) },
      }
      yield { type: 'modelContentBlockStopEvent' }
      yield { type: 'modelMessageStopEvent', stopReason: 'toolUse' }
    } else {
      const ultimo = messages.at(-1)!.content[0]
      assert.equal(ultimo?.type, 'toolResultBlock')
      const texto = ultimo.type === 'toolResultBlock' ? JSON.stringify(ultimo.content) : ''
      const n = texto.match(/\d+/)?.[0]
      yield { type: 'modelContentBlockDeltaEvent', delta: { type: 'textDelta', text: `'ferrocarril' tiene ${n} letras r.` } }
      yield { type: 'modelContentBlockStopEvent' }
      yield { type: 'modelMessageStopEvent', stopReason: 'endTurn' }
    }
  }
}

test('la calculadora evalúa sin eval()', () => {
  assert.equal(evaluarExpresion('(1200 - 300) / 5'), 180)
  assert.equal(evaluarExpresion('2 ** 3 ** 2'), 512)
  assert.equal(evaluarExpresion('-3 + 10 % 4'), -1)
  assert.throws(() => evaluarExpresion('process.exit()'))
})

test('las herramientas están registradas en el agente', () => {
  const agente = crearAgente({ model: new ModeloFalso(), printer: false })
  assert.deepEqual(
    agente.tools.map((t) => t.name).sort(),
    ['calculadora', 'contar_letras', 'convertir_moneda', 'hora_actual', 'lanzar_dados'],
  )
})

test('el ciclo del agente llama a la herramienta y responde', async () => {
  const modelo = new ModeloFalso()
  const agente = crearAgente({ model: modelo, printer: false })
  const resultado = await agente.invoke('¿Cuántas r tiene ferrocarril?')
  assert.equal(modelo.llamadas, 2)
  assert.match(resultado.toString(), /tiene 4 letras r/)
})
