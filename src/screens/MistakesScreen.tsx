// Author: Flenym
import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getAllQuestions } from '@/database/repositories/contentRepo';
import { getStatsMap } from '@/database/repositories/progressRepo';
import { Button } from '@/components/Button';
import { GlassCard } from '@/components/GlassCard';
import { ScreenBg } from '@/components/ScreenBg';
import { T } from '@/theme';
export function MistakesScreen({ navigation }: any) {
  const [items, setItems] = useState<any[]>([]);
  const load = useCallback(async () => { const qs = await getAllQuestions(); const map = await getStatsMap(); setItems(qs.filter((q)=>{const s=map.get(q.id); return s && (s.lastAnswerCorrect===false || s.incorrect>0);})); }, []);
  useFocusEffect(useCallback(()=>{load();},[load]));
  return (
    <ScreenBg><View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={styles.h1}>Ошибки — {items.length}</Text>
      {items.length>0 && <Button title="Повторить все ошибки" onPress={()=>navigation.navigate('QuestionRunner',{mode:'mistakes'})} />}
      <FlatList data={items} keyExtractor={(x)=>x.id} contentContainerStyle={{ gap: 10 }} renderItem={({item})=><GlassCard><Text style={{ color: '#fff', fontWeight: '600' }}>{item.text.slice(0,90)}</Text><Text style={{ color: T.muted, fontSize: 12, marginTop: 6 }}>{item.ticketId} · #{item.questionNumber}</Text></GlassCard>} />
    </View></ScreenBg>
  );
}
const styles = StyleSheet.create({ h1: { color: '#fff', fontSize: 22, fontWeight: '900' } });
