import React, { useRef, useState } from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  PanResponder,
  LayoutChangeEvent,
} from 'react-native';
import { theme } from './theme';

/**
 * A draggable before/after image reveal. Drag the handle left/right to wipe
 * between the original ("before") and the redesigned ("after") image.
 */
export function BeforeAfter({
  beforeUri,
  afterUri,
  height = 240,
}: {
  beforeUri: string;
  afterUri: string;
  height?: number;
}) {
  const [width, setWidth] = useState(0);
  const [pos, setPos] = useState(0.5); // 0..1 reveal position
  const widthRef = useRef(0);

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    setWidth(w);
    widthRef.current = w;
  };

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_evt, gesture) => {
        const w = widthRef.current;
        if (!w) return;
        const x = Math.max(0, Math.min(w, gesture.moveX - (gesture.x0 - gesture.moveX < 0 ? 0 : 0)));
        // Use absolute moveX relative to component by clamping to [0,1].
        const rel = Math.max(0, Math.min(1, gesture.moveX / w));
        setPos(rel);
      },
    }),
  ).current;

  const revealWidth = width * pos;

  return (
    <View style={[styles.wrap, { height }]} onLayout={onLayout} {...pan.panHandlers}>
      {/* After (full, underneath) */}
      <Image source={{ uri: afterUri }} style={styles.img} resizeMode="cover" />
      <View style={[styles.tag, styles.tagRight]}>
        <Text style={styles.tagText}>After</Text>
      </View>

      {/* Before (clipped to reveal width, on top) */}
      <View style={[styles.beforeClip, { width: revealWidth }]}>
        <Image source={{ uri: beforeUri }} style={[styles.img, { width }]} resizeMode="cover" />
        <View style={[styles.tag, styles.tagLeft]}>
          <Text style={styles.tagText}>Before</Text>
        </View>
      </View>

      {/* Handle */}
      <View style={[styles.handleLine, { left: revealWidth - 1 }]} />
      <View style={[styles.handle, { left: revealWidth - 18 }]}>
        <Text style={styles.handleArrows}>⟺</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    borderRadius: theme.radius.md,
    overflow: 'hidden',
    backgroundColor: theme.colors.surfaceAlt,
  },
  img: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  beforeClip: { position: 'absolute', top: 0, left: 0, bottom: 0, overflow: 'hidden' },
  handleLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#fff',
  },
  handle: {
    position: 'absolute',
    top: '50%',
    marginTop: -18,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadow.floating,
  },
  handleArrows: { fontSize: 16, color: theme.colors.primary, fontWeight: '900' },
  tag: {
    position: 'absolute',
    top: 10,
    backgroundColor: theme.colors.overlay,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
  },
  tagLeft: { left: 10 },
  tagRight: { right: 10 },
  tagText: { color: '#fff', fontSize: 11, fontWeight: '700' },
});
