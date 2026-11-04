import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  Text,
  View,
  TextInput,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '../src/api';
import { theme, categoryEmoji } from '../src/theme';
import { Card, Chip } from '../src/components';
import type { Plant } from '../src/types';

const CATEGORIES = [
  'all',
  'flower',
  'shrub',
  'tree',
  'vegetable',
  'herb',
  'groundcover',
  'seed',
];

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
      .getPlants({
        category: category === 'all' ? undefined : category,
        search: search || undefined,
      })
      .then((d) => active && setPlants(d.plants))
      .catch((e) => active && setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [category, search]);

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <TextInput
        placeholder="Search plants, tags, flowers…"
        value={search}
        onChangeText={setSearch}
        style={styles.input}
        placeholderTextColor={theme.colors.muted}
      />

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

      {loading && <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 20 }} />}
      {error && <Text style={styles.error}>{error}</Text>}

      {!loading &&
        plants.map((p) => (
          <Pressable key={p.id} onPress={() => router.push(`/plant/${p.id}`)}>
            <Card>
              <Text style={styles.name}>
                {categoryEmoji[p.category] ?? '🌱'} {p.name}
              </Text>
              {!!p.scientificName && <Text style={styles.sci}>{p.scientificName}</Text>}
              <Text style={styles.desc}>{p.description}</Text>
              <View style={styles.chipRow}>
                <Chip label={p.sun} />
                <Chip label={`${p.water} water`} />
                <Chip label={`zones ${p.zones[0]}–${p.zones[1]}`} />
              </View>
            </Card>
          </Pressable>
        ))}

      {!loading && plants.length === 0 && !error && (
        <Text style={styles.empty}>No plants match your filters.</Text>
      )}
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: theme.spacing(2) },
  input: {
    backgroundColor: '#fff',
    borderRadius: theme.radius,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.colors.text,
  },
  filters: { marginVertical: 12 },
  filter: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: 8,
  },
  filterActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  filterText: { color: theme.colors.text, fontWeight: '600', textTransform: 'capitalize' },
  filterTextActive: { color: '#fff' },
  name: { fontSize: 17, fontWeight: '800', color: theme.colors.text },
  sci: { fontStyle: 'italic', color: theme.colors.muted, marginBottom: 6 },
  desc: { color: theme.colors.text, lineHeight: 20 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
  error: { color: '#b00020', marginTop: 16 },
  empty: { color: theme.colors.muted, textAlign: 'center', marginTop: 24 },
});
