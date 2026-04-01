from bertopic import BERTopic

def build_topic_model(embeddings, texts):
    topic_model = BERTopic(embedding_model=None)
    topics, probs = topic_model.fit_transform(texts, embeddings)
    return topic_model, topics
