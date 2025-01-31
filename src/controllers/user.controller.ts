import { Request, Response } from 'express';
import User from '../models/schemas/users.js';
import { unlinkSocialAccount } from '../services/social-auth.service.js';
import { IUser } from '../models/schemas/users.js';

// 로그아웃 처리 함수
async function logoutUser(req: Request, res: Response): Promise<void> {
    await new Promise<void>((resolve, reject) => {
        req.logout((err) => {
            if (err) {
                reject(err);
                return;
            }
            res.clearCookie('token');
            res.clearCookie('connect.sid');
            res.clearCookie('loggedInUser');
            resolve();
        });
    });
}

// 사용자 삭제 함수
async function deleteUser(userId: string, res: Response): Promise<void> {
    const deletedUser = await User.findByIdAndDelete(userId);
    
    if (!deletedUser) {
        res.send(`
            <script>
                alert('사용자를 찾을 수 없습니다.');
                window.location.href = '/users/userinfo';
            </script>
        `);
        return;
    }

    res.send(`
        <script>
            alert('회원 탈퇴가 완료되었습니다.');
            window.location.href = '/users/login';
        </script>
    `);
}

export const withdraw = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.send(`
                <script>
                    alert('로그인이 필요합니다.');
                    window.location.href = '/users/login';
                </script>
            `);
            return;
        }

        // 필요한 정보를 미리 저장
        const user = req.user as IUser & { accessToken?: string };
        const userId = user._id;

        // 소셜 계정 연동 해제를 먼저 실행
        await unlinkSocialAccount(user);

        // 그 다음 로그아웃 처리
        await logoutUser(req, res);
        
        // 세션 제거
        await new Promise<void>((resolve, reject) => {
            req.session?.destroy((err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });

        // 마지막으로 사용자 삭제
        await deleteUser(userId as string, res);

    } catch (error) {
        console.error('Withdraw error:', error);
        res.status(500).json({ message: '회원 탈퇴 중 오류가 발생했습니다.' });
    }
}; 