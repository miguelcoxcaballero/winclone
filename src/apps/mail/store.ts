import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { seedMessages } from './seed';

export type FolderId = 'inbox' | 'junk' | 'drafts' | 'sent' | 'deleted' | 'archive' | 'notes';

export interface Person { name: string; email: string }

export interface Message {
  id: string;
  folder: FolderId;
  from: Person;
  to: Person[];
  cc: Person[];
  subject: string;
  /** Plain text body (used for previews, replies and user-composed mail) */
  text: string;
  /** Optional trusted, app-authored HTML body for seeded newsletters / receipts */
  html?: string;
  date: number;
  read: boolean;
  flagged: boolean;
  pinned: boolean;
  /** Inbox only: true → Focused, false → Other */
  focused: boolean;
  /** Folder to restore to from Deleted Items */
  prevFolder?: FolderId;
  draft?: boolean;
  /** Draft context */
  replyTo?: string;
  mode?: ComposeMode;
  attachments?: { name: string; size: string }[];
}

export type ComposeMode = 'new' | 'reply' | 'replyAll' | 'forward';

export interface MailPrefs {
  focusedInbox: boolean;
  senderImages: boolean;
  previewText: boolean;
  markReadOnOpen: boolean;
  folderPane: boolean;
  readingPane: boolean;
}

interface MailStore {
  messages: Message[];
  prefs: MailPrefs;
  favorites: FolderId[];
  setPrefs: (p: Partial<MailPrefs>) => void;
  update: (id: string, patch: Partial<Message>) => void;
  updateMany: (ids: string[], patch: Partial<Message>) => void;
  add: (m: Message) => void;
  remove: (id: string) => void;
  /** Delete → Deleted Items (or permanently when already there) */
  trash: (ids: string[]) => void;
  move: (ids: string[], folder: FolderId) => void;
  emptyFolder: (folder: FolderId) => void;
  toggleFavorite: (f: FolderId) => void;
}

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

export const useMail = create<MailStore>()(
  persist(
    (set, get) => ({
      messages: seedMessages(),
      prefs: { focusedInbox: true, senderImages: true, previewText: true, markReadOnOpen: true, folderPane: true, readingPane: true },
      favorites: ['inbox', 'sent', 'drafts'],
      setPrefs: (p) => set({ prefs: { ...get().prefs, ...p } }),
      update: (id, patch) => set({ messages: get().messages.map((m) => (m.id === id ? { ...m, ...patch } : m)) }),
      updateMany: (ids, patch) => set({ messages: get().messages.map((m) => (ids.includes(m.id) ? { ...m, ...patch } : m)) }),
      add: (m) => set({ messages: [m, ...get().messages] }),
      remove: (id) => set({ messages: get().messages.filter((m) => m.id !== id) }),
      trash: (ids) =>
        set({
          messages: get().messages.flatMap((m) => {
            if (!ids.includes(m.id)) return [m];
            if (m.folder === 'deleted') return [];
            return [{ ...m, prevFolder: m.folder, folder: 'deleted' as FolderId, pinned: false }];
          }),
        }),
      move: (ids, folder) =>
        set({ messages: get().messages.map((m) => (ids.includes(m.id) ? { ...m, prevFolder: m.folder, folder, pinned: folder === m.folder ? m.pinned : false } : m)) }),
      emptyFolder: (folder) => set({ messages: get().messages.filter((m) => m.folder !== folder) }),
      toggleFavorite: (f) => {
        const fav = get().favorites;
        set({ favorites: fav.includes(f) ? fav.filter((x) => x !== f) : [...fav, f] });
      },
    }),
    { name: 'wc.mail', version: 1 },
  ),
);

export const FOLDER_NAMES: Record<FolderId, string> = {
  inbox: 'Inbox',
  junk: 'Junk Email',
  drafts: 'Drafts',
  sent: 'Sent Items',
  deleted: 'Deleted Items',
  archive: 'Archive',
  notes: 'Notes',
};

export const FOLDER_ORDER: FolderId[] = ['inbox', 'junk', 'drafts', 'sent', 'deleted', 'archive', 'notes'];
