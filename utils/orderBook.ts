export type LevelRow = { price: number; amount: number; total: number };

export function sortBids(bids: Map<number, number>): [number, number][] {
  return Array.from(bids.entries()).sort((a, b) => b[0] - a[0]);
}

export function sortAsks(asks: Map<number, number>): [number, number][] {
  return Array.from(asks.entries()).sort((a, b) => a[0] - b[0]);
}

export function withCumulative(levels: [number, number][]): LevelRow[] {
  let running = 0;
  return levels.map(([price, amount]) => {
    running += amount;
    return { price, amount, total: running };
  });
}

export function maxTotal(levels: LevelRow[]): number {
  return levels.reduce((m, x) => (x.total > m ? x.total : m), 0);
}

export function spread(lowestAsk?: number, highestBid?: number): number | null {
  if (lowestAsk == null || highestBid == null) return null;
  return lowestAsk - highestBid;
}