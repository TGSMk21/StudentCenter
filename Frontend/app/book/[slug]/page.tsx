'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { ArrowLeft, Calendar, Clock, CheckCircle, Loader, MapPin } from 'lucide-react';

export default function BookServicePage() {
  const router = useRouter();
  const { slug } = useParams();
  const [vendor, setVendor] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [selectedService, setSelectedService] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (!u) { router.push('/login'); return; }
    fetchVendor();
  }, [slug]);

  async function fetchVendor() {
    try {
      const vRes = await api.get(`/vendors/${slug}/`);
      setVendor(vRes.data);
      const pRes = await api.get(`/products/?vendor=${vRes.data.id}&is_service=true`);
      setServices(pRes.data.results || pRes.data);
    } catch {
      setError('Vendor not found');
    } finally {
      setLoading(false);
    }
  }

  async function fetchAvailability(date: string) {
    if (!vendor) return;
    setSelectedDate(date);
    setSelectedTime('');
    try {
      const { data } = await api.get(`/bookings/availability/${vendor.id}/?date=${date}`);
      setBookedSlots(data.booked_slots || []);
    } catch {
      setBookedSlots([]);
    }
  }

  function generateTimeSlots(): string[] {
    if (!vendor) return [];
    const open = vendor.opening_time || '08:00';
    const close = vendor.closing_time || '17:00';
    const slots: string[] = [];
    let [h, m] = open.split(':').map(Number);
    const [endH] = close.split(':').map(Number);
    while (h < endH) {
      const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      if (!bookedSlots.includes(time)) slots.push(time);
      m += 30;
      if (m >= 60) { h += 1; m = 0; }
    }
    return slots;
  }

  async function handleSubmit() {
    if (!selectedService || !selectedDate || !selectedTime) return;
    setSubmitting(true);
    setError('');
    try {
      await api.post('/bookings/create/', {
        vendor: vendor.id,
        service: selectedService,
        slot_date: selectedDate,
        slot_time: selectedTime,
        notes,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.response?.data?.non_field_errors?.[0] || 'Booking failed. Try another time slot.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#F4F6FB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#8892A4' }}>Loading...</div>
    </div>
  );

  if (error && !vendor) return (
    <div style={{ minHeight: '100vh', background: '#F4F6FB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>404</div>
        <div style={{ color: '#8892A4', marginBottom: 20 }}>Vendor not found</div>
        <Link href="/vendors" style={{ color: '#F5A623', fontWeight: 700 }}>Browse Vendors</Link>
      </div>
    </div>
  );

  if (success) return (
    <div style={{ minHeight: '100vh', background: '#F4F6FB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: 'center', background: '#fff', borderRadius: 24, padding: 48, border: '1px solid #E8EBF2', maxWidth: 400 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#E8FAF1', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <CheckCircle size={32} color="#2ECC71" />
        </div>
        <h2 style={{ fontWeight: 900, fontSize: '1.3rem', color: '#0A0F1E', marginBottom: 8 }}>Booking Confirmed!</h2>
        <p style={{ color: '#8892A4', marginBottom: 24 }}>Your service has been booked. Check your bookings for the confirmation code.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button onClick={() => router.push('/bookings')} style={{ background: '#0D2B5E', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 24px', fontWeight: 700, cursor: 'pointer' }}>
            View My Bookings
          </button>
          <button onClick={() => { setSuccess(false); setSelectedService(''); setSelectedDate(''); setSelectedTime(''); setNotes(''); }} style={{ background: '#F4F6FB', color: '#444', border: '1px solid #E8EBF2', borderRadius: 10, padding: '12px 24px', fontWeight: 700, cursor: 'pointer' }}>
            Book Another
          </button>
        </div>
      </motion.div>
    </div>
  );

  const timeSlots = generateTimeSlots();

  return (
    <div style={{ minHeight: '100vh', background: '#F4F6FB' }}>
      <nav style={{ background: '#fff', borderBottom: '2px solid #F5A623', padding: '0 5%', boxShadow: '0 2px 20px rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16, height: 68 }}>
          <button onClick={() => router.back()} style={{ background: '#F4F6FB', border: '1px solid #E8EBF2', borderRadius: 10, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ArrowLeft size={18} color="#0D2B5E" />
          </button>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#0A0F1E' }}>{vendor?.name}</div>
            <div style={{ fontSize: 12, color: '#8892A4' }}>Book a Service</div>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 900, margin: '32px auto', padding: '0 5%' }}>
        {/* Vendor info */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E8EBF2', padding: 20, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#F4F6FB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
            {vendor.category === 'salon' ? '💇' : vendor.category === 'tech_store' ? '💻' : vendor.category === 'pharmacy' ? '💊' : '🖨️'}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#0A0F1E' }}>{vendor.name}</div>
            {vendor.location_notes && (
              <div style={{ fontSize: 12, color: '#8892A4', display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={12} /> {vendor.location_notes}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* LEFT COLUMN: Service + Date */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Service selection */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E8EBF2', padding: 20 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: '#8892A4', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Select Service</h3>
              {services.length === 0 ? (
                <div style={{ color: '#8892A4', fontSize: 13 }}>No bookable services available</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {services.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedService(s.id)}
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '12px 16px', borderRadius: 10, cursor: 'pointer',
                        border: `2px solid ${selectedService === s.id ? '#0D2B5E' : '#E8EBF2'}`,
                        background: selectedService === s.id ? '#F4F6FB' : '#fff',
                        transition: 'all 0.2s', textAlign: 'left', width: '100%',
                      }}
                    >
                      <span style={{ fontWeight: 600, fontSize: 14, color: '#0A0F1E' }}>{s.name}</span>
                      <span style={{ fontWeight: 900, fontSize: 14, color: '#0D2B5E' }}>K{parseFloat(s.effective_price || s.price).toFixed(2)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Date selection */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E8EBF2', padding: 20 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: '#8892A4', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Select Date</h3>
              <input
                type="date"
                value={selectedDate}
                onChange={e => fetchAvailability(e.target.value)}
                min={today}
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: 10,
                  border: '2px solid #E8EBF2', fontSize: 14, fontWeight: 600,
                  color: '#0A0F1E', background: '#fff',
                  outline: 'none', cursor: 'pointer',
                }}
              />
            </div>
          </div>

          {/* RIGHT COLUMN: Time slots */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E8EBF2', padding: 20 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#8892A4', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
              Select Time {selectedDate && <span style={{ color: '#0A0F1E' }}>· {timeSlots.length} available</span>}
            </h3>
            {!selectedDate ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#8892A4', fontSize: 13 }}>
                <Calendar size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
                <p>Pick a date first</p>
              </div>
            ) : timeSlots.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#8892A4', fontSize: 13 }}>
                <Clock size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
                <p>No available slots on this date</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {timeSlots.map(t => (
                  <button
                    key={t}
                    onClick={() => setSelectedTime(t)}
                    style={{
                      padding: '10px 8px', borderRadius: 10, cursor: 'pointer',
                      border: `2px solid ${selectedTime === t ? '#0D2B5E' : '#E8EBF2'}`,
                      background: selectedTime === t ? '#F4F6FB' : '#fff',
                      fontWeight: 700, fontSize: 13, color: selectedTime === t ? '#0D2B5E' : '#444',
                      transition: 'all 0.2s', textAlign: 'center',
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E8EBF2', padding: 20, marginTop: 20 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: '#8892A4', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Notes (optional)</h3>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Any special requests..."
            rows={2}
            style={{
              width: '100%', padding: '12px 16px', borderRadius: 10,
              border: '2px solid #E8EBF2', fontSize: 14, color: '#0A0F1E',
              outline: 'none', resize: 'vertical', fontFamily: 'inherit',
            }}
          />
        </div>

        {error && (
          <div style={{ marginTop: 16, padding: '12px 16px', background: '#FDE8E8', color: '#E74C3C', borderRadius: 10, fontSize: 13, fontWeight: 600 }}>
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!selectedService || !selectedDate || !selectedTime || submitting}
          style={{
            width: '100%', marginTop: 20, padding: '16px', borderRadius: 12,
            border: 'none', fontSize: 15, fontWeight: 800, cursor: 'pointer',
            background: !selectedService || !selectedDate || !selectedTime || submitting ? '#E8EBF2' : '#0D2B5E',
            color: !selectedService || !selectedDate || !selectedTime || submitting ? '#8892A4' : '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'all 0.2s',
          }}
        >
          {submitting ? <Loader size={18} className="spin" /> : <Calendar size={18} />}
          {submitting ? 'Booking...' : 'Confirm Booking'}
        </button>
      </div>
    </div>
  );
}
