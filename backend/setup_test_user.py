import sqlite3

def setup_test_user():
    DB_PATH = "feelconomy.db"
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create tables if they don't exist (though main.py does this too)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            email TEXT PRIMARY KEY,
            name TEXT,
            phone TEXT,
            password TEXT
        )
    ''')
    
    # Insert a test user
    cursor.execute("INSERT OR REPLACE INTO users (email, name, phone, password) VALUES (?, ?, ?, ?)", 
                   ('user@test.com', 'Test User', '010-1234-5678', 'password123'))
    
    conn.commit()
    conn.close()
    print("Successfully added test user: user@test.com / password123")

if __name__ == "__main__":
    setup_test_user()
