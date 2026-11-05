import React from 'react';
import { Text, View, StyleSheet, Pressable, ViewStyle, TextStyle } from 'react-native';
import { theme } from './theme';

export function Card({
  children,
  style,
  onPress,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
}) {
  const content = <View style={[styles.card, style]}>{children}</View>;
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => pressed && { opacity: 0.85 }}>
        {content}
      </Pressable>
    );
  }
  return content;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled,
  style,
}: {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'ghost';
  disabled?: boolean;
  style?: ViewStyle;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        variant === 'primary' && styles.btnPrimary,
        variant === 'outline' && styles.btnOutline,
        variant === 'ghost' && styles.btnGhost,
        (pressed || disabled) && { opacity: 0.6 },
        style,
      ]}
    >
      <Text
        style={[
          styles.btnText,
          variant !== 'primary' && { color: theme.colors.primary },
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

export function Chip({ label, color }: { label: string; color?: string }) {
  return (
    <View style={[styles.chip, color && { backgroundColor: color + '22' }]}>
      <Text style={[styles.chipText, color && { color }]}>{label}</Text>
    </View>
  );
}

export function SectionTitle({ children, style }: { children: React.ReactNode; style?: TextStyle }) {
  return <Text style={[styles.sectionTitle, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing(2),
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing(1.5),
    ...theme.shadow.card,
  },
  btn: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimary: { backgroundColor: theme.colors.primary, ...theme.shadow.card },
  btnOutline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: theme.colors.primary },
  btnGhost: { backgroundColor: theme.colors.primarySoft },
  btnText: { color: theme.colors.onPrimary, fontWeight: '700', fontSize: 16 },
  chip: {
    backgroundColor: theme.colors.primarySoft,
    borderRadius: theme.radius.pill,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  chipText: { color: theme.colors.primaryDark, fontSize: 12, fontWeight: '600' },
  sectionTitle: {
    ...theme.font.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing(1.5),
    marginTop: theme.spacing(2),
  },
});
