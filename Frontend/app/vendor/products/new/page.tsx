'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import api from '@/lib/api';

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', price: '', discount_price: '',
    stock: '', category: '', is_service: false, is_available: true,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/products/categories/').then(r => setCategories(r.data.results || r.data)).catch(() => {});
  }, []);

  function update(k: string, v: any) { setForm(p => ({ ...p, [k]: v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/products/create/', {
        ...form,
        price: parseFloat(form.price),
        discount_price: form.discount_price ? parseFloat(form.discount_price) : null,
        stock: form.is_service ? 0 : parseInt(form.stock) || 0,
        category: form.category || undefined,
      });
      router.push('/vendor/products');
    } catch (err: any) {
      setError(err.response?.data?.detail || Object.values(err.response?.data || {}).flat().join(' ') || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        <Link href="/vendor/products" style={{ background: '#F4F6FB', border: '1px solid #E8EBF2', borderRadius: 10, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
          <ArrowLeft size={18} color="#0D2B5E" />
        </Link>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0A0F1E' }}>New Product</h1>
      </div>

      {error && (
        <div style={{ background: '#FDE8E8', border: '1px solid #E74C3C44', borderRadius: 10, padding: '12px 16px', marginBottom: 20, color: '#C0392B', fontSize: 13 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E8EBF2', padding: 32 }}>
          {[
            { label: 'Product Name', key: 'name', type: 'text' },
            { label: 'Price (K)', key: 'price', type: 'number' },
            { label: 'Discount Price (K)', key: 'discount_price', type: 'number' },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0A0F1E', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>{f.label}</label>
              <input
                type={f.type}
                value={(form as any)[f.key]}
                onChange={e => update(f.key, e.target.value)}
                required
                step={f.type === 'number' ? '0.01' : undefined}
                style={{ width: '100%', padding: '12px 14px', border: '2px solid #E8EBF2', borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          ))}

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0A0F1E', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Description</label>
            <textarea
              value={form.description}
              onChange={e => update('description', e.target.value)}
              rows={3}
              style={{ width: '100%', padding: '12px 14px', border: '2px solid #E8EBF2', borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0A0F1E', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Category</label>
            <select
              value={form.category}
              onChange={e => update('category', e.target.value)}
              style={{ width: '100%', padding: '12px 14px', border: '2px solid #E8EBF2', borderRadius: 10, fontSize: 14, outline: 'none', background: '#fff' }}
            >
              <option value="">Select category</option>
              {categories.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0A0F1E', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Stock Quantity</label>
            <input
              type="number"
              value={form.stock}
              onChange={e => update('stock', e.target.value)}
              disabled={form.is_service}
              style={{ width: '100%', padding: '12px 14px', border: '2px solid #E8EBF2', borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box', opacity: form.is_service ? 0.5 : 1 }}
            />
          </div>

          <div style={{ display: 'flex', gap: 32, marginBottom: 24 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
              <input type="checkbox" checked={form.is_service} onChange={e => update('is_service', e.target.checked)} style={{ width: 18, height: 18 }} />
              This is a service (not a product)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
              <input type="checkbox" checked={form.is_available} onChange={e => update('is_available', e.target.checked)} style={{ width: 18, height: 18 }} />
              Available for purchase
            </label>
          </div>

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '14px', background: loading ? '#8892A4' : '#0D2B5E',
            color: '#fff', border: 'none', borderRadius: 10, fontSize: 15,
            fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <Save size={16} /> {loading ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
