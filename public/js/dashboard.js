async function fetchAndUpdateStocks() {
    try {
        const favoriteResponse = await fetch('/api/v1/favorite/list');
        const favorites = await favoriteResponse.json();
        
        const stockPromises = favorites.stocks.map(symbol => 
            fetch(`/api/v1/stock/quote/${symbol}`).then(r => r.json())
        );
        
        const stocks = await Promise.all(stockPromises);
        const totalMarketCap = stocks.reduce((sum, stock) => sum + (stock.marketCap || 0), 0);
        const gainers = stocks.filter(stock => stock.marketData.regularMarketChange > 0).length;
        const losers = stocks.filter(stock => stock.marketData.regularMarketChange < 0).length;

        const summaryStats = document.getElementById('summaryStats');
        if (summaryStats) {
            summaryStats.innerHTML = `
                <div class="stat-item">
                    <span class="stat-label">즐겨찾기 종목</span>
                    <span class="stat-value">${stocks.length}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">상승 종목</span>
                    <span class="stat-value positive">${gainers}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">하락 종목</span>
                    <span class="stat-value negative">${losers}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">시가총액</span>
                    <span class="stat-value">${(totalMarketCap / 10 ** 9).toFixed(2)}B</span>
                </div>
            `;
        }

        const tbody = document.getElementById('stocksBody');
        if (tbody) {
            tbody.innerHTML = stocks.map(stock => {
                const isPositive = stock.marketData.regularMarketChange >= 0;
                return `
                    <tr class="stock-row">
                        <td>
                            <a href="/api/v1/stock/view/${stock.symbol}">
                                <div class="stock-name">${stock.shortName}</div>
                                <div class="stock-symbol">${stock.symbol}</div>
                            </a>
                        </td>
                        <td class="price">${stock.currency} ${stock.marketData.regularMarketPrice.toFixed(2)}</td>
                        <td class="${isPositive ? 'positive' : 'negative'}">${isPositive ? '+' : ''}${stock.marketData.regularMarketChange.toFixed(2)}</td>
                        <td class="${isPositive ? 'positive' : 'negative'}">${isPositive ? '+' : ''}${stock.marketData.regularMarketChangePercent.toFixed(2)}%</td>
                        <td>${stock.marketData.regularMarketVolume.toLocaleString()}</td>
                        <td>${(stock.marketCap / 10 ** 9).toFixed(2)}B</td>
                    </tr>
                `;
            }).join('');
        }
    } catch (error) {
        console.error('Error:', error);
        const stocksBody = document.getElementById('stocksBody');
        if (stocksBody) {
            stocksBody.innerHTML = `
                <tr><td colspan="6" class="error-message">즐겨찾기한 종목을 불러오는 중 오류가 발생했습니다.</td></tr>
            `;
        }
    }
}

fetchAndUpdateStocks();

//1분
setInterval(fetchAndUpdateStocks, 60000); 