from sqlmodel import Session, select
from database import engine
from models import Tag

def get_all_tags():
    with Session(engine) as session:
        return session.exec(select(Tag)).all()
