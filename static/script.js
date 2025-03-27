        // Alpha Vantage API key
        const API_KEY = 'LA9DKLX13DQCKHV3'; // Replace with your Alpha Vantage API key
        
        // Sample data for demo purposes
        const defaultStocks = [
            {
                symbol: 'AAPL',
                name: 'Apple Inc.',
                price: 175.84,
                change: 2.31,
                changePercent: 1.33,
                color: 'text-positive',
                logoUrl: 'https://logo.clearbit.com/apple.com',
                isPositive: true
            },
            {
                symbol: 'MSFT',
                name: 'Microsoft Corporation',
                price: 338.11,
                change: 4.22,
                changePercent: 1.26,
                color: 'text-positive',
                logoUrl: 'https://logo.clearbit.com/microsoft.com',
                isPositive: true
            },
            {
                symbol: 'AMZN',
                name: 'Amazon.com Inc.',
                price: 145.24,
                change: -1.12,
                changePercent: -0.76,
                color: 'text-negative',
                logoUrl: 'https://logo.clearbit.com/amazon.com',
                isPositive: false
            },
            {
                symbol: 'NVDA',
                name: 'NVIDIA Corporation',
                price: 495.22,
                change: 12.45,
                changePercent: 2.58,
                color: 'text-positive',
                logoUrl: 'https://logo.clearbit.com/nvidia.com',
                isPositive: true
            },
            {
                symbol: 'GOOGL',
                name: 'Alphabet Inc.',
                price: 140.93,
                change: 1.23,
                changePercent: 0.88,
                color: 'text-positive',
                logoUrl: 'https://logo.clearbit.com/google.com',
                isPositive: true
            },
            {
                symbol: 'TSLA',
                name: 'Tesla Inc.',
                price: 238.45,
                change: -5.67,
                changePercent: -2.32,
                color: 'text-negative',
                logoUrl: 'https://logo.clearbit.com/tesla.com',
                isPositive: false
            },
            {
                symbol: 'META',
                name: 'Meta Platforms Inc.',
                price: 474.99,
                change: 8.45,
                changePercent: 1.81,
                color: 'text-positive',
                logoUrl: 'https://logo.clearbit.com/meta.com',
                isPositive: true
            },
            {
                symbol: 'JPM',
                name: 'JPMorgan Chase & Co.',
                price: 172.34,
                change: 1.23,
                changePercent: 0.72,
                color: 'text-positive',
                logoUrl: 'https://logo.clearbit.com/jpmorganchase.com',
                isPositive: true
            },
            {
                symbol: 'V',
                name: 'Visa Inc.',
                price: 277.18,
                change: -2.45,
                changePercent: -0.88,
                color: 'text-negative',
                logoUrl: 'https://logo.clearbit.com/visa.com',
                isPositive: false
            },
            {
                symbol: 'WMT',
                name: 'Walmart Inc.',
                price: 155.23,
                change: 0.89,
                changePercent: 0.58,
                color: 'text-positive',
                logoUrl: 'https://logo.clearbit.com/walmart.com',
                isPositive: true
            },
            {
                symbol: 'MA',
                name: 'Mastercard Inc.',
                price: 445.67,
                change: 3.12,
                changePercent: 0.70,
                color: 'text-positive',
                logoUrl: 'https://logo.clearbit.com/mastercard.com',
                isPositive: true
            },
            {
                symbol: 'HD',
                name: 'Home Depot Inc.',
                price: 362.45,
                change: -4.56,
                changePercent: -1.24,
                color: 'text-negative',
                logoUrl: 'https://logo.clearbit.com/homedepot.com',
                isPositive: false
            },
            {
                symbol: 'BAC',
                name: 'Bank of America Corp.',
                price: 33.45,
                change: 0.23,
                changePercent: 0.69,
                color: 'text-positive',
                logoUrl: 'https://logo.clearbit.com/bankofamerica.com',
                isPositive: true
            },
            {
                symbol: 'PFE',
                name: 'Pfizer Inc.',
                price: 28.34,
                change: -0.45,
                changePercent: -1.56,
                color: 'text-negative',
                logoUrl: 'https://logo.clearbit.com/pfizer.com',
                isPositive: false
            },
            {
                symbol: 'NFLX',
                name: 'Netflix Inc.',
                price: 585.67,
                change: 12.34,
                changePercent: 2.15,
                color: 'text-positive',
                logoUrl: 'https://logo.clearbit.com/netflix.com',
                isPositive: true
            },
            {
                symbol: 'INTC',
                name: 'Intel Corporation',
                price: 43.12,
                change: -1.23,
                changePercent: -2.77,
                color: 'text-negative',
                logoUrl: 'https://logo.clearbit.com/intel.com',
                isPositive: false
            },
            {
                symbol: 'CSCO',
                name: 'Cisco Systems Inc.',
                price: 49.34,
                change: 0.67,
                changePercent: 1.38,
                color: 'text-positive',
                logoUrl: 'https://logo.clearbit.com/cisco.com',
                isPositive: true
            },
            {
                symbol: 'PEP',
                name: 'PepsiCo Inc.',
                price: 167.89,
                change: 1.45,
                changePercent: 0.87,
                color: 'text-positive',
                logoUrl: 'https://logo.clearbit.com/pepsi.com',
                isPositive: true
            },
            {
                symbol: 'ADBE',
                name: 'Adobe Inc.',
                price: 567.23,
                change: -8.90,
                changePercent: -1.54,
                color: 'text-negative',
                logoUrl: 'https://logo.clearbit.com/adobe.com',
                isPositive: false
            },
            {
                symbol: 'CMCSA',
                name: 'Comcast Corporation',
                price: 41.23,
                change: 0.34,
                changePercent: 0.83,
                color: 'text-positive',
                logoUrl: 'https://logo.clearbit.com/comcast.com',
                isPositive: true
            }
        ];
        
        // Initialize immediately when script loads
        document.addEventListener('DOMContentLoaded', async () => {
            // Fetch user balance
            const userId = document.getElementById('user-id').dataset.userId;
            try {
                const response = await fetch(`/api/user/${userId}/balance`);
                if (response.ok) {
                    const data = await response.json();
                    const balanceElement = document.getElementById('balance');
                    if (balanceElement) {
                        balanceElement.textContent = parseFloat(data.balance).toFixed(2);
                    }
                }
            } catch (error) {
                console.error('Error fetching user balance:', error);
            }
            
            // Theme toggle functionality
            const themeToggle = document.getElementById('theme-toggle');
            const themeIcon = themeToggle.querySelector('svg');
            
            // Check for saved theme preference
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) {
                document.documentElement.classList.toggle('dark', savedTheme === 'dark');
                updateThemeIcon(savedTheme === 'dark');
            } else {
                // Check system preference
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                document.documentElement.classList.toggle('dark', prefersDark);
                updateThemeIcon(prefersDark);
            }
            
            // Theme toggle click handler
            themeToggle.addEventListener('click', () => {
                const isDark = document.documentElement.classList.toggle('dark');
                localStorage.setItem('theme', isDark ? 'dark' : 'light');
                updateThemeIcon(isDark);
            });
            
            // Function to update theme icon
            function updateThemeIcon(isDark) {
                if (isDark) {
                    themeIcon.innerHTML = `
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    `;
                } else {
                    themeIcon.innerHTML = `
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    `;
                }
            }
            
            // Set the title (remove "Stocks" text, just show the icon)
            const watchlistHeader = document.getElementById('watchlist-header');
            if (watchlistHeader) {
                watchlistHeader.innerHTML = `<span id="watchlist-name">Stocks</span>`;
            }
            
            // Initialize stock list with all default stocks
            const stockListEl = document.getElementById('stock-list');
            if (stockListEl) {
                stockListEl.innerHTML = ''; // Clear the list
                defaultStocks.forEach(stock => {
                    const div = document.createElement('div');
                    div.className = 'p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 border-b dark:border-gray-700 border-gray-200';
                    div.setAttribute('data-symbol', stock.symbol);
                    
                    div.innerHTML = `
                        <div class="flex items-center justify-between">
                            <div class="flex items-center space-x-3">
                                <div class="w-8 h-8 flex-shrink-0">
                                    <img src="${stock.logoUrl}" alt="${stock.name} logo" class="w-full h-full object-contain">
                                </div>
                                <div>
                                    <div class="font-medium">${stock.name}</div>
                                    <div class="text-sm text-gray-400">${stock.symbol}</div>
                                </div>
                            </div>
                            <div class="text-right">
                                <div class="font-semibold">$${formatPrice(stock.price)}</div>
                                <div class="text-xs ${stock.isPositive ? 'text-positive' : 'text-negative'}">
                                    ${stock.isPositive ? '+' : ''}${formatPrice(stock.change)} (${stock.isPositive ? '+' : ''}${formatPrice(stock.changePercent)}%)
                                </div>
                            </div>
                        </div>
                    `;
                    
                    div.addEventListener('click', () => {
                        // Remove active class from all items
                        document.querySelectorAll('#stock-list > div').forEach(item => {
                            item.classList.remove('bg-primary/10', 'dark:bg-primary/20');
                        });
                        
                        // Add active class to clicked item
                        div.classList.add('bg-primary/10', 'dark:bg-primary/20');
                        
                        // Show stock details
                        showStockDetail(stock);
                    });
                    
                    stockListEl.appendChild(div);
                });
            }
            
            // Search functionality
            const searchInput = document.getElementById('stock-search');
            const searchResults = document.getElementById('search-results');
            let searchTimeout;

            if (searchInput && searchResults) {
                searchInput.addEventListener('input', (e) => {
                    clearTimeout(searchTimeout);
                    const query = e.target.value.trim();
                    
                    if (query.length < 2) {
                        searchResults.classList.add('hidden');
                        return;
                    }

                    searchTimeout = setTimeout(async () => {
                        const results = await searchStocks(query);
                        displaySearchResults(results);
                    }, 300);
                });

                // Close search results when clicking outside
                document.addEventListener('click', (e) => {
                    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
                        searchResults.classList.add('hidden');
                    }
                });
            }
            
            // Show NVIDIA stock as default
            const nvidiaStock = defaultStocks.find(stock => stock.symbol === 'NVDA');
            if (nvidiaStock) {
                showStockDetail(nvidiaStock);
            }
            
            // Show NVIDIA stock details by default
            const defaultStock = defaultStocks.find(stock => stock.symbol === 'NVDA');
            if (defaultStock) {
                showStockDetail(defaultStock);
                
                // Generate and show sample chart data
                const chartData = generateChartData(30);
                const trace = {
                    x: chartData.map(d => d.x),
                    open: chartData.map(d => d.o),
                    high: chartData.map(d => d.h),
                    low: chartData.map(d => d.l),
                    close: chartData.map(d => d.c),
                    type: 'candlestick',
                    xaxis: 'x',
                    yaxis: 'y',
                    name: defaultStock.symbol,
                    increasing: {
                        line: { color: '#16c784' },
                        fillcolor: '#16c784'
                    },
                    decreasing: {
                        line: { color: '#ea3943' },
                        fillcolor: '#ea3943'
                    }
                };

                const layout = {
                    template: 'plotly_dark',
                    paper_bgcolor: 'rgba(0,0,0,0)',
                    plot_bgcolor: 'rgba(0,0,0,0)',
                    margin: { t: 10, b: 40, l: 40, r: 40 },
                    xaxis: {
                        rangeslider: { visible: false },
                        color: 'rgba(156, 163, 175, 0.8)',
                        showgrid: false,
                        showticklabels: true,
                        tickangle: -45,
                        tickformat: '%Y-%m-%d'
                    },
                    yaxis: {
                        color: 'rgba(156, 163, 175, 0.8)',
                        side: 'right',
                        showgrid: false,
                        showticklabels: true
                    },
                    showlegend: false,
                    height: 500
                };

                const config = {
                    responsive: true,
                    displayModeBar: false
                };

                const chartEl = document.getElementById('stock-chart');
                if (chartEl) {
                    Plotly.newPlot('stock-chart', [trace], layout, config);
                }
            }

            // Load watchlist from server
            const { watchlist: initialWatchlist, watchlistId } = await loadWatchlist();
            watchlist = initialWatchlist;
            
            // Update the section title to "Stocks"
            const watchlistNameEl = document.getElementById('watchlist-name');
            if (watchlistNameEl) {
                watchlistNameEl.textContent = 'Stocks';
            }
            
            // Initialize real-time updates
            initializeRealTimeUpdates();
            
            // Set up watchlist toggle with animation
            const watchlistButton = document.querySelector('.watchlist-star');
            watchlistButton.addEventListener('click', async () => {
                const currentSymbol = document.getElementById('detail-symbol').textContent;
                const starIcon = watchlistButton.querySelector('svg');
                
                if (watchlist.has(currentSymbol)) {
                    // Remove from watchlist with animation
                    starIcon.style.transform = 'scale(0.8)';
                    await removeFromWatchlist(currentSymbol);
                    starIcon.setAttribute('fill', 'none');
                    starIcon.setAttribute('stroke', 'currentColor');
                } else {
                    // Add to watchlist with animation
                    starIcon.style.transform = 'scale(1.2)';
                    await addToWatchlist(currentSymbol);
                    starIcon.setAttribute('fill', '#FFD700');
                    starIcon.setAttribute('stroke', '#FFD700');
                }
                
                // Reset transform after animation
                setTimeout(() => {
                    starIcon.style.transform = 'scale(1)';
                }, 200);
            });
            
            // Add transition style to star icon
            const starIcon = watchlistButton.querySelector('svg');
            starIcon.style.transition = 'transform 0.2s ease-in-out';

            // Watchlist buttons
            const createWatchlistBtn = document.querySelector('.watchlist-button:first-of-type');
            const editWatchlistBtn = document.querySelector('.watchlist-button:last-of-type');

            createWatchlistBtn.addEventListener('click', () => {
                // Show create watchlist modal or form
                console.log('Create watchlist clicked');
            });

            editWatchlistBtn.addEventListener('click', () => {
                // Show edit watchlist modal or form
                console.log('Edit watchlist clicked');
            });

            // Navigation handling
            const stocksNav = document.querySelector('a[data-section="stocks"]');
            const forexNav = document.querySelector('a[data-section="forex"]');
            const stocksList = document.querySelector('#stock-list');
            const forexList = document.querySelector('#forex-list');

            const defaultForexPairs = [
                { symbol: 'EUR/USD', name: 'Euro / US Dollar' },
                { symbol: 'GBP/USD', name: 'British Pound / US Dollar' },
                { symbol: 'GBP/EUR', name: 'British Pound / Euro' }
            ];

            function updateForexPair(symbol) {
                const detailName = document.querySelector('#detail-name');
                const detailSymbol = document.querySelector('#detail-symbol');
                const detailChange = document.querySelector('#detail-change');
                const sellPrice = document.querySelector('#detail-sell-price');
                const buyPrice = document.querySelector('#detail-buy-price');

                // Show the detail section if it's hidden
                const detailSection = document.querySelector('#stock-detail');
                detailSection.classList.remove('hidden');
                detailSection.classList.add('md:flex');

                // Update the UI with loading state
                detailName.textContent = symbol;
                detailSymbol.textContent = 'Loading...';
                detailChange.textContent = 'Loading...';
                sellPrice.textContent = 'Loading...';
                buyPrice.textContent = 'Loading...';

                // Fetch forex data (you'll need to implement this endpoint)
                fetch(`/api/forex/${symbol.replace('/', '')}`)
                    .then(response => response.json())
                    .then(data => {
                        detailName.textContent = data.name || symbol;
                        detailSymbol.textContent = symbol;
                        detailChange.textContent = `${data.change}%`;
                        detailChange.className = data.change >= 0 ? 'text-positive' : 'text-negative';
                        sellPrice.textContent = data.sell.toFixed(4);
                        buyPrice.textContent = data.buy.toFixed(4);
                        updateForexChart(symbol);
                    })
                    .catch(error => {
                        console.error('Error fetching forex data:', error);
                        detailSymbol.textContent = 'Error loading data';
                    });
            }

            function createForexListItem(symbol, name) {
                const li = document.createElement('li');
                li.className = 'p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200';
                li.setAttribute('data-symbol', symbol);
                
                li.addEventListener('click', () => {
                    document.querySelectorAll('#forex-list li').forEach(item => {
                        item.classList.remove('bg-primary/10', 'dark:bg-primary/20');
                    });
                    li.classList.add('bg-primary/10', 'dark:bg-primary/20');
                    updateForexPair(symbol);
                });

                li.innerHTML = `
                    <div class="flex items-center justify-between">
                        <div>
                            <div class="font-medium">${symbol}</div>
                            <div class="text-sm text-gray-400">${name}</div>
                        </div>
                        <div class="text-right">
                            <div class="loading-placeholder">Loading...</div>
                            <div class="text-sm loading-placeholder">Loading...</div>
                        </div>
                    </div>
                `;

                return li;
            }

            function switchToForex() {
                stocksList.classList.add('hidden');
                forexList.classList.remove('hidden');
                stocksNav.classList.remove('text-primary');
                forexNav.classList.add('text-primary');
                
                // Update forex prices
                defaultForexPairs.forEach(pair => {
                    fetch(`/api/forex/${pair.symbol.replace('/', '')}`)
                        .then(response => response.json())
                        .then(data => {
                            const li = forexList.querySelector(`[data-symbol="${pair.symbol}"]`);
                            if (li) {
                                const priceDiv = li.querySelector('.loading-placeholder');
                                const changeDiv = li.querySelectorAll('.loading-placeholder')[1];
                                priceDiv.textContent = data.price.toFixed(4);
                                changeDiv.textContent = `${data.change}%`;
                                changeDiv.className = `text-sm ${data.change >= 0 ? 'text-positive' : 'text-negative'}`;
                            }
                        });
                });
            }

            function switchToStocks() {
                forexList.classList.add('hidden');
                stocksList.classList.remove('hidden');
                forexNav.classList.remove('text-primary');
                stocksNav.classList.add('text-primary');
            }

            // Initialize forex list
            const forexListContainer = document.createElement('div');
            forexListContainer.id = 'forex-list';
            forexListContainer.className = 'space-y-2 p-2 hidden';
            defaultForexPairs.forEach(pair => {
                forexListContainer.appendChild(createForexListItem(pair.symbol, pair.name));
            });
            stocksList.parentNode.insertBefore(forexListContainer, stocksList.nextSibling);

            // Add event listeners for navigation
            forexNav.addEventListener('click', (e) => {
                e.preventDefault();
                switchToForex();
            });

            stocksNav.addEventListener('click', (e) => {
                e.preventDefault();
                switchToStocks();
            });

            function updateForexChart(symbol) {
                const chart = document.querySelector('#stock-chart');
                chart.innerHTML = '<div class="text-gray-400">Loading chart data...</div>';

                fetch(`/api/forex/history/${symbol.replace('/', '')}`)
                    .then(response => response.json())
                    .then(data => {
                        const trace = {
                            x: data.timestamps,
                            y: data.prices,
                            type: 'scatter',
                            mode: 'lines',
                            line: {
                                color: '#5D5CDE',
                                width: 2
                            }
                        };

                        const layout = {
                            paper_bgcolor: 'rgba(0,0,0,0)',
                            plot_bgcolor: 'rgba(0,0,0,0)',
                            xaxis: {
                                showgrid: false,
                                zeroline: false,
                                visible: false
                            },
                            yaxis: {
                                showgrid: false,
                                zeroline: false,
                                visible: false
                            },
                            margin: {
                                l: 0,
                                r: 0,
                                t: 0,
                                b: 0
                            }
                        };

                        Plotly.newPlot(chart, [trace], layout, {
                            displayModeBar: false,
                            responsive: true
                        });
                    })
                    .catch(error => {
                        console.error('Error fetching forex chart data:', error);
                        chart.innerHTML = '<div class="text-gray-400">Error loading chart data</div>';
                    });
            }

            // Set initial active state
            stocksNav.classList.add('text-primary');

            // Add event listeners for time period buttons
            const timeButtons = document.querySelectorAll('.time-button');
            timeButtons.forEach(button => {
                button.addEventListener('click', () => {
                    // Remove active class from all buttons
                    timeButtons.forEach(btn => btn.classList.remove('time-active'));
                    // Add active class to clicked button
                    button.classList.add('time-active');
                    
                    // Get the time period from the button text
                    const period = button.textContent;
                    let days;
                    switch(period) {
                        case '1D': days = 1; break;
                        case '1W': days = 7; break;
                        case '1M': days = 30; break;
                        case '3M': days = 90; break;
                        case '1Y': days = 365; break;
                        case 'MAX': days = 365 * 5; break;
                    }
                    
                    // Update chart with new time period
                    const currentSymbol = document.getElementById('detail-symbol').textContent;
                    updateChart(currentSymbol, days);
                });
            });

            // Add chart type toggle functionality
            const chartTypeToggle = document.getElementById('chart-type-toggle');
            let isCandlestick = true;

            chartTypeToggle.addEventListener('click', () => {
                isCandlestick = !isCandlestick;
                const currentSymbol = document.getElementById('detail-symbol').textContent;
                const currentDays = parseInt(document.querySelector('.time-button.time-active').textContent.replace(/[^0-9]/g, '')) || 30;
                updateChart(currentSymbol, currentDays);
            });

            // Add placeholder for fullscreen toggle
            const fullscreenToggle = document.getElementById('fullscreen-toggle');
            fullscreenToggle.addEventListener('click', () => {
                // Placeholder for fullscreen functionality
                console.log('Fullscreen toggle clicked');
            });
        });
        
        /**
         * In a full application, the following functions would be implemented to fetch data from Alpha Vantage API
         */
        
        // Function to show error message
        function showError(message) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
            errorDiv.textContent = message;
            document.body.appendChild(errorDiv);
            
            setTimeout(() => {
                errorDiv.remove();
            }, 5000);
        }
        
        // Function to fetch stock price with better error handling
        async function fetchStockPrice(symbol) {
            try {
                const response = await fetch(`/api/stock/${symbol}`);
                const data = await response.json();
                
                if (data.error) {
                    if (data.error.includes('API rate limit')) {
                        showError('API rate limit reached. Please try again in a few minutes.');
                    } else {
                        showError(data.error);
                    }
                    return null;
                }
                
                    const quote = data['Global Quote'];
                if (!quote) {
                    showError('No data available for this stock');
                    return null;
                }
                
                const price = parseFloat(quote['05. price']);
                const change = parseFloat(quote['09. change']);
                const changePercent = parseFloat(quote['10. change percent'].replace('%', ''));
                
                return {
                    price,
                    change,
                    changePercent,
                    isPositive: change >= 0
                };
            } catch (error) {
                console.error('Error fetching stock price:', error);
                showError('Failed to fetch stock price. Please try again later.');
                return null;
            }
        }
        
        // Function to fetch intraday data for chart
        async function fetchIntradayData(symbol, interval = '5min') {
            try {
                const response = await fetch(`/api/intraday/${symbol}?interval=${interval}`);
                const data = await response.json();
                
                if (data.error) {
                    showError(data.error);
                    return [];
                }
                
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
                showError('Failed to fetch chart data. Please try again later.');
                return [];
            }
        }
        
        // Function to fetch daily data for chart
        async function fetchDailyData(symbol) {
            try {
                const response = await fetch(`/api/daily/${symbol}`);
                const data = await response.json();
                
                if (data.error) {
                    showError(data.error);
                    return [];
                }
                
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
                showError('Failed to fetch chart data. Please try again later.');
                return [];
            }
        }
        
        // Function to search for stocks
        async function searchStocks(query) {
            try {
                // Convert query to lowercase for case-insensitive search
                const searchQuery = query.toLowerCase();
                
                // Filter through default stocks
                const results = defaultStocks.filter(stock => {
                    // Search in both symbol and name
                    return stock.symbol.toLowerCase().includes(searchQuery) ||
                           stock.name.toLowerCase().includes(searchQuery);
                });
                
                // Map the results to match the expected format
                return results.map(stock => ({
                    symbol: stock.symbol,
                    name: stock.name,
                    price: stock.price,
                    change: stock.change,
                    changePercent: stock.changePercent,
                    type: 'stock',
                    currency: 'USD',
                    exchange: 'US',
                    isPositive: stock.isPositive,
                    logoUrl: stock.logoUrl
                }));
            } catch (error) {
                console.error('Error searching stocks:', error);
                return [];
            }
        }

        function displaySearchResults(results) {
            const searchResults = document.getElementById('search-results');
            if (!searchResults) return;

            if (results.length === 0) {
                searchResults.innerHTML = '<div class="p-4 text-gray-500">No results found</div>';
                searchResults.classList.remove('hidden');
                return;
            }

            searchResults.innerHTML = results.map(stock => `
                <div class="p-4 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-200 dark:border-gray-700 last:border-0" onclick="selectStock('${stock.symbol}')">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-3">
                            <div class="w-8 h-8 flex-shrink-0">
                                <img src="${stock.logoUrl}" alt="${stock.name} logo" class="w-full h-full object-contain">
                            </div>
                            <div>
                                <div class="font-medium">${stock.name}</div>
                                <div class="text-sm text-gray-400">${stock.symbol}</div>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="font-semibold">$${formatPrice(stock.price)}</div>
                            <div class="text-xs ${stock.isPositive ? 'text-positive' : 'text-negative'}">
                                ${stock.isPositive ? '+' : ''}${formatPrice(stock.change)} (${stock.isPositive ? '+' : ''}${formatPrice(stock.changePercent)}%)
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');

            searchResults.classList.remove('hidden');
        }

        function selectStock(symbol) {
            const searchInput = document.getElementById('stock-search');
            const searchResults = document.getElementById('search-results');
            const stockList = document.getElementById('stock-list');
            
            if (searchInput) {
                searchInput.value = symbol;
            }
            
            if (searchResults) {
                searchResults.classList.add('hidden');
            }
            
            // Find the stock in the default stocks list
            const stock = defaultStocks.find(s => s.symbol === symbol);
            if (stock) {
                // Remove active class from all items in the stock list
                document.querySelectorAll('#stock-list > div').forEach(item => {
                    item.classList.remove('bg-primary/10', 'dark:bg-primary/20');
                });
                
                // Find and highlight the selected stock in the list
                const selectedStockElement = stockList.querySelector(`[data-symbol="${symbol}"]`);
                if (selectedStockElement) {
                    selectedStockElement.classList.add('bg-primary/10', 'dark:bg-primary/20');
                    // Scroll the selected stock into view
                    selectedStockElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                
                // Show stock details
                showStockDetail(stock);
            } else {
                showError('Stock not found');
            }
        }

        // Function to format price
        function formatPrice(price) {
            return price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }

        // Function to show stock detail
        function showStockDetail(stock) {
            const detailSection = document.getElementById('stock-detail');
            if (!detailSection) return;
            
            detailSection.classList.remove('hidden');
            detailSection.classList.add('md:flex');
            
            document.getElementById('detail-name').textContent = stock.name;
            document.getElementById('detail-symbol').textContent = stock.symbol;
            
            const changeElement = document.getElementById('detail-change');
            const changeText = `${stock.isPositive ? '+' : ''}${formatPrice(stock.changePercent)}% (${stock.isPositive ? '+' : ''}${formatPrice(stock.change)})`;
            changeElement.textContent = changeText;
            changeElement.className = stock.isPositive ? 'text-positive' : 'text-negative';
            
            document.getElementById('detail-sell-price').textContent = `$${formatPrice(stock.price)}`;
            document.getElementById('detail-buy-price').textContent = `$${formatPrice(stock.price + 0.03)}`;
            
            // Update chart
            updateChart(stock.symbol);
        }