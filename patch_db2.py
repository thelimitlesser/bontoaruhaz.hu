import sqlite3

def update_db():
    conn = sqlite3.connect('prisma/dev.db')
    cursor = conn.cursor()
    
    cursor.execute("SELECT id, name FROM Part WHERE subcategoryId = 'subcat-karosszeria-elem-100'")
    rows = cursor.fetchall()
    
    print(f"Found {len(rows)} products to update:")
    for row in rows:
        print(f" - {row[1]} (id: {row[0]})")
        
    if rows:
        cursor.execute("UPDATE Part SET subcategoryId = 'subcat-body-exterior-1000' WHERE subcategoryId = 'subcat-karosszeria-elem-100'")
        conn.commit()
        print("Update successful.")
        
    conn.close()

if __name__ == "__main__":
    update_db()
