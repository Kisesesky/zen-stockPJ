//index.ts

import stockSchema from './schemas/stock.js';
import mongoose from 'mongoose';
import favoriteSchema from './schemas/favorite.js';
// import memoSchema from './schemas/memo.js';
import userSchema from './schemas/users.js';

const Stock = mongoose.model('Stock', stockSchema);
const User = mongoose.model('User', userSchema.schema);
const Favorite = mongoose.model('Favorite', favoriteSchema);
// const Memo = mongoose.model('Memo', memoSchema);

export { Stock, User, Favorite };