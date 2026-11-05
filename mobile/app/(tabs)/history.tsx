import React, { useCallback, useState } from 'react';
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  Image,
  Pressable,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../src/theme';
import {
  getFolders,
  getEntries,
  togglePin,
  moveEntry,
  deleteEntry,
  type Folder,
  type HistoryEntry,
} from '../../src/history';

export default function History() {
  const router = useRouter();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [menuEntry, setMenuEntry] = useState<HistoryEntry | null>(null);
  const [moveMode, setMoveMode] = useState(false);

  const reload = useCallback(async () => {
    const [f, e] = await Promise.all([getFolders(), getEntries()]);
    setFolders(f);
    setEntries(e);
  }, []);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      reload().then(() => !active && undefined);
      return () => {
        active = false;
      };
    }, [reload]),
  );

  const folderName = (id: string) => folders.find((f) => f.id === id)?.name ?? 'Folder';

  async function onPin() {
    if (!menuEntry) return;
    await togglePin(menuEntry.id);
    setMenuEntry(null);
    reload();
  }

  async function onMove(folderId: string) {
    if (!menuEntry) return;
    await moveEntry(menuEntry.id, folderId);
    setMenuEntry(null);
    setMoveMode(false);
    reload();
  }

  function onDelete() {
    if (!menuEntry) return;
    const entry = menuEntry;
    const doDelete = async () => {
      await deleteEntry(entry.id);
      setMenuEntry(null);
      reload();
    };
    if (Platform.OS === 'web') {
      // eslint-disable-next-line no-alert
      if (typeof window === 'undefined' || window.confirm('Delete this design?')) doDelete();
    } else {
      Alert.alert('Delete design', 'This cannot be undone.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: doDelete },
      ]);
    }
  }

  if (entries.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <Ionicons name="time-outline" size={46} color={theme.colors.textFaint} />
        <Text style={styles.emptyTitle}>No designs yet</Text>
        <Text style={styles.emptyText}>
          Head to Home, add a photo of your yard, and your designs will be saved here — pinned,
          recent, and organized into folders.
        </Text>
      </View>
    );
  }

  const pinned = entries.filter((e) => e.pinned);
  const recent = entries.slice(0, 5);

  const renderRow = (e: HistoryEntry, showFolder = false) => (
    <View key={e.id} style={styles.row}>
      <Pressable style={styles.rowMain} onPress={() => router.push(`/result/${e.id}`)}>
        <Image source={{ uri: e.imageUri }} style={styles.thumb} />
        <View style={{ flex: 1 }}>
          <Text style={styles.rowTitle} numberOfLines={1}>
            {e.pinned ? '📌 ' : ''}
            {e.note || 'Yard design'}
          </Text>
          <Text style={styles.rowMeta}>
            {new Date(e.createdAt).toLocaleDateString()} ·{' '}
            {e.result.analysis.suggestions.length} plants
            {showFolder ? ` · ${folderName(e.folderId)}` : ''}
          </Text>
        </View>
      </Pressable>
      <Pressable
        style={styles.menuBtn}
        onPress={() => {
          setMenuEntry(e);
          setMoveMode(false);
        }}
        hitSlop={10}
      >
        <Ionicons name="ellipsis-horizontal" size={20} color={theme.colors.textMuted} />
      </Pressable>
    </View>
  );

  return (
    <>
      <ScrollView style={{ backgroundColor: theme.colors.bg }} contentContainerStyle={styles.container}>
        {pinned.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📌 Pinned</Text>
            {pinned.map((e) => renderRow(e, true))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🗂️ Folders</Text>
          {folders.map((folder) => {
            const items = entries.filter((e) => e.folderId === folder.id);
            return (
              <View key={folder.id} style={{ marginBottom: theme.spacing(1.5) }}>
                <View style={styles.folderHead}>
                  <Ionicons name="folder" size={15} color={theme.colors.primary} />
                  <Text style={styles.folderName}>{folder.name}</Text>
                  <Text style={styles.count}>{items.length}</Text>
                </View>
                {items.length === 0 ? (
                  <Text style={styles.folderEmpty}>No designs in this folder yet.</Text>
                ) : (
                  items.map((e) => renderRow(e))
                )}
              </View>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🕘 Recent</Text>
          {recent.map((e) => renderRow(e, true))}
        </View>
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Per-entry action menu */}
      <Modal visible={!!menuEntry} transparent animationType="fade" onRequestClose={() => setMenuEntry(null)}>
        <Pressable style={styles.backdrop} onPress={() => setMenuEntry(null)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            {!moveMode ? (
              <>
                <Text style={styles.sheetTitle} numberOfLines={1}>
                  {menuEntry?.note || 'Yard design'}
                </Text>
                <MenuItem
                  icon={menuEntry?.pinned ? 'star' : 'star-outline'}
                  label={menuEntry?.pinned ? 'Unpin' : 'Pin to top'}
                  onPress={onPin}
                />
                <MenuItem icon="folder-open-outline" label="Move to folder…" onPress={() => setMoveMode(true)} />
                <MenuItem icon="trash-outline" label="Delete" danger onPress={onDelete} />
                <MenuItem icon="close" label="Cancel" onPress={() => setMenuEntry(null)} />
              </>
            ) : (
              <>
                <Text style={styles.sheetTitle}>Move to…</Text>
                {folders.map((f) => (
                  <MenuItem
                    key={f.id}
                    icon={menuEntry?.folderId === f.id ? 'checkmark-circle' : 'folder-outline'}
                    label={f.name}
                    onPress={() => onMove(f.id)}
                  />
                ))}
                <MenuItem icon="arrow-back" label="Back" onPress={() => setMoveMode(false)} />
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

function MenuItem({
  icon,
  label,
  onPress,
  danger,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.menuItem, pressed && { backgroundColor: theme.colors.surfaceAlt }]}
    >
      <Ionicons name={icon} size={20} color={danger ? theme.colors.danger : theme.colors.text} />
      <Text style={[styles.menuLabel, danger && { color: theme.colors.danger }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { padding: theme.spacing(2) },
  section: { marginBottom: theme.spacing(1.5) },
  sectionTitle: { ...theme.font.h3, color: theme.colors.text, marginBottom: theme.spacing(1) },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 7,
  },
  rowMain: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: 7 },
  thumb: { width: 40, height: 40, borderRadius: 8, marginRight: 10 },
  rowTitle: { color: theme.colors.text, fontSize: 14, fontWeight: '700' },
  rowMeta: { color: theme.colors.textMuted, fontSize: 11, marginTop: 1 },
  menuBtn: { paddingVertical: 10, paddingHorizontal: 12 },
  folderHead: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 7 },
  folderName: { color: theme.colors.text, fontWeight: '700', fontSize: 15, flex: 1 },
  count: {
    backgroundColor: theme.colors.primarySoft,
    color: theme.colors.primaryDark,
    fontWeight: '700',
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: theme.radius.pill,
  },
  folderEmpty: { color: theme.colors.textFaint, fontSize: 13, marginBottom: 10, marginLeft: 2 },
  emptyWrap: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(4),
  },
  emptyTitle: { ...theme.font.h2, color: theme.colors.text, marginTop: 14 },
  emptyText: { color: theme.colors.textMuted, textAlign: 'center', marginTop: 8, lineHeight: 21 },
  backdrop: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
    padding: theme.spacing(2),
    paddingBottom: theme.spacing(4),
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
  sheetTitle: {
    ...theme.font.label,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing(1),
    paddingHorizontal: 6,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderRadius: theme.radius.sm,
  },
  menuLabel: { ...theme.font.h3, color: theme.colors.text, fontWeight: '600' },
});
