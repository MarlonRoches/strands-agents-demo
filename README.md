# Demo de Strands Agents 🧵🤖

Demo básica de [Strands Agents](https://strandsagents.com), el SDK de código abierto de AWS
para crear agentes de IA en pocas líneas de Python.

## ¿Qué es Strands Agents?

- **Enfoque "model-driven":** tú das un *modelo*, un *prompt* y unas *herramientas*; el modelo
  decide en un ciclo (el *agent loop*) cuándo llamar herramientas y cuándo responder.
- **Herramientas = funciones Python** con el decorador `@tool`. El docstring y los type hints
  le explican al modelo qué hace cada una.
- **Independiente del modelo:** Amazon Bedrock (el predeterminado), Anthropic, OpenAI, Ollama,
  LiteLLM, Gemini, etc. Cambiar de proveedor es cambiar una línea.
- **Multi-agente:** patrones como *agents as tools*, *swarm*, *graph* y *workflow*.
- Soporta MCP, streaming, sesiones, hooks y observabilidad (OpenTelemetry).

```python
from strands import Agent, tool

@tool
def contar_letras(texto: str, letra: str) -> int:
    """Cuenta cuántas veces aparece una letra en un texto."""
    return texto.lower().count(letra.lower())

agente = Agent(tools=[contar_letras])
agente("¿Cuántas r tiene 'ferrocarril'?")
```

## Contenido

| Archivo | Qué muestra |
|---|---|
| `agent.py` | Chat por terminal con un agente con 5 herramientas propias |
| `multi_agent.py` | Orquestador que delega en dos agentes especialistas (*agents as tools*) |
| `tools.py` | Herramientas con `@tool`: calculadora, hora, monedas, letras, dados |
| `models.py` | Elige el proveedor (Anthropic / Bedrock / OpenAI) según `.env` |
| `tests/test_offline.py` | Prueba el ciclo del agente con un modelo falso, sin API key |

## Cómo ejecutarla

Requiere **Python 3.10+**.

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env      # y pon tu ANTHROPIC_API_KEY (o configura Bedrock/OpenAI)

python agent.py           # demo 1: chat con herramientas
python multi_agent.py     # demo 2: multi-agente
python -m pytest -q       # pruebas sin API key
```

Preguntas para probar en `agent.py`:

- ¿Cuántas "r" tiene "ferrocarril"?
- Convierte 250 EUR a pesos mexicanos
- ¿Qué hora es en Tokio y en Bogotá?
- Lanza 3 dados y súmalos

> Las tasas de cambio de `convertir_moneda` son fijas, solo para la demo.
