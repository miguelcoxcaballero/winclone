import { create } from 'zustand';

export interface Notification {
  id: string;
  appId: string;
  title: string;
  body?: string;
  time: number;
  /** Optional action when clicked */
  onClick?: () => void;
  /** Optional image url */
  image?: string;
}

interface NotificationStore {
  items: Notification[];
  /** ids currently shown as toasts */
  toasts: string[];
  notify: (n: Omit<Notification, 'id' | 'time'>) => string;
  dismiss: (id: string) => void;
  dismissToast: (id: string) => void;
  clear: (appId?: string) => void;
}

let seq = 0;

export const useNotifications = create<NotificationStore>()((set, get) => ({
  items: [],
  toasts: [],
  notify: (n) => {
    const id = `n${++seq}`;
    const item: Notification = { ...n, id, time: Date.now() };
    set({ items: [item, ...get().items], toasts: [...get().toasts, id] });
    return id;
  },
  dismiss: (id) => set({ items: get().items.filter((x) => x.id !== id), toasts: get().toasts.filter((x) => x !== id) }),
  dismissToast: (id) => set({ toasts: get().toasts.filter((x) => x !== id) }),
  clear: (appId) =>
    set({ items: appId ? get().items.filter((x) => x.appId !== appId) : [], toasts: appId ? get().toasts : [] }),
}));

export const notify = (n: Omit<Notification, 'id' | 'time'>) => useNotifications.getState().notify(n);
