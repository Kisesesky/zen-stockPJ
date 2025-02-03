//favorite.route.ts

import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import favoriteService from '../../../services/favoriteSevice.js';

const router = Router();

router.get('/list', async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const favorites = await favoriteService.getFavoriteList(
            new mongoose.Types.ObjectId(req.user._id as string)
        );
        
        res.json(favorites);
    } catch (error) {
        console.error('Failed to get favorites:', error);
        res.status(500).json({ error: 'Failed to get favorites' });
    }
});

router.post('/add/:symbol', async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const result = await favoriteService.toggleFavoriteStock(
            new mongoose.Types.ObjectId(req.user._id as string), 
            req.params.symbol
        );
        
        res.json(result);
    } catch (error) {
        console.error('Failed to toggle favorite:', error);
        res.status(500).json({ error: 'Failed to toggle favorite' });
    }
});

export default router;
