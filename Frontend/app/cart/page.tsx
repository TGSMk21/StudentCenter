'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShoppingCart, Plus, Minus, Trash2, ChevronRight, ShoppingBag } from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<any[]>([]);

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (!u) { router.push('/login'); return; }
    const saved = localStorage.getItem('sch_cart');
    if (saved) setCart(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('sch_cart', JSON.stringify(cart));
  }, [cart]);

  function updateQty(id: string, delta: number) {
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i));
  }

  function remove(id: string) {
    setCart(prev => prev.filter(i => i.id !== id));
  }

  const total = cart.reduce((s, i) => s + parseFloat(i.effective_price || i.price) * i.qty, 0);
  const count = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <div style={{ minHeight: '100vh', background: '#F4F6FB', fontFamily: "'DM Sans', Inter, sans-serif" }}>
      <nav style={{ background: '#fff', borderBottom: '2px solid #F5A623', padding: '0 5%', boxShadow: '0 2px 20px rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16, height: 68 }}>
          <button onClick={() => router.back()} style={{ background: '#F4F6FB', border: '1px solid #E8EBF2', borderRadius: 10, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ArrowLeft size={18} color="#0D2B5E" />
          </button>
          <h1 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0A0F1E' }}>My Cart</h1>
          <span style={{ color: '#8892A4', fontSize: 13 }}>{count} items</span>
        </div>
      </nav>

      <div style={{ maxWidth: 1000, margin: '32px auto', padding: '0 5%', display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }}>

        {/* Items */}
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E8EBF2', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #E8EBF2', fontWeight: 800, fontSize: 15, color: '#0A0F1E' }}>
            Cart Items
          </div>
          {cart.length === 0 ? (
            <div style={{ padding: 60, textAlign: 'center' }}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>🛒</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: '#0A0F1E', marginBottom: 8 }}>Your cart is empty</div>
              <div style={{ color: '#8892A4', marginBottom: 24 }}>Browse vendors and add items to get started</div>
              <Link href="/vendors" style={{ background: '#F5A623', color: '#0D2B5E', borderRadius: 10, padding: '12px 28px', textDecoration: 'none', fontWeight: 800 }}>
                Browse Vendors
              </Link>
            </div>
          ) : cart.map((item, i) => (
            <div key={item.id} style={{ padding: '16px 24px', borderBottom: i < cart.length - 1 ? '1px solid #E8EBF2' : 'none', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: 12, background: '#F4F6FB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>
                🛍️
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#0A0F1E', marginBottom: 2 }}>{item.name}</div>
                <div style={{ fontSize: 12, color: '#8892A4' }}>{item.vendor_name || item.vendorName}</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#0D2B5E', marginTop: 4 }}>
                  K{parseFloat(item.effective_price || item.price).toFixed(2)} each
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button onClick={() => updateQty(item.id, -1)} style={{ width: 32, height: 32, borderRadius: 8, background: '#F4F6FB', border: '1px solid #E8EBF2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Minus size={14} />
                </button>
                <span style={{ fontWeight: 800, fontSize: 15, minWidth: 24, textAlign: 'center' }}>{item.qty}</span>
                <button onClick={() => updateQty(item.id, 1)} style={{ width: 32, height: 32, borderRadius: 8, background: '#0D2B5E', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Plus size={14} color="#fff" />
                </button>
              </div>
              <div style={{ fontWeight: 900, fontSize: 16, color: '#0D2B5E', minWidth: 80, textAlign: 'right' }}>
                K{(parseFloat(item.effective_price || item.price) * item.qty).toFixed(2)}
              </div>
              <button onClick={() => remove(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#E74C3C', padding: 6 }}>
                <Trash2 size={17} />
              </button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div style={{ position: 'sticky', top: 24 }}>
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E8EBF2', padding: 24 }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#0A0F1E', marginBottom: 20 }}>Order Summary</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#444' }}>
                <span>Subtotal ({count} items)</span>
                <span style={{ fontWeight: 600 }}>K{total.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: '#444' }}>Delivery</span>
                <span style={{ color: '#2ECC71', fontWeight: 700 }}>Free</span>
              </div>
              <div style={{ borderTop: '2px solid #E8EBF2', paddingTop: 12, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 800, fontSize: 16 }}>Total</span>
                <span style={{ fontWeight: 900, fontSize: 20, color: '#0D2B5E' }}>K{total.toFixed(2)}</span>
              </div>
            </div>
            <Link
              href="/checkout"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                width: '100%', padding: '15px',
                background: cart.length === 0 ? '#8892A4' : '#F5A623',
                color: '#0D2B5E', borderRadius: 12,
                fontSize: 15, fontWeight: 900, textDecoration: 'none',
                pointerEvents: cart.length === 0 ? 'none' : 'auto',
                boxSizing: 'border-box',
              }}
            >
              Proceed to Checkout <ChevronRight size={18} />
            </Link>
            <Link href="/vendors" style={{ display: 'block', textAlign: 'center', marginTop: 12, color: '#8892A4', fontSize: 13, textDecoration: 'none' }}>
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
