'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Package, Search, ArrowRight } from 'lucide-react';
import api from '@/lib/api';

export default function VendorProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/vendors/me/').then(r => {
      setVendor(r.data);
      return api.get(`/products/vendor/${r.data.slug}/`);
    }).then(r => {
      setProducts(r.data.results || r.data);
    }).finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    if (!confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}/delete/`);
      setProducts(p => p.filter(x => x.id !== id));
    } catch {}
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0A0F1E', marginBottom: 4 }}>Products</h1>
          <p style={{ color: '#8892A4', fontSize: 14 }}>{products.length} products</p>
        </div>
        <Link href="/vendor/products/new" style={{
          background: '#F5A623', color: '#0D2B5E',
          borderRadius: 10, padding: '12px 24px', textDecoration: 'none',
          fontWeight: 800, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <Plus size={16} /> New Product
        </Link>
      </div>

      <div style={{ marginBottom: 20, maxWidth: 400 }}>
        <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '2px solid #E8EBF2', borderRadius: 10, padding: '0 14px' }}>
          <Search size={16} color="#8892A4" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            style={{ flex: 1, padding: '11px 14px', border: 'none', outline: 'none', background: 'transparent', fontSize: 14 }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ color: '#8892A4' }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#8892A4' }}>
          <Package size={48} style={{ marginBottom: 12, opacity: 0.3 }} />
          <p>No products found</p>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E8EBF2', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F4F6FB' }}>
                {['Name', 'Category', 'Price', 'Discount', 'Stock', 'Status', ''].map(h => (
                  <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#8892A4', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #E8EBF2' }}>
                  <td style={{ padding: '14px 20px', fontSize: 13, fontWeight: 700, color: '#0A0F1E' }}>{p.name}</td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: '#444' }}>{p.category_name}</td>
                  <td style={{ padding: '14px 20px', fontSize: 13, fontWeight: 700, color: '#0D2B5E' }}>K{parseFloat(p.price).toFixed(2)}</td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: '#E74C3C' }}>{p.discount_price ? `K${parseFloat(p.discount_price).toFixed(2)}` : '—'}</td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: '#444' }}>{p.is_service ? '—' : p.stock}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ background: p.is_available ? '#E8FAF1' : '#FDE8E8', color: p.is_available ? '#2ECC71' : '#E74C3C', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 700 }}>
                      {p.is_available ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => router.push(`/vendor/products/${p.id}/edit`)} style={{ background: '#E8F4FD', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3498DB' }}>
                        <Edit size={14} />
                      </button>
                      <button onClick={() => handleDelete(p.id)} style={{ background: '#FDE8E8', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E74C3C' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
