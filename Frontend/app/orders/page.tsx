'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, Package, ChevronRight, Clock, CheckCircle, XCircle, Loader } from 'lucide-react';

const STATUS: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  placed:     { label: 'Placed',     color: '#F39C12', bg: '#FEF6E8', icon: Clock        },
  processing: { label: 'Processing', color: '#3498DB', bg: '#E8F4FD', icon: Loader       },
  ready:      { label: 'Ready',      color: '#2ECC71', bg: '#E8FAF1', icon: CheckCircle  },
  completed:  { label: 'Completed',  color: '#8892A4', bg: '#F4F6FB', icon: CheckCircle  },
  cancelled:  { label: 'Cancelled',  color: '#E74C3C', bg: '#FDE8E8', icon: XCircle      },
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders,  setOrders]  = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('all');

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (!u) { router.push('/login'); return; }
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      const { data } = await api.get('/orders/');
      setOrders(data.results || data);
    } catch {
    } finally {
      setLoading(false);
    }
  }

  const filtered = filter === 'all' ? orders : orders.filter(o => o.order_status === filter);

  return (
    <div style={{ minHeight: '100vh', background: '#F4F6FB', fontFamily: "'DM Sans', Inter, sans-serif" }}>
      <nav style={{ background: '#fff', borderBottom: '2px solid #F5A623', padding: '0 5%', boxShadow: '0 2px 20px rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16, height: 68 }}>
          <button onClick={() => router.back()} style={{ background: '#F4F6FB', border: '1px solid #E8EBF2', borderRadius: 10, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ArrowLeft size={18} color="#0D2B5E" />
          </button>
          <h1 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0A0F1E' }}>My Orders</h1>
          <Link href="/dashboard" style={{ marginLeft: 'auto', color: '#8892A4', fontSize: 13, textDecoration: 'none' }}>Dashboard</Link>
        </div>
      </nav>

      <div style={{ maxWidth: 900, margin: '32px auto', padding: '0 5%' }}>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {['all', 'placed', 'processing', 'ready', 'completed', 'cancelled'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '8px 18px', borderRadius: 50,
              border: `2px solid ${filter === f ? '#0D2B5E' : '#E8EBF2'}`,
              background: filter === f ? '#0D2B5E' : '#fff',
              color: filter === f ? '#fff' : '#444',
              fontWeight: 600, fontSize: 13, cursor: 'pointer',
              textTransform: 'capitalize',
            }}>
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#8892A4' }}>Loading orders...</div>
        ) : filtered.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 20, padding: 60, textAlign: 'center', border: '1px solid #E8EBF2' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#0A0F1E', marginBottom: 8 }}>No orders found</div>
            <div style={{ color: '#8892A4', marginBottom: 24 }}>
              {filter === 'all' ? "You haven't placed any orders yet." : `No ${filter} orders.`}
            </div>
            <Link href="/vendors" style={{ background: '#F5A623', color: '#0D2B5E', borderRadius: 10, padding: '12px 24px', textDecoration: 'none', fontWeight: 800 }}>
              Start Shopping
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map((o, i) => {
              const sc = STATUS[o.order_status] || STATUS.placed;
              const Icon = sc.icon;
              return (
                <motion.div
                  key={o.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  style={{
                    background: '#fff', borderRadius: 16,
                    border: '1px solid #E8EBF2', padding: '20px 24px',
                    display: 'flex', alignItems: 'center', gap: 20,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  }}
                >
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: sc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={22} color={sc.color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <span style={{ fontWeight: 800, fontSize: 15, color: '#0A0F1E' }}>
                        #{String(o.id).slice(0, 8)}
                      </span>
                      <span style={{ background: sc.bg, color: sc.color, borderRadius: 6, padding: '2px 10px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
                        {sc.label}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: '#8892A4' }}>
                      {o.vendor_name} · {new Date(o.created_at).toLocaleDateString('en-ZM', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontWeight: 900, fontSize: 18, color: '#0D2B5E' }}>K{parseFloat(o.total_amount).toFixed(2)}</div>
                    <div style={{ fontSize: 12, color: o.payment_status === 'success' ? '#2ECC71' : '#F39C12', fontWeight: 600, textTransform: 'uppercase' }}>
                      {o.payment_status}
                    </div>
                  </div>
                  <ChevronRight size={18} color="#8892A4" />
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
