import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#4f46e5',
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
          title: 'Login',
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="cadastro"
        options={{
          title: 'Criar conta',
        }}
      />

      <Stack.Screen
        name="home"
        options={{
          title: 'Organiza Aí',
          headerBackVisible: false,
        }}
      />

      <Stack.Screen
        name="novaTarefa"
        options={{
          title: 'Nova tarefa',
        }}
      />

      <Stack.Screen
        name="editarTarefa"
        options={{
          title: 'Editar tarefa',
        }}
      />

    </Stack>
  );
}
