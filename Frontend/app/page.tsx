'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';
import {
  ShoppingBag, Calendar, Bell, Shield, Star, ArrowRight,
  MapPin, Clock, Users, TrendingUp, ChevronRight, Zap,
  Scissors, Printer, Cpu, Pill, Beef, Utensils, Search,
  Tag, Truck, Phone, ChevronDown, Menu, X, Heart,
  ShoppingCart, Package, CheckCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';



const fadeUp = {
  hidden:  { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.08, ease: 'easeOut' as const } }),
};

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser ] = useState<any>(null);
  const initials = user?.name?.split('').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() || 'S';
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroY = useTransform(scrollY, [0, 400], [0, 80]);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user');
    setIsLoggedIn(!!token);
    if(storedUser) setUser(JSON.parse(storedUser));
  }, []);
  
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
          <div style= {{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0}}>
            {isLoggedIn ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Link href="/dashboard" style={{
                  background: '#0D2B5E', color: '#fff', textDecoration: 'none',
                  padding: '10px 20px', fontWeight: 700, fontSize: 14,
                  borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6,
                  border: '2px solid #E8EBF2',
                }}>
                  <ShoppingCart size={15} /> My Dashboard
                </Link>
                <Link href="/profile" style={{ textDecoration: 'none', marginRight: 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'right', gap: 10 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: '#F5A623', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontWeight: 900, fontSize: 15,
                    color: '#0D2B5E', flexShrink: 0, cursor: 'pointer',
                  }}>
                    {initials}
                  </div>
                </div>
                </Link>
                
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>
         </div>

      </motion.nav>

      {/* HERO */}
      <section style={{
        backgroundImage:
        "linear-gradient(rgba(13,43,94,0.82), rgba(22,52,96,0.88)), url('Gemini_Generated_Image_rag92grag92grag9.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        padding: '0 5%',
        overflow: 'hidden',
        position: 'relative',
      }}>

        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center', minHeight: 720, padding: '48px 0' }}>
          {/* Left */}
          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
    
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
              { !isLoggedIn && (
                <Link href="/register" style={{
                background: '#F5A623', color: '#0D2B5E', fontWeight: 800,
                padding: '14px 28px', borderRadius: 10, textDecoration: 'none',
                fontSize: 15, display: 'flex', alignItems: 'center', gap: 8,
                boxShadow: '0 8px 24px rgba(245,166,35,0.35)',
              }}>
                <ShoppingBag size={18} /> Start Shopping
              </Link>
              )}
              <Link href="/vendors" style={{
                background: 'rgba(90, 114, 111, 0.1)', color: '#fff',
                border: '1.5px solid rgba(255,255,255,0.25)',
                padding: '14px 28px', borderRadius: 10, textDecoration: 'none',
                fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8,
                backdropFilter: 'blur(10px)',
              }}>
                Browse Vendors <ChevronRight size={18} />
              </Link>
            </motion.div>

            
          </motion.div>

         
        </div>
      </section>

      <section style={{ background: '#FFFFFF', padding: '88px 5%', borderTop: '1px solid #EAEAEA' }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          viewport={{ once: true, amount: 0.2 }}
          style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}
        >
          <div>
            <h2 style={{ fontSize: 'clamp(1.9rem, 2.8vw, 2.75rem)', fontWeight: 900, color: '#0A0F1E', lineHeight: 1.06, letterSpacing: -1, marginBottom: 14 }}>
              All the best campus eats.
            </h2>
            <p style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0D2B5E', marginBottom: 14, lineHeight: 1.45 }}>
              Food delivered by the tap of a finger.
            </p>
            <p style={{ fontSize: '0.96rem', color: '#6B7280', lineHeight: 1.85, marginBottom: 32, maxWidth: 460 }}>
              Get a whole shawarma delivered, or pick up any fast food — from fried chips to grilled chicken, or make an order for ice cream.
            </p>
            <div style={{ width: 48, height: 4, background: '#F39C12', borderRadius: 4, marginBottom: 32 }} />
            {!isLoggedIn ? (<Link href="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: '#0D2B5E', color: '#fff', fontWeight: 700, padding: '14px 28px', borderRadius: 10, textDecoration: 'none', fontSize: 15 }}
              className="transition-transform duration-300 hover:translate-x-2">
               View Restruants <ChevronRight size={17} />
            </Link>) : (
              <Link href="/vendors" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: '#0D2B5E', color: '#fff', fontWeight: 700, padding: '14px 28px', borderRadius: 10, textDecoration: 'none', fontSize: 15 }}
              className="transition-transform duration-300 hover:translate-x-2">
               View Restruants <ChevronRight size={17} />
            </Link>
            )}
          </div>

          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, background: '#FFF8EC', borderRadius: 24, transform: 'translate(14px, 14px)', zIndex: 0 }} />
            <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', zIndex: 1, aspectRatio: '4/3' }}>
              <img src='Gemini_Generated_Image_18aier18aier18ai.png' alt="Campus fast food" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
          </div>
        </motion.div>
      </section>
 
      <section style={{ background: '#F4F6FB', padding: '88px 5%', borderTop: '1px solid #EAEAEA' }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          viewport={{ once: true, amount: 0.2 }}
          style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}
        >
          <div style={{ order: 2 }}>
            <h2 style={{ fontSize: 'clamp(1.9rem, 2.8vw, 2.75rem)', fontWeight: 900, color: '#0A0F1E', lineHeight: 1.06, letterSpacing: -1, marginBottom: 14 }}>
              Essentials, without leaving campus.
            </h2>
            <p style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0D2B5E', marginBottom: 14, lineHeight: 1.45 }}>
              Delivery designed around your lifestyle.
            </p>
            <p style={{ fontSize: '0.96rem', color: '#6B7280', lineHeight: 1.85, marginBottom: 32, maxWidth: 460 }}>
              Fill your basket with fresh produce, deli favourites, frozen foods, beverages, and household essentials without leaving your room.
            </p>
            <div style={{ width: 48, height: 4, background: '#2ECC71', borderRadius: 4, marginBottom: 32 }} />
            {!isLoggedIn ? (<Link href="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: '#0D2B5E', color: '#fff', fontWeight: 700, padding: '14px 28px', borderRadius: 10, textDecoration: 'none', fontSize: 15 }}
              className="transition-transform duration-300 hover:translate-x-2">
              Buy Groceries <ChevronRight size={17} />
            </Link>) : (
              <Link href="/vendors" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: '#0D2B5E', color: '#fff', fontWeight: 700, padding: '14px 28px', borderRadius: 10, textDecoration: 'none', fontSize: 15 }}
              className="transition-transform duration-300 hover:translate-x-2">
              Buy Groceries <ChevronRight size={17} />
            </Link>
            )}
          </div>

          <div style={{ position: 'relative', order: 1 }}>
            <div style={{ position: 'absolute', inset: 0, background: '#E8FAF1', borderRadius: 24, transform: 'translate(-14px, 14px)', zIndex: 0 }} />
            <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', zIndex: 1, aspectRatio: '4/3' }}>
              <img src="Gemini_Generated_Image_ldwbd4ldwbd4ldwb.png" alt="Grocery and essentials" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
          </div>
        </motion.div>
      </section>
 
      <section style={{ background: '#FFFFFF', padding: '88px 5%', borderTop: '1px solid #EAEAEA' }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          viewport={{ once: true, amount: 0.2 }}
          style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}
        >
           
          <div>
            <h2 style={{ fontSize: 'clamp(1.9rem, 2.8vw, 2.75rem)', fontWeight: 900, color: '#0A0F1E', lineHeight: 1.06, letterSpacing: -1, marginBottom: 14 }}>
              Daily health essentials, effortlessly.
            </h2>
            <p style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0D2B5E', marginBottom: 14, lineHeight: 1.45 }}>
              Pharmacy products exactly the way you want them.
            </p>
            <p style={{ fontSize: '0.96rem', color: '#6B7280', lineHeight: 1.85, marginBottom: 32, maxWidth: 460 }}>
              Discover trusted medicines, supplements, skincare products, and healthcare necessities — all in one convenient place.
            </p>
            <div style={{ width: 48, height: 4, background: '#1ABC9C', borderRadius: 4, marginBottom: 32 }} />
            { !isLoggedIn ? (<Link href="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: '#0D2B5E', color: '#fff', fontWeight: 700, padding: '14px 28px', borderRadius: 10, textDecoration: 'none', fontSize: 15 }}
              className="transition-transform duration-300 hover:translate-x-2">
               View Medication <ChevronRight size={17} />
            </Link>) : (
              <Link href="/vendors" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: '#0D2B5E', color: '#fff', fontWeight: 700, padding: '14px 28px', borderRadius: 10, textDecoration: 'none', fontSize: 15 }}
              className="transition-transform duration-300 hover:translate-x-2">
               View Medication <ChevronRight size={17} />
            </Link>
            )}
          </div>

          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, background: '#E8FAF7', borderRadius: 24, transform: 'translate(14px, 14px)', zIndex: 0 }} />
            <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', zIndex: 1, aspectRatio: '4/3' }}>
              <img src='Gemini_Generated_Image_5s8imd5s8imd5s8i.png' alt="Campus pharmacy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
          </div>
        </motion.div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: '64px 5%', background: '#F4F6FB' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
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
      {!isLoggedIn && (<section style={{
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
      )}
      

      {/* FOOTER */}
      <footer style={{ background: '#0A0F1E', padding: '48px 5% 24px', color: 'rgba(255,255,255,0.5)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, marginBottom: 40 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
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
