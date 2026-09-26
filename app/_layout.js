import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#111827',
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Organiza Aí',
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="tarefas"
        options={{
          title: 'Minhas Tarefas',
        }}
      />

      <Stack.Screen
        name="novaTarefa"
        options={{
          title: 'Nova Tarefa',
        }}
      />

      <Stack.Screen
        name="concluidas"
        options={{
          title: 'Tarefas Concluídas',
        }}
      />
    </Stack>
  );
}