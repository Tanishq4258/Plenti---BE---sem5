import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.user.role === 'admin') navigate('/admin');
      else if (res.user.role === 'business') navigate('/business');
      else navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: 16, padding: 36, maxWidth: 420, width: '100%', boxShadow: 'var(--shadow-md)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 6 }}>Welcome back</h2>
        <p style={{ color: '#64748B', fontSize: '0.88rem', marginBottom: 24 }}>Log in to access your surplus dashboard.</p>

        {error && (
          <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '10px 14px', borderRadius: 8, fontSize: '0.85rem', marginBottom: 16 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>Email address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', fontSize: '0.9rem' }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', fontSize: '0.9rem' }}
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
            {loading ? 'Logging in…' : 'Log In (MongoDB API)'}
          </button>
        </form>

        <p style={{ marginTop: 20, textAlign: 'center', fontSize: '0.85rem', color: '#64748B' }}>
          Don't have an account? <Link to="/signup" style={{ color: '#10B981', fontWeight: 600 }}>Sign up</Link>
        </p>

        {/* Demo Fast Fill */}
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px dashed var(--border)', fontSize: '0.78rem', textAlign: 'center', color: '#64748B' }}>
          <div style={{ marginBottom: 6, fontWeight: 700 }}>Quick Test Logins (from seed data):</div>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
            <button type="button" onClick={() => { setEmail('admin@plenti.com'); setPassword('password123'); }} style={{ background: '#EEF2FF', color: '#4F46E5', padding: '3px 8px', borderRadius: 4, fontSize: '0.75rem' }}>
              Admin
            </button>
            <button type="button" onClick={() => { setEmail('pierre@artisanbakery.com'); setPassword('password123'); }} style={{ background: '#ECFDF5', color: '#047857', padding: '3px 8px', borderRadius: 4, fontSize: '0.75rem' }}>
              Merchant
            </button>
            <button type="button" onClick={() => { setEmail('rohan@example.com'); setPassword('password123'); }} style={{ background: '#F1F5F9', color: '#334155', padding: '3px 8px', borderRadius: 4, fontSize: '0.75rem' }}>
              Customer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
