'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Clock, CheckCircle, XCircle, Loader, Search } from 'lucide-react';
import api from '@/lib/api';

const STATUS: Record<string, { label: string; color: string; bg: string }> = {
  placed:     { label: 'Placed',     color: '#F39C12', bg: '#FEF6E8' },
  processing: { label: 'Processing', color: '#3498DB', bg: '#E8F4FD' },
  ready:      { label: 'Ready',      color: '#2ECC71', bg: '#E8FAF1' },
  completed:  { label: 'Completed',  color: '#8892A4', bg: '#F4F6FB' },
  cancelled:  { label: 'Cancelled',  color: '#E74C3C', bg: '#FDE8E8' },
};

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/orders/vendor/').then(r => {
      setOrders(r.data.results || r.data);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? orders : orders.filter(o => o.order_status === filter);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0A0F1E', marginBottom: 4 }}>Orders</h1>
        <p style={{ color: '#8892A4', fontSize: 14 }}>{orders.length} total orders</p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {[{ key: 'all', label: 'All' }, ...Object.entries(STATUS).map(([k, v]) => ({ key: k, label: v.label }))].map(s => (
          <button
            key={s.key}
            onClick={() => setFilter(s.key)}
            style={{
              padding: '8px 18px', borderRadius: 50, border: '2px solid',
              borderColor: filter === s.key ? '#0D2B5E' : '#E8EBF2',
              background: filter === s.key ? '#0D2B5E' : '#fff',
              color: filter === s.key ? '#fff' : '#444',
              fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ color: '#8892A4' }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#8892A4' }}>No orders found</div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E8EBF2', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F4F6FB' }}>
                {['Order ID', 'Student', 'Items', 'Amount', 'Payment', 'Status', ''].map(h => (
                  <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#8892A4', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => {
                const sc = STATUS[o.order_status] || { bg: '#F4F6FB', color: '#8892A4' };
                return (
                  <tr key={o.id} style={{ borderBottom: '1px solid #E8EBF2' }}>
                    <td style={{ padding: '14px 20px', fontSize: 13, fontWeight: 700, color: '#0A0F1E' }}>#{String(o.id).slice(0, 8)}</td>
                    <td style={{ padding: '14px 20px', fontSize: 13, color: '#444' }}>{o.student_name || 'Student'}</td>
                    <td style={{ padding: '14px 20px', fontSize: 13, color: '#444' }}>{o.items?.length || 0}</td>
                    <td style={{ padding: '14px 20px', fontSize: 13, fontWeight: 700, color: '#0D2B5E' }}>K{parseFloat(o.total_amount).toFixed(2)}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ background: o.payment_status === 'success' ? '#E8FAF1' : '#FEF6E8', color: o.payment_status === 'success' ? '#2ECC71' : '#F39C12', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 700 }}>
                        {o.payment_status || 'pending'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ background: sc.bg, color: sc.color, borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
                        {o.order_status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <Link href={`/vendor/orders/${o.id}`} style={{ color: '#8892A4', display: 'flex', alignItems: 'center' }}>
                        <ArrowRight size={14} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
