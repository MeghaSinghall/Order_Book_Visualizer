'use client';

import { useEffect, useRef, useState } from 'react';
import { useOrderBookStore } from './../state/orderBookStore';

export type AggTrade = {
  price: number;
  quantity: number;
  time: number;
  isSell: boolean; // m: true => sell
};

function makeWsUrl(symbol: string, stream: string) {
  return `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@${stream}`;
}

export function useBinanceSocket(symbol: string) {
  const depthRef = useRef<WebSocket | null>(null);
  const tradeRef = useRef<WebSocket | null>(null);
  const backoffRef = useRef(1000);

  const applyDeltas = useOrderBookStore((s) => s.applyDeltas);
  const resetBook = useOrderBookStore((s) => s.reset);

  const [trades, setTrades] = useState<AggTrade[]>([]);
  const [status, setStatus] = useState<'connecting' | 'open' | 'closed'>('connecting');

  useEffect(() => {
    let isMounted = true;

    function connect() {
      setStatus('connecting');
      resetBook();

      const depthWs = new WebSocket(makeWsUrl(symbol, 'depth@100ms'));
      const tradeWs = new WebSocket(makeWsUrl(symbol, 'aggTrade'));

      depthRef.current = depthWs;
      tradeRef.current = tradeWs;

      depthWs.onopen = () => setStatus('open');
      tradeWs.onopen = () => setStatus('open');

      depthWs.onmessage = (evt) => {
        try {
          const data = JSON.parse(evt.data);
          // data.b: bids [[price, amount], ...], data.a: asks
          if (data && Array.isArray(data.b) && Array.isArray(data.a)) {
            applyDeltas(data.b, data.a);
          }
        } catch {}
      };

      tradeWs.onmessage = (evt) => {
        try {
          const t = JSON.parse(evt.data);
          // { p: "price", q: "qty", T: time, m: isSell }
          const agg: AggTrade = {
            price: Number(t.p),
            quantity: Number(t.q),
            time: Number(t.T),
            isSell: Boolean(t.m),
          };
          if (!isMounted) return;
          setTrades((prev) => {
            const next = [agg, ...prev];
            if (next.length > 50) next.length = 50;
            return next;
          });
        } catch {}
      };

      const onClose = () => {
        setStatus('closed');
        depthRef.current = null;
        tradeRef.current = null;
        if (!isMounted) return;
        const wait = Math.min(backoffRef.current, 15000);
        setTimeout(() => {
          backoffRef.current = Math.min(backoffRef.current * 2, 15000);
          connect();
        }, wait);
      };

      depthWs.onclose = onClose;
      tradeWs.onclose = onClose;

      depthWs.onerror = () => depthWs.close();
      tradeWs.onerror = () => tradeWs.close();
    }

    connect();
    return () => {
      isMounted = false;
      depthRef.current?.close();
      tradeRef.current?.close();
    };
  }, [symbol]);

  return { trades, status };
}