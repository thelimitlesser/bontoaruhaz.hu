import sqlite3

def update_db():
    conn = sqlite3.connect('prisma/dev.db')
    cursor = conn.cursor()
    
    # Check how many products have subcategoryId = 'ajto'
    cursor.execute("SELECT id, name FROM Part WHERE subcategoryId = 'ajto'")
    rows = cursor.fetchall()
    
    print(f"Found {len(rows)} products to update:")
    for row in rows:
        print(f" - {row[1]} (id: {row[0]})")
        
    if rows:
        cursor.execute("UPDATE Part SET subcategoryId = 'subcat-karosszeria-elem-100' WHERE subcategoryId = 'ajto'")
        conn.commit()
        print("Update successful.")
        
    conn.close()

if __name__ == "__main__":
    update_db()
    
