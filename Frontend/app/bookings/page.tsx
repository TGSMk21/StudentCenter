'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, Calendar, Clock, CheckCircle, XCircle, ChevronRight, Plus } from 'lucide-react';

const STATUS: Record<string, { color: string; bg: string }> = {
  confirmed: { color: '#2ECC71', bg: '#E8FAF1' },
  pending:   { color: '#F39C12', bg: '#FEF6E8' },
  cancelled: { color: '#E74C3C', bg: '#FDE8E8' },
  completed: { color: '#8892A4', bg: '#F4F6FB' },
};

export default function BookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (!u) { router.push('/login'); return; }
    fetchBookings();
  }, []);

  async function fetchBookings() {
    try {
      const { data } = await api.get('/bookings/');
      setBookings(data.results || data);
    } catch {
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F4F6FB', fontFamily: "'DM Sans', Inter, sans-serif" }}>
      <nav style={{ background: '#fff', borderBottom: '2px solid #F5A623', padding: '0 5%', boxShadow: '0 2px 20px rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16, height: 68 }}>
          <button onClick={() => router.back()} style={{ background: '#F4F6FB', border: '1px solid #E8EBF2', borderRadius: 10, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ArrowLeft size={18} color="#0D2B5E" />
          </button>
          <h1 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0A0F1E' }}>My Bookings</h1>
          <Link href="/vendors" style={{ marginLeft: 'auto', background: '#F5A623', color: '#0D2B5E', borderRadius: 10, padding: '8px 18px', textDecoration: 'none', fontWeight: 800, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus size={15} /> New Booking
          </Link>
        </div>
      </nav>

      <div style={{ maxWidth: 900, margin: '32px auto', padding: '0 5%' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#8892A4' }}>Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 20, padding: 60, textAlign: 'center', border: '1px solid #E8EBF2' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📅</div>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#0A0F1E', marginBottom: 8 }}>No bookings yet</div>
            <div style={{ color: '#8892A4', marginBottom: 24 }}>Book salon, tech repair, or health services.</div>
            <Link href="/vendors" style={{ background: '#F5A623', color: '#0D2B5E', borderRadius: 10, padding: '12px 24px', textDecoration: 'none', fontWeight: 800 }}>
              Browse Services
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {bookings.map((b, i) => {
              const sc = STATUS[b.status] || STATUS.pending;
              return (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  style={{
                    background: '#fff', borderRadius: 16,
                    border: `1.5px solid ${sc.color}33`, padding: '20px 24px',
                    display: 'flex', alignItems: 'center', gap: 20,
                  }}
                >
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: sc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                    📅
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <span style={{ fontWeight: 800, fontSize: 15, color: '#0A0F1E' }}>{b.service_name}</span>
                      <span style={{ background: sc.bg, color: sc.color, borderRadius: 6, padding: '2px 10px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
                        {b.status}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: '#8892A4', display: 'flex', gap: 16 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Calendar size={13} /> {b.slot_date}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={13} /> {b.slot_time}
                      </span>
                      <span>{b.vendor_name}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 11, color: '#8892A4', marginBottom: 4 }}>Confirmation</div>
                    <div style={{ fontWeight: 800, fontSize: 13, color: '#0D2B5E' }}>{b.confirmation_code}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
