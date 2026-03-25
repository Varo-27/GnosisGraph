# Embeddings/local_embedding_client.py

from sentence_transformers import SentenceTransformer

# Carga el modelo una sola vez (tarda la primera vez porque lo descarga)
model = SentenceTransformer(
    "mixedbread-ai/mxbai-embed-large-v1",
    device="cuda"  # usa tu GPU; si da error, cambia a "cpu"
)

def get_embedding_local(text: str):
    """
    Genera un embedding de 1024 dimensiones usando mxbai-embed-large.
    """
    vector = model.encode(
        text,
        normalize_embeddings=True,
        convert_to_numpy=True
    )
    return vector.tolist()
