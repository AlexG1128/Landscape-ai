import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../src/theme';
import { Button, Card, Chip, SectionTitle } from '../../src/components';
import { BeforeAfter } from '../../src/BeforeAfter';
import { getEntry, type HistoryEntry } from '../../src/history';

export default function Result() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [entry, setEntry] = useState<HistoryEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getEntry(String(id))
      .then((e) => active && setEntry(e ?? null))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) return <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 40 }} />;
  if (!entry) return <Text style={styles.error}>Design not found.</Text>;

  const { analysis, zone } = entry.result;
  const redesignAvailable = analysis.redesign.available;

  return (
    <ScrollView style={{ backgroundColor: theme.colors.bg }} contentContainerStyle={styles.container}>
      <SectionTitle style={{ marginTop: 0 }}>Before & After</SectionTitle>
      {redesignAvailable ? (
        <>
          <BeforeAfter beforeUri={entry.imageUri} afterUri={analysis.redesign.imageUrl} />
          <Text style={styles.hint}>Drag the handle to compare.</Text>
        </>
      ) : (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <Image source={{ uri: entry.imageUri }} style={styles.single} />
          <View style={styles.banner}>
            <Ionicons name="sparkles" size={16} color={theme.colors.accent} />
            <Text style={styles.bannerText}>
              AI photo redesign isn't enabled on your plan yet — your real plant suggestions are
              below.
            </Text>
          </View>
        </Card>
      )}

      <SectionTitle>Redesign Vision</SectionTitle>
      <Card>
        <Text style={styles.body}>{analysis.redesign.description}</Text>
      </Card>

      <SectionTitle>What We See</SectionTitle>
      <Card>
        <Text style={styles.body}>{analysis.summary}</Text>
        <Text style={styles.meta}>Estimated USDA zone: {zone}</Text>
        <View style={styles.chipRow}>
          {analysis.detectedFeatures.map((f) => (
            <Chip key={f} label={f} />
          ))}
        </View>
      </Card>

      <SectionTitle>Recommended Plants</SectionTitle>
      {analysis.suggestions.map((s) => (
        <Card key={s.plant.id} onPress={() => router.push(`/plant/${s.plant.id}`)}>
          <Text style={styles.plantName}>{s.plant.name}</Text>
          {!!s.plant.scientificName && <Text style={styles.sci}>{s.plant.scientificName}</Text>}
          <Text style={styles.body}>{s.reason}</Text>
          <Text style={styles.placement}>📍 {s.placement}</Text>
          <View style={{ height: 10 }} />
          <Button
            title="View plant & where to buy"
            variant="ghost"
            onPress={() => router.push(`/plant/${s.plant.id}`)}
          />
        </Card>
      ))}
      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: theme.spacing(2) },
  hint: { color: theme.colors.textFaint, fontSize: 12, textAlign: 'center', marginTop: 8 },
  single: { width: '100%', height: 230 },
  banner: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    padding: theme.spacing(1.5),
    backgroundColor: theme.colors.primarySoft,
  },
  bannerText: { flex: 1, color: theme.colors.primaryDark, fontSize: 12, fontWeight: '600' },
  body: { ...theme.font.body, color: theme.colors.text, lineHeight: 22 },
  meta: { color: theme.colors.textMuted, marginTop: 10, fontWeight: '600' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 },
  plantName: { ...theme.font.h3, color: theme.colors.text },
  sci: { fontStyle: 'italic', color: theme.colors.textFaint, marginBottom: 6 },
  placement: { color: theme.colors.primaryDark, marginTop: 8, fontWeight: '600' },
  error: { color: theme.colors.danger, margin: 24 },
});
