/**
 * Welcome Carousel Component
 * Swipeable intro screens before onboarding
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Camera, TrendingUp, Users, Heart } from 'lucide-react';

interface WelcomeCarouselProps {
  onComplete: () => void;
}

const slides = [
  {
    title: 'Sitting is the New Smoking',
    subtitle: "80% of desk workers experience pain from poor posture. You don't have to be one of them.",
    visual: (
      <div className="relative w-full max-w-md mx-auto h-64 flex items-center justify-center">
        <div className="flex gap-8">
          {/* Slouched figure */}
          <div className="text-center">
            <div className="relative">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-3">
                <div className="text-4xl transform -rotate-12">😔</div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-lg">✗</span>
              </div>
            </div>
            <p className="text-sm text-red-600 font-medium">Slouched</p>
            <p className="text-xs text-red-500 mt-1">Pain & Fatigue</p>
          </div>

          {/* Upright figure */}
          <div className="text-center">
            <div className="relative">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <div className="text-4xl">😊</div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-lg">✓</span>
              </div>
            </div>
            <p className="text-sm text-green-600 font-medium">Upright</p>
            <p className="text-xs text-green-500 mt-1">Energy & Focus</p>
          </div>
        </div>
      </div>
    ),
    icon: Heart,
    color: 'from-red-500 to-pink-500',
  },
  {
    title: 'Real-Time Posture Analysis',
    subtitle: 'Using AI, Posture Pal monitors your posture and alerts you when you slouch—so you can correct before pain starts.',
    visual: (
      <div className="relative w-full max-w-md mx-auto h-64 flex items-center justify-center">
        <div className="relative">
          <div className="w-48 h-56 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl border-4 border-white shadow-2xl flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent" />
            <Camera className="w-16 h-16 text-blue-600" />
          </div>
          {/* AR overlay effect */}
          <div className="absolute top-8 right-4 w-16 h-16 border-2 border-green-500 rounded-lg animate-pulse" />
          <div className="absolute bottom-8 left-4 w-20 h-12 border-2 border-yellow-500 rounded-lg animate-pulse delay-75" />
          <div className="absolute top-1/2 left-1/2 w-12 h-12 border-2 border-blue-500 rounded-full animate-ping delay-150" />
        </div>
      </div>
    ),
    icon: Camera,
    color: 'from-blue-500 to-indigo-500',
  },
  {
    title: 'More Than Just Reminders',
    subtitle: 'Guided exercises, break reminders, progress tracking, and a supportive community.',
    visual: (
      <div className="w-full max-w-md mx-auto h-64 flex items-center justify-center">
        <div className="grid grid-cols-2 gap-6">
          <div className="text-center p-4 bg-purple-50 rounded-2xl">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Camera className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-sm font-medium text-purple-900">AI Camera</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-2xl">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl">🧘</span>
            </div>
            <p className="text-sm font-medium text-green-900">Exercises</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-2xl">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-blue-900">Tracking</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-2xl">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <p className="text-sm font-medium text-orange-900">Community</p>
          </div>
        </div>
      </div>
    ),
    icon: Users,
    color: 'from-purple-500 to-indigo-500',
  },
];

export function WelcomeCarousel({ onComplete }: WelcomeCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Slide content */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          {/* Icon */}
          <div className={`w-20 h-20 bg-gradient-to-br ${slide.color} rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg`}>
            <Icon className="w-10 h-10 text-white" />
          </div>

          {/* Visual */}
          <div className="mb-8">
            {slide.visual}
          </div>

          {/* Text */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {slide.title}
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              {slide.subtitle}
            </p>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-8">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentSlide
                    ? 'w-8 bg-indigo-600'
                    : 'w-2 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="rounded-xl"
            >
              Previous
            </Button>

            <Button
              onClick={nextSlide}
              size="lg"
              className={`bg-gradient-to-r ${slide.color} hover:opacity-90 text-white rounded-xl shadow-lg`}
            >
              {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>

          {/* Skip option */}
          {currentSlide < slides.length - 1 && (
            <div className="text-center mt-4">
              <button
                onClick={onComplete}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Skip intro
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes ping {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.8;
          }
        }
        .animate-ping {
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        .delay-75 {
          animation-delay: 0.75s;
        }
        .delay-150 {
          animation-delay: 1.5s;
        }
      `}</style>
    </div>
  );
}
