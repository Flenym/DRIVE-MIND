// Author: Flenym
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { GlassCard } from '@/components/GlassCard';
import { ScreenBg } from '@/components/ScreenBg';
import data from '../../assets/content/theory.json';
import { T } from '@/theme';
export function TheoryScreen() {
  return (
    <ScreenBg><View style={{ flex: 1, padding: 16 }}>
      <Text style={styles.h1}>Теория</Text>
      <FlatList data={data as any[]} keyExtractor={(x)=>x.id} contentContainerStyle={{ gap: 10, paddingVertical: 12 }} renderItem={({item})=>(
        <GlassCard><Text style={styles.title}>{item.title}</Text><Text style={{ color: '#E5E7EB', marginTop: 6, lineHeight: 20 }}>{item.body}</Text><Text style={{ color: T.muted, fontSize: 11, marginTop: 8 }}>Пункт {item.clause} · {item.source} · {item.verifiedAt}</Text></GlassCard>
      )} /></View></ScreenBg>
  );
}
const styles = StyleSheet.create({ h1: { color: '#fff', fontSize: 24, fontWeight: '900' }, title: { color: '#fff', fontWeight: '800', fontSize: 16 } });
