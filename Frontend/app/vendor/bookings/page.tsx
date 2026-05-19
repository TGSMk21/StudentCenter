'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import api from '@/lib/api';

const STATUS: Record<string, { color: string; bg: string }> = {
  confirmed: { color: '#2ECC71', bg: '#E8FAF1' },
  pending:   { color: '#F39C12', bg: '#FEF6E8' },
  cancelled: { color: '#E74C3C', bg: '#FDE8E8' },
  completed: { color: '#8892A4', bg: '#F4F6FB' },
};

export default function VendorBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/bookings/vendor/').then(r => {
      setBookings(r.data.results || r.data);
    }).finally(() => setLoading(false));
  }, []);

  async function updateStatus(id: string, status: string) {
    try {
      await api.patch(`/bookings/${id}/status/`, { status });
      setBookings(b => b.map(x => x.id === id ? { ...x, status } : x));
    } catch {}
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0A0F1E', marginBottom: 4 }}>Bookings</h1>
        <p style={{ color: '#8892A4', fontSize: 14 }}>{bookings.length} total bookings</p>
      </div>

      {loading ? (
        <div style={{ color: '#8892A4' }}>Loading...</div>
      ) : bookings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#8892A4' }}>
          <Calendar size={48} style={{ marginBottom: 12, opacity: 0.3 }} />
          <p>No bookings yet</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {bookings.map(b => {
            const sc = STATUS[b.status] || { bg: '#F4F6FB', color: '#8892A4' };
            return (
              <div key={b.id} style={{ background: '#fff', borderRadius: 16, border: '1px solid #E8EBF2', padding: 20, display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: sc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Calendar size={22} color={sc.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#0A0F1E', marginBottom: 2 }}>
                        {b.service_name || 'Service'} — {b.student_name || 'Student'}
                      </div>
                      <div style={{ fontSize: 13, color: '#8892A4' }}>
                        {b.slot_date} at {b.slot_time} · {b.confirmation_code}
                      </div>
                    </div>
                    <span style={{ background: sc.bg, color: sc.color, borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                      {b.status}
                    </span>
                  </div>
                  {b.notes && <div style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>Note: {b.notes}</div>}
                  <div style={{ display: 'flex', gap: 8 }}>
                    {b.status === 'pending' && (
                      <>
                        <button onClick={() => updateStatus(b.id, 'confirmed')} style={{ padding: '6px 16px', background: '#E8FAF1', color: '#2ECC71', border: '1px solid #2ECC71', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                          Confirm
                        </button>
                        <button onClick={() => updateStatus(b.id, 'cancelled')} style={{ padding: '6px 16px', background: '#FDE8E8', color: '#E74C3C', border: '1px solid #E74C3C', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                          Decline
                        </button>
                      </>
                    )}
                    {b.status === 'confirmed' && (
                      <button onClick={() => updateStatus(b.id, 'completed')} style={{ padding: '6px 16px', background: '#E8F4FD', color: '#3498DB', border: '1px solid #3498DB', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                        Mark Completed
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
