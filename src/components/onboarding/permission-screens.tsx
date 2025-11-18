/**
 * Permission Screens Component
 * Requests camera and notification permissions with clear explanations
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Bell, Check, X, Shield, ChevronRight } from 'lucide-react';

interface PermissionScreensProps {
  onComplete: () => void;
}

type PermissionStatus = 'pending' | 'granted' | 'denied';

export function PermissionScreens({ onComplete }: PermissionScreensProps) {
  const [currentScreen, setCurrentScreen] = useState<'camera' | 'notifications' | 'done'>('camera');
  const [cameraPermission, setCameraPermission] = useState<PermissionStatus>('pending');
  const [notificationPermission, setNotificationPermission] = useState<PermissionStatus>('pending');

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Stop the stream immediately
      stream.getTracks().forEach(track => track.stop());
      setCameraPermission('granted');
      setTimeout(() => setCurrentScreen('notifications'), 1000);
    } catch (error) {
      console.error('Camera permission denied:', error);
      setCameraPermission('denied');
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission === 'granted' ? 'granted' : 'denied');
        setTimeout(() => setCurrentScreen('done'), 1000);
      } catch (error) {
        console.error('Notification permission error:', error);
        setNotificationPermission('denied');
      }
    } else {
      setNotificationPermission('denied');
    }
  };

  const skipCameraPermission = () => {
    setCameraPermission('denied');
    setCurrentScreen('notifications');
  };

  const skipNotificationPermission = () => {
    setNotificationPermission('denied');
    setCurrentScreen('done');
  };

  if (currentScreen === 'done') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <div className="max-w-xl w-full">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center">
            {/* Success icon */}
            <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Check className="w-12 h-12 text-white" />
            </div>

            <h2 className="text-3xl font-bold mb-4">All Set!</h2>
            <p className="text-lg text-gray-600 mb-8">
              You're ready to start your posture improvement journey
            </p>

            {/* Permission summary */}
            <div className="space-y-3 mb-8">
              <div className={`flex items-center justify-between p-4 rounded-xl ${
                cameraPermission === 'granted' ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
              }`}>
                <div className="flex items-center gap-3">
                  <Camera className={`w-5 h-5 ${cameraPermission === 'granted' ? 'text-green-600' : 'text-gray-400'}`} />
                  <span className="font-medium">Camera Access</span>
                </div>
                {cameraPermission === 'granted' ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <X className="w-5 h-5 text-gray-400" />
                )}
              </div>

              <div className={`flex items-center justify-between p-4 rounded-xl ${
                notificationPermission === 'granted' ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
              }`}>
                <div className="flex items-center gap-3">
                  <Bell className={`w-5 h-5 ${notificationPermission === 'granted' ? 'text-green-600' : 'text-gray-400'}`} />
                  <span className="font-medium">Notifications</span>
                </div>
                {notificationPermission === 'granted' ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <X className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </div>

            {(cameraPermission === 'denied' || notificationPermission === 'denied') && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
                <p className="text-sm text-blue-900">
                  You can enable these permissions later in your device settings for the full experience.
                </p>
              </div>
            )}

            <Button
              onClick={onComplete}
              size="lg"
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl shadow-lg"
            >
              Continue to Setup
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (currentScreen === 'notifications') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 flex items-center justify-center p-4">
        <div className="max-w-xl w-full">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
            {/* Icon */}
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Bell className="w-10 h-10 text-white" />
            </div>

            {/* Headline */}
            <h2 className="text-3xl font-bold text-center mb-4">
              Stay on Track with Gentle Reminders
            </h2>
            <p className="text-lg text-gray-600 text-center mb-8">
              Posture Pal will send you friendly nudges to take breaks and check your posture.
            </p>

            {/* Visual */}
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <div className="w-64 h-32 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl border-2 border-purple-200 p-4 shadow-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">🧘</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-purple-900 text-sm mb-1">Time for a break!</p>
                      <p className="text-xs text-purple-700">You've been sitting for 45 minutes</p>
                    </div>
                  </div>
                </div>
                {/* Animation rings */}
                <div className="absolute -inset-2 border-2 border-purple-300 rounded-2xl animate-ping opacity-20" />
                <div className="absolute -inset-4 border-2 border-purple-200 rounded-2xl animate-ping opacity-10" style={{animationDelay: '0.5s'}} />
              </div>
            </div>

            {/* Benefits */}
            <div className="space-y-3 mb-8">
              {[
                'Customizable reminder frequency',
                'Break reminders for stretching',
                'Daily progress updates',
                'Achievement celebrations',
              ].map((benefit, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                  <Check className="w-5 h-5 text-purple-600 flex-shrink-0" />
                  <span className="text-sm text-purple-900">{benefit}</span>
                </div>
              ))}
            </div>

            {/* Privacy note */}
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl mb-8">
              <Shield className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-600">
                You can customize notification frequency or disable them anytime in settings.
              </p>
            </div>

            {/* CTAs */}
            <div className="space-y-3">
              <Button
                onClick={requestNotificationPermission}
                size="lg"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl shadow-lg"
              >
                Enable Notifications
              </Button>

              <Button
                onClick={skipNotificationPermission}
                variant="ghost"
                className="w-full text-gray-600 hover:text-gray-900"
              >
                Skip for now
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Camera permission screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-xl w-full">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          {/* Icon */}
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Camera className="w-10 h-10 text-white" />
          </div>

          {/* Headline */}
          <h2 className="text-3xl font-bold text-center mb-4">
            Let's Set Up Your Posture Pal
          </h2>
          <p className="text-lg text-gray-600 text-center mb-8">
            Posture Pal uses your camera to analyze your posture in real-time.
          </p>

          {/* Visual */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="w-48 h-56 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl border-4 border-white shadow-2xl flex items-center justify-center">
                <Camera className="w-16 h-16 text-blue-600" />
              </div>
              {/* Scanning effect */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-scan" />
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-3 mb-8">
            {[
              'Real-time posture analysis',
              'All processing happens on your device',
              'No video is recorded or stored',
              'You can revoke access anytime',
            ].map((benefit, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <span className="text-sm text-blue-900">{benefit}</span>
              </div>
            ))}
          </div>

          {/* Privacy note */}
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl mb-8">
            <Shield className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-600">
              Your camera feed is processed locally on your device for privacy. We never record or upload your video.
            </p>
          </div>

          {/* CTAs */}
          <div className="space-y-3">
            <Button
              onClick={requestCameraPermission}
              size="lg"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg"
            >
              Allow Camera Access
            </Button>

            <Button
              onClick={skipCameraPermission}
              variant="ghost"
              className="w-full text-gray-600 hover:text-gray-900"
            >
              Skip for now
            </Button>
          </div>

          {cameraPermission === 'denied' && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-sm text-amber-900">
                Camera access is required for posture analysis. You can enable it later in your browser settings.
              </p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes scan {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(224px);
          }
        }
        .animate-scan {
          animation: scan 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
