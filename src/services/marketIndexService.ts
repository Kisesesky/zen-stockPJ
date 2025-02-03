//marketIndexService.ts

import yahooFinance from 'yahoo-finance2';

interface MarketIndex {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
}

async function getMarketIndices(): Promise<MarketIndex[]> {
    const indices = [
        { symbol: '^IXIC', name: 'NASDAQ' },
        { symbol: '^GSPC', name: 'S&P 500' },
        { symbol: '^DJI', name: 'Dow Jones' }
    ];

    try {
        const results = await Promise.all(
            indices.map(async (index) => {
                const quote = await yahooFinance.quote(index.symbol);
                return {
                    symbol: index.symbol,
                    name: index.name,
                    price: quote.regularMarketPrice || 0,
                    change: quote.regularMarketChange || 0,
                    changePercent: quote.regularMarketChangePercent || 0
                };
            })
        );
        return results;
    } catch (error) {
        console.error('Failed to fetch market indices:', error);
        return [];
    }
}

async function getChartData(symbol: string, period: string = '1y') {
    try {
        const result = await yahooFinance.chart(symbol, {
            period1: new Date(Date.now() - (period === '1y' ? 365 : 30) * 24 * 60 * 60 * 1000),
            period2: new Date(),
            interval: '1d'
        });

        return result.quotes.map(quote => ({
            date: quote.date,
            close: quote.close,
            high: quote.high,
            low: quote.low,
            open: quote.open,
            volume: quote.volume
        }));
    } catch (error) {
        return [];
    }
}

export default {
    getMarketIndices,
    getChartData
}; 