import os
import shutil
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Check if running in Vercel Serverless environment
is_vercel = os.environ.get("VERCEL") == "1"
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FILE = os.path.join(BASE_DIR, "resqverse.db")

if is_vercel:
    # Vercel filesystem is read-only, except for /tmp
    TMP_DB_PATH = "/tmp/resqverse.db"
    # If a seeded database exists, copy it to /tmp so we can read and write to it
    if not os.path.exists(TMP_DB_PATH) and os.path.exists(DB_FILE):
        shutil.copy2(DB_FILE, TMP_DB_PATH)
    SQLALCHEMY_DATABASE_URL = f"sqlite:///{TMP_DB_PATH}"
else:
    SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_FILE}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
