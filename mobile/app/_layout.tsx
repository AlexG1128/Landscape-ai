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
          headerStyle: { backgroundColor: theme.colors.bg },
          headerShadowVisible: false,
          headerTintColor: theme.colors.text,
          headerTitleStyle: { fontWeight: '800' },
          contentStyle: { backgroundColor: theme.colors.bg },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="plant/[id]" options={{ title: 'Plant', headerBackTitle: 'Back' }} />
        <Stack.Screen name="result/[id]" options={{ title: 'Your Design', headerBackTitle: 'Back' }} />
      </Stack>
    </SafeAreaProvider>
  );
}
