import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { AccessTokenWrapper } from '@calimero-network/calimero-client';

import HomePage from './pages/home';
import LoginPage from './pages/login';

export default function App() {
  return (
    <AccessTokenWrapper>
      <BrowserRouter basename="/demo-blockchain-integrations/">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<LoginPage />} />
        </Routes>
      </BrowserRouter>
    </AccessTokenWrapper>
  );
}
