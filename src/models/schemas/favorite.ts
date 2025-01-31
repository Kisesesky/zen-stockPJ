import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  stocks: [{
    type: String,
    required: true,
    uppercase: true,
    trim: true
  }],
  memo: {
    type: String,
    default: ''
  }
}, {
  timestamps: true,
  versionKey: false
});

favoriteSchema.index({ _id: 1, stocks: 1 });

export default favoriteSchema;