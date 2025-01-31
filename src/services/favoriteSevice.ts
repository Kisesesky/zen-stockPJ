import { Favorite, Stock } from "../models/index.js";
import mongoose from "mongoose";

async function toggleFavoriteStock(userId: mongoose.Types.ObjectId, symbol: string) {
  try {
    let favorite = await Favorite.findById(userId);

    if (!favorite) {
      favorite = await Favorite.create({
        _id: userId,
        stocks: []
      });
    }

    // 이미 해당 symbol이 있는지 확인
    const symbolExists = favorite.stocks.includes(symbol);
    
    if (symbolExists) {
      // symbol이 이미 있으면 제거
      favorite.stocks = favorite.stocks.filter(s => s !== symbol);
    } else {
      // symbol이 없으면 추가
      favorite.stocks.push(symbol);
    }
    
    await favorite.save();
    return { favoriteAdded: !symbolExists };

  } catch (error) {
    console.error('Failed to toggle favorite stock:', error);
    return { favoriteAdded: false };
  }
}

async function memo(userId: mongoose.Types.ObjectId, memo: string) {
  try {
    return await Favorite.findByIdAndUpdate(
      userId,
      { $set: { memo } },
      { new: true }
    );
  } catch (error) {
    console.error('Failed to add memo:', error);
    return null;
  }
}

export default {
  toggleFavoriteStock,
  memo
}
