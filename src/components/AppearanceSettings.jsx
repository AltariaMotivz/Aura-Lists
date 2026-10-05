import React from 'react';
import { Sun, Moon, Check } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
const palettes = [
  {id:'prism',name:'Prism',description:'Electric cyan · vivid violet',colors:['#00ffff','#a78bfa','#ff00ff']},
  {id:'aurora',name:'Aurora',description:'Fresh mint · northern blue',colors:['#4de0b0','#79a8ff','#49c9cf']},
  {id:'sunset',name:'Sunset',description:'Golden peach · warm rose',colors:['#ffb36b','#ed94ad','#e77aab']}
];
export default function AppearanceSettings() {
  const {theme,setTheme,palette,setPalette}=useTheme();
  return <section className="appearance-settings" aria-label="Appearance settings"><p className="aura-preview-description">Choose your atmosphere. Colors and light mode are saved on this device.</p><div className="aura-filter-tabs appearance-modes" aria-label="Color mode"><button aria-pressed={theme==='light'} onClick={()=>setTheme('light')}><Sun size={18}/>Light</button><button aria-pressed={theme==='dark'} onClick={()=>setTheme('dark')}><Moon size={18}/>Dark</button></div><div className="appearance-palettes">{palettes.map(option=><button key={option.id} className="appearance-palette" aria-pressed={palette===option.id} onClick={()=>setPalette(option.id)}><span className="appearance-swatches" aria-hidden="true">{option.colors.map(color=><i key={color} style={{background:color}}/>)}</span><span><strong>{option.name}</strong><small>{option.description}</small></span>{palette===option.id && <Check size={18} aria-hidden="true"/>}</button>)}</div><p role="status" className="appearance-status">{palettes.find(option=>option.id===palette).name} · {theme==='light'?'Light':'Dark'}</p></section>;
}
