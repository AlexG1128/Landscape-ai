import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { theme } from './theme';
import type { Folder, HistoryEntry } from './history';

const SCREEN_W = Dimensions.get('window').width;
const PANEL_W = Math.min(320, SCREEN_W * 0.84);

/**
 * ChatGPT-style slide-out drawer. Starts closed; slides over the screen with a
 * dimmed backdrop. Closes on backdrop tap, the X, or opening a chat.
 */
export function SideMenu({
  open,
  onClose,
  folders,
  entries,
}: {
  open: boolean;
  onClose: () => void;
  folders: Folder[];
  entries: HistoryEntry[];
}) {
  const router = useRouter();
  const slide = useRef(new Animated.Value(-PANEL_W)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slide, {
        toValue: open ? 0 : -PANEL_W,
        duration: 240,
        useNativeDriver: true,
      }),
      Animated.timing(fade, { toValue: open ? 1 : 0, duration: 240, useNativeDriver: true }),
    ]).start();
  }, [open, slide, fade]);

  function openChat(id: string) {
    onClose();
    router.push(`/result/${id}`);
  }

  const pinned = entries.filter((e) => e.pinned);
  const recent = entries.slice(0, 8);

  // When fully closed, render nothing so it never blocks touches.
  if (!open) {
    return <ClosedTap slide={slide} fade={fade} />;
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View style={[styles.backdrop, { opacity: fade }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      <Animated.View style={[styles.panel, { transform: [{ translateX: slide }] }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Designs</Text>
          <Pressable onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={24} color={theme.colors.text} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
          {entries.length === 0 && (
            <Text style={styles.empty}>No designs yet. Add a yard photo to get started.</Text>
          )}

          {folders.map((f) => {
            const items = entries.filter((e) => e.folderId === f.id);
            if (items.length === 0) return null;
            return (
              <View key={f.id} style={styles.group}>
                <View style={styles.groupHead}>
                  <Ionicons name="folder" size={14} color={theme.colors.primary} />
                  <Text style={styles.groupLabel}>{f.name}</Text>
                </View>
                {items.map((e) => (
                  <ChatRow key={e.id} entry={e} onPress={() => openChat(e.id)} />
                ))}
              </View>
            );
          })}

          {pinned.length > 0 && (
            <View style={styles.group}>
              <View style={styles.groupHead}>
                <Text style={styles.groupLabel}>📌 Pinned</Text>
              </View>
              {pinned.map((e) => (
                <ChatRow key={e.id} entry={e} onPress={() => openChat(e.id)} />
              ))}
            </View>
          )}

          {recent.length > 0 && (
            <View style={styles.group}>
              <View style={styles.groupHead}>
                <Text style={styles.groupLabel}>🕘 Recent</Text>
              </View>
              {recent.map((e) => (
                <ChatRow key={e.id} entry={e} onPress={() => openChat(e.id)} />
              ))}
            </View>
          )}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

function ChatRow({ entry, onPress }: { entry: HistoryEntry; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.chat, pressed && { backgroundColor: theme.colors.surfaceAlt }]}
    >
      <Image source={{ uri: entry.imageUri }} style={styles.chatThumb} />
      <Text style={styles.chatText} numberOfLines={1}>
        {entry.note || 'Yard design'}
      </Text>
    </Pressable>
  );
}

// Keeps the Animated values mounted for a smooth close without blocking touches.
function ClosedTap({ slide, fade }: { slide: Animated.Value; fade: Animated.Value }) {
  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.panel, { transform: [{ translateX: slide }], opacity: fade }]}
    />
  );
}

/** Floating hamburger button to open the menu. */
export function MenuButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable style={styles.fab} onPress={onPress} hitSlop={8}>
      <Ionicons name="menu" size={22} color={theme.colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: theme.colors.overlay },
  panel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: PANEL_W,
    backgroundColor: theme.colors.surface,
    borderRightWidth: 1,
    borderRightColor: theme.colors.border,
    paddingTop: 54,
    ...theme.shadow.floating,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing(2),
    paddingBottom: theme.spacing(1.5),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: { ...theme.font.h3, color: theme.colors.text },
  empty: { color: theme.colors.textMuted, padding: theme.spacing(2), lineHeight: 20 },
  group: { marginTop: theme.spacing(1.5) },
  groupHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: theme.spacing(2),
    marginBottom: 4,
  },
  groupLabel: { ...theme.font.label, color: theme.colors.textMuted },
  chat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: theme.spacing(2),
  },
  chatThumb: { width: 30, height: 30, borderRadius: 7 },
  chatText: { flex: 1, color: theme.colors.text, fontSize: 14, fontWeight: '500' },
  fab: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadow.card,
  },
});
