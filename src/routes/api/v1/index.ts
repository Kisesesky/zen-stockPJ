//index.ts

import express from "express";
import userRouter from "./users.route.js";
import stockRouter from "./stock.route.js";
import chartRouter from "./chart.route.js";
import marketRouter from "./market.route.js";

const router = express.Router();

router.use('/users', userRouter);
router.use('/stock', stockRouter);
router.use('/chart', chartRouter);  
router.use('/market', marketRouter);

export default router;