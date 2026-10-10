/**
 * Produce a static visual snapshot of a window by cloning its DOM.
 * Used by taskbar previews and Task View. Canvas content is copied as an image
 * where possible so drawings/videos show up too.
 */
export function snapshotWindow(winId: string, maxW: number, maxH: number): HTMLElement | null {
  const src = document.querySelector<HTMLElement>(`.win[data-win-id="${winId}"]`);
  if (!src) return null;
  const w = src.offsetWidth, h = src.offsetHeight;
  if (!w || !h) return null;
  const scale = Math.min(maxW / w, maxH / h);
  const clone = src.cloneNode(true) as HTMLElement;
  // copy canvases
  const srcCanvases = src.querySelectorAll('canvas');
  const dstCanvases = clone.querySelectorAll('canvas');
  srcCanvases.forEach((c, i) => {
    try {
      const img = document.createElement('img');
      img.src = c.toDataURL();
      img.style.cssText = (dstCanvases[i] as HTMLElement).style.cssText;
      img.width = c.width;
      img.height = c.height;
      img.className = (dstCanvases[i] as HTMLElement).className;
      dstCanvases[i].replaceWith(img);
    } catch { /* tainted canvas */ }
  });
  clone.querySelectorAll('iframe, video').forEach((el) => {
    const ph = document.createElement('div');
    ph.style.cssText = `${(el as HTMLElement).style.cssText};background:var(--layer-fill-alt);width:100%;height:100%`;
    el.replaceWith(ph);
  });
  clone.querySelectorAll('.rz, .snap-layouts').forEach((el) => el.remove());
  clone.removeAttribute('data-win-id');
  clone.classList.remove('anim-opening', 'anim-closing', 'anim-minimizing', 'anim-restoring', 'min-hidden', 'peek', 'geom-anim');
  clone.classList.add('active');
  clone.classList.remove('inactive');
  Object.assign(clone.style, {
    position: 'absolute', left: '0', top: '0', zIndex: '0', transform: `scale(${scale})`, transformOrigin: '0 0',
    pointerEvents: 'none', boxShadow: 'none', visibility: 'visible', opacity: '1', animation: 'none',
  });
  const wrap = document.createElement('div');
  Object.assign(wrap.style, { position: 'relative', width: `${Math.round(w * scale)}px`, height: `${Math.round(h * scale)}px`, overflow: 'hidden', borderRadius: '4px' });
  wrap.appendChild(clone);
  return wrap;
}
