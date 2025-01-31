import { Request, Response } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';

export const socialCallback = (req: Request, res: Response) => {
    let token = null;
    if (req.user) {
        const _id = req.user._id;
        const payload = { _id };
        token = jwt.sign(payload, process.env.JWT_SECRET_KEY || '');
    }
    res.cookie("token", token);
    res.redirect('/users/main');
};

export const googleAuth = passport.authenticate("google", { scope: ["profile", "email"] });
export const googleCallback = passport.authenticate("google", {
    failureRedirect: '/users/login'
});

export const kakaoAuth = passport.authenticate("kakao");
export const kakaoCallback = passport.authenticate("kakao", {
    failureRedirect: '/users/login'
});

export const naverAuth = passport.authenticate("naver", { scope: ["email", "profile"] });
export const naverCallback = passport.authenticate("naver", {
    failureRedirect: '/users/login'
}); 