import { useEffect } from 'react';
import { useSettings, type Wallpaper } from '@/core/store/settings';
import { accentPalette } from '@/core/color';
import { wallpaperById } from '@/core/wallpapers';

export function wallpaperCss(wp: Wallpaper): { image?: string; color?: string } {
  if (wp.type === 'color') return { color: wp.color };
  if (wp.type === 'custom') return { image: wp.url };
  return { image: wallpaperById(wp.id)?.url ?? wallpaperById('flow-light')!.url };
}

/** Render a tiny, heavily blurred copy of the wallpaper for the Mica material. */
function makeMica(src: string | undefined, color: string | undefined): Promise<string> {
  return new Promise((resolve) => {
    const c = document.createElement('canvas');
    c.width = 64;
    c.height = 36;
    const ctx = c.getContext('2d')!;
    if (!src) {
      ctx.fillStyle = color ?? '#777';
      ctx.fillRect(0, 0, c.width, c.height);
      return resolve(c.toDataURL());
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.filter = 'blur(3px) saturate(1.4)';
      // cover-fit
      const r = Math.max(c.width / img.width, c.height / img.height);
      const w = img.width * r, h = img.height * r;
      ctx.drawImage(img, (c.width - w) / 2 - 4, (c.height - h) / 2 - 4, w + 8, h + 8);
      try { resolve(c.toDataURL()); } catch { resolve(''); }
    };
    img.onerror = () => resolve('');
    img.src = src;
  });
}

export function ThemeManager() {
  const s = useSettings();

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = s.theme;
    root.dataset.transparency = s.transparency ? 'on' : 'off';
    root.dataset.animations = s.animations ? 'on' : 'off';
    root.dataset.accentBorders = s.accentOnTitleBars ? 'on' : 'off';
    root.dataset.accentTaskbar = s.accentOnStartTaskbar && s.theme === 'dark' ? 'on' : 'off';
    const p = accentPalette(s.accent);
    root.style.setProperty('--accent', p.base);
    root.style.setProperty('--accent-light1', p.light1);
    root.style.setProperty('--accent-light2', p.light2);
    root.style.setProperty('--accent-light3', p.light3);
    root.style.setProperty('--accent-dark1', p.dark1);
    root.style.setProperty('--accent-dark2', p.dark2);
    root.style.setProperty('--accent-dark3', p.dark3);
    root.style.fontSize = `${s.textSize}%`;
  }, [s.theme, s.transparency, s.animations, s.accent, s.accentOnTitleBars, s.accentOnStartTaskbar, s.textSize]);

  useEffect(() => {
    let cancelled = false;
    const { image, color } = wallpaperCss(s.wallpaper);
    const root = document.documentElement;
    root.style.setProperty('--wallpaper', image ? `url("${image}")` : 'none');
    root.style.setProperty('--wallpaper-color', color ?? '#000');
    makeMica(image, color).then((url) => {
      if (!cancelled && url) root.style.setProperty('--mica-img', `url("${url}")`);
    });
    return () => { cancelled = true; };
  }, [s.wallpaper]);

  return null;
}

/** Full-screen overlays for brightness and night light. */
export function DisplayFilters() {
  const brightness = useSettings((s) => s.brightness);
  const night = useSettings((s) => s.nightLight);
  const strength = useSettings((s) => s.nightLightStrength);
  return (
    <>
      <div
        className="display-filter"
        style={{ background: '#000', opacity: Math.max(0, (100 - brightness) / 100) * 0.75 }}
      />
      <div
        className="display-filter"
        style={{ background: 'rgb(255, 140, 20)', mixBlendMode: 'multiply', opacity: night ? 0.12 + (strength / 100) * 0.38 : 0, transition: 'opacity 1.5s ease' }}
      />
    </>
  );
}
