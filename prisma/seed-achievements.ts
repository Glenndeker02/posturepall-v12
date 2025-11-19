/**
 * Achievement Seeding Script
 * Populates the database with initial achievements
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ACHIEVEMENTS = [
  // Getting Started Achievements (Common)
  {
    name: 'First Steps',
    description: 'Complete your first posture monitoring session',
    icon: '🎯',
    points: 10,
    rarity: 'common',
    condition: JSON.stringify({ type: 'sessions', count: 1 }),
  },
  {
    name: 'Calibrated',
    description: 'Complete your first posture calibration',
    icon: '📐',
    points: 10,
    rarity: 'common',
    condition: JSON.stringify({ type: 'calibration', count: 1 }),
  },
  {
    name: 'Break Taker',
    description: 'Take your first posture break',
    icon: '☕',
    points: 10,
    rarity: 'common',
    condition: JSON.stringify({ type: 'breaks', count: 1 }),
  },
  {
    name: 'Getting Started',
    description: 'Complete 5 monitoring sessions',
    icon: '🌱',
    points: 25,
    rarity: 'common',
    condition: JSON.stringify({ type: 'sessions', count: 5 }),
  },

  // Session Milestones (Common to Rare)
  {
    name: 'Dedicated',
    description: 'Complete 10 monitoring sessions',
    icon: '💪',
    points: 50,
    rarity: 'common',
    condition: JSON.stringify({ type: 'sessions', count: 10 }),
  },
  {
    name: 'Committed',
    description: 'Complete 25 monitoring sessions',
    icon: '🎖️',
    points: 100,
    rarity: 'rare',
    condition: JSON.stringify({ type: 'sessions', count: 25 }),
  },
  {
    name: 'Veteran',
    description: 'Complete 50 monitoring sessions',
    icon: '🏆',
    points: 200,
    rarity: 'rare',
    condition: JSON.stringify({ type: 'sessions', count: 50 }),
  },
  {
    name: 'Centurion',
    description: 'Complete 100 monitoring sessions',
    icon: '👑',
    points: 500,
    rarity: 'legendary',
    condition: JSON.stringify({ type: 'sessions', count: 100 }),
  },

  // Streak Achievements (Rare to Legendary)
  {
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    points: 100,
    rarity: 'rare',
    condition: JSON.stringify({ type: 'streak', days: 7 }),
  },
  {
    name: 'Fortnight Fighter',
    description: 'Maintain a 14-day streak',
    icon: '⚡',
    points: 200,
    rarity: 'rare',
    condition: JSON.stringify({ type: 'streak', days: 14 }),
  },
  {
    name: 'Monthly Master',
    description: 'Maintain a 30-day streak',
    icon: '🌟',
    points: 500,
    rarity: 'legendary',
    condition: JSON.stringify({ type: 'streak', days: 30 }),
  },
  {
    name: 'Consistency King',
    description: 'Maintain a 60-day streak',
    icon: '💎',
    points: 1000,
    rarity: 'legendary',
    condition: JSON.stringify({ type: 'streak', days: 60 }),
  },

  // Break Achievements
  {
    name: 'Break Enthusiast',
    description: 'Take 10 posture breaks',
    icon: '🧘',
    points: 50,
    rarity: 'common',
    condition: JSON.stringify({ type: 'breaks', count: 10 }),
  },
  {
    name: 'Stretch Master',
    description: 'Take 50 posture breaks',
    icon: '🤸',
    points: 150,
    rarity: 'rare',
    condition: JSON.stringify({ type: 'breaks', count: 50 }),
  },
  {
    name: 'Movement Guru',
    description: 'Take 100 posture breaks',
    icon: '🧘‍♂️',
    points: 300,
    rarity: 'legendary',
    condition: JSON.stringify({ type: 'breaks', count: 100 }),
  },

  // Points Achievements
  {
    name: 'Point Collector',
    description: 'Earn 100 total points',
    icon: '⭐',
    points: 50,
    rarity: 'common',
    condition: JSON.stringify({ type: 'points', total: 100 }),
  },
  {
    name: 'Point Hoarder',
    description: 'Earn 500 total points',
    icon: '🌟',
    points: 100,
    rarity: 'rare',
    condition: JSON.stringify({ type: 'points', total: 500 }),
  },
  {
    name: 'Point Legend',
    description: 'Earn 1000 total points',
    icon: '💫',
    points: 250,
    rarity: 'legendary',
    condition: JSON.stringify({ type: 'points', total: 1000 }),
  },

  // Quality Achievements
  {
    name: 'Posture Perfectionist',
    description: 'Achieve 90%+ posture score in a session',
    icon: '✨',
    points: 100,
    rarity: 'rare',
    condition: JSON.stringify({ type: 'sessionScore', minScore: 90 }),
  },
  {
    name: 'Ergonomic Excellence',
    description: 'Achieve 95%+ posture score in a session',
    icon: '🎯',
    points: 250,
    rarity: 'legendary',
    condition: JSON.stringify({ type: 'sessionScore', minScore: 95 }),
  },
  {
    name: 'Perfect Posture',
    description: 'Achieve 100% posture score in a session',
    icon: '👼',
    points: 500,
    rarity: 'legendary',
    condition: JSON.stringify({ type: 'sessionScore', minScore: 100 }),
  },

  // Time-based Achievements
  {
    name: 'Marathon Monitor',
    description: 'Complete a 2-hour monitoring session',
    icon: '⏱️',
    points: 100,
    rarity: 'rare',
    condition: JSON.stringify({ type: 'sessionDuration', minutes: 120 }),
  },
  {
    name: 'Endurance Expert',
    description: 'Complete a 4-hour monitoring session',
    icon: '🎪',
    points: 250,
    rarity: 'legendary',
    condition: JSON.stringify({ type: 'sessionDuration', minutes: 240 }),
  },

  // Special Achievements
  {
    name: 'Early Bird',
    description: 'Complete a session before 8 AM',
    icon: '🌅',
    points: 50,
    rarity: 'common',
    condition: JSON.stringify({ type: 'timeOfDay', before: 8 }),
  },
  {
    name: 'Night Owl',
    description: 'Complete a session after 10 PM',
    icon: '🌙',
    points: 50,
    rarity: 'common',
    condition: JSON.stringify({ type: 'timeOfDay', after: 22 }),
  },
  {
    name: 'Weekend Warrior',
    description: 'Complete 10 sessions on weekends',
    icon: '🎉',
    points: 100,
    rarity: 'rare',
    condition: JSON.stringify({ type: 'weekendSessions', count: 10 }),
  },
  {
    name: 'Premium Power User',
    description: 'Upgrade to Premium subscription',
    icon: '👑',
    points: 100,
    rarity: 'rare',
    condition: JSON.stringify({ type: 'subscription', tier: 'premium' }),
  },
];

async function main() {
  console.log('🌱 Starting achievement seeding...\n');

  // Clear existing achievements (optional - comment out if you want to keep existing)
  const deleteResult = await prisma.achievement.deleteMany({});
  console.log(`🗑️  Cleared ${deleteResult.count} existing achievements\n`);

  // Insert new achievements
  let successCount = 0;
  let errorCount = 0;

  for (const achievement of ACHIEVEMENTS) {
    try {
      await prisma.achievement.create({
        data: achievement,
      });
      console.log(`✅ Created: ${achievement.name} (${achievement.rarity})`);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed to create: ${achievement.name}`, error);
      errorCount++;
    }
  }

  console.log(`\n🎉 Seeding completed!`);
  console.log(`✅ Successfully created: ${successCount} achievements`);
  console.log(`❌ Failed: ${errorCount} achievements`);

  // Display summary by rarity
  const common = ACHIEVEMENTS.filter((a) => a.rarity === 'common').length;
  const rare = ACHIEVEMENTS.filter((a) => a.rarity === 'rare').length;
  const legendary = ACHIEVEMENTS.filter((a) => a.rarity === 'legendary').length;

  console.log(`\n📊 Achievement Breakdown:`);
  console.log(`   Common: ${common}`);
  console.log(`   Rare: ${rare}`);
  console.log(`   Legendary: ${legendary}`);
  console.log(`   Total: ${ACHIEVEMENTS.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
