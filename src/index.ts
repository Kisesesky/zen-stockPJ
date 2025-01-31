import mongoose from "mongoose"
import app from "./app.js"
import './config/passport.js'


mongoose.connect(process.env.DATABASE_URL || '')
    .then(() => {
        console.log("db connected");
        app.listen(3002, () => {
            console.log("server running");
        });
    })
    .catch(err => {
        console.log("DB connection error: ", err);
    });