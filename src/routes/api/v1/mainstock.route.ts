//mainstock.route.ts

import { Router, Request, Response } from 'express';
import stockService from '../../../services/stockservice.js';

const router = Router();

router.get('/', async (req: Request, res: Response):Promise<void> => {
    try {
        const stocks = await stockService.getMostActiveStocks();
        
        // AJAX 요청인 경우 JSON 응답
        if (req.xhr || req.headers.accept?.includes('application/json')) {
            res.json(stocks);
            return;
        }
        
        // 일반 요청인 경우 페이지 렌더링
        res.render('mainStock', { stocks });
    } catch (error) {
        console.error('Failed to fetch stocks:', error);
        if (req.xhr || req.headers.accept?.includes('application/json')) {
            res.status(500).json({ error: 'Failed to fetch stocks' });
            return;
        }
        res.render('mainStock', { stocks: [] });
    }
});

export default router;