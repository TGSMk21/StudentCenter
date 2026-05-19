'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import {
  ArrowLeft, ShoppingCart, Shield, Smartphone,
  CreditCard, Banknote, CheckCircle, Trash2, Plus, Minus, MapPin
} from 'lucide-react';


const PAYMENT_METHODS = [
  { id: 'cash',         label: 'Cash on Collection', sub: 'Pay when you collect',              icon: Banknote    },
  { id: 'mobile_money', label: 'Mobile Money',        sub: 'MTN · Airtel · Zamtel',             icon: Smartphone  },
  { id: 'card',         label: 'Debit / Credit Card', sub: 'Visa · Mastercard via Flutterwave', icon: CreditCard  },
];

export default function CheckoutPage() {
  const router = useRouter();
  const [cart,       setCart]       = useState<any[]>([]);
  const [payment,    setPayment]    = useState('cash');
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [success,    setSuccess]    = useState(false);
  const [orderRef,   setOrderRef]   = useState('');

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (!u) { router.push('/login'); return; }
    const saved = localStorage.getItem('sch_cart');
    if (saved) setCart(JSON.parse(saved));
  }, []);

  function removeItem(id: string) {
    setCart(prev => prev.filter(i => i.id !== id));
  }

  function updateQty(id: string, delta: number) {
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i));
  }

  const total    = cart.reduce((s, i) => s + parseFloat(i.effective_price || i.price) * i.qty, 0);
  const count    = cart.reduce((s, i) => s + i.qty, 0);
  const vendorId = cart[0]?.vendor || cart[0]?.vendor_id;

  async function handleOrder() {
    if (!cart.length) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/orders/create/', {
        vendor_id:      vendorId,
        payment_method: payment,
        items: cart.map(i => ({ product_id: i.id, quantity: i.qty })),
      });

      if (payment !== 'cash') {
        await api.post(`/payments/initiate/${data.id}/`, {});
      }

      localStorage.removeItem('sch_cart');
      setOrderRef(data.id?.toString().slice(0, 8) || 'SCH-NEW');
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Order failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (success) return (
    <div style={{ minHeight: '100vh', background: '#F4F6FB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', Inter, sans-serif" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ background: '#fff', borderRadius: 24, padding: 48, textAlign: 'center', maxWidth: 440, width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.1)' }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          style={{ width: 80, height: 80, borderRadius: '50%', background: '#E8FAF1', border: '3px solid #2ECC71', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}
        >
          <CheckCircle size={40} color="#2ECC71" />
        </motion.div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0A0F1E', marginBottom: 8 }}>Order Placed!</h2>
        <p style={{ color: '#8892A4', fontSize: 15, marginBottom: 24, lineHeight: 1.7 }}>
          Your order has been sent to the vendor. You will be notified when it is ready.
        </p>
        <div style={{ background: '#F4F6FB', borderRadius: 12, padding: '16px 24px', marginBottom: 32 }}>
          <div style={{ fontSize: 12, color: '#8892A4', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Order Reference</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#0D2B5E' }}>#{orderRef}</div>
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Link href="/dashboard" style={{ background: '#0D2B5E', color: '#fff', borderRadius: 10, padding: '12px 24px', textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>
            View Dashboard
          </Link>
          <Link href="/vendors" style={{ background: '#F5A623', color: '#0D2B5E', borderRadius: 10, padding: '12px 24px', textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>
            Shop More
          </Link>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#F4F6FB', fontFamily: "'DM Sans', Inter, sans-serif" }}>
      <nav style={{ background: '#fff', borderBottom: '2px solid #F5A623', padding: '0 5%', boxShadow: '0 2px 20px rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16, height: 68 }}>
          <button onClick={() => router.back()} style={{ background: '#F4F6FB', border: '1px solid #E8EBF2', borderRadius: 10, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ArrowLeft size={18} color="#0D2B5E" />
          </button>
          <h1 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0A0F1E' }}>Checkout</h1>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, color: '#8892A4', fontSize: 13 }}>
            <ShoppingCart size={15} /> {count} items
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 1000, margin: '32px auto', padding: '0 5%', display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24 }}>

        {/* LEFT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Cart Items */}
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E8EBF2', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #E8EBF2' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#0A0F1E' }}>Your Items ({count})</h2>
            </div>
            {cart.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🛒</div>
                <div style={{ color: '#8892A4', marginBottom: 16 }}>Your cart is empty</div>
                <Link href="/vendors" style={{ color: '#F5A623', fontWeight: 700, textDecoration: 'none' }}>Browse vendors</Link>
              </div>
            ) : cart.map((item, i) => (
              <div key={item.id} style={{ padding: '16px 24px', borderBottom: i < cart.length - 1 ? '1px solid #E8EBF2' : 'none', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 52, height: 52, borderRadius: 12, background: '#F4F6FB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                  🛍️
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#0A0F1E', marginBottom: 2 }}>{item.name}</div>
                  <div style={{ fontSize: 12, color: '#8892A4' }}>{item.vendor_name || item.vendorName}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button onClick={() => updateQty(item.id, -1)} style={{ width: 28, height: 28, borderRadius: 6, background: '#F4F6FB', border: '1px solid #E8EBF2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Minus size={12} />
                  </button>
                  <span style={{ fontWeight: 800, fontSize: 14, minWidth: 20, textAlign: 'center' }}>{item.qty}</span>
                  <button onClick={() => updateQty(item.id, 1)} style={{ width: 28, height: 28, borderRadius: 6, background: '#0D2B5E', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Plus size={12} color="#fff" />
                  </button>
                </div>
                <div style={{ fontWeight: 800, fontSize: 15, color: '#0D2B5E', minWidth: 80, textAlign: 'right' }}>
                  K{(parseFloat(item.effective_price || item.price) * item.qty).toFixed(2)}
                </div>
                <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#E74C3C', padding: 4 }}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Delivery */}
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E8EBF2', padding: 24 }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#0A0F1E', marginBottom: 16 }}>Collection Point</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#F4F6FB', borderRadius: 12, padding: 16 }}>
              <MapPin size={20} color="#F5A623" />
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#0A0F1E' }}>Room Delivery k8</div>
                <div style={{ fontSize: 12, color: '#8892A4' }}>Delivered to your room · Student Hostel Block K</div>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E8EBF2', padding: 24 }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#0A0F1E', marginBottom: 16 }}>Payment Method</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {PAYMENT_METHODS.map(m => (
                <div
                  key={m.id}
                  onClick={() => setPayment(m.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    border: `2px solid ${payment === m.id ? '#0D2B5E' : '#E8EBF2'}`,
                    background: payment === m.id ? '#F8F9FF' : '#fff',
                    borderRadius: 12, padding: '14px 18px', cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${payment === m.id ? '#0D2B5E' : '#E8EBF2'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {payment === m.id && <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#0D2B5E' }} />}
                  </div>
                  <m.icon size={20} color={payment === m.id ? '#0D2B5E' : '#8892A4'} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#0A0F1E' }}>{m.label}</div>
                    <div style={{ fontSize: 12, color: '#8892A4' }}>{m.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT — Summary */}
        <div>
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E8EBF2', padding: 24, position: 'sticky', top: 24 }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#0A0F1E', marginBottom: 20 }}>Order Summary</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#444' }}>
                <span>Subtotal ({count} items)</span>
                <span style={{ fontWeight: 600 }}>K{total.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#444' }}>
                <span>Collection fee</span>
                <span style={{ color: '#2ECC71', fontWeight: 600 }}>Free</span>
              </div>
              <div style={{ borderTop: '2px solid #E8EBF2', paddingTop: 12, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 800, fontSize: 16, color: '#0A0F1E' }}>Total</span>
                <span style={{ fontWeight: 900, fontSize: 20, color: '#0D2B5E' }}>K{total.toFixed(2)}</span>
              </div>
            </div>

            {error && (
              <div style={{ background: '#FDE8E8', border: '1px solid #E74C3C44', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#C0392B' }}>
                {error}
              </div>
            )}

            <button
              onClick={handleOrder}
              disabled={loading || cart.length === 0}
              style={{
                width: '100%', padding: '16px',
                background: loading || cart.length === 0 ? '#8892A4' : '#F5A623',
                color: '#0D2B5E', border: 'none', borderRadius: 12,
                fontSize: 16, fontWeight: 900, cursor: loading || cart.length === 0 ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                marginBottom: 12,
              }}
            >
              {loading ? 'Placing order...' : `Place Order · K${total.toFixed(2)}`}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#8892A4', fontSize: 12 }}>
              <Shield size={13} /> Secure checkout
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
