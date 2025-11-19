import { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { Button } from '../../components'
import { useAppStore } from '../../store'
import { theme } from '../../../shared/theme'

const SITTING_OPTIONS = [
  { id: '0-2', label: '0-2 hours', icon: '😊', severity: 'low' },
  { id: '2-4', label: '2-4 hours', icon: '🙂', severity: 'low' },
  { id: '4-6', label: '4-6 hours', icon: '😐', severity: 'medium' },
  { id: '6-8', label: '6-8 hours', icon: '😟', severity: 'medium' },
  { id: '8+', label: '8+ hours', icon: '😰', severity: 'high' },
]

export default function SittingHoursScreen() {
  const router = useRouter()
  const { user, updateUserProfile } = useAppStore()
  const [selected, setSelected] = useState<string>('')

  const handleContinue = async () => {
    if (selected && user) {
      const hours = selected === '8+' ? 10 : parseInt(selected.split('-')[1])
      await updateUserProfile({
        ...user,
        dailySittingHours: hours,
      })
      router.push('/onboarding/pain-areas')
    }
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.primary[600], theme.colors.secondary[600]]}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.progress}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '50%' }]} />
          </View>
          <Text style={styles.progressText}>Step 2 of 4</Text>
        </View>

        <Text style={styles.title}>Daily Sitting Time</Text>
        <Text style={styles.subtitle}>
          How many hours do you typically sit per day?
        </Text>
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.options}>
          {SITTING_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionButton,
                selected === option.id && styles.optionButtonSelected,
              ]}
              onPress={() => setSelected(option.id)}
            >
              <Text style={styles.optionIcon}>{option.icon}</Text>
              <Text style={[
                styles.optionText,
                selected === option.id && styles.optionTextSelected,
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Button
          title="Continue"
          onPress={handleContinue}
          disabled={!selected}
          style={styles.continueButton}
        />

        <TouchableOpacity onPress={() => router.push('/onboarding/pain-areas')}>
          <Text style={styles.skipText}>Skip this step</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  header: {
    paddingHorizontal: theme.spacing[6],
    paddingTop: theme.spacing[16],
    paddingBottom: theme.spacing[8],
  },
  backButton: {
    marginBottom: theme.spacing[4],
  },
  backButtonText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  progress: {
    marginBottom: theme.spacing[6],
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: theme.borderRadius.full,
    marginBottom: theme.spacing[2],
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.full,
  },
  progressText: {
    fontSize: theme.typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: theme.typography.fontWeight.medium,
  },
  title: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.inverse,
    marginBottom: theme.spacing[3],
  },
  subtitle: {
    fontSize: theme.typography.fontSize.base,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing[6],
  },
  options: {
    gap: theme.spacing[3],
    marginBottom: theme.spacing[8],
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[4],
    borderWidth: 2,
    borderColor: theme.colors.border.medium,
  },
  optionButtonSelected: {
    borderColor: theme.colors.primary[600],
    backgroundColor: theme.colors.primary[50],
  },
  optionIcon: {
    fontSize: 32,
    marginRight: theme.spacing[4],
  },
  optionText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  optionTextSelected: {
    color: theme.colors.primary[700],
  },
  continueButton: {
    marginBottom: theme.spacing[4],
  },
  skipText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    fontWeight: theme.typography.fontWeight.medium,
  },
})
