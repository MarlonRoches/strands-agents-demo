/**
 * Herramientas personalizadas.
 *
 * Con Strands, una herramienta se define con `tool()`: un nombre, una
 * descripción, un esquema Zod para la entrada y una función `callback`.
 * La descripción y el esquema le explican al modelo qué hace y qué recibe.
 */
import { tool } from '@strands-agents/sdk'
import { z } from 'zod'

// Tasas fijas de ejemplo (no son tasas reales en vivo).
const TASAS_A_USD: Record<string, number> = { USD: 1, EUR: 1.08, MXN: 0.055, COP: 0.00025, CLP: 0.00105 }
const MONEDAS = Object.keys(TASAS_A_USD)

const fmt = (n: number) => n.toLocaleString('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export const convertirMoneda = tool({
  name: 'convertir_moneda',
  description: `Convierte una cantidad de dinero entre monedas (tasas fijas de demo). Monedas: ${MONEDAS.join(', ')}.`,
  inputSchema: z.object({
    cantidad: z.number().describe('La cantidad a convertir'),
    desde: z.string().describe('Código de la moneda origen, p. ej. EUR'),
    hacia: z.string().describe('Código de la moneda destino, p. ej. MXN'),
  }),
  callback: ({ cantidad, desde, hacia }) => {
    const de = desde.toUpperCase()
    const a = hacia.toUpperCase()
    if (!(de in TASAS_A_USD) || !(a in TASAS_A_USD)) return `Moneda no soportada. Usa una de: ${MONEDAS.join(', ')}`
    const resultado = (cantidad * TASAS_A_USD[de]!) / TASAS_A_USD[a]!
    return `${fmt(cantidad)} ${de} = ${fmt(resultado)} ${a}`
  },
})

export const contarLetras = tool({
  name: 'contar_letras',
  description: 'Cuenta cuántas veces aparece una letra en un texto (sin distinguir mayúsculas).',
  inputSchema: z.object({
    texto: z.string().describe('El texto donde buscar'),
    letra: z.string().length(1).describe('La letra a contar'),
  }),
  callback: ({ texto, letra }) => String(texto.toLowerCase().split(letra.toLowerCase()).length - 1),
})

export const lanzarDados = tool({
  name: 'lanzar_dados',
  description: 'Lanza uno o varios dados y devuelve los resultados.',
  inputSchema: z.object({
    cantidad: z.number().int().min(1).max(20).default(1).describe('Número de dados'),
    caras: z.number().int().min(2).max(100).default(6).describe('Caras de cada dado'),
  }),
  callback: ({ cantidad, caras }) =>
    JSON.stringify(Array.from({ length: cantidad }, () => 1 + Math.floor(Math.random() * caras))),
})

export const horaActual = tool({
  name: 'hora_actual',
  description: 'Devuelve la fecha y hora actual en una zona horaria IANA.',
  inputSchema: z.object({
    zonaHoraria: z.string().default('UTC').describe('Por ejemplo "America/Bogota", "Asia/Tokyo" o "UTC"'),
  }),
  callback: ({ zonaHoraria }) => {
    try {
      return new Intl.DateTimeFormat('es', { dateStyle: 'full', timeStyle: 'long', timeZone: zonaHoraria }).format(new Date())
    } catch {
      return `Zona horaria desconocida: ${zonaHoraria}`
    }
  },
})

/** Evalúa + - * / % ** y paréntesis sin usar eval(). */
export function evaluarExpresion(expresion: string): number {
  const tokens = expresion.match(/\d+(?:\.\d+)?|\*\*|[-+*/%()]/g) ?? []
  if (tokens.join('') !== expresion.replace(/\s+/g, '')) throw new Error('Expresión no permitida')
  let i = 0
  const peek = () => tokens[i]
  const next = () => tokens[i++]

  const primario = (): number => {
    const t = next()
    if (t === '(') {
      const v = suma()
      if (next() !== ')') throw new Error('Falta ")"')
      return v
    }
    if (t === '-') return -potencia()
    if (t === '+') return potencia()
    if (t !== undefined && /^\d/.test(t)) return Number(t)
    throw new Error('Expresión no válida')
  }
  const potencia = (): number => {
    const base = primario()
    if (peek() === '**') { next(); return base ** potencia() }
    return base
  }
  const producto = (): number => {
    let v = potencia()
    while (peek() === '*' || peek() === '/' || peek() === '%') {
      const op = next()
      const d = potencia()
      v = op === '*' ? v * d : op === '/' ? v / d : v % d
    }
    return v
  }
  const suma = (): number => {
    let v = producto()
    while (peek() === '+' || peek() === '-') v = next() === '+' ? v + producto() : v - producto()
    return v
  }

  const resultado = suma()
  if (i !== tokens.length) throw new Error('Expresión no válida')
  return resultado
}

export const calculadora = tool({
  name: 'calculadora',
  description: 'Evalúa una expresión matemática simple de forma segura (+, -, *, /, %, **, paréntesis).',
  inputSchema: z.object({ expresion: z.string().describe('Por ejemplo "(1200 - 300) / 5"') }),
  callback: ({ expresion }) => {
    try {
      return String(evaluarExpresion(expresion))
    } catch (e) {
      return `Error: ${(e as Error).message}`
    }
  },
})

export const todasLasHerramientas = [calculadora, horaActual, convertirMoneda, contarLetras, lanzarDados]
