import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View, StyleSheet, ActivityIndicator, Linking } from 'react-native';
import * as Location from 'expo-location';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../src/api';
import { theme } from '../../src/theme';
import { Button, Card } from '../../src/components';
import type { StoresResponse } from '../../src/types';

export default function Stores() {
  const params = useLocalSearchParams<{ query?: string }>();
  const [data, setData] = useState<StoresResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        let lat: number | undefined;
        let lng: number | undefined;
        const perm = await Location.requestForegroundPermissionsAsync();
        if (perm.granted) {
          const loc = await Location.getCurrentPositionAsync({});
          lat = loc.coords.latitude;
          lng = loc.coords.longitude;
        }
        const res = await api.getStores({ lat, lng, query: params.query });
        if (active) setData(res);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Failed to load stores');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [params.query]);

  return (
    <ScrollView style={{ backgroundColor: theme.colors.bg }} contentContainerStyle={styles.container}>
      <Text style={styles.header}>
        {params.query ? `Where to buy "${params.query}"` : 'Nearby garden & hardware stores'}
      </Text>

      {loading && <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 24 }} />}
      {error && <Text style={styles.error}>{error}</Text>}

      {data?.buyLinks?.length ? (
        <Card>
          <Text style={styles.cardTitle}>Shop online</Text>
          {data.buyLinks.map((l) => (
            <View key={l.name} style={{ marginTop: 8 }}>
              <Button title={`Search ${l.name}`} variant="ghost" onPress={() => Linking.openURL(l.url)} />
            </View>
          ))}
        </Card>
      ) : null}

      {data?.stores.map((s) => (
        <Card key={s.id}>
          <View style={styles.storeHead}>
            <Ionicons name="storefront" size={20} color={theme.colors.primary} />
            <Text style={styles.name}>{s.name}</Text>
          </View>
          <Text style={styles.addr}>{s.address}</Text>
          <View style={styles.metaRow}>
            {s.distanceMiles !== undefined && <Text style={styles.meta}>📍 {s.distanceMiles} mi</Text>}
            {s.rating !== undefined && <Text style={styles.meta}>⭐ {s.rating}</Text>}
            {s.openNow !== undefined && (
              <Text style={[styles.meta, { color: s.openNow ? theme.colors.success : theme.colors.danger }]}>
                {s.openNow ? 'Open now' : 'Closed'}
              </Text>
            )}
          </View>
          {!!s.url && (
            <View style={{ marginTop: 10 }}>
              <Button title="Open" onPress={() => Linking.openURL(s.url!)} />
            </View>
          )}
        </Card>
      ))}

      {!loading && !data?.stores.length && !error && (
        <Text style={styles.empty}>No stores found.</Text>
      )}
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: theme.spacing(2) },
  header: { ...theme.font.h2, color: theme.colors.text, marginBottom: 14 },
  cardTitle: { ...theme.font.h3, color: theme.colors.text },
  storeHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { ...theme.font.h3, color: theme.colors.text, flex: 1 },
  addr: { color: theme.colors.textMuted, marginTop: 4 },
  metaRow: { flexDirection: 'row', gap: 16, marginTop: 10 },
  meta: { color: theme.colors.text, fontWeight: '600', fontSize: 13 },
  error: { color: theme.colors.danger, marginTop: 16 },
  empty: { color: theme.colors.textMuted, textAlign: 'center', marginTop: 30 },
});
