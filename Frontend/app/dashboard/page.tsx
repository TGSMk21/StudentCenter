'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import {
  ShoppingBag, Calendar, Bell, LogOut, ChevronRight,
  Package, Clock, CheckCircle, AlertCircle, TrendingUp,
  ShoppingCart, User, Home, Receipt, Settings
} from 'lucide-react';


const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  placed:      { bg: '#FEF6E8', color: '#F39C12' },
  processing:  { bg: '#E8F4FD', color: '#3498DB' },
  ready:       { bg: '#E8FAF1', color: '#2ECC71' },
  completed:   { bg: '#F4F6FB', color: '#8892A4' },
  cancelled:   { bg: '#FDE8E8', color: '#E74C3C' },
};

export default function DashboardPage() {
  const router = useRouter();
  const [user,      setUser]      = useState<any>(null);
  const [orders,    setOrders]    = useState<any[]>([]);
  const [bookings,  setBookings]  = useState<any[]>([]);
  const [notifs,    setNotifs]    = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (!u) { router.push('/login'); return; }
    setUser(JSON.parse(u));
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [oRes, bRes, nRes] = await Promise.all([
        api.get('/orders/'),
        api.get('/bookings/'),
        api.get('/notifications/'),
      ]);
      setOrders(oRes.data.results || oRes.data);
      setBookings(bRes.data.results || bRes.data);
      setNotifs(nRes.data.results || nRes.data);
    } catch {
    } finally {
      setLoading(false);
    }
  }

  function logout() { localStorage.clear(); router.push('/login'); }

  const totalSpent = orders.filter(o => o.payment_status === 'success').reduce((s, o) => s + parseFloat(o.total_amount || 0), 0);
  const unread     = notifs.filter(n => !n.is_read).length;
  const initials   = user?.name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() || 'S';

  const navItems = [
    { label: 'Dashboard', icon: Home,        href: '/dashboard', active: true  },
    { label: 'Shop',      icon: ShoppingBag, href: '/vendors',   active: false },
    { label: 'Orders',    icon: Receipt,     href: '/orders',    active: false },
    { label: 'Bookings',  icon: Calendar,    href: '/bookings',  active: false },
    { label: 'Profile',   icon: User,        href: '/profile',   active: false },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#F4F6FB', fontFamily: "'DM Sans', Inter, sans-serif", display: 'flex' }}>

      {/* SIDEBAR */}
      <aside style={{
        width: 240, background: '#0D2B5E',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 100,
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div>
              <div style={{ color: '#F5A623', fontWeight: 900, fontSize: 16 }}>SCHub</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 9, letterSpacing: 1 }}>STUDENT CENTER</div>
            </div>
          </Link>
        </div>

        {/* User card */}
        <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#F5A623', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 16, color: '#0D2B5E', flexShrink: 0 }}>
              {initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>{user?.student_id || 'Student'}</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px' }}>
          {navItems.map(item => (
            <Link key={item.label} href={item.href} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '11px 12px', borderRadius: 10, marginBottom: 4,
                background: item.active ? 'rgba(245,166,35,0.15)' : 'transparent',
                borderLeft: item.active ? '3px solid #F5A623' : '3px solid transparent',
                transition: 'all 0.2s',
              }}>
                <item.icon size={18} color={item.active ? '#F5A623' : 'rgba(255,255,255,0.5)'} />
                <span style={{ color: item.active ? '#F5A623' : 'rgba(255,255,255,0.6)', fontWeight: item.active ? 700 : 500, fontSize: 14 }}>
                  {item.label}
                </span>
                {item.label === 'Orders' && orders.filter(o => o.order_status === 'ready').length > 0 && (
                  <div style={{ marginLeft: 'auto', background: '#F5A623', color: '#0D2B5E', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900 }}>
                    {orders.filter(o => o.order_status === 'ready').length}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button onClick={logout} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 12,
            padding: '11px 12px', borderRadius: 10, background: 'none', border: 'none',
            cursor: 'pointer', color: 'rgba(255,255,255,0.5)', fontSize: 14,
          }}>
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ marginLeft: 240, flex: 1, padding: '32px 40px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0A0F1E', marginBottom: 4 }}>
              Hey, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p style={{ color: '#8892A4', fontSize: 14 }}>Welcome to your SCHub dashboard</p>
          </div>
          <Link href="/vendors" style={{
            background: '#F5A623', color: '#0D2B5E',
            borderRadius: 10, padding: '12px 24px', textDecoration: 'none',
            fontWeight: 800, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <ShoppingBag size={16} /> Start Shopping
          </Link>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32 }}>
          {[
            { label: 'Total Orders',   value: orders.length,   icon: Package,     color: '#1B3A6B', bg: '#E8F0FF' },
            { label: 'Total Spent',    value: `K${totalSpent.toFixed(0)}`, icon: TrendingUp, color: '#F5A623', bg: '#FEF6E8' },
            { label: 'Bookings',       value: bookings.length, icon: Calendar,    color: '#2ECC71', bg: '#E8FAF1' },
            { label: 'Notifications',  value: unread,          icon: Bell,        color: '#E74C3C', bg: '#FDE8E8' },
          ].map((s, i) => (
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

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>

          {/* Recent Orders */}
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E8EBF2', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #E8EBF2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#0A0F1E' }}>Recent Orders</h2>
              <Link href="/orders" style={{ color: '#F5A623', fontSize: 13, fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                View all <ChevronRight size={14} />
              </Link>
            </div>
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#8892A4' }}>Loading...</div>
            ) : orders.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
                <div style={{ color: '#8892A4', marginBottom: 16 }}>No orders yet</div>
                <Link href="/vendors" style={{ color: '#F5A623', fontWeight: 700, textDecoration: 'none' }}>Start shopping</Link>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F4F6FB' }}>
                    {['Order', 'Vendor', 'Amount', 'Status', ''].map(h => (
                      <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#8892A4', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 6).map((o, i) => {
                    const sc = STATUS_COLORS[o.order_status] || { bg: '#F4F6FB', color: '#8892A4' };
                    return (
                      <tr key={o.id} style={{ borderBottom: '1px solid #E8EBF2' }}>
                        <td style={{ padding: '14px 20px', fontSize: 13, fontWeight: 700, color: '#0A0F1E' }}>
                          #{String(o.id).slice(0, 8)}
                        </td>
                        <td style={{ padding: '14px 20px', fontSize: 13, color: '#444' }}>{o.vendor_name}</td>
                        <td style={{ padding: '14px 20px', fontSize: 13, fontWeight: 700, color: '#0D2B5E' }}>K{parseFloat(o.total_amount).toFixed(2)}</td>
                        <td style={{ padding: '14px 20px' }}>
                          <span style={{ background: sc.bg, color: sc.color, borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
                            {o.order_status}
                          </span>
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <ChevronRight size={14} color="#8892A4" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Notifications */}
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E8EBF2', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #E8EBF2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#0A0F1E' }}>Notifications</h2>
              {unread > 0 && (
                <span style={{ background: '#E74C3C', color: '#fff', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900 }}>
                  {unread}
                </span>
              )}
            </div>
            {notifs.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: '#8892A4', fontSize: 14 }}>No notifications</div>
            ) : (
              notifs.slice(0, 6).map((n, i) => (
                <div key={n.id} style={{
                  padding: '14px 20px', borderBottom: '1px solid #E8EBF2',
                  background: n.is_read ? '#fff' : '#F8F9FF',
                  display: 'flex', gap: 12, alignItems: 'flex-start',
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.is_read ? '#E8EBF2' : '#F5A623', marginTop: 6, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: n.is_read ? 500 : 700, color: '#0A0F1E', marginBottom: 2 }}>{n.title}</div>
                    <div style={{ fontSize: 12, color: '#8892A4', lineHeight: 1.5 }}>{n.message}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
