'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { TrendingUp, Package, ShoppingBag, Calendar, DollarSign, ArrowRight, Clock, CheckCircle } from 'lucide-react';
import api from '@/lib/api';

export default function VendorDashboardPage() {
  const [vendor, setVendor] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/vendors/me/').then(r => setVendor(r.data)),
      api.get('/orders/vendor/').then(r => setOrders(r.data.results || r.data)),
      api.get('/bookings/vendor/').then(r => setBookings(r.data.results || r.data)),
    ]).finally(() => setLoading(false));
  }, []);

  const orderRevenue = orders.filter(o => o.order_status === 'completed').reduce((s, o) => s + parseFloat(o.total_amount || 0), 0);
  const bookingRevenue = bookings.filter(b => b.status === 'completed').reduce((s, b) => s + parseFloat(b.service_price || 0), 0);
  const totalRevenue = orderRevenue + bookingRevenue;
  const pendingOrders = orders.filter(o => o.order_status === 'placed' || o.order_status === 'processing').length;
  const completedOrders = orders.filter(o => o.order_status === 'completed').length;
  const completedBookings = bookings.filter(b => b.status === 'completed').length;

  const stats = [
    { label: 'Total Revenue', value: `K${totalRevenue.toFixed(0)}`, icon: DollarSign, color: '#2ECC71', bg: '#E8FAF1' },
    { label: 'Pending Orders', value: pendingOrders, icon: Clock, color: '#F39C12', bg: '#FEF6E8' },
    { label: 'Completed Orders', value: completedOrders, icon: CheckCircle, color: '#3498DB', bg: '#E8F4FD' },
    { label: 'Completed Bookings', value: completedBookings, icon: Calendar, color: '#9B59B6', bg: '#F3E8FD' },
  ];

  const recentOrders = orders.slice(0, 5);

  const STATUS: Record<string, { label: string; color: string; bg: string }> = {
    placed:     { label: 'Placed',     color: '#F39C12', bg: '#FEF6E8' },
    processing: { label: 'Processing', color: '#3498DB', bg: '#E8F4FD' },
    ready:      { label: 'Ready',      color: '#2ECC71', bg: '#E8FAF1' },
    completed:  { label: 'Completed',  color: '#8892A4', bg: '#F4F6FB' },
    cancelled:  { label: 'Cancelled',  color: '#E74C3C', bg: '#FDE8E8' },
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0A0F1E', marginBottom: 4 }}>
            {vendor?.name || 'Vendor Dashboard'}
          </h1>
          <p style={{ color: '#8892A4', fontSize: 14 }}>Manage your shop, products, and orders</p>
        </div>
        <Link href="/vendor/products/new" style={{
          background: '#F5A623', color: '#0D2B5E',
          borderRadius: 10, padding: '12px 24px', textDecoration: 'none',
          fontWeight: 800, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <Package size={16} /> Add Product
        </Link>
      </div>

      {loading ? (
        <div style={{ color: '#8892A4' }}>Loading...</div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32 }}>
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                style={{
                  background: '#fff', borderRadius: 16, padding: 24,
                  border: '1px solid #E8EBF2',
                  display: 'flex', alignItems: 'center', gap: 16,
                }}
              >
                <div style={{ width: 52, height: 52, borderRadius: 14, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <s.icon size={24} color={s.color} />
                </div>
                <div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0A0F1E', lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: 13, color: '#8892A4', marginTop: 4 }}>{s.label}</div>
                </div>
              </motion.div>
            ))}
          </div>

          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E8EBF2', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #E8EBF2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#0A0F1E' }}>Recent Orders</h2>
              <Link href="/vendor/orders" style={{ color: '#F5A623', fontSize: 13, fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                View all <ArrowRight size={14} />
              </Link>
            </div>
            {recentOrders.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#8892A4' }}>No orders yet</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F4F6FB' }}>
                    {['Order', 'Student', 'Items', 'Amount', 'Status', ''].map(h => (
                      <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#8892A4', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(o => {
                    const sc = STATUS[o.order_status] || { bg: '#F4F6FB', color: '#8892A4' };
                    return (
                      <tr key={o.id} style={{ borderBottom: '1px solid #E8EBF2' }}>
                        <td style={{ padding: '14px 20px', fontSize: 13, fontWeight: 700, color: '#0A0F1E' }}>
                          #{String(o.id).slice(0, 8)}
                        </td>
                        <td style={{ padding: '14px 20px', fontSize: 13, color: '#444' }}>{o.student_name || 'Student'}</td>
                        <td style={{ padding: '14px 20px', fontSize: 13, color: '#444' }}>{o.items?.length || 0}</td>
                        <td style={{ padding: '14px 20px', fontSize: 13, fontWeight: 700, color: '#0D2B5E' }}>K{parseFloat(o.total_amount).toFixed(2)}</td>
                        <td style={{ padding: '14px 20px' }}>
                          <span style={{ background: sc.bg, color: sc.color, borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
                            {o.order_status}
                          </span>
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <Link href={`/vendor/orders/${o.id}`} style={{ color: '#8892A4' }}>
                            <ArrowRight size={14} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
