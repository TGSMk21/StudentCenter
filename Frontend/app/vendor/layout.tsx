'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import api from '@/lib/api';
import {
  LayoutDashboard, Package, ShoppingBag, Calendar, Settings,
  LogOut, Store, History,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/vendor' },
  { label: 'Products',  icon: Package,         href: '/vendor/products' },
  { label: 'Orders',    icon: ShoppingBag,     href: '/vendor/orders' },
  { label: 'Bookings',  icon: Calendar,        href: '/vendor/bookings' },
  { label: 'Audit Log', icon: History,         href: '/vendor/audit' },
  { label: 'Settings',  icon: Settings,        href: '/vendor/settings' },
];

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [vendor, setVendor] = useState<any>(null);

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (!u) { router.push('/login'); return; }
    const parsed = JSON.parse(u);
    if (parsed.role !== 'vendor') { router.push('/dashboard'); return; }
    setUser(parsed);
    api.get('/vendors/me/').then(r => setVendor(r.data)).catch(() => {});
  }, []);

  const initials = vendor?.name?.[0]?.toUpperCase() || user?.name?.[0]?.toUpperCase() || 'V';

  return (
    <div style={{ minHeight: '100vh', background: '#F4F6FB', fontFamily: "'DM Sans', Inter, sans-serif", display: 'flex' }}>
      <aside style={{ width: 240, background: '#0D2B5E', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 100 }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <Link href="/vendor" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ position: 'relative', width: 40, height: 40 }}>
              <Image src="/logo.webp" alt="MU" fill style={{ objectFit: 'contain', mixBlendMode: 'luminosity', filter: 'brightness(2)' }} />
            </div>
            <div>
              <div style={{ color: '#F5A623', fontWeight: 900, fontSize: 16 }}>SCHub</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 9, letterSpacing: 1 }}>VENDOR</div>
            </div>
          </Link>
        </div>

        <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#F5A623', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 16, color: '#0D2B5E', flexShrink: 0 }}>
              {initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{vendor?.name || user?.name}</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>Vendor</div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '16px 12px' }}>
          {NAV_ITEMS.map(item => {
            const active = item.href === '/vendor' ? pathname === '/vendor' : pathname.startsWith(item.href);
            return (
              <Link key={item.label} href={item.href} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '11px 12px', borderRadius: 10, marginBottom: 4,
                  background: active ? 'rgba(245,166,35,0.15)' : 'transparent',
                  borderLeft: active ? '3px solid #F5A623' : '3px solid transparent',
                  transition: 'all 0.2s',
                }}>
                  <item.icon size={18} color={active ? '#F5A623' : 'rgba(255,255,255,0.5)'} />
                  <span style={{ color: active ? '#F5A623' : 'rgba(255,255,255,0.6)', fontWeight: active ? 700 : 500, fontSize: 14 }}>
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <Link href="/vendors" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px', borderRadius: 10, color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 4 }}>
            <Store size={18} /> View Storefront
          </Link>
          <button onClick={() => { localStorage.clear(); router.push('/login'); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px', borderRadius: 10, background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      <main style={{ marginLeft: 240, flex: 1, padding: '32px 40px' }}>
        {children}
      </main>
    </div>
  );
}
