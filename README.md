# Demo de Strands Agents con TypeScript 🧵🤖

Demo básica de [Strands Agents](https://strandsagents.com), el SDK de código abierto de AWS
para crear agentes de IA, usando el SDK de **TypeScript** (`@strands-agents/sdk`) sobre **Node.js**.

## ¿Qué es Strands Agents?

- **Enfoque "model-driven":** tú das un *modelo*, un *prompt* y unas *herramientas*; el modelo
  decide en un ciclo (el *agent loop*) cuándo llamar herramientas y cuándo responder.
- **Herramientas con tipos:** se definen con `tool()` y un esquema **Zod**, así la entrada
  llega validada y tipada.
- **Independiente del modelo:** Amazon Bedrock (el predeterminado), Anthropic, OpenAI, Google, etc.
  Cambiar de proveedor es cambiar una línea.
- **Multi-agente:** un `Agent` se puede pasar como herramienta de otro (*agents as tools*), y hay
  patrones *graph* y *swarm*.
- Soporta MCP, streaming, salida estructurada con Zod, hooks y observabilidad (OpenTelemetry).

```ts
import { Agent, tool } from '@strands-agents/sdk'
import { z } from 'zod'

const contarLetras = tool({
  name: 'contar_letras',
  description: 'Cuenta cuántas veces aparece una letra en un texto.',
  inputSchema: z.object({ texto: z.string(), letra: z.string() }),
  callback: ({ texto, letra }) => String(texto.split(letra).length - 1),
})

const agente = new Agent({ tools: [contarLetras] })
await agente.invoke("¿Cuántas r tiene 'ferrocarril'?")
```

## Contenido

| Archivo | Qué muestra |
|---|---|
| `src/agent.ts` | Chat por terminal con un agente con 5 herramientas propias |
| `src/multi-agent.ts` | Orquestador que delega en dos agentes especialistas (*agents as tools*) |
| `src/tools.ts` | Herramientas con `tool()` + Zod: calculadora, hora, monedas, letras, dados |
| `src/models.ts` | Elige el proveedor (Anthropic / Bedrock / OpenAI) según `.env` |
| `tests/offline.test.ts` | Prueba el ciclo del agente con un modelo falso, sin API key |

## Cómo ejecutarla

Requiere **Node.js 22+**.

```bash
npm install
cp .env.example .env      # y pon tu ANTHROPIC_API_KEY (o configura Bedrock/OpenAI)

npm run agent             # demo 1: chat con herramientas
npm run multi             # demo 2: multi-agente
npm test                  # pruebas sin API key
npm run typecheck         # comprobación de tipos con tsc
```

Preguntas para probar en `npm run agent`:

- ¿Cuántas "r" tiene "ferrocarril"?
- Convierte 250 EUR a pesos mexicanos
- ¿Qué hora es en Tokio y en Bogotá?
- Lanza 3 dados y súmalos

> Las tasas de cambio de `convertir_moneda` son fijas, solo para la demo.
