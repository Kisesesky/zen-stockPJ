import mongoose from "mongoose";

const stockSchema = new mongoose.Schema({
    symbol: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    shortName: {
        type: String,
        required: true,
        trim: true
    },
    currency: {
        type: String,
        required: true,
        uppercase: true
    },
    marketData: {
        regularMarketPrice: {
            type: Number,
            required: true
        },
        regularMarketOpen: {
            type: Number,
            required: true
        },
        regularMarketDayHigh: {
            type: Number,
            required: true
        },
        regularMarketDayLow: {
            type: Number,
            required: true
        },
        regularMarketPreviousClose: {
            type: Number,
            required: true
        },
        regularMarketChange: {
            type: Number,
            required: true
        },
        regularMarketChangePercent: {
            type: Number,
            required: true
        },
        regularMarketVolume: {
            type: Number,
            required: true
        }
    },
    marketCap: {
        type: Number,
        required: true
    },
    fiftyTwoWeek: {
        high: {
            type: Number,
            required: true
        },
        low: {
            type: Number,
            required: true
        }
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true // createdAt, updatedAt 자동 생성
});

// 인덱스 생성
stockSchema.index({ 'marketData.regularMarketPrice': 1 });
stockSchema.index({ lastUpdated: 1 });



export default stockSchema;