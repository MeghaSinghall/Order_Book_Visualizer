'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, List, Space, Typography, Tag } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useBinanceSocket } from './../hooks/useBinanceSocket';

function TradeRow({
  price,
  quantity,
  time,
  isSell,
  flash,
}: {
  price: number;
  quantity: number;
  time: number;
  isSell: boolean;
  flash: boolean;
}) {
  const color = isSell ? 'red' : 'green';
  const icon = isSell ? <ArrowDownOutlined /> : <ArrowUpOutlined />;
  const flashClass = flash ? (isSell ? 'flash-red' : 'flash-green') : '';

  return (
    <div className={flashClass} style={{ padding: 4, borderRadius: 4 }}>
      <Space style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }} align="center">
        <Typography.Text style={{ color }}>{price.toFixed(2)} {icon}</Typography.Text>
        <Typography.Text>{quantity.toFixed(6)}</Typography.Text>
        <Tag>{dayjs(time).format('HH:mm:ss')}</Tag>
      </Space>
    </div>
  );
}

export default function RecentTrades({ symbol }: { symbol: string }) {
  const { trades } = useBinanceSocket(symbol);
  const [rows, setRows] = useState<Array<{ price: number; quantity: number; time: number; isSell: boolean; flash: boolean }>>([]);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    if (trades.length === 0) return;
    const latest = trades[0];
    const isNew = latest.time !== lastTimeRef.current;
    lastTimeRef.current = latest.time;
    setRows((prev) => {
      const next = [{ ...latest, flash: true }, ...prev.map((p) => ({ ...p, flash: false }))];
      if (next.length > 50) next.length = 50;
      return next;
    });
  }, [trades]);

  const data = useMemo(() => rows, [rows]);

  return (
    <Card title="Recent Trades" variant="outlined" style={{ height: '100%' }}>
      <List
        size="small"
        dataSource={data}
        style={{ height: 550, overflow: 'auto' }}
        renderItem={(t) => (
          <List.Item>
            <TradeRow {...t} />
          </List.Item>
        )}
      />
    </Card>
  );
}