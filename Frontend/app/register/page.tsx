'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Eye, EyeOff, ShoppingBag, ArrowRight, Mail, Lock, User, Hash, AlertCircle, CheckCircle } from 'lucide-react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', student_id: '', password: '', confirm: '' });
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const update = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      await api.post('/auth/register/', {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        student_id: form.student_id.trim(),
        password: form.password,
        password_confirm: form.confirm,
      });
      router.push('/login?registered=1');
    } catch (err: any) {
      const d = err.response?.data;
      setError(typeof d === 'string' ? d : d?.detail || Object.values(d || {}).flat().join(' ') || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  }

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
          <div style={{ position: 'relative', width: 90, height: 90, margin: '0 auto 20px' }}>
            <Image src="/logo.webp" alt="MU" fill style={{ objectFit: 'contain', mixBlendMode: 'luminosity', filter: 'brightness(2)' }} />
          </div>
          <div style={{ color: '#F5A623', fontWeight: 900, fontSize: 28, marginBottom: 4 }}>SCHub</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 40 }}>
            Student Center Hub
          </div>

          <h2 style={{ color: '#fff', fontWeight: 800, fontSize: 24, marginBottom: 32, lineHeight: 1.3 }}>
            Join thousands of<br />MU students
          </h2>

          {[
            'Order from 7 campus vendors',
            'Book services online instantly',
            'Pay with mobile money or card',
            'Real-time order notifications',
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
          style={{ width: '100%', maxWidth: 420 }}
        >
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0A0F1E', marginBottom: 8 }}>Create your account</h1>
            <p style={{ color: '#8892A4', fontSize: 14 }}>Register with your student details</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: '#FDE8E8', border: '1px solid #E74C3C44',
                borderRadius: 10, padding: '12px 16px', marginBottom: 20,
                display: 'flex', alignItems: 'center', gap: 10,
                color: '#C0392B', fontSize: 13,
              }}
            >
              <AlertCircle size={15} /> {error}
            </motion.div>
          )}

          <form onSubmit={handleRegister}>
            {/* Full Name */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0A0F1E', marginBottom: 7, textTransform: 'uppercase', letterSpacing: 0.5 }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={15} color="#8892A4" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  value={form.name}
                  onChange={e => update('name', e.target.value)}
                  placeholder="e.g. Daniel Mwale"
                  required
                  style={{ width: '100%', padding: '13px 14px 13px 40px', border: '2px solid #E8EBF2', borderRadius: 10, fontSize: 14, color: '#0A0F1E', background: '#fff', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                  onFocus={e => e.target.style.borderColor = '#F5A623'}
                  onBlur={e => e.target.style.borderColor = '#E8EBF2'}
                />
              </div>
            </div>
            {/* Email */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0A0F1E', marginBottom: 7, textTransform: 'uppercase', letterSpacing: 0.5 }}>Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} color="#8892A4" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => update('email', e.target.value)}
                  placeholder="student@mu.ac.zm"
                  required
                  style={{ width: '100%', padding: '13px 14px 13px 40px', border: '2px solid #E8EBF2', borderRadius: 10, fontSize: 14, color: '#0A0F1E', background: '#fff', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                  onFocus={e => e.target.style.borderColor = '#F5A623'}
                  onBlur={e => e.target.style.borderColor = '#E8EBF2'}
                />
              </div>
            </div>
            {/* Student ID */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0A0F1E', marginBottom: 7, textTransform: 'uppercase', letterSpacing: 0.5 }}>Student ID</label>
              <div style={{ position: 'relative' }}>
                <Hash size={15} color="#8892A4" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  value={form.student_id}
                  onChange={e => update('student_id', e.target.value)}
                  placeholder="e.g. MU/2024/001"
                  required
                  style={{ width: '100%', padding: '13px 14px 13px 40px', border: '2px solid #E8EBF2', borderRadius: 10, fontSize: 14, color: '#0A0F1E', background: '#fff', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                  onFocus={e => e.target.style.borderColor = '#F5A623'}
                  onBlur={e => e.target.style.borderColor = '#E8EBF2'}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0A0F1E', marginBottom: 7, textTransform: 'uppercase', letterSpacing: 0.5 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} color="#8892A4" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => update('password', e.target.value)}
                  placeholder="Min 6 characters"
                  required
                  style={{ width: '100%', padding: '13px 44px 13px 40px', border: '2px solid #E8EBF2', borderRadius: 10, fontSize: 14, color: '#0A0F1E', background: '#fff', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                  onFocus={e => e.target.style.borderColor = '#F5A623'}
                  onBlur={e => e.target.style.borderColor = '#E8EBF2'}
                />
                <button type="button" onClick={() => setShowPw(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#8892A4' }}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Confirm */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0A0F1E', marginBottom: 7, textTransform: 'uppercase', letterSpacing: 0.5 }}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} color="#8892A4" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  value={form.confirm}
                  onChange={e => update('confirm', e.target.value)}
                  placeholder="Re-enter password"
                  required
                  style={{ width: '100%', padding: '13px 14px 13px 40px', border: `2px solid ${form.confirm && form.confirm !== form.password ? '#E74C3C' : '#E8EBF2'}`, borderRadius: 10, fontSize: 14, color: '#0A0F1E', background: '#fff', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                  onFocus={e => e.target.style.borderColor = '#F5A623'}
                  onBlur={e => e.target.style.borderColor = form.confirm && form.confirm !== form.password ? '#E74C3C' : '#E8EBF2'}
                />
              </div>
              {form.confirm && form.confirm !== form.password && (
                <p style={{ color: '#E74C3C', fontSize: 12, marginTop: 6 }}>Passwords do not match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '15px',
                background: loading ? '#8892A4' : '#0D2B5E',
                color: '#fff', border: 'none', borderRadius: 10,
                fontSize: 15, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                marginBottom: 20, transition: 'all 0.2s',
              }}
            >
              {loading ? 'Creating account...' : <><ShoppingBag size={18} /> Create Account</>}
            </button>

            <div style={{ textAlign: 'center', color: '#8892A4', fontSize: 14 }}>
              Already have an account?{' '}
              <Link href="/login" style={{ color: '#F5A623', fontWeight: 700, textDecoration: 'none' }}>
                Sign in <ArrowRight size={13} style={{ display: 'inline', verticalAlign: 'middle' }} />
              </Link>
            </div>
            <div style={{ textAlign: 'center', color: '#8892A4', fontSize: 13, marginTop: 10 }}>
              <Link href="/register/vendor" style={{ color: '#8892A4', textDecoration: 'none' }}>
                Are you a vendor? Register your shop here
              </Link>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
