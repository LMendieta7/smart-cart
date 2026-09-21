from sqlalchemy.exc import IntegrityError


class DataConflict(Exception):
    pass


def commit_changes(db, message):
    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise DataConflict(message) from error
