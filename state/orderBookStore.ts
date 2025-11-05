'use client';

import { create } from 'zustand';

export type PriceLevel = { price: number; amount: number };

type OrderBookState = {
  bids: Map<number, number>;
  asks: Map<number, number>;
  applyDeltas: (bidsDelta: [string, string][], asksDelta: [string, string][]) => void;
  reset: () => void;
};

export const useOrderBookStore = create<OrderBookState>((set) => ({
  bids: new Map(),
  asks: new Map(),
  applyDeltas: (bidsDelta, asksDelta) =>
    set((state) => {
      const bids = new Map(state.bids);
      const asks = new Map(state.asks);

      for (const [pStr, aStr] of bidsDelta) {
        const price = Number(pStr);
        const amount = Number(aStr);
        if (amount === 0) bids.delete(price);
        else bids.set(price, amount);
      }
      for (const [pStr, aStr] of asksDelta) {
        const price = Number(pStr);
        const amount = Number(aStr);
        if (amount === 0) asks.delete(price);
        else asks.set(price, amount);
      }
      return { bids, asks };
    }),
  reset: () => set({ bids: new Map(), asks: new Map() }),
}));