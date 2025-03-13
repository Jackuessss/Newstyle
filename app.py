import os
from flask import Flask, render_template, request, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
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

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('SUPABASE_DB_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)


# SparkPost configuration
SPARKPOST_API_KEY = os.getenv("SPARKPOST_API_KEY")
SPARKPOST_FROM_EMAIL = os.getenv("SPARKPOST_FROM_EMAIL")

# User model
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.String, primary_key=True)
    email = db.Column(db.String, unique=True, nullable=False)
    first_name = db.Column(db.String, nullable=False)
    last_name = db.Column(db.String, nullable=False)
    password_hash = db.Column(db.Text, nullable=False)
    reset_code = db.Column(db.String)

# Initialize the database
def init_db():
    db.create_all()

# Signup new user
def signup_user(email, password, first_name, last_name):
    user = User.query.filter_by(email=email).first()
    if user:
        return 'Email is already in use!'
    
    user_id = str(uuid.uuid4())
    salted_password = password + user_id
    hashed_password = generate_password_hash(salted_password)

    new_user = User(id=user_id, email=email, first_name=first_name, last_name=last_name, password_hash=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    return 'Signup successful! Please log in.'

# Login user
def login_user(email, password):
    user = User.query.filter_by(email=email).first()
    if user:
        salted_password = password + user.id
        if check_password_hash(user.password_hash, salted_password):
            return 'Login successful!'
        else:
            return 'Invalid password.'
    return 'User not found.'

# Generate reset code
def generate_reset_code():
    return str(random.randint(100000, 999999))

# Send reset email via SparkPost
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

if __name__ == '__main__':
    init_db()
    app.run(debug=True)
