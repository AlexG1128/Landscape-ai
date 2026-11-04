import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { theme } from '../src/theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '800' },
          contentStyle: { backgroundColor: theme.colors.bg },
        }}
      >
        <Stack.Screen name="index" options={{ title: '🌿 Landscape AI' }} />
        <Stack.Screen name="catalog" options={{ title: 'Plant Catalog' }} />
        <Stack.Screen name="stores" options={{ title: 'Where to Buy' }} />
        <Stack.Screen name="plant/[id]" options={{ title: 'Plant' }} />
      </Stack>
    </SafeAreaProvider>
  );
}
