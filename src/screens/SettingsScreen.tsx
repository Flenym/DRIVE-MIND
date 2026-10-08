import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { getMeta } from '@/database/db';
import { Button } from '@/components/Button';

export function SettingsScreen() {
  const [ver, setVer] = useState<string | null>(null);
  useEffect(() => { getMeta('content_version').then(setVer); }, []);
  return (
    <View style={styles.root}>
      <Text style={styles.h1}>Настройки</Text>
      <Text style={styles.muted}>Версия базы: {ver ?? '—'}</Text>
      <Text style={styles.muted}>Автообновление: проверяет manifest.json по URL из сборки. Без сети — офлайн.</Text>
      <Button title="Обновить базу" onPress={() => Alert.alert('Обновление', 'Настройте URL манифеста в expo.extra.updateManifestUrl и реализуйте загрузку. Пока — демо-база.')} style={{ marginTop: 16 }} />
      <Text style={styles.muted}>План 7/10/14 дней — в разработке (см. PROJECT_PLAN §12).</Text>
    </View>
  );
}
const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: '#000', padding: 16, gap: 8 }, h1: { color: '#fff', fontSize: 20, fontWeight: '800' }, muted: { color: '#9AA0A6' } });
