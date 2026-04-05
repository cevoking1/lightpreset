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

// --- КОМПОНЕНТ: ВОПРОС-ОТВЕТ (FAQ) ---
const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-[var(--border)] bg-[var(--bg-secondary)] rounded-sm overflow-hidden transition-all duration-300 hover:border-[var(--accent)]/30">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 flex justify-between items-center text-left transition-colors group"
      >
        <span className="text-[10px] font-[1000] uppercase tracking-widest pr-4 leading-tight">{question}</span>
        <ChevronDown size={14} className={`flex-shrink-0 transition-transform duration-500 ${isOpen ? 'rotate-180 text-[var(--accent)]' : 'opacity-20'}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-500 ${isOpen ? 'max-h-[500px]' : 'max-h-0'}`}>
        <div className="p-6 pt-0 border-t border-[var(--border)]">
           <p className="text-[11px] opacity-60 leading-relaxed uppercase tracking-wider font-medium whitespace-pre-line">{answer}</p>
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
    <div className="py-8 md:py-12 animate-in fade-in duration-700 max-w-6xl mx-auto">
      <div className="flex flex-col xl:flex-row justify-between items-center xl:items-end mb-12 gap-8 border-b border-[var(--border)] pb-8 text-center xl:text-left">
        <div className="space-y-2">
          <h2 className="text-4xl md:text-5xl font-[1000] uppercase tracking-tighter italic leading-none">Каталог.</h2>
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[var(--accent)] opacity-80">
            Объектов в базе: {filteredData.length}
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-3 w-full max-w-2xl font-sans">
          <div className="flex-1 flex items-center gap-3 px-5 py-3 border border-[var(--border)] bg-[var(--bg-secondary)] transition-all">
            <Search size={16} className="opacity-30 flex-shrink-0" />
            <input type="text" placeholder="ПОИСК СТИЛЯ..." className="bg-transparent outline-none w-full text-[10px] font-black uppercase tracking-widest" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <div className="flex bg-[var(--bg-secondary)] p-1 border border-[var(--border)] overflow-x-auto no-scrollbar">
            {['Все', 'ПК', 'Мобильные'].map(cat => (
              <button key={cat} onClick={() => setActiveFilter(cat)} className={`flex-1 min-w-[90px] px-4 md:px-6 py-2 text-[9px] font-black uppercase transition-all ${activeFilter === cat ? 'bg-[var(--accent)] text-white shadow-lg' : 'opacity-40'}`}>{cat}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? [...Array(3)].map((_, i) => <SkeletonCard key={i} />) : 
          filteredData.map(item => (
            <div key={item.id} className="group flex flex-col xl:flex-row items-center gap-6 md:gap-8 p-4 border border-[var(--border)] bg-[var(--bg-secondary)] transition-all duration-500 hover:border-[var(--accent)]/40">
              <div className="w-full xl:w-[280px] aspect-video xl:aspect-[4/3] overflow-hidden bg-black flex-shrink-0 relative border border-[var(--border)]">
                <ReactCompareSlider 
                  itemOne={<ReactCompareSliderImage src={item.before_url} />} 
                  itemTwo={<ReactCompareSliderImage src={item.after_url} />} 
                  className="h-full w-full object-cover" 
                />
              </div>
              <div className="flex-1 flex flex-col justify-center text-center xl:text-left w-full">
                <div className="space-y-3">
                  <div className="flex items-center justify-center xl:justify-start gap-2 opacity-40 text-[9px] font-black uppercase tracking-[0.2em]">
                    {item.category === 'ПК' ? <Monitor size={12} /> : <Smartphone size={12} />}
                    <span>{item.category} версия</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-[1000] uppercase tracking-tighter leading-none group-hover:text-[var(--accent)] transition-colors">{item.name}</h3>
                  <div className="flex justify-center xl:justify-start gap-6 pt-4 border-t border-[var(--border)]">
                    <div className="space-y-0.5">
                      <p className="text-[8px] font-black uppercase text-[var(--accent)] opacity-50">Софт</p>
                      <p className="text-[10px] font-bold uppercase">{item.version || 'LRC'}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[8px] font-black uppercase text-[var(--accent)] opacity-50">Формат</p>
                      <p className="text-[10px] font-bold uppercase">{item.format || '.XMP'}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full xl:w-[220px] xl:border-l border-[var(--border)] xl:pl-8 flex flex-col justify-center gap-4">
                <div className="flex flex-row xl:flex-col justify-between items-center xl:items-end px-2 xl:px-0 font-sans">
                  <p className="text-[9px] font-black uppercase opacity-20 tracking-widest">Цена</p>
                  <p className="text-2xl md:text-3xl font-mono font-black tracking-tighter text-[var(--accent)]">{item.price} ₸</p>
                </div>
                <button 
                  onClick={() => { setCurrentProduct(item); purchasedIds.includes(item.id) ? window.open(item.file_url) : setPayModal(true); }}
                  className={`w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${
                    purchasedIds.includes(item.id) ? 'border-[var(--border)] bg-[var(--bg-primary)] opacity-50 cursor-default' : 'bg-[var(--accent)] text-white border-[var(--accent)] active:scale-95'
                  }`}
                >
                  {purchasedIds.includes(item.id) ? 'В КОЛЛЕКЦИИ' : 'ПРИОБРЕСТИ'}
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
    <div className="min-h-screen py-12 md:py-24 max-w-6xl mx-auto font-sans">
      <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter italic mb-10 border-b border-[var(--border)] pb-10 text-center md:text-left">Библиотека.</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10 px-4 md:px-0">
        {myPresets.length > 0 ? myPresets.map(item => (
          <div key={item.id} className="space-y-4 group">
            <div className="relative aspect-[4/5] overflow-hidden border border-[var(--border)] bg-[var(--bg-secondary)]">
              <img src={item.after_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <button onClick={() => window.open(item.file_url)} className="bg-[var(--accent)] text-white p-5 rounded-sm active:scale-90 transition-transform shadow-2xl">
                  <Download size={24} />
                </button>
              </div>
            </div>
            <h3 className="text-xs md:text-sm font-black uppercase text-center tracking-tighter opacity-50 group-hover:opacity-100 transition-opacity">{item.name}</h3>
          </div>
        )) : (
          <div className="col-span-full py-20 md:py-40 text-center opacity-10 uppercase font-black tracking-[1em] italic">Библиотека пуста</div>
        )}
      </div>
    </div>
  );
}

// --- СТРАНИЦА: ИНСТРУКЦИЯ ---
function Guide() {
  return (
    <div className="max-w-5xl mx-auto py-16 md:py-24 px-6 font-sans">
      <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter mb-12 text-[var(--accent)] text-center md:text-left leading-none">Рабочий <br/> процесс.</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
        {[
          {s:"01", t:"Выбор стиля", d:"Перейдите в каталог и выберите подходящий набор пресетов. Используйте слайдер 'До/После', чтобы увидеть результат коррекции на реальных примерах."},
          {s:"02", t:"Мгновенный доступ", d:"После безопасной оплаты через наш шлюз, выбранные пресеты мгновенно разблокируются в вашем личном кабинете (Библиотека)."},
          {s:"03", t:"Установка и экспорт", d:"Скачайте файлы (.XMP для ПК или .DNG для Mobile) и импортируйте их в приложение Adobe Lightroom. Создавайте шедевры в один клик."}
        ].map((step, i) => (
          <div key={i} className="space-y-6 p-8 border border-[var(--border)] bg-[var(--bg-secondary)] rounded-sm">
            <span className="text-4xl font-[1000] text-[var(--accent)] opacity-20">{step.s}</span>
            <h3 className="text-xl font-black uppercase tracking-tighter">{step.t}</h3>
            <p className="opacity-60 text-xs leading-relaxed uppercase tracking-wider font-medium">{step.d}</p>
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

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

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
    } finally { 
      setTimeout(() => setLoading(false), 1500); 
    }
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
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-6 flex justify-between items-center">
          <div className="flex items-center gap-6 md:gap-16">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-[var(--accent)] text-white w-8 h-8 md:w-10 md:h-10 flex items-center justify-center font-black text-lg transition-transform group-hover:-rotate-6">L</div>
              <span className="font-black text-xl md:text-2xl tracking-tighter uppercase text-[var(--accent)]">Presets.</span>
            </Link>
            <div className="hidden xl:flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
              <Link to="/catalog" className="hover:text-[var(--accent)] transition-colors">Магазин</Link>
              <Link to="/profile" className="hover:text-[var(--accent)] transition-colors">Библиотека</Link>
              <Link to="/guide" className="hover:text-[var(--accent)] transition-colors">Инструкция</Link>
            </div>
          </div>
          <div className="flex gap-4 md:gap-8 items-center">
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full hover:bg-gray-500/10 transition-all text-[var(--accent)]">
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={() => setMenuOpen(true)} className="xl:hidden p-1 text-[var(--accent)]"><Menu size={28} /></button>
            <Link to="/profile" className="hidden md:flex items-center gap-4 bg-[var(--accent)] text-white px-6 py-2.5 rounded-sm text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-xl shadow-red-500/10">
               Объектов: {purchasedIds.length}
            </Link>
          </div>
        </div>
      </nav>

      {/* ГЛАВНЫЙ КОНТЕНТ */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        <Routes>
          <Route path="/" element={
            <>
              <div className="py-12 md:py-32 flex flex-col xl:flex-row items-center justify-between gap-12 xl:-mt-10 max-w-6xl mx-auto">
                <div className="w-full xl:w-[48%] space-y-8 md:space-y-12 text-center xl:text-left">
                  <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-[var(--accent)]/20 bg-[var(--accent)]/5 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-[var(--accent)]">Цифровые решения 2026</div>
                  <h1 className="text-5xl md:text-8xl xl:text-[9.5rem] font-[1000] uppercase leading-[0.8] tracking-tight">ТВОЙ <br/><span className="text-[var(--accent)]">СТИЛЬ.</span></h1>
                  <p className="max-w-md opacity-60 text-sm md:text-base font-medium leading-relaxed uppercase tracking-wider mx-auto xl:mx-0">Создавайте профессиональный контент в один клик. Все пресеты разработаны для Adobe Lightroom 2026 года.</p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center xl:justify-start font-sans">
                    <Link to="/catalog" className="bg-[var(--accent)] text-white px-10 md:px-14 py-5 md:py-6 font-black uppercase text-[10px] tracking-widest shadow-2xl active:scale-95 transition-all text-center">Каталог стилей</Link>
                    <Link to="/guide" className="bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-main)] px-10 md:px-14 py-5 md:py-6 font-black uppercase text-[10px] tracking-widest hover:bg-[var(--text-main)] hover:text-[var(--bg-primary)] transition-all text-center">Инструкция</Link>
                  </div>
                </div>
                <div className="w-full xl:w-[50%]">
                  <div className="aspect-square bg-[var(--bg-secondary)] border border-[var(--border)] shadow-2xl relative overflow-hidden">
                    <ReactCompareSlider 
                      itemOne={<ReactCompareSliderImage src={heroAsset?.before_url || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2070"} />} 
                      itemTwo={<ReactCompareSliderImage src={heroAsset?.after_url || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2070&sat=-100"} />} 
                      className="h-full w-full object-cover transition-all duration-1000" 
                    />
                  </div>
                </div>
              </div>

              <div className="py-20 md:py-40 border-t border-[var(--border)] grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 max-w-6xl mx-auto">
                {[
                  {u:"Алексей К.", t:"Пресеты идеально подошли для уличной фотографии. Цвета стали глубже."},
                  {u:"Марина М.", t:"Очень удобная загрузка. DNG формат сразу импортировала в телефон."},
                  {u:"Игорь В.", t:"Минималистичный интерфейс, всё работает быстро. Рекомендую."}
                ].map((rev, i) => (
                  <div key={i} className="p-8 border border-[var(--border)] bg-[var(--bg-secondary)] space-y-6 hover:border-[var(--accent)]/30 transition-colors">
                    <MessageSquare className="text-[var(--accent)]" size={20} />
                    <p className="text-xs md:text-sm font-medium leading-relaxed uppercase tracking-wider opacity-60 italic">"{rev.t}"</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--accent)]">— {rev.u}</p>
                  </div>
                ))}
              </div>

              {/* СЕКЦИЯ: ВОПРОСЫ И ОТВЕТЫ (FAQ) */}
              <div className="py-20 md:py-40 border-t border-[var(--border)] max-w-6xl mx-auto">
                <div className="mb-16 text-center">
                  <h3 className="text-4xl md:text-6xl font-[1000] uppercase tracking-tighter italic leading-none mb-6 text-[var(--text-main)]">Вопросы и ответы.</h3>
                  <p className="max-w-2xl mx-auto text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-[var(--accent)] opacity-80 leading-relaxed">
                    Все, что вам нужно знать о покупке, форматах и использовании цифровых активов LightPresets System.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FAQItem 
                    question="В каких форматах я получу пресеты?" 
                    answer="Каждый пак содержит файлы двух форматов:\n1. .XMP — для компьютерной версии Lightroom и Camera Raw.\n2. .DNG — для мобильной версии Lightroom (iOS и Android)." 
                  />
                  <FAQItem 
                    question="Как происходит покупка и получение?" 
                    answer="После нажатия кнопки 'Приобрести' и ввода данных, система проверяет транзакцию. При успешном завершении ID пресета записывается в ваш локальный архив, и в разделе 'Библиотека' кнопка покупки меняется на 'Скачать'." 
                  />
                  <FAQItem 
                    question="Нужна ли подписка на Adobe Lightroom?" 
                    answer="Нет, наши пресеты работают даже в бесплатной мобильной версии приложения Lightroom. Вам нужно просто импортировать файл .DNG как обычное фото и скопировать настройки коррекции." 
                  />
                  <FAQItem 
                    question="Срок доступа к купленным материалам?" 
                    answer="Доступ к вашим покупкам предоставляется навсегда. Все купленные пресеты хранятся в вашей Библиотеке, пока вы не очистите кэш вашего браузера или данные сайта." 
                  />
                  <FAQItem 
                    question="Безопасность платежных данных" 
                    answer="Мы не храним данные ваших карт на наших серверах. Все платежи проходят через зашифрованный шлюз банка-эквайера, что гарантирует 100% безопасность ваших средств." 
                  />
                  <FAQItem 
                    question="Как установить пресеты на телефон?" 
                    answer="1. Скачайте файл .DNG из Библиотеки.\n2. Откройте его в приложении Lightroom Mobile.\n3. Нажмите на три точки в углу и выберите 'Создать стиль' (Create Preset).\n4. Теперь стиль доступен для любого вашего фото." 
                  />
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
        <div className="max-w-7xl mx-auto px-8 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-6 flex flex-col items-center md:items-start text-center md:text-left">
            <div className="flex items-center gap-3 text-[var(--accent)]">
              <div className="bg-[var(--accent)] text-white w-10 h-10 flex items-center justify-center font-black text-xl shadow-lg">L</div>
              <span className="text-2xl tracking-tighter font-black uppercase">Presets.</span>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 leading-relaxed italic">
              Профессиональная <br/> автоматизация цвета <br/> для контент-мейкеров.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-start space-y-6">
            <h4 className="text-[var(--accent)] font-[1000] uppercase text-[11px] tracking-widest">Навигация</h4>
            <ul className="space-y-4 text-[10px] font-black uppercase tracking-widest opacity-50">
              <li><Link to="/catalog" className="hover:opacity-100 transition-opacity">Магазин</Link></li>
              <li><Link to="/profile" className="hover:opacity-100 transition-opacity">Библиотека</Link></li>
              <li><Link to="/guide" className="hover:opacity-100 transition-opacity">Инструкция</Link></li>
            </ul>
          </div>

          <div className="flex flex-col items-center md:items-start space-y-6">
            <h4 className="text-[var(--accent)] font-[1000] uppercase text-[11px] tracking-widest">Поддержка</h4>
            <ul className="space-y-4 text-[10px] font-black uppercase tracking-widest opacity-50 text-center md:text-left">
              <li className="hover:opacity-100 transition-opacity cursor-pointer">Служба заботы</li>
              <li className="hover:opacity-100 transition-opacity cursor-pointer">Тех. вопросы</li>
              <li className="hover:opacity-100 transition-opacity cursor-pointer">Лицензия</li>
            </ul>
          </div>

          <div className="flex flex-col items-center md:items-start space-y-6">
            <h4 className="text-[var(--accent)] font-[1000] uppercase text-[11px] tracking-widest">Комьюнити</h4>
            <div className="flex gap-8">
               <Camera size={22} className="opacity-40 hover:opacity-100 hover:text-[var(--accent)] transition-all cursor-pointer" />
               <ExternalLink size={22} className="opacity-40 hover:opacity-100 hover:text-[var(--accent)] transition-all cursor-pointer" />
               <MessageSquare size={22} className="opacity-40 hover:opacity-100 hover:text-[var(--accent)] transition-all cursor-pointer" />
            </div>
          </div>
        </div>
        <div className="border-t border-[var(--border)] py-6 text-center">
            <p className="text-[8px] font-black uppercase tracking-[0.4em] opacity-20">© 2026 LightPresets System. All rights reserved.</p>
        </div>
      </footer>

      {/* МОБИЛЬНОЕ МЕНЮ */}
      {menuOpen && (
        <div className="fixed inset-0 z-[120] p-8 flex flex-col bg-[var(--bg-primary)] animate-in slide-in-from-top duration-500 font-sans">
          <div className="flex justify-between items-center mb-16">
             <div className="bg-[var(--accent)] text-white w-10 h-10 flex items-center justify-center font-black">L</div>
             <button onClick={() => setMenuOpen(false)}><X size={40} className="text-[var(--text-main)]" /></button>
          </div>
          <div className="flex flex-col gap-8 text-5xl font-black tracking-tighter uppercase italic text-[var(--text-main)]">
            <Link to="/catalog" onClick={() => setMenuOpen(false)}>Store</Link>
            <Link to="/profile" onClick={() => setMenuOpen(false)}>Library</Link>
            <Link to="/guide" onClick={() => setMenuOpen(false)}>Workflow</Link>
          </div>
        </div>
      )}

      {/* ПЛАТЕЖНОЕ ОКНО */}
      {payModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[150] flex items-center justify-center p-4">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-main)] w-full max-w-lg p-8 md:p-16 shadow-2xl relative animate-in zoom-in-95 duration-300 font-sans">
            {!isPaying && <button onClick={() => setPayModal(false)} className="absolute top-6 right-6 opacity-30 hover:opacity-100 transition-opacity font-bold text-2xl text-[var(--text-main)]">✕</button>}
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <h2 className="text-[10px] font-[1000] uppercase tracking-[0.5em] text-[var(--accent)] flex items-center justify-center gap-3">
                  {isPaying ? <Activity size={16} className="animate-spin" /> : <Lock size={16}/>} {isPaying ? "Связь с банком..." : "Оплата"}
                </h2>
                <p className="text-[10px] opacity-30 uppercase font-black italic text-[var(--text-main)]">{currentProduct?.name}</p>
              </div>
              <div className={`space-y-8 transition-opacity duration-500 ${isPaying ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
                <input type="text" maxLength="19" placeholder="НОМЕР КАРТЫ" className="w-full bg-transparent border-b border-[var(--border)] py-4 outline-none font-mono text-base md:text-lg focus:border-[var(--accent)] text-[var(--text-main)]" onChange={(e) => {e.target.value = e.target.value.replace(/\W/gi, '').replace(/(.{4})/g, '$1 ').trim();}} />
                <div className="grid grid-cols-2 gap-8">
                  <input type="text" maxLength="5" placeholder="ММ / ГГ" className="bg-transparent border-b border-[var(--border)] py-4 outline-none text-sm focus:border-[var(--accent)] text-[var(--text-main)]" />
                  <input type="password" maxLength="3" placeholder="CVC" className="bg-transparent border-b border-[var(--border)] py-4 outline-none text-sm focus:border-[var(--accent)] text-[var(--text-main)]" />
                </div>
              </div>
              <button disabled={isPaying} onClick={() => { setIsPaying(true); setTimeout(() => { setPurchasedIds([...purchasedIds, currentProduct.id]); setPayModal(false); setIsPaying(false); showToast("Пакет успешно добавлен в архив"); }, 2500); }} className="w-full py-5 bg-[var(--accent)] text-white font-[1000] uppercase tracking-[0.4em] text-[10px] active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-4">
                {isPaying ? "ОБРАБОТКА..." : `Оплатить ${currentProduct?.price} ₸`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
