'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import {
  Search, ShoppingCart, User, ChevronRight, Star,
  MapPin, Filter, SlidersHorizontal, Tag, Zap,
  ShoppingBag, Bell, LogOut, Home, Receipt, Calendar
} from 'lucide-react';


const CATEGORIES = ['All', 'Fast Food', 'Minimart', 'Hair Dressers', 'General Dealers', 'Tech Store', 'Pharmaceutical', 'Butchery'];

const VENDOR_META: Record<string, { emoji: string; color: string; bg: string }> = {
  fast_food:       { emoji: '🍔', color: '#F39C12', bg: '#FEF6E8' },
  minimart:        { emoji: '🛒', color: '#2ECC71', bg: '#E8FAF1' },
  salon:           { emoji: '💇', color: '#E91E8C', bg: '#FDE8F4' },
  general_dealers: { emoji: '🖨️', color: '#3498DB', bg: '#E8F4FD' },
  tech_store:      { emoji: '💻', color: '#9B59B6', bg: '#F3E8FD' },
  pharmacy:        { emoji: '💊', color: '#1ABC9C', bg: '#E8FAF7' },
  butchery:        { emoji: '🥩', color: '#E74C3C', bg: '#FDE8E8' },
};

function getMeta(cat: string) {
  return VENDOR_META[cat] || { emoji: '🏪', color: '#8892A4', bg: '#F4F6FB' };
}

export default function VendorsPage() {
  const router = useRouter();
  const [user, setUser]             = useState<any>(null);
  const [vendors, setVendors]       = useState<any[]>([]);
  const [products, setProducts]     = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [cart, setCart]             = useState<any[]>([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeTab, setActiveTab]   = useState<'vendors' | 'products'>('vendors');

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (!u) { router.push('/login'); return; }
    setUser(JSON.parse(u));
    // FIX: Load shared cart from localStorage so items added on vendor detail pages show here
    const saved = localStorage.getItem('sch_cart');
    if (saved) setCart(JSON.parse(saved));
    fetchData();
  }, []);

  // FIX: Persist cart to localStorage whenever it changes so cart page can read it
  useEffect(() => {
    localStorage.setItem('sch_cart', JSON.stringify(cart));
  }, [cart]);

  async function fetchData() {
    try {
      const [vRes, pRes] = await Promise.all([
        api.get('/vendors/'),
        api.get('/products/'),
      ]);
      setVendors(vRes.data.results || vRes.data);
      setProducts(pRes.data.results || pRes.data);
    } catch {
    } finally {
      setLoading(false);
    }
  }

  function addToCart(product: any) {
    setCart(prev => {
      const ex = prev.find(i => i.id === product.id);
      if (ex) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
  }

  function getQty(id: string) {
    return cart.find(i => i.id === id)?.qty || 0;
  }

  function cartTotal() { return cart.reduce((s, i) => s + parseFloat(i.effective_price || i.price) * i.qty, 0); }
  function cartCount() { return cart.reduce((s, i) => s + i.qty, 0); }

  function logout() {
    localStorage.clear();
    router.push('/login');
  }

  const filteredVendors = vendors.filter(v => {
    const matchSearch = v.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = activeFilter === 'All' || v.category?.toLowerCase().includes(activeFilter.toLowerCase().replace(' ', '_'));
    return matchSearch && matchFilter;
  });

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.vendor_name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', background: '#F4F6FB', fontFamily: "'DM Sans', Inter, sans-serif" }}>

      {/* NAVBAR */}
      <nav style={{
        background: '#fff', borderBottom: '2px solid #F5A623',
        padding: '0 5%', position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 20, height: 70 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ position: 'relative', width: 44, height: 44 }}>
              <Image src="/logo.webp" alt="MU" fill style={{ objectFit: 'contain', mixBlendMode: 'multiply' }} />
            </div>
            <div>
              <div style={{ color: '#0D2B5E', fontWeight: 900, fontSize: 18, lineHeight: 1 }}>SCHub</div>
              <div style={{ color: '#F5A623', fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>Student Center</div>
            </div>
          </Link>

          {/* Search */}
          <div style={{ flex: 1, maxWidth: 560 }}>
            <div style={{
              display: 'flex', alignItems: 'center',
              background: searchFocused ? '#fff' : '#F4F6FB',
              border: `2px solid ${searchFocused ? '#F5A623' : '#E8EBF2'}`,
              borderRadius: 10, overflow: 'hidden', transition: 'all 0.2s',
            }}>
              <Search size={16} color="#8892A4" style={{ marginLeft: 14, flexShrink: 0 }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search products, vendors..."
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                style={{ flex: 1, padding: '11px 14px', border: 'none', outline: 'none', background: 'transparent', fontSize: 14, color: '#0A0F1E' }}
              />
            </div>
          </div>

          {/* Cart */}
          <Link href="/cart" style={{ position: 'relative', textDecoration: 'none' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: '#0D2B5E', color: '#fff',
              padding: '10px 18px', borderRadius: 10, cursor: 'pointer',
            }}>
              <ShoppingCart size={18} />
              <span style={{ fontWeight: 700, fontSize: 14 }}>
                {cartCount() > 0 ? `K${cartTotal().toFixed(0)}` : 'Cart'}
              </span>
              {cartCount() > 0 && (
                <div style={{
                  background: '#F5A623', color: '#0D2B5E',
                  borderRadius: '50%', width: 20, height: 20,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 900,
                }}>
                  {cartCount()}
                </div>
              )}
            </div>
          </Link>

          {/* User */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <div style={{
              width: 38, height: 38, borderRadius: '50%',
              background: '#F5A623', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: 14, color: '#0D2B5E',
            }}>
              {user?.name?.[0]?.toUpperCase() || 'S'}
            </div>
            <button onClick={logout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8892A4', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
              <LogOut size={15} /> Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 5%' }}>

        {/* Page header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0A0F1E', marginBottom: 4 }}>
            {search ? `Results for "${search}"` : 'Campus Marketplace'}
          </h1>
          <p style={{ color: '#8892A4', fontSize: 14 }}>
            {search
              ? `${filteredProducts.length} products and ${filteredVendors.length} vendors found`
              : 'Order from 7 Student Center vendors'}
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: '#fff', borderRadius: 12, padding: 4, width: 'fit-content', border: '1px solid #E8EBF2' }}>
          {(['vendors', 'products'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '8px 24px', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontWeight: 700, fontSize: 14, transition: 'all 0.2s',
                background: activeTab === tab ? '#0D2B5E' : 'transparent',
                color: activeTab === tab ? '#fff' : '#8892A4',
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Category filters */}
        {activeTab === 'vendors' && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                style={{
                  padding: '8px 18px', borderRadius: 50, border: '2px solid',
                  borderColor: activeFilter === cat ? '#0D2B5E' : '#E8EBF2',
                  background: activeFilter === cat ? '#0D2B5E' : '#fff',
                  color: activeFilter === cat ? '#fff' : '#444',
                  fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
            {[...Array(8)].map((_, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 16, height: 180, border: '1px solid #E8EBF2', animation: 'pulse 1.5s infinite' }} />
            ))}
          </div>
        ) : activeTab === 'vendors' ? (
          /* VENDORS GRID */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
            {filteredVendors.map((v, i) => {
              const meta = getMeta(v.category);
              return (
                <motion.div
                  key={v.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  whileHover={{ y: -4 }}
                >
                  <Link href={`/vendors/${v.slug}`} style={{ textDecoration: 'none' }}>
                    <div style={{
                      background: '#fff', borderRadius: 16,
                      border: `1.5px solid ${meta.color}33`,
                      overflow: 'hidden', cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                      transition: 'box-shadow 0.2s',
                    }}>
                      {/* Header */}
                      <div style={{
                        background: `linear-gradient(135deg, ${meta.color}15, ${meta.color}08)`,
                        height: 90, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: 44, position: 'relative',
                        borderBottom: `1px solid ${meta.color}22`,
                      }}>
                        {meta.emoji}
                        {v.has_bookable_services && (
                          <div style={{
                            position: 'absolute', top: 10, right: 10,
                            background: '#F5A623', color: '#0D2B5E',
                            borderRadius: 6, padding: '3px 8px', fontSize: 10, fontWeight: 800,
                          }}>
                            BOOK
                          </div>
                        )}
                      </div>
                      <div style={{ padding: 16 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0A0F1E', marginBottom: 4 }}>{v.name}</h3>
                        <p style={{ fontSize: 12, color: '#8892A4', marginBottom: 12 }}>{v.category}</p>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{
                            background: meta.bg, color: meta.color,
                            borderRadius: 6, padding: '3px 10px', fontSize: 11, fontWeight: 700,
                          }}>
                            {v.status || 'Open'}
                          </div>
                          <ChevronRight size={16} color="#8892A4" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* PRODUCTS GRID */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
            {filteredProducts.map((p, i) => {
              const meta = getMeta(p.vendor_category || '');
              const qty = getQty(p.id);
              const price = parseFloat(p.effective_price || p.price);
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.1)' }}
                  style={{
                    background: '#fff', borderRadius: 14,
                    border: '1px solid #E8EBF2', overflow: 'hidden',
                    transition: 'box-shadow 0.2s',
                  }}
                >
                  <div style={{
                    background: meta.bg, height: 100,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 36, position: 'relative',
                  }}>
                    {meta.emoji}
                    {p.discount_price && (
                      <div style={{
                        position: 'absolute', top: 8, left: 8,
                        background: '#E74C3C', color: '#fff',
                        borderRadius: 5, padding: '2px 7px', fontSize: 10, fontWeight: 700,
                      }}>SALE</div>
                    )}
                    {p.is_service && (
                      <div style={{
                        position: 'absolute', top: 8, right: 8,
                        background: '#3498DB', color: '#fff',
                        borderRadius: 5, padding: '2px 7px', fontSize: 10, fontWeight: 700,
                      }}>SERVICE</div>
                    )}
                  </div>
                  <div style={{ padding: 12 }}>
                    <div style={{ fontSize: 11, color: meta.color, fontWeight: 700, marginBottom: 3 }}>{p.vendor_name}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0A0F1E', marginBottom: 8, lineHeight: 1.3 }}>{p.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                      <span style={{ fontSize: 15, fontWeight: 900, color: '#0D2B5E' }}>K{price.toFixed(2)}</span>
                      {p.discount_price && (
                        <span style={{ fontSize: 11, color: '#aaa', textDecoration: 'line-through' }}>K{parseFloat(p.price).toFixed(2)}</span>
                      )}
                    </div>
                    {/* FIX: Services go to booking page, regular products get add-to-cart controls */}
                    {p.is_service ? (
                      <button
                        onClick={() => router.push(`/book/${p.vendor_slug || p.vendor}`)}
                        style={{
                          width: '100%', padding: '8px',
                          background: '#E91E8C', color: '#fff',
                          border: 'none', borderRadius: 8, fontSize: 12,
                          fontWeight: 700, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                        }}
                      >
                        <Calendar size={12} /> Book
                      </button>
                    ) : qty > 0 ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button onClick={() => setCart(c => c.map(i => i.id === p.id ? { ...i, qty: Math.max(0, i.qty - 1) } : i).filter(i => i.qty > 0))}
                          style={{ width: 28, height: 28, borderRadius: 6, background: '#F4F6FB', border: '1px solid #E8EBF2', cursor: 'pointer', fontWeight: 900, fontSize: 16 }}>
                          -
                        </button>
                        <span style={{ fontWeight: 800, fontSize: 14 }}>{qty}</span>
                        <button onClick={() => addToCart(p)}
                          style={{ width: 28, height: 28, borderRadius: 6, background: '#0D2B5E', border: 'none', cursor: 'pointer', color: '#fff', fontWeight: 900, fontSize: 16 }}>
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(p)}
                        style={{
                          width: '100%', padding: '8px',
                          background: '#0D2B5E', color: '#fff',
                          border: 'none', borderRadius: 8, fontSize: 12,
                          fontWeight: 700, cursor: 'pointer',
                        }}
                      >
                        Add to Cart
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating cart */}
      {cartCount() > 0 && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          style={{
            position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
            background: '#0D2B5E', borderRadius: 50, padding: '14px 28px',
            display: 'flex', alignItems: 'center', gap: 16,
            boxShadow: '0 8px 32px rgba(13,43,94,0.4)', zIndex: 200,
          }}
        >
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>{cartCount()} items</span>
          <span style={{ color: '#fff', fontWeight: 900, fontSize: 16 }}>K{cartTotal().toFixed(2)}</span>
          <Link href="/checkout" style={{
            background: '#F5A623', color: '#0D2B5E',
            borderRadius: 50, padding: '8px 20px',
            fontWeight: 800, fontSize: 14, textDecoration: 'none',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            Checkout <ChevronRight size={16} />
          </Link>
        </motion.div>
      )}
    </div>
  );
}
