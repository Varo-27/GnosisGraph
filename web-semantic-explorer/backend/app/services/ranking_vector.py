"""Mezcla de embeddings para búsqueda y expansión con contexto del grafo."""

from __future__ import annotations

import numpy as np
from sqlmodel import Session, select

from app.core.embeddings import embedding_client
from app.models.embedding import Embedding

QUERY_WEIGHT = 0.5
CONTEXT_ARTICLE_WEIGHT = 0.25
SEED_QUERY_WEIGHT = 0.25

SOURCE_ARTICLE_WEIGHT = 0.55
EXPAND_CONTEXT_ARTICLE_WEIGHT = 0.2
EXPAND_SEED_WEIGHT = 0.25


def _normalize_vector(vector: list[float]) -> list[float]:
    norm = np.linalg.norm(np.array(vector, dtype=float))
    if norm == 0:
        return vector
    return [float(value) for value in (np.array(vector, dtype=float) / norm).tolist()]


def _weighted_blend(
    parts: list[tuple[list[float], float]],
) -> list[float] | None:
    weighted: list[tuple[np.ndarray, float]] = []
    for vector, weight in parts:
        if weight <= 0:
            continue
        weighted.append((np.array(vector, dtype=float), weight))

    if not weighted:
        return None

    total_weight = sum(weight for _, weight in weighted)
    if total_weight == 0:
        return None

    blended = sum(array * weight for array, weight in weighted) / total_weight
    return _normalize_vector(blended.tolist())


def _load_article_vectors(
    session: Session,
    article_ids: list[int],
) -> list[list[float]]:
    if not article_ids:
        return []

    rows = session.exec(
        select(Embedding.vector)
        .where(Embedding.entity_type == "article")
        .where(Embedding.entity_id.in_(article_ids))  # type: ignore[attr-defined]
    ).all()

    vectors: list[list[float]] = []
    for row in rows:
        raw = row.tolist() if hasattr(row, "tolist") else row
        vectors.append([float(value) for value in raw])
    return vectors


def build_search_ranking_vector(
    *,
    session: Session,
    query: str,
    seed_queries: list[str] | None = None,
    context_article_ids: list[int] | None = None,
) -> list[float]:
    """Vector de ranking para GET /search con consulta y contexto upstream."""
    query_text = query.strip()
    if not query_text:
        raise ValueError("La consulta no puede estar vacía")

    parts: list[tuple[list[float], float]] = [
        (_normalize_vector(embedding_client.embed_text(query_text)), QUERY_WEIGHT),
    ]

    context_ids = [
        article_id
        for article_id in (context_article_ids or [])
        if isinstance(article_id, int)
    ]
    context_vectors = _load_article_vectors(session, context_ids)
    if context_vectors:
        mean_context = np.mean(
            [np.array(vector, dtype=float) for vector in context_vectors],
            axis=0,
        ).tolist()
        parts.append((_normalize_vector(mean_context), CONTEXT_ARTICLE_WEIGHT))

    seed_texts = [text.strip() for text in (seed_queries or []) if text and text.strip()]
    if seed_texts:
        seed_vectors = [
            np.array(embedding_client.embed_text(text), dtype=float)
            for text in seed_texts
        ]
        mean_seed = np.mean(seed_vectors, axis=0).tolist()
        parts.append((_normalize_vector(mean_seed), SEED_QUERY_WEIGHT))

    blended = _weighted_blend(parts)
    if blended is None:
        return _normalize_vector(embedding_client.embed_text(query_text))
    return blended


def build_expand_ranking_vector(
    *,
    session: Session,
    source_vector: list[float],
    seed_queries: list[str] | None = None,
    context_article_ids: list[int] | None = None,
    exclude_article_id: int | None = None,
) -> list[float]:
    """Vector de ranking para expand: fuente + artículos upstream + semillas."""
    parts: list[tuple[list[float], float]] = [
        (_normalize_vector(source_vector), SOURCE_ARTICLE_WEIGHT),
    ]

    context_ids = [
        article_id
        for article_id in (context_article_ids or [])
        if isinstance(article_id, int)
        and article_id != exclude_article_id
    ]
    context_vectors = _load_article_vectors(session, context_ids)
    if context_vectors:
        mean_context = np.mean(
            [np.array(vector, dtype=float) for vector in context_vectors],
            axis=0,
        ).tolist()
        parts.append((_normalize_vector(mean_context), EXPAND_CONTEXT_ARTICLE_WEIGHT))

    seed_texts = [text.strip() for text in (seed_queries or []) if text and text.strip()]
    if seed_texts:
        seed_vectors = [
            np.array(embedding_client.embed_text(text), dtype=float)
            for text in seed_texts
        ]
        mean_seed = np.mean(seed_vectors, axis=0).tolist()
        parts.append((_normalize_vector(mean_seed), EXPAND_SEED_WEIGHT))

    blended = _weighted_blend(parts)
    if blended is None:
        return _normalize_vector(source_vector)
    return blended
