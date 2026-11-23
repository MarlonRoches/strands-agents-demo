"""Demo 2: multi-agente con el patrón "agents as tools".

Un agente orquestador decide a qué especialista delegar. Cada especialista
es otro Agent de Strands envuelto como herramienta.

Ejecuta:  python multi_agent.py
"""
from strands import Agent, tool
from tools import calculadora

from models import get_model


@tool
def experto_matematicas(pregunta: str) -> str:
    """Resuelve problemas de matemáticas paso a paso.

    Args:
        pregunta: El problema matemático a resolver.
    """
    agente = Agent(
        model=get_model(),
        system_prompt="Eres un profesor de matemáticas. Explica paso a paso y en español.",
        tools=[calculadora],
        callback_handler=None,  # sin imprimir: solo devolvemos el texto
    )
    return str(agente(pregunta))


@tool
def experto_viajes(pregunta: str) -> str:
    """Da recomendaciones de viaje: destinos, itinerarios y consejos.

    Args:
        pregunta: La consulta de viaje.
    """
    agente = Agent(
        model=get_model(),
        system_prompt="Eres un agente de viajes experto. Responde breve y en español.",
        callback_handler=None,
    )
    return str(agente(pregunta))


orquestador = Agent(
    model=get_model(),
    system_prompt=(
        "Eres un coordinador. Delega las preguntas de matemáticas a experto_matematicas "
        "y las de viajes a experto_viajes. Luego entrega una respuesta final clara en español."
    ),
    tools=[experto_matematicas, experto_viajes],
)

if __name__ == "__main__":
    orquestador(
        "Quiero viajar 5 días a Cartagena con un presupuesto de 1200 USD. "
        "¿Cuánto puedo gastar por día si reservo 300 USD para el vuelo? "
        "Y dame un itinerario corto."
    )
    print()
