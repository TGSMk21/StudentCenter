'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Eye, EyeOff, ShoppingBag, ArrowRight, Mail, Lock, User, Phone, Store, MapPin, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

const CATEGORIES = [
  { value: 'fast_food', label: 'Fast Food Restaurant' },
  { value: 'minimart', label: 'Minimart' },
  { value: 'salon', label: 'Hair Salon' },
  { value: 'general_dealers', label: 'General Dealers' },
  { value: 'tech_store', label: 'Tech Store' },
  { value: 'pharmacy', label: 'Pharmacy' },
  { value: 'butchery', label: 'Butchery' },
  { value: 'other', label: 'Other' },
];

export default function VendorRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirm: '',
    shop_name: '', category: '', description: '', contact_email: '',
    contact_phone: '', location_notes: '', opening_time: '', closing_time: '',
    has_bookable_services: false,
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  const update = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      await api.post('/auth/register/vendor/', {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        password: form.password,
        password_confirm: form.confirm,
        shop_name: form.shop_name.trim(),
        category: form.category,
        description: form.description.trim(),
        contact_email: form.contact_email.trim() || form.email.trim().toLowerCase(),
        contact_phone: form.contact_phone.trim() || form.phone.trim(),
        location_notes: form.location_notes.trim(),
        opening_time: form.opening_time || null,
        closing_time: form.closing_time || null,
        has_bookable_services: form.has_bookable_services,
      });
      router.push('/login?registered=1');
    } catch (err: any) {
      const d = err.response?.data;
      setError(typeof d === 'string' ? d : d?.detail || Object.values(d || {}).flat().join(' ') || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = { width: '100%', padding: '13px 14px 13px 40px', border: '2px solid #E8EBF2', borderRadius: 10, fontSize: 14, color: '#0A0F1E', background: '#fff', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr', fontFamily: "'DM Sans', Inter, sans-serif" }}>
      {/* LEFT */}
      <div style={{
        background: 'linear-gradient(135deg, #0D2B5E 0%, #1B3A6B 100%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 60, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(245,166,35,0.06)' }} />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          style={{ textAlign: 'center', zIndex: 1 }}
        >
          <div style={{ color: '#F5A623', fontWeight: 900, fontSize: 28, marginBottom: 4 }}>SCHub</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 40 }}>Vendor Registration</div>
          <h2 style={{ color: '#fff', fontWeight: 800, fontSize: 24, marginBottom: 32, lineHeight: 1.3 }}>Start selling on campus</h2>
          {[
            'List your products for free',
            'Reach thousands of MU students',
            'Accept mobile money & card payments',
            'Manage orders and bookings easily',
          ].map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, textAlign: 'left' }}>
              <CheckCircle size={18} color="#F5A623" style={{ flexShrink: 0 }} />
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>{f}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* RIGHT */}
      <div style={{
        background: '#F4F6FB', display: 'flex',
        alignItems: 'center', justifyContent: 'center', padding: '40px 60px',
        overflowY: 'auto',
      }}>
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          style={{ width: '100%', maxWidth: 480 }}
        >
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0A0F1E', marginBottom: 8 }}>Open your shop</h1>
            <p style={{ color: '#8892A4', fontSize: 14 }}>Register your vendor account</p>
          </div>

          {/* Step indicator */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            {[1, 2].map(s => (
              <div key={s} style={{
                flex: 1, height: 4, borderRadius: 2,
                background: step >= s ? '#F5A623' : '#E8EBF2',
                transition: 'background 0.3s',
              }} />
            ))}
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ background: '#FDE8E8', border: '1px solid #E74C3C44', borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, color: '#C0392B', fontSize: 13 }}
            >
              <AlertCircle size={15} /> {error}
            </motion.div>
          )}

          <form onSubmit={handleRegister}>
            {step === 1 && (
              <>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0A0F1E', marginBottom: 7, textTransform: 'uppercase', letterSpacing: 0.5 }}>Your Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={15} color="#8892A4" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                    <input type="text" value={form.name} onChange={e => update('name', e.target.value)} placeholder="e.g. Daniel Mwale" required style={inputStyle} />
                  </div>
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0A0F1E', marginBottom: 7, textTransform: 'uppercase', letterSpacing: 0.5 }}>Email</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={15} color="#8892A4" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                    <input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="vendor@mu.ac.zm" required style={inputStyle} />
                  </div>
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0A0F1E', marginBottom: 7, textTransform: 'uppercase', letterSpacing: 0.5 }}>Phone (optional)</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={15} color="#8892A4" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                    <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+260 97 123 4567" style={inputStyle} />
                  </div>
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0A0F1E', marginBottom: 7, textTransform: 'uppercase', letterSpacing: 0.5 }}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} color="#8892A4" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                    <input type={showPw ? 'text' : 'password'} value={form.password} onChange={e => update('password', e.target.value)} placeholder="Min 6 characters" required style={{ ...inputStyle, paddingRight: 44 }} />
                    <button type="button" onClick={() => setShowPw(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#8892A4' }}>
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0A0F1E', marginBottom: 7, textTransform: 'uppercase', letterSpacing: 0.5 }}>Confirm Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} color="#8892A4" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                    <input type="password" value={form.confirm} onChange={e => update('confirm', e.target.value)} placeholder="Re-enter password" required style={inputStyle} />
                    <button type="button" onClick={() => setShowPw(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#8892A4' }}>
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                <button type="button" onClick={() => setStep(2)} style={{
                  width: '100%', padding: '15px', background: '#0D2B5E', color: '#fff',
                  border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 800,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}>
                  Next: Shop Details <ArrowRight size={16} />
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0A0F1E', marginBottom: 7, textTransform: 'uppercase', letterSpacing: 0.5 }}>Shop Name</label>
                  <div style={{ position: 'relative' }}>
                    <Store size={15} color="#8892A4" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                    <input type="text" value={form.shop_name} onChange={e => update('shop_name', e.target.value)} placeholder="e.g. Mwale's Fast Food" required style={inputStyle} />
                  </div>
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0A0F1E', marginBottom: 7, textTransform: 'uppercase', letterSpacing: 0.5 }}>Category</label>
                  <select value={form.category} onChange={e => update('category', e.target.value)} required style={{ width: '100%', padding: '13px 14px', border: '2px solid #E8EBF2', borderRadius: 10, fontSize: 14, background: '#fff', outline: 'none', boxSizing: 'border-box' }}>
                    <option value="">Select your shop category</option>
                    {CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0A0F1E', marginBottom: 7, textTransform: 'uppercase', letterSpacing: 0.5 }}>Description</label>
                  <textarea value={form.description} onChange={e => update('description', e.target.value)} placeholder="Tell students about your shop..." rows={3} style={{ width: '100%', padding: '13px 14px', border: '2px solid #E8EBF2', borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit', background: '#fff' }} />
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0A0F1E', marginBottom: 7, textTransform: 'uppercase', letterSpacing: 0.5 }}>Location</label>
                  <div style={{ position: 'relative' }}>
                    <MapPin size={15} color="#8892A4" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                    <input type="text" value={form.location_notes} onChange={e => update('location_notes', e.target.value)} placeholder="e.g. Student Center, Room 12" style={inputStyle} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0A0F1E', marginBottom: 7, textTransform: 'uppercase', letterSpacing: 0.5 }}>Opening Time</label>
                    <div style={{ position: 'relative' }}>
                      <Clock size={15} color="#8892A4" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                      <input type="time" value={form.opening_time} onChange={e => update('opening_time', e.target.value)} style={{ ...inputStyle, padding: '13px 14px 13px 40px' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0A0F1E', marginBottom: 7, textTransform: 'uppercase', letterSpacing: 0.5 }}>Closing Time</label>
                    <div style={{ position: 'relative' }}>
                      <Clock size={15} color="#8892A4" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                      <input type="time" value={form.closing_time} onChange={e => update('closing_time', e.target.value)} style={{ ...inputStyle, padding: '13px 14px 13px 40px' }} />
                    </div>
                  </div>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, marginBottom: 24 }}>
                  <input type="checkbox" checked={form.has_bookable_services} onChange={e => update('has_bookable_services', e.target.checked)} style={{ width: 18, height: 18 }} />
                  I offer bookable services (salon, tech, health appointments)
                </label>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button type="button" onClick={() => setStep(1)} style={{
                    padding: '15px 24px', background: '#fff', color: '#0D2B5E',
                    border: '2px solid #E8EBF2', borderRadius: 10, fontSize: 15, fontWeight: 700,
                    cursor: 'pointer',
                  }}>
                    Back
                  </button>
                  <button type="submit" disabled={loading} style={{
                    flex: 1, padding: '15px', background: loading ? '#8892A4' : '#F5A623', color: '#0D2B5E',
                    border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 800,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}>
                    <Store size={16} /> {loading ? 'Registering...' : 'Open My Shop'}
                  </button>
                </div>
              </>
            )}
          </form>

          <div style={{ marginTop: 20, textAlign: 'center', color: '#8892A4', fontSize: 14 }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#F5A623', fontWeight: 700, textDecoration: 'none' }}>
              Sign in <ArrowRight size={13} style={{ display: 'inline', verticalAlign: 'middle' }} />
            </Link>
          </div>
          <div style={{ textAlign: 'center', color: '#8892A4', fontSize: 13, marginTop: 10 }}>
            <Link href="/register" style={{ color: '#8892A4', textDecoration: 'none' }}>Register as a student instead</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
