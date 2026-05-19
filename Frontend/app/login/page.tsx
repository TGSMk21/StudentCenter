'use client';
import { Suspense, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Eye, EyeOff, ShoppingBag, ArrowRight, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import api from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  useEffect(() => {
    if (searchParams.get('registered') === '1') {
      setSuccess('Account created successfully. Sign in to get started.');
    }
  }, [searchParams]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login/', { email, password });
      localStorage.setItem('access_token',  data.access);
      localStorage.setItem('refresh_token', data.refresh);
      localStorage.setItem('user',          JSON.stringify(data.user));
      router.push(data.user.role === 'vendor' ? '/vendor' : '/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr', fontFamily: "'DM Sans', Inter, sans-serif" }}>

      {/* LEFT — Branding */}
      <div style={{
        background: 'linear-gradient(135deg, #0D2B5E 0%, #1B3A6B 100%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 60, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(245,166,35,0.06)' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(46,204,113,0.04)' }} />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          style={{ textAlign: 'center', zIndex: 1 }}
        >
          <div style={{ position: 'relative', width: 100, height: 100, margin: '0 auto 24px' }}>
            <Image src="/logo.webp" alt="MU" fill style={{ objectFit: 'contain', mixBlendMode: 'luminosity', filter: 'brightness(2)' }} />
          </div>
          <div style={{ color: '#F5A623', fontWeight: 900, fontSize: 32, marginBottom: 4 }}>SCHub</div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 40 }}>
            Student Center Hub
          </div>

          <h2 style={{ color: '#fff', fontWeight: 800, fontSize: 28, marginBottom: 16, lineHeight: 1.3 }}>
            Your campus<br />marketplace awaits
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 15, lineHeight: 1.8, maxWidth: 320 }}>
            Order food, groceries and supplies. Book salon, tech and health services. All in one place.
          </p>

          <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 48 }}>
            {[
              { n: '7',    l: 'Vendors'  },
              { n: '500+', l: 'Products' },
              { n: '2K+',  l: 'Students' },
            ].map(s => (
              <div key={s.l} style={{ textAlign: 'center' }}>
                <div style={{ color: '#F5A623', fontWeight: 900, fontSize: 22 }}>{s.n}</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* RIGHT — Form */}
      <div style={{
        background: '#F4F6FB', display: 'flex',
        alignItems: 'center', justifyContent: 'center', padding: 60,
      }}>
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          style={{ width: '100%', maxWidth: 420 }}
        >
          <div style={{ marginBottom: 36 }}>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0A0F1E', marginBottom: 8 }}>Welcome back</h1>
            <p style={{ color: '#8892A4', fontSize: 15 }}>Sign in to your SCHub account</p>
          </div>

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: '#E8FDE8', border: '1px solid #27AE6044',
                borderRadius: 10, padding: '12px 16px', marginBottom: 20,
                display: 'flex', alignItems: 'center', gap: 10,
                color: '#1E8449', fontSize: 14,
              }}
            >
              <CheckCircle size={16} /> {success}
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: '#FDE8E8', border: '1px solid #E74C3C44',
                borderRadius: 10, padding: '12px 16px', marginBottom: 20,
                display: 'flex', alignItems: 'center', gap: 10,
                color: '#C0392B', fontSize: 14,
              }}
            >
              <AlertCircle size={16} /> {error}
            </motion.div>
          )}

          <form onSubmit={handleLogin}>
            {/* Email */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#0A0F1E', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="#8892A4" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="student@mu.ac.zm"
                  required
                  style={{
                    width: '100%', padding: '14px 16px 14px 44px',
                    border: '2px solid #E8EBF2', borderRadius: 10,
                    fontSize: 14, color: '#0A0F1E', background: '#fff',
                    outline: 'none', boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = '#F5A623'}
                  onBlur={e => e.target.style.borderColor = '#E8EBF2'}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 28 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#0A0F1E', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="#8892A4" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  style={{
                    width: '100%', padding: '14px 48px 14px 44px',
                    border: '2px solid #E8EBF2', borderRadius: 10,
                    fontSize: 14, color: '#0A0F1E', background: '#fff',
                    outline: 'none', boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = '#F5A623'}
                  onBlur={e => e.target.style.borderColor = '#E8EBF2'}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#8892A4' }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
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
                transition: 'all 0.2s', marginBottom: 20,
              }}
            >
              {loading ? 'Signing in...' : <><ShoppingBag size={18} /> Sign In</>}
            </button>

            <div style={{ textAlign: 'center', color: '#8892A4', fontSize: 14 }}>
              No account?{' '}
              <Link href="/register" style={{ color: '#F5A623', fontWeight: 700, textDecoration: 'none' }}>
                Create one free <ArrowRight size={13} style={{ display: 'inline', verticalAlign: 'middle' }} />
              </Link>
            </div>
          </form>

          <div style={{ marginTop: 40, padding: '16px', background: '#fff', borderRadius: 10, border: '1px solid #E8EBF2', textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: '#8892A4', marginBottom: 4 }}>Mulungushi University</div>
            <div style={{ fontSize: 11, color: '#aaa' }}>Student Center Hub v2.0</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
