import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getTickets, getQuestionsByTicket } from '@/database/repositories/contentRepo';
import { getStatsMap } from '@/database/repositories/progressRepo';

export function TicketsScreen() {
  const nav: any = useNavigation();
  const [tickets, setTickets] = useState<any[]>([]);
  const [statsMap, setStatsMap] = useState<Map<string, any>>(new Map());
  const load = useCallback(async () => {
    const t = await getTickets();
    setTickets(t);
    setStatsMap(await getStatsMap());
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <View style={styles.root}>
      <FlatList
        data={tickets}
        keyExtractor={(x) => x.ticketId}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        renderItem={({ item }) => {
          // naive per-ticket stats: count how many q ids belong
          return (
            <Pressable onPress={() => nav.navigate('QuestionRunner', { mode: 'ticket', ticketId: item.ticketId })} style={styles.card}>
              <Text style={styles.title}>{item.ticketId}</Text>
              <Text style={styles.muted}>{item.count} вопр.</Text>
            </Pressable>
          );
        }}
        ListEmptyComponent={<Text style={styles.muted}>Нет билетов — импортируйте базу.</Text>}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  card: { backgroundColor: '#151516', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#232326', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: '#fff', fontWeight: '700', fontSize: 16 },
  muted: { color: '#9AA0A6' },
});
