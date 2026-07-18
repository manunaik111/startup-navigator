from functools import lru_cache

MODEL_NAME = "all-MiniLM-L6-v2"
CHUNK_SIZE = 500   # characters per chunk
CHUNK_OVERLAP = 50  # characters of overlap between chunks


@lru_cache(maxsize=1)
def get_embedding_model():
    """
    Loads the model once per process and reuses it.
    Import is deliberately deferred to inside this function (not at module load
    time) so the FastAPI app can start and bind its port immediately - loading
    sentence-transformers/torch at import time can be slow enough on constrained
    hosting (e.g. Render's free tier) that the platform gives up waiting for the
    port to open before the import even finishes.
    """
    from sentence_transformers import SentenceTransformer
    return SentenceTransformer(MODEL_NAME)


def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    """Splits long article content into overlapping chunks for better retrieval granularity."""
    text = text.strip()
    if len(text) <= chunk_size:
        return [text]

    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start = end - overlap
    return chunks


def embed_text(text: str) -> list[float]:
    """Returns a 384-dim embedding vector for a single piece of text."""
    model = get_embedding_model()
    vector = model.encode(text, normalize_embeddings=True)
    return vector.tolist()


def embed_batch(texts: list[str]) -> list[list[float]]:
    """Embeds multiple chunks at once (faster than calling embed_text in a loop)."""
    model = get_embedding_model()
    vectors = model.encode(texts, normalize_embeddings=True)
    return [v.tolist() for v in vectors]