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
            
            // Add stocks to the list
            const stockListEl = document.getElementById('stock-list');
            if (stockListEl) {
                stockListEl.innerHTML = ''; // Clear the list
                defaultStocks.forEach(stock => {
                    stockListEl.appendChild(createStockElement(stock));
                });
            }
            
            // Show NVIDIA stock details by default
            const defaultStock = defaultStocks.find(stock => stock.symbol === 'NVDA');
            if (defaultStock) {
                showStockDetail(defaultStock);
                
                // Generate and show sample chart data
                const chartData = generateChartData(30);
                const chartTrace = {
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

                const chartLayout = {
                    template: 'plotly_dark',
                    paper_bgcolor: 'rgba(0,0,0,0)',
                    plot_bgcolor: 'rgba(0,0,0,0)',
                    margin: { t: 20, b: 40, l: 40, r: 40 },
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
                    height: 400
                };

                const chartConfig = {
                    responsive: true,
                    displayModeBar: false
                };

                const chartEl = document.getElementById('stock-chart');
                if (chartEl) {
                    Plotly.newPlot('stock-chart', [chartTrace], chartLayout, chartConfig);
                }
            }

            // Load watchlist from server
            const { watchlist: initialWatchlist, watchlistId } = await loadWatchlist();
            watchlist = initialWatchlist;
            
            // Set up search functionality
            const searchInput = document.getElementById('stock-search');
            const searchResults = document.getElementById('search-results');
            const navSearchInput = document.getElementById('nav-search');
            const navSearchResults = document.getElementById('nav-search-results');
            const searchToggle = document.getElementById('search-toggle');
            const searchContainer = document.getElementById('search-container');
            let searchTimeout;
            
            // Toggle search container
            searchToggle.addEventListener('click', () => {
                searchContainer.classList.toggle('hidden');
                if (!searchContainer.classList.contains('hidden')) {
                    navSearchInput.focus();
                }
            });
            
            // Close search container when clicking outside
            document.addEventListener('click', (e) => {
                if (!searchToggle.contains(e.target) && !searchContainer.contains(e.target)) {
                    searchContainer.classList.add('hidden');
                }
            });
            
            // Handle nav search input
            navSearchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                const query = e.target.value.trim();
                
                if (query.length < 2) {
                    navSearchResults.innerHTML = '';
                    return;
                }
                
                searchTimeout = setTimeout(async () => {
                    try {
                        const response = await fetch(`/api/search?q=${query}`);
                        const data = await response.json();
                        
                        if (data.error) {
                            showError(data.error);
                            return;
                        }
                        
                        navSearchResults.innerHTML = '';
                        if (data.bestMatches && data.bestMatches.length > 0) {
                            data.bestMatches.forEach(result => {
                                navSearchResults.appendChild(createNavSearchResultElement(result));
                            });
                        }
                    } catch (error) {
                        console.error('Error searching stocks:', error);
                        showError('Failed to search stocks');
                    }
                }, SEARCH_DELAY); // Increased delay for search
            });
            
            // Handle main search input
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                const query = e.target.value.trim().toLowerCase();
                const stockList = document.getElementById('stock-list');
                const allStocks = Array.from(stockList.children);
                
                if (query.length < 2) {
                    // Show all stocks if query is too short
                    allStocks.forEach(stock => {
                        stock.style.display = 'block';
                    });
                    return;
                }
                
                searchTimeout = setTimeout(() => {
                    // Filter stocks based on query
                    allStocks.forEach(stock => {
                        const symbol = stock.dataset.symbol.toLowerCase();
                        const name = stock.querySelector('.font-medium').textContent.toLowerCase();
                        
                        if (symbol.includes(query) || name.includes(query)) {
                            stock.style.display = 'block';
                        } else {
                            stock.style.display = 'none';
                        }
                    });
                    
                    // Check if any stocks are visible
                    const visibleStocks = allStocks.filter(stock => stock.style.display !== 'none');
                    if (visibleStocks.length === 0) {
                        // Show "No stocks found" message
                        const noResults = document.createElement('div');
                        noResults.className = 'p-4 text-center text-gray-500 dark:text-gray-400';
                        noResults.textContent = 'No stocks found matching your search';
                        
                        // Remove any existing "No stocks found" message
                        const existingNoResults = stockList.querySelector('.text-gray-500');
                        if (existingNoResults) {
                            existingNoResults.remove();
                        }
                        
                        stockList.appendChild(noResults);
                    } else {
                        // Remove "No stocks found" message if it exists
                        const noResults = stockList.querySelector('.text-gray-500');
                        if (noResults) {
                            noResults.remove();
                        }
                    }
                }, 300);
            });
            
            // Close search results when clicking outside
            document.addEventListener('click', (e) => {
                if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
                    searchResults.classList.add('hidden');
                }
            });
            
            // Initialize stock list with watchlist
            await updateStockList();
            
            // Show NVIDIA stock as default using sample data
            const nvidiaStock = defaultStocks.find(stock => stock.symbol === 'NVDA');
            
            // Add NVIDIA to stock list
            stockListEl.innerHTML = ''; // Clear the list
            stockListEl.appendChild(createStockElement(nvidiaStock));
            
            // Show NVIDIA details immediately
            const detailSection = document.getElementById('stock-detail');
            detailSection.classList.remove('hidden');
            
            document.getElementById('detail-name').textContent = nvidiaStock.name;
            document.getElementById('detail-symbol').textContent = nvidiaStock.symbol;
            
            const changeElement = document.getElementById('detail-change');
            const changeText = `${nvidiaStock.changePercent >= 0 ? '+' : ''}${nvidiaStock.changePercent.toFixed(2)}% (${nvidiaStock.change >= 0 ? '+' : ''}${nvidiaStock.change.toFixed(2)})`;
            changeElement.textContent = changeText;
            changeElement.className = nvidiaStock.isPositive ? 'text-positive' : 'text-negative';
            
            document.getElementById('detail-sell-price').textContent = `$${formatPrice(nvidiaStock.price)}`;
            document.getElementById('detail-buy-price').textContent = `$${formatPrice(nvidiaStock.price + 0.03)}`;
            
            // Generate and show sample chart data
            const sampleChartData = generateChartData(30);
            const trace = {
                x: sampleChartData.map(d => d.x),
                open: sampleChartData.map(d => d.o),
                high: sampleChartData.map(d => d.h),
                low: sampleChartData.map(d => d.l),
                close: sampleChartData.map(d => d.c),
                type: 'candlestick',
                xaxis: 'x',
                yaxis: 'y',
                name: 'NVDA',
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
                margin: { t: 20, b: 40, l: 40, r: 40 },
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
                height: 400
            };

            const config = {
                responsive: true,
                displayModeBar: false
            };

            Plotly.newPlot('stock-chart', [trace], layout, config);
            
            // Update the section title to "Stocks"
            const watchlistNameEl = document.getElementById('watchlist-name');
            watchlistNameEl.textContent = 'Stocks';
            
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

            // Update stock list item click handler to use primary color
            function createStockListItem(symbol, price, change) {
                const li = document.createElement('li');
                li.className = 'p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200';
                li.setAttribute('data-symbol', symbol);
                li.addEventListener('click', () => {
                    // Remove active class from all items
                    document.querySelectorAll('#stock-list li').forEach(item => {
                        item.classList.remove('bg-primary/10', 'dark:bg-primary/20');
                    });
                    // Add active class to clicked item
                    li.classList.add('bg-primary/10', 'dark:bg-primary/20');
                    updateStockDetails(symbol);
                });
                // ... rest of the createStockListItem function ...
            }

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
                const response = await fetch(`/api/search?q=${query}`);
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

        // Function to update stock prices in the sidebar
        async function updateStockPrices() {
            const stockListEl = document.getElementById('stock-list');
            const stocks = Array.from(stockListEl.children).map(el => el.dataset.symbol);
            
            for (const symbol of stocks) {
                const data = await fetchStockPrice(symbol);
                if (data) {
                    const stockEl = stockListEl.querySelector(`[data-symbol="${symbol}"]`);
                    if (stockEl) {
                        const priceEl = stockEl.querySelector('.text-right .font-semibold');
                        const changeEl = stockEl.querySelector('.text-right .text-xs');
                        
                        priceEl.textContent = `$${formatPrice(data.price)}`;
                        changeEl.textContent = `${data.isPositive ? '+' : ''}${formatChange(data.change)} (${formatChange(data.changePercent, true)})`;
                        changeEl.className = `text-xs ${data.isPositive ? 'text-positive' : 'text-negative'}`;
                    }
                }
            }
        }

        // Function to update buy/sell prices
        async function updateBuySellPrices() {
            const data = await fetchStockPrice(currentSymbol);
            if (data) {
                document.getElementById('detail-sell-price').textContent = `$${formatPrice(data.price)}`;
                document.getElementById('detail-buy-price').textContent = `$${formatPrice(data.price + 0.03)}`;
            }
        }

        // Function to update user balance
        async function updateBalance() {
            try {
                const userId = document.getElementById('user-id').dataset.userId;
                if (!userId) {
                    console.error('User ID not found');
                    return;
                }

                const response = await fetch(`/api/user/${userId}/balance`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                const balanceElement = document.getElementById('balance');
                
                if (data.balance !== undefined) {
                    const formattedBalance = parseFloat(data.balance).toFixed(2);
                    balanceElement.textContent = formattedBalance;
                } else {
                    console.error('Balance not found in response:', data);
                    balanceElement.textContent = "0.00";
                }
            } catch (error) {
                console.error('Error updating balance:', error);
                const balanceElement = document.getElementById('balance');
                balanceElement.textContent = "0.00";
            }
        }

        // Initialize real-time updates
        function initializeRealTimeUpdates() {
            // Update stock prices every 30 seconds
            setInterval(updateStockPrices, PRICE_UPDATE_INTERVAL);
            
            // Update chart every 30 seconds
            setInterval(() => updateChart(), CHART_UPDATE_INTERVAL);
            
            // Update buy/sell prices every 30 seconds
            setInterval(updateBuySellPrices, PRICE_UPDATE_INTERVAL);
            
            // Update balance every 5 seconds
            setInterval(updateBalance, 5000);

            // Initial updates
            updateStockPrices();
            updateChart();
            updateBuySellPrices();
            updateBalance();
        }

        // Function to create a stock element
        function createStockElement(stock) {
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
                            ${stock.isPositive ? '+' : ''}${stock.change.toFixed(2)} (${stock.isPositive ? '+' : ''}${stock.changePercent.toFixed(2)}%)
                        </div>
                    </div>
                </div>
            `;
            
            div.addEventListener('click', () => {
                showStockDetail(stock);
            });
            
            return div;
        }

        // Function to show stock detail and scroll to it
        function showStockDetail(stock) {
            const detailSection = document.getElementById('stock-detail');
            detailSection.classList.remove('hidden');
            detailSection.classList.add('md:flex');
            
            document.getElementById('detail-name').textContent = stock.name;
            document.getElementById('detail-symbol').textContent = stock.symbol;
            
            const changeElement = document.getElementById('detail-change');
            const changeText = `${stock.isPositive ? '+' : ''}${stock.changePercent.toFixed(2)}% (${stock.isPositive ? '+' : ''}${stock.change.toFixed(2)})`;
            changeElement.textContent = changeText;
            changeElement.className = stock.isPositive ? 'text-positive' : 'text-negative';
            
            document.getElementById('detail-sell-price').textContent = `$${formatPrice(stock.price)}`;
            document.getElementById('detail-buy-price').textContent = `$${formatPrice(stock.price + 0.03)}`;
            
            // Update chart
            updateChart(stock.symbol);
            
            // Show all stocks again
            const stockList = document.getElementById('stock-list');
            const allStocks = Array.from(stockList.children);
            allStocks.forEach(stock => {
                if (stock.classList.contains('text-gray-500')) return; // Skip "No stocks found" message
                stock.style.display = 'block';
            });
            
            // Remove "No stocks found" message if it exists
            const noResults = stockList.querySelector('.text-gray-500');
            if (noResults) {
                noResults.remove();
            }
            
            // Find and scroll to the selected stock
            const selectedStock = stockList.querySelector(`[data-symbol="${stock.symbol}"]`);
            if (selectedStock) {
                // Remove active class from all items
                allStocks.forEach(item => {
                    if (item.classList.contains('text-gray-500')) return; // Skip "No stocks found" message
                    item.classList.remove('bg-primary/10', 'dark:bg-primary/20');
                });
                
                // Add active class to selected item
                selectedStock.classList.add('bg-primary/10', 'dark:bg-primary/20');
                
                // Scroll the selected item into view
                selectedStock.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }

        // Function to format price
        function formatPrice(price) {
            return price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }

        // Function to generate sample chart data
        function generateChartData(days) {
            const data = [];
            let price = 100;
            const now = new Date();
            
            for (let i = days; i >= 0; i--) {
                const date = new Date(now);
                date.setDate(date.getDate() - i);
                
                const open = price * (1 + (Math.random() - 0.5) * 0.02);
                const close = open * (1 + (Math.random() - 0.5) * 0.02);
                const high = Math.max(open, close) * (1 + Math.random() * 0.01);
                const low = Math.min(open, close) * (1 - Math.random() * 0.01);
                
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
        }

        // Function to update chart
        function updateChart(symbol, days = 30) {
            const chartData = generateChartData(days);
            const trace = {
                x: chartData.map(d => d.x),
                open: chartData.map(d => d.o),
                high: chartData.map(d => d.h),
                low: chartData.map(d => d.l),
                close: chartData.map(d => d.c),
                type: 'candlestick',
                xaxis: 'x',
                yaxis: 'y',
                name: symbol,
                increasing: {
                    line: { color: '#16c784' },
                    fillcolor: '#16c784'
                },
                decreasing: {
                    line: { color: '#ea3943' },
                    fillcolor: '#ea3943'
                }
            };

            // Determine tick format based on days
            let tickFormat;
            let tickInterval;
            switch(days) {
                case 1: // 1D
                    tickFormat = '%H:%M';
                    tickInterval = 4 * 60 * 60 * 1000; // 4 hours
                    break;
                case 7: // 1W
                    tickFormat = '%d\n%H:%M';
                    tickInterval = 12 * 60 * 60 * 1000; // 12 hours
                    break;
                case 30: // 1M
                    tickFormat = '%b';
                    tickInterval = 24 * 60 * 60 * 1000; // 1 day
                    break;
                case 90: // 3M
                    tickFormat = '%b\n%Y';
                    tickInterval = 30 * 24 * 60 * 60 * 1000; // 1 month
                    break;
                case 365: // 1Y
                    tickFormat = '%b\n%Y';
                    tickInterval = 30 * 24 * 60 * 60 * 1000; // 1 month
                    break;
                default: // MAX
                    tickFormat = '%Y';
                    tickInterval = 365 * 24 * 60 * 60 * 1000; // 1 year
                    break;
            }

            const layout = {
                template: 'plotly_dark',
                paper_bgcolor: 'rgba(0,0,0,0)',
                plot_bgcolor: 'rgba(0,0,0,0)',
                margin: { t: 20, b: 40, l: 40, r: 40 },
                xaxis: {
                    rangeslider: { visible: false },
                    color: 'rgba(156, 163, 175, 0.8)',
                    showgrid: false,
                    showticklabels: true,
                    tickangle: -45,
                    tickformat: tickFormat,
                    dtick: tickInterval,
                    tickmode: 'auto'
                },
                yaxis: {
                    color: 'rgba(156, 163, 175, 0.8)',
                    side: 'right',
                    showgrid: false,
                    showticklabels: true
                },
                showlegend: false,
                height: 300
            };

            const config = {
                responsive: true,
                displayModeBar: false
            };

            Plotly.newPlot('stock-chart', [trace], layout, config);

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
        }

        // Function to create a search result element
        function createSearchResultElement(stock) {
            const div = document.createElement('div');
            div.className = 'p-3 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer';
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
                            ${stock.isPositive ? '+' : ''}${stock.change.toFixed(2)} (${stock.isPositive ? '+' : ''}${stock.changePercent.toFixed(2)}%)
                        </div>
                    </div>
                </div>
            `;
            
            div.addEventListener('click', () => {
                // Hide search results
                document.getElementById('search-results').classList.add('hidden');
                
                // Clear search input
                document.getElementById('stock-search').value = '';
                
                // Find and highlight the stock in the main list
                const stockList = document.getElementById('stock-list');
                const stockElement = stockList.querySelector(`[data-symbol="${stock.symbol}"]`);
                
                if (stockElement) {
                    // Remove active class from all items
                    stockList.querySelectorAll('div').forEach(item => {
                        item.classList.remove('bg-primary/10', 'dark:bg-primary/20');
                    });
                    
                    // Add active class to selected item
                    stockElement.classList.add('bg-primary/10', 'dark:bg-primary/20');
                    
                    // Scroll the selected item into view
                    stockElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    
                    // Show stock details
                    showStockDetail(stock);
                }
            });
            
            return div;
        }