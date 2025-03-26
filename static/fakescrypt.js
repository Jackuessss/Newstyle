// Alpha Vantage API key
const API_KEY = 'LA9DKLX13DQCKHV3'; // Replace with your Alpha Vantage API key
        
// Sample data for demo purposes
const sampleStocks = [
    {
        symbol: 'TSLA',
        name: 'Tesla',
        price: 274.43,
        change: 25.06,
        changePercent: 10.05,
        color: '#E31937',
        logoUrl: 'https://i.imgur.com/ks33QCe.png',
        isPositive: true
    },
    {
        symbol: 'NVDA',
        name: 'Nvidia',
        price: 121.92,
        change: 4.15,
        changePercent: 3.52,
        color: '#76B900',
        logoUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFAkwq5rkkbUsQuJvSThsHS05SkYYejcUijA&s',
        isPositive: true
    },
    {
        symbol: 'MIGO',
        name: 'MicroAlgo',
        price: 9.84,
        change: 7.34,
        changePercent: 293.60,
        color: '#FF0000',
        logoUrl: 'https://i.imgur.com/sCHHSNG.png',
        isPositive: true
    },
    {
        symbol: 'PLTR',
        name: 'Palantir',
        price: 96.10,
        change: 5.10,
        changePercent: 5.60,
        color: '#000000',
        logoUrl: 'https://static.stocktitan.net/company-logo/pltr.png',
        isPositive: true
    },
    {
        symbol: 'MSTR',
        name: 'MicroStrategy',
        price: 331.16,
        change: 11.87,
        changePercent: 3.72,
        color: '#CC0000',
        logoUrl: 'https://i.imgur.com/RG3TgEY.png',
        isPositive: true
    }
];

const watchlist = new Set(['TSLA', 'NVDA', 'MIGO', 'PLTR', 'MSTR']);

// Sample chart data for demo purposes
const generateChartData = (days = 30) => {
    const data = [];
    let price = 120;
    const today = new Date();
    
    for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - (days - i));
        
        // Generate random price movements
        const open = price;
        const close = open + (Math.random() * 4 - 2);
        const high = Math.max(open, close) + Math.random() * 1.5;
        const low = Math.min(open, close) - Math.random() * 1.5;
        
        data.push({
            x: date,
            o: open,
            h: high,
            l: low,
            c: close
        });
        
        price = close;
    }
    
    return data;
};

// Populate stock list
const stockListEl = document.getElementById('stock-list');

function formatPrice(price) {
    return price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatChange(change, isPercent = false) {
    if (isPercent) {
        return change.toFixed(2) + '%';
    }
    return change.toFixed(2);
}

function createStockElement(stock) {
    const changeColorClass = stock.isPositive ? 'text-positive' : 'text-negative';
    const changePrefix = stock.isPositive ? '+' : '';
    
    const stockEl = document.createElement('div');
    stockEl.className = 'p-3 dark:bg-card bg-gray-50 rounded-lg flex items-center justify-between cursor-pointer hover:dark:bg-opacity-70 hover:bg-gray-100 transition-colors';
    stockEl.dataset.symbol = stock.symbol;
    
    stockEl.innerHTML = `
        <div class="flex items-center">
            <div class="w-8 h-8 rounded-lg mr-3 flex items-center justify-center" style="background-color: ${stock.color}">
                <img src="${stock.logoUrl}" alt="${stock.name}" class="w-6 h-6">
            </div>
            <div>
                <div class="font-semibold">${stock.name}</div>
                <div class="text-xs text-gray-400">${stock.symbol}</div>
            </div>
        </div>
        <div class="text-right">
            <div class="font-semibold">$${formatPrice(stock.price)}</div>
            <div class="text-xs ${changeColorClass}">${changePrefix}${formatChange(stock.change)} (${formatChange(stock.changePercent, true)})</div>
        </div>
    `;
    
    stockEl.addEventListener('click', () => {
        showStockDetail(stock);
    });
    
    return stockEl;
}

function populateStockList(stocks) {
    stockListEl.innerHTML = '';
    stocks.forEach(stock => {
        stockListEl.appendChild(createStockElement(stock));
    });
}

// Show stock detail
function showStockDetail(stock) {
    const detailEl = document.getElementById('stock-detail');
    detailEl.classList.remove('hidden');
    
    document.getElementById('detail-name').textContent = stock.name;
    document.getElementById('detail-symbol').textContent = stock.symbol;
    
    const changePrefix = stock.isPositive ? '+' : '';
    const changeText = `${changePrefix}${formatChange(stock.change)} (${formatChange(stock.changePercent, true)}) today`;
    const changeEl = document.getElementById('detail-change');
    changeEl.textContent = changeText;
    changeEl.className = stock.isPositive ? 'text-positive' : 'text-negative';
    
    document.getElementById('detail-sell-price').textContent = `$${formatPrice(stock.price)}`;
    document.getElementById('detail-buy-price').textContent = `$${formatPrice(stock.price + 0.03)}`;
    
    updateChart();
}

// Initialize chart
let stockChart;

function updateChart(timeframe = '1D') {
    const chartData = generateChartData(timeframe === '1D' ? 60 : 
        timeframe === '1W' ? 7 : 
        timeframe === '1M' ? 30 : 
        timeframe === '3M' ? 90 : 
        timeframe === '1Y' ? 365 : 730);
    
    const ctx = document.getElementById('stock-chart').getContext('2d');
    
    if (stockChart) {
        stockChart.destroy();
    }
    
    stockChart = new Chart(ctx, {
        type: 'candlestick',
        data: {
            datasets: [{
                label: 'Stock Price',
                data: chartData,
                color: {
                    up: 'rgba(22, 199, 132, 1)',
                    down: 'rgba(234, 57, 67, 1)',
                    unchanged: 'rgba(156, 163, 175, 1)',
                }
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: timeframe === '1D' ? 'minute' : 
                            timeframe === '1W' ? 'day' : 
                            timeframe === '1M' ? 'day' : 
                            timeframe === '3M' ? 'week' : 
                            timeframe === '1Y' ? 'month' : 'month'
                    },
                    grid: {
                        display: false
                    },
                    ticks: {
                        maxRotation: 0,
                        color: 'rgba(156, 163, 175, 0.8)'
                    }
                },
                y: {
                    position: 'right',
                    grid: {
                        color: 'rgba(156, 163, 175, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(156, 163, 175, 0.8)'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: (ctx) => {
                            const point = ctx.raw;
                            return [
                                `Open: $${point.o.toFixed(2)}`,
                                `High: $${point.h.toFixed(2)}`,
                                `Low: $${point.l.toFixed(2)}`,
                                `Close: $${point.c.toFixed(2)}`
                            ];
                        }
                    }
                }
            }
        }
    });
}

// Set up time period buttons
const timeButtons = document.querySelectorAll('.time-button');
timeButtons.forEach(button => {
    button.addEventListener('click', () => {
        timeButtons.forEach(btn => btn.classList.remove('time-active'));
        button.classList.add('time-active');
        updateChart(button.textContent);
    });
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    populateStockList(sampleStocks);
    showStockDetail(sampleStocks[1]); // Show NVDA as default
    
    // Set up watchlist toggle
    const watchlistButton = document.querySelector('.watchlist-star');
    watchlistButton.addEventListener('click', () => {
        watchlistButton.classList.toggle('active');
        const currentSymbol = document.getElementById('detail-symbol').textContent;
        if (watchlist.has(currentSymbol)) {
            watchlist.delete(currentSymbol);
        } else {
            watchlist.add(currentSymbol);
        }
    });
});

/**
 * In a full application, the following functions would be implemented to fetch data from Alpha Vantage API
 */

// Function to fetch current stock price
async function fetchStockPrice(symbol) {
    try {
        const response = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`);
        const data = await response.json();
        
        if (data['Global Quote']) {
            const quote = data['Global Quote'];
            return {
                price: parseFloat(quote['05. price']),
                change: parseFloat(quote['09. change']),
                changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
                isPositive: parseFloat(quote['09. change']) >= 0
            };
        }
        
        return null;
    } catch (error) {
        console.error('Error fetching stock price:', error);
        return null;
    }
}

// Function to fetch intraday data for chart
async function fetchIntradayData(symbol, interval = '5min') {
    try {
        const response = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=${interval}&apikey=${API_KEY}`);
        const data = await response.json();
        
        if (data['Time Series (5min)']) {
            const timeSeries = data['Time Series (5min)'];
            const chartData = [];
            
            for (const [timestamp, values] of Object.entries(timeSeries)) {
                chartData.push({
                    x: new Date(timestamp),
                    o: parseFloat(values['1. open']),
                    h: parseFloat(values['2. high']),
                    l: parseFloat(values['3. low']),
                    c: parseFloat(values['4. close'])
                });
            }
            
            return chartData.reverse();
        }
        
        return [];
    } catch (error) {
        console.error('Error fetching intraday data:', error);
        return [];
    }
}

// Function to fetch daily data for chart
async function fetchDailyData(symbol) {
    try {
        const response = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${API_KEY}`);
        const data = await response.json();
        
        if (data['Time Series (Daily)']) {
            const timeSeries = data['Time Series (Daily)'];
            const chartData = [];
            
            for (const [timestamp, values] of Object.entries(timeSeries)) {
                chartData.push({
                    x: new Date(timestamp),
                    o: parseFloat(values['1. open']),
                    h: parseFloat(values['2. high']),
                    l: parseFloat(values['3. low']),
                    c: parseFloat(values['4. close'])
                });
            }
            
            return chartData.reverse();
        }
        
        return [];
    } catch (error) {
        console.error('Error fetching daily data:', error);
        return [];
    }
}

// Function to search for stocks
async function searchStocks(query) {
    try {
        const response = await fetch(`https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${query}&apikey=${API_KEY}`);
        const data = await response.json();
        
        if (data['bestMatches']) {
            return data['bestMatches'].map(match => ({
                symbol: match['1. symbol'],
                name: match['2. name'],
            }));
        }
        
        return [];
    } catch (error) {
        console.error('Error searching stocks:', error);
        return [];
    }
}
document.addEventListener("DOMContentLoaded", function () {
    const balanceElement = document.getElementById("balance");
    const userId = "{{ user_id }}";  // This gets the user ID from the Flask session

    // Function to fetch the balance from the server
    function fetchBalance() {
        fetch(`/get_balance/${userId}`)
            .then(response => response.json())
            .then(data => {
                if (data.balance) {
                    balanceElement.textContent = `£${data.balance.toFixed(2)}`;
                } else {
                    console.error('Balance not found:', data.error);
                }
            })
            .catch(error => console.error('Error fetching balance:', error));
    }

    // Update balance every 10 seconds
    setInterval(fetchBalance, 10000);  // 10000 ms = 10 seconds

    // Initial balance fetch
    fetchBalance();
});