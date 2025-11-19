/**
 * Goal Setting & Commitment Component
 * Goal templates, custom goals, and commitment contract
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Target, Sparkles, Heart, Calendar, Trophy, Star, Check } from 'lucide-react';

interface GoalCommitmentProps {
  userProfile: {
    hasPain: boolean;
    commitmentLevel: string;
    primaryGoal: string;
  };
  onComplete: (goalData: GoalData) => void;
}

export interface GoalData {
  template: string;
  customGoal?: string;
  commitment: string;
  reminder: boolean;
  shareProgress: boolean;
  shareEmail?: string;
  joinCommunity: boolean;
}

const goalTemplates = {
  beginner: [
    {
      id: 'first_session',
      title: 'Complete your first posture session',
      duration: 'immediate',
      target: '1 session',
      difficulty: 'beginner',
      points: 50,
    },
    {
      id: 'three_days',
      title: 'Use Posture Pal 3 days this week',
      duration: 'weekly',
      target: '3 days',
      difficulty: 'beginner',
      points: 150,
    },
    {
      id: 'five_breaks',
      title: 'Take 5 stretch breaks',
      duration: 'weekly',
      target: '5 breaks',
      difficulty: 'beginner',
      points: 100,
    },
  ],
  intermediate: [
    {
      id: '70_percent',
      title: 'Maintain 70% good posture for 5 days',
      duration: 'weekly',
      target: '70% posture score',
      difficulty: 'intermediate',
      points: 300,
    },
    {
      id: 'daily_stretching',
      title: 'Complete daily stretching routine for 7 days',
      duration: 'weekly',
      target: '7 day streak',
      difficulty: 'intermediate',
      points: 350,
    },
    {
      id: '500_points',
      title: 'Earn 500 Posture Points',
      duration: 'bi-weekly',
      target: '500 points',
      difficulty: 'intermediate',
      points: 500,
    },
  ],
  advanced: [
    {
      id: '90_percent_week',
      title: 'Achieve 90% posture score for full workweek',
      duration: 'weekly',
      target: '90% for 5 days',
      difficulty: 'advanced',
      points: 600,
    },
    {
      id: '30_day_streak',
      title: '30-day perfect posture streak',
      duration: 'monthly',
      target: '30 days',
      difficulty: 'advanced',
      points: 1000,
    },
    {
      id: 'reduce_pain',
      title: 'Reduce pain level from 4/5 to 2/5',
      duration: 'monthly',
      target: '-2 pain levels',
      difficulty: 'advanced',
      points: 800,
    },
  ],
};

export function GoalCommitment({ userProfile, onComplete }: GoalCommitmentProps) {
  const [step, setStep] = useState<'select' | 'commit'>('select');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customGoal, setCustomGoal] = useState('');
  const [commitment, setCommitment] = useState('');
  const [remindDaily, setRemindDaily] = useState(false);
  const [shareProgress, setShareProgress] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [joinCommunity, setJoinCommunity] = useState(false);

  // Get suggested goals based on user profile
  const getSuggestedGoals = () => {
    if (userProfile.hasPain) {
      return goalTemplates.intermediate.filter(g => g.id === '70_percent' || g.id === 'daily_stretching');
    }
    if (userProfile.commitmentLevel === 'low') {
      return goalTemplates.beginner;
    }
    if (userProfile.commitmentLevel === 'high') {
      return goalTemplates.advanced;
    }
    return goalTemplates.intermediate;
  };

  const suggestedGoals = getSuggestedGoals();

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'advanced':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const handleSelectGoal = (templateId: string) => {
    setSelectedTemplate(templateId);
    setStep('commit');
  };

  const handleComplete = () => {
    if (!commitment) {
      alert('Please tell us why this goal is important to you');
      return;
    }

    const goalData: GoalData = {
      template: selectedTemplate,
      customGoal: customGoal || undefined,
      commitment,
      reminder: remindDaily,
      shareProgress,
      shareEmail: shareProgress ? shareEmail : undefined,
      joinCommunity,
    };

    onComplete(goalData);
  };

  const selectedGoal = [
    ...goalTemplates.beginner,
    ...goalTemplates.intermediate,
    ...goalTemplates.advanced,
  ].find(g => g.id === selectedTemplate);

  if (step === 'commit') {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Make It Official</h2>
          <p className="text-lg text-gray-600">
            Research shows that writing down goals increases success by 42%
          </p>
        </div>

        {/* Selected goal display */}
        {selectedGoal && (
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl border-2 border-indigo-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-indigo-900 mb-2">Your Goal</h3>
                <p className="text-indigo-700 mb-2">{selectedGoal.title}</p>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="secondary" className={getDifficultyColor(selectedGoal.difficulty)}>
                    {selectedGoal.difficulty}
                  </Badge>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    {selectedGoal.duration}
                  </Badge>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                    +{selectedGoal.points} points
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Commitment question */}
        <div className="space-y-4">
          <Label className="text-lg font-medium">Why is this goal important to you?</Label>
          <Textarea
            placeholder="E.g., I want to work pain-free and be more present with my family"
            value={commitment}
            onChange={(e) => setCommitment(e.target.value)}
            className="min-h-[120px] text-base rounded-xl"
            maxLength={200}
          />
          <p className="text-sm text-gray-500 text-right">{commitment.length}/200</p>
        </div>

        {/* Accountability options */}
        <div className="space-y-4">
          <Label className="text-lg font-medium block mb-4">Increase your success:</Label>

          <div className="flex items-start space-x-3 p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
            <Checkbox
              id="remind"
              checked={remindDaily}
              onCheckedChange={(checked) => setRemindDaily(checked as boolean)}
            />
            <div className="flex-1">
              <Label htmlFor="remind" className="font-medium cursor-pointer">
                Remind me daily of my "why"
              </Label>
              <p className="text-sm text-gray-600">Get a daily reminder with your commitment statement</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
            <Checkbox
              id="share"
              checked={shareProgress}
              onCheckedChange={(checked) => setShareProgress(checked as boolean)}
            />
            <div className="flex-1">
              <Label htmlFor="share" className="font-medium cursor-pointer">
                Share my progress with a friend
              </Label>
              <p className="text-sm text-gray-600 mb-2">Accountability partners increase success rate by 65%</p>
              {shareProgress && (
                <Input
                  type="email"
                  placeholder="Friend's email address"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  className="mt-2"
                />
              )}
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
            <Checkbox
              id="community"
              checked={joinCommunity}
              onCheckedChange={(checked) => setJoinCommunity(checked as boolean)}
            />
            <div className="flex-1">
              <Label htmlFor="community" className="font-medium cursor-pointer">
                Join the Posture Pal community
              </Label>
              <p className="text-sm text-gray-600">Connect with others on the same journey</p>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setStep('select')}
            className="rounded-xl"
          >
            Change Goal
          </Button>
          <Button
            onClick={handleComplete}
            disabled={!commitment}
            className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl shadow-lg"
          >
            Commit to My Goal
            <Sparkles className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  // Goal selection screen
  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Target className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold mb-4">Let's Set Your First Milestone</h2>
        <p className="text-lg text-gray-600">Choose a goal that excites you</p>
      </div>

      {/* Suggested goals */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-indigo-900">Recommended for You</h3>
        </div>

        <div className="grid gap-4">
          {suggestedGoals.map((goal) => (
            <button
              key={goal.id}
              onClick={() => handleSelectGoal(goal.id)}
              className="text-left p-6 rounded-2xl border-2 border-gray-200 hover:border-indigo-500 hover:shadow-lg transition-all bg-white"
            >
              <div className="flex items-start justify-between mb-3">
                <h4 className="text-lg font-semibold text-gray-900 flex-1">{goal.title}</h4>
                <Trophy className="w-6 h-6 text-indigo-600 flex-shrink-0 ml-2" />
              </div>
              <div className="flex gap-2 flex-wrap mb-3">
                <Badge className={getDifficultyColor(goal.difficulty)}>
                  {goal.difficulty}
                </Badge>
                <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
                  <Calendar className="w-3 h-3 mr-1" />
                  {goal.duration}
                </Badge>
                <Badge variant="outline" className="bg-purple-50 border-purple-200 text-purple-700">
                  <Star className="w-3 h-3 mr-1" />
                  +{goal.points} pts
                </Badge>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Check className="w-4 h-4 text-green-600 mr-1" />
                Target: {goal.target}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Other difficulty levels */}
      <div className="space-y-6">
        {Object.entries(goalTemplates).map(([level, goals]) => {
          if (level === 'beginner' && userProfile.commitmentLevel !== 'low') return null;
          if (level === 'intermediate' && userProfile.commitmentLevel === 'low') return null;
          if (level === 'advanced' && userProfile.commitmentLevel !== 'high') return null;
          if (suggestedGoals === goals) return null; // Skip if already shown as suggested

          return (
            <details key={level} className="group">
              <summary className="cursor-pointer list-none">
                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <span className="font-medium capitalize">{level} Goals</span>
                  <span className="text-gray-500 group-open:rotate-180 transition-transform">▼</span>
                </div>
              </summary>
              <div className="mt-3 space-y-3 pl-4">
                {goals.map((goal) => (
                  <button
                    key={goal.id}
                    onClick={() => handleSelectGoal(goal.id)}
                    className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-indigo-400 hover:shadow-md transition-all bg-white"
                  >
                    <h4 className="font-semibold text-gray-900 mb-2">{goal.title}</h4>
                    <div className="flex gap-2">
                      <Badge className={getDifficultyColor(goal.difficulty)} variant="outline">
                        {goal.difficulty}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        +{goal.points} pts
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            </details>
          );
        })}
      </div>

      {/* Custom goal option */}
      <div className="p-6 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50">
        <h4 className="font-semibold text-gray-900 mb-3">Create Custom Goal</h4>
        <Input
          placeholder="Enter your custom goal..."
          value={customGoal}
          onChange={(e) => setCustomGoal(e.target.value)}
          className="mb-3"
        />
        <Button
          onClick={() => {
            if (customGoal) {
              setSelectedTemplate('custom');
              setStep('commit');
            }
          }}
          disabled={!customGoal}
          variant="outline"
          className="w-full"
        >
          Set Custom Goal
        </Button>
      </div>
    </div>
  );
}
