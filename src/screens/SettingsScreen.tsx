// Author: Flenym
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { getMeta } from '@/database/db';
import { Button } from '@/components/Button';
import { GlassCard } from '@/components/GlassCard';
import { ScreenBg } from '@/components/ScreenBg';
import { T } from '@/theme';
export function SettingsScreen() {
  const [ver, setVer] = useState<string|null>(null);
  useEffect(()=>{getMeta('content_version').then(setVer);},[]);
  return (
    <ScreenBg><View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={styles.h1}>Настройки</Text>
      <GlassCard><Text style={{ color: '#fff', fontWeight: '700' }}>DRIVE MIND v1.0.0</Text><Text style={{ color: T.muted, marginTop: 4 }}>Автор и владелец: Flenym</Text><Text style={{ color: T.muted, marginTop: 2 }}>База · v{ver ?? '—'} · демо 12 вопросов</Text></GlassCard>
      <Button title="Обновить базу" onPress={()=>Alert.alert('Обновление','Настрой expo.extra.updateManifestUrl и подключи загрузчик.')} />
      <Text style={{ color: T.muted }}>План 7/10/14 дней — скоро.</Text>
    </View></ScreenBg>
  );
}
const styles = StyleSheet.create({ h1: { color: '#fff', fontSize: 24, fontWeight: '900' } });
