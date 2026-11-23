import React from 'react';

export default function Footer() {
  return (
    <footer style={{ background: '#0F172A', color: '#94A3B8', padding: '40px 0 24px', marginTop: '60px' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h4 style={{ color: '#ffffff', fontWeight: 800, marginBottom: '6px' }}>Plenti</h4>
          <p style={{ fontSize: '0.85rem' }}>Full-Stack Surplus Food Marketplace — Powered by MongoDB, Express, and React.</p>
        </div>
        <div style={{ fontSize: '0.8rem' }}>
          © 2026 Plenti. Save More. Waste Less.
        </div>
      </div>
    </footer>
  );
}
