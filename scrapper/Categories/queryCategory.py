from sqlmodel import Session, select
from database import engine
from models import Category

def get_all_categories():
    with Session(engine) as session:
        return session.exec(select(Category)).all()
