import os
from flask import Flask, render_template, request, redirect, url_for, flash
import sqlite3
import uuid
import random
from werkzeug.security import generate_password_hash, check_password_hash
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

DATABASE = 'user.db'
app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "Jacques")

SPARKPOST_API_KEY = os.getenv("SPARKPOST_API_KEY")
SPARKPOST_FROM_EMAIL = os.getenv("SPARKPOST_FROM_EMAIL")

# Database connection
def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

# Initialize database
def init_db():
    with app.app_context():
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                first_name TEXT NOT NULL,
                last_name TEXT NOT NULL,
                password_hash TEXT NOT NULL,
                reset_code TEXT
            )
        ''')
        conn.commit()
        conn.close()

# Signup new user
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

# Login user
def login_user(email, password):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT id, password_hash FROM users WHERE email = ?', (email,))
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

# Generate reset code
def generate_reset_code():
    return str(random.randint(100000, 999999))

# Send reset email via SparkPost with styled HTML
def send_reset_email(email, reset_code):
    reset_link = f"https://penguintrader.co.uk/resetpassword"  # Update this for production!

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
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Password Reset Code</title>
            </head>
            <body style="font-family: Arial, sans-serif; background-color: #686279; color: #85828D; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background: #2B2637; padding: 40px; border-radius: 20px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2); text-align: center;">
                    <h1 style="color: white; font-size: 40px;">Reset Your Password</h1>
                    <p style="font-size: 14px; color: #A59EC1;">You requested to reset your password. Use the code below to proceed:</p>
                    
                    <div style="background: #3B364A; padding: 20px; border-radius: 5px; margin: 20px 0;">
                        <p style="font-size: 24px; color: #A59EC1; font-weight: bold; letter-spacing: 2px;">{reset_code}</p>
                    </div>
                    
                    <p style="font-size: 14px;">If you didn’t request this, you can safely ignore this email.</p>
                    <p style="font-size: 14px;">Need help? <a href="mailto:support@yourapp.com" style="color: #A59EC1; text-decoration: none;">Contact Support</a></p>
                    
                    <a href="{reset_link}" style="display: inline-block; padding: 12px 20px; background: #6955AF; color: white; text-decoration: none; border-radius: 5px; font-size: 16px;">Reset Password</a>
                </div>
            </body>
            </html>
            """
        },
        "recipients": [{"address": {"email": email}}]
    }
    response = requests.post(url, json=payload, headers=headers)
    return response.status_code == 200


# Routes
@app.route('/')
def index():
    return render_template('signup.html')

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        first_name = request.form['first_name']
        last_name = request.form['last_name']

        message = signup_user(email, password, first_name, last_name)
        flash(message)

        if 'Signup successful!' in message:
            return redirect(url_for('login'))
    return render_template('signup.html')

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

@app.route('/homepage')
def homepage():
    return render_template('homepage.html')

@app.route('/forgotpasswordemail', methods=['GET', 'POST'])
def forgotpasswordemail():
    if request.method == 'POST':
        email = request.form['email']
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM users WHERE email = ?', (email,))
        user = cursor.fetchone()

        if user:
            reset_code = generate_reset_code()
            cursor.execute('UPDATE users SET reset_code = ? WHERE email = ?', (reset_code, email))
            conn.commit()
            conn.close()

            # Send reset email to user
            if send_reset_email(email, reset_code):
                flash('Reset code sent to your email!', 'success')
                return redirect(url_for('resetpassword'))  # Redirect to reset password page
            else:
                flash('Failed to send email. Try again later.', 'error')
        else:
            flash('Email not found!', 'error')

        conn.close()
    return render_template('forgotpasswordemail.html')


@app.route('/resetpassword', methods=['GET', 'POST'])
def resetpassword():
    if request.method == 'POST':
        reset_code = request.form['reset_code']
        new_password = request.form['new_password']
        confirm_password = request.form['confirm_password']

        if new_password != confirm_password:
            flash('Passwords do not match!', 'error')
            return redirect(url_for('resetpassword'))

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT id FROM users WHERE reset_code = ?', (reset_code,))
        user = cursor.fetchone()

        if user:
            user_id = user['id']
            salted_password = new_password + user_id
            hashed_password = generate_password_hash(salted_password)

            cursor.execute('UPDATE users SET password_hash = ?, reset_code = NULL WHERE id = ?', (hashed_password, user_id))
            conn.commit()
            conn.close()

            flash('Password reset successful! Please log in.', 'success')
            return redirect(url_for('login'))
        else:
            flash('Invalid reset code.', 'error')

        conn.close()
    
    return render_template('resetpassword.html')

if __name__ == '__main__':
    init_db()
    app.run(debug=True)
