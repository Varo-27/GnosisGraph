from sqlmodel import Session, select
from database import engine
from models.Article import Article
from models.ArticleAuthor import ArticleAuthor # Importa tu tabla intermedia

def check_orphans():
    with Session(engine) as session:
        # Buscamos artículos cuyos IDs no estén en la tabla intermedia
        statement = select(Article).where(
            Article.id.not_in(select(ArticleAuthor.article_id))
        )
        results = session.exec(statement).all()
        
        print(f"\n📊 --- AUDITORÍA DE CONTENIDO ---")
        if not results:
            print("✅ ¡Perfecto! Todos los artículos tienen al menos un autor.")
        else:
            print(f"⚠️ Se han encontrado {len(results)} artículos sin autor:")
            for art in results:
                print(f"   - [{art.id}] {art.title[:50]}... ({art.url})")
        
        print(f"----------------------------------\n")

if __name__ == "__main__":
    check_orphans()