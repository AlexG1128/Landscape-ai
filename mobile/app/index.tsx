import React, { useState } from 'react';
import {
  ScrollView,
  Text,
  View,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Link, useRouter } from 'expo-router';
import { api } from '../src/api';
import { theme } from '../src/theme';
import { Button, Card, Chip, SectionTitle } from '../src/components';
import type { AnalyzeResponse } from '../src/types';

export default function Home() {
  const router = useRouter();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);

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
      setResult(null);
    }
  }

  async function getLocation() {
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (!perm.granted) return;
      const loc = await Location.getCurrentPositionAsync({});
      setCoords({ lat: loc.coords.latitude, lng: loc.coords.longitude });
    } catch {
      // Location is optional; ignore failures.
    }
  }

  async function analyze() {
    if (!imageBase64) {
      Alert.alert('Add a photo', 'Take or choose a photo of your yard first.');
      return;
    }
    setLoading(true);
    try {
      if (!coords) await getLocation();
      const data = await api.analyze({
        image: `data:image/jpeg;base64,${imageBase64}`,
        lat: coords?.lat,
        lng: coords?.lng,
      });
      setResult(data);
    } catch (e) {
      Alert.alert('Analysis failed', e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.hero}>Design your yard with AI</Text>
      <Text style={styles.sub}>
        Snap a photo of your front or back yard and get plant suggestions, a redesign vision, and
        where to buy — tailored to your climate.
      </Text>

      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.preview} />
      ) : (
        <View style={styles.placeholder}>
          <Text style={{ fontSize: 42 }}>📸</Text>
          <Text style={{ color: theme.colors.muted, marginTop: 8 }}>No photo yet</Text>
        </View>
      )}

      <View style={styles.row}>
        <View style={styles.flex}>
          <Button title="Take Photo" onPress={() => pickImage(true)} />
        </View>
        <View style={{ width: 10 }} />
        <View style={styles.flex}>
          <Button title="Choose Photo" variant="outline" onPress={() => pickImage(false)} />
        </View>
      </View>

      <View style={{ height: 10 }} />
      <Button
        title={loading ? 'Analyzing…' : '✨ Analyze My Yard'}
        onPress={analyze}
        disabled={loading}
      />

      <View style={styles.links}>
        <Link href="/catalog" style={styles.link}>
          🌱 Browse Plant Catalog
        </Link>
        <Link href="/stores" style={styles.link}>
          🛒 Find Nearby Stores
        </Link>
      </View>

      {loading && (
        <View style={{ marginTop: 24, alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={{ color: theme.colors.muted, marginTop: 8 }}>
            Reading your yard and choosing plants…
          </Text>
        </View>
      )}

      {result && (
        <View style={{ marginTop: 16 }}>
          <SectionTitle>Redesign Vision</SectionTitle>
          <Card>
            <Image source={{ uri: result.analysis.redesign.imageUrl }} style={styles.redesign} />
            <Text style={styles.body}>{result.analysis.redesign.description}</Text>
          </Card>

          <SectionTitle>What We See</SectionTitle>
          <Card>
            <Text style={styles.body}>{result.analysis.summary}</Text>
            <Text style={styles.meta}>USDA zone (estimated): {result.zone}</Text>
            <View style={styles.chipRow}>
              {result.analysis.detectedFeatures.map((f) => (
                <Chip key={f} label={f} />
              ))}
            </View>
          </Card>

          <SectionTitle>Recommended Plants</SectionTitle>
          {result.analysis.suggestions.map((s) => (
            <Card key={s.plant.id}>
              <Text style={styles.plantName}>{s.plant.name}</Text>
              {!!s.plant.scientificName && (
                <Text style={styles.sci}>{s.plant.scientificName}</Text>
              )}
              <Text style={styles.body}>{s.reason}</Text>
              <Text style={styles.placement}>📍 {s.placement}</Text>
              <View style={{ height: 8 }} />
              <Button
                title="View plant & where to buy"
                variant="outline"
                onPress={() => router.push(`/plant/${s.plant.id}`)}
              />
            </Card>
          ))}
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: theme.spacing(2) },
  hero: { fontSize: 26, fontWeight: '900', color: theme.colors.text },
  sub: { color: theme.colors.muted, marginTop: 6, marginBottom: 16, lineHeight: 20 },
  preview: { width: '100%', height: 220, borderRadius: theme.radius, marginBottom: 12 },
  redesign: { width: '100%', height: 200, borderRadius: 10, marginBottom: 10, backgroundColor: '#eef3ec' },
  placeholder: {
    width: '100%',
    height: 220,
    borderRadius: theme.radius,
    backgroundColor: '#e7efe2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  row: { flexDirection: 'row' },
  flex: { flex: 1 },
  links: { marginTop: 18, gap: 10 },
  link: { color: theme.colors.primary, fontWeight: '700', fontSize: 16 },
  body: { color: theme.colors.text, lineHeight: 21 },
  meta: { color: theme.colors.muted, marginTop: 8, fontWeight: '600' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
  plantName: { fontSize: 17, fontWeight: '800', color: theme.colors.text },
  sci: { fontStyle: 'italic', color: theme.colors.muted, marginBottom: 6 },
  placement: { color: theme.colors.primaryDark, marginTop: 6, fontWeight: '600' },
});
