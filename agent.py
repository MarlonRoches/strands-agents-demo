"""Demo 1: un agente con herramientas, en un chat por terminal.

Ejecuta:  python agent.py
"""
from strands import Agent

from models import get_model
from tools import calculadora, contar_letras, convertir_moneda, hora_actual, lanzar_dados

SYSTEM_PROMPT = """Eres un asistente amable que responde en español.
Usa tus herramientas cuando sirvan: calculadora, hora actual,
conversión de monedas, contar letras y lanzar dados."""


def crear_agente(model=None, **kwargs) -> Agent:
    return Agent(
        model=model or get_model(),
        **kwargs,
        system_prompt=SYSTEM_PROMPT,
        tools=[calculadora, hora_actual, convertir_moneda, contar_letras, lanzar_dados],
    )


def main():
    agente = crear_agente()
    print("🤖 Agente Strands listo. Escribe 'salir' para terminar.\n")
    print("Prueba: ¿Cuántas 'r' tiene 'ferrocarril'? / Convierte 250 EUR a MXN / ¿Qué hora es en Tokio?\n")
    while True:
        pregunta = input("Tú: ").strip()
        if pregunta.lower() in {"salir", "exit", "quit"}:
            break
        if pregunta:
            agente(pregunta)  # La respuesta se imprime en streaming
            print("\n")


if __name__ == "__main__":
    main()
