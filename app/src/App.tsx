import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { AccessTokenWrapper } from '@calimero-network/calimero-client';

import HomePage from './pages/home';
import Authenticate from './pages/login/Authenticate';

export default function App() {
  return (
    <AccessTokenWrapper>
      <BrowserRouter basename="/demo-blockchain-integrations/">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<Authenticate />} />
        </Routes>
      </BrowserRouter>
    </AccessTokenWrapper>
  );
}
