import React from 'react';
import { Text, View, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { theme } from './theme';

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled,
}: {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline';
  disabled?: boolean;
}) {
  const isOutline = variant === 'outline';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        isOutline ? styles.btnOutline : styles.btnPrimary,
        (pressed || disabled) && { opacity: 0.6 },
      ]}
    >
      <Text style={[styles.btnText, isOutline && { color: theme.colors.primary }]}>{title}</Text>
    </Pressable>
  );
}

export function Chip({ label }: { label: string }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipText}>{label}</Text>
    </View>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius,
    padding: theme.spacing(2),
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing(1.5),
  },
  btn: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: theme.radius,
    alignItems: 'center',
  },
  btnPrimary: { backgroundColor: theme.colors.primary },
  btnOutline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: theme.colors.primary },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  chip: {
    backgroundColor: theme.colors.chip,
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 6,
    marginBottom: 6,
  },
  chipText: { color: theme.colors.primaryDark, fontSize: 12, fontWeight: '600' },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: theme.spacing(1),
    marginTop: theme.spacing(1),
  },
});
