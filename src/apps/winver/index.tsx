import { useEffect } from 'react';
import type { AppProps } from '@/core/types';
import { useWindow } from '@/core/window-context';
import { useSettings } from '@/core/store/settings';
import { StartGlyph } from '@/icons/ShellIcons';
import { Button } from '@/components/controls';
import './winver.css';

export default function Winver(_: AppProps) {
  const win = useWindow();
  const userName = useSettings((s) => s.userName);
  const deviceName = useSettings((s) => s.deviceName);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!win.isActive) return;
      if (e.key === 'Enter' || e.key === 'Escape') { e.preventDefault(); win.close(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [win]);

  return (
    <div className="wv-root">
      <div className="wv-brand">
        <StartGlyph size={44} className="wv-glyph" />
        <div className="wv-wordmark">
          <span className="wv-word-a">WinClone</span>
          <span className="wv-word-b">11</span>
        </div>
      </div>
      <div className="wv-rule" />
      <div className="wv-body">
        <p className="wv-line">WinClone</p>
        <p className="wv-line">Version 24H2 (OS Build 26100.2033)</p>
        <p className="wv-line">An open, community-made project.</p>
        <p className="wv-para">
          WinClone is an unofficial, browser-based recreation of the Windows&nbsp;11 desktop built for
          learning and fun. It runs entirely in your web browser, stores its files locally on this
          device, and is not affiliated with, endorsed by, or sponsored by Microsoft Corporation.
        </p>
        <p className="wv-para wv-license">
          This product is licensed to:
          <span className="wv-user">{userName || 'User'}</span>
          <span className="wv-user wv-org">{deviceName}</span>
        </p>
      </div>
      <div className="wv-footer">
        <Button variant="accent" className="wv-ok" onClick={() => win.close()} autoFocus>OK</Button>
      </div>
    </div>
  );
}
