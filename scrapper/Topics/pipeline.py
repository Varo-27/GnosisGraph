from Topics.extractor import load_articles, build_text
from Topics.embedder import embed_texts
from Topics.model import build_topic_model
from Topics.hierarchy import extract_hierarchy
from Topics.persistence import (
    save_topics,
    save_article_topic_relations,
    save_topic_embeddings,
    save_hierarchical_topics,
    save_topic_hierarchy
)

def generate_topics(session):
    print("Cargando artículos…")
    articles = load_articles(session)
    texts = [build_text(a) for a in articles]

    if not texts:
        print("No hay artículos para procesar.")
        return

    print("Generando embeddings…")
    embeddings = embed_texts(texts)

    print("Entrenando BERTopic…")
    topic_model, topic_assignments = build_topic_model(embeddings, texts)

    print("Guardando topics…")
    topic_info = topic_model.get_topic_info()
    topic_id_map = save_topics(session, topic_info, topic_model)

    print("Guardando relaciones artículo ↔ topic…")
    save_article_topic_relations(session, articles, topic_assignments, topic_id_map)
    
    print("Guardando embeddings de topics…")
    save_topic_embeddings(session, topic_model, topic_id_map)

    print("Extrayendo jerarquía…")
    hierarchy, hierarchical_topics = extract_hierarchy(topic_model, texts)
    
    save_hierarchical_topics(session, hierarchical_topics, topic_id_map)
    save_topic_hierarchy(session, hierarchy, topic_id_map)

    session.commit()
    print("Proceso de topics completado.")
