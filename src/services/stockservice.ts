//stockservice.ts

import yahooFinance from 'yahoo-finance2';
import {Stock} from '../models/index.js';

// 알림 메시지 숨기기
yahooFinance.suppressNotices(['yahooSurvey']);

interface StockData {
    symbol: string;
    shortName?: string;
    currency: string | undefined;
    marketData: {
        regularMarketPrice: number | undefined;
        regularMarketOpen: number | undefined;
        regularMarketDayHigh: number | undefined;
        regularMarketDayLow: number | undefined;
        regularMarketPreviousClose: number | undefined;
        regularMarketChange: number | undefined;
        regularMarketChangePercent: number | undefined;
        regularMarketVolume: number | undefined;
    };
    marketCap?: number;
    fiftyTwoWeek?: {
        high: number | undefined;
        low: number | undefined;
    };
    lastUpdated: Date;
}

class StockService {
    async getStockQuote(symbol: string): Promise<StockData> {
        const quote = await yahooFinance.quote(symbol);
        return {
            symbol: quote.symbol,
            shortName: quote.shortName,
            currency: quote.currency,
            marketData: {
                regularMarketPrice: quote.regularMarketPrice,
                regularMarketOpen: quote.regularMarketOpen,
                regularMarketDayHigh: quote.regularMarketDayHigh,
                regularMarketDayLow: quote.regularMarketDayLow,
                regularMarketPreviousClose: quote.regularMarketPreviousClose,
                regularMarketChange: quote.regularMarketChange,
                regularMarketChangePercent: quote.regularMarketChangePercent,
                regularMarketVolume: quote.regularMarketVolume
            },
            marketCap: quote.marketCap,
            fiftyTwoWeek: {
                high: quote.fiftyTwoWeekHigh,
                low: quote.fiftyTwoWeekLow
            },
            lastUpdated: new Date()
        };
    }

    async saveStockData(stockData: StockData): Promise<StockData> {
        return await Stock.findOneAndUpdate(
            { symbol: stockData.symbol },
            stockData,
            { 
                upsert: true,
                new: true,
                setDefaultsOnInsert: true
            }
        );
    }

    async getSavedStock(symbol: string): Promise<StockData | null> {
        return await Stock.findOne({ symbol });
    }

    async getAllStocks(): Promise<StockData[]> {
        return await Stock.find({});
    }

    async getStockSummaries(): Promise<Partial<StockData>[]> {
        const stocks = await Stock.find({}, {
            symbol: 1,
            shortName: 1,
            currency: 1,
            'marketData.regularMarketPrice': 1,
            'marketData.regularMarketChange': 1,
            'marketData.regularMarketChangePercent': 1,
            'marketData.regularMarketVolume': 1,
            marketCap: 1,
            lastUpdated: 1
        }).sort({ 'marketData.regularMarketChangePercent': -1 });

        return stocks.map(stock => stock.toObject()) as Partial<StockData>[];
    }

    async getMostActiveStocks(): Promise<Partial<StockData>[]> {
        try {
            // 스키마 검증 오류를 무시하도록 설정
            const result = await yahooFinance.screener({
                scrIds: 'most_actives',
                count: 10
            }, {
                validateResult: false  // 스키마 검증을 비활성화
            });

            if (!result || !result.quotes || result.quotes.length === 0) {
                console.error('No stock data received from Yahoo Finance');
                return [];
            }

            const stocks = result.quotes.map((quote: { symbol: any; shortName: any; currency: any; regularMarketPrice: any; regularMarketVolume: any; regularMarketChange: any; regularMarketChangePercent: any; }) => ({
                symbol: quote.symbol,
                shortName: quote.shortName || quote.symbol,
                currency: quote.currency || 'USD',
                marketData: {
                    regularMarketPrice: quote.regularMarketPrice || 0,
                    regularMarketVolume: quote.regularMarketVolume || 0,
                    regularMarketChange: quote.regularMarketChange || 0,
                    regularMarketChangePercent: quote.regularMarketChangePercent || 0
                },
                lastUpdated: new Date().toISOString()
            }));

            return stocks;
        } catch (error) {
            console.error('Failed to fetch most active stocks:', error);
            return [];
        }
    }

    async getChartData(symbol: string, period: string = '1y') {
        try {
            const result = await yahooFinance.chart(symbol, {
                period1: new Date(Date.now() - (365 * 24 * 60 * 60 * 1000)), // 1 year ago
                period2: new Date(), // now
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
            console.error('Failed to fetch chart data:', error);
            return [];
        }
    }

    async getStockChartData(symbol: string, period: string = '1y') {
        try {
            let interval = '1d';  // 기본값
            let range = 365;
            switch(period) {
                case '1d':
                    interval = '5m';  // 5분 간격
                    range = 5;
                    break;
                case '1w':
                    interval = '15m';  // 15분 간격
                    range = 30;
                    break;
                case '1m':
                    interval = '1h';  // 1시간 간격
                    range = 60;
                    break;
                case '3m':
                    interval = '1h';  // 1시간 간격
                    range = 90;
                    break;
                case '6m':
                    interval = '1d';  // 1일 간격
                    range = 180;
                    break;
                default:
                    interval = '1d';  // 1년 이상은 1일 간격
                    range = 365;
            }
            const now = Math.floor(Date.now() / 1000);
            const period1 = now - range * 24 * 60 * 60;
            const period2 = now;

            const result = await yahooFinance.chart(symbol, {
                period1: period1,
                period2: period2,
                interval: interval as "1m" | "5m" | "15m" | "1h" | "1d"
            });

            let chartData = result.quotes.map((quote: any) => ({
                date: quote.date.toISOString(),
                close: quote.close || null
            }));

            chartData = chartData.filter((data: any) => data.close !== null);

            if (chartData.length > 100) {
                const step = Math.ceil(chartData.length / 100);
                chartData = chartData.filter((_, index: number) => index % step === 0);
            }

            return chartData;
        } catch (error) {
            console.error(`Error fetching chart data for ${symbol}:`, error);
            throw error;
        }
    }
}

export default new StockService();