from sqlmodel import Session, select
from database import engine
from .Article import Article

def get_all_articles():
    with Session(engine) as session:
        return session.exec(select(Article)).all()
