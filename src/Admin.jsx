import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { ArrowLeft, Trash2, UploadCloud, Activity, ShieldCheck, Cpu, Lock, Key, Hash } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Admin({ darkMode }) {
  // --- ДОСТУП В ПАНЕЛЬ ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const ADMIN_PASSWORD = "admin"; // Твой пароль для входа

  // Проверка введенного ключа
  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert("ОТКАЗАНО: Неверный системный ключ доступа");
      setPassword('');
    }
  };

  // --- УПРАВЛЕНИЕ ДАННЫМИ ---
  const [loading, setLoading] = useState(false);
  const [presets, setPresets] = useState([]);
  
  // Данные нового пресета
  const [form, setForm] = useState({ 
    name: '', 
    price: '', 
    category: 'ПК',
    format: '.XMP', 
    version: 'v12.0+' 
  });
  
  // Файлы для отправки в облако
  const [files, setFiles] = useState({ before: null, after: null, zip: null });

  // Автозагрузка списка при входе
  useEffect(() => { 
    if (isAuthenticated) fetchPresets(); 
  }, [isAuthenticated]);

  // Запрос всех пресетов из таблицы Supabase
  async function fetchPresets() {
    const { data, error } = await supabase.from('presets').select('*').order('id', { ascending: false });
    if (error) console.error("Ошибка синхронизации:", error);
    else setPresets(data);
  }

  // Функция загрузки файлов в Storage (облако)
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

  // Создание нового товара
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!files.before || !files.after || !files.zip) throw new Error("Загрузите все необходимые файлы!");
      
      // Загружаем картинки и архив по очереди
      const beforeUrl = await uploadFile(files.before, 'previews');
      const afterUrl = await uploadFile(files.after, 'previews');
      const zipUrl = await uploadFile(files.zip, 'archives');

      // Сохраняем ссылки и данные в таблицу БД
      const { error } = await supabase.from('presets').insert([{
        name: form.name, price: form.price, category: form.category,
        format: form.format, version: form.version,
        before_url: beforeUrl, after_url: afterUrl, file_url: zipUrl
      }]);

      if (error) throw new Error(`Ошибка БД: ${error.message}`);
      
      alert('Актив успешно добавлен в базу данных!');
      fetchPresets();
      // Очистка формы
      setForm({ name: '', price: '', category: 'ПК', format: '.XMP', version: 'v12.0+' });
      setFiles({ before: null, after: null, zip: null });
      e.target.reset();
    } catch (error) { alert(error.message); } finally { setLoading(false); }
  };

  // Удаление товара из системы
  const handleDelete = async (id) => {
    if (window.confirm('Удалить актив ID: ' + id + ' без возможности восстановления?')) {
      const { error } = await supabase.from('presets').delete().eq('id', id);
      if (error) alert("Ошибка при удалении: " + error.message);
      else fetchPresets();
    }
  };

  // Стили выпадающих списков
  const selectStyle = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23FA0F00' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 1rem center',
    backgroundSize: '1em'
  };

  // Окно входа (если не авторизован)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] p-6 font-sans">
        <div className="max-w-md w-full p-12 border border-[var(--border)] bg-[var(--bg-secondary)] shadow-2xl space-y-10 animate-in fade-in zoom-in duration-500">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FA0F00]/10 text-[#FA0F00] rounded-full mb-4"><Lock size={32} /></div>
            <h1 className="text-[10px] font-black uppercase tracking-[0.5em] text-[#FA0F00]">Admin Access</h1>
            <p className="text-[9px] opacity-30 uppercase tracking-widest italic">Требуется ключ авторизации</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative">
              <Key size={16} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20 text-[var(--text-main)]" />
              <input 
                type="password" 
                placeholder="ВВЕДИТЕ КЛЮЧ" 
                className="w-full bg-[var(--bg-primary)] border border-[var(--border)] p-5 pl-12 text-xs outline-none focus:border-[#FA0F00]/50 tracking-[0.3em] font-mono text-[var(--text-main)]"
                value={password} onChange={(e) => setPassword(e.target.value)} autoFocus required 
              />
            </div>
            <button type="submit" className="w-full py-5 bg-[#FA0F00] text-white font-black uppercase text-[10px] tracking-[0.4em] hover:brightness-110 active:scale-95 transition-all">Вход в систему</button>
          </form>
        </div>
      </div>
    );
  }

  // Основной рабочий стол админки
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] font-sans p-6 md:p-10 transition-colors duration-500">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* ВЕРХНЯЯ ПАНЕЛЬ СТАТУСА */}
        <div className="flex flex-wrap justify-between items-center px-8 py-5 border border-[var(--border)] bg-[var(--bg-secondary)] shadow-sm">
          <div className="flex items-center gap-6">
            <Link to="/" className="p-2 bg-[var(--bg-primary)] hover:bg-[#FA0F00] hover:text-white transition-all rounded-sm border border-[var(--border)]">
              <ArrowLeft size={18} />
            </Link>
            <div className="flex items-center gap-4">
              <Cpu size={20} className="text-[#FA0F00]" />
              <h1 className="text-[11px] font-[1000] uppercase tracking-[0.4em]">Панель <span className="font-light opacity-30">/ Управления</span></h1>
            </div>
          </div>
          <div className="flex gap-10 items-center text-[9px] font-bold uppercase opacity-30 tracking-[0.2em]">
            <span className="flex items-center gap-2"><Activity size={12} className="text-green-500" /> Database Live</span>
            <span className="flex items-center gap-2 text-[#FA0F00]"><ShieldCheck size={14} /> Root Verified</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ФОРМА СОЗДАНИЯ ТОВАРА */}
          <div className="lg:col-span-4 p-10 border border-[var(--border)] bg-[var(--bg-secondary)] space-y-10 shadow-sm">
            <h3 className="text-[10px] font-[1000] uppercase text-[#FA0F00] tracking-[0.4em]">Добавить новый актив</h3>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase opacity-40 tracking-[0.2em] ml-1">Название стиля</label>
                  <input type="text" placeholder="Moody Dark..." className="w-full bg-[var(--bg-primary)] border border-[var(--border)] p-4 text-xs outline-none focus:border-[#FA0F00]/50 uppercase font-bold tracking-tighter text-[var(--text-main)]" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                </div>
                
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase opacity-40 tracking-[0.2em] ml-1">Цена (₸)</label>
                    <input type="text" placeholder="3500" className="w-full bg-[var(--bg-primary)] border border-[var(--border)] p-4 text-xs outline-none font-mono focus:border-[#FA0F00]/50 text-[var(--text-main)]" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase opacity-40 tracking-[0.2em] ml-1">Тип</label>
                    <select 
                      style={selectStyle}
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border)] p-4 text-[10px] font-black uppercase outline-none cursor-pointer appearance-none hover:border-[#FA0F00]/50 transition-all text-[var(--text-main)]" 
                      value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                    >
                      <option value="ПК">Для ПК</option>
                      <option value="Мобильные">Для Мобильных</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase opacity-40 tracking-[0.2em] ml-1">Формат</label>
                    <select 
                      style={selectStyle}
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border)] p-4 text-[10px] font-black uppercase outline-none cursor-pointer appearance-none hover:border-[#FA0F00]/50 transition-all text-[var(--text-main)]"
                      value={form.format} onChange={e => setForm({...form, format: e.target.value})}
                    >
                      <option value=".XMP">.XMP (LRC)</option>
                      <option value=".DNG">.DNG (Mobile)</option>
                      <option value=".ZIP">.ZIP Архив</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase opacity-40 tracking-[0.2em] ml-1">Версия ПО</label>
                    <select 
                      style={selectStyle}
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border)] p-4 text-[10px] font-black uppercase outline-none cursor-pointer appearance-none hover:border-[#FA0F00]/50 transition-all text-[var(--text-main)]"
                      value={form.version} onChange={e => setForm({...form, version: e.target.value})}
                    >
                      <option value="v12.0+">v12.0+</option>
                      <option value="v10.0+">v10.0+</option>
                      <option value="Universal">Любая</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* ЗАГРУЗОЧНЫЙ ЦЕНТР */}
              <div className="space-y-3 pt-6 border-t border-[var(--border)]">
                {['before', 'after', 'zip'].map((key) => (
                  <label key={key} className="flex items-center justify-between p-4 border border-dashed border-[var(--border)] cursor-pointer hover:bg-[#FA0F00]/5 transition-all group">
                    <span className="text-[9px] font-mono opacity-40 uppercase group-hover:opacity-100 truncate pr-4 text-[var(--text-main)]">
                      {files[key] ? files[key].name : `Загрузить_${key}_файл`}
                    </span>
                    <input type="file" className="hidden" onChange={e => setFiles({...files, [key]: e.target.files[0]})} />
                    <UploadCloud size={14} className="opacity-20 group-hover:text-[#FA0F00] group-hover:opacity-100 transition-all" />
                  </label>
                ))}
              </div>

              <button type="submit" disabled={loading} className="w-full py-5 bg-[#FA0F00] text-white font-[1000] uppercase text-[10px] tracking-[0.4em] shadow-xl hover:brightness-110 active:scale-95 disabled:opacity-20 transition-all">
                {loading ? 'ВЫПОЛНЯЕТСЯ ЗАПИСЬ...' : 'СОХРАНИТЬ В ОБЛАКО'}
              </button>
            </form>
          </div>

          {/* ТАБЛИЦА С ТОВАРАМИ */}
          <div className="lg:col-span-8 border border-[var(--border)] bg-[var(--bg-secondary)] shadow-sm overflow-hidden flex flex-col">
            <div className="p-8 border-b border-[var(--border)] bg-[var(--bg-primary)]/30">
               <h3 className="text-[10px] font-[1000] uppercase text-[#FA0F00] tracking-[0.4em] flex items-center gap-3">
                 <Hash size={14} /> Список активных объектов <span className="opacity-20 text-[var(--text-main)]">[{presets.length}]</span>
               </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--bg-primary)]/50 border-b border-[var(--border)] text-[9px] font-[1000] uppercase tracking-widest opacity-40">
                    <th className="p-8">Эскиз</th>
                    <th className="p-8">Название товара</th>
                    <th className="p-8">Параметры</th>
                    <th className="p-8 text-right">Опции</th>
                  </tr>
                </thead>
                <tbody className="text-[11px] font-bold">
                  {presets.map(item => (
                    <tr key={item.id} className="border-b border-[var(--border)] hover:bg-[var(--bg-primary)]/20 transition-colors group">
                      <td className="p-8">
                        <div className="w-14 h-14 border border-[var(--border)] overflow-hidden bg-black">
                          <img src={item.after_url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="" />
                        </div>
                      </td>
                      <td className="p-8">
                        <div className="space-y-1">
                          <p className="uppercase tracking-tight text-sm text-[var(--text-main)]">{item.name}</p>
                          <p className="text-[8px] font-mono opacity-20 italic">ID: {item.id.toString().slice(0,12)}...</p>
                        </div>
                      </td>
                      <td className="p-8">
                        <div className="flex flex-col gap-1.5 text-[10px]">
                          <div className="flex gap-2">
                             <span className="px-2 py-0.5 bg-[#FA0F00] text-white text-[8px] font-black uppercase">{item.category}</span>
                             <span className="px-2 py-0.5 border border-[var(--border)] text-[8px] font-black uppercase opacity-50 text-[var(--text-main)]">{item.format}</span>
                          </div>
                          <span className="font-mono text-[var(--text-main)] opacity-60">{item.price} ₸</span>
                        </div>
                      </td>
                      <td className="p-8 text-right">
                        <button onClick={() => handleDelete(item.id)} className="p-3 bg-[var(--bg-primary)] text-gray-500 hover:text-white hover:bg-red-600 transition-all border border-[var(--border)] rounded-sm">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {presets.length === 0 && <div className="p-20 text-center opacity-10 uppercase font-black tracking-widest italic text-xs">Система: База данных пуста</div>}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
