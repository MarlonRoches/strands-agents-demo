"""Herramientas personalizadas.

Con Strands, una herramienta es una función normal de Python con el
decorador @tool. El docstring y los type hints le explican al modelo
qué hace la herramienta y qué parámetros recibe.
"""
import random

from strands import tool

# Tasas fijas de ejemplo (no son tasas reales en vivo).
TASAS_A_USD = {"USD": 1.0, "EUR": 1.08, "MXN": 0.055, "COP": 0.00025, "CLP": 0.00105}


@tool
def convertir_moneda(cantidad: float, desde: str, hacia: str) -> str:
    """Convierte una cantidad de dinero entre monedas (tasas fijas de demo).

    Args:
        cantidad: La cantidad a convertir.
        desde: Código de la moneda origen (USD, EUR, MXN, COP, CLP).
        hacia: Código de la moneda destino (USD, EUR, MXN, COP, CLP).
    """
    desde, hacia = desde.upper(), hacia.upper()
    if desde not in TASAS_A_USD or hacia not in TASAS_A_USD:
        return f"Moneda no soportada. Usa una de: {', '.join(TASAS_A_USD)}"
    resultado = cantidad * TASAS_A_USD[desde] / TASAS_A_USD[hacia]
    return f"{cantidad:,.2f} {desde} = {resultado:,.2f} {hacia}"


@tool
def contar_letras(texto: str, letra: str) -> int:
    """Cuenta cuántas veces aparece una letra en un texto (sin distinguir mayúsculas).

    Args:
        texto: El texto donde buscar.
        letra: La letra a contar.
    """
    return texto.lower().count(letra.lower())


@tool
def lanzar_dados(cantidad: int = 1, caras: int = 6) -> list[int]:
    """Lanza uno o varios dados y devuelve los resultados.

    Args:
        cantidad: Número de dados a lanzar.
        caras: Número de caras de cada dado.
    """
    return [random.randint(1, caras) for _ in range(cantidad)]


@tool
def hora_actual(zona_horaria: str = "UTC") -> str:
    """Devuelve la fecha y hora actual en una zona horaria IANA.

    Args:
        zona_horaria: Por ejemplo "America/Bogota", "Asia/Tokyo" o "UTC".
    """
    from datetime import datetime
    from zoneinfo import ZoneInfo

    try:
        return datetime.now(ZoneInfo(zona_horaria)).strftime("%Y-%m-%d %H:%M:%S %Z")
    except Exception:  # noqa: BLE001
        return f"Zona horaria desconocida: {zona_horaria}"


@tool
def calculadora(expresion: str) -> str:
    """Evalúa una expresión matemática simple de forma segura (+, -, *, /, **, %, paréntesis).

    Args:
        expresion: La expresión a evaluar, por ejemplo "(1200 - 300) / 5".
    """
    import ast
    import operator as op

    ops = {ast.Add: op.add, ast.Sub: op.sub, ast.Mult: op.mul, ast.Div: op.truediv,
           ast.Pow: op.pow, ast.Mod: op.mod, ast.USub: op.neg, ast.UAdd: op.pos}

    def evaluar(nodo):
        if isinstance(nodo, ast.Constant) and isinstance(nodo.value, (int, float)):
            return nodo.value
        if isinstance(nodo, ast.BinOp) and type(nodo.op) in ops:
            return ops[type(nodo.op)](evaluar(nodo.left), evaluar(nodo.right))
        if isinstance(nodo, ast.UnaryOp) and type(nodo.op) in ops:
            return ops[type(nodo.op)](evaluar(nodo.operand))
        raise ValueError("Expresión no permitida")

    try:
        return str(evaluar(ast.parse(expresion, mode="eval").body))
    except Exception as e:  # noqa: BLE001
        return f"Error: {e}"
