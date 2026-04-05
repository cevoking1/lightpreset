import React, { useState, useEffect } from 'react';
import { 
  Download, Lock, Moon, Sun, Info, ArrowRight, 
  ArrowLeft, Package, ExternalLink, Camera, Search, 
  Menu, X, CheckCircle, HelpCircle, Layers, Monitor, Smartphone, MessageSquare, ChevronDown, Activity
} from 'lucide-react';
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { supabase } from './supabaseClient';
import Admin from './Admin'; 

// --- КОМПОНЕНТ: ЭКРАН ЗАГРУЗКИ (ПРЕЛОАДЕР) ---
// Показывается только один раз при входе, пока база данных не ответит.
const GlobalLoader = () => (
  <div className="fixed inset-0 z-[300] bg-[#050505] flex items-center justify-center">
    <div className="flex flex-col items-center gap-4 w-full max-w-[200px]">
      <span className="text-[9px] font-black uppercase tracking-[0.5em] text-[#FA0F00] opacity-80 animate-pulse">
        Синхронизация данных
      </span>
      <div className="w-full h-[1px] bg-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#FA0F00] origin-left animate-[loading-bar_1.5s_infinite_ease-in-out]"></div>
      </div>
      <span className="text-[8px] font-mono opacity-20 uppercase tracking-widest">
        System Core Init
      </span>
    </div>
  </div>
);

// --- КОМПОНЕНТ: УВЕДОМЛЕНИЯ (TOAST) ---
// Всплывающее окно в углу экрана (например, после покупки).
const Toast = ({ message }) => (
  <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[200] animate-in slide-in-from-right-10 duration-500">
    <div className="px-6 py-4 bg-[#FA0F00] text-white rounded-sm shadow-2xl flex items-center gap-4 border border-white/10">
      <CheckCircle size={18} />
      <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em]">{message}</span>
    </div>
  </div>
);

// --- КОМПОНЕНТ: СКЕЛЕТ КАРТОЧКИ ---
// «Серая заглушка», которая видна до того, как загрузится картинка товара.
const SkeletonCard = () => (
  <div className="w-full h-64 bg-white/5 animate-pulse rounded-sm mb-4"></div>
);

// --- КОМПОНЕНТ: АККОРДЕОН FAQ ---
// Раскрывающийся список вопросов и ответов.
const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-white/5">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 md:py-8 flex justify-between items-center text-left hover:text-[#FA0F00] transition-colors group"
      >
        <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] pr-4">{question}</span>
        <ChevronDown size={16} className={`flex-shrink-0 transition-transform duration-500 ${isOpen ? 'rotate-180 text-[#FA0F00]' : 'opacity-20'}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-500 ${isOpen ? 'max-h-[300px] pb-8' : 'max-h-0'}`}>
        <p className="text-[11px] md:text-sm text-gray-500 leading-relaxed uppercase tracking-wider font-medium">{answer}</p>
      </div>
    </div>
  );
};

// --- СТРАНИЦА: МАГАЗИН (КАТАЛОГ) ---
// Здесь происходит поиск и фильтрация всех пресетов из базы.
function Shop({ data, loading, darkMode, setPayModal, setCurrentProduct, purchasedIds }) {
  const [activeFilter, setActiveFilter] = useState('Все');
  const [searchQuery, setSearchQuery] = useState('');

  // Логика фильтрации: по категориям (ПК/Mobile) и по поисковой строке.
  const filteredData = data.filter(item => {
    const matchesCategory = activeFilter === 'Все' || item.category === activeFilter;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="py-8 md:py-12 animate-in fade-in duration-700">
      <div className="flex flex-col xl:flex-row justify-between items-center xl:items-end mb-12 gap-8 border-b border-white/5 pb-8 text-center xl:text-left">
        <div className="space-y-2">
          <h2 className="text-4xl md:text-5xl font-[1000] uppercase tracking-tighter italic leading-none">Каталог.</h2>
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[#FA0F00] opacity-80">
            Доступно объектов: {filteredData.length}
          </p>
        </div>
        
        {/* Панель поиска и фильтров */}
        <div className="flex flex-col md:flex-row gap-3 w-full max-w-2xl">
          <div className={`flex-1 flex items-center gap-3 px-5 py-3 border transition-all ${darkMode ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
            <Search size={16} className="opacity-30 flex-shrink-0" />
            <input type="text" placeholder="ПОИСК..." className="bg-transparent outline-none w-full text-[10px] font-black uppercase tracking-widest" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <div className="flex bg-black/5 dark:bg-white/5 p-1 border border-white/5 overflow-x-auto no-scrollbar">
            {['Все', 'ПК', 'Мобильные'].map(cat => (
              <button key={cat} onClick={() => setActiveFilter(cat)} className={`flex-1 min-w-[90px] px-4 md:px-6 py-2 text-[9px] font-black uppercase transition-all ${activeFilter === cat ? 'bg-[#FA0F00] text-white shadow-lg' : 'opacity-40'}`}>{cat}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Список товаров */}
      <div className="grid grid-cols-1 gap-6">
        {loading ? [...Array(3)].map((_, i) => <SkeletonCard key={i} />) : 
          filteredData.map(item => (
            <div key={item.id} className={`group flex flex-col xl:flex-row items-center gap-6 md:gap-8 p-4 md:p-5 border transition-all duration-500 hover:border-[#FA0F00]/40 ${darkMode ? 'bg-[#0A0A0A] border-white/5' : 'bg-white border-gray-200'}`}>
              <div className="w-full xl:w-[280px] aspect-video xl:aspect-[4/3] overflow-hidden bg-black flex-shrink-0 relative border border-white/5">
                <ReactCompareSlider 
                  itemOne={<ReactCompareSliderImage src={item.before_url} />} 
                  itemTwo={<ReactCompareSliderImage src={item.after_url} />} 
                  className="h-full w-full object-cover transition-all duration-700" 
                />
              </div>
              <div className="flex-1 flex flex-col justify-center text-center xl:text-left w-full">
                <div className="space-y-3">
                  <div className="flex items-center justify-center xl:justify-start gap-2 opacity-40">
                    {item.category === 'ПК' ? <Monitor size={12} /> : <Smartphone size={12} />}
                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">Для {item.category === 'ПК' ? 'ПК' : 'MOBILE'}</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-[1000] uppercase tracking-tighter leading-none group-hover:text-[#FA0F00] transition-colors">{item.name}</h3>
                  <div className="flex justify-center xl:justify-start gap-6 pt-4 border-t border-white/5">
                    <div className="space-y-0.5">
                      <p className="text-[8px] font-black uppercase text-[#FA0F00] opacity-50">Soft</p>
                      <p className="text-[10px] font-bold uppercase">{item.version || 'LRC'}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[8px] font-black uppercase text-[#FA0F00] opacity-50">Format</p>
                      <p className="text-[10px] font-bold uppercase">{item.format || '.XMP'}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full xl:w-[220px] xl:border-l border-white/5 xl:pl-8 flex flex-col justify-center gap-4">
                <div className="flex flex-row xl:flex-col justify-between items-center xl:items-end px-2 xl:px-0">
                  <p className="text-[9px] font-black uppercase opacity-20 tracking-widest">Цена</p>
                  <p className="text-2xl md:text-3xl font-mono font-black tracking-tighter text-[#FA0F00]">{item.price} ₸</p>
                </div>
                <button 
                  onClick={() => { setCurrentProduct(item); purchasedIds.includes(item.id) ? window.open(item.file_url) : setPayModal(true); }}
                  className={`w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${
                    purchasedIds.includes(item.id) ? 'border-white/10 bg-white/5 text-gray-500' : 'bg-[#FA0F00] text-white border-[#FA0F00] active:scale-95'
                  }`}
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

// --- СТРАНИЦА: ПРОФИЛЬ (БИБЛИОТЕКА) ---
// Показывает только те товары, ID которых сохранены в localStorage.
function Profile({ purchasedIds, data }) {
  const myPresets = data.filter(item => purchasedIds.includes(item.id));
  return (
    <div className="min-h-screen py-12 md:py-24 px-4 md:px-6 max-w-[1440px] mx-auto">
      <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter italic mb-10 md:mb-20 border-b border-white/10 pb-10 text-center md:text-left">Коллекция.</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
        {myPresets.length > 0 ? myPresets.map(item => (
          <div key={item.id} className="space-y-4">
            <div className="relative aspect-[4/5] overflow-hidden group border border-white/5">
              <img src={item.after_url} className="w-full h-full object-cover" alt="" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <button onClick={() => window.open(item.file_url)} className="bg-[#FA0F00] text-white p-5 rounded-sm active:scale-90 transition-transform"><Download size={24} /></button>
              </div>
            </div>
            <h3 className="text-xs md:text-sm font-black uppercase text-center">{item.name}</h3>
          </div>
        )) : (
          <div className="col-span-full py-20 md:py-40 text-center opacity-20 uppercase font-black tracking-widest italic">Библиотека пуста</div>
        )}
      </div>
    </div>
  );
}

// --- СТРАНИЦА: ИНСТРУКЦИЯ (GUIDE) ---
// Статическая страница с описанием процесса работы.
function Guide() {
  return (
    <div className="max-w-4xl mx-auto py-16 md:py-24 px-6">
      <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter mb-12 md:mb-20 leading-none text-[#FA0F00] text-center md:text-left">Workflow.</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
        {[
          {s:"01", t:"Покупка", d:"Безопасная оплата в один клик."},
          {s:"02", t:"Загрузка", d:"Мгновенный доступ к архивам."},
          {s:"03", t:"Результат", d:"Применяйте стили в Lightroom."}
        ].map((step, i) => (
          <div key={i} className="space-y-4">
            <span className="text-3xl md:text-4xl font-black text-[#FA0F00] opacity-20">{step.s}</span>
            <h3 className="text-lg md:text-xl font-bold uppercase tracking-tighter">{step.t}</h3>
            <p className="opacity-40 text-[10px] md:text-xs leading-relaxed uppercase tracking-wider font-medium">{step.d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- ГЛАВНЫЙ КОМПОНЕНТ ПРИЛОЖЕНИЯ (APP) ---
export default function App() {
  const [data, setData] = useState([]); // Все пресеты из БД
  const [loading, setLoading] = useState(true); // Состояние загрузки
  const [payModal, setPayModal] = useState(false); // Модалка оплаты
  const [isPaying, setIsPaying] = useState(false); // Состояние процесса оплаты
  const [menuOpen, setMenuOpen] = useState(false); // Мобильное меню
  const [toast, setToast] = useState(null); // Уведомление
  const [currentProduct, setCurrentProduct] = useState(null); // Выбранный для покупки товар
  const [darkMode, setDarkMode] = useState(true); // Темная/Светлая тема
  const location = useLocation();

  // Инициализация купленных пресетов из памяти браузера
  const [purchasedIds, setPurchasedIds] = useState(() => {
    const saved = localStorage.getItem('purchased_presets');
    return saved ? JSON.parse(saved) : [];
  });

  // Запрос данных из Supabase при загрузке сайта
  useEffect(() => { fetchPresets(); }, []);
  async function fetchPresets() {
    try {
      setLoading(true);
      const { data: presets, error } = await supabase.from('presets').select('*').order('id', { ascending: false });
      if (!error) setData(presets);
    } finally { 
      // Искусственная задержка для плавного скрытия прелоадера
      setTimeout(() => setLoading(false), 1500); 
    }
  }

  // Сохранение покупок в память браузера при их изменении
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };
  useEffect(() => { localStorage.setItem('purchased_presets', JSON.stringify(purchasedIds)); }, [purchasedIds]);
  useEffect(() => { setMenuOpen(false); window.scrollTo(0,0); }, [location]);

  // ЛОГИКА ГЛАВНОГО СЛАЙДЕРА: Ищем пресет с пометкой 'MAIN' в поле version.
  // Если не находим — берем самый первый из списка.
  const mainPresets = data.filter(p => p.version === 'MAIN');
  const mainPreset = mainPresets.length > 0 ? mainPresets[0] : data[0];

  return (
    <div className={`min-h-screen transition-colors ${darkMode ? 'bg-[#050505] text-[#E0E0E0]' : 'bg-[#F9F9F9] text-[#1A1A1A]'}`}>
      
      {/* Рендерим прелоадер только на главной странице и только при первой загрузке */}
      {loading && location.pathname === '/' && <GlobalLoader />}

      {toast && <Toast message={toast} />}

      {/* ШАПКА САЙТА (NAVBAR) */}
      <nav className={`sticky top-0 z-[100] border-b ${darkMode ? 'bg-[#050505]/90 border-white/5' : 'bg-white/90 border-black/5'} backdrop-blur-xl`}>
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-4 md:py-6 flex justify-between items-center">
          <div className="flex items-center gap-6 md:gap-16">
            <Link to="/" className="flex items-center gap-2 md:gap-3 group">
              <div className="bg-[#FA0F00] text-white w-8 h-8 md:w-10 md:h-10 flex items-center justify-center font-black text-lg md:text-xl shadow-lg group-hover:-rotate-6 transition-transform">L</div>
              <span className="font-black text-xl md:text-2xl tracking-tighter uppercase text-[#FA0F00]">Presets.</span>
            </Link>
            <div className="hidden xl:flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
              <Link to="/catalog" className={`hover:text-[#FA0F00] transition-colors ${location.pathname === '/catalog' && 'text-[#FA0F00] opacity-100'}`}>Каталог</Link>
              <Link to="/profile" className={`hover:text-[#FA0F00] transition-colors ${location.pathname === '/profile' && 'text-[#FA0F00] opacity-100'}`}>Библиотека</Link>
              <Link to="/guide" className={`hover:text-[#FA0F00] transition-colors ${location.pathname === '/guide' && 'text-[#FA0F00] opacity-100'}`}>Инструкция</Link>
            </div>
          </div>
          <div className="flex gap-4 md:gap-8 items-center">
            <button onClick={() => setDarkMode(!darkMode)} className="hover:text-[#FA0F00] transition-colors">{darkMode ? <Sun size={20} /> : <Moon size={20} />}</button>
            <button onClick={() => setMenuOpen(true)} className="xl:hidden p-1 text-[#FA0F00]"><Menu size={28} /></button>
            <Link to="/profile" className="hidden md:flex items-center gap-4 bg-[#FA0F00] text-white px-6 py-2.5 rounded-sm text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all">
               Куплено: {purchasedIds.length}
            </Link>
          </div>
        </div>
      </nav>

      {/* ОСНОВНОЙ КОНТЕНТ (МАРШРУТИЗАЦИЯ) */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 relative z-10">
        <Routes>
          <Route path="/" element={
            <>
              {/* Главный экран (Hero Section) */}
              <div className="py-12 md:py-32 flex flex-col xl:flex-row items-center justify-between gap-12 xl:-mt-10">
                <div className="w-full xl:w-[48%] space-y-8 md:space-y-12 text-center xl:text-left">
                  <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-[#FA0F00]/30 bg-[#FA0F00]/5 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-[#FA0F00]">Эксклюзивные стили 2026</div>
                  <h1 className="text-5xl md:text-8xl xl:text-[9.5rem] font-[1000] uppercase leading-[0.8] tracking-tight">ВАШ <br/><span className="text-[#FA0F00]">СТИЛЬ.</span></h1>
                  <p className="max-w-md text-gray-500 text-sm md:text-base font-medium leading-relaxed uppercase tracking-wider mx-auto xl:mx-0">Создавайте профессиональный контент в один клик.</p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center xl:justify-start">
                    <Link to="/catalog" className="bg-[#FA0F00] text-white px-10 md:px-14 py-5 md:py-6 font-black uppercase text-[10px] md:text-[11px] tracking-widest shadow-2xl active:scale-95 transition-all text-center">Открыть магазин</Link>
                    <Link to="/guide" className="bg-white/5 border border-white/10 backdrop-blur-md text-white px-10 md:px-14 py-5 md:py-6 font-black uppercase text-[10px] md:text-[11px] tracking-widest hover:bg-white hover:text-black transition-all text-center text-nowrap">Инструкция</Link>
                  </div>
                </div>
                {/* Слайдер главного пресета */}
                <div className="w-full xl:w-[50%] group">
                  <div className="aspect-square bg-white/5 border border-white/5 shadow-2xl relative overflow-hidden">
                    <ReactCompareSlider 
                      itemOne={<ReactCompareSliderImage src={mainPreset?.before_url || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2070"} />} 
                      itemTwo={<ReactCompareSliderImage src={mainPreset?.after_url || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2070&sat=-100"} />} 
                      className="h-full w-full object-cover transition-all duration-1000" 
                    />
                  </div>
                </div>
              </div>
              
              {/* Секция отзывов */}
              <div className="py-20 md:py-40 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
                {[
                  {u:"Алексей К.", t:"Лучшие пресеты для уличной фотографии. Цвет просто топ!"},
                  {u:"Марина М.", t:"DNG спасли мой инстаграм. Теперь обработка занимает секунды."},
                  {u:"Игорь В.", t:"Минималистичный дизайн сайта и мгновенная доставка."}
                ].map((rev, i) => (
                  <div key={i} className="p-8 md:p-10 border border-white/5 bg-white/[0.01] space-y-6 hover:border-[#FA0F00]/30 transition-colors">
                    <MessageSquare className="text-[#FA0F00]" size={20} />
                    <p className="text-xs md:text-sm font-medium leading-relaxed uppercase tracking-wider opacity-60 italic">"{rev.t}"</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#FA0F00]">— {rev.u}</p>
                  </div>
                ))}
              </div>

              {/* Блок FAQ */}
              <div className="py-20 md:py-40 border-t border-white/5">
                <div className="mb-12 md:mb-20 text-center xl:text-left">
                  <h3 className="text-4xl md:text-5xl font-[1000] uppercase tracking-tighter italic leading-none mb-4">Вопросы.</h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#FA0F00]">Support & Info</p>
                </div>
                <div className="max-w-3xl">
                  <FAQItem question="Как я получу свои файлы?" answer="Сразу после оплаты в разделе 'Библиотека' появится кнопка скачивания. Файлы доступны в вашем аккаунте навсегда." />
                  <FAQItem question="С какими программами работают пресеты?" answer="Формат .XMP — для ПК (Lightroom/Photoshop). Формат .DNG — для мобильного приложения Lightroom (iOS/Android)." />
                  <FAQItem question="Безопасна ли транзакция?" answer="Мы используем современные протоколы шифрования. Ваши платежные данные защищены и не хранятся на наших серверах." />
                </div>
              </div>
            </>
          } />
          {/* Маршруты для остальных страниц */}
          <Route path="/catalog" element={<Shop data={data} loading={loading} darkMode={darkMode} setPayModal={setPayModal} setCurrentProduct={setCurrentProduct} purchasedIds={purchasedIds} />} />
          <Route path="/profile" element={<Profile purchasedIds={purchasedIds} data={data} />} />
          <Route path="/guide" element={<Guide />} />
          <Route path="/admin" element={<Admin darkMode={darkMode} />} />
        </Routes>
      </div>

      {/* ПОДВАЛ САЙТА (FOOTER) */}
      <footer className={`mt-20 md:mt-40 py-16 md:py-24 border-t relative ${darkMode ? 'border-white/5 bg-[#050505]' : 'border-black/5 bg-gray-50'}`}>
        <div className="max-w-[1440px] mx-auto px-6 md:px-10 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-12 md:gap-20 text-[10px] font-black uppercase tracking-widest opacity-40 text-center sm:text-left">
          <div className="space-y-8">
            <div className="flex items-center justify-center sm:justify-start gap-3 text-[#FA0F00]"><div className="bg-[#FA0F00] text-white w-8 h-8 flex items-center justify-center rounded-sm text-lg">L</div><span className="text-xl tracking-tighter">Presets.</span></div>
            <p className="normal-case font-bold italic leading-relaxed">Профессиональная цветокоррекция 2026.</p>
          </div>
          <div className="space-y-4">
            <h4 className="text-[#FA0F00]">Меню</h4>
            <ul className="space-y-2 opacity-70">
              <li><Link to="/catalog">Каталог</Link></li>
              <li><Link to="/profile">Библиотека</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-[#FA0F00]">Помощь</h4>
            <ul className="space-y-2 opacity-70">
              <li><Link to="/guide">Инструкция</Link></li>
              <li>Служба поддержки</li>
            </ul>
          </div>
          <div className="space-y-4">
             <h4 className="text-[#FA0F00]">Сообщество</h4>
             <div className="flex gap-6 justify-center sm:justify-start"><Camera size={18} /><ExternalLink size={18} /></div>
          </div>
        </div>
        {/* Скрытая ссылка в админку для разработчика */}
        <Link to="/admin" className="absolute bottom-4 right-4 p-2 opacity-5 hover:opacity-100 transition-opacity text-[8px] font-black uppercase tracking-[0.5em] text-[#FA0F00]">Dev_Console</Link>
      </footer>

      {/* ОКНО ОПЛАТЫ (СИМУЛЯЦИЯ) */}
      {payModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[150] flex items-center justify-center p-4">
          <div className={`${darkMode ? 'bg-[#0A0A0A] border-white/5 shadow-black' : 'bg-white border-black/5'} w-full max-w-lg p-8 md:p-16 shadow-2xl relative animate-in zoom-in-95 duration-300`}>
            {!isPaying && <button onClick={() => setPayModal(false)} className="absolute top-6 right-6 md:top-10 md:right-10 opacity-30 hover:opacity-100 transition-opacity">✕</button>}
            <div className="space-y-8 md:space-y-12">
              <div className="text-center space-y-4">
                <h2 className="text-[10px] md:text-[11px] font-[1000] uppercase tracking-[0.5em] text-[#FA0F00] flex items-center justify-center gap-3">
                  {isPaying ? <Activity size={16} className="animate-spin" /> : <Lock size={16}/>} {isPaying ? "Проверка банка..." : "Безопасная оплата"}
                </h2>
                <p className="text-[10px] opacity-30 uppercase font-bold italic">{currentProduct?.name}</p>
              </div>
              <div className={`space-y-8 transition-opacity duration-500 ${isPaying ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
                {/* Поле номера карты с автоматическими пробелами */}
                <input type="text" maxLength="19" placeholder="НОМЕР КАРТЫ" className="w-full bg-transparent border-b border-white/10 py-4 outline-none font-mono text-base md:text-lg focus:border-[#FA0F00]" onChange={(e) => {e.target.value = e.target.value.replace(/\W/gi, '').replace(/(.{4})/g, '$1 ').trim();}} />
                <div className="grid grid-cols-2 gap-8 md:gap-10">
                  <input type="text" maxLength="5" placeholder="ММ / ГГ" className="bg-transparent border-b border-white/10 py-4 outline-none text-sm focus:border-[#FA0F00]" />
                  <input type="password" maxLength="3" placeholder="CVC" className="bg-transparent border-b border-white/10 py-4 outline-none text-sm focus:border-[#FA0F00]" />
                </div>
              </div>
              {/* Кнопка подтверждения с имитацией ожидания */}
              <button disabled={isPaying} onClick={() => { setIsPaying(true); setTimeout(() => { setPurchasedIds([...purchasedIds, currentProduct.id]); setPayModal(false); setIsPaying(false); showToast("Пакет добавлен в библиотеку"); }, 2500); }} className="w-full py-5 md:py-6 bg-[#FA0F00] text-white font-[1000] uppercase tracking-[0.4em] text-[10px] md:text-[11px] active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-4">
                {isPaying ? "Подтверждение..." : `Оплатить ${currentProduct?.price} ₸`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
