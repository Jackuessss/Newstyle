import os
from flask import Flask, render_template, request, redirect, url_for, flash
import sqlite3
import uuid
from werkzeug.security import generate_password_hash

DATABASE = 'user.db'

app = Flask(__name__)
app.secret_key = 'Jacques'



def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row 
    return conn


def init_db():
    if not os.path.exists(DATABASE):
        print(f"Database {DATABASE} does not exist. Creating it...")

    with app.app_context():
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                first_name TEXT NOT NULL,
                last_name TEXT NOT NULL,
                password_hash TEXT NOT NULL
            )
        ''')
        conn.commit()
        print("Database initialized with 'users' table.")  
        conn.close()

def signup_user(email, password, first_name, last_name):

    conn = get_db_connection()
    cursor = conn.cursor()


    cursor.execute('SELECT * FROM users WHERE email = ?', (email,))
    existing_user = cursor.fetchone()

    if existing_user:
        conn.close()
        return 'Email is already in use!'

    user_id = str(uuid.uuid4())
    salted_password = password + user_id
    hashed_password = generate_password_hash(salted_password)

    cursor.execute('''
        INSERT INTO users (id, email, first_name, last_name, password_hash)
        VALUES (?, ?, ?, ?, ?)
    ''', (user_id, email, first_name, last_name, hashed_password))

    conn.commit()
    conn.close()

    return 'Signup successful! Please log in.'

from werkzeug.security import check_password_hash

def login_user(email, password):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('SELECT id, email, password_hash FROM users WHERE email = ?', (email, email))
    user = cursor.fetchone()

    if user:
        user_id = user['id']
        stored_hash = user['password_hash']
        salted_password = password + user_id

        if check_password_hash(stored_hash, salted_password):
            conn.close()
            return 'Login successful!'
        else:
            conn.close()
            return 'Invalid password.'
    else:
        conn.close()
        return 'User not found.'

@app.route('/')
def index():
    return render_template('signup.html')


@app.route('/signup', methods=['GET', 'POST'])
def signup():
    email = request.form['email']
    password = request.form['password'] 
    first_name = request.form['first_name']
    last_name = request.form['last_name']

    message = signup_user(email, password, first_name, last_name)
    flash(message)

    if 'Signup successful!' in message:
        return redirect(url_for('dashboard'))
    return redirect(url_for('index'))


@app.route('/homepage')
def homepage():
    return render_template('homepage.html')

@app.route('/resetpassword', methods=['GET', 'POST'])
def resetpassword():
    return render_template('resetpassword.html')

@app.route('/forgotpasswordemail', methods=['GET', 'POST'])
def forgotpasswordemail():
    return render_template('forgotpasswordemail.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']

        message = login_user(email, password)
        flash(message)

        if 'Login successful!' in message:
            return redirect(url_for('homepage'))
        
    return render_template('login.html')


if __name__ == '__main__':
    init_db()  
    app.run(debug=True)