import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AnalyzeResponse } from './types';

/**
 * Local, on-device history of yard analyses, organized into folders
 * (e.g. "Front Yard", "Back Yard"). Persists across app restarts via
 * AsyncStorage. A cloud/multi-device version would require a backend DB + auth.
 */

export interface HistoryEntry {
  id: string;
  folderId: string;
  createdAt: number;
  note?: string;
  imageUri: string; // the original uploaded photo
  result: AnalyzeResponse;
}

export interface Folder {
  id: string;
  name: string;
}

const FOLDERS_KEY = 'landscape.folders.v1';
const ENTRIES_KEY = 'landscape.entries.v1';

const DEFAULT_FOLDERS: Folder[] = [
  { id: 'front-yard', name: 'Front Yard' },
  { id: 'back-yard', name: 'Back Yard' },
];

export async function getFolders(): Promise<Folder[]> {
  const raw = await AsyncStorage.getItem(FOLDERS_KEY);
  if (!raw) {
    await AsyncStorage.setItem(FOLDERS_KEY, JSON.stringify(DEFAULT_FOLDERS));
    return DEFAULT_FOLDERS;
  }
  try {
    return JSON.parse(raw) as Folder[];
  } catch {
    return DEFAULT_FOLDERS;
  }
}

export async function addFolder(name: string): Promise<Folder> {
  const folders = await getFolders();
  const folder: Folder = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: name.trim() || 'Untitled',
  };
  await AsyncStorage.setItem(FOLDERS_KEY, JSON.stringify([...folders, folder]));
  return folder;
}

export async function getEntries(): Promise<HistoryEntry[]> {
  const raw = await AsyncStorage.getItem(ENTRIES_KEY);
  if (!raw) return [];
  try {
    return (JSON.parse(raw) as HistoryEntry[]).sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return [];
  }
}

export async function getEntry(id: string): Promise<HistoryEntry | undefined> {
  return (await getEntries()).find((e) => e.id === id);
}

export async function addEntry(input: {
  folderId: string;
  note?: string;
  imageUri: string;
  result: AnalyzeResponse;
}): Promise<HistoryEntry> {
  const entries = await getEntries();
  const entry: HistoryEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: Date.now(),
    ...input,
  };
  await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify([entry, ...entries]));
  return entry;
}

export async function deleteEntry(id: string): Promise<void> {
  const entries = await getEntries();
  await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(entries.filter((e) => e.id !== id)));
}
