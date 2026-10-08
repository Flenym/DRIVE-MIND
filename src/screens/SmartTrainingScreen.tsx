// Author: Flenym — Liquid Glass SmartTraining
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenBg } from '@/components/ScreenBg';
import { T } from '@/theme';

const OPTS = [{ m: 5, label: '5 минут', sub: '~10 вопросов' },{ m: 10, label: '10 минут', sub: '~20 вопросов' },{ m: 15, label: '15 минут', sub: '~30 вопросов' },{ m: 20, label: '20 минут', sub: '~40 вопросов' }];

export function SmartTrainingScreen({ navigation }: any) {
  return (
    <ScreenBg>
      <View style={{ padding: 16, gap: 12, flex: 1 }}>
        <Text style={styles.h1}>Умная тренировка</Text>
        <Text style={styles.sub}>FSRS подбирает: ошибки → просроченные → новые</Text>
        {OPTS.map((o) => (
          <Pressable key={o.m} onPress={() => navigation.navigate('QuestionRunner', { mode: 'smart', duration: o.m })} style={styles.card}>
            <BlurView intensity={18} tint="dark" style={StyleSheet.absoluteFill} />
            <LinearGradient colors={['rgba(139,92,246,0.16)','transparent']} style={StyleSheet.absoluteFill} />
            <Text style={styles.cardTitle}>{o.label}</Text><Text style={styles.cardSub}>{o.sub}</Text>
          </Pressable>
        ))}
        <Pressable onPress={() => navigation.navigate('QuestionRunner', { mode: 'smart' })} style={[styles.card, { borderColor: 'rgba(34,197,94,0.22)' }]}>
          <Text style={[styles.cardTitle, { color: T.green }]}>Без ограничения ♾️</Text><Text style={styles.cardSub}>Пока не устанешь</Text>
        </Pressable>
      </View>
    </ScreenBg>
  );
}
const styles = StyleSheet.create({ h1: { color: '#fff', fontSize: 24, fontWeight: '900' }, sub: { color: T.muted, fontWeight: '600' }, card: { borderRadius: T.radius, overflow: 'hidden', borderWidth: 1, borderColor: T.border, backgroundColor: T.surface, padding: 18 }, cardTitle: { color: '#fff', fontWeight: '800', fontSize: 16 }, cardSub: { color: T.muted, fontSize: 12, marginTop: 4 } });
