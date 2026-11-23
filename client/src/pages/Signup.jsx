import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [businessName, setBusinessName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await register({
        name,
        email,
        password,
        role,
        businessName: role === 'business' ? businessName : undefined
      });
      if (res.user.role === 'business') navigate('/business');
      else navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: 16, padding: 36, maxWidth: 440, width: '100%', boxShadow: 'var(--shadow-md)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 6 }}>Create account</h2>
        <p style={{ color: '#64748B', fontSize: '0.88rem', marginBottom: 20 }}>Join Plenti to rescue food or list your surplus.</p>

        {error && (
          <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '10px 14px', borderRadius: 8, fontSize: '0.85rem', marginBottom: 16 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Role selector */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
            <button
              type="button"
              onClick={() => setRole('customer')}
              className={`btn ${role === 'customer' ? 'btn-primary' : 'btn-outline'}`}
              style={{ flex: 1, padding: 10, fontSize: '0.85rem' }}
            >
              👤 Customer
            </button>
            <button
              type="button"
              onClick={() => setRole('business')}
              className={`btn ${role === 'business' ? 'btn-primary' : 'btn-outline'}`}
              style={{ flex: 1, padding: 10, fontSize: '0.85rem' }}
            >
              🏪 Food Business
            </button>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>Full name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Green"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', fontSize: '0.9rem' }}
            />
          </div>

          {role === 'business' && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>Business / Store name</label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="The Daily Bake Cafe"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', fontSize: '0.9rem' }}
              />
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>Email address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', fontSize: '0.9rem' }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', fontSize: '0.9rem' }}
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
            {loading ? 'Creating account…' : 'Sign Up (MongoDB API)'}
          </button>
        </form>

        <p style={{ marginTop: 20, textAlign: 'center', fontSize: '0.85rem', color: '#64748B' }}>
          Already have an account? <Link to="/login" style={{ color: '#10B981', fontWeight: 600 }}>Log in</Link>
        </p>
      </div>
    </div>
  );
}
