import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View, Image, StyleSheet, ActivityIndicator, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../src/api';
import { theme, categoryColor, categoryEmoji } from '../../src/theme';
import { plantImage } from '../../src/images';
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

  if (loading) return <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 40 }} />;
  if (error || !data) return <Text style={styles.error}>{error ?? 'Not found'}</Text>;

  const { plant, buyLinks } = data;

  return (
    <ScrollView style={{ backgroundColor: theme.colors.bg }} contentContainerStyle={styles.container}>
      <Image source={{ uri: plantImage(plant.category, plant.name, plant.imageUrl) }} style={styles.hero} />

      <Text style={styles.name}>{plant.name}</Text>
      {!!plant.scientificName && <Text style={styles.sci}>{plant.scientificName}</Text>}

      <View style={styles.chipRow}>
        <Chip label={plant.category} color={categoryColor[plant.category]} />
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
      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: theme.spacing(2) },
  hero: { width: '100%', height: 180, borderRadius: theme.radius.md, marginBottom: theme.spacing(2) },
  name: { ...theme.font.h1, color: theme.colors.text },
  sci: { fontStyle: 'italic', color: theme.colors.textFaint, marginBottom: 10 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', marginVertical: 8 },
  body: { ...theme.font.body, color: theme.colors.text, lineHeight: 23, fontSize: 15 },
  error: { color: theme.colors.danger, margin: 24 },
});
