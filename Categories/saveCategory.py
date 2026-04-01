from sqlmodel import Session
from database import engine
from models import Category

def save_category(name, slug, url, type):
    category = Category(name=name, slug=slug, url=url, type=type)

    with Session(engine) as session:
        session.add(category)
        session.commit()
        session.refresh(category)

    print("Autor guardado con ID:", category.id)
