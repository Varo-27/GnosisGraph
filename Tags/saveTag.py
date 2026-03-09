from sqlmodel import Session
from database import engine
from .Tag import Tag

def save_tags_bulk(tags: list[dict]):
    objects = [Tag(name=t["name"], slug=t["slug"], url=t["url"]) for t in tags]

    with Session(engine) as session:
        session.add_all(objects)
        session.commit()

    print(f"{len(objects)} tags guardados.")
