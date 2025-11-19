import { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { Button, Card } from '../../components'
import { useAppStore } from '../../store'
import { theme } from '../../../shared/theme'

const WORK_ENVIRONMENTS = [
  { id: 'office', label: 'Office', icon: '🏢', description: 'Traditional desk job' },
  { id: 'remote', label: 'Remote/Home', icon: '🏠', description: 'Work from home' },
  { id: 'hybrid', label: 'Hybrid', icon: '🔄', description: 'Mix of office and remote' },
  { id: 'standing', label: 'Standing Desk', icon: '⬆️', description: 'Standing workstation' },
  { id: 'mobile', label: 'Mobile', icon: '📱', description: 'On-the-go worker' },
  { id: 'other', label: 'Other', icon: '💼', description: 'Different setup' },
]

export default function WorkEnvironmentScreen() {
  const router = useRouter()
  const { user, updateUserProfile } = useAppStore()
  const [selected, setSelected] = useState<string>('')

  const handleContinue = async () => {
    if (selected && user) {
      await updateUserProfile({
        ...user,
        workEnvironment: selected,
      })
      router.push('/onboarding/sitting-hours')
    }
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[theme.colors.primary[600], theme.colors.secondary[600]]}
        style={styles.header}
      >
        <View style={styles.progress}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '25%' }]} />
          </View>
          <Text style={styles.progressText}>Step 1 of 4</Text>
        </View>

        <Text style={styles.title}>Where do you work?</Text>
        <Text style={styles.subtitle}>
          Help us understand your work environment to provide better recommendations
        </Text>
      </LinearGradient>

      {/* Options */}
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.optionsGrid}>
          {WORK_ENVIRONMENTS.map((env) => (
            <TouchableOpacity
              key={env.id}
              style={[
                styles.optionCard,
                selected === env.id && styles.optionCardSelected,
              ]}
              onPress={() => setSelected(env.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.optionIcon}>{env.icon}</Text>
              <Text style={styles.optionLabel}>{env.label}</Text>
              <Text style={styles.optionDescription}>{env.description}</Text>
              {selected === env.id && (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <Button
          title="Continue"
          onPress={handleContinue}
          disabled={!selected}
          style={styles.continueButton}
        />

        <TouchableOpacity onPress={() => router.push('/onboarding/sitting-hours')}>
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
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing[6],
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing[4],
    marginBottom: theme.spacing[8],
  },
  optionCard: {
    width: '47%',
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[5],
    borderWidth: 2,
    borderColor: theme.colors.border.medium,
    position: 'relative',
    ...theme.shadows.sm,
  },
  optionCardSelected: {
    borderColor: theme.colors.primary[600],
    backgroundColor: theme.colors.primary[50],
  },
  optionIcon: {
    fontSize: 40,
    marginBottom: theme.spacing[3],
  },
  optionLabel: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[1],
  },
  optionDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.lineHeight.normal * theme.typography.fontSize.sm,
  },
  checkmark: {
    position: 'absolute',
    top: theme.spacing[2],
    right: theme.spacing[2],
    width: 24,
    height: 24,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
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
