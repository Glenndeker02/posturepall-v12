import { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Share,
  Dimensions,
} from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import {
  Card,
  Badge,
  Button,
  LoadingSpinner,
  EmptyState,
  ExerciseCard,
} from '../../components'
import { useAppStore } from '../../store'
import { Exercise } from '../../types'

const { width } = Dimensions.get('window')

// Mock exercise data - in production, this would come from API
const mockExercise: Exercise = {
  id: '1',
  name: 'Neck Rolls',
  description: 'Gentle neck rotation exercise to relieve tension and improve flexibility. Perfect for desk workers who experience neck stiffness.',
  category: 'neck',
  duration: 5,
  difficulty: 'beginner',
  instructions: [
    'Sit upright in a comfortable position with your back straight',
    'Slowly drop your chin to your chest',
    'Roll your head to the right, bringing your ear toward your shoulder',
    'Continue rolling your head back, looking up at the ceiling',
    'Roll to the left side, bringing your left ear toward your left shoulder',
    'Complete the circle by bringing your chin back to your chest',
    'Repeat 10 times in each direction',
  ],
  benefits: [
    'Reduces neck tension and stiffness',
    'Improves neck flexibility and range of motion',
    'Relieves headaches caused by neck strain',
    'Promotes better posture',
    'Increases blood flow to neck muscles',
  ],
  videoUrl: '',
  thumbnailUrl: '',
  rating: 4.5,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

// Mock related exercises
const relatedExercises: Exercise[] = [
  {
    id: '2',
    name: 'Shoulder Shrugs',
    description: 'Release shoulder tension',
    category: 'shoulder',
    duration: 3,
    difficulty: 'beginner',
    instructions: [],
    benefits: [],
    videoUrl: '',
    thumbnailUrl: '',
    rating: 4.2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Upper Trapezius Stretch',
    description: 'Stretch upper back muscles',
    category: 'neck',
    duration: 4,
    difficulty: 'beginner',
    instructions: [],
    benefits: [],
    videoUrl: '',
    thumbnailUrl: '',
    rating: 4.6,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export default function ExerciseDetailScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams()
  const { favoriteExercises, toggleFavoriteExercise, startWorkout } = useAppStore()
  const [exercise, setExercise] = useState<Exercise | null>(null)
  const [loading, setLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    // In production, fetch exercise by ID from API
    setTimeout(() => {
      setExercise(mockExercise)
      setLoading(false)
    }, 500)
  }, [id])

  const handleStartExercise = () => {
    if (!exercise) return

    // Start workout tracking
    startWorkout({
      id: Date.now().toString(),
      userId: '',
      exerciseId: exercise.id,
      startTime: new Date().toISOString(),
      endTime: null,
      completed: false,
      duration: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    // Navigate to workout screen
    router.push('/workout')
  }

  const handleShare = async () => {
    if (!exercise) return

    try {
      await Share.share({
        message: `Check out this exercise: ${exercise.name}\n\n${exercise.description}\n\nDuration: ${exercise.duration} min | Difficulty: ${exercise.difficulty}`,
        title: exercise.name,
      })
    } catch (error) {
      console.error('Failed to share:', error)
    }
  }

  const getDifficultyVariant = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'success'
      case 'intermediate':
        return 'warning'
      case 'advanced':
        return 'danger'
      default:
        return 'default'
    }
  }

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading exercise..." />
  }

  if (!exercise) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon="❌"
          title="Exercise Not Found"
          description="The exercise you're looking for doesn't exist"
          actionText="Go Back"
          onAction={() => router.back()}
        />
      </View>
    )
  }

  const isFavorite = favoriteExercises.includes(exercise.id)

  return (
    <View style={styles.container}>
      {/* Header with Video/Thumbnail */}
      <View style={styles.mediaContainer}>
        {exercise.videoUrl ? (
          <View style={styles.videoPlaceholder}>
            <Text style={styles.videoIcon}>🎥</Text>
            <Text style={styles.videoText}>Video Player</Text>
            <TouchableOpacity
              style={styles.playButton}
              onPress={() => setIsPlaying(!isPlaying)}
            >
              <Text style={styles.playButtonText}>{isPlaying ? '⏸' : '▶'}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.thumbnailPlaceholder}>
            <Text style={styles.thumbnailIcon}>💪</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity onPress={() => router.back()} style={styles.actionButton}>
            <Text style={styles.actionButtonText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.actionButtonsRight}>
            <TouchableOpacity
              onPress={() => toggleFavoriteExercise(exercise.id)}
              style={styles.actionButton}
            >
              <Text style={styles.actionButtonText}>{isFavorite ? '❤️' : '🤍'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShare} style={styles.actionButton}>
              <Text style={styles.actionButtonText}>📤</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Exercise Info */}
        <View style={styles.infoSection}>
          <Text style={styles.exerciseName}>{exercise.name}</Text>
          <View style={styles.metaRow}>
            <Badge
              text={exercise.difficulty}
              variant={getDifficultyVariant(exercise.difficulty)}
            />
            <Text style={styles.duration}>⏱️ {exercise.duration} min</Text>
            <Text style={styles.rating}>⭐ {exercise.rating?.toFixed(1)}</Text>
          </View>
          <Text style={styles.description}>{exercise.description}</Text>
        </View>

        {/* Benefits */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Benefits</Text>
          <View style={styles.benefitsList}>
            {exercise.benefits.map((benefit, index) => (
              <View key={index} style={styles.benefitRow}>
                <Text style={styles.benefitIcon}>✓</Text>
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Instructions */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Instructions</Text>
          <View style={styles.instructionsList}>
            {exercise.instructions.map((instruction, index) => (
              <View key={index} style={styles.instructionRow}>
                <View style={styles.instructionNumber}>
                  <Text style={styles.instructionNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.instructionText}>{instruction}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Related Exercises */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Related Exercises</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.relatedList}>
              {relatedExercises.map((related) => (
                <View key={related.id} style={styles.relatedCard}>
                  <ExerciseCard
                    id={related.id}
                    name={related.name}
                    duration={related.duration}
                    difficulty={related.difficulty}
                    category={related.category}
                    thumbnail={related.thumbnailUrl}
                    rating={related.rating}
                    isFavorite={favoriteExercises.includes(related.id)}
                    onFavoriteToggle={toggleFavoriteExercise}
                  />
                </View>
              ))}
            </View>
          </ScrollView>
        </Card>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Start Exercise Button */}
      <View style={styles.bottomBar}>
        <LinearGradient
          colors={['transparent', '#F9FAFB']}
          style={styles.bottomGradient}
        />
        <Button
          title="Start Exercise"
          onPress={handleStartExercise}
          size="lg"
          style={styles.startButton}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  mediaContainer: {
    height: 300,
    backgroundColor: '#000',
    position: 'relative',
  },
  videoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1F2937',
  },
  videoIcon: {
    fontSize: 64,
    marginBottom: 12,
  },
  videoText: {
    fontSize: 18,
    color: 'white',
    fontWeight: '600',
  },
  playButton: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(79, 70, 229, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonText: {
    fontSize: 32,
    color: 'white',
  },
  thumbnailPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  thumbnailIcon: {
    fontSize: 80,
  },
  actionButtons: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  actionButtonsRight: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  infoSection: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  exerciseName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  duration: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  rating: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  card: {
    margin: 16,
    marginTop: 0,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  benefitsList: {
    gap: 12,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  benefitIcon: {
    fontSize: 20,
    color: '#10B981',
    marginRight: 12,
    marginTop: 2,
  },
  benefitText: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  instructionsList: {
    gap: 16,
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  instructionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  instructionNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  instructionText: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    paddingTop: 4,
  },
  relatedList: {
    flexDirection: 'row',
    gap: 12,
  },
  relatedCard: {
    width: width - 100,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  bottomGradient: {
    position: 'absolute',
    top: -40,
    left: 0,
    right: 0,
    height: 40,
  },
  startButton: {
    width: '100%',
  },
})
