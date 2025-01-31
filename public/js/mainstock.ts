export interface MarketData {
    regularMarketPrice: number
    regularMarketChange: number;
    regularMarketChangePercent: number;
    regularMarketVolume: number;
}

export interface StockData {
    symbol: string;
    shortName: string;
    marketData: MarketData;
    lastUpdated: string;
}

export async function fetchAndUpdateMainStocks(): Promise<void> {
    try {
        const response = await fetch('/api/v1/mainstock', {
            headers: {
                'Accept': 'application/json',
            }
        });
        const stocks: StockData[] = await response.json();
        updateStockTable(stocks);
    } catch (error) {
        console.error('Failed to fetch stocks:', error);
    }
}

export function updateStockTable(stocks: StockData[]): void {
    const tbody = document.getElementById('main-stock-container');
    if (!tbody) return;
    
    tbody.innerHTML = stocks.map(stock => {
        const isPositive = stock.marketData.regularMarketChange >= 0;
        const marketCap = stock.marketData.regularMarketPrice * stock.marketData.regularMarketVolume / 10 ** 9;
        
        return `
            <tr class="stock-row">
                 <td>
                    <a href="/api/favorite/add/${stock.symbol}">⭐</a>
                </td>
                <td>
                    <a href="/api/v1/stock/view/${stock.symbol}">
                        <div class="stock-name">${stock.shortName}</div>
                        <div class="stock-symbol">${stock.symbol}</div>
                    </a>
                </td>
                <td class="price">$${stock.marketData.regularMarketPrice.toFixed(2)}</td>
                <td class="${isPositive ? 'positive' : 'negative'}">
                    ${isPositive ? '+' : ''}${stock.marketData.regularMarketChange.toFixed(2)}
                </td>
                <td class="${isPositive ? 'positive' : 'negative'}">
                    ${isPositive ? '+' : ''}${stock.marketData.regularMarketChangePercent.toFixed(2)}%
                </td>
                <td>${stock.marketData.regularMarketVolume.toLocaleString()}</td>
                <td>${marketCap.toFixed(2)}B</td>
            </tr>
        `;
    }).join('');
}

// 초기 로드 및 자동 업데이트
document.addEventListener('DOMContentLoaded', fetchAndUpdateMainStocks);
setInterval(fetchAndUpdateMainStocks, 10000);
