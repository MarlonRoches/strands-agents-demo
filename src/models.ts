/**
 * Elige el proveedor de modelo según variables de entorno.
 *
 * Strands es "model-agnostic": el mismo agente funciona con Anthropic,
 * Amazon Bedrock, OpenAI, etc. Solo cambia el objeto `model`.
 */
import 'dotenv/config'
import { BedrockModel, type Model } from '@strands-agents/sdk'
import { AnthropicModel } from '@strands-agents/sdk/models/anthropic'
import { OpenAIModel } from '@strands-agents/sdk/models/openai'

export function getModel(): Model {
  const provider = (process.env.MODEL_PROVIDER ?? 'anthropic').toLowerCase()
  const modelId = process.env.MODEL_ID

  switch (provider) {
    case 'anthropic':
      return new AnthropicModel({
        apiKey: requireEnv('ANTHROPIC_API_KEY'),
        modelId: modelId ?? 'claude-sonnet-5-5',
        maxTokens: 2048,
      })

    case 'bedrock':
      // Usa tus credenciales de AWS (aws configure). Sin MODEL_ID,
      // Strands usa su modelo Claude por defecto en Bedrock.
      return new BedrockModel({
        region: process.env.AWS_REGION ?? 'us-east-1',
        ...(modelId ? { modelId } : {}),
      })

    case 'openai':
      return new OpenAIModel({
        api: 'chat',
        apiKey: requireEnv('OPENAI_API_KEY'),
        ...(modelId ? { modelId } : {}),
      })

    default:
      throw new Error(`MODEL_PROVIDER desconocido: ${provider}`)
  }
}

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Falta ${name}. Cópialo en tu archivo .env (ver .env.example).`)
  return value
}
