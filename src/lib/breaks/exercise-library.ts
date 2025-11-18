/**
 * Exercise Library
 * Complete exercise database per PRD specifications
 */

export type ExerciseCategory = 'neck' | 'shoulder' | 'back' | 'chest' | 'lower_body' | 'eye';
export type ExerciseDifficulty = 'gentle' | 'moderate' | 'deep';

export interface ExerciseStep {
  stepNumber: number;
  instruction: string;
}

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  targetArea: string;
  description: string;
  steps: ExerciseStep[];
  duration: number; // in seconds
  repetitions?: number;
  difficulty: ExerciseDifficulty;
  commonMistakes: string[];
  benefits: string[];
  imageUrl?: string;
  gifUrl?: string;
}

/**
 * Complete exercise library per PRD
 */
export const EXERCISE_LIBRARY: Exercise[] = [
  // NECK EXERCISES
  {
    id: 'neck-rolls',
    name: 'Neck Rolls',
    category: 'neck',
    targetArea: 'Releases tension in neck and upper shoulders',
    description: 'Gentle circular motion to relieve neck stiffness',
    steps: [
      { stepNumber: 1, instruction: 'Sit or stand up straight with shoulders relaxed' },
      { stepNumber: 2, instruction: 'Slowly drop your chin toward your chest' },
      { stepNumber: 3, instruction: 'Roll your head gently to the right, bringing ear toward shoulder' },
      { stepNumber: 4, instruction: 'Continue rolling head back, then to the left' },
      { stepNumber: 5, instruction: 'Complete 3-5 slow, controlled circles in each direction' },
    ],
    duration: 30,
    repetitions: 5,
    difficulty: 'gentle',
    commonMistakes: ['Moving too quickly', 'Forcing the movement', 'Tensing shoulders'],
    benefits: ['Relieves neck tension', 'Improves neck mobility', 'Reduces headaches'],
  },
  {
    id: 'chin-tucks',
    name: 'Chin Tucks',
    category: 'neck',
    targetArea: 'Strengthens deep neck flexors, corrects forward head posture',
    description: 'Gentle retraction exercise for forward head posture',
    steps: [
      { stepNumber: 1, instruction: 'Sit up straight with shoulders back' },
      { stepNumber: 2, instruction: 'Keep your eyes level, looking straight ahead' },
      { stepNumber: 3, instruction: 'Gently pull your chin straight back, creating a "double chin"' },
      { stepNumber: 4, instruction: 'Hold for 5 seconds' },
      { stepNumber: 5, instruction: 'Return to starting position and repeat' },
    ],
    duration: 40,
    repetitions: 10,
    difficulty: 'moderate',
    commonMistakes: ['Tilting head up or down', 'Pushing too hard', 'Holding breath'],
    benefits: ['Corrects forward head posture', 'Strengthens neck muscles', 'Reduces neck pain'],
  },
  {
    id: 'side-neck-stretch',
    name: 'Side Neck Stretch',
    category: 'neck',
    targetArea: 'Stretches lateral neck muscles and upper trapezius',
    description: 'Gentle lateral stretch for neck tension relief',
    steps: [
      { stepNumber: 1, instruction: 'Sit up straight with both feet flat on floor' },
      { stepNumber: 2, instruction: 'Gently tilt your head to the right, bringing ear toward shoulder' },
      { stepNumber: 3, instruction: 'Place right hand on left side of head for gentle assistance' },
      { stepNumber: 4, instruction: 'Hold for 15-20 seconds, feeling the stretch along left side of neck' },
      { stepNumber: 5, instruction: 'Return to center and repeat on opposite side' },
    ],
    duration: 45,
    difficulty: 'gentle',
    commonMistakes: ['Raising shoulder toward ear', 'Rotating head instead of tilting', 'Pulling too hard'],
    benefits: ['Releases neck tension', 'Improves lateral flexibility', 'Reduces shoulder tightness'],
  },
  {
    id: 'neck-rotation',
    name: 'Neck Rotation',
    category: 'neck',
    targetArea: 'Improves rotational mobility of cervical spine',
    description: 'Gentle rotation to improve neck range of motion',
    steps: [
      { stepNumber: 1, instruction: 'Sit tall with chin level and shoulders relaxed' },
      { stepNumber: 2, instruction: 'Slowly turn your head to look over your right shoulder' },
      { stepNumber: 3, instruction: 'Hold for 10 seconds' },
      { stepNumber: 4, instruction: 'Return to center' },
      { stepNumber: 5, instruction: 'Repeat on the left side' },
    ],
    duration: 35,
    repetitions: 5,
    difficulty: 'gentle',
    commonMistakes: ['Lifting chin', 'Shrugging shoulders', 'Moving too quickly'],
    benefits: ['Increases neck rotation', 'Reduces stiffness', 'Improves mobility'],
  },
  {
    id: 'upper-trap-stretch',
    name: 'Upper Trapezius Stretch',
    category: 'neck',
    targetArea: 'Releases upper trapezius and levator scapulae',
    description: 'Deep stretch for chronic neck and shoulder tension',
    steps: [
      { stepNumber: 1, instruction: 'Sit upright with good posture' },
      { stepNumber: 2, instruction: 'Tilt head to the right and rotate slightly downward' },
      { stepNumber: 3, instruction: 'Place right hand on back of head for gentle pressure' },
      { stepNumber: 4, instruction: 'Hold stretch for 20-30 seconds' },
      { stepNumber: 5, instruction: 'Switch sides and repeat' },
    ],
    duration: 50,
    difficulty: 'deep',
    commonMistakes: ['Excessive pressure', 'Holding breath', 'Hunching shoulders'],
    benefits: ['Deep muscle release', 'Reduces chronic tension', 'Improves posture'],
  },

  // SHOULDER EXERCISES
  {
    id: 'shoulder-rolls',
    name: 'Shoulder Rolls',
    category: 'shoulder',
    targetArea: 'Releases tension in shoulders and upper back',
    description: 'Simple rolling motion to loosen shoulder joints',
    steps: [
      { stepNumber: 1, instruction: 'Sit or stand with arms relaxed at sides' },
      { stepNumber: 2, instruction: 'Roll shoulders forward in a circular motion' },
      { stepNumber: 3, instruction: 'Complete 5 forward rolls' },
      { stepNumber: 4, instruction: 'Reverse direction and roll shoulders backward 5 times' },
      { stepNumber: 5, instruction: 'Focus on full range of motion' },
    ],
    duration: 30,
    repetitions: 10,
    difficulty: 'gentle',
    commonMistakes: ['Rushing the movement', 'Small incomplete circles', 'Tensing neck'],
    benefits: ['Loosens shoulder joints', 'Improves circulation', 'Reduces tension'],
  },
  {
    id: 'shoulder-blade-squeeze',
    name: 'Shoulder Blade Squeeze',
    category: 'shoulder',
    targetArea: 'Strengthens rhomboids and middle trapezius',
    description: 'Retraction exercise to counteract rounded shoulders',
    steps: [
      { stepNumber: 1, instruction: 'Sit up tall with arms at sides' },
      { stepNumber: 2, instruction: 'Squeeze shoulder blades together, pulling them back and down' },
      { stepNumber: 3, instruction: 'Imagine squeezing a pencil between your shoulder blades' },
      { stepNumber: 4, instruction: 'Hold for 5 seconds' },
      { stepNumber: 5, instruction: 'Release and repeat 10 times' },
    ],
    duration: 40,
    repetitions: 10,
    difficulty: 'moderate',
    commonMistakes: ['Shrugging shoulders up', 'Arching lower back', 'Shallow squeezes'],
    benefits: ['Corrects rounded shoulders', 'Strengthens upper back', 'Improves posture'],
  },
  {
    id: 'cross-body-shoulder',
    name: 'Cross-Body Shoulder Stretch',
    category: 'shoulder',
    targetArea: 'Stretches posterior deltoid and rotator cuff',
    description: 'Gentle stretch for shoulder and upper back',
    steps: [
      { stepNumber: 1, instruction: 'Stand or sit upright' },
      { stepNumber: 2, instruction: 'Bring right arm across your chest' },
      { stepNumber: 3, instruction: 'Use left hand to gently pull right elbow closer to chest' },
      { stepNumber: 4, instruction: 'Hold for 15-20 seconds' },
      { stepNumber: 5, instruction: 'Switch arms and repeat' },
    ],
    duration: 40,
    difficulty: 'gentle',
    commonMistakes: ['Rotating torso', 'Hunching forward', 'Pulling too hard'],
    benefits: ['Increases shoulder flexibility', 'Relieves upper back tension', 'Improves range of motion'],
  },
  {
    id: 'overhead-shoulder',
    name: 'Overhead Shoulder Stretch',
    category: 'shoulder',
    targetArea: 'Stretches shoulders and chest',
    description: 'Opening stretch for shoulders and chest',
    steps: [
      { stepNumber: 1, instruction: 'Clasp hands together and raise arms overhead' },
      { stepNumber: 2, instruction: 'Push palms toward ceiling' },
      { stepNumber: 3, instruction: 'Lengthen through your spine' },
      { stepNumber: 4, instruction: 'Hold for 10-15 seconds' },
      { stepNumber: 5, instruction: 'Release slowly' },
    ],
    duration: 20,
    difficulty: 'moderate',
    commonMistakes: ['Arching lower back excessively', 'Holding breath', 'Locking elbows'],
    benefits: ['Opens chest', 'Stretches shoulders', 'Lengthens spine'],
  },
  {
    id: 'eagle-arms',
    name: 'Eagle Arms Stretch',
    category: 'shoulder',
    targetArea: 'Deep stretch for shoulders and upper back',
    description: 'Yoga-inspired stretch for shoulder tension',
    steps: [
      { stepNumber: 1, instruction: 'Extend arms straight in front of you' },
      { stepNumber: 2, instruction: 'Cross right arm over left at elbows' },
      { stepNumber: 3, instruction: 'Bend elbows and wrap forearms, trying to bring palms together' },
      { stepNumber: 4, instruction: 'Lift elbows slightly and hold for 15 seconds' },
      { stepNumber: 5, instruction: 'Switch arm positions and repeat' },
    ],
    duration: 35,
    difficulty: 'moderate',
    commonMistakes: ['Hunching shoulders', 'Forcing the wrap', 'Shallow breathing'],
    benefits: ['Deep shoulder stretch', 'Releases upper back', 'Improves flexibility'],
  },

  // BACK EXERCISES
  {
    id: 'seated-cat-cow',
    name: 'Seated Cat-Cow Stretch',
    category: 'back',
    targetArea: 'Mobilizes entire spine, releases back tension',
    description: 'Gentle spinal flexion and extension',
    steps: [
      { stepNumber: 1, instruction: 'Sit tall with feet flat on floor, hands on knees' },
      { stepNumber: 2, instruction: 'Inhale and arch your back, lifting chest (Cow pose)' },
      { stepNumber: 3, instruction: 'Look slightly upward' },
      { stepNumber: 4, instruction: 'Exhale and round your spine, tucking chin to chest (Cat pose)' },
      { stepNumber: 5, instruction: 'Flow between these positions 5-8 times' },
    ],
    duration: 45,
    repetitions: 8,
    difficulty: 'gentle',
    commonMistakes: ['Moving too quickly', 'Forcing the arch', 'Not coordinating with breath'],
    benefits: ['Mobilizes spine', 'Relieves back tension', 'Improves posture awareness'],
  },
  {
    id: 'seated-spinal-twist',
    name: 'Seated Spinal Twist',
    category: 'back',
    targetArea: 'Rotational mobility, releases spinal tension',
    description: 'Gentle twist to release back and improve mobility',
    steps: [
      { stepNumber: 1, instruction: 'Sit sideways in your chair with feet flat on floor' },
      { stepNumber: 2, instruction: 'Hold the back of the chair with both hands' },
      { stepNumber: 3, instruction: 'Gently twist your torso toward the chair back' },
      { stepNumber: 4, instruction: 'Hold for 20-30 seconds' },
      { stepNumber: 5, instruction: 'Switch sides and repeat' },
    ],
    duration: 50,
    difficulty: 'moderate',
    commonMistakes: ['Forcing the twist', 'Lifting hips off seat', 'Holding breath'],
    benefits: ['Improves spinal rotation', 'Releases back tension', 'Aids digestion'],
  },
  {
    id: 'side-bends',
    name: 'Side Bends',
    category: 'back',
    targetArea: 'Stretches lateral trunk muscles',
    description: 'Lateral flexion to stretch side body',
    steps: [
      { stepNumber: 1, instruction: 'Sit tall with feet hip-width apart' },
      { stepNumber: 2, instruction: 'Raise right arm overhead' },
      { stepNumber: 3, instruction: 'Lean gently to the left, feeling stretch along right side' },
      { stepNumber: 4, instruction: 'Hold for 10-15 seconds' },
      { stepNumber: 5, instruction: 'Return to center and repeat on opposite side' },
    ],
    duration: 35,
    repetitions: 4,
    difficulty: 'gentle',
    commonMistakes: ['Leaning forward', 'Collapsing into the stretch', 'Rushing'],
    benefits: ['Stretches side body', 'Improves lateral mobility', 'Lengthens spine'],
  },
  {
    id: 'thoracic-extension',
    name: 'Thoracic Extension',
    category: 'back',
    targetArea: 'Extends thoracic spine, opens chest',
    description: 'Chair-supported extension for upper back',
    steps: [
      { stepNumber: 1, instruction: 'Sit forward in chair with feet flat' },
      { stepNumber: 2, instruction: 'Place hands behind head, elbows wide' },
      { stepNumber: 3, instruction: 'Lean back over the chair, extending through upper back' },
      { stepNumber: 4, instruction: 'Hold for 5-10 seconds' },
      { stepNumber: 5, instruction: 'Return to starting position' },
    ],
    duration: 30,
    repetitions: 5,
    difficulty: 'moderate',
    commonMistakes: ['Extending from lower back', 'Pushing head forward with hands', 'Going too far'],
    benefits: ['Counteracts slouching', 'Opens chest', 'Improves thoracic mobility'],
  },
  {
    id: 'lower-back-rotation',
    name: 'Lower Back Rotation',
    category: 'back',
    targetArea: 'Mobilizes lumbar spine',
    description: 'Gentle rotation for lower back',
    steps: [
      { stepNumber: 1, instruction: 'Sit tall with both feet flat' },
      { stepNumber: 2, instruction: 'Place right hand on outside of left knee' },
      { stepNumber: 3, instruction: 'Place left hand on seat behind you' },
      { stepNumber: 4, instruction: 'Gently rotate torso to the left' },
      { stepNumber: 5, instruction: 'Hold 15-20 seconds, then switch sides' },
    ],
    duration: 40,
    difficulty: 'gentle',
    commonMistakes: ['Forcing rotation', 'Lifting hips', 'Holding breath'],
    benefits: ['Improves spinal mobility', 'Releases lower back', 'Aids digestion'],
  },

  // CHEST & ARM EXERCISES
  {
    id: 'seated-chest-opener',
    name: 'Seated Chest Opener',
    category: 'chest',
    targetArea: 'Opens chest and stretches pectorals',
    description: 'Counteracts hunched posture',
    steps: [
      { stepNumber: 1, instruction: 'Sit tall and clasp hands behind your lower back' },
      { stepNumber: 2, instruction: 'Straighten arms and squeeze shoulder blades together' },
      { stepNumber: 3, instruction: 'Lift chest slightly' },
      { stepNumber: 4, instruction: 'Hold for 15-20 seconds' },
      { stepNumber: 5, instruction: 'Release gently' },
    ],
    duration: 25,
    difficulty: 'moderate',
    commonMistakes: ['Arching lower back too much', 'Forcing shoulders back', 'Holding breath'],
    benefits: ['Opens chest', 'Improves posture', 'Counteracts rounded shoulders'],
  },
  {
    id: 'wrist-flexor-stretch',
    name: 'Wrist Flexor Stretch',
    category: 'chest',
    targetArea: 'Stretches forearm flexors',
    description: 'Relief for typing and mouse use',
    steps: [
      { stepNumber: 1, instruction: 'Extend right arm forward, palm up' },
      { stepNumber: 2, instruction: 'Use left hand to gently pull fingers back' },
      { stepNumber: 3, instruction: 'Keep arm straight' },
      { stepNumber: 4, instruction: 'Hold for 15 seconds' },
      { stepNumber: 5, instruction: 'Switch arms' },
    ],
    duration: 35,
    difficulty: 'gentle',
    commonMistakes: ['Bending elbow', 'Pulling too hard', 'Tensing shoulders'],
    benefits: ['Prevents carpal tunnel', 'Relieves wrist tension', 'Improves flexibility'],
  },
  {
    id: 'wrist-extensor-stretch',
    name: 'Wrist Extensor Stretch',
    category: 'chest',
    targetArea: 'Stretches forearm extensors',
    description: 'Complement to flexor stretch',
    steps: [
      { stepNumber: 1, instruction: 'Extend right arm forward, palm down' },
      { stepNumber: 2, instruction: 'Use left hand to gently press fingers toward floor' },
      { stepNumber: 3, instruction: 'Keep arm straight' },
      { stepNumber: 4, instruction: 'Hold for 15 seconds' },
      { stepNumber: 5, instruction: 'Switch arms' },
    ],
    duration: 35,
    difficulty: 'gentle',
    commonMistakes: ['Bending elbow', 'Excessive pressure', 'Hunching shoulders'],
    benefits: ['Balances forearm muscles', 'Prevents strain', 'Reduces tension'],
  },
  {
    id: 'finger-stretches',
    name: 'Finger Stretches',
    category: 'chest',
    targetArea: 'Stretches fingers and hand muscles',
    description: 'Relief for typing fatigue',
    steps: [
      { stepNumber: 1, instruction: 'Spread fingers wide apart' },
      { stepNumber: 2, instruction: 'Hold for 5 seconds' },
      { stepNumber: 3, instruction: 'Make a tight fist' },
      { stepNumber: 4, instruction: 'Hold for 5 seconds' },
      { stepNumber: 5, instruction: 'Repeat 5-10 times' },
    ],
    duration: 30,
    repetitions: 10,
    difficulty: 'gentle',
    commonMistakes: ['Moving too quickly', 'Not making tight fist', 'Tensing shoulders'],
    benefits: ['Prevents hand fatigue', 'Improves circulation', 'Reduces stiffness'],
  },

  // EYE EXERCISES
  {
    id: '20-20-20-rule',
    name: '20-20-20 Rule',
    category: 'eye',
    targetArea: 'Reduces digital eye strain',
    description: 'Evidence-based eye rest technique',
    steps: [
      { stepNumber: 1, instruction: 'Every 20 minutes, look away from your screen' },
      { stepNumber: 2, instruction: 'Focus on something 20 feet (6 meters) away' },
      { stepNumber: 3, instruction: 'Hold your gaze for at least 20 seconds' },
      { stepNumber: 4, instruction: 'Blink several times to refresh eyes' },
      { stepNumber: 5, instruction: 'Return to work' },
    ],
    duration: 20,
    difficulty: 'gentle',
    commonMistakes: ['Not looking far enough', 'Looking for too short a time', 'Forgetting to blink'],
    benefits: ['Reduces eye strain', 'Prevents dry eyes', 'Improves focus'],
  },
  {
    id: 'eye-rolls',
    name: 'Eye Rolls',
    category: 'eye',
    targetArea: 'Exercises eye muscles',
    description: 'Gentle exercise for eye mobility',
    steps: [
      { stepNumber: 1, instruction: 'Close your eyes and relax' },
      { stepNumber: 2, instruction: 'Slowly roll your eyes in a circular motion' },
      { stepNumber: 3, instruction: 'Complete 5 circles clockwise' },
      { stepNumber: 4, instruction: 'Reverse and complete 5 circles counterclockwise' },
      { stepNumber: 5, instruction: 'Open eyes slowly' },
    ],
    duration: 25,
    repetitions: 5,
    difficulty: 'gentle',
    commonMistakes: ['Moving too quickly', 'Squinting', 'Tensing facial muscles'],
    benefits: ['Relaxes eye muscles', 'Improves circulation', 'Reduces tension'],
  },
  {
    id: 'palming',
    name: 'Palming (Eye Relaxation)',
    category: 'eye',
    targetArea: 'Deep eye relaxation',
    description: 'Yoga technique for eye rest',
    steps: [
      { stepNumber: 1, instruction: 'Rub palms together to generate warmth' },
      { stepNumber: 2, instruction: 'Close your eyes gently' },
      { stepNumber: 3, instruction: 'Cup your palms over closed eyes without pressing' },
      { stepNumber: 4, instruction: 'Relax in darkness for 30 seconds to 1 minute' },
      { stepNumber: 5, instruction: 'Remove hands slowly and open eyes gradually' },
    ],
    duration: 60,
    difficulty: 'gentle',
    commonMistakes: ['Pressing on eyes', 'Not allowing complete darkness', 'Rushing'],
    benefits: ['Deep eye relaxation', 'Reduces eye strain', 'Calms nervous system'],
  },
];

/**
 * Get exercises by category
 */
export function getExercisesByCategory(category: ExerciseCategory): Exercise[] {
  return EXERCISE_LIBRARY.filter((ex) => ex.category === category);
}

/**
 * Get exercise by ID
 */
export function getExerciseById(id: string): Exercise | undefined {
  return EXERCISE_LIBRARY.find((ex) => ex.id === id);
}

/**
 * Create break routine based on break type and user needs
 */
export function createBreakRoutine(
  breakType: 'micro' | 'standard' | 'extended',
  problemAreas?: string[]
): Exercise[] {
  const exerciseCount = {
    micro: 3,
    standard: 5,
    extended: 8,
  };

  const count = exerciseCount[breakType];
  let exercises: Exercise[] = [];

  // Prioritize exercises based on problem areas
  if (problemAreas && problemAreas.length > 0) {
    for (const area of problemAreas) {
      const categoryExercises = EXERCISE_LIBRARY.filter(
        (ex) => ex.targetArea.toLowerCase().includes(area.toLowerCase())
      );
      exercises.push(...categoryExercises);
    }
  }

  // If not enough exercises, add general ones
  if (exercises.length < count) {
    const general = EXERCISE_LIBRARY.filter(
      (ex) => !exercises.find((e) => e.id === ex.id)
    );
    exercises.push(...general);
  }

  // Return required number of exercises
  return exercises.slice(0, count);
}

/**
 * Get total routine duration
 */
export function getRoutineDuration(exercises: Exercise[]): number {
  return exercises.reduce((total, ex) => total + ex.duration, 0);
}
