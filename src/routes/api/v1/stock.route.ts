import express, { Request, Response, Router } from 'express';
import path from 'path';
import stockService from '../../../services/stockservice.js';

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

const router: Router = express.Router();

// 상세 페이지
router.get('/detail/:symbol', async (req, res) => {
    try {
        const { symbol } = req.params;
        const stockData = await stockService.getStockQuote(symbol);
        res.render('stock', { stockData });
    } catch (error) {
        console.error('Error fetching stock data:', error);
        res.status(500).render('error', { 
            message: '주식 데이터를 불러오는데 실패했습니다.' 
        });
    }
});

// 실시간 가격 데이터 API
router.get('/price/:symbol', async (req, res) => {
    try {
        const { symbol } = req.params;
        const stockData = await stockService.getStockQuote(symbol);
        res.json(stockData);
    } catch (error) {
        console.error('Error fetching stock data:', error);
        res.status(500).json({ 
            error: 'Failed to fetch stock data' 
        });
    }
});

// 저장된 주식 데이터 조회 API
router.get('/saved/:symbol', async (req: Request, res: Response): Promise<void> => {
    try {
        const { symbol } = req.params;
        const stock = await stockService.getSavedStock(symbol);
        
        if (!stock) {
            res.status(404).json({ message: 'Stock not found' });
            return 
        }

        res.json(stock);
    } catch (error: any) {
        console.error('Failed to fetch saved stock data:', error);
        res.status(500).json({ 
            error: 'Failed to fetch saved stock data',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// 모든 저장된 주식 데이터 조회 API
router.get('/saved', async (_req: Request, res: Response) => {
    try {
        const stocks = await stockService.getAllStocks();
        res.json(stocks);
    } catch (error: any) {
        console.error('Failed to fetch all saved stocks:', error);
        res.status(500).json({ 
            error: 'Failed to fetch all saved stocks',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// 주식 요약 데이터 조회 API
router.get('/summary', async (_req: Request, res: Response) => {
    try {
        const stocks = await stockService.getStockSummaries();
        res.json(stocks);
    } catch (error: any) {
        console.error('Failed to fetch stock summaries:', error);
        res.status(500).json({ 
            error: 'Failed to fetch stock summaries',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

router.get('/view/:symbol', (req: Request, res: Response) => {
    res.render('stock_data', { 
        symbol: req.params.symbol,
        title: `${req.params.symbol} 주식 정보`,
        user: req.user || { username: 'Guest' }
    });
});

router.get('/stocks', (_req: Request, res: Response) => {
    res.render('stocks');  
});

export default router;  
