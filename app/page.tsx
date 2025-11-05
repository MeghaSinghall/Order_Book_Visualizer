'use client';

import React from 'react';
import { Col, Layout, Row, Select, Space, Typography } from 'antd';
import OrderBook from './../components/OrderBook';
import RecentTrades from './../components/RecentTrades';
import { useBinanceSocket } from './../hooks/useBinanceSocket';

const { Header, Content } = Layout;

const DEFAULT_SYMBOL = process.env.NEXT_PUBLIC_SYMBOL ?? 'btcusdt';

export default function Page() {
  const [symbol, setSymbol] = React.useState(DEFAULT_SYMBOL);
  const { status } = useBinanceSocket(symbol);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center' }}>
        <Space size="large">
          <Typography.Title level={4} style={{ color: '#fff', margin: 0 }}>
            Real-Time Order Book
          </Typography.Title>
          <Select
            value={symbol}
            onChange={setSymbol}
            options={[
              { label: 'BTC/USDT', value: 'btcusdt' },
              { label: 'ETH/USDT', value: 'ethusdt' },
            ]}
            style={{ width: 160 }}
          />
          <Typography.Text style={{ color: '#fff' }}>
            Status: {status}
          </Typography.Text>
        </Space>
      </Header>
      <Content style={{ padding: 16 }}>
        <Row gutter={16}>
          <Col span={14}>
            <OrderBook />
          </Col>
          <Col span={10}>
            <RecentTrades symbol={symbol} />
          </Col>
        </Row>
      </Content>
    </Layout>
  );
}