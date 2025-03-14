import os
from flask import Flask, render_template, request, redirect, url_for, flash, make_response, session
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

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.String, primary_key=True)
    email = db.Column(db.String, unique=True, nullable=False)
    first_name = db.Column(db.String, nullable=False)
    last_name = db.Column(db.String, nullable=False)
    password_hash = db.Column(db.Text, nullable=False)
    reset_code = db.Column(db.String)
    terms = db.Column(db.Boolean, nullable=False)  # Add this line

# Initialize the database
def init_db():
    db.create_all()

def signup_user(email, password, first_name, last_name, terms):
    user = User.query.filter_by(email=email).first()
    if user:
        return 'Email is already in use!'

    user_id = str(uuid.uuid4())
    salted_password = password + user_id
    hashed_password = generate_password_hash(salted_password)

    new_user = User(
        id=user_id,
        email=email,
        first_name=first_name,
        last_name=last_name,
        password_hash=hashed_password,
        terms=terms  # Save the terms value
    )
    
    db.session.add(new_user)
    db.session.commit()
    return 'Signup successful! Please log in.'


def login_user(email, password):
    user = User.query.filter_by(email=email).first()
    if user:
        salted_password = password + str(user.id)  # Ensure the password is salted with user ID
        if check_password_hash(user.password_hash, salted_password):
            return user  # Return user object if password is correct
    return None  # Return None if the user does not exist or password is incorrect

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

# Automatically log the user in based on cookies
@app.before_request
def check_remembered_user():
    user_id = request.cookies.get('user_id')  # Retrieve user_id from cookie

    if user_id and 'user_id' not in session:  # If user_id exists in cookie but is not in session
        user = User.query.filter_by(id=user_id).first()
        if user:
            session['user_id'] = user.id  # Set user_id in session

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
        terms = request.form.get('terms')  # Get the 'terms' checkbox value (either 'on' or None)

        if terms is None:
            flash('You must agree to the terms and conditions!', 'error')
            return render_template('signup.html')

        terms = True  # If checkbox is checked, it will be 'on'; if not, 'None'

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
        remember_me = request.form.get('remember')  # Check if "remember me" is selected

        if not email or not password:
            flash("Email and password are required", "error")
            return redirect(url_for('login'))

        user = login_user(email, password)
        if user:
            flash('Login successful!', 'success')

            # If "Remember Me" is checked, set a persistent cookie (for 30 days)
            if remember_me:
                resp = make_response(redirect(url_for('dashboard')))  # Redirect to the dashboard
                resp.set_cookie('user_id', user.id, max_age=60*60*24*30, secure=True, httponly=True)  # Cookie for 30 days
                return resp
            else:
                # Regular session cookie for non-remembered users (expires when browser is closed)
                session['user_id'] = user.id
                return redirect(url_for('dashboard'))
        else:
            flash('Invalid login credentials', 'error')

    return render_template('login.html')

@app.route('/forgotpasswordemail', methods=['GET', 'POST'])
def forgotpasswordemail():
    if request.method == 'POST':
        email = request.form['email']

        # Query the user by email using SQLAlchemy
        user = User.query.filter_by(email=email).first()

        if user:
            # Generate a unique reset code
            reset_code = generate_reset_code()  # Assuming you have a function to generate this code
            user.reset_code = reset_code  # Store the reset code in the user's record
            db.session.commit()  # Commit changes to the database

            # Send the reset email with the reset code
            if send_reset_email(email, reset_code):  # Assuming you have a function for sending email
                flash('Reset code sent to your email!', 'success')
                return redirect(url_for('resetpassword'))  # Redirect to the reset password page
            else:
                flash('Failed to send email. Please try again later.', 'error')
        else:
            flash('Email not found!', 'error')

    return render_template('forgotpasswordemail.html')

@app.route('/resetpassword', methods=['GET', 'POST'])
def resetpassword():
    if request.method == 'POST':
        reset_code = request.form['reset_code']
        new_password = request.form['new_password']
        confirm_password = request.form['confirm_password']

        # Validate if the passwords match
        if new_password != confirm_password:
            flash('Passwords do not match!', 'error')
            return redirect(url_for('resetpassword'))

        # Query the user by reset code
        user = User.query.filter_by(reset_code=reset_code).first()

        if user:
            # Hash the new password with the user's ID as salt
            salted_password = new_password + str(user.id)  # Ensure user.id is a string
            hashed_password = generate_password_hash(salted_password)

            # Update the user's password and clear the reset code
            user.password_hash = hashed_password
            user.reset_code = None  # Clear the reset code once it's used
            db.session.commit()  # Commit changes to the database

            flash('Password reset successful! Please log in.', 'success')
            return redirect(url_for('login'))  # Redirect the user to the login page
        else:
            flash('Invalid reset code.', 'error')

    return render_template('resetpassword.html')

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

@app.route('/logout')
def logout():
    session.pop('user_id', None)  # Remove from session
    resp = make_response(redirect(url_for('index')))  # Redirect to home or login page
    resp.delete_cookie('user_id')  # Remove the user_id cookie
    flash('You have been logged out!', 'info')
    return resp

@app.route('/terms')
def terms():
    return render_template('terms.html')

if __name__ == '__main__':
    init_db()
    app.run(debug=True)
