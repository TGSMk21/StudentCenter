'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Mail, Hash, Phone, LogOut, ShoppingBag, Calendar, Bell, ChevronRight, Shield } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (!u) { router.push('/login'); return; }
    setUser(JSON.parse(u));
  }, []);

  function logout() { localStorage.clear(); router.push('/login'); }

  const initials = user?.name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() || 'S';

  const menuItems = [
    { icon: ShoppingBag, label: 'My Orders',    sub: 'View order history',           href: '/orders'   },
    { icon: Calendar,    label: 'My Bookings',  sub: 'Salon, tech, health bookings', href: '/bookings' },
    { icon: Bell,        label: 'Notifications',sub: 'Alerts and updates',           href: '/dashboard'},
    { icon: Shield,      label: 'Security',     sub: 'Password and account security',href: '/dashboard'},
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#F4F6FB', fontFamily: "'DM Sans', Inter, sans-serif" }}>
      <nav style={{ background: '#fff', borderBottom: '2px solid #F5A623', padding: '0 5%', boxShadow: '0 2px 20px rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16, height: 68 }}>
          <button onClick={() => router.back()} style={{ background: '#F4F6FB', border: '1px solid #E8EBF2', borderRadius: 10, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ArrowLeft size={18} color="#0D2B5E" />
          </button>
          <h1 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0A0F1E' }}>My Profile</h1>
          <Link href="/dashboard" style={{ marginLeft: 'auto', color: '#8892A4', fontSize: 13, textDecoration: 'none' }}>Dashboard</Link>
        </div>
      </nav>

      <div style={{ maxWidth: 700, margin: '32px auto', padding: '0 5%' }}>

        {/* Avatar Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'linear-gradient(135deg, #0D2B5E, #1B3A6B)',
            borderRadius: 20, padding: 32, marginBottom: 20,
            display: 'flex', alignItems: 'center', gap: 24, position: 'relative', overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', top: -30, right: -30, width: 150, height: 150, borderRadius: '50%', background: 'rgba(245,166,35,0.08)' }} />
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#F5A623', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 28, color: '#0D2B5E', flexShrink: 0 }}>
            {initials}
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: 900, fontSize: 22, marginBottom: 4 }}>{user?.name}</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 8 }}>{user?.email}</div>
            <div style={{ background: 'rgba(245,166,35,0.2)', border: '1px solid rgba(245,166,35,0.3)', borderRadius: 6, padding: '3px 12px', display: 'inline-block', color: '#F5A623', fontSize: 12, fontWeight: 700 }}>
              {user?.student_id || 'Student'}
            </div>
          </div>
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ background: '#fff', borderRadius: 20, border: '1px solid #E8EBF2', overflow: 'hidden', marginBottom: 20 }}
        >
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #E8EBF2', fontWeight: 800, fontSize: 14, color: '#0A0F1E' }}>Account Details</div>
          {[
            { icon: User,  label: 'Full Name',   value: user?.name       },
            { icon: Mail,  label: 'Email',        value: user?.email      },
            { icon: Hash,  label: 'Student ID',   value: user?.student_id },
            { icon: Phone, label: 'Role',         value: user?.role       },
          ].map((item, i) => (
            <div key={item.label} style={{ padding: '16px 24px', borderBottom: i < 3 ? '1px solid #E8EBF2' : 'none', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#F4F6FB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <item.icon size={16} color="#8892A4" />
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#8892A4', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>{item.label}</div>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#0A0F1E' }}>{item.value || 'Not set'}</div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Menu */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ background: '#fff', borderRadius: 20, border: '1px solid #E8EBF2', overflow: 'hidden', marginBottom: 20 }}
        >
          {menuItems.map((item, i) => (
            <Link key={item.label} href={item.href} style={{ textDecoration: 'none' }}>
              <div style={{ padding: '16px 24px', borderBottom: i < menuItems.length - 1 ? '1px solid #E8EBF2' : 'none', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#F4F6FB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <item.icon size={16} color="#0D2B5E" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#0A0F1E', marginBottom: 2 }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: '#8892A4' }}>{item.sub}</div>
                </div>
                <ChevronRight size={16} color="#8892A4" />
              </div>
            </Link>
          ))}
        </motion.div>

        {/* Logout */}
        <button
          onClick={logout}
          style={{
            width: '100%', padding: '16px', background: '#fff',
            border: '2px solid #E74C3C33', borderRadius: 16,
            color: '#E74C3C', fontWeight: 800, fontSize: 15,
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 8,
          }}
        >
          <LogOut size={18} /> Sign Out
        </button>
      </div>
    </div>
  );
}
