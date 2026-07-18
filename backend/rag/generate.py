from groq import Groq

from config import settings
from rag.search import RetrievedChunk

_client = Groq(api_key=settings.groq_api_key)

SYSTEM_PROMPT = (
    "You are the AI assistant for Startup Navigator, a knowledge base for entrepreneurs "
    "covering company registration, funding, legal compliance, hiring, branding, marketing, "
    "taxation, fundraising, AI tools, and business growth. "
    "Answer the user's question using ONLY the context provided below. "
    "If the context doesn't contain enough information to answer, say so honestly instead "
    "of making something up. Keep answers clear, practical, and concise."
)


def build_context(chunks: list[RetrievedChunk]) -> str:
    if not chunks:
        return "No relevant articles were found in the knowledge base."

    parts = []
    for i, chunk in enumerate(chunks, start=1):
        parts.append(f"[Source {i}: {chunk.article_title}]\n{chunk.chunk_text}")
    return "\n\n".join(parts)


def generate_answer(question: str, chunks: list[RetrievedChunk]) -> str:
    context = build_context(chunks)

    user_message = (
        f"Context:\n{context}\n\n"
        f"Question: {question}"
    )

    response = _client.chat.completions.create(
        model=settings.groq_model,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_message},
        ],
        temperature=0.3,
        max_tokens=800,
    )

    return response.choices[0].message.content