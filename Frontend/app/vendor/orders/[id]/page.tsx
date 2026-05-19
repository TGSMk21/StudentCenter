'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package, User, Calendar, Clock, CheckCircle, XCircle, Loader } from 'lucide-react';
import api from '@/lib/api';

const STATUS_FLOW = ['placed', 'processing', 'ready', 'completed'];

const STATUS_META: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  placed:     { label: 'Placed',     color: '#F39C12', bg: '#FEF6E8', icon: Clock },
  processing: { label: 'Processing', color: '#3498DB', bg: '#E8F4FD', icon: Loader },
  ready:      { label: 'Ready',      color: '#2ECC71', bg: '#E8FAF1', icon: CheckCircle },
  completed:  { label: 'Completed',  color: '#8892A4', bg: '#F4F6FB', icon: CheckCircle },
  cancelled:  { label: 'Cancelled',  color: '#E74C3C', bg: '#FDE8E8', icon: XCircle },
};

export default function VendorOrderDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    api.get(`/orders/${id}/`).then(r => setOrder(r.data)).finally(() => setLoading(false));
  }, [id]);

  async function updateStatus(status: string) {
    setUpdating(true);
    try {
      const { data } = await api.patch(`/orders/${id}/status/`, { order_status: status });
      setOrder(data);
    } catch {}
    setUpdating(false);
  }

  if (loading) return <div style={{ color: '#8892A4' }}>Loading order...</div>;
  if (!order) return <div style={{ color: '#8892A4' }}>Order not found</div>;

  const meta = STATUS_META[order.order_status] || STATUS_META['placed'];
  const currentIdx = STATUS_FLOW.indexOf(order.order_status);

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        <Link href="/vendor/orders" style={{ background: '#F4F6FB', border: '1px solid #E8EBF2', borderRadius: 10, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
          <ArrowLeft size={18} color="#0D2B5E" />
        </Link>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0A0F1E', marginBottom: 4 }}>
            Order #{String(order.id).slice(0, 8)}
          </h1>
          <p style={{ color: '#8892A4', fontSize: 14 }}>
            {new Date(order.created_at).toLocaleDateString()} · {order.items?.length || 0} items
          </p>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <span style={{ background: meta.bg, color: meta.color, borderRadius: 6, padding: '6px 14px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>
            {order.order_status}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 24 }}>
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E8EBF2', padding: 24 }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#0A0F1E', marginBottom: 16 }}>Order Items</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F4F6FB' }}>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#8892A4', textTransform: 'uppercase' }}>Product</th>
                <th style={{ padding: '10px 16px', textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#8892A4', textTransform: 'uppercase' }}>Qty</th>
                <th style={{ padding: '10px 16px', textAlign: 'right', fontSize: 11, fontWeight: 700, color: '#8892A4', textTransform: 'uppercase' }}>Price</th>
                <th style={{ padding: '10px 16px', textAlign: 'right', fontSize: 11, fontWeight: 700, color: '#8892A4', textTransform: 'uppercase' }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {(order.items || []).map((item: any) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #E8EBF2' }}>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#0A0F1E' }}>{item.product_name || item.product}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, textAlign: 'center', color: '#444' }}>{item.quantity}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, textAlign: 'right', color: '#444' }}>K{parseFloat(item.unit_price).toFixed(2)}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, textAlign: 'right', fontWeight: 700, color: '#0D2B5E' }}>K{parseFloat(item.subtotal).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} style={{ padding: '12px 16px', textAlign: 'right', fontSize: 13, fontWeight: 700, color: '#0A0F1E' }}>Total</td>
                <td style={{ padding: '12px 16px', textAlign: 'right', fontSize: 15, fontWeight: 900, color: '#0D2B5E' }}>K{parseFloat(order.total_amount).toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E8EBF2', padding: 24 }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#0A0F1E', marginBottom: 16 }}>Student Details</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <User size={16} color="#8892A4" />
              <span style={{ fontSize: 14, color: '#0A0F1E' }}>{order.student_name || 'Student'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Calendar size={16} color="#8892A4" />
              <span style={{ fontSize: 14, color: '#0A0F1E' }}>{new Date(order.created_at).toLocaleString()}</span>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E8EBF2', padding: 24 }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#0A0F1E', marginBottom: 16 }}>Payment</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <span style={{ fontSize: 14, color: '#8892A4' }}>Method:</span>
              <span style={{ fontSize: 14, color: '#0A0F1E', fontWeight: 600 }}>{order.payment_method || 'N/A'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 14, color: '#8892A4' }}>Status:</span>
              <span style={{ background: order.payment_status === 'success' ? '#E8FAF1' : '#FEF6E8', color: order.payment_status === 'success' ? '#2ECC71' : '#F39C12', borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 700 }}>
                {order.payment_status || 'pending'}
              </span>
            </div>
          </div>
        </div>

        {order.order_status !== 'cancelled' && order.order_status !== 'completed' && (
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E8EBF2', padding: 24 }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#0A0F1E', marginBottom: 16 }}>Update Status</h2>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {STATUS_FLOW.slice(currentIdx + 1).map(status => (
                <button
                  key={status}
                  onClick={() => updateStatus(status)}
                  disabled={updating}
                  style={{
                    padding: '10px 24px', borderRadius: 10, border: 'none',
                    background: '#0D2B5E', color: '#fff', fontWeight: 700, fontSize: 14,
                    cursor: updating ? 'not-allowed' : 'pointer', opacity: updating ? 0.6 : 1,
                  }}
                >
                  Mark as {STATUS_META[status]?.label}
                </button>
              ))}
              <button
                onClick={() => updateStatus('cancelled')}
                disabled={updating}
                style={{
                  padding: '10px 24px', borderRadius: 10, border: '2px solid #E74C3C',
                  background: 'transparent', color: '#E74C3C', fontWeight: 700, fontSize: 14,
                  cursor: updating ? 'not-allowed' : 'pointer', opacity: updating ? 0.6 : 1,
                }}
              >
                Cancel Order
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
