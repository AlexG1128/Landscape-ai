import React, { useCallback, useState } from 'react';
import {
  ScrollView,
  Text,
  View,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
  Pressable,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../../src/api';
import { theme } from '../../src/theme';
import { heroImage } from '../../src/images';
import { Button, Card } from '../../src/components';
import { SideMenu, MenuButton } from '../../src/SideMenu';
import {
  getFolders,
  getEntries,
  addFolder,
  addEntry,
  type Folder,
  type HistoryEntry,
} from '../../src/history';

export default function Home() {
  const router = useRouter();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [folders, setFolders] = useState<Folder[]>([]);
  const [folderId, setFolderId] = useState<string>('front-yard');
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [expandedFolder, setExpandedFolder] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Refresh folders + saved designs whenever Home regains focus.
  useFocusEffect(
    useCallback(() => {
      let active = true;
      Promise.all([getFolders(), getEntries()]).then(([f, e]) => {
        if (!active) return;
        setFolders(f);
        setEntries(e);
        setFolderId((cur) => (f.some((x) => x.id === cur) ? cur : f[0]?.id ?? cur));
      });
      return () => {
        active = false;
      };
    }, []),
  );

  async function pickImage(fromCamera: boolean) {
    const perm = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Please allow access to continue.');
      return;
    }
    const opts: ImagePicker.ImagePickerOptions = {
      base64: true,
      quality: 0.6,
      allowsEditing: true,
      aspect: [4, 3],
    };
    const res = fromCamera
      ? await ImagePicker.launchCameraAsync(opts)
      : await ImagePicker.launchImageLibraryAsync(opts);
    if (!res.canceled && res.assets[0]) {
      setImageUri(res.assets[0].uri);
      setImageBase64(res.assets[0].base64 ?? null);
    }
  }

  async function createFolder(name: string | null | undefined) {
    if (!name || !name.trim()) return;
    const f = await addFolder(name);
    setFolders(await getFolders());
    setFolderId(f.id);
  }

  function newFolder() {
    // iOS has a native text prompt; web/Android fall back to window.prompt.
    if (Platform.OS === 'ios' && Alert.prompt) {
      Alert.prompt('New folder', 'Name this area (e.g. Side Yard)', (name) => createFolder(name));
    } else if (typeof window !== 'undefined' && window.prompt) {
      createFolder(window.prompt('Name this area (e.g. Side Yard)'));
    } else {
      createFolder('New Folder');
    }
  }

  async function analyze() {
    if (!imageBase64) {
      Alert.alert('Add a photo', 'Take or choose a photo of your yard first.');
      return;
    }
    setLoading(true);
    try {
      let coords: { lat: number; lng: number } | undefined;
      try {
        const perm = await Location.requestForegroundPermissionsAsync();
        if (perm.granted) {
          const loc = await Location.getCurrentPositionAsync({});
          coords = { lat: loc.coords.latitude, lng: loc.coords.longitude };
        }
      } catch {
        /* location optional */
      }

      const result = await api.analyze({
        image: `data:image/jpeg;base64,${imageBase64}`,
        lat: coords?.lat,
        lng: coords?.lng,
        note: note.trim() || undefined,
      });

      const entry = await addEntry({
        folderId,
        note: note.trim() || undefined,
        imageUri: imageUri!,
        result,
      });

      // Reset the composer and open the result.
      setNote('');
      router.push(`/result/${entry.id}`);
    } catch (e) {
      Alert.alert('Analysis failed', e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }} edges={['top']}>
      <View style={styles.topBar}>
        <MenuButton onPress={() => setMenuOpen(true)} />
      </View>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Hero splash */}
        <View style={styles.hero}>
          <Image source={{ uri: heroImage }} style={styles.heroImg} resizeMode="cover" />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroKicker}>LANDSCAPE AI</Text>
            <Text style={styles.heroTitle}>Reimagine your yard</Text>
            <Text style={styles.heroSub}>
              Add a photo and we'll design it, suggest plants, and show you where to buy.
            </Text>
          </View>
        </View>

        {/* Photo composer */}
        <Card style={styles.composer}>
          {imageUri ? (
            <View>
              <Image source={{ uri: imageUri }} style={styles.preview} />
              <Pressable style={styles.changeBtn} onPress={() => pickImage(false)}>
                <Ionicons name="image" size={16} color={theme.colors.primary} />
                <Text style={styles.changeText}>Change photo</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable style={styles.dropzone} onPress={() => pickImage(false)}>
              <Ionicons name="camera" size={34} color={theme.colors.primary} />
              <Text style={styles.dropTitle}>Add a photo of your yard</Text>
              <Text style={styles.dropHint}>Tap to choose from your library</Text>
            </Pressable>
          )}

          {!imageUri && (
            <View style={styles.row}>
              <Button title="Take Photo" onPress={() => pickImage(true)} style={{ flex: 1 }} />
              <View style={{ width: 10 }} />
              <Button
                title="Choose Photo"
                variant="outline"
                onPress={() => pickImage(false)}
                style={{ flex: 1 }}
              />
            </View>
          )}

          {/* Note / description */}
          <Text style={styles.fieldLabel}>What are you hoping for? (optional)</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="e.g. low-maintenance, lots of color, privacy from neighbors…"
            placeholderTextColor={theme.colors.textFaint}
            multiline
            style={styles.noteInput}
          />

          {/* Folder picker */}
          <Text style={styles.fieldLabel}>Save to</Text>
          <View style={styles.folderRow}>
            {folders.map((f) => (
              <Pressable
                key={f.id}
                onPress={() => setFolderId(f.id)}
                style={[styles.folderChip, folderId === f.id && styles.folderChipActive]}
              >
                <Ionicons
                  name="folder"
                  size={14}
                  color={folderId === f.id ? theme.colors.onPrimary : theme.colors.primary}
                />
                <Text
                  style={[styles.folderText, folderId === f.id && { color: theme.colors.onPrimary }]}
                >
                  {f.name}
                </Text>
              </Pressable>
            ))}
            <Pressable onPress={newFolder} style={styles.folderAdd}>
              <Ionicons name="add" size={16} color={theme.colors.primary} />
            </Pressable>
          </View>

          <View style={{ height: 6 }} />
          <Button
            title={loading ? 'Designing…' : '✨ Design My Yard'}
            onPress={analyze}
            disabled={loading}
          />
          {loading && (
            <View style={styles.loading}>
              <ActivityIndicator color={theme.colors.primary} />
              <Text style={styles.loadingText}>Reading your yard and choosing plants…</Text>
            </View>
          )}
        </Card>

        {/* Your Folders — quick access to previous designs */}
        {entries.length > 0 && (
          <View style={styles.foldersSection}>
            <Text style={styles.foldersHeading}>Your Folders</Text>
            {folders.map((f) => {
              const items = entries.filter((e) => e.folderId === f.id);
              const open = expandedFolder === f.id;
              return (
                <View key={f.id} style={styles.folderCard}>
                  <Pressable
                    style={styles.folderCardHead}
                    onPress={() => setExpandedFolder(open ? null : f.id)}
                  >
                    <Ionicons
                      name={open ? 'folder-open' : 'folder'}
                      size={18}
                      color={theme.colors.primary}
                    />
                    <Text style={styles.folderCardName}>{f.name}</Text>
                    <Text style={styles.folderCardCount}>{items.length}</Text>
                    <Ionicons
                      name={open ? 'chevron-up' : 'chevron-down'}
                      size={16}
                      color={theme.colors.textFaint}
                    />
                  </Pressable>
                  {open &&
                    (items.length === 0 ? (
                      <Text style={styles.folderCardEmpty}>No designs here yet.</Text>
                    ) : (
                      items.map((e) => (
                        <Pressable
                          key={e.id}
                          style={styles.folderItem}
                          onPress={() => router.push(`/result/${e.id}`)}
                        >
                          <Image source={{ uri: e.imageUri }} style={styles.folderItemThumb} />
                          <View style={{ flex: 1 }}>
                            <Text style={styles.folderItemTitle} numberOfLines={1}>
                              {e.pinned ? '📌 ' : ''}
                              {e.note || 'Yard design'}
                            </Text>
                            <Text style={styles.folderItemMeta}>
                              {new Date(e.createdAt).toLocaleDateString()}
                            </Text>
                          </View>
                          <Ionicons name="chevron-forward" size={16} color={theme.colors.textFaint} />
                        </Pressable>
                      ))
                    ))}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      <SideMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        folders={folders}
        entries={entries}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing(2),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(0.5),
  },
  container: { padding: theme.spacing(2), paddingTop: theme.spacing(1), paddingBottom: theme.spacing(4) },
  hero: {
    height: 220,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    marginBottom: theme.spacing(2),
    ...theme.shadow.card,
  },
  heroImg: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  heroOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: theme.spacing(2.5),
    backgroundColor: 'rgba(23,37,20,0.18)',
  },
  heroKicker: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    opacity: 0.9,
  },
  heroTitle: { color: '#fff', ...theme.font.h1, marginTop: 4 },
  heroSub: { color: '#fff', fontSize: 14, marginTop: 6, opacity: 0.95, lineHeight: 20 },
  composer: { padding: theme.spacing(2) },
  dropzone: {
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing(4),
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceAlt,
    marginBottom: theme.spacing(1.5),
  },
  dropTitle: { ...theme.font.h3, color: theme.colors.text, marginTop: 10 },
  dropHint: { color: theme.colors.textMuted, marginTop: 2, fontSize: 13 },
  preview: { width: '100%', height: 220, borderRadius: theme.radius.md },
  changeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
    marginTop: 10,
  },
  changeText: { color: theme.colors.primary, fontWeight: '700' },
  row: { flexDirection: 'row', marginBottom: theme.spacing(1) },
  fieldLabel: {
    ...theme.font.label,
    color: theme.colors.textMuted,
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
  },
  noteInput: {
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 14,
    minHeight: 70,
    textAlignVertical: 'top',
    color: theme.colors.text,
    fontSize: 15,
  },
  folderRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  folderChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primarySoft,
  },
  folderChipActive: { backgroundColor: theme.colors.primary },
  folderText: { color: theme.colors.primaryDark, fontWeight: '600', fontSize: 13 },
  folderAdd: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loading: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: theme.spacing(2) },
  loadingText: { color: theme.colors.textMuted, fontSize: 13 },

  foldersSection: { marginTop: theme.spacing(1) },
  foldersHeading: { ...theme.font.h3, color: theme.colors.text, marginBottom: theme.spacing(1.5) },
  folderCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 10,
    overflow: 'hidden',
    ...theme.shadow.card,
  },
  folderCardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: theme.spacing(1.75),
  },
  folderCardName: { flex: 1, color: theme.colors.text, fontWeight: '700', fontSize: 15 },
  folderCardCount: {
    backgroundColor: theme.colors.primarySoft,
    color: theme.colors.primaryDark,
    fontWeight: '700',
    fontSize: 12,
    paddingHorizontal: 9,
    paddingVertical: 2,
    borderRadius: theme.radius.pill,
  },
  folderCardEmpty: {
    color: theme.colors.textFaint,
    fontSize: 13,
    paddingHorizontal: theme.spacing(1.75),
    paddingBottom: theme.spacing(1.75),
  },
  folderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: theme.spacing(1.75),
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  folderItemThumb: { width: 36, height: 36, borderRadius: 8 },
  folderItemTitle: { color: theme.colors.text, fontWeight: '600', fontSize: 14 },
  folderItemMeta: { color: theme.colors.textMuted, fontSize: 11, marginTop: 1 },
});
