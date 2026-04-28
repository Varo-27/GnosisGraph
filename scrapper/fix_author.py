from database import engine
from sqlmodel import Session, select
from models.Article import Article
from models.Author import Author
from models.ArticleAuthor import ArticleAuthor

url_art = "https://elordenmundial.com/serbia-en-2015-bailando-con-la-ue-y-rusia-en-el-salon-de-la-osce/"

with Session(engine) as session:
    # Obtener el artículo
    art = session.exec(select(Article).where(Article.url == url_art)).first()
    
    # Obtener el autor
    auth = session.exec(select(Author).where(Author.name == "Curro Sánchez")).first()
    
    if art and auth:
        # Comprobar si la relación ya existe
        rel_exists = session.exec(select(ArticleAuthor).where(ArticleAuthor.article_id == art.id).where(ArticleAuthor.author_id == auth.id)).first()
        if not rel_exists:
            new_rel = ArticleAuthor(article_id=art.id, author_id=auth.id)
            session.add(new_rel)
            session.commit()
            print(f"✅ Enlace creado exitosamente: Artículo ID {art.id} -> Autor ID {auth.id}")
        else:
            print("INFO: La relación ya existe.")
    else:
        print(f"ERROR: Artículo encontrado: {bool(art)} | Autor encontrado: {bool(auth)}")

