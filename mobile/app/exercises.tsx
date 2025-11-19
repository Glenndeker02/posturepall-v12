import { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import {
  ExerciseCard,
  LoadingSpinner,
  EmptyState,
  Modal,
} from '../components'
import { useAppStore } from '../store'
import { Exercise } from '../types'
import apiService from '../services/api'

type Category = 'all' | 'neck' | 'shoulder' | 'back' | 'eye' | 'fullBody' | 'breathing'
type Difficulty = 'all' | 'beginner' | 'intermediate' | 'advanced'
type SortBy = 'popular' | 'duration' | 'recent'

// Fallback exercises data - used when API is unavailable or returns empty
const mockExercises: Exercise[] = [
  {
    id: '1',
    name: 'Neck Rolls',
    description: 'Gentle neck rotation to relieve tension',
    category: 'neck',
    duration: 5,
    difficulty: 'beginner',
    instructions: ['Sit upright', 'Slowly roll your head in circles', 'Repeat 10 times'],
    benefits: ['Reduces neck tension', 'Improves flexibility'],
    videoUrl: '',
    thumbnailUrl: '',
    rating: 4.5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Shoulder Shrugs',
    description: 'Release shoulder tension with controlled movements',
    category: 'shoulder',
    duration: 3,
    difficulty: 'beginner',
    instructions: ['Stand tall', 'Lift shoulders to ears', 'Hold for 5 seconds', 'Release'],
    benefits: ['Relieves shoulder tension', 'Improves posture'],
    videoUrl: '',
    thumbnailUrl: '',
    rating: 4.2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Cat-Cow Stretch',
    description: 'Dynamic spine mobility exercise',
    category: 'back',
    duration: 5,
    difficulty: 'intermediate',
    instructions: ['Start on hands and knees', 'Arch back (cow)', 'Round back (cat)', 'Repeat 10 times'],
    benefits: ['Improves spine flexibility', 'Relieves back pain'],
    videoUrl: '',
    thumbnailUrl: '',
    rating: 4.8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: '20-20-20 Eye Rule',
    description: 'Reduce eye strain from screen time',
    category: 'eye',
    duration: 1,
    difficulty: 'beginner',
    instructions: ['Every 20 minutes', 'Look at something 20 feet away', 'For 20 seconds'],
    benefits: ['Reduces eye strain', 'Prevents dry eyes'],
    videoUrl: '',
    thumbnailUrl: '',
    rating: 4.6,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'Standing Forward Bend',
    description: 'Full body stretch for back and hamstrings',
    category: 'fullBody',
    duration: 3,
    difficulty: 'intermediate',
    instructions: ['Stand with feet hip-width', 'Bend forward from hips', 'Let arms hang', 'Hold for 30 seconds'],
    benefits: ['Stretches back and legs', 'Calms the mind'],
    videoUrl: '',
    thumbnailUrl: '',
    rating: 4.4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '6',
    name: 'Box Breathing',
    description: 'Calming breathing technique',
    category: 'breathing',
    duration: 5,
    difficulty: 'beginner',
    instructions: ['Breathe in for 4 counts', 'Hold for 4 counts', 'Breathe out for 4 counts', 'Hold for 4 counts', 'Repeat'],
    benefits: ['Reduces stress', 'Improves focus'],
    videoUrl: '',
    thumbnailUrl: '',
    rating: 4.7,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export default function ExercisesScreen() {
  const router = useRouter()
  const { favoriteExercises, toggleFavoriteExercise } = useAppStore()
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState<Category>('all')
  const [difficulty, setDifficulty] = useState<Difficulty>('all')
  const [sortBy, setSortBy] = useState<SortBy>('popular')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilterModal, setShowFilterModal] = useState(false)

  // Fetch exercises from API on mount
  useEffect(() => {
    fetchExercises()
  }, [])

  useEffect(() => {
    filterAndSortExercises()
  }, [category, difficulty, sortBy, searchQuery, exercises])

  const fetchExercises = async () => {
    try {
      setLoading(true)
      const response = await apiService.getExercises()

      if (response.success && response.exercises) {
        // Map backend exercise format to frontend format if needed
        const mappedExercises: Exercise[] = response.exercises.map((ex: any) => ({
          id: ex.id,
          name: ex.name,
          description: ex.description || '',
          category: ex.category || 'back',
          duration: ex.duration || 5,
          difficulty: ex.difficulty || 'beginner',
          instructions: ex.instructions ? JSON.parse(ex.instructions) : [],
          benefits: [],
          videoUrl: ex.gifUrl || ex.imageUrl || '',
          thumbnailUrl: ex.imageUrl || '',
          rating: 4.5,
          createdAt: ex.createdAt || new Date().toISOString(),
          updatedAt: ex.updatedAt || new Date().toISOString(),
        }))

        setExercises(mappedExercises.length > 0 ? mappedExercises : mockExercises)
      } else {
        // Fallback to mock data if API fails
        setExercises(mockExercises)
      }
    } catch (error) {
      console.error('Failed to fetch exercises:', error)
      // Fallback to mock data on error
      setExercises(mockExercises)
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortExercises = () => {
    let result = [...exercises]

    // Filter by category
    if (category !== 'all') {
      result = result.filter(ex => ex.category === category)
    }

    // Filter by difficulty
    if (difficulty !== 'all') {
      result = result.filter(ex => ex.difficulty === difficulty)
    }

    // Filter by search query
    if (searchQuery) {
      result = result.filter(ex =>
        ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Sort
    switch (sortBy) {
      case 'popular':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      case 'duration':
        result.sort((a, b) => a.duration - b.duration)
        break
      case 'recent':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
    }

    setFilteredExercises(result)
  }

  const getCategoryLabel = (cat: Category) => {
    const labels: Record<Category, string> = {
      all: 'All',
      neck: 'Neck',
      shoulder: 'Shoulder',
      back: 'Back',
      eye: 'Eye',
      fullBody: 'Full Body',
      breathing: 'Breathing',
    }
    return labels[cat]
  }

  const getCategoryIcon = (cat: Category) => {
    const icons: Record<Category, string> = {
      all: '📋',
      neck: '🦴',
      shoulder: '💪',
      back: '🧘',
      eye: '👁️',
      fullBody: '🏃',
      breathing: '🫁',
    }
    return icons[cat]
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#4F46E5', '#7C3AED']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Exercises</Text>
        <Text style={styles.subtitle}>Build healthy habits</Text>
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search exercises..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Text style={styles.filterIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Category Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryScrollContent}
      >
        {(['all', 'neck', 'shoulder', 'back', 'eye', 'fullBody', 'breathing'] as Category[]).map(
          (cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryTab,
                category === cat && styles.categoryTabActive,
              ]}
              onPress={() => setCategory(cat)}
            >
              <Text style={styles.categoryIcon}>{getCategoryIcon(cat)}</Text>
              <Text
                style={[
                  styles.categoryText,
                  category === cat && styles.categoryTextActive,
                ]}
              >
                {getCategoryLabel(cat)}
              </Text>
            </TouchableOpacity>
          )
        )}
      </ScrollView>

      {/* Exercises List */}
      {loading ? (
        <LoadingSpinner text="Loading exercises..." />
      ) : filteredExercises.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No exercises found"
          description="Try adjusting your filters"
          actionText="Clear Filters"
          onAction={() => {
            setCategory('all')
            setDifficulty('all')
            setSearchQuery('')
          }}
        />
      ) : (
        <FlatList
          data={filteredExercises}
          renderItem={({ item }) => (
            <View style={styles.exerciseCardContainer}>
              <ExerciseCard
                id={item.id}
                name={item.name}
                duration={item.duration}
                difficulty={item.difficulty}
                category={getCategoryLabel(item.category as Category)}
                thumbnail={item.thumbnailUrl}
                rating={item.rating}
                isFavorite={favoriteExercises.includes(item.id)}
                onFavoriteToggle={toggleFavoriteExercise}
              />
            </View>
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.exercisesList}
        />
      )}

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        title="Filters & Sort"
      >
        <View style={styles.modalContent}>
          {/* Difficulty Filter */}
          <Text style={styles.modalSectionTitle}>Difficulty</Text>
          <View style={styles.filterOptions}>
            {(['all', 'beginner', 'intermediate', 'advanced'] as Difficulty[]).map((diff) => (
              <TouchableOpacity
                key={diff}
                style={[
                  styles.filterOption,
                  difficulty === diff && styles.filterOptionActive,
                ]}
                onPress={() => setDifficulty(diff)}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    difficulty === diff && styles.filterOptionTextActive,
                  ]}
                >
                  {diff.charAt(0).toUpperCase() + diff.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Sort By */}
          <Text style={styles.modalSectionTitle}>Sort By</Text>
          <View style={styles.filterOptions}>
            {(['popular', 'duration', 'recent'] as SortBy[]).map((sort) => (
              <TouchableOpacity
                key={sort}
                style={[
                  styles.filterOption,
                  sortBy === sort && styles.filterOptionActive,
                ]}
                onPress={() => setSortBy(sort)}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    sortBy === sort && styles.filterOptionTextActive,
                  ]}
                >
                  {sort.charAt(0).toUpperCase() + sort.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
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
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  clearIcon: {
    fontSize: 20,
    color: '#9CA3AF',
    marginLeft: 8,
  },
  filterButton: {
    backgroundColor: 'white',
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterIcon: {
    fontSize: 24,
  },
  categoryScroll: {
    maxHeight: 60,
  },
  categoryScrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryTabActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  categoryTextActive: {
    color: 'white',
  },
  exercisesList: {
    padding: 16,
    paddingTop: 8,
  },
  exerciseCardContainer: {
    marginBottom: 8,
  },
  modalContent: {
    gap: 20,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  filterOptionActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5',
  },
  filterOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterOptionTextActive: {
    color: '#4F46E5',
  },
})
