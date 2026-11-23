"""Elige el proveedor de modelo según variables de entorno.

Strands es "model-agnostic": el mismo agente funciona con Anthropic,
Amazon Bedrock, OpenAI, Ollama, etc. Solo cambia el objeto `model`.
"""
import os

from dotenv import load_dotenv

load_dotenv()


def get_model():
    provider = os.getenv("MODEL_PROVIDER", "anthropic").lower()

    if provider == "anthropic":
        from strands.models.anthropic import AnthropicModel

        return AnthropicModel(
            client_args={"api_key": os.environ["ANTHROPIC_API_KEY"]},
            model_id=os.getenv("MODEL_ID", "claude-sonnet-5-5"),
            max_tokens=2048,
        )

    if provider == "bedrock":
        # Usa tus credenciales de AWS (aws configure). Sin MODEL_ID,
        # Strands usa su modelo Claude por defecto en Bedrock.
        from strands.models.bedrock import BedrockModel

        kwargs = {"region_name": os.getenv("AWS_REGION", "us-east-1")}
        if os.getenv("MODEL_ID"):
            kwargs["model_id"] = os.environ["MODEL_ID"]
        return BedrockModel(**kwargs)

    if provider == "openai":
        from strands.models.openai import OpenAIModel

        return OpenAIModel(
            client_args={"api_key": os.environ["OPENAI_API_KEY"]},
            model_id=os.getenv("MODEL_ID", "gpt-4o-mini"),
        )

    raise ValueError(f"MODEL_PROVIDER desconocido: {provider}")
