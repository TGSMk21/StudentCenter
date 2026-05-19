'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState } from 'react';
import {
  ShoppingBag, Calendar, Bell, Shield, Star, ArrowRight,
  MapPin, Clock, Users, TrendingUp, ChevronRight, Zap,
  Scissors, Printer, Cpu, Pill, Beef, Utensils, Search,
  Tag, Truck, Phone, ChevronDown, Menu, X, Heart,
  ShoppingCart, Package, CheckCircle
} from 'lucide-react';

const vendors = [
  { name: 'Twice Unimart',         category: 'Minimart',         icon: '🛒', color: '#2ECC71', bg: '#E8FAF1', tag: 'Groceries',   popular: true  },
  { name: "Mulwanda's Salon",      category: 'Hair & Beauty',    icon: '💇', color: '#E91E8C', bg: '#FDE8F4', tag: 'Book Now',    popular: true  },
  { name: 'Write General Dealers', category: 'Print & Stationery',icon: '🖨️',color: '#3498DB', bg: '#E8F4FD', tag: 'Services',    popular: false },
  { name: 'Hamted Investments',    category: 'Tech Store',       icon: '💻', color: '#9B59B6', bg: '#F3E8FD', tag: 'Gadgets',     popular: false },
  { name: 'Campus Pharmacy',       category: 'Healthcare',       icon: '💊', color: '#1ABC9C', bg: '#E8FAF7', tag: 'Health',      popular: true  },
  { name: "Shell's Butchery",      category: 'Butchery',         icon: '🥩', color: '#E74C3C', bg: '#FDE8E8', tag: 'Fresh Meat',  popular: false },
  { name: "Tony's Fast Food",      category: 'Fast Food',        icon: '🍔', color: '#F39C12', bg: '#FEF6E8', tag: 'Hot Meals',   popular: true  },
];

const featured = [
  { name: 'Shawarma (Chicken)', vendor: "Tony's Fast Food", price: 'K55.00', old: null,    icon: '🌯', color: '#F39C12', hot: true  },
  { name: 'Box Braids',         vendor: "Mulwanda's Salon", price: 'K250.00',old: null,    icon: '💇', color: '#E91E8C', hot: false },
  { name: 'Burger (Beef)',      vendor: "Tony's Fast Food", price: 'K58.00', old: 'K75.00',icon: '🍔', color: '#F39C12', hot: true  },
  { name: 'Paracetamol (20)',   vendor: 'Campus Pharmacy',  price: 'K18.00', old: null,    icon: '💊', color: '#1ABC9C', hot: false },
  { name: 'Screen Protector',   vendor: 'Hamted Investments',price: 'K45.00',old: null,    icon: '📱', color: '#9B59B6', hot: false },
  { name: 'Chicken (Half)',     vendor: "Shell's Butchery", price: 'K95.00', old: null,    icon: '🍗', color: '#E74C3C', hot: false },
];

const categories = [
  { label: 'Fast Food',   icon: '🍔', color: '#F39C12' },
  { label: 'Groceries',  icon: '🛒', color: '#2ECC71' },
  { label: 'Beauty',     icon: '💇', color: '#E91E8C' },
  { label: 'Tech',       icon: '💻', color: '#9B59B6' },
  { label: 'Pharmacy',   icon: '💊', color: '#1ABC9C' },
  { label: 'Butchery',   icon: '🥩', color: '#E74C3C' },
  { label: 'Printing',   icon: '🖨️', color: '#3498DB' },
  { label: 'Bookings',   icon: '📅', color: '#F5A623' },
];

const promos = [
  { title: 'Shawarma + Chips', sub: 'Only K65 at Tony\'s', tag: 'Today\'s Deal', color: '#F39C12', icon: '🌯' },
  { title: '10% off Printing', sub: 'Write General Dealers', tag: 'Weekly Promo', color: '#3498DB', icon: '🖨️' },
  { title: 'Free HIV Testing', sub: 'Campus Pharmacy', tag: 'Health Drive', color: '#1ABC9C', icon: '💊' },
];

const fadeUp = {
  hidden:  { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.08, ease: 'easeOut' as const } }),
};

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroY = useTransform(scrollY, [0, 400], [0, 80]);

  return (
    <div style={{ fontFamily: "'DM Sans', 'Inter', sans-serif", background: '#F4F6FB', minHeight: '100vh' }}>

      {/* TOP BAR */}
      <div style={{ background: '#0D2B5E', padding: '8px 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
          <MapPin size={12} color="#F5A623" />
          <span>Mulungushi University, Kabwe, Zambia</span>
        </div>
        <div style={{ display: 'flex', gap: 20, color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> Mon-Fri 7am-8pm</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={12} /> Support Available</span>
        </div>
      </div>

      {/* NAVBAR */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{
          background: '#fff',
          borderBottom: '2px solid #F5A623',
          padding: '0 5%',
          position: 'sticky', top: 0, zIndex: 100,
          boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
        }}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 24, height: 72 }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ position: 'relative', width: 70, height: 70 }}>
              <Image
                src="/logo.webp"
                alt="Mulungushi University"
                fill
                style={{ objectFit: 'contain', mixBlendMode: 'multiply' }}
              />
            </div>
            <div>
              <div style={{ color: '#0D2B5E', fontWeight: 900, fontSize: 20, lineHeight: 1, letterSpacing: -0.5 }}>SCHub</div>
              <div style={{ color: '#F5A623', fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>Student Center</div>
            </div>
          </Link>

          {/* Search */}
          <div style={{ flex: 1, position: 'relative', maxWidth: 600 }}>
            <div style={{
              display: 'flex', alignItems: 'center',
              background: searchFocused ? '#fff' : '#F4F6FB',
              border: `2px solid ${searchFocused ? '#F5A623' : '#E8EBF2'}`,
              borderRadius: 12, overflow: 'hidden',
              transition: 'all 0.2s ease',
              boxShadow: searchFocused ? '0 4px 20px rgba(245,166,35,0.15)' : 'none',
            }}>
              <Search size={18} color="#8892A4" style={{ marginLeft: 16, flexShrink: 0 }} />
              <input
                placeholder="Search products, vendors, services..."
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                style={{
                  flex: 1, padding: '12px 16px', border: 'none', outline: 'none',
                  background: 'transparent', fontSize: 14, color: '#0A0F1E',
                }}
              />
              <button style={{
                background: '#F5A623', border: 'none', padding: '12px 20px',
                color: '#0D2B5E', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                flexShrink: 0,
              }}>
                Search
              </button>
            </div>
          </div>

          {/* Nav Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <Link href="/login" style={{
              color: '#0D2B5E', textDecoration: 'none', padding: '10px 20px',
              fontWeight: 600, fontSize: 14, borderRadius: 8,
              border: '2px solid #E8EBF2', whiteSpace: 'nowrap',
            }}>
              Sign In
            </Link>
            <Link href="/register" style={{
              background: '#0D2B5E', color: '#fff', textDecoration: 'none',
              padding: '10px 20px', fontWeight: 700, fontSize: 14,
              borderRadius: 8, whiteSpace: 'nowrap',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <ShoppingCart size={15} /> Get Started
            </Link>
          </div>
        </div>

        {/* Category Nav */}
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', gap: 4, paddingBottom: 0, overflowX: 'auto' }}>
          {categories.map(c => (
            <Link key={c.label} href="/vendors" style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', textDecoration: 'none',
              color: '#444', fontSize: 13, fontWeight: 500,
              whiteSpace: 'nowrap', borderRadius: '8px 8px 0 0',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = c.color + '15';
                (e.currentTarget as HTMLElement).style.color = c.color;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'transparent';
                (e.currentTarget as HTMLElement).style.color = '#444';
              }}
            >
              <span>{c.icon}</span> {c.label}
            </Link>
          ))}
        </div>
      </motion.nav>

      {/* HERO */}
      <section style={{ background: 'linear-gradient(135deg, #0D2B5E 0%, #1B3A6B 60%, #163460 100%)', padding: '0 5%', overflow: 'hidden', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: '45%', height: '100%', background: 'rgba(245,166,35,0.04)', clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0% 100%)' }} />
        <div style={{ position: 'absolute', bottom: -80, left: '30%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(46,204,113,0.04)' }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center', minHeight: 420, padding: '48px 0' }}>
          {/* Left */}
          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
            <motion.div variants={fadeUp} custom={0} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(245,166,35,0.2)', border: '1px solid rgba(245,166,35,0.4)',
              borderRadius: 6, padding: '5px 12px', marginBottom: 20,
            }}>
              <Zap size={12} color="#F5A623" fill="#F5A623" />
              <span style={{ color: '#F5A623', fontSize: 12, fontWeight: 700, letterSpacing: 0.5 }}>CAMPUS MARKETPLACE</span>
            </motion.div>

            <motion.h1 variants={fadeUp} custom={1} style={{
              fontSize: 'clamp(2.2rem, 4vw, 3.4rem)', fontWeight: 900,
              color: '#fff', lineHeight: 1.1, marginBottom: 16, letterSpacing: -1,
            }}>
              Shop Everything<br />
              <span style={{ color: '#F5A623' }}>on Campus.</span>
            </motion.h1>

            <motion.p variants={fadeUp} custom={2} style={{
              fontSize: '1rem', color: 'rgba(255,255,255,0.65)',
              lineHeight: 1.8, marginBottom: 32, maxWidth: 440,
            }}>
              Food, groceries, beauty, tech, healthcare and more from 7 Student Center vendors. Order online, book services, pay your way.
            </motion.p>

            <motion.div variants={fadeUp} custom={3} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 40 }}>
              <Link href="/register" style={{
                background: '#F5A623', color: '#0D2B5E', fontWeight: 800,
                padding: '14px 28px', borderRadius: 10, textDecoration: 'none',
                fontSize: 15, display: 'flex', alignItems: 'center', gap: 8,
                boxShadow: '0 8px 24px rgba(245,166,35,0.35)',
              }}>
                <ShoppingBag size={18} /> Start Shopping
              </Link>
              <Link href="/vendors" style={{
                background: 'rgba(255,255,255,0.1)', color: '#fff',
                border: '1.5px solid rgba(255,255,255,0.25)',
                padding: '14px 28px', borderRadius: 10, textDecoration: 'none',
                fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8,
                backdropFilter: 'blur(10px)',
              }}>
                Browse Vendors <ChevronRight size={18} />
              </Link>
            </motion.div>

            <motion.div variants={fadeUp} custom={4} style={{ display: 'flex', gap: 32 }}>
              {[
                { n: '7',    l: 'Vendors'  },
                { n: '500+', l: 'Products' },
                { n: '2K+',  l: 'Students' },
              ].map(s => (
                <div key={s.l} style={{ borderLeft: '3px solid #F5A623', paddingLeft: 14 }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#F5A623', lineHeight: 1 }}>{s.n}</div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{s.l}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: Promo Cards */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
          >
            {promos.map((p, i) => (
              <motion.div
                key={p.title}
                animate={{ y: [0, i % 2 === 0 ? -4 : 4, 0] }}
                transition={{ duration: 3 + i, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${p.color}44`,
                  borderLeft: `4px solid ${p.color}`,
                  borderRadius: 12, padding: '16px 20px',
                  display: 'flex', alignItems: 'center', gap: 16,
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: 28 }}>{p.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{p.title}</div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{p.sub}</div>
                </div>
                <div style={{
                  background: p.color + '22', color: p.color,
                  borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 700,
                  border: `1px solid ${p.color}44`, whiteSpace: 'nowrap',
                }}>
                  {p.tag}
                </div>
              </motion.div>
            ))}

            {/* University branding card */}
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                background: 'rgba(245,166,35,0.12)',
                border: '1px solid rgba(245,166,35,0.3)',
                borderRadius: 12, padding: '16px 20px',
                display: 'flex', alignItems: 'center', gap: 16,
              }}
            >
              <div style={{ position: 'relative', width: 48, height: 48, flexShrink: 0 }}>
                <Image src="/logo.webp" alt="MU" fill style={{ objectFit: 'contain', mixBlendMode: 'luminosity', filter: 'brightness(2)' }} />
              </div>
              <div>
                <div style={{ color: '#F5A623', fontWeight: 800, fontSize: 13 }}>Mulungushi University</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>Official Student Center Platform</div>
              </div>
              <CheckCircle size={20} color="#F5A623" style={{ marginLeft: 'auto' }} />
            </motion.div>
          </motion.div>
        </div>

        {/* Stats bar */}
        <div style={{ maxWidth: 1280, margin: '0 auto', borderTop: '1px solid rgba(255,255,255,0.08)', padding: '20px 0', display: 'flex', gap: 40 }}>
          {[
            { icon: Package, label: 'Free campus collection' },
            { icon: Shield,  label: 'Secure payments'        },
            { icon: Clock,   label: 'Real-time order updates' },
            { icon: Star,    label: 'Rated 4.8 by students'  },
          ].map(s => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>
              <s.icon size={15} color="#F5A623" />
              {s.label}
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section style={{ padding: '48px 5%', background: '#F4F6FB' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <div style={{ color: '#F5A623', fontWeight: 700, fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>Hot Right Now</div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0A0F1E' }}>Featured Products</h2>
            </div>
            <Link href="/register" style={{ color: '#0D2B5E', fontWeight: 700, fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, border: '2px solid #0D2B5E', padding: '8px 16px', borderRadius: 8 }}>
              View All <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16 }}>
            {featured.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                viewport={{ once: true }}
                whileHover={{ y: -6, boxShadow: '0 12px 32px rgba(0,0,0,0.12)' }}
                style={{
                  background: '#fff', borderRadius: 16, overflow: 'hidden',
                  border: '1px solid #E8EBF2', cursor: 'pointer',
                  transition: 'box-shadow 0.3s ease',
                }}
              >
                <div style={{
                  background: p.color + '12', height: 110,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 44, position: 'relative',
                }}>
                  {p.icon}
                  {p.hot && (
                    <div style={{
                      position: 'absolute', top: 8, left: 8,
                      background: '#E74C3C', color: '#fff',
                      borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 700,
                    }}>HOT</div>
                  )}
                  {p.old && (
                    <div style={{
                      position: 'absolute', top: 8, right: 8,
                      background: '#2ECC71', color: '#fff',
                      borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 700,
                    }}>SALE</div>
                  )}
                </div>
                <div style={{ padding: '12px' }}>
                  <div style={{ fontSize: 11, color: p.color, fontWeight: 600, marginBottom: 4 }}>{p.vendor}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0A0F1E', marginBottom: 8, lineHeight: 1.3 }}>{p.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: '#0D2B5E' }}>{p.price}</span>
                    {p.old && <span style={{ fontSize: 12, color: '#aaa', textDecoration: 'line-through' }}>{p.old}</span>}
                  </div>
                  <Link href="/register" style={{
                    display: 'block', textAlign: 'center',
                    background: '#0D2B5E', color: '#fff',
                    borderRadius: 8, padding: '8px', fontSize: 12, fontWeight: 700,
                    textDecoration: 'none',
                  }}>
                    Add to Cart
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* VENDORS */}
      <section style={{ padding: '48px 5%', background: '#fff' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <div style={{ color: '#F5A623', fontWeight: 700, fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>Our Stores</div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0A0F1E' }}>All Campus Vendors</h2>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {vendors.map((v, i) => (
              <motion.div
                key={v.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
              >
                <Link href="/register" style={{ textDecoration: 'none' }}>
                  <div style={{
                    background: '#fff', borderRadius: 16, padding: '20px',
                    border: `1.5px solid ${v.color}33`,
                    display: 'flex', alignItems: 'center', gap: 16,
                    transition: 'all 0.2s', cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: 14,
                      background: v.bg, fontSize: 26,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {v.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#0A0F1E', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.name}</div>
                      <div style={{ fontSize: 12, color: '#8892A4', marginBottom: 6 }}>{v.category}</div>
                      <div style={{
                        display: 'inline-flex', alignItems: 'center',
                        background: v.bg, color: v.color,
                        borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 700,
                      }}>
                        {v.tag}
                      </div>
                    </div>
                    {v.popular && (
                      <div style={{
                        background: '#F5A623', color: '#0D2B5E',
                        borderRadius: 6, padding: '3px 8px', fontSize: 10, fontWeight: 800,
                        flexShrink: 0,
                      }}>
                        HOT
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: '64px 5%', background: '#F4F6FB' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ color: '#F5A623', fontWeight: 700, fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>Simple Process</div>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#0A0F1E' }}>How SCHub Works</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
            {[
              { step: '1', title: 'Browse',  desc: 'Explore 7 vendors and 500+ products and services.', icon: Search,      color: '#1B3A6B' },
              { step: '2', title: 'Add',     desc: 'Add items to your cart or book a service slot.',    icon: ShoppingCart, color: '#F5A623' },
              { step: '3', title: 'Pay',     desc: 'Pay via mobile money, card, or cash on delivery.',  icon: Shield,       color: '#2ECC71' },
              { step: '4', title: 'Collect', desc: 'Get notified and collect from the vendor.',         icon: Package,      color: '#E74C3C' },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                style={{
                  background: '#fff', borderRadius: 20, padding: 28,
                  border: '1px solid #E8EBF2', textAlign: 'center',
                  position: 'relative',
                }}
              >
                <div style={{
                  position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)',
                  width: 32, height: 32, borderRadius: '50%',
                  background: s.color, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 900, fontSize: 14,
                  boxShadow: `0 4px 12px ${s.color}44`,
                }}>
                  {s.step}
                </div>
                <div style={{
                  width: 64, height: 64, borderRadius: 18,
                  background: s.color + '12', margin: '12px auto 16px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <s.icon size={28} color={s.color} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0A0F1E', marginBottom: 8 }}>{s.title}</h3>
                <p style={{ fontSize: '0.85rem', color: '#8892A4', lineHeight: 1.6 }}>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section style={{
        background: 'linear-gradient(135deg, #0D2B5E 0%, #1B3A6B 100%)',
        padding: '64px 5%', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '40%', background: 'rgba(245,166,35,0.06)', clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0% 100%)' }} />
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 40, flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 900, color: '#fff', marginBottom: 12, lineHeight: 1.2 }}>
              Ready to shop on campus?
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem', maxWidth: 480 }}>
              Create your free account and start ordering from your favourite Student Center vendors today.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/register" style={{
              background: '#F5A623', color: '#0D2B5E', fontWeight: 800,
              padding: '16px 36px', borderRadius: 10, textDecoration: 'none',
              fontSize: 15, display: 'flex', alignItems: 'center', gap: 8,
              boxShadow: '0 8px 24px rgba(245,166,35,0.3)',
            }}>
              <ShoppingBag size={18} /> Create Account
            </Link>
            <Link href="/login" style={{
              background: 'rgba(255,255,255,0.1)', color: '#fff',
              border: '1.5px solid rgba(255,255,255,0.25)',
              padding: '16px 36px', borderRadius: 10, textDecoration: 'none',
              fontSize: 15, fontWeight: 600,
            }}>
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#0A0F1E', padding: '48px 5% 24px', color: 'rgba(255,255,255,0.5)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, marginBottom: 40 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ position: 'relative', width: 44, height: 44 }}>
                  <Image src="/logo.webp" alt="MU" fill style={{ objectFit: 'contain', mixBlendMode: 'luminosity', filter: 'brightness(1.5)' }} />
                </div>
                <div>
                  <div style={{ color: '#F5A623', fontWeight: 900, fontSize: 18 }}>SCHub</div>
                  <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, letterSpacing: 1 }}>STUDENT CENTER HUB</div>
                </div>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.7, maxWidth: 280 }}>
                The official online marketplace for Mulungushi University Student Center. Kabwe, Zambia.
              </p>
            </div>
            {[
              { title: 'Shop', links: ['All Vendors', 'Fast Food', 'Groceries', 'Services'] },
              { title: 'Account', links: ['Sign In', 'Register', 'My Orders', 'My Bookings'] },
              { title: 'Help', links: ['How it Works', 'Contact Support', 'FAQs', 'About SCHub'] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, marginBottom: 16 }}>{col.title}</div>
                {col.links.map(l => (
                  <div key={l} style={{ marginBottom: 10 }}>
                    <Link href="/register" style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, textDecoration: 'none' }}>{l}</Link>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
            <span>2026 Student Center Hub. Mulungushi University.</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <MapPin size={12} /> Kabwe, Central Province, Zambia
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
