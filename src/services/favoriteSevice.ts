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

    const symbolExists = favorite.stocks.includes(symbol);
    
    if (symbolExists) {
      favorite.stocks = favorite.stocks.filter((s: string) => s !== symbol);
    } else {      favorite.stocks.push(symbol);
    }
    
    await favorite.save();
    return { favoriteAdded: !symbolExists };

  } catch (error) {
    console.error('Failed to toggle favorite stock:', error);
    return { favoriteAdded: false };
  }
}

async function getFavoriteList(userId: mongoose.Types.ObjectId) {
    try {
        const favorite = await Favorite.findById(userId);
        return {
            stocks: favorite?.stocks || []
        };
    } catch (error) {
        console.error('Failed to get favorite list:', error);
        throw error;
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
  getFavoriteList,
  memo
}
