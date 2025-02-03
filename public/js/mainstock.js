//mainstock.js

"use strict";

async function fetchAndUpdateMainStocks() {
    try {
        const response = await fetch('/api/v1/mainstock', {
            headers: {
                'Accept': 'application/json',
            }
        });
        const stocks = await response.json();
        updateStockTable(stocks);
    } catch (error) {
        console.error('Failed to fetch stocks:', error);
    }
}

function updateStockTable(stocks) {
    const tbody = document.getElementById('main-stock-container');
    if (!tbody) return;
    
    // 먼저 즐겨찾기 목록을 가져옴
    fetch('/api/v1/favorite/list', {
        credentials: 'include'
    })
    .then(response => response.json())
    .then(favorites => {
        const favoriteSet = new Set(favorites.stocks || []);
        
        tbody.innerHTML = stocks.map(stock => {
            const isPositive = stock.marketData.regularMarketChange >= 0;
            const isFavorite = favoriteSet.has(stock.symbol);
            const starIcon = isFavorite ? 'fa-solid' : 'fa-regular';
            const marketCap = stock.marketData.regularMarketPrice * stock.marketData.regularMarketVolume / 10 ** 9;
            
            return `
                <tr class="stock-row" style="background-color: #FAFAFA;">
                    <td>
                        <a href="#" onclick="addFavorite('${stock.symbol}'); return false;">
                            <i class="${starIcon} fa-star" style="color: #FFD700;"></i>
                        </a>
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
                    <td class="volume">${stock.marketData.regularMarketVolume.toLocaleString()}</td>
                    <td class="market-cap">${marketCap.toFixed(2)}B</td>
                </tr>
            `;
        }).join('');
    })
    .catch(error => console.error('Failed to fetch favorites:', error));
}

// 함수를 전역으로 만들기
window.addFavorite = async function(symbol) {
    try {
        const response = await fetch(`/api/v1/favorite/add/${symbol}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });
        if (!response.ok) {
            throw new Error('Failed to add favorite');
        }
        // 성공 시 테이블 새로고침
        await fetchAndUpdateMainStocks();
    } catch (error) {
        console.error('Error:', error);
    }
}

// 초기 로드 및 자동 업데이트
document.addEventListener('DOMContentLoaded', fetchAndUpdateMainStocks);
setInterval(fetchAndUpdateMainStocks, 10000);
