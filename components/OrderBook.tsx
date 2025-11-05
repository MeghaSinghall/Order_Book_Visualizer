'use client';

import React, { useMemo } from 'react';
import { Card, Col, Row, Table, Typography, Space, Tag } from 'antd';
import { SwapOutlined } from '@ant-design/icons';
import { useOrderBookStore } from './../state/orderBookStore';
import { sortBids, sortAsks, withCumulative, maxTotal, spread } from './../utils/orderBook';

type RowType = {
    key: string;
    price: number;
    amount: number;
    total: number;
    percent: number;
};

export default function OrderBook() {
    const bidsMap = useOrderBookStore((s) => s.bids);
    const asksMap = useOrderBookStore((s) => s.asks);

    const bidRows = useMemo(() => {
        const rows = withCumulative(sortBids(bidsMap));
        const m = maxTotal(rows);
        return rows.map((r) => ({
            key: `b-${r.price}`,
            price: r.price,
            amount: r.amount,
            total: r.total,
            percent: m ? (r.total / m) * 100 : 0,
        }));
    }, [bidsMap]);

    const askRows = useMemo(() => {
        const rows = withCumulative(sortAsks(asksMap));
        const m = maxTotal(rows);
        return rows.map((r) => ({
            key: `a-${r.price}`,
            price: r.price,
            amount: r.amount,
            total: r.total,
            percent: m ? (r.total / m) * 100 : 0,
        }));
    }, [asksMap]);

    const highestBid = bidRows.length ? bidRows[0].price : undefined;
    const lowestAsk = askRows.length ? askRows[0].price : undefined;
    const spr = spread(lowestAsk, highestBid);

    const bidColumns = [
        {
            title: 'Price',
            dataIndex: 'price',
            render: (v: number) => <Typography.Text type="success">{v.toFixed(2)}</Typography.Text>,
            width: 120,
        },
        { title: 'Amount', dataIndex: 'amount', render: (v: number) => v.toFixed(6), width: 120, align: 'right' },
        { title: 'Total', dataIndex: 'total', render: (v: number) => v.toFixed(6), width: 140, align: 'right' },
    ];

    const askColumns = [
        {
            title: 'Price',
            dataIndex: 'price',
            render: (v: number) => <Typography.Text type="danger">{v.toFixed(2)}</Typography.Text>,
            width: 120,
        },
        { title: 'Amount', dataIndex: 'amount', render: (v: number) => v.toFixed(6), width: 120, align: 'right' },
        { title: 'Total', dataIndex: 'total', render: (v: number) => v.toFixed(6), width: 140, align: 'right' },
    ];

    return (
        <Card title="Order Book" variant="outlined" style={{ height: '100%' }}>
            <Row gutter={16} align="middle">
                <Col span={11}>
                    <Table
                        size="small"
                        pagination={false}
                        dataSource={bidRows}
                        columns={bidColumns as any}
                        rowKey="key"
                        rowClassName={() => 'depth-row'}
                        showHeader
                        tableLayout="fixed"
                        style={{ height: 550, overflow: 'auto' }}
                        onRow={(record: RowType) => ({
                            style: {
                                background: `linear-gradient(to right, var(--bid-bg) ${record.percent}%, transparent ${record.percent}%)`,
                            },
                        })}
                    />
                </Col>
                <Col span={2} style={{ textAlign: 'center' }}>
                    <Space direction="vertical" align="center">
                        <SwapOutlined />
                        <Typography.Text>Spread</Typography.Text>
                        <Tag color="default">
                            {spr != null ? spr.toFixed(2) : '--'}
                        </Tag>
                        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                            Bid: {highestBid?.toFixed(2) ?? '--'}
                        </Typography.Text>
                        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                            Ask: {lowestAsk?.toFixed(2) ?? '--'}
                        </Typography.Text>
                    </Space>
                </Col>
                <Col span={11}>
                    <Table
                        size="small"
                        pagination={false}
                        dataSource={askRows}
                        columns={askColumns as any}
                        rowKey="key"
                        rowClassName={() => 'depth-row'}
                        showHeader
                        tableLayout="fixed"
                        style={{ height: 550, overflow: 'auto' }}
                        onRow={(record: RowType) => ({
                            style: {
                                background: `linear-gradient(to right, var(--ask-bg) ${record.percent}%, transparent ${record.percent}%)`,
                            },
                        })}
                    />
                </Col>
            </Row>
        </Card>
    );
}