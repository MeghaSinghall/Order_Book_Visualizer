'use client';

import React from 'react';
import { ConfigProvider, theme } from 'antd';
import 'antd/dist/reset.css';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#1677ff',
          colorSuccess: '#52c41a',
          colorError: '#ff4d4f',
          fontSize: 13,
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}