'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, ShoppingCart, Star, MapPin, Clock, ChevronRight, Plus, Minus, Calendar } from 'lucide-react';

const VENDOR_META: Record<string, { emoji: string; color: string; bg: string }> = {
  fast_food:       { emoji: '🍔', color: '#F39C12', bg: '#FEF6E8' },
  minimart:        { emoji: '🛒', color: '#2ECC71', bg: '#E8FAF1' },
  salon:           { emoji: '💇', color: '#E91E8C', bg: '#FDE8F4' },
  general_dealers: { emoji: '🖨️', color: '#3498DB', bg: '#E8F4FD' },
  tech_store:      { emoji: '💻', color: '#9B59B6', bg: '#F3E8FD' },
  pharmacy:        { emoji: '💊', color: '#1ABC9C', bg: '#E8FAF7' },
  butchery:        { emoji: '🥩', color: '#E74C3C', bg: '#FDE8E8' },
};

export default function VendorDetailPage() {
  const router   = useRouter();
  const { slug } = useParams();
  const [vendor,   setVendor]   = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [cart,     setCart]     = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (!u) { router.push('/login'); return; }

    // FIX 2: Load cart immediately before async fetch so it's never lost
    const saved = localStorage.getItem('sch_cart');
    if (saved) setCart(JSON.parse(saved));

    fetchVendor();
  }, [slug]);

  useEffect(() => {
    localStorage.setItem('sch_cart', JSON.stringify(cart));
  }, [cart]);

  // FIX 1: Fetch vendor first, then use vendor.id (not slug) for products query
  async function fetchVendor() {
    try {
      const vRes = await api.get(`/vendors/${slug}/`);
      setVendor(vRes.data);
      const pRes = await api.get(`/products/?vendor=${vRes.data.id}`);
      setProducts(pRes.data.results || pRes.data);
    } catch (err) {
      // FIX 3: Log errors so failures are visible during development
      console.error('Vendor fetch failed:', err);
    } finally {
      setLoading(false);
    }
  }

  function addToCart(product: any) {
    setCart(prev => {
      const ex = prev.find(i => i.id === product.id);
      if (ex) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1, vendorName: vendor?.name }];
    });
  }

  function removeFromCart(id: string) {
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty: i.qty - 1 } : i).filter(i => i.qty > 0));
  }

  function getQty(id: string) { return cart.find(i => i.id === id)?.qty || 0; }
  function cartCount() { return cart.reduce((s, i) => s + i.qty, 0); }
  function cartTotal() { return cart.reduce((s, i) => s + parseFloat(i.effective_price || i.price) * i.qty, 0); }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#F4F6FB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Sans, Inter, sans-serif' }}>
      <div style={{ color: '#8892A4' }}>Loading vendor...</div>
    </div>
  );

  if (!vendor) return (
    <div style={{ minHeight: '100vh', background: '#F4F6FB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Sans, Inter, sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>404</div>
        <div style={{ color: '#8892A4', marginBottom: 20 }}>Vendor not found</div>
        <Link href="/vendors" style={{ color: '#F5A623', fontWeight: 700 }}>Back to vendors</Link>
      </div>
    </div>
  );

  const meta       = VENDOR_META[vendor.category] || { emoji: '🏪', color: '#8892A4', bg: '#F4F6FB' };
  const categories = ['All', ...new Set(products.map(p => p.category_name).filter(Boolean))];
  const filtered   = activeCategory === 'All' ? products : products.filter(p => p.category_name === activeCategory);

  return (
    <div style={{ minHeight: '100vh', background: '#F4F6FB', fontFamily: "'DM Sans', Inter, sans-serif" }}>

      {/* NAV */}
      <nav style={{ background: '#fff', borderBottom: '2px solid #F5A623', padding: '0 5%', boxShadow: '0 2px 20px rgba(0,0,0,0.06)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16, height: 68 }}>
          <button onClick={() => router.back()} style={{ background: '#F4F6FB', border: '1px solid #E8EBF2', borderRadius: 10, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ArrowLeft size={18} color="#0D2B5E" />
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#0A0F1E' }}>{vendor.name}</div>
            <div style={{ fontSize: 12, color: '#8892A4' }}>{vendor.category}</div>
          </div>
          <Link href="/vendors" style={{ color: '#8892A4', textDecoration: 'none', fontSize: 13 }}>All Vendors</Link>
          <Link href="/cart" style={{ position: 'relative', textDecoration: 'none' }}>
            <div style={{ background: '#0D2B5E', color: '#fff', padding: '8px 16px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 700 }}>
              <ShoppingCart size={16} />
              {cartCount() > 0 ? `K${cartTotal().toFixed(0)} (${cartCount()})` : 'Cart'}
            </div>
          </Link>
        </div>
      </nav>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 5%' }}>

        {/* VENDOR HERO */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: `linear-gradient(135deg, ${meta.color}18, ${meta.color}08)`,
            border: `1.5px solid ${meta.color}33`,
            borderRadius: 20, padding: '32px 36px',
            display: 'flex', alignItems: 'center', gap: 28,
            margin: '24px 0', position: 'relative', overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', right: -40, top: -40, width: 200, height: 200, borderRadius: '50%', background: meta.color + '08' }} />
          <div style={{ fontSize: 64, flexShrink: 0 }}>{meta.emoji}</div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0A0F1E', marginBottom: 8 }}>{vendor.name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 12 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#8892A4', fontSize: 14 }}>
                <MapPin size={14} color={meta.color} />
                {vendor.location_notes || 'Student Center'}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#8892A4', fontSize: 14 }}>
                <Star size={14} color="#F5A623" fill="#F5A623" />
                {vendor.average_rating || '4.5'} ({vendor.rating_count || 0} reviews)
              </span>
              <span style={{
                background: meta.color + '22', color: meta.color,
                borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 700,
              }}>
                {vendor.status || 'Open'}
              </span>
            </div>
            {vendor.description && (
              <p style={{ color: '#8892A4', fontSize: 14, lineHeight: 1.6, maxWidth: 500 }}>{vendor.description}</p>
            )}
          </div>
          {vendor.has_bookable_services && (
            <Link href={`/book/${vendor.slug}`} style={{
              background: meta.color, color: '#fff',
              borderRadius: 12, padding: '14px 24px',
              fontWeight: 800, fontSize: 14, textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
              boxShadow: `0 8px 20px ${meta.color}44`,
            }}>
              <Calendar size={18} /> Book a Slot
            </Link>
          )}
        </motion.div>

        {/* CATEGORY TABS */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} style={{
              padding: '8px 18px', borderRadius: 50,
              border: `2px solid ${activeCategory === cat ? meta.color : '#E8EBF2'}`,
              background: activeCategory === cat ? meta.color : '#fff',
              color: activeCategory === cat ? '#fff' : '#444',
              fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
            }}>
              {cat}
            </button>
          ))}
        </div>

        {/* PRODUCTS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, paddingBottom: 100 }}>
          {filtered.map((p, i) => {
            const qty   = getQty(p.id);
            const price = parseFloat(p.effective_price || p.price);
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4 }}
                style={{
                  background: '#fff', borderRadius: 16,
                  border: '1px solid #E8EBF2', overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{
                  background: meta.bg, height: 110,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 44, position: 'relative',
                }}>
                  {meta.emoji}
                  {p.is_service && (
                    <div style={{ position: 'absolute', top: 8, right: 8, background: '#3498DB', color: '#fff', borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>SERVICE</div>
                  )}
                  {p.discount_price && (
                    <div style={{ position: 'absolute', top: 8, left: 8, background: '#E74C3C', color: '#fff', borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>SALE</div>
                  )}
                </div>
                <div style={{ padding: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0A0F1E', marginBottom: 4, lineHeight: 1.3 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: '#8892A4', marginBottom: 10 }}>{p.category_name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <span style={{ fontSize: 16, fontWeight: 900, color: meta.color }}>K{price.toFixed(2)}</span>
                    {p.discount_price && <span style={{ fontSize: 12, color: '#aaa', textDecoration: 'line-through' }}>K{parseFloat(p.price).toFixed(2)}</span>}
                  </div>

                  {qty > 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F4F6FB', borderRadius: 10, padding: '4px 8px' }}>
                      <button onClick={() => removeFromCart(p.id)} style={{ width: 32, height: 32, borderRadius: 8, background: '#fff', border: '1px solid #E8EBF2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Minus size={14} />
                      </button>
                      <span style={{ fontWeight: 800, fontSize: 15 }}>{qty}</span>
                      <button onClick={() => addToCart(p)} style={{ width: 32, height: 32, borderRadius: 8, background: meta.color, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Plus size={14} color="#fff" />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => addToCart(p)} style={{
                      width: '100%', padding: '10px', background: meta.color,
                      color: '#fff', border: 'none', borderRadius: 10,
                      fontSize: 13, fontWeight: 700, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}>
                      {p.is_service ? <><Calendar size={14} /> Book</> : <><Plus size={14} /> Add to Cart</>}
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
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
            whiteSpace: 'nowrap',
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
