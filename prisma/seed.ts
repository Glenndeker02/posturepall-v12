import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const exercises = [
  {
    name: 'Neck Rolls',
    category: 'neck',
    description: 'Gentle neck rotation to relieve tension and improve mobility',
    instructions: JSON.stringify([
      'Sit upright with shoulders relaxed',
      'Slowly roll your head in a circular motion',
      'Complete 5 circles clockwise',
      'Complete 5 circles counterclockwise',
      'Keep movements slow and controlled'
    ]),
    duration: 5,
    difficulty: 'gentle',
  },
  {
    name: 'Shoulder Shrugs',
    category: 'shoulder',
    description: 'Release shoulder tension with controlled movements',
    instructions: JSON.stringify([
      'Stand or sit tall with arms at sides',
      'Lift shoulders up toward ears',
      'Hold for 5 seconds',
      'Slowly release and relax',
      'Repeat 10 times'
    ]),
    duration: 3,
    difficulty: 'gentle',
  },
  {
    name: 'Cat-Cow Stretch',
    category: 'back',
    description: 'Dynamic spine mobility exercise for flexibility',
    instructions: JSON.stringify([
      'Start on hands and knees',
      'Arch back and look up (Cow pose)',
      'Hold for 3 seconds',
      'Round back and tuck chin (Cat pose)',
      'Hold for 3 seconds',
      'Repeat 10 times'
    ]),
    duration: 5,
    difficulty: 'moderate',
  },
  {
    name: '20-20-20 Eye Rule',
    category: 'eye',
    description: 'Reduce eye strain from extended screen time',
    instructions: JSON.stringify([
      'Every 20 minutes of screen time',
      'Look at an object 20 feet away',
      'Focus on it for 20 seconds',
      'Blink several times',
      'Return to your work'
    ]),
    duration: 1,
    difficulty: 'gentle',
  },
  {
    name: 'Standing Forward Bend',
    category: 'back',
    description: 'Full body stretch for back and hamstrings',
    instructions: JSON.stringify([
      'Stand with feet hip-width apart',
      'Bend forward from hips, not waist',
      'Let arms hang toward floor',
      'Keep knees slightly bent',
      'Hold for 30 seconds',
      'Slowly roll back up'
    ]),
    duration: 3,
    difficulty: 'moderate',
  },
  {
    name: 'Box Breathing',
    category: 'chest',
    description: 'Calming breathing technique to reduce stress',
    instructions: JSON.stringify([
      'Breathe in for 4 counts',
      'Hold breath for 4 counts',
      'Breathe out for 4 counts',
      'Hold empty lungs for 4 counts',
      'Repeat for 5 minutes'
    ]),
    duration: 5,
    difficulty: 'gentle',
  },
  {
    name: 'Chest Opener Stretch',
    category: 'chest',
    description: 'Combat hunched posture with chest expansion',
    instructions: JSON.stringify([
      'Stand in doorway or use wall',
      'Place forearm against frame',
      'Step forward with opposite leg',
      'Feel stretch across chest',
      'Hold for 30 seconds each side'
    ]),
    duration: 3,
    difficulty: 'gentle',
  },
  {
    name: 'Seated Spinal Twist',
    category: 'back',
    description: 'Improve spinal mobility and release tension',
    instructions: JSON.stringify([
      'Sit tall in chair',
      'Place right hand on left knee',
      'Place left hand behind you',
      'Gently twist to the left',
      'Hold for 20 seconds',
      'Repeat on other side'
    ]),
    duration: 4,
    difficulty: 'gentle',
  },
  {
    name: 'Wrist Circles',
    category: 'wrists',
    description: 'Relieve wrist tension from typing and mouse use',
    instructions: JSON.stringify([
      'Extend arms forward',
      'Make fists with both hands',
      'Rotate wrists in circles',
      'Complete 10 circles clockwise',
      'Complete 10 circles counterclockwise'
    ]),
    duration: 2,
    difficulty: 'gentle',
  },
  {
    name: 'Hip Flexor Stretch',
    category: 'lower_body',
    description: 'Counter the effects of prolonged sitting',
    instructions: JSON.stringify([
      'Kneel on right knee, left foot forward',
      'Keep torso upright',
      'Push hips forward gently',
      'Feel stretch in right hip',
      'Hold for 30 seconds',
      'Switch sides and repeat'
    ]),
    duration: 4,
    difficulty: 'moderate',
  },
  {
    name: 'Desk Push-ups',
    category: 'chest',
    description: 'Strengthen chest and improve posture',
    instructions: JSON.stringify([
      'Stand facing desk or table',
      'Place hands shoulder-width apart',
      'Walk feet back at an angle',
      'Lower chest toward desk',
      'Push back up',
      'Complete 10-15 repetitions'
    ]),
    duration: 3,
    difficulty: 'moderate',
  },
  {
    name: 'Chin Tucks',
    category: 'neck',
    description: 'Correct forward head posture',
    instructions: JSON.stringify([
      'Sit or stand with good posture',
      'Look straight ahead',
      'Gently pull chin back',
      'Create a "double chin"',
      'Hold for 5 seconds',
      'Repeat 10 times'
    ]),
    duration: 3,
    difficulty: 'gentle',
  },
]

async function main() {
  console.log('Seeding exercises...')

  // Clear existing exercises first
  await prisma.exercise.deleteMany({})
  console.log('Cleared existing exercises')

  // Create all exercises
  for (const exercise of exercises) {
    await prisma.exercise.create({
      data: exercise
    })
  }

  console.log(`✓ Seeded ${exercises.length} exercises`)
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
