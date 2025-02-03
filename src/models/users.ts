import mongoose,{ Schema, Document } from "mongoose";
import  bcrypt from 'bcrypt';


export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    registerType: "normal" | "google" | "kakao" | "naver";
    socialId?: string;
    birth?: Date;
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
    },
    {
        timestamps: true,
    }
)
UserSchema.pre('save', async function () {
    if(this.password && this.isNew || this.isModified('password'))
        this.password = await bcrypt.hash(this.password, 10)

})
const User = mongoose.model<IUser>("User", UserSchema)

export default User;