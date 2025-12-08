'use client';

import { useState } from 'react';
import ReportForm from './components/ReportForm';

export default function Home() {
  return (
    <main style={{ padding: '20px' }}>
      <h1 style={{ marginBottom: '20px' }}>Report Generator</h1>
      <ReportForm />
    </main>
  );
}

