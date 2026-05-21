'use client';
import { useState, useEffect } from 'react';
import { History, Package, ShoppingBag, Plus, Trash2, RefreshCw } from 'lucide-react';
import api from '@/lib/api';

const ACTION_META: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  order_completed: { label: 'Order Completed', icon: ShoppingBag, color: '#2ECC71', bg: '#E8FAF1' },
  stock_updated:   { label: 'Stock Updated',   icon: RefreshCw, color: '#3498DB', bg: '#E8F4FD' },
  product_created: { label: 'Product Created', icon: Plus, color: '#2ECC71', bg: '#E8FAF1' },
  product_updated: { label: 'Product Updated', icon: Package, color: '#F39C12', bg: '#FEF6E8' },
  product_deleted: { label: 'Product Deleted', icon: Trash2, color: '#E74C3C', bg: '#FDE8E8' },
};

export default function VendorAuditLogPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/audit/').then(r => {
      setLogs(r.data.results || r.data);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? logs : logs.filter(l => l.action === filter);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0A0F1E', marginBottom: 4 }}>Audit Log</h1>
        <p style={{ color: '#8892A4', fontSize: 14 }}>Immutable record of all vendor actions</p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {[{ key: 'all', label: 'All' }, ...Object.entries(ACTION_META).map(([k, v]) => ({ key: k, label: v.label }))].map(s => (
          <button
            key={s.key}
            onClick={() => setFilter(s.key)}
            style={{
              padding: '8px 18px', borderRadius: 50, border: '2px solid',
              borderColor: filter === s.key ? '#0D2B5E' : '#E8EBF2',
              background: filter === s.key ? '#0D2B5E' : '#fff',
              color: filter === s.key ? '#fff' : '#444',
              fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ color: '#8892A4' }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#8892A4' }}>
          <History size={48} style={{ marginBottom: 12, opacity: 0.3 }} />
          <p>No audit entries yet</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map((log: any) => {
            const meta = ACTION_META[log.action] || { icon: History, color: '#8892A4', bg: '#F4F6FB' };
            const Icon = meta.icon;
            return (
              <div key={log.id} style={{
                background: '#fff', borderRadius: 12, border: '1px solid #E8EBF2',
                padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16,
              }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} color={meta.color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: 13, color: '#0A0F1E' }}>{meta.label}</span>
                    <span style={{ fontSize: 11, color: '#8892A4' }}>{new Date(log.created_at).toLocaleString()}</span>
                  </div>
                  <div style={{ fontSize: 13, color: '#444', lineHeight: 1.4 }}>{log.description}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
