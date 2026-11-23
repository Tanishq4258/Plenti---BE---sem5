import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Marketplace() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedListing, setSelectedListing] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const { user } = useAuth();

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await api.listings.getAll({
        category: category !== 'all' ? category : undefined,
        search: search || undefined
      });
      setListings(res.data || []);
    } catch (err) {
      console.warn('Could not load listings from MongoDB backend:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [category]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchListings();
  };

  const handleOrder = async () => {
    if (!selectedListing) return;
    try {
      const res = await api.orders.create({
        listingId: selectedListing._id,
        quantity: 1
      });
      setOrderSuccess(res.data);
      setSelectedListing(null);
      fetchListings();
    } catch (err) {
      alert(err.message || 'Error placing order. Please make sure you are logged in.');
    }
  };

  return (
    <div className="container" style={{ padding: '30px 20px' }}>
      {/* Hero Header */}
      <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 36px' }}>
        <span className="badge badge-green" style={{ marginBottom: 12 }}>
          🌱 RESCUED FOOD MARKETPLACE · LIVE MONGODB DATA
        </span>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 850, color: '#0F172A', marginBottom: 12, lineHeight: 1.2 }}>
          Delicious Surplus Food. Up to 70% Off.
        </h1>
        <p style={{ color: '#64748B', fontSize: '1rem', marginBottom: 24 }}>
          Partnered with bakeries, cafes, and restaurants to divert fresh food from waste directly to your table.
        </p>

        {/* Search & Filter Bar */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 10, maxWidth: 540, margin: '0 auto' }}>
          <input
            type="text"
            placeholder="Search croissants, bowls, biryani..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, padding: '12px 16px', borderRadius: 10, border: '1px solid var(--border)', fontSize: '0.95rem' }}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '12px 20px' }}>
            Search
          </button>
        </form>
      </div>

      {/* Categories */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 30, flexWrap: 'wrap' }}>
        {['all', 'Bakery', 'Meals', 'Groceries', 'Beverages'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`btn ${category === cat ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '8px 16px', fontSize: '0.85rem', textTransform: 'capitalize' }}
          >
            {cat === 'all' ? '🍽️ All Items' : cat}
          </button>
        ))}
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748B' }}>
          Loading live surplus food from MongoDB...
        </div>
      ) : listings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', background: '#FFFFFF', borderRadius: 16, border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '2rem', marginBottom: 10 }}>🧺</div>
          <h3 style={{ fontWeight: 700, marginBottom: 6 }}>No listings found right now</h3>
          <p style={{ color: '#64748B', fontSize: '0.9rem' }}>Run <code>npm run seed</code> in terminal to populate sample surplus listings into MongoDB!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
          {listings.map((item) => (
            <div
              key={item._id}
              style={{
                background: '#FFFFFF',
                borderRadius: 16,
                border: '1px solid var(--border)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ position: 'relative', height: 180 }}>
                <img
                  src={item.image}
                  alt={item.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span
                  style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    background: '#10B981',
                    color: '#ffffff',
                    padding: '4px 10px',
                    borderRadius: 9999,
                    fontWeight: 800,
                    fontSize: '0.8rem'
                  }}
                >
                  {item.discountPercentage ? `-${item.discountPercentage}%` : 'DISCOUNT'}
                </span>
                <span
                  style={{
                    position: 'absolute',
                    bottom: 12,
                    left: 12,
                    background: 'rgba(15, 23, 42, 0.85)',
                    color: '#ffffff',
                    padding: '3px 8px',
                    borderRadius: 6,
                    fontSize: '0.72rem',
                    fontWeight: 600
                  }}
                >
                  ⏰ Pickup: {item.pickupStart || '18:00'} - {item.pickupEnd || '21:30'}
                </span>
              </div>

              <div style={{ padding: 18, display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600, marginBottom: 4 }}>
                  {item.business?.businessName || 'Local Merchant'} · {item.category}
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', marginBottom: 8, lineHeight: 1.3 }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: 16, flex: 1, lineHeight: 1.4 }}>
                  {item.description || 'Fresh surplus food prepared with care.'}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                  <div>
                    <span style={{ fontSize: '1.25rem', fontWeight: 850, color: '#10B981' }}>
                      ₹{item.discountedPrice}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: '#94A3B8', textDecoration: 'line-through', marginLeft: 6 }}>
                      ₹{item.originalPrice}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedListing(item)}
                    className="btn btn-primary"
                    style={{ padding: '8px 14px', fontSize: '0.82rem' }}
                  >
                    Reserve Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reservation Modal */}
      {selectedListing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: '#FFFFFF', borderRadius: 16, maxWidth: 480, width: '100%', overflow: 'hidden' }}>
            <img src={selectedListing.image} alt={selectedListing.title} style={{ width: '100%', height: 200, objectFit: 'cover' }} />
            <div style={{ padding: 24 }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 6 }}>{selectedListing.title}</h3>
              <p style={{ color: '#64748B', fontSize: '0.88rem', marginBottom: 16 }}>{selectedListing.description}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: '#F8FAFC', borderRadius: 8, marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Total to pay upon pickup</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 850, color: '#10B981' }}>₹{selectedListing.discountedPrice}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Remaining Stock</div>
                  <div style={{ fontWeight: 700 }}>{selectedListing.quantity} portions</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setSelectedListing(null)} className="btn btn-outline" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button onClick={handleOrder} className="btn btn-primary" style={{ flex: 2 }}>
                  Confirm Booking (MongoDB)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {orderSuccess && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: '#FFFFFF', borderRadius: 16, maxWidth: 440, width: '100%', padding: 30, textAlign: 'center' }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#DCFCE7', color: '#15803D', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '1.8rem' }}>
              ✓
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 8 }}>Surplus Rescued!</h3>
            <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: 20 }}>
              Order ID: <strong>{orderSuccess.orderId}</strong>
            </p>
            <div style={{ background: '#F1F5F9', padding: '14px', borderRadius: 10, marginBottom: 24 }}>
              <div style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700 }}>
                Show this pickup code at counter
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 850, letterSpacing: 4, color: '#0F172A' }}>
                {orderSuccess.pickupCode}
              </div>
            </div>
            <button onClick={() => setOrderSuccess(null)} className="btn btn-primary" style={{ width: '100%' }}>
              Got It!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
