import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav style={{ background: '#ffffff', borderBottom: '1px solid var(--border)', padding: '14px 0', position: 'sticky', top: 0, zIndex: 100 }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: '#ECFDF5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
            🌿
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.25rem', color: '#0F172A', lineHeight: 1 }}>Plenti</div>
            <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 600 }}>Save More · Waste Less</div>
          </div>
        </Link>

        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <Link to="/" style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>Browse Food</Link>
          <Link to="/business" style={{ fontSize: '0.9rem', fontWeight: 600, color: '#10B981' }}>Merchant Portal</Link>
          <Link to="/admin" style={{ fontSize: '0.9rem', fontWeight: 600, color: '#4F46E5' }}>Admin Portal</Link>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {user ? (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Hi, {user.name}</span>
              <button onClick={() => { logout(); navigate('/login'); }} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                Log Out
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                Log In
              </Link>
              <Link to="/signup" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
