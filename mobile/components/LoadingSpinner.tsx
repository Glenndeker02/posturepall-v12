import { View, ActivityIndicator, Text, StyleSheet } from 'react-native'

interface LoadingSpinnerProps {
  size?: 'small' | 'large'
  color?: string
  text?: string
  fullScreen?: boolean
}

export default function LoadingSpinner({
  size = 'large',
  color = '#4F46E5',
  text,
  fullScreen = false,
}: LoadingSpinnerProps) {
  const content = (
    <View style={styles.content}>
      <ActivityIndicator size={size} color={color} />
      {text && <Text style={styles.text}>{text}</Text>}
    </View>
  )

  if (fullScreen) {
    return <View style={styles.fullScreen}>{content}</View>
  }

  return content
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
})
