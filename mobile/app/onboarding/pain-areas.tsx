import { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { Button } from '../../components'
import { useAppStore } from '../../store'
import { theme } from '../../../shared/theme'

const PAIN_AREAS = [
  { id: 'neck', label: 'Neck', icon: '🦴' },
  { id: 'shoulders', label: 'Shoulders', icon: '💪' },
  { id: 'upper-back', label: 'Upper Back', icon: '🧘' },
  { id: 'lower-back', label: 'Lower Back', icon: '🏃' },
  { id: 'wrists', label: 'Wrists', icon: '✋' },
  { id: 'eyes', label: 'Eyes', icon: '👁️' },
  { id: 'headaches', label: 'Headaches', icon: '🤕' },
  { id: 'none', label: 'No Pain', icon: '😊' },
]

export default function PainAreasScreen() {
  const router = useRouter()
  const { user, updateUserProfile } = useAppStore()
  const [selected, setSelected] = useState<string[]>([])

  const toggleArea = (id: string) => {
    if (id === 'none') {
      setSelected(['none'])
    } else {
      const filtered = selected.filter(s => s !== 'none')
      if (filtered.includes(id)) {
        setSelected(filtered.filter(s => s !== id))
      } else {
        setSelected([...filtered, id])
      }
    }
  }

  const handleContinue = async () => {
    if (user) {
      await updateUserProfile({
        ...user,
        painAreas: selected.join(','),
      })
      router.push('/onboarding/goals')
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
            <View style={[styles.progressFill, { width: '75%' }]} />
          </View>
          <Text style={styles.progressText}>Step 3 of 4</Text>
        </View>

        <Text style={styles.title}>Any Pain or Discomfort?</Text>
        <Text style={styles.subtitle}>Select all areas that apply (optional)</Text>
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.optionsGrid}>
          {PAIN_AREAS.map((area) => (
            <TouchableOpacity
              key={area.id}
              style={[
                styles.areaCard,
                selected.includes(area.id) && styles.areaCardSelected,
              ]}
              onPress={() => toggleArea(area.id)}
            >
              <Text style={styles.areaIcon}>{area.icon}</Text>
              <Text style={styles.areaLabel}>{area.label}</Text>
              {selected.includes(area.id) && (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <Button title="Continue" onPress={handleContinue} style={styles.continueButton} />
        <TouchableOpacity onPress={() => router.push('/onboarding/goals')}>
          <Text style={styles.skipText}>Skip this step</Text>
        </TouchableOpacity>
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
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing[3], marginBottom: theme.spacing[8] },
  areaCard: { width: '47%', backgroundColor: theme.colors.background.primary, borderRadius: theme.borderRadius.lg, padding: theme.spacing[4], borderWidth: 2, borderColor: theme.colors.border.medium, position: 'relative' },
  areaCardSelected: { borderColor: theme.colors.primary[600], backgroundColor: theme.colors.primary[50] },
  areaIcon: { fontSize: 36, marginBottom: theme.spacing[2] },
  areaLabel: { fontSize: theme.typography.fontSize.base, fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.text.primary },
  checkmark: { position: 'absolute', top: theme.spacing[2], right: theme.spacing[2], width: 20, height: 20, borderRadius: theme.borderRadius.full, backgroundColor: theme.colors.primary[600], justifyContent: 'center', alignItems: 'center' },
  checkmarkText: { color: theme.colors.text.inverse, fontSize: 12, fontWeight: theme.typography.fontWeight.bold },
  continueButton: { marginBottom: theme.spacing[4] },
  skipText: { fontSize: theme.typography.fontSize.base, color: theme.colors.text.secondary, textAlign: 'center', fontWeight: theme.typography.fontWeight.medium },
})
