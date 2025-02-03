//auth.controller.ts

import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import User from '../models/schemas/users.js';
import bcrypt from 'bcrypt';

export const signin = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error('Error');
        }

        const compareResult = await bcrypt.compare(password, user.password);
        if (!compareResult)
            res.status(400).json({ message: 'Invalid Password' });
        res.cookie('loggedInUser', encodeURIComponent(JSON.stringify(user)), {
            expires: new Date(Date.now() + 90000),
            httpOnly: true
        });
        res.status(200).json({ message: 'login success' });
    } catch (e: any) {
        res.status(500).json({ message: e.message });
    }
};

export const login = (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("local", (err: any, user: Express.User, info: { message: any; }) => {
        if (err) return next(err);
        if (!user) {
            return res.render('login', {
                errorMessage: '등록되지 않은 ID혹은 비밀번호를 잘못 입력하셨습니다.'
            });
        }
        req.logIn(user, (err) => {
            if (err) return next(err);
            const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET_KEY || '');
            res.cookie("token", token);
            res.redirect('/users/main');
        });
    })(req, res, next);
}; 