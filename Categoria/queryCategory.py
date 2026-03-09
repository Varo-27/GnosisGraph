from sqlmodel import Session, select
from database import engine
from .Category import Category

def get_all_categories():
    with Session(engine) as session:
        return session.exec(select(Category)).all()
