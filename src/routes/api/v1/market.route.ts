//market.router.ts

import express from 'express';
import marketIndexService from '../../../services/marketIndexService.js';
import { Request, Response } from 'express';

const router = express.Router();

router.get('/indices', async (req, res) => {
    try {
        const indices = await marketIndexService.getMarketIndices();
        res.json(indices);
    } catch (error) {
        console.error('Market indices error:', error);
        res.status(500).json({ error: '시장 지수를 불러오는 중 오류가 발생했습니다.' });
    }
});

// 차트 데이터를 가져오는 라우트 추가
router.get('/chart/:symbol', async (req: Request, res: Response):Promise<void> => {
    try {
        const { symbol } = req.params;
        const { period = '1y' } = req.query;
        
        const decodedSymbol = decodeURIComponent(symbol);
        const chartData = await marketIndexService.getChartData(decodedSymbol, period as string);
        
        if (!chartData || chartData.length === 0) {
            return;
        }

        // 데이터 포인트 줄이기
        const step = Math.ceil(chartData.length / 100);
        const reducedData = chartData.filter((_, index) => index % step === 0);
        
        res.json(reducedData);
    } catch (error) {
        console.error('Chart data error:', error);
        res.status(500).json({ error: '차트 데이터를 불러오는 중 오류가 발생했습니다.' });
    }
});

export default router; 