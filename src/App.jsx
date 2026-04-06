import React, { useState, useEffect } from 'react';
import { 
  Download, Lock, Moon, Sun, Search, Menu, X, CheckCircle, 
  Monitor, Smartphone, MessageSquare, ChevronDown, Activity, 
  Camera, ExternalLink 
} from 'lucide-react';
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { supabase } from './supabaseClient';
import Admin from './Admin'; 

// --- СТИЛЬ КНОПОК (ЕДИНЫЙ) ---
const btnClass = "px-10 py-5 text-[10px] font-[1000] uppercase tracking-[0.2em] transition-all duration-300 active:scale-95 text-center flex items-center justify-center";

// --- КОМПОНЕНТ: ЭКРАН ЗАГРУЗКИ ---
const GlobalLoader = () => (
  <div className="fixed inset-0 z-[300] bg-[var(--bg-primary)] flex items-center justify-center font-sans">
    <div className="flex flex-col items-center gap-4 w-full max-w-[200px]">
      <span className="text-[9px] font-black uppercase tracking-[0.5em] text-[var(--accent)] opacity-80 animate-pulse">
        Синхронизация
      </span>
      <div className="w-full h-[1px] bg-[var(--text-main)] opacity-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[var(--accent)] origin-left animate-loading-bar"></div>
      </div>
    </div>
  </div>
);

// --- КОМПОНЕНТ: УВЕДОМЛЕНИЯ ---
const Toast = ({ message }) => (
  <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[200] animate-in slide-in-from-right-10 duration-500">
    <div className="px-6 py-4 bg-[var(--accent)] text-white rounded-sm shadow-2xl flex items-center gap-4 border border-white/10">
      <CheckCircle size={18} />
      <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em]">{message}</span>
    </div>
  </div>
);

// --- КОМПОНЕНТ: СКЕЛЕТ ЗАГРУЗКИ ---
const SkeletonCard = () => (
  <div className="w-full h-64 bg-[var(--bg-secondary)] animate-pulse rounded-sm mb-4 border border-[var(--border)]"></div>
);

// --- КОМПОНЕНТ: FAQ (СТАТИЧНЫЙ) ---
const FAQStaticItem = ({ question, answer }) => {
  return (
    <div className="border border-[var(--border)] bg-[var(--bg-secondary)] rounded-sm overflow-hidden h-fit">
      <div className="p-6">
        <span className="text-[9px] font-[1000] uppercase tracking-widest text-[var(--accent)] leading-tight block mb-4">{question}</span>
        <div className="pt-4 border-t border-[var(--border)] text-[var(--text-main)]">
           <p className="text-[10px] opacity-60 leading-relaxed uppercase tracking-wider font-medium whitespace-pre-line">{answer}</p>
        </div>
      </div>
    </div>
  );
};

// --- СТРАНИЦА: МАГАЗИН ---
function Shop({ data, loading, setPayModal, setCurrentProduct, purchasedIds }) {
  const [activeFilter, setActiveFilter] = useState('Все');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = data.filter(item => {
    const matchesCategory = activeFilter === 'Все' || item.category === activeFilter;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="py-8 md:py-12 animate-in fade-in duration-700 max-w-6xl mx-auto flex flex-col items-center">
      <div className="w-full flex flex-col items-center mb-12 gap-8 border-b border-[var(--border)] pb-12 text-center">
        <div className="space-y-2">
          <h2 className="text-4xl md:text-5xl font-[1000] uppercase tracking-tighter italic leading-none text-[var(--text-main)]">Каталог.</h2>
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[var(--accent)] opacity-80">Объектов в базе: {filteredData.length}</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-3 w-full max-w-2xl font-sans text-[var(--text-main)]">
          <div className="flex-1 flex items-center gap-3 px-5 py-3 border border-[var(--border)] bg-[var(--bg-secondary)]">
            <Search size={16} className="opacity-30 flex-shrink-0" />
            <input type="text" placeholder="ПОИСК СТИЛЯ..." className="bg-transparent outline-none w-full text-[10px] font-black uppercase tracking-widest text-center md:text-left" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <div className="flex bg-[var(--bg-secondary)] p-1 border border-[var(--border)] overflow-x-auto no-scrollbar">
            {['Все', 'ПК', 'Мобильные'].map(cat => (
              <button key={cat} onClick={() => setActiveFilter(cat)} className={`flex-1 min-w-[90px] px-4 md:px-6 py-2 text-[9px] font-black uppercase transition-all ${activeFilter === cat ? 'bg-[var(--accent)] text-white shadow-lg' : 'opacity-40'}`}>{cat}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 w-full">
        {loading ? [...Array(3)].map((_, i) => <SkeletonCard key={i} />) : 
          filteredData.map(item => (
            <div key={item.id} className="group flex flex-col xl:flex-row items-center gap-6 md:gap-8 p-4 border border-[var(--border)] bg-[var(--bg-secondary)] hover:border-[var(--accent)]/40 transition-all duration-500 text-[var(--text-main)]">
              <div className="w-full xl:w-[280px] aspect-video xl:aspect-[4/3] overflow-hidden bg-black flex-shrink-0 relative border border-[var(--border)]">
                <ReactCompareSlider itemOne={<ReactCompareSliderImage src={item.before_url} />} itemTwo={<ReactCompareSliderImage src={item.after_url} />} className="h-full w-full object-cover" />
              </div>
              <div className="flex-1 flex flex-col justify-center text-center xl:text-left w-full">
                <div className="space-y-3">
                  <div className="flex items-center justify-center xl:justify-start gap-2 opacity-40 text-[9px] font-black uppercase tracking-[0.2em]">
                    {item.category === 'ПК' ? <Monitor size={12} /> : <Smartphone size={12} />}
                    <span>{item.category} версия</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-[1000] uppercase tracking-tighter leading-none group-hover:text-[var(--accent)] transition-colors">{item.name}</h3>
                  <div className="flex justify-center xl:justify-start gap-6 pt-4 border-t border-[var(--border)]">
                    <div className="space-y-0.5"><p className="text-[8px] font-black uppercase text-[var(--accent)] opacity-50">Софт</p><p className="text-[10px] font-bold uppercase">{item.version || 'LRC'}</p></div>
                    <div className="space-y-0.5"><p className="text-[8px] font-black uppercase text-[var(--accent)] opacity-50">Формат</p><p className="text-[10px] font-bold uppercase">{item.format || '.XMP'}</p></div>
                  </div>
                </div>
              </div>
              <div className="w-full xl:w-[220px] xl:border-l border-[var(--border)] xl:pl-8 flex flex-col items-center xl:items-end gap-4">
                <div className="text-center xl:text-right font-sans">
                  <p className="text-[9px] font-black uppercase opacity-20 tracking-widest mb-1">Цена</p>
                  <p className="text-2xl md:text-3xl font-mono font-black tracking-tighter text-[var(--accent)]">{item.price} ₸</p>
                </div>
                <button 
                  onClick={() => { setCurrentProduct(item); purchasedIds.includes(item.id) ? window.open(item.file_url) : setPayModal(true); }}
                  className={`${btnClass} w-full ${purchasedIds.includes(item.id) ? 'bg-[var(--bg-primary)] border border-[var(--border)] text-[var(--text-main)] opacity-50' : 'bg-[var(--accent)] text-white'}`}
                >
                  {purchasedIds.includes(item.id) ? 'СКАЧАТЬ' : 'ПРИОБРЕСТИ'}
                </button>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}

// --- СТРАНИЦА: БИБЛИОТЕКА ---
function Profile({ purchasedIds, data }) {
  const myPresets = data.filter(item => purchasedIds.includes(item.id));
  return (
    <div className="min-h-screen py-12 md:py-24 max-w-6xl mx-auto flex flex-col items-center">
      <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter italic mb-10 border-b border-[var(--border)] pb-10 text-center w-full text-[var(--text-main)]">Библиотека.</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 px-4 md:px-0 w-full justify-items-center text-center">
        {myPresets.length > 0 ? myPresets.map(item => (
          <div key={item.id} className="space-y-4 group w-full max-w-[280px]">
            <div className="relative aspect-[4/5] overflow-hidden border border-[var(--border)] bg-[var(--bg-secondary)]">
              <img src={item.after_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <button onClick={() => window.open(item.file_url)} className="bg-[var(--accent)] text-white p-6 rounded-sm active:scale-90 transition-transform shadow-2xl"><Download size={24} /></button>
              </div>
            </div>
            <h3 className="text-xs md:text-sm font-black uppercase tracking-tighter opacity-50 text-[var(--text-main)]">{item.name}</h3>
          </div>
        )) : (
          <div className="col-span-full py-20 opacity-10 uppercase font-black tracking-[1em] italic text-center text-[var(--text-main)]">Архив пуст</div>
        )}
      </div>
    </div>
  );
}

// --- СТРАНИЦА: ИНСТРУКЦИЯ ---
function Guide() {
  return (
    <div className="max-w-5xl mx-auto py-16 md:py-24 px-6 flex flex-col items-center">
      <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter mb-12 text-[var(--accent)] text-center leading-none">Рабочий <br/> процесс.</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center w-full">
        {[
          {s:"01", t:"Выбор стиля", d:"Перейдите в каталог и выберите набор. Используйте слайдер 'До/После' для предпросмотра."},
          {s:"02", t:"Мгновенный доступ", d:"После безопасной оплаты через наш шлюз, выбранные пресеты мгновенно разблокируются в вашей библиотеке."},
          {s:"03", t:"Установка и экспорт", d:"Скачайте файлы (.XMP для ПК или .DNG для Mobile) и импортируйте их в приложение Adobe Lightroom. Создавайте шедевры в один клик."}
        ].map((step, i) => (
          <div key={i} className="space-y-6 p-10 border border-[var(--border)] bg-[var(--bg-secondary)] flex flex-col items-center text-[var(--text-main)]">
            <span className="text-4xl font-[1000] text-[var(--accent)] opacity-20">{step.s}</span>
            <h3 className="text-xl font-black uppercase tracking-tighter">{step.t}</h3>
            <p className="opacity-60 text-[11px] leading-relaxed uppercase tracking-wider font-medium">{step.d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- ОСНОВНОЙ КОМПОНЕНТ ---
export default function App() {
  const [data, setData] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [payModal, setPayModal] = useState(false); 
  const [isPaying, setIsPaying] = useState(false); 
  const [menuOpen, setMenuOpen] = useState(false); 
  const [toast, setToast] = useState(null); 
  const [currentProduct, setCurrentProduct] = useState(null); 
  const [darkMode, setDarkMode] = useState(true); 
  const location = useLocation();

  useEffect(() => { document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light'); }, [darkMode]);

  const [purchasedIds, setPurchasedIds] = useState(() => {
    const saved = localStorage.getItem('purchased_presets');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => { fetchPresets(); }, []);
  async function fetchPresets() {
    try {
      setLoading(true);
      const { data: presets, error } = await supabase.from('presets').select('*').order('id', { ascending: false });
      if (!error) setData(presets);
    } finally { setTimeout(() => setLoading(false), 1500); }
  }

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };
  useEffect(() => { localStorage.setItem('purchased_presets', JSON.stringify(purchasedIds)); }, [purchasedIds]);
  useEffect(() => { setMenuOpen(false); window.scrollTo(0,0); }, [location]);

  const heroAsset = data[0];

  return (
    <div className="min-h-screen transition-colors duration-300 font-sans bg-[var(--bg-primary)] text-[var(--text-main)]">
      
      {loading && location.pathname === '/' && <GlobalLoader />}
      {toast && <Toast message={toast} />}

      {/* НАВИГАЦИОННАЯ ПАНЕЛЬ */}
      <nav className="sticky top-0 z-[100] border-b border-[var(--border)] bg-[var(--bg-primary)]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-6 flex justify-between items-center relative">
          <Link to="/" className="flex items-center gap-2 group flex-shrink-0 z-10 transition-all hover:opacity-80">
            <div className="bg-[var(--accent)] text-white w-9 h-9 md:w-11 md:h-11 flex items-center justify-center font-black text-xl shadow-lg">L</div>
            <span className="font-black text-xl md:text-2xl tracking-tighter uppercase text-[var(--accent)]">Presets.</span>
          </Link>
          
          <div className="hidden xl:flex items-center gap-12 text-[10px] font-black uppercase tracking-[0.3em] opacity-40 absolute left-1/2 -translate-x-1/2 text-center w-fit">
            <Link to="/catalog" className="hover:text-[var(--accent)] transition-colors">Магазин</Link>
            <Link to="/profile" className="hover:text-[var(--accent)] transition-colors">Библиотека</Link>
            <Link to="/guide" className="hover:text-[var(--accent)] transition-colors">Инструкция</Link>
          </div>

          <div className="flex gap-4 md:gap-8 items-center flex-shrink-0 z-10 text-[var(--text-main)]">
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full hover:bg-gray-500/10 transition-all text-[var(--accent)]">
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={() => setMenuOpen(true)} className="xl:hidden p-1 text-[var(--accent)]"><Menu size={28} /></button>
            <Link to="/profile" className="hidden md:flex items-center gap-4 bg-[var(--accent)] text-white px-6 py-2.5 rounded-sm text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-xl shadow-red-500/10">
               Корзина: {purchasedIds.length}
            </Link>
          </div>
        </div>
      </nav>

      <div className="relative z-10">
        <Routes>
          <Route path="/" element={
            <>
              {/* СЕКЦИЯ 1: VIDEO HERO */}
              <section className="relative h-[80vh] w-full overflow-hidden flex flex-col items-center justify-center text-center">
                {/* Видео фон */}
                <video 
                  autoPlay 
                  loop 
                  muted 
                  playsInline 
                  className="absolute inset-0 w-full h-full object-cover z-0 opacity-40 grayscale-[20%]"
                >
                  <source src="/main.mp4" type="video/mp4" />
                </video>
                
                {/* Текстовый контент поверх видео */}
                <div className="relative z-10 space-y-8 px-4">
                  <h1 className="text-6xl md:text-8xl xl:text-[10rem] font-[1000] uppercase leading-[0.8] tracking-tight text-[var(--text-main)]">
                    ТВОЙ <br/><span className="text-[var(--accent)]">СТИЛЬ.</span>
                  </h1>
                  <p className="max-w-xl mx-auto opacity-80 text-sm md:text-lg font-medium leading-relaxed uppercase tracking-wider">
                    Создавайте профессиональный контент в один клик. <br/> Все пресеты разработаны для Adobe Lightroom.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link to="/catalog" className={`${btnClass} bg-[var(--accent)] text-white shadow-2xl shadow-red-500/20 min-w-[220px]`}>
                      Открыть магазин
                    </Link>
                    <Link to="/guide" className={`${btnClass} bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-main)] hover:bg-[var(--text-main)] hover:text-[var(--bg-primary)] min-w-[220px]`}>
                      Как это работает?
                    </Link>
                  </div>
                </div>
              </section>

              {/* СЕКЦИЯ 2: СЛАЙДЕР И ТЕКСТ (НИЖЕ) */}
              <section className="py-24 border-t border-[var(--border)] max-w-7xl mx-auto px-4">
                <div className="flex flex-col xl:flex-row items-center justify-between gap-16">
                  <div className="w-full xl:w-[45%] space-y-6 text-center xl:text-left">
                     <h2 className="text-4xl md:text-6xl font-[1000] uppercase tracking-tighter italic text-[var(--text-main)]">
                        Визуальное <br/> <span className="text-[var(--accent)]">совершенство.</span>
                     </h2>
                     <p className="opacity-60 text-sm md:text-base leading-relaxed uppercase tracking-widest">
                        Сравните результат коррекции в реальном времени. Мы разработали алгоритмы, которые сохраняют текстуру кожи и естественность цветов.
                     </p>
                  </div>
                  <div className="w-full xl:w-[50%] aspect-square bg-[var(--bg-secondary)] border border-[var(--border)] shadow-2xl relative overflow-hidden">
                    <ReactCompareSlider 
                      itemOne={<ReactCompareSliderImage src={heroAsset?.before_url || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2070"} />} 
                      itemTwo={<ReactCompareSliderImage src={heroAsset?.after_url || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2070&sat=-100"} />} 
                      className="h-full w-full object-cover transition-all duration-1000" 
                    />
                  </div>
                </div>
              </section>

              <div className="py-20 md:py-40 border-t border-[var(--border)] grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 max-w-6xl mx-auto px-4">
                {[
                  {u:"Алексей К.", t:"Пресеты идеально подошли для уличной фотографии. Цвета стали глубже."},
                  {u:"Марина М.", t:"Очень удобная загрузка. DNG формат сразу импортировала в телефон."},
                  {u:"Игорь В.", t:"Минималистичный интерфейс, всё работает быстро. Рекомендую."}
                ].map((rev, i) => (
                  <div key={i} className="p-8 border border-[var(--border)] bg-[var(--bg-secondary)] space-y-6 hover:border-[var(--accent)]/30 transition-colors text-center md:text-left">
                    <MessageSquare className="text-[var(--accent)] mx-auto md:mx-0" size={20} />
                    <p className="text-xs md:text-sm font-medium leading-relaxed uppercase tracking-wider opacity-60 italic text-[var(--text-main)]">"{rev.t}"</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--accent)]">— {rev.u}</p>
                  </div>
                ))}
              </div>

              {/* FAQ */}
              <div className="py-20 md:py-40 border-t border-[var(--border)] max-w-6xl mx-auto px-4">
                <div className="mb-16 text-center">
                  <h3 className="text-4xl md:text-6xl font-[1000] uppercase tracking-tighter italic leading-none mb-6 text-[var(--text-main)]">FAQ.</h3>
                  <p className="max-w-2xl mx-auto text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-[var(--accent)] opacity-80 leading-relaxed">Вопросы и ответы</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  <div className="space-y-6">
                    <FAQStaticItem question="В каких форматах я получу пресеты?" answer="Файлы двух форматов: .XMP (ПК) и .DNG (Mobile)." />
                    <FAQStaticItem question="Как происходит покупка и получение?" answer="После оплаты ID пресета записывается в ваш архив." />
                    <FAQStaticItem question="Нужна ли подписка на Lightroom?" answer="Нет, пресеты работают даже в бесплатной мобильной версии." />
                  </div>
                  <div className="space-y-6">
                    <FAQStaticItem question="Срок доступа к материалам?" answer="Доступ предоставляется навсегда через Библиотеку." />
                    <FAQStaticItem question="Безопасность платежных данных" answer="Все платежи проходят через зашифрованный шлюз." />
                    <FAQStaticItem question="Как установить пресеты на телефон?" answer="Скачайте .DNG и выберите 'Создать стиль' в Lightroom." />
                  </div>
                </div>
              </div>
            </>
          } />
          <Route path="/catalog" element={<Shop data={data} loading={loading} setPayModal={setPayModal} setCurrentProduct={setCurrentProduct} purchasedIds={purchasedIds} />} />
          <Route path="/profile" element={<Profile purchasedIds={purchasedIds} data={data} />} />
          <Route path="/guide" element={<Guide />} />
          <Route path="/admin" element={<Admin darkMode={darkMode} />} />
        </Routes>
      </div>

      {/* ФУТЕР */}
      <footer className="mt-20 border-t border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-main)]">
        <div className="max-w-7xl mx-auto px-8 py-20 grid grid-cols-1 md:grid-cols-4 gap-12 text-center md:text-left justify-items-center md:justify-items-start">
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-[var(--accent)]">
              <div className="bg-[var(--accent)] text-white w-10 h-10 flex items-center justify-center font-black text-xl shadow-lg">L</div>
              <span className="text-2xl tracking-tighter font-black uppercase">Presets.</span>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 leading-relaxed italic">Автоматизация цвета.</p>
          </div>
          <div className="space-y-6 flex flex-col items-center md:items-start text-[10px] font-black uppercase tracking-widest opacity-50">
            <h4 className="text-[var(--accent)] opacity-100">Навигация</h4>
            <Link to="/catalog">Магазин</Link><Link to="/profile">Библиотека</Link><Link to="/guide">Инструкция</Link>
          </div>
          <div className="space-y-6 flex flex-col items-center md:items-start text-[10px] font-black uppercase tracking-widest opacity-50">
            <h4 className="text-[var(--accent)] opacity-100">Поддержка</h4>
            <span>Служба заботы</span><span>Тех. вопросы</span><span>Лицензия</span>
          </div>
          <div className="space-y-6 flex flex-col items-center md:items-start">
            <h4 className="text-[var(--accent)] font-black uppercase text-[11px] tracking-widest">Сети</h4>
            <div className="flex gap-8 opacity-40"><Camera size={22}/><ExternalLink size={22}/><MessageSquare size={22}/></div>
          </div>
        </div>
        <div className="border-t border-[var(--border)] py-10 flex flex-col items-center gap-4">
            <Link to="/admin" className="text-[9px] font-black uppercase tracking-[0.5em] opacity-10 hover:opacity-100 hover:text-[var(--accent)] transition-all duration-700">Admin Terminal</Link>
            <p className="text-[8px] font-black uppercase tracking-[0.4em] opacity-20">© LightPresets System. All rights reserved.</p>
        </div>
      </footer>

      {/* ОПЛАТА */}
      {payModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[150] flex items-center justify-center p-4">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-main)] w-full max-w-lg p-8 md:p-16 shadow-2xl relative animate-in zoom-in-95 duration-300 flex flex-col items-center text-center">
            {!isPaying && <button onClick={() => setPayModal(false)} className="absolute top-6 right-6 opacity-30 hover:opacity-100 transition-opacity font-bold text-2xl text-[var(--text-main)]">✕</button>}
            <div className="space-y-8 w-full">
              <div className="text-center space-y-4">
                <h2 className="text-[10px] font-[1000] uppercase tracking-[0.5em] text-[var(--accent)] flex items-center justify-center gap-3">
                  {isPaying ? <Activity size={16} className="animate-spin" /> : <Lock size={16}/>} {isPaying ? "Связь с банком..." : "Оплата"}
                </h2>
                <p className="text-[10px] opacity-30 uppercase font-black italic text-[var(--text-main)]">{currentProduct?.name}</p>
              </div>
              <div className={`space-y-8 transition-opacity duration-500 ${isPaying ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
                <input type="text" maxLength="19" placeholder="НОМЕР КАРТЫ" className="w-full bg-transparent border-b border-[var(--border)] py-4 outline-none font-mono text-base md:text-lg focus:border-[var(--accent)] text-[var(--text-main)] text-center" onChange={(e) => {e.target.value = e.target.value.replace(/\W/gi, '').replace(/(.{4})/g, '$1 ').trim();}} />
                <div className="grid grid-cols-2 gap-8">
                  <input type="text" maxLength="5" placeholder="ММ / ГГ" className="bg-transparent border-b border-[var(--border)] py-4 outline-none text-sm focus:border-[var(--accent)] text-[var(--text-main)] text-center" />
                  <input type="password" maxLength="3" placeholder="CVC" className="bg-transparent border-b border-[var(--border)] py-4 outline-none text-sm focus:border-[var(--accent)] text-[var(--text-main)] text-center" />
                </div>
              </div>
              <button disabled={isPaying} onClick={() => { setIsPaying(true); setTimeout(() => { setPurchasedIds([...purchasedIds, currentProduct.id]); setPayModal(false); setIsPaying(false); showToast("Пакет успешно добавлен в архив"); }, 2500); }} className={`${btnClass} w-full bg-[var(--accent)] text-white`}>
                {isPaying ? "ОБРАБОТКА..." : `Оплатить ${currentProduct?.price} ₸`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
