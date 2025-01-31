import express from "express";
import route from './routes/api/v1/index.js';
import viewRouter from "./routes/view/index.js";
import cookieParser from "cookie-parser";
import passport from "passport";
import dotenv from 'dotenv';
import session from 'express-session';
import User from './models/schemas/users.js';
import stockRouter from './routes/api/v1/stock.route.js';
import chartRouter from './routes/api/v1/chart.route.js';
import mainStockRouter from './routes/api/v1/mainstock.route.js';
import marketRouter from './routes/api/v1/market.route.js';
import path from 'path';

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

declare module 'express-session' {
    interface SessionData {
        passport: {
            user: any;
        };
    }
}

passport.serializeUser((user: any, done) => {
    done(null, user._id);
});

passport.deserializeUser(async (id: string, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

app.use(session({
    secret: process.env.JWT_SECRET_KEY || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000
    }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    if (!req.cookies["token"] && !req.isAuthenticated()) {
        return next();
    }
    
    if (req.isAuthenticated()) {
        return next();
    }

    passport.authenticate("jwt", { session: false }, (err: Error, user: any, info: any) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return next();
        }
        req.user = user;
        next();
    })(req, res, next);
});

app.set("views", "./src/views");
app.set("view engine", "pug");

app.use('/api/v1', route);
app.use('/', viewRouter);
app.use('/api/v1/stock', stockRouter);
app.use('/api/v1/chart', chartRouter);
app.use('/api/v1/mainstock', mainStockRouter);
app.use('/api/v1/market', marketRouter);

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
});


export default app;
