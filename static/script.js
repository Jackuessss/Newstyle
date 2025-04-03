        // Alpha Vantage API key
        const API_KEY = 'LA9DKLX13DQCKHV3'; // Replace with your Alpha Vantage API key
        
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
            
            // Initialize watchlist variable
            let watchlist = new Set();
            
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
            
            // Initialize stock list with database items
            const stockListEl = document.getElementById('stock-list');
            // Global variable to store default stocks for search
            window.defaultStocks = defaultStocks;
            
            if (stockListEl) {
                stockListEl.innerHTML = ''; // Clear the list
                try {
                    // Use hard-coded default stocks
                    const data = {
                        watchlist_name: "Stocks",
                        items: defaultStocks
                    };
                    
                    if (data.items && data.items.length > 0) {
                        // Store default stocks globally for search (only name, symbol, and logo)
                        window.defaultStocks = data.items.map(stock => ({
                            name: stock.name,
                            symbol: stock.symbol,
                            logoUrl: stock.logoUrl || 'https://via.placeholder.com/150x150.png?text=' + stock.symbol // Fallback logo
                        }));
                        
                        // Render the stock list
                        const fetchPricePromises = [];
                        
                        data.items.forEach(stock => {
                            const div = document.createElement('div');
                            div.className = 'p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 border-b dark:border-gray-700 border-gray-200';
                            div.setAttribute('data-symbol', stock.symbol);
                            
                            div.innerHTML = `
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center space-x-3">
                                        <div class="w-8 h-8 flex-shrink-0">
                                            <img src="${stock.logoUrl || 'https://via.placeholder.com/150x150.png?text=' + stock.symbol}" alt="${stock.name} logo" class="w-full h-full object-contain" onerror="this.src='https://via.placeholder.com/150x150.png?text=${stock.symbol}'">
                                        </div>
                                        <div>
                                            <div class="font-medium">${stock.name}</div>
                                            <div class="text-sm text-gray-400">${stock.symbol}</div>
                                        </div>
                                    </div>
                                    <div class="text-right">
                                        <div class="font-semibold">Loading...</div>
                                        <div class="text-xs">Loading...</div>
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
                            
                            // Queue price fetch for this stock
                            fetchPricePromises.push(fetchRealtimePrice(stock.symbol));
                        });
                        
                        // Show the first stock as default
                        if (data.items.length > 0) {
                            showStockDetail(data.items[0]);
                        }
                        
                        // Fetch all prices in parallel
                        Promise.all(fetchPricePromises).catch(error => {
                            console.error('Error fetching prices for list:', error);
                        });
                    } else {
                        stockListEl.innerHTML = `
                            <div class="p-8 text-center text-gray-500">
                                No stocks available in default list
                            </div>
                        `;
                        console.error('No items found in default-stocks list');
                    }
                } catch (error) {
                    console.error('Error fetching stocks:', error);
                    stockListEl.innerHTML = `
                        <div class="p-8 text-center text-red-500">
                            Error loading stocks: ${error.message}
                        </div>
                    `;
                }
            }
            
            // Initialize search functionality
            console.log('Setting up search functionality');
            const searchInput = document.getElementById('stock-search');
            const searchResults = document.getElementById('search-results');
            
            if (searchInput && searchResults) {
                console.log('Search elements found, attaching event listeners');
                let searchTimeout;
                
                searchInput.addEventListener('input', (e) => {
                    console.log('Search input event triggered');
                    clearTimeout(searchTimeout);
                    const query = e.target.value.trim();
                    
                    if (query.length < 2) {
                        searchResults.classList.add('hidden');
                        return;
                    }

                    searchTimeout = setTimeout(async () => {
                        try {
                            // Show loading state
                            searchResults.innerHTML = `
                                <div class="p-4 text-gray-500">
                                    <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-primary inline-block mr-2"></div>
                                    Searching...
                                </div>
                            `;
                            searchResults.classList.remove('hidden');
                            console.log('Searching for:', query);

                            // Convert query to lowercase for case-insensitive search
                            const searchQuery = query.toLowerCase();
                            
                            // Filter through default stocks
                            const results = window.defaultStocks.filter(stock => {
                                // Search in both symbol and name
                                return stock.symbol.toLowerCase().includes(searchQuery) ||
                                      stock.name.toLowerCase().includes(searchQuery);
                            });
                            
                            console.log('Search results:', results.length, 'matches found');
                            
                            if (results.length === 0) {
                                searchResults.innerHTML = '<div class="p-4 text-gray-500">No results found</div>';
                            } else {
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
                                                <div class="font-semibold">Search...</div>
                                                <div class="text-xs">for price</div>
                                            </div>
                                        </div>
                                    </div>
                                `).join('');
                            }
                            
                            // Check if search results are visible
                            setTimeout(() => {
                                const computedStyle = window.getComputedStyle(searchResults);
                                console.log('Search results computed display:', computedStyle.display);
                                console.log('Search results visible:', !searchResults.classList.contains('hidden'));
                            }, 100);
                            
                        } catch (error) {
                            console.error('Error searching stocks:', error);
                            searchResults.innerHTML = `
                                <div class="p-4 text-red-500">
                                    Error searching stocks. Please try again.
                                </div>
                            `;
                        }
                    }, 300);
                });

                // Close search results when clicking outside
                document.addEventListener('click', (e) => {
                    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
                        searchResults.classList.add('hidden');
                    }
                });
            } else {
                console.error('Search elements not found:', {
                    searchInput: !!searchInput,
                    searchResults: !!searchResults
                });
            }
            
            // Make selectStock available globally
            window.selectStock = function(symbol) {
                console.log('Select stock called for:', symbol);
                const searchInput = document.getElementById('stock-search');
                const searchResults = document.getElementById('search-results');
                const stockList = document.getElementById('stock-list');
                
                if (searchResults) {
                    searchResults.classList.add('hidden');
                }
                
                // Find the stock in the default stocks list
                const stock = window.defaultStocks.find(s => s.symbol === symbol);
                if (stock) {
                    console.log('Stock found:', stock);
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
                    console.error('Stock not found:', symbol);
                    showError('Stock not found');
                }
            };
            
            // Load watchlist from server
            const { watchlist: initialWatchlist, watchlistId } = await loadWatchlist();
            watchlist = initialWatchlist;
            
            // Update the section title to "Stocks"
            const watchlistNameEl = document.getElementById('watchlist-name');
            if (watchlistNameEl) {
                watchlistNameEl.textContent = 'Stocks';
            }
            
            // Initialize real-time updates with Finnhub API (handled by fetchRealtimePrice)
            // initializeRealTimeUpdates();
            
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

            // Navigation handling - get nav elements
            const stocksNav = document.querySelector('a[data-section="stocks"]');
            const forexNav = document.querySelector('a[data-section="forex"]');
            const indicesNav = document.querySelector('a[data-section="indices"]');
            const globalNav = document.querySelector('a[data-section="global"]');
            const stocksList = document.querySelector('#stock-list');
            
            // Create containers for different market types
            forexList = document.createElement('div');
            forexList.id = 'forex-list';
            forexList.className = 'space-y-2 p-2 hidden';
            
            indicesList = document.createElement('div');
            indicesList.id = 'indices-list';
            indicesList.className = 'space-y-2 p-2 hidden';
            
            globalList = document.createElement('div');
            globalList.id = 'global-list';
            globalList.className = 'space-y-2 p-2 hidden';
            
            // Add the containers to the DOM after the stocks list
            stocksList.parentNode.insertBefore(forexList, stocksList.nextSibling);
            stocksList.parentNode.insertBefore(indicesList, stocksList.nextSibling);
            stocksList.parentNode.insertBefore(globalList, stocksList.nextSibling);

            // Add event listeners for market navigation
            if (forexNav) {
                forexNav.addEventListener('click', (e) => {
                    e.preventDefault();
                    switchToMarketType('forex');
                });
            }
            
            if (stocksNav) {
                stocksNav.addEventListener('click', (e) => {
                    e.preventDefault();
                    switchToMarketType('stocks');
                });
                
                // Set initial active state for navigation
                stocksNav.classList.add('text-primary');
            }
            
            if (indicesNav) {
                indicesNav.addEventListener('click', (e) => {
                    e.preventDefault();
                    switchToMarketType('indices');
                });
            }
            
            if (globalNav) {
                globalNav.addEventListener('click', (e) => {
                    e.preventDefault();
                    switchToMarketType('global');
                });
            }

            // Load market data
            loadMarketData();
        });
        
        // Define global market data variables
        let forexList, indicesList, globalList;
        
        // Hard-coded default lists from default_lists.json
        window.defaultStocks = [
            { symbol: "AAPL", name: "Apple Inc.", logoUrl: "https://logo.clearbit.com/apple.com" },
            { symbol: "NVDA", name: "NVIDIA Corporation", logoUrl: "https://logo.clearbit.com/nvidia.com" }
        ];
        
        window.defaultForexPairs = [
            { symbol: "EUR/USD", name: "Euro/US Dollar", logoUrl: "https://logo.clearbit.com/ecb.europa.eu" },
            { symbol: "GBP/USD", name: "British Pound/US Dollar", logoUrl: "https://logo.clearbit.com/bankofengland.co.uk" }
        ];
        
        window.defaultIndices = [
            { symbol: "^GSPC", name: "S&P 500", logoUrl: "https://logo.clearbit.com/spglobal.com" },
            { symbol: "^DJI", name: "Dow Jones Industrial Average", logoUrl: "https://logo.clearbit.com/wsj.com" }
        ];
        
        window.defaultGlobalMarkets = [
            { symbol: "^GSPC", name: "S&P 500", logoUrl: "https://logo.clearbit.com/spglobal.com" },
            { symbol: "^DJI", name: "Dow Jones Industrial Average", logoUrl: "https://logo.clearbit.com/spglobal.com" }
        ];

        // Load all market data
        async function loadMarketData() {
            try {
                // Initialize forex list
                forexList.innerHTML = '';
                window.defaultForexPairs.forEach(pair => {
                    const item = createMarketItem(pair.symbol, pair.name, 'forex');
                    forexList.appendChild(item);
                    fetchRealtimePrice(pair.symbol, 'forex');
                });
                
                // Initialize indices list
                indicesList.innerHTML = '';
                window.defaultIndices.forEach(index => {
                    const item = createMarketItem(index.symbol, index.name, 'indices');
                    indicesList.appendChild(item);
                    fetchRealtimePrice(index.symbol, 'indices');
                });
                
                // Initialize global markets list
                globalList.innerHTML = '';
                window.defaultGlobalMarkets.forEach(market => {
                    const item = createMarketItem(market.symbol, market.name, 'global');
                    globalList.appendChild(item);
                    fetchRealtimePrice(market.symbol, 'global');
                });
                
            } catch (error) {
                console.error('Error initializing market data:', error);
            }
        }
        
        // Function to initialize market lists
        function initializeMarketLists(data) {
            // Initialize forex list
            if (data.forex && data.forex.length > 0) {
                forexList.innerHTML = '';
                data.forex.forEach(pair => {
                    const item = createMarketItem(pair.symbol, pair.name, 'forex');
                    forexList.appendChild(item);
                    fetchRealtimePrice(pair.symbol, 'forex');
                });
            }
            
            // Initialize indices list
            if (data.indices && data.indices.length > 0) {
                indicesList.innerHTML = '';
                data.indices.forEach(index => {
                    const item = createMarketItem(index.symbol, index.name, 'indices');
                    indicesList.appendChild(item);
                    fetchRealtimePrice(index.symbol, 'indices');
                });
            }
            
            // Initialize global markets list
            if (data.global && data.global.length > 0) {
                globalList.innerHTML = '';
                data.global.forEach(market => {
                    const item = createMarketItem(market.symbol, market.name, 'global');
                    globalList.appendChild(item);
                    fetchRealtimePrice(market.symbol, 'global');
                });
            }
        }
        
        // Function to create market item
        function createMarketItem(symbol, name, marketType) {
            const div = document.createElement('div');
            div.className = 'p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 border-b dark:border-gray-700 border-gray-200';
            div.setAttribute('data-symbol', symbol);
            
            div.innerHTML = `
                    <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <div>
                            <div class="font-medium">${name}</div>
                            <div class="text-sm text-gray-400">${symbol}</div>
                        </div>
                        </div>
                        <div class="text-right">
                        <div class="font-semibold">Loading...</div>
                        <div class="text-xs">Loading...</div>
                        </div>
                    </div>
                `;

            div.addEventListener('click', () => {
                // Remove active class from all items in the current market type list
                document.querySelectorAll(`#${marketType}-list > div`).forEach(item => {
                    item.classList.remove('bg-primary/10', 'dark:bg-primary/20');
                });
                
                // Add active class to clicked item
                div.classList.add('bg-primary/10', 'dark:bg-primary/20');
                
                // Show market details
                showMarketDetail(symbol, name, marketType);
            });
            
            return div;
        }

        function switchToMarketType(type) {
            // Hide all lists
            const stocksList = document.getElementById('stock-list');
            const forexList = document.getElementById('forex-list');
            const indicesList = document.getElementById('indices-list');
            const globalList = document.getElementById('global-list');
            
            if(!stocksList || !forexList || !indicesList || !globalList) {
                console.error('Market lists not found in DOM');
                return;
            }
            
                stocksList.classList.add('hidden');
                forexList.classList.add('hidden');
            indicesList.classList.add('hidden');
            globalList.classList.add('hidden');
            
            // Remove active class from all nav items
            const stocksNav = document.querySelector('a[data-section="stocks"]');
            const forexNav = document.querySelector('a[data-section="forex"]');
            const indicesNav = document.querySelector('a[data-section="indices"]');
            const globalNav = document.querySelector('a[data-section="global"]');
            
            if (stocksNav) stocksNav.classList.remove('text-primary');
            if (forexNav) forexNav.classList.remove('text-primary');
            if (indicesNav) indicesNav.classList.remove('text-primary');
            if (globalNav) globalNav.classList.remove('text-primary');
            
            // Show the selected list and mark nav as active
            if (type === 'stocks') {
                stocksList.classList.remove('hidden');
                if (stocksNav) stocksNav.classList.add('text-primary');
            } else if (type === 'forex') {
                forexList.classList.remove('hidden');
                if (forexNav) forexNav.classList.add('text-primary');
                updateForexPrices();
            } else if (type === 'indices') {
                indicesList.classList.remove('hidden');
                if (indicesNav) indicesNav.classList.add('text-primary');
                updateIndicesPrices();
            } else if (type === 'global') {
                globalList.classList.remove('hidden');
                if (globalNav) globalNav.classList.add('text-primary');
                updateGlobalPrices();
            }
        }
        
        function updateForexPrices() {
                window.defaultForexPairs.forEach(pair => {
                fetchForexPrice(pair.symbol);
            });
        }
        
        function updateIndicesPrices() {
            window.defaultIndices.forEach(index => {
                fetchRealtimePrice(index.symbol).then(data => {
                    if (data) {
                        const li = indicesList.querySelector(`[data-symbol="${index.symbol}"]`);
                            if (li) {
                                const priceDiv = li.querySelector('.loading-placeholder');
                                const changeDiv = li.querySelectorAll('.loading-placeholder')[1];
                            
                            if (priceDiv) {
                                priceDiv.textContent = data.price.toFixed(2);
                                priceDiv.className = 'font-semibold';
                            }
                            
                            if (changeDiv) {
                                changeDiv.textContent = `${data.isPositive ? '+' : ''}${data.changePercent.toFixed(2)}%`;
                                changeDiv.className = `text-sm ${data.isPositive ? 'text-positive' : 'text-negative'}`;
                            }
                        }
                            }
                        });
                });
            }

        function updateGlobalPrices() {
            window.defaultGlobalMarkets.forEach(market => {
                fetchRealtimePrice(market.symbol).then(data => {
                    if (data) {
                        const li = globalList.querySelector(`[data-symbol="${market.symbol}"]`);
                        if (li) {
                            const priceDiv = li.querySelector('.loading-placeholder');
                            const changeDiv = li.querySelectorAll('.loading-placeholder')[1];
                            
                            if (priceDiv) {
                                priceDiv.textContent = data.price.toFixed(2);
                                priceDiv.className = 'font-semibold';
                            }
                            
                            if (changeDiv) {
                                changeDiv.textContent = `${data.isPositive ? '+' : ''}${data.changePercent.toFixed(2)}%`;
                                changeDiv.className = `text-sm ${data.isPositive ? 'text-positive' : 'text-negative'}`;
                            }
                        }
                    }
                });
            });
        }
        
        async function fetchForexPrice(symbol) {
            try {
                // Create a normalized symbol for API call (removing slash)
                const normalizedSymbol = symbol.replace('/', '');
                
                // For rate limiting
                await new Promise(resolve => setTimeout(resolve, Math.random() * 500));
                
                // Use Finnhub forex endpoint
                const response = await fetch(`https://finnhub.io/api/v1/forex/rates?base=USD&token=cn31ik9r01qka98ott70cn31ik9r01qka98ott7g`);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                
                const data = await response.json();
                
                // Extract the relevant rate based on the symbol
                const currencies = symbol.split('/');
                let rate = 0;
                let change = 0;
                
                if (data && data.quote) {
                    if (currencies[0] === 'USD') {
                        // Direct USD conversion (USD/XXX)
                        rate = data.quote[currencies[1]];
                    } else if (currencies[1] === 'USD') {
                        // Inverse USD conversion (XXX/USD)
                        rate = 1 / data.quote[currencies[0]];
                    } else {
                        // Cross currency (XXX/YYY)
                        const baseRate = data.quote[currencies[0]];
                        const quoteRate = data.quote[currencies[1]];
                        rate = quoteRate / baseRate;
                    }
                    
                    // We don't have historical data, so use a small fixed change for UI purposes
                    change = 0.05;
                }
                
                // Update the UI
                updateForexPriceUI(symbol, rate, change);
            } catch (error) {
                console.error(`Error fetching forex price for ${symbol}:`, error);
                // Show error state in UI
                const li = forexList.querySelector(`[data-symbol="${symbol}"]`);
                if (li) {
                    const priceElement = li.querySelector('.font-semibold');
                    const changeElement = li.querySelector('.text-xs');
                    
                    if (priceElement) {
                        priceElement.textContent = 'Error';
                        priceElement.className = 'font-semibold text-red-500';
                    }
                    
                    if (changeElement) {
                        changeElement.textContent = 'Failed to load';
                        changeElement.className = 'text-sm text-red-500';
                    }
                }
            }
        }
        
        function updateForexPriceUI(symbol, rate, change) {
            const isPositive = change >= 0;
            const li = forexList.querySelector(`[data-symbol="${symbol}"]`);
            
            if (li) {
                const priceDiv = li.querySelector('.font-semibold');
                const changeDiv = li.querySelectorAll('.loading-placeholder')[1];
                
                if (priceDiv) {
                    priceDiv.textContent = rate.toFixed(4);
                }
                
                if (changeDiv) {
                    changeDiv.textContent = `${isPositive ? '+' : ''}${change.toFixed(2)}%`;
                    changeDiv.className = `text-sm ${isPositive ? 'text-positive' : 'text-negative'}`;
                }
            }
        }

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
            
            // Get forex data
            try {
                // Create a normalized symbol for API (remove slash)
                const normalizedSymbol = symbol.replace('/', '');
                
                // Use Finnhub forex endpoint
                fetch(`https://finnhub.io/api/v1/forex/rates?base=USD&token=cn31ik9r01qka98ott70cn31ik9r01qka98ott7g`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! Status: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        // Find the pair in our list
                        const pair = window.defaultForexPairs.find(p => p.symbol === symbol);
                        const name = pair ? pair.name : symbol;
                        
                        // Extract rate based on the symbol
                        const currencies = symbol.split('/');
                        let rate = 0;
                        
                        if (data && data.quote) {
                            if (currencies[0] === 'USD') {
                                // Direct USD conversion (USD/XXX)
                                rate = data.quote[currencies[1]];
                            } else if (currencies[1] === 'USD') {
                                // Inverse USD conversion (XXX/USD)
                                rate = 1 / data.quote[currencies[0]];
                            } else {
                                // Cross currency (XXX/YYY)
                                const baseRate = data.quote[currencies[0]];
                                const quoteRate = data.quote[currencies[1]];
                                rate = quoteRate / baseRate;
                            }
                        }
                        
                        // Set a small fixed change and spread for UI purposes
                        const change = 0.05;
                        const spread = 0.0010;
                        const sell = rate - (spread / 2);
                        const buy = rate + (spread / 2);
                        
                        // Update the UI
                        detailName.textContent = name;
                        detailSymbol.textContent = symbol;
                        detailChange.textContent = `${change.toFixed(2)}%`;
                        detailChange.className = 'text-positive';
                        sellPrice.textContent = sell.toFixed(4);
                        buyPrice.textContent = buy.toFixed(4);
                        
                        // Update the chart
                        updateForexChart(symbol);
                    })
                    .catch(error => {
                        console.error('Error getting forex data:', error);
                        detailSymbol.textContent = 'Error loading data';
                        detailChange.textContent = 'N/A';
                        sellPrice.textContent = 'N/A';
                        buyPrice.textContent = 'N/A';
                    });
            } catch (error) {
                console.error('Error getting forex data:', error);
                detailSymbol.textContent = 'Error loading data';
            }
        }

            function updateForexChart(symbol) {
                const chart = document.querySelector('#stock-chart');
                chart.innerHTML = '<div class="text-gray-400">Loading chart data...</div>';

                // Show message since we don't have real forex chart data
                setTimeout(() => {
                    chart.innerHTML = '<div class="text-gray-400">Forex chart data not available</div>';
                }, 800);
            }

        // Function to update chart using Finnhub API
        async function updateChart(symbol, days = 30) {
            const chartElement = document.getElementById('stock-chart');
            if (!chartElement) return;
            
            // Show loading state
            chartElement.innerHTML = '<div class="flex items-center justify-center p-8"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>';
            
            try {
                // Add delay to prevent rate limiting issues
                await new Promise(resolve => setTimeout(resolve, Math.random() * 500));
                
                // Calculate time parameters
                const to = Math.floor(Date.now() / 1000);
                const from = to - (days * 24 * 60 * 60);
                const resolution = days <= 7 ? '30' : days <= 30 ? 'D' : 'W';
                
                // Fetch data from Finnhub
                const response = await fetch(`https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}&token=cn31ik9r01qka98ott70cn31ik9r01qka98ott7g`);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                
                const data = await response.json();
                
                if (data.s === 'no_data') {
                    console.warn(`No chart data available for ${symbol}`);
                    chartElement.innerHTML = '<div class="p-4 text-gray-500">No chart data available</div>';
                    return;
                }
                
                // Prepare data for chart
                const chartData = [];
                for (let i = 0; i < data.t.length; i++) {
                    chartData.push({
                        x: new Date(data.t[i] * 1000),
                        o: data.o[i],
                        h: data.h[i],
                        l: data.l[i],
                        c: data.c[i]
                    });
                }
                
                renderChart(chartElement, chartData);
                
            } catch (error) {
                console.error('Error fetching chart data:', error);
                chartElement.innerHTML = '<div class="p-4 text-gray-500">Error loading chart data</div>';
            }
        }
        
        // Function to render chart with real data
        function renderChart(chartElement, chartData) {
            // Create line chart data
            const trace = {
                x: chartData.map(point => point.x),
                y: chartData.map(point => point.c),
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
            
            // Check if Plotly is available
            if (typeof Plotly !== 'undefined') {
                Plotly.newPlot(chartElement, [trace], layout, {
                    displayModeBar: false,
                    responsive: true
                });
            } else {
                // Fallback message
                chartElement.innerHTML = '<div class="p-4 text-gray-500">Chart library not loaded</div>';
            }
        }

        // Function to load watchlist items
        async function loadWatchlistItems(watchlistId) {
            const stockListEl = document.getElementById('stock-list');
            if (!stockListEl) return;

            // Show loading state
            stockListEl.innerHTML = `
                <div class="flex items-center justify-center p-8">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            `;

            try {
                // Use hard-coded data instead of fetching from JSON
                let data;
                
                if (watchlistId === 'default-stocks') {
                    data = {
                        watchlist_name: "Stocks",
                        items: window.defaultStocks
                    };
                } else if (watchlistId === 'default-forex') {
                    data = {
                        watchlist_name: "Forex",
                        items: window.defaultForexPairs
                    };
                } else if (watchlistId === 'default-indices') {
                    data = {
                        watchlist_name: "Indices",
                        items: window.defaultIndices
                    };
                } else if (watchlistId === 'default-global') {
                    data = {
                        watchlist_name: "Global Market",
                        items: window.defaultGlobalMarkets
                    };
                } else {
                    throw new Error(`Watchlist ${watchlistId} not found`);
                }
                
                if (data.items && data.items.length > 0) {
                    // Update watchlist name
                    const watchlistNameEl = document.getElementById('watchlist-name');
                    if (watchlistNameEl) {
                        watchlistNameEl.textContent = data.watchlist_name;
                    }

                    // Clear and populate the list
                    stockListEl.innerHTML = '';
                    const fetchPricePromises = [];
                    
                    data.items.forEach(stock => {
                        const div = document.createElement('div');
                        div.className = 'p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 border-b dark:border-gray-700 border-gray-200';
                        div.setAttribute('data-symbol', stock.symbol);
                        
                        div.innerHTML = `
                            <div class="flex items-center justify-between">
                                <div class="flex items-center space-x-3">
                                    <div class="w-8 h-8 flex-shrink-0">
                                        <img src="${stock.logoUrl || 'https://via.placeholder.com/150x150.png?text=' + stock.symbol}" alt="${stock.name} logo" class="w-full h-full object-contain" onerror="this.src='https://via.placeholder.com/150x150.png?text=${stock.symbol}'">
                                    </div>
                                    <div>
                                        <div class="font-medium">${stock.name}</div>
                                        <div class="text-sm text-gray-400">${stock.symbol}</div>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <div class="font-semibold">Loading...</div>
                                    <div class="text-xs">Loading...</div>
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
                        
                        // Queue price fetch for this stock
                        fetchPricePromises.push(fetchRealtimePrice(stock.symbol));
                    });
                    
                    // Show the first stock as default
                    if (data.items.length > 0) {
                        showStockDetail(data.items[0]);
                    }
                    
                    // Fetch all prices in parallel with smaller batches to avoid rate limiting
                    const batchSize = 5;
                    for (let i = 0; i < fetchPricePromises.length; i += batchSize) {
                        const batch = fetchPricePromises.slice(i, i + batchSize);
                        await Promise.all(batch).catch(error => {
                            console.error(`Error fetching prices for batch ${i}-${i+batchSize}:`, error);
                        });
                        // Add a small delay between batches
                        if (i + batchSize < fetchPricePromises.length) {
                            await new Promise(resolve => setTimeout(resolve, 1000));
                        }
                    }
                } else {
                    stockListEl.innerHTML = `
                        <div class="p-8 text-center text-gray-500">
                            No items in this watchlist
                        </div>
                    `;
                }
            } catch (error) {
                console.error('Error loading watchlist:', error);
                stockListEl.innerHTML = `
                    <div class="p-8 text-center text-red-500">
                        Error loading watchlist: ${error.message}
                    </div>
                `;
            }
        }

        // Function to switch between watchlists
        async function switchWatchlist(watchlistId) {
            // Show loading state in the list
            await loadWatchlistItems(watchlistId);
        }

    // Initialize the application
        document.addEventListener('DOMContentLoaded', () => {
        // Load the default watchlist
        loadWatchlistItems('default-stocks');
        
        // Load forex, indices, and global markets data
        loadMarketData();
        
        // Add event listeners for market navigation
        const stocksNav = document.querySelector('a[data-section="stocks"]');
        const forexNav = document.querySelector('a[data-section="forex"]');
        const indicesNav = document.querySelector('a[data-section="indices"]');
        const globalNav = document.querySelector('a[data-section="global"]');
        
        if (forexNav) {
            forexNav.addEventListener('click', (e) => {
                e.preventDefault();
                switchToMarketType('forex');
            });
        }
        
        if (stocksNav) {
            stocksNav.addEventListener('click', (e) => {
                e.preventDefault();
                switchToMarketType('stocks');
            });
            
            // Set initial active state for navigation
            stocksNav.classList.add('text-primary');
        }
        
        if (indicesNav) {
            indicesNav.addEventListener('click', (e) => {
                e.preventDefault();
                switchToMarketType('indices');
            });
        }
        
        if (globalNav) {
            globalNav.addEventListener('click', (e) => {
                e.preventDefault();
                switchToMarketType('global');
            });
        }
        
        // Add event listeners for watchlist navigation
            const watchlistLinks = document.querySelectorAll('.watchlist-link');
            watchlistLinks.forEach(link => {
                link.addEventListener('click', async (e) => {
                    e.preventDefault();
                    const watchlistId = link.getAttribute('data-watchlist-id');
                    
                    // Remove active class from all links
                    watchlistLinks.forEach(l => l.classList.remove('text-primary'));
                    // Add active class to clicked link
                    link.classList.add('text-primary');
                    
                    // Load the selected watchlist
                    await switchWatchlist(watchlistId);
                });
            });
        
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
                    default: days = 30; break;
                }
                
                // Update chart with new time period
                const currentSymbol = document.getElementById('detail-symbol').textContent;
                updateChart(currentSymbol, days);
            });
        });

        // Add chart type toggle functionality
        const chartTypeToggle = document.getElementById('chart-type-toggle');
        if (chartTypeToggle) {
            let isCandlestick = true;

            chartTypeToggle.addEventListener('click', () => {
                isCandlestick = !isCandlestick;
                const currentSymbol = document.getElementById('detail-symbol').textContent;
                const activeTimeBtn = document.querySelector('.time-button.time-active');
                const currentDays = activeTimeBtn ? 
                    parseInt(activeTimeBtn.textContent.replace(/[^0-9]/g, '')) || 30 : 30;
                updateChart(currentSymbol, currentDays);
            });
        }
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
    
    // Function to add a stock to the list
    async function addStockToList(symbol) {
        try {
            const response = await fetch(`/api/search?q=${encodeURIComponent(symbol)}`);
            const data = await response.json();
            
            if (data.error) {
                showError(data.error);
                return;
            }
            
            const stockData = data.result?.find(s => s.symbol === symbol);
            if (!stockData) {
                showError('Stock not found');
                return;
            }
            
            // Add to the list
            const stockList = document.getElementById('stock-list');
            if (stockList) {
                const div = document.createElement('div');
                div.className = 'p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 border-b dark:border-gray-700 border-gray-200';
                div.setAttribute('data-symbol', stockData.symbol);
                
                div.innerHTML = `
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-3">
                            <div class="w-8 h-8 flex-shrink-0">
                                <img src="${stockData.logoUrl}" alt="${stockData.name} logo" class="w-full h-full object-contain">
                            </div>
                            <div>
                                <div class="font-medium">${stockData.name}</div>
                                <div class="text-sm text-gray-400">${stockData.symbol}</div>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="font-semibold">$${formatPrice(stockData.price)}</div>
                            <div class="text-xs ${stockData.isPositive ? 'text-positive' : 'text-negative'}">
                                ${stockData.isPositive ? '+' : ''}${formatPrice(stockData.change)} (${stockData.isPositive ? '+' : ''}${formatPrice(stockData.changePercent)}%)
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
                    showStockDetail(stockData);
                });
                
                stockList.appendChild(div);
                
                // Show the newly added stock
                showStockDetail(stockData);
            }
        } catch (error) {
            console.error('Error adding stock to list:', error);
            showError('Failed to add stock to list. Please try again.');
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
        
        // Set initial values from JSON data
        document.getElementById('detail-name').textContent = stock.name;
        document.getElementById('detail-symbol').textContent = stock.symbol;
        
        // Initialize with loading state for price data
        document.getElementById('detail-change').textContent = 'Loading...';
        document.getElementById('detail-sell-price').textContent = 'Loading...';
        document.getElementById('detail-buy-price').textContent = 'Loading...';
        
        // Fetch real-time price data from Finnhub
        fetchRealtimePrice(stock.symbol);
        
        // Update chart
        updateChart(stock.symbol);
    }

    // Function to fetch real-time price data from Finnhub
    async function fetchRealtimePrice(symbol, marketType = 'stock') {
        try {
            // For rate limiting - add small delay between requests
            await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));
            
            let response;
            if (marketType === 'stock') {
                response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=cn31ik9r01qka98ott70cn31ik9r01qka98ott7g`);
            } else if (marketType === 'forex') {
                response = await fetch(`https://finnhub.io/api/v1/forex/rates?base=${symbol}&token=cn31ik9r01qka98ott70cn31ik9r01qka98ott7g`);
            } else if (marketType === 'indices' || marketType === 'global') {
                response = await fetch(`https://finnhub.io/api/v1/quote?symbol=^${symbol}&token=cn31ik9r01qka98ott70cn31ik9r01qka98ott7g`);
            }
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data || data.error) {
                console.error('Error fetching price data:', data.error || 'Unknown error');
                return null;
            }
            
            let price, change, changePercent, isPositive;
            
            if (marketType === 'stock') {
                price = data.c; // Current price
                const previousClose = data.pc; // Previous close price
                change = price - previousClose;
                changePercent = (change / previousClose) * 100;
                isPositive = change >= 0;
            } else if (marketType === 'forex') {
                price = data.quote[symbol];
                const previousClose = price * 0.99; // Mock previous close
                change = price - previousClose;
                changePercent = (change / previousClose) * 100;
                isPositive = change >= 0;
            } else if (marketType === 'indices' || marketType === 'global') {
                price = data.c;
                const previousClose = data.pc;
                change = price - previousClose;
                changePercent = (change / previousClose) * 100;
                isPositive = change >= 0;
            }
            
            // Update UI with fetched data based on market type
            if (marketType === 'stock') {
                updateStockPriceUI(symbol, price, change, changePercent, isPositive);
            } else if (marketType === 'forex') {
                updateForexPriceUI(symbol, price, changePercent);
            } else if (marketType === 'indices') {
                updateIndicesPriceUI(symbol, price, change, changePercent, isPositive);
            } else if (marketType === 'global') {
                updateGlobalPriceUI(symbol, price, change, changePercent, isPositive);
            }
            
            return {
                price,
                change,
                changePercent,
                isPositive
            };
        } catch (error) {
            console.error(`Error fetching price for ${symbol}:`, error);
            return null;
        }
    }
    
    // Helper function to update UI with stock price data
    function updateStockPriceUI(symbol, price, change, changePercent, isPositive) {
        // Update detail view if this is the current stock
        const currentSymbol = document.getElementById('detail-symbol')?.textContent;
        if (currentSymbol === symbol) {
            const changeElement = document.getElementById('detail-change');
            if (changeElement) {
                const changeText = `${isPositive ? '+' : ''}${formatPrice(changePercent)}% (${isPositive ? '+' : ''}${formatPrice(change)})`;
                changeElement.textContent = changeText;
                changeElement.className = isPositive ? 'text-positive' : 'text-negative';
            }
            
            const sellPriceElement = document.getElementById('detail-sell-price');
            if (sellPriceElement) {
                sellPriceElement.textContent = `$${formatPrice(price)}`;
            }
            
            const buyPriceElement = document.getElementById('detail-buy-price');
            if (buyPriceElement) {
                buyPriceElement.textContent = `$${formatPrice(price + 0.03)}`;
            }
        }
        
        // Update price in list view
        const stockElement = document.querySelector(`#stock-list [data-symbol="${symbol}"]`);
        if (stockElement) {
            const priceElement = stockElement.querySelector('.font-semibold');
            const changeElement = stockElement.querySelector('.text-xs');
            
            if (priceElement) {
                priceElement.textContent = `$${formatPrice(price)}`;
            }
            
            if (changeElement) {
                changeElement.textContent = `${isPositive ? '+' : ''}${formatPrice(change)} (${isPositive ? '+' : ''}${formatPrice(changePercent)}%)`;
                changeElement.className = `text-xs ${isPositive ? 'text-positive' : 'text-negative'}`;
            }
        }
    }
    
    // Helper function to update UI with forex price data
    function updateForexPriceUI(symbol, rate, changePercent) {
        const listItem = document.querySelector(`#forex-list [data-symbol="${symbol}"]`);
        if (listItem) {
            const priceElement = listItem.querySelector('.font-semibold');
            const changeElement = listItem.querySelector('.text-xs');
            
            if (priceElement) {
                priceElement.textContent = rate.toFixed(4);
            }
            
            if (changeElement) {
                const isPositive = changePercent >= 0;
                changeElement.textContent = `${isPositive ? '+' : ''}${changePercent.toFixed(2)}%`;
                changeElement.className = `text-xs ${isPositive ? 'text-positive' : 'text-negative'}`;
            }
        }
    }
    
    // Helper function to update UI with indices price data
    function updateIndicesPriceUI(symbol, price, change, changePercent, isPositive) {
        const listItem = document.querySelector(`#indices-list [data-symbol="${symbol}"]`);
        if (listItem) {
            const priceElement = listItem.querySelector('.font-semibold');
            const changeElement = listItem.querySelector('.text-xs');
            
            if (priceElement) {
                priceElement.textContent = formatPrice(price);
            }
            
            if (changeElement) {
                changeElement.textContent = `${isPositive ? '+' : ''}${formatPrice(change)} (${isPositive ? '+' : ''}${formatPrice(changePercent)}%)`;
                changeElement.className = `text-xs ${isPositive ? 'text-positive' : 'text-negative'}`;
            }
        }
    }
    
    // Helper function to update UI with global market price data
    function updateGlobalPriceUI(symbol, price, change, changePercent, isPositive) {
        const listItem = document.querySelector(`#global-list [data-symbol="${symbol}"]`);
        if (listItem) {
            const priceElement = listItem.querySelector('.font-semibold');
            const changeElement = listItem.querySelector('.text-xs');
            
            if (priceElement) {
                priceElement.textContent = formatPrice(price);
            }
            
            if (changeElement) {
                changeElement.textContent = `${isPositive ? '+' : ''}${formatPrice(change)} (${isPositive ? '+' : ''}${formatPrice(changePercent)}%)`;
                changeElement.className = `text-xs ${isPositive ? 'text-positive' : 'text-negative'}`;
            }
        }
    }

    // Function to show market details
    function showMarketDetail(symbol, name, marketType) {
        const detailSection = document.getElementById('stock-detail');
        if (!detailSection) return;
        
        detailSection.classList.remove('hidden');
        detailSection.classList.add('md:flex');
        
        // Set initial values
        document.getElementById('detail-name').textContent = name;
        document.getElementById('detail-symbol').textContent = symbol;
        
        // Initialize with loading state for price data
        document.getElementById('detail-change').textContent = 'Loading...';
        document.getElementById('detail-sell-price').textContent = 'Loading...';
        document.getElementById('detail-buy-price').textContent = 'Loading...';
        
        // Fetch real-time price data
        fetchRealtimePrice(symbol, marketType);
        
        // Update chart based on market type
        if (marketType === 'forex') {
            updateForexChart(symbol);
        } else {
            updateChart(symbol);
        }
    }

