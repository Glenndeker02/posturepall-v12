import { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { Button } from '../../components'
import { useAppStore } from '../../store'
import { authService } from '../../services/auth'
import { theme } from '../../../shared/theme'

const GOALS = [
  { id: 'reduce-pain', label: 'Reduce Pain', icon: '💊', description: 'Alleviate discomfort' },
  { id: 'improve-posture', label: 'Improve Posture', icon: '🧘', description: 'Better alignment' },
  { id: 'prevent-issues', label: 'Prevent Issues', icon: '🛡️', description: 'Stay healthy' },
  { id: 'boost-energy', label: 'Boost Energy', icon: '⚡', description: 'Feel more energized' },
  { id: 'build-habit', label: 'Build Healthy Habits', icon: '📅', description: 'Create routines' },
  { id: 'track-progress', label: 'Track Progress', icon: '📈', description: 'Monitor improvements' },
]

export default function GoalsScreen() {
  const router = useRouter()
  const { user, updateUserProfile } = useAppStore()
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const toggleGoal = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(s => s !== id))
    } else {
      setSelected([...selected, id])
    }
  }

  const handleComplete = async () => {
    if (user) {
      setLoading(true)
      await updateUserProfile({
        ...user,
        userGoals: selected.join(','),
      })
      await authService.completeOnboarding()
      setLoading(false)
      router.replace('/onboarding/complete')
    }
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={[theme.colors.primary[600], theme.colors.secondary[600]]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.progress}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '100%' }]} />
          </View>
          <Text style={styles.progressText}>Step 4 of 4</Text>
        </View>

        <Text style={styles.title}>What Are Your Goals?</Text>
        <Text style={styles.subtitle}>Select all that apply</Text>
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.goalsGrid}>
          {GOALS.map((goal) => (
            <TouchableOpacity
              key={goal.id}
              style={[styles.goalCard, selected.includes(goal.id) && styles.goalCardSelected]}
              onPress={() => toggleGoal(goal.id)}
            >
              <Text style={styles.goalIcon}>{goal.icon}</Text>
              <Text style={styles.goalLabel}>{goal.label}</Text>
              <Text style={styles.goalDescription}>{goal.description}</Text>
              {selected.includes(goal.id) && (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <Button
          title={loading ? "Completing..." : "Complete Setup"}
          onPress={handleComplete}
          disabled={selected.length === 0}
          loading={loading}
          style={styles.completeButton}
        />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background.secondary },
  header: { paddingHorizontal: theme.spacing[6], paddingTop: theme.spacing[16], paddingBottom: theme.spacing[8] },
  backButton: { marginBottom: theme.spacing[4] },
  backButtonText: { color: theme.colors.text.inverse, fontSize: theme.typography.fontSize.base, fontWeight: theme.typography.fontWeight.semibold },
  progress: { marginBottom: theme.spacing[6] },
  progressBar: { height: 4, backgroundColor: 'rgba(255, 255, 255, 0.3)', borderRadius: theme.borderRadius.full, marginBottom: theme.spacing[2] },
  progressFill: { height: '100%', backgroundColor: theme.colors.background.primary, borderRadius: theme.borderRadius.full },
  progressText: { fontSize: theme.typography.fontSize.sm, color: 'rgba(255, 255, 255, 0.9)', fontWeight: theme.typography.fontWeight.medium },
  title: { fontSize: theme.typography.fontSize['3xl'], fontWeight: theme.typography.fontWeight.bold, color: theme.colors.text.inverse, marginBottom: theme.spacing[3] },
  subtitle: { fontSize: theme.typography.fontSize.base, color: 'rgba(255, 255, 255, 0.9)' },
  content: { flex: 1 },
  scrollContent: { padding: theme.spacing[6] },
  goalsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing[3], marginBottom: theme.spacing[8] },
  goalCard: { width: '47%', backgroundColor: theme.colors.background.primary, borderRadius: theme.borderRadius.lg, padding: theme.spacing[4], borderWidth: 2, borderColor: theme.colors.border.medium, position: 'relative' },
  goalCardSelected: { borderColor: theme.colors.primary[600], backgroundColor: theme.colors.primary[50] },
  goalIcon: { fontSize: 36, marginBottom: theme.spacing[2] },
  goalLabel: { fontSize: theme.typography.fontSize.base, fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.text.primary, marginBottom: theme.spacing[1] },
  goalDescription: { fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary },
  checkmark: { position: 'absolute', top: theme.spacing[2], right: theme.spacing[2], width: 20, height: 20, borderRadius: theme.borderRadius.full, backgroundColor: theme.colors.primary[600], justifyContent: 'center', alignItems: 'center' },
  checkmarkText: { color: theme.colors.text.inverse, fontSize: 12, fontWeight: theme.typography.fontWeight.bold },
  completeButton: { marginBottom: theme.spacing[4] },
})
