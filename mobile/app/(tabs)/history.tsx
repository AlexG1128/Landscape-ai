import React, { useCallback, useState } from 'react';
import { ScrollView, Text, View, StyleSheet, Image, Pressable } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../src/theme';
import { getFolders, getEntries, type Folder, type HistoryEntry } from '../../src/history';

export default function History() {
  const router = useRouter();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  // Reload whenever the tab gains focus (so new designs appear).
  useFocusEffect(
    useCallback(() => {
      let active = true;
      Promise.all([getFolders(), getEntries()]).then(([f, e]) => {
        if (!active) return;
        setFolders(f);
        setEntries(e);
      });
      return () => {
        active = false;
      };
    }, []),
  );

  if (entries.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <Ionicons name="time-outline" size={46} color={theme.colors.textFaint} />
        <Text style={styles.emptyTitle}>No designs yet</Text>
        <Text style={styles.emptyText}>
          Head to Home, add a photo of your yard, and your designs will be saved here — organized
          into folders like Front Yard and Back Yard.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ backgroundColor: theme.colors.bg }} contentContainerStyle={styles.container}>
      {folders.map((folder) => {
        const items = entries.filter((e) => e.folderId === folder.id);
        if (items.length === 0) return null;
        return (
          <View key={folder.id} style={{ marginBottom: theme.spacing(3) }}>
            <View style={styles.folderHead}>
              <Ionicons name="folder" size={18} color={theme.colors.primary} />
              <Text style={styles.folderName}>{folder.name}</Text>
              <Text style={styles.count}>{items.length}</Text>
            </View>
            {items.map((e) => (
              <Pressable key={e.id} style={styles.row} onPress={() => router.push(`/result/${e.id}`)}>
                <Image source={{ uri: e.imageUri }} style={styles.thumb} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle} numberOfLines={1}>
                    {e.note || 'Yard design'}
                  </Text>
                  <Text style={styles.rowMeta}>
                    {new Date(e.createdAt).toLocaleDateString()} ·{' '}
                    {e.result.analysis.suggestions.length} plants
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.colors.textFaint} />
              </Pressable>
            ))}
          </View>
        );
      })}
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: theme.spacing(2) },
  folderHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  folderName: { ...theme.font.h3, color: theme.colors.text, flex: 1 },
  count: {
    backgroundColor: theme.colors.primarySoft,
    color: theme.colors.primaryDark,
    fontWeight: '700',
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: theme.radius.pill,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 10,
    marginBottom: 10,
    ...theme.shadow.card,
  },
  thumb: { width: 56, height: 56, borderRadius: theme.radius.sm, marginRight: 12 },
  rowTitle: { ...theme.font.h3, color: theme.colors.text, fontSize: 15 },
  rowMeta: { color: theme.colors.textMuted, fontSize: 12, marginTop: 2 },
  emptyWrap: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(4),
  },
  emptyTitle: { ...theme.font.h2, color: theme.colors.text, marginTop: 14 },
  emptyText: { color: theme.colors.textMuted, textAlign: 'center', marginTop: 8, lineHeight: 21 },
});
