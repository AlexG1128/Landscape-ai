import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '../../src/api';
import { theme, categoryEmoji } from '../../src/theme';
import { Button, Card, Chip, SectionTitle } from '../../src/components';
import type { PlantDetail } from '../../src/types';

export default function PlantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<PlantDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api
      .getPlant(String(id))
      .then((d) => active && setData(d))
      .catch((e) => active && setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 40 }} />;
  }
  if (error || !data) {
    return <Text style={styles.error}>{error ?? 'Not found'}</Text>;
  }

  const { plant, buyLinks } = data;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.name}>
        {categoryEmoji[plant.category] ?? '🌱'} {plant.name}
      </Text>
      {!!plant.scientificName && <Text style={styles.sci}>{plant.scientificName}</Text>}

      <View style={styles.chipRow}>
        <Chip label={plant.category} />
        <Chip label={plant.sun} />
        <Chip label={`${plant.water} water`} />
        <Chip label={`zones ${plant.zones[0]}–${plant.zones[1]}`} />
        {!!plant.bloomSeason && <Chip label={`blooms ${plant.bloomSeason}`} />}
        {!!plant.matureHeightFt && (
          <Chip label={`${plant.matureHeightFt[0]}–${plant.matureHeightFt[1]} ft`} />
        )}
      </View>

      <Card>
        <Text style={styles.body}>{plant.description}</Text>
      </Card>

      <SectionTitle>Tags</SectionTitle>
      <View style={styles.chipRow}>
        {plant.tags.map((t) => (
          <Chip key={t} label={t} />
        ))}
      </View>

      <SectionTitle>Where to buy</SectionTitle>
      <Card>
        {buyLinks.map((l) => (
          <View key={l.name} style={{ marginBottom: 8 }}>
            <Button title={`Search ${l.name}`} variant="outline" onPress={() => Linking.openURL(l.url)} />
          </View>
        ))}
        <Button
          title="Find nearby stores"
          onPress={() => router.push(`/stores?query=${encodeURIComponent(plant.name)}`)}
        />
      </Card>
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: theme.spacing(2) },
  name: { fontSize: 24, fontWeight: '900', color: theme.colors.text },
  sci: { fontStyle: 'italic', color: theme.colors.muted, marginBottom: 10 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', marginVertical: 8 },
  body: { color: theme.colors.text, lineHeight: 22, fontSize: 15 },
  error: { color: '#b00020', margin: 24 },
});
