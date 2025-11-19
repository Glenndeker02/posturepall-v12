import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAppStore } from '../store'

const queryClient = new QueryClient()

export default function RootLayout() {
  const loadFromStorage = useAppStore(state => state.loadFromStorage)

  useEffect(() => {
    // Load persisted data on app start
    loadFromStorage()
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#F9FAFB' },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="pairing" />
        <Stack.Screen name="analytics" />
        <Stack.Screen name="exercises" />
        <Stack.Screen name="exercises/[id]" />
        <Stack.Screen name="settings" />
      </Stack>
      <StatusBar style="auto" />
    </QueryClientProvider>
  )
}
