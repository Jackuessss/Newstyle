import os
import psycopg2
from flask import Flask, render_template, request, redirect, url_for, flash, make_response, session
from werkzeug.security import generate_password_hash, check_password_hash
import uuid
import random
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "Jacques")

# Database configuration (Supabase PostgreSQL)
SUPABASE_DB_URL = os.getenv("SUPABASE_DB_URL")

# Connect to Supabase PostgreSQL
def get_supabase_connection():
    return psycopg2.connect(SUPABASE_DB_URL)

def init_supabase_db():
    conn = get_supabase_connection()
    cursor = conn.cursor()
    cursor.execute('''CREATE TABLE IF NOT EXISTS users (
                        id TEXT PRIMARY KEY,
                        email TEXT UNIQUE NOT NULL,
                        first_name TEXT NOT NULL,
                        last_name TEXT NOT NULL,
                        password_hash TEXT NOT NULL,
                        reset_code TEXT,
                        terms BOOLEAN NOT NULL)''')
    conn.commit()
    conn.close()

# Initialize the database
init_supabase_db()

# SparkPost configuration
SPARKPOST_API_KEY = os.getenv("SPARKPOST_API_KEY")
SPARKPOST_FROM_EMAIL = os.getenv("SPARKPOST_FROM_EMAIL")

def signup_user(email, password, first_name, last_name, terms):
    conn = get_supabase_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()
    
    if user:
        return 'Email is already in use!'
    
    user_id = str(uuid.uuid4())
    salted_password = password + user_id
    hashed_password = generate_password_hash(salted_password)
    
    cursor.execute("INSERT INTO users (id, email, first_name, last_name, password_hash, terms) VALUES (%s, %s, %s, %s, %s, %s)",
                   (user_id, email, first_name, last_name, hashed_password, terms))
    conn.commit()
    conn.close()
    return 'Signup successful! Please log in.'

def login_user(email, password):
    conn = get_supabase_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()
    conn.close()
    
    if user:
        salted_password = password + user[0]
        if check_password_hash(user[4], salted_password):
            return user
    return None

def generate_reset_code():
    return str(random.randint(100000, 999999))

def send_reset_email(email, reset_code):
    reset_link = "https://penguintrader.co.uk/resetpassword"
    
    url = "https://api.sparkpost.com/api/v1/transmissions"
    headers = {
        "Authorization": SPARKPOST_API_KEY,
        "Content-Type": "application/json"
    }
    payload = {
        "options": {"sandbox": False},
        "content": {
            "from": SPARKPOST_FROM_EMAIL,
            "subject": "Password Reset Code",
            "html": f"""
            <h1>Reset Your Password</h1>
            <p>Use the code below to reset your password:</p>
            <h2>{reset_code}</h2>
            <a href='{reset_link}'>Reset Password</a>
            """
        },
        "recipients": [{"address": {"email": email}}]
    }
    response = requests.post(url, json=payload, headers=headers)
    return response.status_code == 200

# Routes
@app.route('/')
def index():
    return render_template('homepage.html')

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        first_name = request.form['first_name']
        last_name = request.form['last_name']
        terms = request.form.get('terms')

        if terms is None:
            flash('You must agree to the terms and conditions!', 'error')
            return render_template('signup.html')

        terms = True  

        message = signup_user(email, password, first_name, last_name, terms)
        flash(message)

        if 'Signup successful!' in message:
            return redirect(url_for('dashboard'))
    return render_template('signup.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        
        if not email or not password:
            flash("Email and password are required", "error")
            return redirect(url_for('login'))

        user = login_user(email, password)
        if user:
            flash('Login successful!', 'success')
            session['user_id'] = user[0]
            return redirect(url_for('dashboard'))
        else:
            flash('Invalid login credentials', 'error')

    return render_template('login.html')

@app.route('/resetpassword', methods=['GET', 'POST'])
def resetpassword():
    if request.method == 'POST':
        reset_code = request.form['reset_code']
        new_password = request.form['new_password']
        confirm_password = request.form['confirm_password']

        if new_password != confirm_password:
            flash('Passwords do not match!', 'error')
            return redirect(url_for('resetpassword'))

        conn = get_supabase_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE reset_code = %s", (reset_code,))
        user = cursor.fetchone()

        if user:
            salted_password = new_password + user[0]
            hashed_password = generate_password_hash(salted_password)

            cursor.execute("UPDATE users SET password_hash = %s, reset_code = NULL WHERE id = %s", (hashed_password, user[0]))
            conn.commit()
            conn.close()

            flash('Password reset successful! Please log in.', 'success')
            return redirect(url_for('login'))
        else:
            flash('Invalid reset code.', 'error')

    return render_template('resetpassword.html')

@app.route('/forgotpasswordemail', methods=['GET', 'POST'])
def forgotpasswordemail():
    if request.method == 'POST':
        email = request.form['email']

        conn = get_supabase_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()

        if user:
            reset_code = generate_reset_code()
            cursor.execute("UPDATE users SET reset_code = %s WHERE email = %s", (reset_code, email))
            conn.commit()
            conn.close()

            if send_reset_email(email, reset_code):
                flash('Reset code sent to your email!', 'success')
                return redirect(url_for('resetpassword'))
            else:
                flash('Failed to send email. Please try again later.', 'error')
        else:
            flash('Email not found!', 'error')

    return render_template('forgotpasswordemail.html')

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

@app.route('/homepage')
def homepage():
    return render_template('homepage.html')

@app.route('/logout')
def logout():
    session.pop('user_id', None) 
    flash('You have been logged out!', 'info')
    return redirect(url_for('index'))

@app.route('/terms')
def terms():
    return render_template('terms.html')

if __name__ == '__main__':
    app.run(debug=True)
