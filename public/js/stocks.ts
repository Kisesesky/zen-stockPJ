export interface MarketData {
    regularMarketPrice: number;
    regularMarketChange: number;
    regularMarketChangePercent: number;
    regularMarketVolume: number;
}

export interface Stock {
    symbol: string;
    shortName: string;
    currency: string;
    marketData: MarketData;
    marketCap: number;
    lastUpdated: string;
}

export async function fetchAndUpdateStocks(): Promise<void> {
    try {
        const response = await fetch('/api/v1/stock/summary');
        const stocks: Stock[] = await response.json();
        
        // 전체 통계 계산
        const totalMarketCap = stocks.reduce((sum, stock) => sum + (stock.marketCap || 0), 0);
        const gainers = stocks.filter(stock => stock.marketData.regularMarketChange > 0).length;
        const losers = stocks.filter(stock => stock.marketData.regularMarketChange < 0).length;
        
        updateUI(stocks, totalMarketCap, gainers, losers);
    } catch (error) {
        console.error('Error fetching stocks:', error);
        showError();
    }
}

function updateSummaryStats(totalStocks: number, gainers: number, losers: number, totalMarketCap: number): void {
    const summaryStats = document.getElementById('summaryStats');
    if (summaryStats) {
        summaryStats.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">총 종목</span>
                <span class="stat-value">${totalStocks}</span>
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
}

function updateStocksTable(stocks: Stock[]): void {
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
}

function updateUI(stocks: Stock[], totalMarketCap: number, gainers: number, losers: number): void {
    updateSummaryStats(stocks.length, gainers, losers, totalMarketCap);
    updateStocksTable(stocks);
}

function showError(): void {
    const stocksBody = document.getElementById('stocksBody');
    if (stocksBody) {
        stocksBody.innerHTML = `
            <tr><td colspan="6" class="error-message">데이터를 불러오는 중 오류가 발생했습니다.</td></tr>
        `;
    }
}

// 초기화 및 주기적 업데이트
fetchAndUpdateStocks();
setInterval(fetchAndUpdateStocks, 60000);
