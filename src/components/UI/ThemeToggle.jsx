import React from 'react';
import { Moon, Sun, Tv, Sparkles, Eye } from 'lucide-react';
import { useTheme, THEMES, THEME_CONFIG } from '../../context/ThemeContext';

export default function ThemeToggle({ compact = false }) {
  const { theme, changeTheme, availableThemes } = useTheme();

  const themes = [
    { key: THEMES.DEFAULT, icon: Sun, label: 'Padrão' },
    { key: THEMES.DARK, icon: Moon, label: 'Escuro' },
    { key: THEMES.CINEMA, icon: Tv, label: 'Cinema' },
    { key: THEMES.KIDS, icon: Sparkles, label: 'Infantil' }
  ];

  if (compact) {
    return (
      <button
        onClick={() => {
          const currentIdx = themes.findIndex(t => t.key === theme);
          const nextIdx = (currentIdx + 1) % themes.length;
          changeTheme(themes[nextIdx].key);
        }}
        className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
      >
        {theme === THEMES.KIDS && <Sparkles size={18} className="text-green-400" />}
        {theme === THEMES.CINEMA && <Tv size={18} className="text-red-500" />}
        {theme === THEMES.DARK && <Moon size={18} className="text-white" />}
        {theme === THEMES.DEFAULT && <Sun size={18} className="text-white/50" />}
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="text-xs font-black uppercase tracking-widest text-white/40">
        Tema
      </label>
      
      <div className="grid grid-cols-2 gap-2">
        {themes.map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => changeTheme(key)}
            className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${
              theme === key
                ? `bg-${key}/20 border-[${THEME_CONFIG[key].primary}]/50`
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
            style={{
              backgroundColor: theme === key && THEME_CONFIG[key] ? `${THEME_CONFIG[key].primary}20` : undefined,
              borderColor: theme === key && THEME_CONFIG[key] ? `${THEME_CONFIG[key].primary}50` : undefined
            }}
          >
            <Icon 
              size={18} 
              style={{ color: THEME_CONFIG[key].primary }}
            />
            <span className="text-xs font-bold text-white">{label}</span>
          </button>
        ))}
      </div>

      {theme === THEMES.KIDS && (
        <div className="mt-2 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
          <div className="flex items-center gap-2 text-green-400 text-xs font-bold">
            <Sparkles size={14} />
            <span>Modo Infantil Ativo</span>
          </div>
          <p className="text-white/50 text-[10px] mt-1">
            Canais infantis destacados • Interface colorida
          </p>
        </div>
      )}

      {theme === THEMES.CINEMA && (
        <div className="mt-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
          <div className="flex items-center gap-2 text-red-400 text-xs font-bold">
            <Tv size={14} />
            <span>Modo Cinema</span>
          </div>
          <p className="text-white/50 text-[10px] mt-1">
            Interface escura para melhor experiência noturna
          </p>
        </div>
      )}
    </div>
  );
}
