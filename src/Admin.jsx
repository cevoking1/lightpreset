import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { ArrowLeft, Trash2, Package, UploadCloud, Database, Activity, ShieldCheck, Cpu, Lock, Key, Hash } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Admin({ darkMode }) {
  // --- АВТОРИЗАЦИЯ ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const ADMIN_PASSWORD = "admin"; // Ключ доступа к панели

  // Функция входа в систему
  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert("ОТКАЗАНО В ДОСТУПЕ: Неверный системный ключ");
      setPassword('');
    }
  };

  // --- СОСТОЯНИЕ ДАННЫХ ---
  const [loading, setLoading] = useState(false);
  const [presets, setPresets] = useState([]);
  
  // Поля формы создания пресета
  const [form, setForm] = useState({ 
    name: '', 
    price: '', 
    category: 'ПК',
    format: '.XMP', 
    version: 'v12.0+' 
  });
  
  // Выбранные файлы для загрузки
  const [files, setFiles] = useState({ before: null, after: null, zip: null });

  // Загружаем список из базы данных при входе в админку
  useEffect(() => { 
    if (isAuthenticated) fetchPresets(); 
  }, [isAuthenticated]);

  // Функция получения данных из Supabase
  async function fetchPresets() {
    const { data, error } = await supabase.from('presets').select('*').order('id', { ascending: false });
    if (error) console.error("Ошибка загрузки данных:", error);
    else setPresets(data);
  }

  // Вспомогательная функция для отправки файлов в облачное хранилище
  const uploadFile = async (file, folder) => {
    if (!file) return null;
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('preset-files')
      .upload(filePath, file);
    if (uploadError) throw new Error(`Ошибка хранилища: ${uploadError.message}`);
    const { data } = supabase.storage.from('preset-files').getPublicUrl(filePath);
    return data.publicUrl;
  };

  // Обработка отправки формы (Публикация нового пресета)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!files.before || !files.after || !files.zip) throw new Error("Выберите все необходимые файлы!");
      
      // Поочередная загрузка изображений и архива
      const beforeUrl = await uploadFile(files.before, 'previews');
      const afterUrl = await uploadFile(files.after, 'previews');
      const zipUrl = await uploadFile(files.zip, 'archives');

      // Запись данных в таблицу
      const { error } = await supabase.from('presets').insert([{
        name: form.name, price: form.price, category: form.category,
        format: form.format, version: form.version,
        before_url: beforeUrl, after_url: afterUrl, file_url: zipUrl
      }]);

      if (error) throw new Error(`Ошибка БД: ${error.message}`);
      
      alert('Актив успешно опубликован в системе!');
      fetchPresets(); // Обновляем список на странице
      setForm({ name: '', price: '', category: 'ПК', format: '.XMP', version: 'v12.0+' });
      setFiles({ before: null, after: null, zip: null });
      e.target.reset();
    } catch (error) { alert(error.message); } finally { setLoading(false); }
  };

  // Удаление объекта из базы
  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите безвозвратно удалить объект ID: ' + id + '?')) {
      const { error } = await supabase.from('presets').delete().eq('id', id);
      if (error) alert("Ошибка: " + error.message);
      else fetchPresets();
    }
  };

  // --- СТИЛИЗАЦИЯ ---
  const cardBg = darkMode ? 'bg-[#0A0A0A]' : 'bg-white';
  const inputBg = darkMode ? 'bg-[#121212]' : 'bg-gray-100';
  const borderColor = darkMode ? 'border-white/10' : 'border-gray-200';

  const selectStyle = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23FA0F00' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 1rem center',
    backgroundSize: '1em'
  };

  // Экран авторизации
  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-black text-white' : 'bg-[#f5f5f5] text-black'} font-sans p-6`}>
        <div className={`max-w-md w-full p-12 border ${cardBg} ${borderColor} shadow-2xl space-y-10 animate-in fade-in zoom-in duration-500`}>
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FA0F00]/10 text-[#FA0F00] rounded-full mb-4"><Lock size={32} /></div>
            <h1 className="text-[10px] font-black uppercase tracking-[0.5em] text-[#FA0F00]">Admin Access</h1>
            <p className="text-[9px] opacity-30 uppercase tracking-widest text-center italic">Консоль управления терминалом</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative">
              <Key size={16} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20" />
              <input 
                type="password" 
                placeholder="ВВЕДИТЕ КЛЮЧ" 
                className={`w-full ${inputBg} border ${borderColor} p-5 pl-12 text-xs outline-none focus:border-[#FA0F00]/50 tracking-[0.3em] font-mono text-white`}
                value={password} onChange={(e) => setPassword(e.target.value)} autoFocus required 
              />
            </div>
            <button type="submit" className="w-full py-5 bg-[#FA0F00] text-white font-black uppercase text-[10px] tracking-[0.4em] hover:brightness-110 active:scale-95 transition-all">Авторизоваться</button>
          </form>
        </div>
      </div>
    );
  }

  // Главный интерфейс Админки
  return (
    <div className={`min-h-screen ${darkMode ? 'bg-black text-[#e0e0e0]' : 'bg-[#f9f9f9] text-[#1a1a1a]'} font-sans p-6 md:p-10 transition-colors duration-500`}>
      <div className="max-w-[1440px] mx-auto space-y-6">
        
        {/* ВЕРХНЯЯ ПАНЕЛЬ СТАТУСА */}
        <div className={`flex flex-wrap justify-between items-center px-8 py-5 border rounded-sm ${cardBg} ${borderColor} shadow-sm`}>
          <div className="flex items-center gap-6">
            <Link to="/" className={`p-2 ${inputBg} hover:bg-[#FA0F00] hover:text-white transition-all rounded-sm`}>
              <ArrowLeft size={18} />
            </Link>
            <div className="flex items-center gap-4">
              <Cpu size={20} className="text-[#FA0F00]" />
              <h1 className="text-[11px] font-[1000] uppercase tracking-[0.4em]">Control <span className="font-light opacity-30">/ Panel</span></h1>
            </div>
          </div>
          <div className="flex gap-10 items-center text-[9px] font-bold uppercase opacity-30 tracking-[0.2em]">
            <span className="flex items-center gap-2"><Activity size={12} className="text-green-500" /> Database Live</span>
            <span className="flex items-center gap-2 text-[#FA0F00]"><ShieldCheck size={14} /> Root Verified</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* СЕКЦИЯ: ФОРМА ДОБАВЛЕНИЯ */}
          <div className={`lg:col-span-4 p-10 border rounded-sm ${cardBg} ${borderColor} space-y-10 shadow-sm`}>
            <h3 className="text-[10px] font-[1000] uppercase text-[#FA0F00] tracking-[0.4em]">Опубликовать актив</h3>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase opacity-40 tracking-[0.2em] ml-1">Название стиля</label>
                  <input type="text" placeholder="Введите название..." className={`w-full ${inputBg} border ${borderColor} p-4 text-xs outline-none focus:border-[#FA0F00]/50 uppercase font-bold tracking-tighter`} value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                </div>
                
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase opacity-40 tracking-[0.2em] ml-1">Цена (₸)</label>
                    <input type="text" placeholder="3500" className={`w-full ${inputBg} border ${borderColor} p-4 text-xs outline-none font-mono focus:border-[#FA0F00]/50`} value={form.price} onChange={e => setForm({...form, price: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase opacity-40 tracking-[0.2em] ml-1">Платформа</label>
                    <select 
                      style={selectStyle}
                      className={`w-full ${inputBg} border ${borderColor} p-4 text-[10px] font-black uppercase outline-none cursor-pointer appearance-none hover:border-[#FA0F00]/50 transition-all`} 
                      value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                    >
                      <option value="ПК" className="bg-[#121212]">Для ПК</option>
                      <option value="Мобильные" className="bg-[#121212]">Для Телефона</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase opacity-40 tracking-[0.2em] ml-1">Формат</label>
                    <select 
                      style={selectStyle}
                      className={`w-full ${inputBg} border ${borderColor} p-4 text-[10px] font-black uppercase outline-none cursor-pointer appearance-none hover:border-[#FA0F00]/50 transition-all`}
                      value={form.format} onChange={e => setForm({...form, format: e.target.value})}
                    >
                      <option value=".XMP" className="bg-[#121212]">.XMP (Lightroom)</option>
                      <option value=".DNG" className="bg-[#121212]">.DNG (Mobile)</option>
                      <option value=".ZIP" className="bg-[#121212]">.ZIP Архив</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase opacity-40 tracking-[0.2em] ml-1">Софт</label>
                    <select 
                      style={selectStyle}
                      className={`w-full ${inputBg} border ${borderColor} p-4 text-[10px] font-black uppercase outline-none cursor-pointer appearance-none hover:border-[#FA0F00]/50 transition-all`}
                      value={form.version} onChange={e => setForm({...form, version: e.target.value})}
                    >
                      <option value="v12.0+" className="bg-[#121212]">v12.0+</option>
                      <option value="Universal" className="bg-[#121212]">Любой</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* ЗАГРУЗКА ФАЙЛОВ */}
              <div className="space-y-3 pt-6 border-t border-white/5">
                {['before', 'after', 'zip'].map((key) => (
                  <label key={key} className={`flex items-center justify-between p-4 border border-dashed ${borderColor} cursor-pointer hover:bg-[#FA0F00]/5 transition-all group`}>
                    <span className="text-[9px] font-mono opacity-40 uppercase group-hover:opacity-100 truncate pr-4">
                      {files[key] ? files[key].name : `Выбрать_${key}_файл`}
                    </span>
                    <input type="file" className="hidden" onChange={e => setFiles({...files, [key]: e.target.files[0]})} />
                    <UploadCloud size={14} className="opacity-20 group-hover:text-[#FA0F00] group-hover:opacity-100 transition-all" />
                  </label>
                ))}
              </div>

              <button type="submit" disabled={loading} className="w-full py-5 bg-[#FA0F00] text-white font-[1000] uppercase text-[10px] tracking-[0.4em] shadow-xl hover:brightness-110 active:scale-95 disabled:opacity-20 transition-all">
                {loading ? 'ЗАГРУЗКА ДАННЫХ...' : 'ОПУБЛИКОВАТЬ В БАЗУ'}
              </button>
            </form>
          </div>

          {/* СЕКЦИЯ: ТАБЛИЦА С ТОВАРАМИ */}
          <div className={`lg:col-span-8 border rounded-sm ${cardBg} ${borderColor} shadow-sm overflow-hidden flex flex-col`}>
            <div className="p-8 border-b border-white/5 bg-white/[0.01]">
               <h3 className="text-[10px] font-[1000] uppercase text-[#FA0F00] tracking-[0.4em] flex items-center gap-3">
                 <Hash size={14} /> Реестр товаров <span className="opacity-20 text-white">[{presets.length}]</span>
               </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/[0.02] border-b border-white/5 text-[9px] font-[1000] uppercase tracking-widest opacity-40">
                    <th className="p-8">Превью</th>
                    <th className="p-8">Идентификатор</th>
                    <th className="p-8">Спецификации</th>
                    <th className="p-8 text-right">Действия</th>
                  </tr>
                </thead>
                <tbody className="text-[11px] font-bold">
                  {presets.map(item => (
                    <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                      <td className="p-8">
                        <div className="w-14 h-14 border border-white/10 overflow-hidden bg-black">
                          <img src={item.after_url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="" />
                        </div>
                      </td>
                      <td className="p-8">
                        <div className="space-y-1">
                          <p className="uppercase tracking-tight text-sm font-black">{item.name}</p>
                          <p className="text-[8px] font-mono opacity-20 italic">DB_ID: {item.id.toString().slice(0,12)}...</p>
                        </div>
                      </td>
                      <td className="p-8">
                        <div className="flex flex-col gap-1.5 text-[10px]">
                          <div className="flex gap-2">
                             <span className="px-2 py-0.5 bg-[#FA0F00] text-white text-[8px] font-black uppercase">{item.category}</span>
                             <span className="px-2 py-0.5 border border-white/10 text-[8px] font-black uppercase opacity-50">{item.format}</span>
                          </div>
                          <span className="font-mono text-white/60">{item.price} ₸</span>
                        </div>
                      </td>
                      <td className="p-8 text-right">
                        <button onClick={() => handleDelete(item.id)} className="p-3 bg-white/5 text-gray-500 hover:text-white hover:bg-red-600 transition-all rounded-sm shadow-inner">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {presets.length === 0 && <div className="p-20 text-center opacity-10 uppercase font-black tracking-widest italic text-xs">База данных пуста</div>}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
