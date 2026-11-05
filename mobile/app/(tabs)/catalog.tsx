import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  Text,
  View,
  TextInput,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../src/api';
import { theme, categoryColor, categoryEmoji } from '../../src/theme';
import { plantImage } from '../../src/images';
import { Chip } from '../../src/components';
import type { Plant } from '../../src/types';

const CATEGORIES = ['all', 'flower', 'shrub', 'tree', 'vegetable', 'herb', 'groundcover', 'grass', 'seed'];

export default function Catalog() {
  const router = useRouter();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api
      .getPlants({ category: category === 'all' ? undefined : category, search: search || undefined })
      .then((d) => active && setPlants(d.plants))
      .catch((e) => active && setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [category, search]);

  return (
    <View style={styles.screen}>
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color={theme.colors.textFaint} />
        <TextInput
          placeholder="Search plants, flowers, tags…"
          value={search}
          onChangeText={setSearch}
          style={styles.input}
          placeholderTextColor={theme.colors.textFaint}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
        {CATEGORIES.map((c) => (
          <Pressable
            key={c}
            onPress={() => setCategory(c)}
            style={[styles.filter, category === c && styles.filterActive]}
          >
            <Text style={[styles.filterText, category === c && styles.filterTextActive]}>
              {c === 'all' ? 'All' : `${categoryEmoji[c] ?? ''} ${c}`}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {loading && <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 30 }} />}
      {error && <Text style={styles.error}>{error}</Text>}

      {!loading && (
        <ScrollView contentContainerStyle={styles.list}>
          {plants.map((p) => (
            <Pressable
              key={p.id}
              style={styles.card}
              onPress={() => router.push(`/plant/${p.id}`)}
            >
              <Image source={{ uri: plantImage(p.category, p.name) }} style={styles.cardImg} />
              <View style={styles.cardBody}>
                <Text style={styles.name} numberOfLines={1}>
                  {p.name}
                </Text>
                {!!p.scientificName && (
                  <Text style={styles.sci} numberOfLines={1}>
                    {p.scientificName}
                  </Text>
                )}
                <View style={styles.chipRow}>
                  <Chip label={p.category} color={categoryColor[p.category]} />
                  <Chip label={p.sun} />
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.textFaint} />
            </Pressable>
          ))}
          {plants.length === 0 && !error && (
            <Text style={styles.empty}>No plants match your filters.</Text>
          )}
          <View style={{ height: 20 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.bg, paddingHorizontal: theme.spacing(2) },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 14,
    marginTop: theme.spacing(1),
  },
  input: { flex: 1, paddingVertical: 12, fontSize: 15, color: theme.colors.text },
  filters: { marginVertical: 12, flexGrow: 0 },
  filter: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: 8,
    height: 38,
    justifyContent: 'center',
  },
  filterActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  filterText: { color: theme.colors.text, fontWeight: '600', textTransform: 'capitalize' },
  filterTextActive: { color: theme.colors.onPrimary },
  list: { paddingBottom: 10 },
  card: {
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
  cardImg: { width: 64, height: 64, borderRadius: theme.radius.sm, marginRight: 12 },
  cardBody: { flex: 1 },
  name: { ...theme.font.h3, color: theme.colors.text },
  sci: { fontStyle: 'italic', color: theme.colors.textFaint, fontSize: 12, marginBottom: 6 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap' },
  error: { color: theme.colors.danger, marginTop: 16 },
  empty: { color: theme.colors.textMuted, textAlign: 'center', marginTop: 30 },
});
