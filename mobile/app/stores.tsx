import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  Linking,
} from 'react-native';
import * as Location from 'expo-location';
import { useLocalSearchParams } from 'expo-router';
import { api } from '../src/api';
import { theme } from '../src/theme';
import { Button, Card } from '../src/components';
import type { StoresResponse } from '../src/types';

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
    <ScrollView contentContainerStyle={styles.container}>
      {params.query ? (
        <Text style={styles.header}>Where to buy “{params.query}”</Text>
      ) : (
        <Text style={styles.header}>Nearby garden & hardware stores</Text>
      )}

      {loading && <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 20 }} />}
      {error && <Text style={styles.error}>{error}</Text>}

      {data?.buyLinks?.length ? (
        <Card>
          <Text style={styles.cardTitle}>Shop online</Text>
          {data.buyLinks.map((l) => (
            <View key={l.name} style={{ marginTop: 8 }}>
              <Button title={`Search ${l.name}`} variant="outline" onPress={() => Linking.openURL(l.url)} />
            </View>
          ))}
        </Card>
      ) : null}

      {data?.stores.map((s) => (
        <Card key={s.id}>
          <Text style={styles.name}>{s.name}</Text>
          <Text style={styles.addr}>{s.address}</Text>
          <View style={styles.metaRow}>
            {s.distanceMiles !== undefined && (
              <Text style={styles.meta}>📍 {s.distanceMiles} mi</Text>
            )}
            {s.rating !== undefined && <Text style={styles.meta}>⭐ {s.rating}</Text>}
            {s.openNow !== undefined && (
              <Text style={[styles.meta, { color: s.openNow ? theme.colors.primary : '#b00020' }]}>
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
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: theme.spacing(2) },
  header: { fontSize: 20, fontWeight: '800', color: theme.colors.text, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: theme.colors.text },
  name: { fontSize: 17, fontWeight: '800', color: theme.colors.text },
  addr: { color: theme.colors.muted, marginTop: 2 },
  metaRow: { flexDirection: 'row', gap: 14, marginTop: 8 },
  meta: { color: theme.colors.text, fontWeight: '600' },
  error: { color: '#b00020', marginTop: 16 },
  empty: { color: theme.colors.muted, textAlign: 'center', marginTop: 24 },
});
