import type { AppProps } from '@/core/types';
import { getApp } from '@/apps/registry';
import { AppIcon } from '@/icons/AppIcons';
import { TitleBar } from '@/shell/window/TitleBar';

/** Temporary body used by apps that have not been built yet. */
export function Placeholder({ appId }: AppProps & { appId: string }) {
  const app = getApp(appId)!;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {app.titlebar === 'custom' && <TitleBar title={app.name} appId={appId} height={app.captionHeight} variant="winui" />}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <AppIcon appId={appId} size={64} />
        <div className="t-subtitle">{app.name}</div>
      </div>
    </div>
  );
}
