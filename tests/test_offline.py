"""Prueba sin API key: un modelo falso pide usar una herramienta y
verificamos que el ciclo del agente de Strands la ejecuta.

Ejecuta:  python -m pytest -q
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from strands.models.model import Model

from agent import crear_agente
from tools import calculadora, contar_letras, convertir_moneda


class ModeloFalso(Model):
    """Primer turno: pide la herramienta contar_letras. Segundo: responde texto."""

    def __init__(self):
        self.llamadas = 0

    def update_config(self, **kwargs):
        pass

    def get_config(self):
        return {}

    async def structured_output(self, *args, **kwargs):
        raise NotImplementedError

    async def stream(self, messages, tool_specs=None, system_prompt=None, **kwargs):
        self.llamadas += 1
        yield {"messageStart": {"role": "assistant"}}
        if self.llamadas == 1:
            yield {"contentBlockStart": {"start": {"toolUse": {"toolUseId": "t1", "name": "contar_letras"}}}}
            yield {"contentBlockDelta": {"delta": {"toolUse": {"input": json.dumps({"texto": "ferrocarril", "letra": "r"})}}}}
            yield {"contentBlockStop": {}}
            yield {"messageStop": {"stopReason": "tool_use"}}
        else:
            resultado = messages[-1]["content"][0]["toolResult"]["content"][0]["text"]
            yield {"contentBlockDelta": {"delta": {"text": f"'ferrocarril' tiene {resultado} letras r."}}}
            yield {"contentBlockStop": {}}
            yield {"messageStop": {"stopReason": "end_turn"}}


def test_herramientas_directas():
    assert contar_letras(texto="Ferrocarril", letra="r") == 4
    assert "108.00 USD" in convertir_moneda(cantidad=100, desde="EUR", hacia="USD")
    assert calculadora(expresion="(1200 - 300) / 5") == "180.0"
    assert calculadora(expresion="__import__(\"os\")").startswith("Error")


def test_ciclo_del_agente_usa_herramienta():
    modelo = ModeloFalso()
    agente = crear_agente(model=modelo, callback_handler=None)
    respuesta = agente("¿Cuántas r tiene ferrocarril?")
    assert modelo.llamadas == 2
    assert "4" in str(respuesta)
