import { View, Text, StyleSheet, ViewStyle } from 'react-native'
import Card from './Card'

interface StatCardProps {
  label: string
  value: string | number
  icon?: string
  color?: string
  style?: ViewStyle
}

export default function StatCard({
  label,
  value,
  icon,
  color = '#DBEAFE',
  style,
}: StatCardProps) {
  return (
    <Card style={[styles.statCard, { backgroundColor: color }, style]} padding={16}>
      <View style={styles.content}>
        {icon && <Text style={styles.icon}>{icon}</Text>}
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  statCard: {
    alignItems: 'center',
    minWidth: 100,
  },
  content: {
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
    marginBottom: 4,
  },
  value: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
})
