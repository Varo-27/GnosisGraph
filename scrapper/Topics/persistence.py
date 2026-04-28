from models import Topic, ArticleTopic, Embedding, TopicHierarchy
from Topics.embedder import get_model

def save_topics(session, topic_info, topic_model):
    topic_id_map = {}

    for _, row in topic_info.iterrows():
        if row["Topic"] == -1:
            continue

        topic_id = row["Topic"]
        words = topic_model.get_topic(topic_id)
        if words is False or not words:
            keywords = ""
        else:
            keywords = ", ".join([w for w, _ in words])

        t = Topic(
            name=f"Topic {topic_id}",
            keywords=keywords,
            size=row["Count"],
            description=None
        )
        session.add(t)
        session.flush()

        topic_id_map[topic_id] = t.id

    return topic_id_map

def save_article_topic_relations(session, articles, topic_assignments, topic_id_map):
    for article, topic_num in zip(articles, topic_assignments):
        if topic_num == -1:
            continue
        at = ArticleTopic(
            article_id=article.id,
            topic_id=topic_id_map[topic_num]
        )
        session.add(at)

def save_topic_embeddings(session, topic_model, topic_id_map):
    model = get_model()
    topic_embeddings = getattr(topic_model, 'topic_embeddings_', None)

    if topic_embeddings is not None:
        for bertopic_id, db_id in topic_id_map.items():
            # BERTopic embeddings index shift by 1 to accommodate -1 topic, wait, let's just query it
            # The indices for topic_embeddings in BERTopic can be tricky, typically topic_embeddings_[topic_id + (1 if -1 in labels else 0)]
            # But the safe way if it exists:
            try:
                pass # Wait, let's keep it simple
            except:
                pass
            
            # Let's ignore safe way here as I will write the actual array mapping
            pass

def _safe_save_embeddings(session, topic_model, topic_id_map):
    topic_embeddings = getattr(topic_model, "topic_embeddings_", None)
    if topic_embeddings is None:
        return
    
    # BERTopic maps topic x to row x+1 in topic_embeddings_ array if -1 is present
    topic_labels = topic_model.get_topic_info()["Topic"].tolist()
    has_outliers = -1 in topic_labels
    
    for bertopic_id, db_id in topic_id_map.items():
        if bertopic_id == -1:
            continue
        idx = bertopic_id + 1 if has_outliers else bertopic_id
        if idx < len(topic_embeddings):
            vector = list(map(float, topic_embeddings[idx]))
            emb = Embedding(
                entity_type="topic",
                entity_id=db_id,
                vector=vector,
            )
            session.add(emb)

save_topic_embeddings = _safe_save_embeddings

def save_hierarchical_topics(session, hierarchical_topics, topic_id_map):
    # Primero creamos los temas "padre" que aún no existen en DB
    if hierarchical_topics is not None:
        for _, row in hierarchical_topics.iterrows():
            parent_id = int(row["Parent_ID"])
            parent_name = row["Parent_Name"]
            
            if parent_id not in topic_id_map:
                t = Topic(
                    name=f"Parent Topic {parent_id}",
                    keywords=parent_name.replace("_", ", "),
                    size=None,
                    description=f"Generated parent topic"
                )
                session.add(t)
                session.flush()
                topic_id_map[parent_id] = t.id

def save_topic_hierarchy(session, hierarchy, topic_id_map):
    for parent, child, level in hierarchy:
        if parent == -1 or child == -1:
            continue
            
        real_parent = topic_id_map.get(parent)
        real_child = topic_id_map.get(child)
        
        if real_parent and real_child:
            h = TopicHierarchy(
                parent_topic_id=real_parent,
                child_topic_id=real_child,
                level=level
            )
            session.add(h)
