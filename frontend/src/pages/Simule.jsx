import { useState } from "react";
import Chatbot from './Chatbot';
function DemoOverlay() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.82)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Orta mesaj */}
      <div style={{ maxWidth: 360, textAlign: "center", padding: "2rem" }}>
        <div
          style={{
            width: 52,
            height: 52,
            background: "rgba(255,255,255,0.15)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.25rem",
            border: "1.5px solid rgba(255,255,255,0.3)",
            fontSize: 24,
          }}
        >
          🤖
        </div>
        <p
          style={{
            color: "white",
            fontSize: 17,
            fontWeight: 500,
            lineHeight: 1.65,
            margin: "0 0 1.75rem",
          }}
        >
          Bu sayfa size sağladığımız yapay zeka konuşma botunun test sayfasıdır
        </p>
        <button
          onClick={() => setVisible(false)}
          style={{
            background: "white",
            color: "#1c1917",
            border: "none",
            borderRadius: 99,
            padding: "10px 28px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            letterSpacing: "0.02em",
          }}
        >
          Anladım, devam et
        </button>
      </div>


      {/* Sağ alt köşe: ok + chatbot simgesi */}
      <div
        style={{
          position: "fixed",
          bottom: 32,
          right: 32,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 10,
        }}
      >
        <div className="fixed bottom-8 right-8 flex flex-col items-end gap-3">

          <div className="flex items-center gap-3 mr-15">
            <span className="text-white text-xl font-bold tracking-wide drop-shadow-lg">
              Sohbet botu burada
            </span>
            <span
              style={{ animation: "bounceArrow 0.9s ease-in-out infinite", fontSize: 32, lineHeight: 1 }}
            >
              ↘
            </span>
          </div>

          <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-3xl self-end shadow-lg ring-4 ring-indigo-400 ring-opacity-50">
            💬
          </div>

        </div>

        <style>{`
  @keyframes bounceArrow {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(6px, 6px) scale(1.3); }
  }
`}</style>
      </div>

      <style>{`
  @keyframes bounceArrow {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(5px, 5px) scale(1.25); }
  }
`}</style>

      <style>{`
        @keyframes bounceArrow {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(4px, 4px); }
        }
      `}</style>
    </div>
  );
}


// ─── Mock Data ───────────────────────────────────────────────────────────────

const NAV_LINKS = ["Kadın", "Erkek", "Çocuk", "Yeni Gelenler", "Sale"];

const CATEGORIES = [
  { label: "Üst Giyim", img: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=400&q=80", count: "124 ürün" },
  { label: "Alt Giyim", img: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&q=80", count: "89 ürün" },
  { label: "Elbise", img: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&q=80", count: "67 ürün" },
  { label: "Dış Giyim", img: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=400&q=80", count: "43 ürün" },
];

const PRODUCTS = [
  {
    id: 1,
    name: "Oversize Keten Gömlek",
    price: "899 ₺",
    oldPrice: "1.199 ₺",
    tag: "Yeni",
    img: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&q=80",
    colors: ["#e8d5b7", "#6b7280", "#1f2937"],
  },
  {
    id: 2,
    name: "Wide Leg Denim Pantolon",
    price: "1.249 ₺",
    oldPrice: null,
    tag: "Çok Satan",
    img: "https://images.unsplash.com/photo-1582418702059-97ebafb35d09?w=400&q=80",
    colors: ["#1d4ed8", "#374151", "#7c3aed"],
  },
  {
    id: 3,
    name: "Midi Saten Elbise",
    price: "1.599 ₺",
    oldPrice: "2.100 ₺",
    tag: "%24 İndirim",
    img: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&q=80",
    colors: ["#fbbf24", "#f9a8d4", "#e2e8f0"],
  },
  {
    id: 4,
    name: "Bomber Ceket",
    price: "2.199 ₺",
    oldPrice: null,
    tag: "Yeni",
    img: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80",
    colors: ["#064e3b", "#1c1917", "#7c3aed"],
  }
];

const TESTIMONIALS = [
  { name: "Ayşe K.", text: "Kalite gerçekten üstün, ürünler tam tanımlandığı gibi geldi. Kesinlikle tekrar alışveriş yapacağım.", avatar: "AK", rating: 5 },
  { name: "Mert D.", text: "Hızlı kargo ve şık paketleme. Aldığım ceket tam aradığım kombinleri tamamladı.", avatar: "MD", rating: 5 },
  { name: "Selin R.", text: "Beden tablosu çok işe yarıyor, doğru bedeni seçtim ve kusursuz oturdu.", avatar: "SR", rating: 4 },
];

// ─── Sub-Components ───────────────────────────────────────────────────────────

function StarRating({ count }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className={`w-4 h-4 ${i < count ? "text-amber-400" : "text-gray-300"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function ProductCard({ product }) {
  const [liked, setLiked] = useState(false);
  const [adding, setAdding] = useState(false);

  const handleAdd = () => {
    setAdding(true);
    setTimeout(() => setAdding(false), 1200);
  };

  const tagColor = product.tag.includes("İndirim") || product.tag === "Sale"
    ? "bg-rose-500 text-white"
    : product.tag === "Premium"
      ? "bg-amber-600 text-white"
      : product.tag === "Çok Satan"
        ? "bg-violet-600 text-white"
        : "bg-stone-900 text-white";

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-stone-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="relative overflow-hidden bg-stone-100 aspect-[3/4]">
        <img
          src={product.img}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full ${tagColor}`}>
          {product.tag}
        </span>
        <button
          onClick={() => setLiked(!liked)}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow hover:scale-110 transition-transform"
          aria-label="Favorilere ekle"
        >
          <svg className={`w-5 h-5 transition-colors ${liked ? "text-rose-500 fill-rose-500" : "text-stone-400"}`} fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={handleAdd}
            className={`w-full py-3.5 text-sm font-semibold tracking-wide transition-colors ${adding ? "bg-emerald-600 text-white" : "bg-stone-900 text-white hover:bg-stone-700"}`}
          >
            {adding ? "✓ Sepete Eklendi" : "Sepete Ekle"}
          </button>
        </div>
      </div>
      <div className="p-4 flex flex-col gap-2">
        <p className="text-stone-800 font-medium text-sm leading-tight">{product.name}</p>
        <div className="flex items-center gap-2">
          <span className="text-stone-900 font-bold">{product.price}</span>
          {product.oldPrice && <span className="text-stone-400 text-sm line-through">{product.oldPrice}</span>}
        </div>
        <div className="flex gap-1.5 mt-1">
          {product.colors.map((c, i) => (
            <span key={i} className="w-4 h-4 rounded-full border border-stone-200 cursor-pointer hover:scale-125 transition-transform" style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount] = useState(2);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-stone-100">
      {/* Announcement Bar */}
      <div className="bg-stone-900 text-stone-100 text-center text-xs py-2 tracking-widest font-medium">
        ÜCRETSİZ KARGO — 500 ₺ ÜZERİ TÜM SİPARİŞLERDE
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Mobile menu toggle */}
          <button className="lg:hidden p-2 -ml-2 text-stone-600" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menü">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>

          {/* Logo */}
          <a href="#" className="flex-shrink-0 text-2xl font-black tracking-tight text-stone-900" style={{ fontFamily: "'Georgia', serif", letterSpacing: "-0.04em" }}>
            VELOUR
          </a>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a key={link} href="#" className={`text-sm font-medium transition-colors hover:text-stone-900 ${link === "Sale" ? "text-rose-600 font-semibold" : "text-stone-600"}`}>
                {link}
              </a>
            ))}
          </nav>

          {/* Right Icons */}
          <div className="flex items-center gap-3">
            {searchOpen ? (
              <div className="flex items-center gap-2 bg-stone-100 rounded-full px-4 py-1.5">
                <svg className="w-4 h-4 text-stone-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="m21 21-4.35-4.35" />
                </svg>
                <input autoFocus className="bg-transparent text-sm outline-none w-36 placeholder:text-stone-400" placeholder="Ürün ara…" onBlur={() => setSearchOpen(false)} />
              </div>
            ) : (
              <button onClick={() => setSearchOpen(true)} className="p-2 text-stone-600 hover:text-stone-900 transition-colors" aria-label="Ara">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="m21 21-4.35-4.35" />
                </svg>
              </button>
            )}
            <button className="p-2 text-stone-600 hover:text-stone-900 transition-colors" aria-label="Hesabım">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
              </svg>
            </button>
            <button className="relative p-2 text-stone-600 hover:text-stone-900 transition-colors" aria-label="Sepet">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="lg:hidden border-t border-stone-100 bg-white">
          <nav className="flex flex-col px-6 py-4 gap-4">
            {NAV_LINKS.map((link) => (
              <a key={link} href="#" className={`text-base font-medium ${link === "Sale" ? "text-rose-600" : "text-stone-700"}`}>
                {link}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative min-h-[85vh] flex items-end overflow-hidden bg-stone-900">
      <img
        src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=90"
        alt="Hero"
        className="absolute inset-0 w-full h-full object-cover opacity-70"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/30 to-transparent" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 w-full">
        <div className="max-w-xl">
          <span className="inline-block text-amber-400 text-sm font-semibold tracking-[0.2em] uppercase mb-4">
            2025 Yaz Koleksiyonu
          </span>
          <h1 className="text-white text-5xl sm:text-6xl lg:text-7xl font-black leading-none tracking-tight mb-6" style={{ fontFamily: "'Georgia', serif" }}>
            Kendinizi<br />
            <span className="italic font-normal text-amber-300">Özgürce</span><br />
            İfade Edin
          </h1>
          <p className="text-stone-300 text-lg mb-8 max-w-sm leading-relaxed">
            Yaz esintisini taşıyan hafif kumaşlar ve zamansız silüetlerle sezonun en özel parçaları sizlerle.
          </p>
          <div className="flex flex-wrap gap-4">
            <button className="bg-white text-stone-900 px-8 py-3.5 rounded-full font-semibold text-sm tracking-wide hover:bg-amber-300 transition-colors duration-200">
              Koleksiyonu Keşfet
            </button>
            <button className="border border-white/50 text-white px-8 py-3.5 rounded-full font-semibold text-sm tracking-wide hover:bg-white/10 transition-colors duration-200">
              Yeni Gelenler
            </button>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 right-8 hidden md:flex flex-col items-center gap-2 text-white/50">
        <span className="text-xs tracking-widest rotate-90 mb-1">SCROLL</span>
        <div className="w-0.5 h-10 bg-white/30 relative overflow-hidden rounded">
          <div className="w-full bg-white/70 absolute top-0 animate-bounce" style={{ height: "40%", animationDuration: "1.5s" }} />
        </div>
      </div>
    </section>
  );
}

// ─── Categories Strip ─────────────────────────────────────────────────────────

function Categories() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="text-amber-600 text-xs font-semibold tracking-[0.2em] uppercase mb-2">Kategoriler</p>
          <h2 className="text-3xl font-black text-stone-900" style={{ fontFamily: "'Georgia', serif" }}>Nereye Bakalım?</h2>
        </div>
        <a href="#" className="text-sm text-stone-500 hover:text-stone-900 transition-colors underline underline-offset-4 hidden sm:block">
          Tüm kategoriler
        </a>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {CATEGORIES.map((cat) => (
          <a key={cat.label} href="#" className="group relative rounded-2xl overflow-hidden aspect-[3/4] bg-stone-200 cursor-pointer">
            <img src={cat.img} alt={cat.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/70 to-transparent" />
            <div className="absolute bottom-4 left-4">
              <p className="text-white font-bold text-lg leading-tight">{cat.label}</p>
              <p className="text-stone-300 text-xs mt-0.5">{cat.count}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

// ─── Products ─────────────────────────────────────────────────────────────────

function Products() {
  const [activeFilter, setActiveFilter] = useState("Tümü");
  const filters = ["Tümü", "Yeni Gelenler", "Çok Satanlar", "İndirimli"];

  return (
    <section className="bg-stone-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-6">
          <div>
            <p className="text-amber-600 text-xs font-semibold tracking-[0.2em] uppercase mb-2">Öne Çıkanlar</p>
            <h2 className="text-3xl font-black text-stone-900" style={{ fontFamily: "'Georgia', serif" }}>Seçilmiş Parçalar</h2>
          </div>
          <div className="flex gap-2 flex-wrap">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeFilter === f ? "bg-stone-900 text-white" : "bg-white text-stone-600 border border-stone-200 hover:border-stone-400"}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {PRODUCTS.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
        <div className="text-center mt-12">
          <button className="border-2 border-stone-900 text-stone-900 px-10 py-3.5 rounded-full font-semibold text-sm tracking-wide hover:bg-stone-900 hover:text-white transition-colors duration-200">
            Tüm Ürünleri Gör
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── Banner ───────────────────────────────────────────────────────────────────


// ─── Testimonials ─────────────────────────────────────────────────────────────

function Testimonials() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center mb-12">
        <p className="text-amber-600 text-xs font-semibold tracking-[0.2em] uppercase mb-2">Müşteri Yorumları</p>
        <h2 className="text-3xl font-black text-stone-900" style={{ fontFamily: "'Georgia', serif" }}>Ne Diyorlar?</h2>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {TESTIMONIALS.map((t) => (
          <div key={t.name} className="bg-white border border-stone-100 rounded-2xl p-6 hover:shadow-lg transition-shadow">
            <StarRating count={t.rating} />
            <p className="text-stone-700 text-sm leading-relaxed mt-4 mb-6">"{t.text}"</p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-stone-900 text-white text-xs font-bold flex items-center justify-center">
                {t.avatar}
              </div>
              <span className="text-stone-800 text-sm font-semibold">{t.name}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Newsletter ───────────────────────────────────────────────────────────────

function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (email.includes("@")) {
      setSubmitted(true);
    }
  };

  return (
    <section className="bg-stone-900 py-20">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <p className="text-amber-400 text-xs font-semibold tracking-[0.2em] uppercase mb-3">Bültenimize Katıl</p>
        <h2 className="text-3xl sm:text-4xl font-black text-white mb-4" style={{ fontFamily: "'Georgia', serif" }}>
          Trendi Kaçırma
        </h2>
        <p className="text-stone-400 mb-8 text-base">
          Yeni koleksiyonlardan, özel indirimlerden ve stil ipuçlarından ilk sen haberdar ol.
        </p>
        {submitted ? (
          <div className="text-emerald-400 font-semibold text-lg">✓ Harika! Bültenimize kaydedildiniz.</div>
        ) : (
          <div className="flex gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="E-posta adresiniz"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="flex-1 bg-white/10 border border-white/20 text-white placeholder:text-stone-500 rounded-full px-5 py-3 text-sm outline-none focus:border-amber-400 transition-colors"
            />
            <button
              onClick={handleSubmit}
              className="bg-amber-400 text-stone-900 px-6 py-3 rounded-full font-semibold text-sm hover:bg-amber-300 transition-colors whitespace-nowrap"
            >
              Abone Ol
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  const links = {
    "Müşteri Hizmetleri": ["Yardım Merkezi", "Sipariş Takibi", "İade & Değişim", "Boyut Rehberi"],
    "Şirket": ["Hakkımızda", "Basın", "Kariyer", "Sürdürülebilirlik"],
    "Yasal": ["Gizlilik Politikası", "Kullanım Koşulları", "Çerez Politikası"],
  };

  return (
    <footer className="bg-stone-950 text-stone-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          <div className="col-span-2">
            <span className="text-2xl font-black text-white" style={{ fontFamily: "'Georgia', serif", letterSpacing: "-0.04em" }}>
              VELOUR
            </span>
            <p className="mt-4 text-sm leading-relaxed max-w-xs">
              Kaliteli kumaşlar, özgün tasarımlar ve sürdürülebilir üretimle giyimde yeni bir deneyim.
            </p>
            <div className="flex gap-4 mt-6">
              {["instagram", "twitter", "facebook", "youtube"].map((s) => (
                <a key={s} href="#" className="w-9 h-9 rounded-full border border-stone-700 flex items-center justify-center hover:border-amber-400 hover:text-amber-400 transition-colors text-xs uppercase font-bold">
                  {s[0].toUpperCase()}
                </a>
              ))}
            </div>
          </div>
          {Object.entries(links).map(([group, items]) => (
            <div key={group}>
              <h4 className="text-white text-sm font-semibold mb-4 tracking-wide">{group}</h4>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm hover:text-white transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-stone-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-stone-600">© 2025 Velour. Tüm hakları saklıdır.</p>
          <div className="flex gap-3 items-center">
            {["VISA", "MC", "AMEX", "PayTR"].map((card) => (
              <span key={card} className="text-[10px] font-bold border border-stone-700 rounded px-2 py-0.5 text-stone-500">
                {card}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function SimulePage() {
  return (
    <div className="min-h-screen bg-white">
      <DemoOverlay />
      <Header />
      <main>
        <Hero />
        <Categories />
        <Products />

        <Testimonials />
        <Newsletter />
        <Chatbot />
      </main>
      <Footer />
    </div>
  );
}