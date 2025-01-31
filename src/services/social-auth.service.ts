import axios from 'axios';
import { IUser } from '../models/schemas/users.js';

export const unlinkSocialAccount = async (user: IUser & { accessToken?: string }) => {
    const unlinkStrategies = {
        kakao: unlinkKakao,
        naver: unlinkNaver,
        google: unlinkGoogle
    };

    const unlinkStrategy = unlinkStrategies[user.registerType as keyof typeof unlinkStrategies];
    if (unlinkStrategy) {
        await unlinkStrategy(user.accessToken);
    }
};

async function unlinkKakao(accessToken?: string): Promise<void> {
    if (!accessToken) return;
    try {
        await axios.post('https://kapi.kakao.com/v1/user/unlink', {}, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
    } catch (error) {
        console.error('Kakao unlink error:', error);
    }
}

async function unlinkNaver(accessToken?: string): Promise<void> {
    if (!accessToken) return;
    try {
        await axios.post('https://nid.naver.com/oauth2.0/token', null, {
            params: {
                grant_type: 'delete',
                client_id: process.env.NAVER_CLIENT_ID,
                client_secret: process.env.NAVER_CLIENT_SECRET,
                access_token: accessToken,
                service_provider: 'NAVER'
            }
        });
    } catch (error) {
        console.error('Naver unlink error:', error);
    }
}

async function unlinkGoogle(accessToken?: string) {
    if (!accessToken || accessToken.trim() === '') {
        console.warn('No valid access token provided for unlinking Google account.');
        return false;
    }

    try {
        const response = await axios.post(
            'https://oauth2.googleapis.com/revoke',
            new URLSearchParams({ token: accessToken }).toString(),
            {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            }
        );

        if (response.status === 200) {
            console.log('Google account successfully unlinked.');
            return true;
        } else {
            console.warn('Google unlink failed with status:', response.status);
            return false;
        }
    } catch (error) {
        console.error('Google unlink error:', (error as any).response?.data || (error as any).message);
        return false;
    }
}