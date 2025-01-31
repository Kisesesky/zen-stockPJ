import express from 'express';
import yahooFinance from 'yahoo-finance2';
import path from 'path';
import { fileURLToPath } from 'url';
import { Request, Response } from 'express';

const router = express.Router();

interface ChartQueryOptions {
    period1: string;
    period2: string;
    interval: '1m' | '1d' | '1mo';
}

interface ChartDataPoint {
    date: Date;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    adjclose: number;
}

type PeriodType = '1d' | '1mo' | '3mo' | '6mo' | '1y' | 'max';

interface ChartResponse {
    symbol: string;
    currency: string;
    data: ChartDataPoint[];
    period: PeriodType;
    interval: string;
    lastTradingDate: string;
    events: {
        dividends: any[];
        splits: any[];
    };
}

// 차트 데이터 조회 API
router.get('/data/:symbol', async (req: Request, res: Response) => {
    try {
        const symbol: string = req.params.symbol;
        const period = (req.query.period as PeriodType) || '1y';
        
        //3일치 데이터를 조회
        const recentDataQuery: ChartQueryOptions = {
            period1: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            period2: new Date().toISOString().split('T')[0],
            interval: '1d'
        };
        
        const recentData = await yahooFinance.chart(symbol, recentDataQuery);
        const lastQuote = recentData.quotes[recentData.quotes.length - 1];
        const lastTradingDate = lastQuote ? new Date(lastQuote.date) : new Date();

        // period에 따른 시작일과 interval 계산
        let startDate = new Date(lastTradingDate);
        let interval: '1m' | '1d' | '1mo' = '1d';

        switch(period) {
            case '1d':
                startDate = new Date(lastTradingDate);
                startDate.setDate(startDate.getDate() - 1);
                interval = '1m';
                break;
            case '1mo':
                startDate.setMonth(startDate.getMonth() - 1);
                interval = '1d';
                break;
            case '3mo':
                startDate.setMonth(startDate.getMonth() - 3);
                interval = '1d';
                break;
            case '6mo':
                startDate.setMonth(startDate.getMonth() - 6);
                interval = '1d';
                break;
            case '1y':
                startDate.setFullYear(startDate.getFullYear() - 1);
                interval = '1d';
                break;
            case 'max':
                startDate = new Date('2000-01-01');
                interval = '1mo';
                break;
            default:
                startDate.setFullYear(startDate.getFullYear() - 1);
        }

        console.log(`Last trading date: ${lastTradingDate.toISOString()}`);
        console.log(`Fetching data for ${period} with interval ${interval}`);
        console.log(`Date range: ${startDate.toISOString()} to ${lastTradingDate.toISOString()}`);

        const queryOptions: ChartQueryOptions = {
            period1: startDate.toISOString().split('T')[0],
            period2: lastTradingDate.toISOString().split('T')[0],
            interval: interval
        };

        const result = await yahooFinance.chart(symbol, queryOptions);
        
        const chartData: any = result.quotes
            .filter(quote => period === '1d' ? 
                new Date(quote.date).toISOString().split('T')[0] === lastTradingDate.toISOString().split('T')[0] 
                : true)
            .map(quote => ({
                date: quote.date,
                open: quote.open,
                high: quote.high,
                low: quote.low,
                close: quote.close,
                volume: quote.volume,
                adjclose: quote.adjclose
            }));

        const response: ChartResponse = {
            symbol: result.meta.symbol,
            currency: result.meta.currency,
            data: chartData,
            period: period,
            interval: interval,
            lastTradingDate: lastTradingDate.toISOString().split('T')[0],
            events: {
                dividends: result.events?.dividends || [],
                splits: result.events?.splits || []
            }
        };

        res.json(response);

    } catch (error) {
        console.error('Failed to fetch chart data:', error);
        res.status(500).json({ 
            error: 'Failed to fetch chart data',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

router.get('/view/:symbol', (req: Request, res: Response) => {
    res.render('chart', { 
        symbol: req.params.symbol,
        title: `${req.params.symbol} 차트`
    });
});

export default router;