import { createRoot } from 'react-dom/client';
import './styles/tokens.css';
import './styles/global.css';
import { App } from './shell/App';
import { useShell } from './core/store/shell';
import { useSettings } from './core/store/settings';
import { useWindows } from './core/store/windows';
import { ensureEngine } from './apps/clock/store';

// Developer / screenshot helpers:
//   ?reset=1        clear persisted state
//   ?skip=1         skip boot + lock screen, go straight to the desktop
//   ?theme=dark     force a theme
//   ?app=notepad    open an app on load (comma separated; ?args={json} for the first one)
//   ?max=1          maximize the opened app
const params = new URLSearchParams(location.search);
if (params.get('reset')) {
  localStorage.removeItem('wc.settings');
  localStorage.removeItem('wc.fs');
}
const theme = params.get('theme');
if (theme === 'dark' || theme === 'light') useSettings.getState().set({ theme, appTheme: theme, wallpaper: { type: 'image', id: theme === 'dark' ? 'flow-dark' : 'flow-light' } });
if (params.get('skip') || params.get('app')) useShell.getState().setPhase('desktop');

createRoot(document.getElementById('root')!).render(<App />);
ensureEngine();

const apps = params.get('app');
if (apps) {
  let args: any;
  try { args = params.get('args') ? JSON.parse(params.get('args')!) : undefined; } catch { /* ignore */ }
  setTimeout(() => {
    apps.split(',').forEach((a, i) => {
      const id = useWindows.getState().open(a.trim(), i === 0 ? args : undefined);
      if (id && params.get('max')) useWindows.getState().maximize(id);
    });
  }, 50);
}

// Expose stores for debugging in the console
Object.assign(window as any, { wc: { shell: useShell, settings: useSettings, windows: useWindows } });
