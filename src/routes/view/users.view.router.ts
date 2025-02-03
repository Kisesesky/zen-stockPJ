//users.view.router.ts

import express from 'express'
import User, { IUser } from '../../models/schemas/users.js'
import mongoose from 'mongoose';
import axios from 'axios';
import { newsService } from '../../services';
import marketIndexService from '../../services/marketIndexService.js';
import stockService from '../../services/stockservice.js';

const router = express.Router()

// 로그인 체크 미들웨어
const isAuthenticated = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.isAuthenticated()) {
        return next();
    }
    // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
    res.redirect('/users/login');
}

router.get("/signup", async(req,res)=>{
    res.render('signup')
})
router.get("/login", async (req,res)=>{
    const message = req.query.message;
    res.render('login', { message });
})
router.get("/logout", async (req,res)=>{
    res.redirect('/users/login')
})
router.get("/main", isAuthenticated, async(req, res) => {
    try {
        const [articles, indices] = await Promise.all([
            newsService.fetchArticles(),
            marketIndexService.getMarketIndices()
        ]);

        res.render('main', { 
            user: req.user,
            articles: articles || [],
            indices: indices || []
        });
    } catch (error) {
        console.error('Error in main route:', error);
        res.render('main', { 
            user: req.user,
            articles: [],
            indices: []
        });
    }
})
router.get("/intro", isAuthenticated, async(req,res)=>{
    res.render('intro')
})
router.get('/userinfo', isAuthenticated, async(req,res)=>{
    res.render('userinfo', { user: req.user });
})
router.get('/dashboard', isAuthenticated, async(req,res)=>{
    res.render('dashboard', { user: req.user });
})
router.get('/detailedstocks', isAuthenticated, async(req,res)=>{
    res.render('detailedstocks', { user: req.user });
})
router.get('/mainstock', isAuthenticated, async(req,res)=>{
    res.render('mainstock', { user: req.user });
})
router.get('/chart', isAuthenticated, async(req,res)=>{
    res.render('chart', { user: req.user });
})
router.get('/stocks', isAuthenticated, async(req,res)=>{
    res.render('stocks', { user: req.user });
})
router.get('/stock_data', isAuthenticated, async(req,res)=>{
    res.render('stock_data', { user: req.user });
})
router.get('/market-indices', isAuthenticated, async(req,res)=>{
    res.render('market-indices', { user: req.user });
})

router.get('/stock-detail/:symbol', isAuthenticated, async(req, res) => {
    try {
        const { symbol } = req.params;
        const stockData = await stockService.getStockQuote(symbol);
        res.render('stock-detail', { 
            user: req.user, 
            symbol: symbol,
            stock: stockData,
            title: `${stockData.shortName} (${symbol}) - Stock Detail`
        });
    } catch (error) {
        console.error('Stock detail error:', error);
        res.status(500).render('error', { 
            message: '주식 데이터를 불러오는 중 오류가 발생했습니다.' 
        });
    }
});

router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ message: "Error logging out" });
        }
        
        res.clearCookie('token');
        res.clearCookie('connect.sid');
        res.clearCookie('loggedInUser');
        
        req.session?.destroy((err) => {
            if (err) {
            }
            res.redirect('/users/login');
        });
    });
});

export default router