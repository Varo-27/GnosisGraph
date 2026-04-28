def extract_hierarchy(topic_model, docs):
    """
    Devuelve una lista de (parent_topic, child_topic, level / distance)
    """
    # Para que funcione, usualmente se pasa docs.
    hierarchical_topics = topic_model.hierarchical_topics(docs)
    hierarchy = []

    if hierarchical_topics is not None:
        for idx, row in hierarchical_topics.iterrows():
            parent = int(row["Parent_ID"])
            child_left = int(row["Child_Left_ID"])
            child_right = int(row["Child_Right_ID"])
            
            # Podríamos guardar distance como 'level' si hace falta o solo registrar la jerarquía plana
            # Nota: BERTopic asigna IDs nuevos (mayores al max topic) a los nodos padres
            # Por lo que quizas necesitas procesar esto si los padres no están en topic_id_map
            hierarchy.append((parent, child_left, 1))
            hierarchy.append((parent, child_right, 1))

    return hierarchy, hierarchical_topics
