cat > backend/db_connection.py << 'EOF'
import mysql.connector
from mysql.connector import Error

def get_connection(host="localhost", user="root", password="", database=None):
 
    try:
        conn = mysql.connector.connect(
            host=host,
            user=user,
            password=password,
            database=database
        )
        if conn.is_connected():
            print("Database connection successful")
        return conn
    except Error as e:
        print("Error while connecting to MySQL:", e)
        return None

if __name__ == "__main__":
    # (replace credentials with your own)
    conn = get_connection(host="localhost", user="root", password="your_password", database="your_db")
    if conn:
        conn.close()
EOF
