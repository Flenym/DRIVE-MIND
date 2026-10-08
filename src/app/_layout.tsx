// Author: Flenym
import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
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
import { T } from '@/theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const NavTheme = { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: T.bg, card: T.bg, text: '#fff', border: T.border, primary: T.green } };

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: T.bg }, headerTintColor: '#fff', headerTitleStyle: { fontWeight: '900' },
        tabBarStyle: { position: 'absolute', backgroundColor: 'transparent', borderTopWidth: 0, elevation: 0, height: 92, paddingTop: 8 },
        tabBarBackground: () => <BlurView intensity={26} tint="dark" style={{ flex: 1 }} />,
        tabBarActiveTintColor: T.green, tabBarInactiveTintColor: T.muted, tabBarLabelStyle: { fontWeight: '700', fontSize: 11 },
      }}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: 'Главная', headerTitle: 'DRIVE MIND · Flenym', tabBarIcon: () => <Text>🏠</Text> }} />
      <Tab.Screen name="TicketsTab" component={TicketsScreen} options={{ title: 'Билеты', tabBarIcon: () => <Text>🎯</Text> }} />
      <Tab.Screen name="StatsTab" component={StatisticsScreen} options={{ title: 'Статистика', tabBarIcon: () => <Text>📊</Text> }} />
      <Tab.Screen name="SettingsTab" component={SettingsScreen} options={{ title: 'Настройки', tabBarIcon: () => <Text>⚙️</Text> }} />
    </Tab.Navigator>
  );
}

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => { (async () => { try { await initDb(); await seedDemoIfEmpty(); setReady(true); } catch (e: any) { setErr(String(e?.message ?? e)); } })(); }, []);
  if (err) return <View style={{ flex: 1, backgroundColor: T.bg, alignItems: 'center', justifyContent: 'center', padding: 16 }}><Text style={{ color: T.red }}>{err}</Text></View>;
  if (!ready) return <View style={{ flex: 1, backgroundColor: T.bg, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={T.green} /><Text style={{ color: T.muted, marginTop: 8 }}>Загрузка…</Text></View>;
  return (
    <NavigationContainer theme={NavTheme}>
      <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: T.bg }, headerTintColor: '#fff', headerTitleStyle: { fontWeight: '800' }, contentStyle: { backgroundColor: T.bg }, animation: 'slide_from_right' }}>
        <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
        <Stack.Screen name="QuestionRunner" component={QuestionRunner} options={{ title: 'Вопрос' }} />
        <Stack.Screen name="Tickets" component={TicketsScreen} options={{ title: 'Билеты' }} />
        <Stack.Screen name="SmartTraining" component={SmartTrainingScreen} options={{ title: 'Умная' }} />
        <Stack.Screen name="Mistakes" component={MistakesScreen} options={{ title: 'Ошибки' }} />
        <Stack.Screen name="Theory" component={TheoryScreen} options={{ title: 'Теория' }} />
        <Stack.Screen name="Statistics" component={StatisticsScreen} options={{ title: 'Статистика' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
