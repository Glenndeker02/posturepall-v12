import { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { Card, Button, Modal, Badge } from '../components'
import { useAppStore } from '../store'

// Mock workout data
const mockWorkoutExercises = [
  {
    id: '1',
    name: 'Neck Rolls',
    duration: 5,
    instructions: ['Sit upright', 'Roll head slowly', 'Repeat 10 times'],
  },
  {
    id: '2',
    name: 'Shoulder Shrugs',
    duration: 3,
    instructions: ['Stand tall', 'Lift shoulders', 'Hold and release'],
  },
  {
    id: '3',
    name: 'Cat-Cow Stretch',
    duration: 5,
    instructions: ['On hands and knees', 'Arch and round back', 'Repeat'],
  },
]

export default function WorkoutScreen() {
  const router = useRouter()
  const { currentWorkout, completeWorkout } = useAppStore()

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(mockWorkoutExercises[0].duration * 60)
  const [isPaused, setIsPaused] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [pointsEarned, setPointsEarned] = useState(0)

  const currentExercise = mockWorkoutExercises[currentExerciseIndex]
  const totalExercises = mockWorkoutExercises.length
  const progress = ((currentExerciseIndex + 1) / totalExercises) * 100

  useEffect(() => {
    if (isPaused || isCompleted) return

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Exercise completed, move to next
          if (currentExerciseIndex < totalExercises - 1) {
            const nextIndex = currentExerciseIndex + 1
            setCurrentExerciseIndex(nextIndex)
            setPointsEarned((prev) => prev + 10)
            return mockWorkoutExercises[nextIndex].duration * 60
          } else {
            // All exercises completed
            handleWorkoutComplete()
            return 0
          }
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isPaused, isCompleted, currentExerciseIndex])

  const handleWorkoutComplete = () => {
    setIsCompleted(true)
    setPointsEarned((prev) => prev + 20) // Bonus points for completion
    if (currentWorkout) {
      completeWorkout(currentWorkout.id)
    }
  }

  const handlePauseResume = () => {
    setIsPaused(!isPaused)
  }

  const handleSkip = () => {
    if (currentExerciseIndex < totalExercises - 1) {
      const nextIndex = currentExerciseIndex + 1
      setCurrentExerciseIndex(nextIndex)
      setTimeRemaining(mockWorkoutExercises[nextIndex].duration * 60)
    } else {
      handleWorkoutComplete()
    }
  }

  const handleQuit = () => {
    router.back()
  }

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Just completed a ${totalExercises}-exercise workout on SpineMate! 💪\n\nExercises completed: ${totalExercises}\nPoints earned: ${pointsEarned}\n\nJoin me in building healthy posture habits!`,
        title: 'SpineMate Workout',
      })
    } catch (error) {
      console.error('Failed to share:', error)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (isCompleted) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#4F46E5', '#7C3AED']} style={styles.completedHeader}>
          <Text style={styles.completedIcon}>🎉</Text>
          <Text style={styles.completedTitle}>Workout Complete!</Text>
          <Text style={styles.completedSubtitle}>Great job on your posture health</Text>
        </LinearGradient>

        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          {/* Summary */}
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Workout Summary</Text>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Exercises Completed</Text>
              <Text style={styles.summaryValue}>{totalExercises}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Duration</Text>
              <Text style={styles.summaryValue}>
                {mockWorkoutExercises.reduce((sum, ex) => sum + ex.duration, 0)} min
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Points Earned</Text>
              <Text style={styles.summaryValue}>+{pointsEarned} 🏆</Text>
            </View>
          </Card>

          {/* Exercises List */}
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Exercises Completed</Text>
            {mockWorkoutExercises.map((exercise, index) => (
              <View key={exercise.id} style={styles.completedExerciseRow}>
                <View style={styles.completedCheckmark}>
                  <Text style={styles.completedCheckmarkText}>✓</Text>
                </View>
                <View style={styles.completedExerciseInfo}>
                  <Text style={styles.completedExerciseName}>{exercise.name}</Text>
                  <Text style={styles.completedExerciseDuration}>
                    {exercise.duration} min
                  </Text>
                </View>
              </View>
            ))}
          </Card>

          {/* Actions */}
          <View style={styles.completedActions}>
            <Button
              title="Share Results"
              variant="outline"
              size="lg"
              onPress={handleShare}
              style={styles.actionButton}
            />
            <Button
              title="Done"
              variant="primary"
              size="lg"
              onPress={() => router.replace('/')}
              style={styles.actionButton}
            />
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#4F46E5', '#7C3AED']} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={handleQuit} style={styles.quitButton}>
            <Text style={styles.quitButtonText}>✕ Quit</Text>
          </TouchableOpacity>
          <View style={styles.pointsContainer}>
            <Text style={styles.pointsText}>🏆 {pointsEarned}</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            Exercise {currentExerciseIndex + 1} of {totalExercises}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Current Exercise */}
        <Card style={styles.card}>
          <View style={styles.exerciseHeader}>
            <Text style={styles.exerciseName}>{currentExercise.name}</Text>
            <Badge text={`${currentExercise.duration} min`} variant="info" />
          </View>

          {/* Timer */}
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
            <Text style={styles.timerLabel}>
              {isPaused ? 'Paused' : 'Remaining'}
            </Text>
          </View>

          {/* Instructions */}
          <View style={styles.instructionsList}>
            {currentExercise.instructions.map((instruction, index) => (
              <View key={index} style={styles.instructionRow}>
                <View style={styles.instructionNumber}>
                  <Text style={styles.instructionNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.instructionText}>{instruction}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Controls */}
        <View style={styles.controls}>
          <Button
            title={isPaused ? '▶ Resume' : '⏸ Pause'}
            variant="primary"
            size="lg"
            onPress={handlePauseResume}
            style={styles.controlButton}
          />
          <Button
            title="Skip →"
            variant="outline"
            size="lg"
            onPress={handleSkip}
            style={styles.controlButton}
          />
        </View>

        {/* Exercise Queue */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Coming Up</Text>
          {mockWorkoutExercises
            .slice(currentExerciseIndex + 1)
            .map((exercise, index) => (
              <View key={exercise.id} style={styles.queueRow}>
                <Text style={styles.queueNumber}>{index + 2}</Text>
                <View style={styles.queueInfo}>
                  <Text style={styles.queueName}>{exercise.name}</Text>
                  <Text style={styles.queueDuration}>{exercise.duration} min</Text>
                </View>
              </View>
            ))}
          {mockWorkoutExercises.length === currentExerciseIndex + 1 && (
            <Text style={styles.lastExerciseText}>This is the last exercise!</Text>
          )}
        </Card>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  quitButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  quitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  pointsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  pointsText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  progressContainer: {
    gap: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  exerciseName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
  },
  timerContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginBottom: 24,
  },
  timerText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#4F46E5',
    marginBottom: 8,
  },
  timerLabel: {
    fontSize: 18,
    color: '#6B7280',
  },
  instructionsList: {
    gap: 16,
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  instructionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  instructionNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  instructionText: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    paddingTop: 2,
  },
  controls: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  controlButton: {
    flex: 1,
  },
  queueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  queueNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 32,
    marginRight: 12,
  },
  queueInfo: {
    flex: 1,
  },
  queueName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  queueDuration: {
    fontSize: 14,
    color: '#6B7280',
  },
  lastExerciseText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    paddingVertical: 16,
    fontStyle: 'italic',
  },
  completedHeader: {
    padding: 24,
    paddingTop: 80,
    paddingBottom: 40,
    alignItems: 'center',
  },
  completedIcon: {
    fontSize: 80,
    marginBottom: 16,
  },
  completedTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  completedSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  summaryLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  completedExerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  completedCheckmark: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  completedCheckmarkText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  completedExerciseInfo: {
    flex: 1,
  },
  completedExerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  completedExerciseDuration: {
    fontSize: 14,
    color: '#6B7280',
  },
  completedActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
})
