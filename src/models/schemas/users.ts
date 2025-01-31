import mongoose,{ Schema, Document } from "mongoose";
import  bcrypt from 'bcrypt';


export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    registerType: "normal" | "google" | "kakao" | "naver";
    socialId?: string;
    birth?: Date;
    favorites?: mongoose.Types.ObjectId;
    _json?: {
        oauth?: {
            kakao?: {
                accessToken: string;
            };
            google?: {
                accessToken: string;
            };
            naver?: {
                accessToken: string;
            };
        };
    };
}

const UserSchema = new Schema<IUser>(
    {
        username: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            minLength : 6
        },
        email: {
            type: String,
            required: true,
            match: [/.*\@.*\..*/, "Please fill a valid email form"]
        },
        registerType:{
            type: String,
            enum: ["normal", "google", "kakao", "naver"],
            default: "normal"
        },
        socialId: String,
        birth:{
            type:Date
        },
        favorites: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Favorite'
        }
    },
    {
        timestamps: true,
    }
)
UserSchema.pre('save', async function (next) {
    try {
        if (this.isNew) {
            if (this.password) {
                this.password = await bcrypt.hash(this.password, 10);
            }

            const Favorite = mongoose.model('Favorite');
            const favorite = await Favorite.create({
                _id: this._id,
                stocks: []
            });
            this.favorites = favorite._id;
        } else if (this.isModified('password')) {
            this.password = await bcrypt.hash(this.password, 10);
        }
        next();
    } catch (error) {
        next(error as Error);
    }
})
const User = mongoose.model<IUser>("User", UserSchema)

export default User;