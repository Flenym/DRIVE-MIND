import { View, Text, StyleSheet, FlatList } from 'react-native';
import data from '../../assets/content/theory.json';
export function TheoryScreen() {
  return (
    <View style={styles.root}>
      <Text style={styles.h1}>Теория ПДД</Text>
      <FlatList data={data as any[]} keyExtractor={(x) => x.id} contentContainerStyle={{ gap: 10, paddingVertical: 12 }} renderItem={({ item }) => (
        <View style={styles.card}><Text style={styles.title}>{item.title}</Text><Text style={{ color: '#C9CDD1', marginTop: 6 }}>{item.body}</Text><Text style={{ color: '#9AA0A6', fontSize: 12, marginTop: 6 }}>Пункт: {item.clause} · {item.source} · {item.verifiedAt}</Text></View>
      )} />
    </View>
  );
}
const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: '#000', padding: 16 }, h1: { color: '#fff', fontSize: 20, fontWeight: '800' }, card: { backgroundColor: '#151516', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#232326' }, title: { color: '#fff', fontWeight: '700', fontSize: 16 } });
