"use strict";
async function fetchStockData(symbol) {
    try {
        const response = await fetch(`/api/v1/stock/price/${symbol}`);
        if (!response.ok) {
            throw new Error('Failed to fetch stock data');
        }
        const data = await response.json();
        displayStockData(data);
        // db에 저장 (에러남)
        // await fetch(`/api/stock/saved/${symbol}`, {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify(data)
        // });
    }
    catch (error) {
        console.error('Error fetching stock data:', error);
        const stockInfo = document.getElementById('stockInfo');
        if (stockInfo) {
            stockInfo.innerHTML = `
                <div class="error-message">데이터를 불러오는 중 오류가 발생했습니다.</div>
            `;
        }
    }
}
function displayStockData(data) {
    const container = document.getElementById('stockInfo');
    if (!container)
        return;
    const isPositive = data.marketData.regularMarketChange >= 0;
    container.innerHTML = `
        <div class="stock-header">
            <div>
                <div class="stock-name">${data.shortName}</div>
                <div class="stock-symbol">${data.symbol}</div>
            </div>
            <div class="current-price">
                ${data.currency} ${data.marketData.regularMarketPrice.toFixed(2)}
            </div>
        </div>
        
        <div class="price-section">
            <div class="price-change ${isPositive ? 'positive' : 'negative'}">
                ${isPositive ? '+' : ''}${data.marketData.regularMarketChange.toFixed(2)} 
                (${data.marketData.regularMarketChangePercent.toFixed(2)}%)
            </div>
        </div>

        <div class="market-data">
            <div class="data-item">
                <div class="data-label">시가</div>
                <div class="data-value">${data.marketData.regularMarketOpen.toFixed(2)}</div>
            </div>
            <div class="data-item">
                <div class="data-label">고가</div>
                <div class="data-value">${data.marketData.regularMarketDayHigh.toFixed(2)}</div>
            </div>
            <div class="data-item">
                <div class="data-label">저가</div>
                <div class="data-value">${data.marketData.regularMarketDayLow.toFixed(2)}</div>
            </div>
            <div class="data-item">
                <div class="data-label">거래량</div>
                <div class="data-value">${data.marketData.regularMarketVolume.toLocaleString()}</div>
            </div>
            <div class="data-item">
                <div class="data-label">시가총액</div>
                <div class="data-value">${(data.marketCap / 1000000000).toFixed(2)}B</div>
            </div>
            <div class="data-item">
                <div class="data-label">52주 범위</div>
                <div class="data-value">${data.fiftyTwoWeek.low.toFixed(2)} - ${data.fiftyTwoWeek.high.toFixed(2)}</div>
            </div>
        </div>

        <div class="last-updated">
            마지막 업데이트: ${new Date(data.lastUpdated).toLocaleString()}
        </div>
    `;
}
const symbol = window.location.pathname.split('/').pop();
if (symbol) {
    fetchStockData(symbol);
    // 업데이트 주기 나중에 수정하기
    setInterval(() => fetchStockData(symbol), 1009999900);
}
