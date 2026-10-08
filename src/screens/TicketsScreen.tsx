// Author: Flenym — Liquid Glass Tickets
import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { getTickets } from '@/database/repositories/contentRepo';
import { ScreenBg } from '@/components/ScreenBg';
import { T } from '@/theme';

export function TicketsScreen() {
  const nav: any = useNavigation();
  const [tickets, setTickets] = useState<any[]>([]);
  const load = useCallback(async () => setTickets(await getTickets()), []);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  return (
    <ScreenBg>
      <FlatList
        data={tickets}
        keyExtractor={(x) => x.ticketId}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        ListHeaderComponent={<Text style={styles.h1}>Билеты</Text>}
        renderItem={({ item, index }) => (
          <Pressable onPress={() => nav.navigate('QuestionRunner', { mode: 'ticket', ticketId: item.ticketId })} style={styles.card}>
            <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
            <LinearGradient colors={index % 2 === 0 ? ['rgba(139,92,246,0.18)','transparent'] : ['rgba(6,182,214,0.16)','transparent']} style={StyleSheet.absoluteFill} />
            <View style={styles.row}><Text style={styles.num}>{String(index+1).padStart(2,'0')}</Text><View style={{ flex: 1 }}><Text style={styles.title}>{item.ticketId}</Text><Text style={styles.sub}>{item.count} вопросов</Text></View><Text style={styles.arrow}>›</Text></View>
          </Pressable>
        )}
        ListEmptyComponent={<Text style={{ color: T.muted }}>Нет билетов — импортируй базу.</Text>}
      />
    </ScreenBg>
  );
}
const styles = StyleSheet.create({
  h1: { color: '#fff', fontSize: 26, fontWeight: '900', marginBottom: 4 },
  card: { borderRadius: T.radius, overflow: 'hidden', borderWidth: 1, borderColor: T.border, backgroundColor: T.surface, padding: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  num: { color: 'rgba(255,255,255,0.35)', fontWeight: '900', fontSize: 18, width: 32 },
  title: { color: '#fff', fontWeight: '800', fontSize: 16 },
  sub: { color: T.muted, fontSize: 12, marginTop: 2 },
  arrow: { color: 'rgba(255,255,255,0.4)', fontSize: 24, fontWeight: '300' },
});
