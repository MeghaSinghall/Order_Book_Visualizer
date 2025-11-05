# Real-Time Order Book Visualizer (Binance) — Next.js + Ant Design

A high-performance, real-time order book visualizer using Next.js (App Router), TypeScript, Zustand for state, and Ant Design for UI.

Live data is streamed from Binance WebSocket APIs for aggregate trades and order book deltas. The UI presents a two-sided order book (bids/asks), spread, depth visualization, and a recent trades list with directional highlights.

## Quick Start

- Prerequisites
  - Node.js `>= 18`
  - npm `>= 9`

- Install dependencies

```bash
npm install
```

- Configure environment
  - Set the default symbol (optional). If not set, `btcusdt` is used.

```bash
echo 'NEXT_PUBLIC_SYMBOL=btcusdt' > .env.local
```

- Run development server (http://localhost:3000)

```bash
npm run dev
```

- Build production

```bash
npm run build
```

- Start production server

```bash
npm run start
```

## Tech Stack

- Framework: `Next.js` (App Router) + `TypeScript`
- UI: `Ant Design` (`antd`) and `@ant-design/icons`
- State: `Zustand`
- Styling: Ant Design theme + `globals.css`


## Core Features

- Order Book
  - Two tables: Bids (green, price DESC) and Asks (red, price ASC)
  - Columns: Price / Amount / Total (cumulative)
  - Spread displayed between tables: `(Lowest Ask) − (Highest Bid)`
  - Depth visualization: row background width proportional to cumulative total

- Recent Trades
  - Shows the 50 most recent aggregated trades
  - New trade flashes green for buy and red for sell
  - Uses `aggTrade` stream’s `m` flag to determine direction (true = sell/red)

- Robust WebSocket Handling
  - Connects to Binance `depth@100ms` and `aggTrade`
  - Reconnects with backoff on error/close
  - Applies deltas to a `Map` for O(1) updates
  - Keeps UI smooth with memoization and fixed table layout

## Binance WebSocket Integration

- Endpoints (for a `symbol` like `btcusdt`)
  - Order Book Deltas (depth):
    - `wss://stream.binance.com:9443/ws/<symbol>@depth@100ms`
    - Payload includes:
      - `b`: Bids as `[[price, amount], ...]`
      - `a`: Asks as `[[price, amount], ...]`
    - Amount of `0` means remove that price level

  - Aggregate Trades (recent trades):
    - `wss://stream.binance.com:9443/ws/<symbol>@aggTrade`
    - Relevant fields:
      - `p`: price (string)
      - `q`: quantity (string)
      - `T`: trade time (ms)
      - `m`: isMaker (boolean) → here used as direction:
        - `true` → sell (red), `false` → buy (green)

## Key Files and Responsibilities

- `hooks/useBinanceSocket.ts`
  - Opens two WebSockets: depth and aggTrade
  - Parses messages and updates state
  - Reconnects with exponential backoff
  - Exposes `trades` and `status`

- `state/orderBookStore.ts`
  - `bids` and `asks` held in `Map<number, number>`
  - `applyDeltas(bidsDelta, asksDelta)`: applies incoming updates
  - `reset()`: clears the book on reconnect

- `utils/orderBook.ts`
  - `sortBids` DESC, `sortAsks` ASC
  - `withCumulative`: computes running totals per side
  - `spread`: compute `(lowestAsk − highestBid)`
  - `maxTotal`: largest cumulative total in a list

- `components/OrderBook.tsx`
  - Two `Table` components (AntD) with fixed layout
  - Row background via `linear-gradient` based on cumulative percent
  - Avoids custom row elements (no `div` inside `tbody`) to prevent hydration errors
  - Prevents “shaking” by using:
    - `tableLayout="fixed"`
    - `scroll={{ y: 420 }}` to keep scrollbars consistent
    - right-aligned numbers and fixed column widths

- `components/RecentTrades.tsx`
  - `List` (AntD) showing 50 most recent trades
  - Flash animation on newest trade based on direction
  - Formats timestamps and numeric values

- `app/providers.tsx`
  - AntD `ConfigProvider` with dark theme and base tokens
  - Applies theme across the app

## Environment Variables

- `NEXT_PUBLIC_SYMBOL`
  - Default: `btcusdt` (if unset)
  - Set in `.env.local` for local dev and in your deployment environment

```bash
echo 'NEXT_PUBLIC_SYMBOL=btcusdt' > .env.local
```

## UI/UX Notes

- Ant Design Components
  - `Layout`, `Card`, `Table`, `List`, `Tag`, `Typography`, `Select`, `Space`
- Icons
  - `SwapOutlined` for spread, `ArrowUpOutlined` and `ArrowDownOutlined` for trade direction

- Depth Bars
  - Implemented via inline `linear-gradient` to keep HTML semantic (`<tr>` only)
  - Percent calculated relative to max cumulative total per side

## Performance Considerations

- Uses `Map` for O(1) price-level updates
- Minimizes recalculation with `useMemo`
- Keeps table widths stable with fixed layout and consistent scroll heights
- Batches React updates naturally via state updates

## Hydration & Table Stability

- Hydration Error Avoidance
  - No custom `div` inside `<tbody>`; only native table rows/cells
  - Depth bar implemented via row `style` with gradient

- Shake/Jitter Fix
  - `tableLayout="fixed"` prevents width recalculation per update
  - `scroll={{ y: 420 }}` ensures both tables render scrollbars consistently
  - Fixed column widths and right-aligned numbers reduce fluctuations

## Deployment (Vercel)

1. Push this repository to GitHub.
2. Import the `frontend` project into Vercel.
3. Set environment variables:
   - `NEXT_PUBLIC_SYMBOL=btcusdt` (or your preferred symbol)
4. Deploy.

Alternatively, use Vercel CLI:

```bash
npm i -g vercel
```

```bash
vercel
```

## Known Limitations & Next Steps

- Snapshot + Diff
  - Binance recommends initializing the order book with a REST snapshot and then applying diff streams. This implementation uses `@depth@100ms` deltas directly, which is generally fine for visualization, but adding snapshot logic would improve correctness.

- Additional Features
  - Precision controls (grouping by tick size)
  - Depth chart visualization (canvas or SVG)
  - Symbol search and validation
  - Error banners for socket health

## Troubleshooting

- No Data Appearing
  - Check internet connectivity/firewall for WebSockets
  - Validate `NEXT_PUBLIC_SYMBOL` (e.g., `btcusdt`, `ethusdt`)

- Hydration Errors
  - Ensure no custom `div` is used inside table body rows
  - Keep consistent server/client rendering by avoiding dynamic insertion of non-table elements within `<tbody>`

- Table “Shaking”
  - Confirm `tableLayout="fixed"` and `scroll={{ y: 420 }}` exist on both tables
  - Use fixed column widths and right-aligned numeric columns

## Design Choices

- Zustand for simple, fast state management with minimal boilerplate
- Ant Design for clean and professional UI with robust components
- Native WebSocket usage to keep dependencies small and performance tight
- Functional utilities (`utils/orderBook.ts`) for sorting and cumulative calculations
