from sentence_transformers import SentenceTransformer

_model = None

def get_model():
    global _model
    if _model is None:
        _model = SentenceTransformer("mixedbread-ai/mxbai-embed-large-v1")
    return _model

def embed_texts(texts):
    model = get_model()
    return model.encode(texts, show_progress_bar=True)
