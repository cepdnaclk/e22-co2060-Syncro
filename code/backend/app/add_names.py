from .database import engine
from sqlalchemy import text

def add_columns():
    with engine.begin() as conn:
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN first_name VARCHAR;"))
            print("Added first_name column.")
        except Exception as e:
            print(f"first_name already exists or error: {e}")
            
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN last_name VARCHAR;"))
            print("Added last_name column.")
        except Exception as e:
            print(f"last_name already exists or error: {e}")

if __name__ == "__main__":
    add_columns()
