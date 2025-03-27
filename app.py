import os
import psycopg2
from flask import Flask, jsonify, render_template, request, redirect, url_for, flash, make_response, session
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
import uuid
import random
import requests
from dotenv import load_dotenv
from datetime import datetime, timedelta
from supabase import create_client, Client
from psycopg2.extras import RealDictCursor

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "Jacques")

# Initialize Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

# User class for Flask-Login
class User(UserMixin):
    def __init__(self, user_id, email, first_name, last_name):
        self.id = user_id
        self.email = email
        self.first_name = first_name
        self.last_name = last_name

@login_manager.user_loader
def load_user(user_id):
    conn = get_supabase_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE user_id = %s", (user_id,))
    user = cursor.fetchone()
    conn.close()
    
    if user:
        return User(user[0], user[1], user[2], user[3])
    return None

# Get Alpha Vantage API key from environment variable
ALPHA_VANTAGE_API_KEY = os.getenv('ALPHA_VANTAGE_API_KEY', 'demo')

# Get Finnhub API key from environment variable
FINNHUB_API_KEY = os.getenv('FINNHUB_API_KEY', 'demo')

# Supabase configuration
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')
SUPABASE_DB_URL = os.getenv('SUPABASE_DB_URL')

# Initialize Supabase client only if credentials are available
supabase = None
if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        print(f"Warning: Failed to initialize Supabase client: {e}")
        supabase = None

@app.route('/index')
def trade():
    return render_template('index.html', api_key=ALPHA_VANTAGE_API_KEY)

@app.route('/api/stock/<symbol>')
def get_stock(symbol):
    try:
        url = f'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={symbol}&apikey={ALPHA_VANTAGE_API_KEY}'
        response = requests.get(url)
        response.raise_for_status()  # Raise an exception for bad status codes
        data = response.json()
        
        if 'Error Message' in data:
            return jsonify({'error': data['Error Message']}), 400
            
        if 'Note' in data:  # API rate limit message
            return jsonify({'error': 'API rate limit reached. Please try again later.'}), 429
            
        return jsonify(data)
    except requests.exceptions.RequestException as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/intraday/<symbol>')
def get_intraday(symbol):
    try:
        interval = request.args.get('interval', '5min')
        url = f'https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol={symbol}&interval={interval}&apikey={ALPHA_VANTAGE_API_KEY}'
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        
        if 'Error Message' in data:
            return jsonify({'error': data['Error Message']}), 400
            
        if 'Note' in data:  # API rate limit message
            return jsonify({'error': 'API rate limit reached. Please try again later.'}), 429
            
        return jsonify(data)
    except requests.exceptions.RequestException as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/daily/<symbol>')
def get_daily(symbol):
    try:
        url = f'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol={symbol}&apikey={ALPHA_VANTAGE_API_KEY}'
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        
        if 'Error Message' in data:
            return jsonify({'error': data['Error Message']}), 400
            
        if 'Note' in data:  # API rate limit message
            return jsonify({'error': 'API rate limit reached. Please try again later.'}), 429
            
        return jsonify(data)
    except requests.exceptions.RequestException as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/search')
def search_stocks():
    query = request.args.get('q', '')
    if not query:
        return jsonify({'error': 'No search query provided'})
    
    try:
        # Finnhub API endpoint for symbol search
        url = f"https://finnhub.io/api/v1/search?q={query}&token={FINNHUB_API_KEY}"
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        
        if 'result' not in data:
            return jsonify({'error': 'No results found'})
        
        # Get current prices for the search results
        results = []
        for stock in data['result'][:10]:  # Limit to 10 results
            try:
                # Get current quote
                quote_url = f"https://finnhub.io/api/v1/quote?symbol={stock['symbol']}&token={FINNHUB_API_KEY}"
                quote_response = requests.get(quote_url)
                quote_response.raise_for_status()
                quote_data = quote_response.json()
                
                if quote_data and quote_data.get('c'):  # If we have current price
                    results.append({
                        'symbol': stock['symbol'],
                        'description': stock['description'],
                        'price': quote_data['c'],
                        'change': quote_data['d'],
                        'changePercent': quote_data['dp']
                    })
            except Exception as e:
                print(f"Error fetching quote for {stock['symbol']}: {str(e)}")
                continue
        
        return jsonify({'result': results})
        
    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'API request failed: {str(e)}'})
    except Exception as e:
        return jsonify({'error': f'An error occurred: {str(e)}'})

def get_db_connection():
    if not SUPABASE_DB_URL:
        raise Exception("SUPABASE_DB_URL environment variable is not set")
    return psycopg2.connect(SUPABASE_DB_URL)

@app.route('/get_balance/<user_id>')
def get_balance(user_id):
    try:
        if not SUPABASE_DB_URL:
            return jsonify({'error': 'Database connection not configured'}), 500
            
        conn = get_supabase_connection()
        cur = conn.cursor()
        
        # Query the users table for balance
        cur.execute('SELECT balance FROM users WHERE user_id = %s', (user_id,))
        result = cur.fetchone()
        
        cur.close()
        conn.close()
        
        if result and result[0] is not None:
            return jsonify({'balance': float(result[0])})
        else:
            return jsonify({'balance': 0.00})
            
    except Exception as e:
        print(f"Error fetching balance: {e}")
        return jsonify({'balance': 0.00})

# Database configuration (Supabase PostgreSQL)
SUPABASE_DB_URL = os.getenv("SUPABASE_DB_URL")

# Connect to Supabase PostgreSQL
def get_supabase_connection():
    return psycopg2.connect(SUPABASE_DB_URL)

def init_supabase_db():
    conn = get_supabase_connection()
    cursor = conn.cursor()
    cursor.execute('''CREATE TABLE IF NOT EXISTS users (
                        user_id TEXT PRIMARY KEY,
                        email TEXT UNIQUE NOT NULL,
                        first_name TEXT NOT NULL,
                        last_name TEXT NOT NULL,
                        password_hash TEXT NOT NULL,
                        reset_code TEXT,
                        terms BOOLEAN NOT NULL,
                        balance DECIMAL(10,2) DEFAULT 0.00,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP)''')
    
    cursor.execute('''CREATE TABLE IF NOT EXISTS watchlist (
                        watchlist_id TEXT PRIMARY KEY,
                        user_id TEXT NOT NULL,
                        watchlist_name TEXT NOT NULL,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (user_id) REFERENCES users(user_id))''')
    
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
    
    # Generate unique user_id
    user_id = str(uuid.uuid4())
    
    # Salt the password with the user_id for extra security
    salted_password = password + user_id
    hashed_password = generate_password_hash(salted_password)
    
    # Get the current timestamp with timezone
    current_timestamp = datetime.utcnow()

    cursor.execute("""
        INSERT INTO users (user_id, email, first_name, last_name, password_hash, terms, created_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """, (user_id, email, first_name, last_name, hashed_password, terms, current_timestamp))
    
    # Create default watchlist for the user
    watchlist_id = str(uuid.uuid4())
    cursor.execute("""
        INSERT INTO watchlist (watchlist_id, user_id, watchlist_name, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s)
    """, (watchlist_id, user_id, "My Watchlist", current_timestamp, current_timestamp))
    
    conn.commit()
    conn.close()
    
    return 'Signup successful! Please log in.'

def authenticate_user(email, password):
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
    if 'user_id' in session:
        return redirect(url_for('dashboard'))
    return render_template('login.html')

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
            # Create a browser session for the new user
            user_data = authenticate_user(email, password)
            if user_data:
                user = User(user_data[0], user_data[1], user_data[2], user_data[3])
                login_user(user)
                session.permanent = False  # Session lasts until browser closes
                session['user_id'] = user_data[0]
                session['email'] = email
                flash('Account created and logged in successfully!', 'success')
                return redirect(url_for('dashboard'))
            else:
                flash('Account created but login failed. Please log in manually.', 'warning')
                return redirect(url_for('login'))
                
    return render_template('signup.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    # Check if the user is already logged in
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
    
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        
        if not email or not password:
            flash("Email and password are required", "error")
            return redirect(url_for('login'))

        user_data = authenticate_user(email, password)
        if user_data:
            user = User(user_data[0], user_data[1], user_data[2], user_data[3])
            login_user(user)
            
            remember = 'remember' in request.form
            if remember:
                session.permanent = True
                app.permanent_session_lifetime = timedelta(days=30)
            
            flash('Login successful!', 'success')
            return redirect(url_for('dashboard'))
        else:
            flash('Invalid login credentials', 'error')

    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash('You have been logged out.', 'success')
    return redirect(url_for('login'))

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
@login_required
def dashboard():
    return render_template('dashboard.html', user_id=current_user.id)

@app.route('/stocks')
@login_required
def stocks():
    return render_template('stocks.html', user_id=current_user.id)

@app.route('/homepage')
def homepage():
    return render_template('homepage.html')

@app.route('/terms')
def terms():
    return render_template('terms.html')

@app.route('/api/watchlist', methods=['GET'])
def get_watchlist():
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({'error': 'User ID is required'}), 400

        # Query watchlist from Supabase
        response = supabase.table('watchlist').select('*').eq('user_id', user_id).execute()
        
        if response.error:
            return jsonify({'error': str(response.error)}), 500
            
        return jsonify(response.data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/watchlist', methods=['POST'])
def add_to_watchlist():
    try:
        data = request.json
        user_id = data.get('user_id')
        symbol = data.get('symbol')
        
        if not user_id or not symbol:
            return jsonify({'error': 'User ID and symbol are required'}), 400

        # Check if stock is already in watchlist
        existing = supabase.table('watchlist').select('*').eq('user_id', user_id).eq('symbol', symbol).execute()
        
        if existing.data:
            return jsonify({'error': 'Stock already in watchlist'}), 400

        # Add to watchlist
        response = supabase.table('watchlist').insert({
            'user_id': user_id,
            'symbol': symbol,
            'created_at': datetime.now().isoformat()
        }).execute()
        
        if response.error:
            return jsonify({'error': str(response.error)}), 500
            
        return jsonify(response.data[0])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/watchlist', methods=['DELETE'])
def remove_from_watchlist():
    try:
        data = request.json
        user_id = data.get('user_id')
        symbol = data.get('symbol')
        
        if not user_id or not symbol:
            return jsonify({'error': 'User ID and symbol are required'}), 400

        # Remove from watchlist
        response = supabase.table('watchlist').delete().eq('user_id', user_id).eq('symbol', symbol).execute()
        
        if response.error:
            return jsonify({'error': str(response.error)}), 500
            
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/forex/<symbol>')
def get_forex_data(symbol):
    try:
        # Format the symbol for Alpha Vantage
        from_currency = symbol[:3]
        to_currency = symbol[3:]
        
        # Call Alpha Vantage API for forex data
        url = f'https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency={from_currency}&to_currency={to_currency}&apikey={ALPHA_VANTAGE_API_KEY}'
        response = requests.get(url)
        data = response.json()
        
        if "Realtime Currency Exchange Rate" in data:
            rate_data = data["Realtime Currency Exchange Rate"]
            price = float(rate_data["5. Exchange Rate"])
            
            # Calculate a random change percentage for demo
            change = round(random.uniform(-1.5, 1.5), 2)
            
            return jsonify({
                'symbol': f'{from_currency}/{to_currency}',
                'name': f'{from_currency}/{to_currency}',
                'price': price,
                'change': change,
                'sell': price * 0.9995,  # Slightly lower for sell
                'buy': price * 1.0005    # Slightly higher for buy
            })
        else:
            return jsonify({'error': 'Unable to fetch forex data'}), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/forex/history/<symbol>')
def get_forex_history(symbol):
    try:
        # Format the symbol for Alpha Vantage
        from_currency = symbol[:3]
        to_currency = symbol[3:]
        
        # Call Alpha Vantage API for intraday data
        url = f'https://www.alphavantage.co/query?function=FX_INTRADAY&from_symbol={from_currency}&to_symbol={to_currency}&interval=5min&apikey={ALPHA_VANTAGE_API_KEY}'
        response = requests.get(url)
        data = response.json()
        
        if "Time Series FX (5min)" in data:
            time_series = data["Time Series FX (5min)"]
            timestamps = []
            prices = []
            
            # Get the last 100 data points
            for timestamp, values in list(time_series.items())[:100]:
                timestamps.append(timestamp)
                prices.append(float(values["4. close"]))
            
            return jsonify({
                'timestamps': timestamps,
                'prices': prices
            })
        else:
            return jsonify({'error': 'Unable to fetch forex history'}), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/user/<int:user_id>/balance')
@login_required
def get_user_balance(user_id):
    try:
        # Ensure the user can only access their own balance
        if user_id != current_user.id:
            return jsonify({'error': 'Unauthorized'}), 403
            
        # Get user's balance from Supabase database
        conn = get_supabase_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT balance FROM users WHERE user_id = %s', (user_id,))
        result = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        if result and result[0] is not None:
            return jsonify({'balance': float(result[0])})
        else:
            return jsonify({'balance': 0.00})
            
    except Exception as e:
        print(f"Error fetching balance: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
