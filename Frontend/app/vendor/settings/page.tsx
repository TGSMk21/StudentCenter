'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

export default function VendorSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState({
    name: '', description: '', contact_email: '', contact_phone: '',
    location_notes: '', opening_time: '', closing_time: '',
    has_bookable_services: false,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    api.get('/vendors/me/').then(r => {
      const v = r.data;
      setForm({
        name: v.name, description: v.description || '',
        contact_email: v.contact_email || '', contact_phone: v.contact_phone || '',
        location_notes: v.location_notes || '',
        opening_time: v.opening_time || '', closing_time: v.closing_time || '',
        has_bookable_services: v.has_bookable_services,
      });
    }).finally(() => setFetching(false));
  }, []);

  function update(k: string, v: any) { setForm(p => ({ ...p, [k]: v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await api.patch('/vendors/me/', form);
      setSuccess('Settings saved successfully');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  }

  if (fetching) return <div style={{ color: '#8892A4' }}>Loading...</div>;

  const inputStyle: React.CSSProperties = { width: '100%', padding: '12px 14px', border: '2px solid #E8EBF2', borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box' };

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0A0F1E', marginBottom: 4 }}>Settings</h1>
        <p style={{ color: '#8892A4', fontSize: 14 }}>Manage your vendor profile</p>
      </div>

      {error && (
        <div style={{ background: '#FDE8E8', border: '1px solid #E74C3C44', borderRadius: 10, padding: '12px 16px', marginBottom: 20, color: '#C0392B', fontSize: 13 }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ background: '#E8FAF1', border: '1px solid #2ECC7144', borderRadius: 10, padding: '12px 16px', marginBottom: 20, color: '#1B7A4A', fontSize: 13 }}>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E8EBF2', padding: 32 }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#0A0F1E', marginBottom: 20 }}>Shop Details</h2>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0A0F1E', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Shop Name</label>
            <input value={form.name} onChange={e => update('name', e.target.value)} style={inputStyle} />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0A0F1E', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Description</label>
            <textarea value={form.description} onChange={e => update('description', e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0A0F1E', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Contact Email</label>
              <input value={form.contact_email} onChange={e => update('contact_email', e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0A0F1E', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Contact Phone</label>
              <input value={form.contact_phone} onChange={e => update('contact_phone', e.target.value)} style={inputStyle} />
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0A0F1E', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Location</label>
            <input value={form.location_notes} onChange={e => update('location_notes', e.target.value)} placeholder="e.g. Student Center, Room 12" style={inputStyle} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0A0F1E', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Opening Time</label>
              <input type="time" value={form.opening_time} onChange={e => update('opening_time', e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0A0F1E', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Closing Time</label>
              <input type="time" value={form.closing_time} onChange={e => update('closing_time', e.target.value)} style={inputStyle} />
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, marginBottom: 24 }}>
            <input type="checkbox" checked={form.has_bookable_services} onChange={e => update('has_bookable_services', e.target.checked)} style={{ width: 18, height: 18 }} />
            Offer bookable services (salon, tech, health)
          </label>

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '14px', background: loading ? '#8892A4' : '#0D2B5E',
            color: '#fff', border: 'none', borderRadius: 10, fontSize: 15,
            fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <Save size={16} /> {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
