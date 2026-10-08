import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { initDb } from '@/database/db';
import { seedDemoIfEmpty } from '@/database/seed';
import { HomeScreen } from '@/screens/HomeScreen';
import { TicketsScreen } from '@/screens/TicketsScreen';
import { StatisticsScreen } from '@/screens/StatisticsScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { QuestionRunner } from '@/screens/QuestionRunner';
import { SmartTrainingScreen } from '@/screens/SmartTrainingScreen';
import { MistakesScreen } from '@/screens/MistakesScreen';
import { TheoryScreen } from '@/screens/TheoryScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function Tabs() {
  return (
    <Tab.Navigator screenOptions={{ headerStyle: { backgroundColor: '#000' }, headerTintColor: '#fff', tabBarStyle: { backgroundColor: '#000', borderTopColor: '#1A1A1C' }, tabBarActiveTintColor: '#22C55E', tabBarInactiveTintColor: '#9AA0A6' }}>
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: 'Главная', headerTitle: 'DRIVE MIND' }} />
      <Tab.Screen name="TicketsTab" component={TicketsScreen} options={{ title: 'Билеты' }} />
      <Tab.Screen name="StatsTab" component={StatisticsScreen} options={{ title: 'Статистика' }} />
      <Tab.Screen name="SettingsTab" component={SettingsScreen} options={{ title: 'Настройки' }} />
    </Tab.Navigator>
  );
}

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    (async () => {
      try { await initDb(); await seedDemoIfEmpty(); setReady(true); } catch (e: any) { setErr(String(e?.message ?? e)); }
    })();
  }, []);
  if (err) return <View style={{ flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center', padding: 16 }}><Text style={{ color: '#EF4444' }}>{err}</Text></View>;
  if (!ready) return <View style={{ flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color="#22C55E" /><Text style={{ color: '#9AA0A6', marginTop: 8 }}>Загрузка…</Text></View>;
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#000' }, headerTintColor: '#fff', contentStyle: { backgroundColor: '#000' } }}>
        <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
        <Stack.Screen name="QuestionRunner" component={QuestionRunner} options={{ title: 'Вопрос' }} />
        <Stack.Screen name="Tickets" component={TicketsScreen} options={{ title: 'Билеты' }} />
        <Stack.Screen name="SmartTraining" component={SmartTrainingScreen} options={{ title: 'Умная тренировка' }} />
        <Stack.Screen name="Mistakes" component={MistakesScreen} options={{ title: 'Ошибки' }} />
        <Stack.Screen name="Theory" component={TheoryScreen} options={{ title: 'Теория' }} />
        <Stack.Screen name="Statistics" component={StatisticsScreen} options={{ title: 'Статистика' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
