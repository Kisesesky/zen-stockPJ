import passport from "passport"
import { Strategy as LocalStrategy} from "passport-local"
import bcrypt  from "bcrypt"
import User from '../models/schemas/users.js'
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt"
import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import { Strategy as KakaoStrategy } from "passport-kakao"
import { Strategy as NaverStrategy } from "passport-naver"
import dotenv from 'dotenv'

const result = dotenv.config();

const config = {
    usernameField: "email",
    passwordField: "password"
}
const kakaoOptions = {
    clientID: process.env.KAKAO_API_KEY || '',
    callbackURL: process.env.KAKAO_CALLBACK_URL || '',
    clientSecret: process.env.KAKAO_CLIENT_SECRET || '',
    state: 'RANDOM_STATE'
}


const googleOptions = {
    clientID: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackURL: process.env.GOOGLE_CALLBACK_URL || ''
}

const naverOptions = {
    clientID: process.env.NAVER_CLIENT_ID || '',
    clientSecret: process.env.NAVER_CLIENT_SECRET || '',
    callbackURL: process.env.NAVER_CALLBACK_URL || ''
}

passport.use(
    new LocalStrategy(config, async function(email:string, password:string, done) {
        try{
            const user = await User.findOne({email})
            if(!user)
                return done(null, false, {message: "user not found"})
            const compareResult = await bcrypt.compare(password, user.password)
            if(!compareResult)
                return done(null, false, {message: "Invalid password"})
            
            return done(null, user)// true 생략가능
        }catch(e){
            done(e)
        }
    })
)

const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => req?.cookies?.token || null
    ]),
    secretOrKey: process.env.JWT_SECRET_KEY || ''
};

passport.use(
    "jwt",
    new JwtStrategy(jwtOptions, async (jwtPayload, done) => {
        try {
            const foundUser = await User.findById(jwtPayload._id);
            if (foundUser) {
                return done(null, foundUser);
            } else {
                return done(null, false, { message: "User not found" });
            }
        } catch (error) {
            return done(error, false);
        }
    })
);

passport.use(
    new GoogleStrategy(
        googleOptions, async(accessToken, refreshToken, profile, done) =>{
            try{
                const foundUser = await User.findOne({
                    socialId: profile._json.sub,
                    registerType: "google"
                })

                if(foundUser){
                    return done(null, foundUser);
                }

                const newUser = await User.create({
                    email: profile._json.email,
                    username: profile._json.name,
                    socialId: profile._json.sub,
                    registerType: "google",
                    password: 'google_' + Date.now()
                });

                return done(null, newUser);
            }
            catch(e){
                return done(e)
            }
        }
    )
)
passport.use(
    new KakaoStrategy(
        kakaoOptions,
        async(accessToken, refreshToken, profile, done) => {
            try{
                
                const foundUser = await User.findOne({
                    socialId: profile.id,
                    registerType: "kakao"
                })

                const userData = {
                    ...profile,
                    accessToken
                };

                if(foundUser){
                    return done(null, {
                        ...foundUser.toObject(),
                        accessToken
                    });
                }

                const newUser = await User.create({
                    email: profile._json?.kakao_account?.email || `kakao_${profile.id}@example.com`,
                    username: profile.displayName || `User_${profile.id}`,
                    socialId: profile.id,
                    registerType: "kakao",
                    password: 'kakao_' + Date.now()
                });

                return done(null, {
                    ...newUser.toObject(),
                    accessToken
                });
            }
            catch(e){
                return done(e)
            }
        }
    )
)

passport.use(
    new NaverStrategy(
        naverOptions,
        async (accessToken, refreshToken, profile, done) => {
            try {
                const foundUser = await User.findOne({
                    socialId: profile.id,
                    registerType: "naver"
                });

                if (foundUser) {
                    return done(null, {
                        ...foundUser.toObject(),
                        accessToken
                    });
                }

                const newUser = await User.create({
                    email: profile._json.email,
                    username: profile._json.nickname || `Naver_${profile.id}`,
                    socialId: profile.id,
                    registerType: "naver",
                    password: 'naver_' + Date.now()
                });

                return done(null, {
                    ...newUser.toObject(),
                    accessToken
                });
            } catch (e) {
                return done(e);
            }
        }
    )
);

passport.serializeUser((user: any, done) => {
    done(null, { 
        _id: user._id, 
        accessToken: user.accessToken 
    });
});

passport.deserializeUser(async (serializedUser: any, done) => {
    try {
        const user = await User.findById(serializedUser._id);
        if (!user) {
            return done(null, false);
        }
        done(null, {
            ...user.toObject(),
            // @ts-ignore
            accessToken: serializedUser.accessToken
        });
    } catch (err) {
        done(err);
    }
});

export default passport