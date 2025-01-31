import User from '../../../models/schemas/users.js'
import bcrypt from "bcrypt"
import passport from 'passport';
import jwt from 'jsonwebtoken'
import { IUser } from '../../../models/schemas/users.js';
import express,{ Request, Response, NextFunction, RequestHandler } from 'express';
import axios from 'axios';
import * as authController from '../../../controllers/auth.controller.js';
import * as socialAuthController from '../../../controllers/social-auth.controller.js';
import * as userController from '../../../controllers/user.controller.js';

const router = express.Router()

// 유효성 검사 미들웨어 타입 수정
const signUpValidator: RequestHandler = async (req, res, next) => {
    const { username, email, password, passwordConfirm, birth } = req.body;

    try {
        // 필수 필드 검사
        if (!username || !email || !password || !passwordConfirm || !birth) {
            return res.render('signup', { 
                fieldErrorMessage: '모든 필드를 입력해주세요!' 
            });
        }

        // 비밀번호 일치 검사
        if (password !== passwordConfirm) {
            return res.render('signup', { 
                passwordErrorMessage: '비밀번호가 일치하지 않습니다!' 
            });
        }

        // 이메일 형식 검사
        const emailRegex = new RegExp(/.*\@.*\..*/);
        if (!emailRegex.test(email)) {
            return res.render('signup', { 
                typeErrorMessage: '올바른 이메일 형식이 아닙니다!' 
            });
        }

        // 이메일 중복 검사
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return res.render('signup', { 
                emailErrorMessage: '이미 존재하는 이메일입니다.' 
            });
        }

        next();
    } catch (error) {
        return res.render('signup', { 
            errorMessage: '서버 오류가 발생했습니다.' 
        });
    }
}

router.post("/signup", signUpValidator, async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, email, password, birth } = req.body;

        const user = await User.create({
            username,
            email,
            password,
            birth,
            registerType: "normal"
        });

        res.send(`
            <script>
                alert('회원가입이 완료되었습니다.');
                window.location.href = '/users/login';
            </script>
        `);
    } catch (e: any) {
        console.error('Signup error:', e);
        res.status(500).json({ message: e.message });
    }
});

// 인증 라우트
router.post('/signin', authController.signin);
router.post('/login', authController.login);

// 소셜 로그인 라우트
router.get('/login/google', socialAuthController.googleAuth);
router.get('/login/google/callback', socialAuthController.googleCallback, socialAuthController.socialCallback);

router.get('/login/kakao', socialAuthController.kakaoAuth);
router.get('/login/kakao/callback', socialAuthController.kakaoCallback, socialAuthController.socialCallback);

router.get('/login/naver', socialAuthController.naverAuth);
router.get('/login/naver/callback', socialAuthController.naverCallback, socialAuthController.socialCallback);

// 사용자 관리 라우트
router.post('/withdraw', userController.withdraw);

export default router
