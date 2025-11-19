import { useEffect, useState } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAppStore } from '../store'
import { initializeDatabase } from '../services/database'
import { initializeNotifications } from '../services/notifications'
import { ErrorBoundary } from '../components'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
})

export default function RootLayout() {
  const loadFromStorage = useAppStore(state => state.loadFromStorage)
  const [isInitialized, setIsInitialized] = useState(false)
  const [initError, setInitError] = useState<string | null>(null)

  useEffect(() => {
    // Initialize app services
    async function initializeApp() {
      try {
        console.log('Initializing app services...')

        // Initialize database
        await initializeDatabase()
        console.log('Database initialized')

        // Initialize notifications
        await initializeNotifications()
        console.log('Notifications initialized')

        // Load persisted data from AsyncStorage
        await loadFromStorage()
        console.log('Persisted data loaded')

        setIsInitialized(true)
        console.log('App initialization complete')
      } catch (error) {
        console.error('App initialization error:', error)
        setInitError(error instanceof Error ? error.message : 'Failed to initialize app')
        // Continue anyway - app should still work with limited functionality
        setIsInitialized(true)
      }
    }

    initializeApp()
  }, [])

  if (!isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Initializing SpineMate...</Text>
      </View>
    )
  }

  if (initError) {
    console.warn('App started with initialization error:', initError)
  }

  return (
    <ErrorBoundary>
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
          <Stack.Screen name="workout" />
        </Stack>
        <StatusBar style="auto" />
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
})
