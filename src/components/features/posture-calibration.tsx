/**
 * Comprehensive Posture Calibration Component
 * Multi-step wizard for establishing user's ideal posture baseline
 * Per PRD Section 4.1.4
 */

'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Camera,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Smartphone,
  User,
  Info
} from 'lucide-react';
import { PoseVisualizer } from '@/components/features/pose-visualizer';
import { loadMoveNetModel } from '@/lib/ai/movenet-loader';
import { detectPoseFromVideo } from '@/lib/ai/pose-detector';
import {
  validatePoseForCalibration,
  averagePosesForCalibration,
  createCalibrationData
} from '@/lib/ai/calibration-validator';
import type { DetectedPose, CalibrationData } from '@/lib/ai/types';

interface PostureCalibrationProps {
  workstationName?: string;
  onComplete: (calibrationData: CalibrationData) => void;
  onCancel?: () => void;
}

type CalibrationStep =
  | 'introduction'
  | 'phone-placement'
  | 'sitting-instructions'
  | 'capture'
  | 'review'
  | 'tips';

export function PostureCalibration({
  workstationName = 'Default Workstation',
  onComplete,
  onCancel
}: PostureCalibrationProps) {
  const [currentStep, setCurrentStep] = useState<CalibrationStep>('introduction');
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [currentPose, setCurrentPose] = useState<DetectedPose | null>(null);
  const [capturedPoses, setCapturedPoses] = useState<DetectedPose[]>([]);
  const [calibrationData, setCalibrationData] = useState<CalibrationData | null>(null);
  const [validationIssues, setValidationIssues] = useState<string[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureCountdown, setCaptureCountdown] = useState(0);
  const [positioningCorrect, setPositioningCorrect] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const captureIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Checklist state for sitting instructions
  const [checklist, setChecklist] = useState({
    headAligned: false,
    shouldersLevel: false,
    backStraight: false,
  });

  /**
   * Load MoveNet model on mount
   */
  useEffect(() => {
    let isMounted = true;

    const loadModel = async () => {
      try {
        await loadMoveNetModel();
        if (isMounted) {
          setIsModelLoaded(true);
        }
      } catch (error) {
        console.error('Failed to load model:', error);
      }
    };

    loadModel();

    return () => {
      isMounted = false;
      stopCamera();
    };
  }, []);

  /**
   * Start camera stream
   */
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      console.error('Camera access denied:', error);
      setValidationIssues(['Camera access is required for calibration']);
    }
  };

  /**
   * Stop camera stream
   */
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  /**
   * Detect pose and validate positioning
   */
  const detectAndValidate = useCallback(async () => {
    if (!videoRef.current || !isModelLoaded || !isCameraActive) return;

    try {
      const pose = await detectPoseFromVideo(videoRef.current, true);

      if (pose) {
        setCurrentPose(pose);

        // Validate pose quality
        const validation = validatePoseForCalibration(pose);
        setValidationIssues(validation.issues);
        setPositioningCorrect(validation.isValid);

        // Update checklist for sitting instructions step
        if (currentStep === 'sitting-instructions') {
          updateChecklist(pose);
        }
      }
    } catch (error) {
      console.error('Pose detection error:', error);
    }
  }, [isModelLoaded, isCameraActive, currentStep]);

  /**
   * Update sitting instructions checklist based on pose
   */
  const updateChecklist = (pose: DetectedPose) => {
    // Simple heuristics for checklist (can be made more sophisticated)
    const validation = validatePoseForCalibration(pose);

    setChecklist({
      headAligned: validation.qualityScore > 60,
      shouldersLevel: validation.qualityScore > 70,
      backStraight: validation.qualityScore > 80,
    });
  };

  /**
   * Real-time pose detection loop
   */
  useEffect(() => {
    if (currentStep === 'phone-placement' || currentStep === 'sitting-instructions') {
      const interval = setInterval(detectAndValidate, 200); // 5 FPS
      return () => clearInterval(interval);
    }
  }, [currentStep, detectAndValidate]);

  /**
   * Start calibration capture
   */
  const startCapture = async () => {
    setIsCapturing(true);
    setCapturedPoses([]);

    // 3-2-1 countdown
    for (let i = 3; i > 0; i--) {
      setCaptureCountdown(i);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    setCaptureCountdown(0);

    // Capture poses for 5 seconds at 5 FPS (25 frames)
    const poses: DetectedPose[] = [];
    let frameCount = 0;
    const totalFrames = 25;

    captureIntervalRef.current = setInterval(async () => {
      if (frameCount >= totalFrames) {
        if (captureIntervalRef.current) {
          clearInterval(captureIntervalRef.current);
        }

        // Process captured poses
        setCapturedPoses(poses);

        try {
          // Average poses to create calibration data
          const averagedPose = averagePosesForCalibration(poses);
          const calibration = createCalibrationData(averagedPose);
          setCalibrationData(calibration);
          setIsCapturing(false);
          setCurrentStep('review');
        } catch (error) {
          console.error('Calibration creation error:', error);
          setValidationIssues(['Failed to create calibration. Please try again.']);
          setIsCapturing(false);
        }

        return;
      }

      if (videoRef.current) {
        try {
          const pose = await detectPoseFromVideo(videoRef.current, true);
          if (pose) {
            poses.push(pose);
            frameCount++;
          }
        } catch (error) {
          console.error('Capture error:', error);
        }
      }
    }, 200); // 5 FPS
  };

  /**
   * Navigate to next step
   */
  const nextStep = async () => {
    switch (currentStep) {
      case 'introduction':
        await startCamera();
        setCurrentStep('phone-placement');
        break;
      case 'phone-placement':
        setCurrentStep('sitting-instructions');
        break;
      case 'sitting-instructions':
        setCurrentStep('capture');
        break;
      case 'capture':
        await startCapture();
        break;
      case 'review':
        setCurrentStep('tips');
        break;
      case 'tips':
        if (calibrationData) {
          onComplete(calibrationData);
        }
        break;
    }
  };

  /**
   * Go back to previous step
   */
  const previousStep = () => {
    switch (currentStep) {
      case 'phone-placement':
        stopCamera();
        setCurrentStep('introduction');
        break;
      case 'sitting-instructions':
        setCurrentStep('phone-placement');
        break;
      case 'capture':
        setCurrentStep('sitting-instructions');
        break;
      case 'review':
        setCurrentStep('capture');
        break;
      case 'tips':
        setCurrentStep('review');
        break;
    }
  };

  /**
   * Retake calibration
   */
  const retakeCalibration = () => {
    setCapturedPoses([]);
    setCalibrationData(null);
    setCurrentStep('phone-placement');
  };

  /**
   * Get progress percentage
   */
  const getProgress = () => {
    const steps: CalibrationStep[] = [
      'introduction',
      'phone-placement',
      'sitting-instructions',
      'capture',
      'review',
      'tips'
    ];
    const currentIndex = steps.indexOf(currentStep);
    return ((currentIndex + 1) / steps.length) * 100;
  };

  /**
   * Render step content
   */
  const renderStepContent = () => {
    switch (currentStep) {
      case 'introduction':
        return (
          <div className="text-center space-y-6 py-8">
            <div className="flex justify-center">
              <div className="relative">
                <Smartphone className="w-24 h-24 text-indigo-600" />
                <div className="absolute -top-2 -right-2">
                  <Camera className="w-8 h-8 text-indigo-400" />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold mb-2">Let's Calibrate Your Perfect Posture</h2>
              <p className="text-gray-600 text-lg">
                This one-time setup helps Spine Mate learn what good posture looks like for your body.
              </p>
            </div>

            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Setup Instructions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-left">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p>Find a stable surface to prop your phone or laptop</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p>Position it 1-2 feet away, at eye level</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p>Make sure your face and shoulders are visible</p>
                </div>
              </CardContent>
            </Card>

            {workstationName !== 'Default Workstation' && (
              <Badge variant="outline" className="text-sm">
                Calibrating for: {workstationName}
              </Badge>
            )}
          </div>
        );

      case 'phone-placement':
        return (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold mb-2">Position Your Camera</h2>
              <p className="text-gray-600">Adjust until you see the green checkmark</p>
            </div>

            <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover mirror"
                style={{ transform: 'scaleX(-1)' }}
              />

              {currentPose && isCameraActive && (
                <PoseVisualizer
                  pose={currentPose}
                  videoElement={videoRef.current}
                  showSkeleton={true}
                  showKeypoints={true}
                />
              )}

              {/* Positioning feedback overlay */}
              <div className="absolute top-4 left-4 right-4">
                {validationIssues.length > 0 ? (
                  <Alert variant="destructive">
                    <AlertCircle className="w-4 h-4" />
                    <AlertDescription>{validationIssues[0]}</AlertDescription>
                  </Alert>
                ) : positioningCorrect ? (
                  <Alert className="bg-green-600 text-white border-green-700">
                    <CheckCircle2 className="w-4 h-4" />
                    <AlertDescription>Perfect positioning!</AlertDescription>
                  </Alert>
                ) : null}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <div className="text-2xl mb-1">{positioningCorrect ? '✅' : '⏳'}</div>
                <p className="text-gray-600">Face Visible</p>
              </div>
              <div>
                <div className="text-2xl mb-1">{positioningCorrect ? '✅' : '⏳'}</div>
                <p className="text-gray-600">Good Distance</p>
              </div>
              <div>
                <div className="text-2xl mb-1">{positioningCorrect ? '✅' : '⏳'}</div>
                <p className="text-gray-600">Shoulders Visible</p>
              </div>
            </div>
          </div>
        );

      case 'sitting-instructions':
        return (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold mb-2">Sit in Your Best Posture</h2>
              <p className="text-gray-600">Follow the instructions below</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Instructions */}
              <Card>
                <CardHeader>
                  <CardTitle>Perfect Sitting Posture</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      checklist.headAligned ? 'bg-green-600' : 'bg-gray-300'
                    }`}>
                      {checklist.headAligned && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                    <div>
                      <p className="font-medium">Head Aligned</p>
                      <p className="text-sm text-gray-600">Chin parallel to floor, ears over shoulders</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      checklist.shouldersLevel ? 'bg-green-600' : 'bg-gray-300'
                    }`}>
                      {checklist.shouldersLevel && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                    <div>
                      <p className="font-medium">Shoulders Level</p>
                      <p className="text-sm text-gray-600">Relaxed, not hunched or raised</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      checklist.backStraight ? 'bg-green-600' : 'bg-gray-300'
                    }`}>
                      {checklist.backStraight && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                    <div>
                      <p className="font-medium">Back Straight</p>
                      <p className="text-sm text-gray-600">Against chair, natural S-curve</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t">
                    <p className="text-sm text-gray-600">
                      <strong>Additional tips:</strong> Feet flat on floor, knees at 90°, screen at eye level
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Live camera view */}
              <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover mirror"
                  style={{ transform: 'scaleX(-1)' }}
                />

                {currentPose && (
                  <PoseVisualizer
                    pose={currentPose}
                    videoElement={videoRef.current}
                    showSkeleton={true}
                    showKeypoints={true}
                  />
                )}
              </div>
            </div>
          </div>
        );

      case 'capture':
        return (
          <div className="text-center space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Calibration Capture</h2>
              <p className="text-gray-600">
                {isCapturing ? 'Hold still...' : 'Get into your best posture and click "Start Capture"'}
              </p>
            </div>

            <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden max-w-2xl mx-auto">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover mirror"
                style={{ transform: 'scaleX(-1)' }}
              />

              {currentPose && (
                <PoseVisualizer
                  pose={currentPose}
                  videoElement={videoRef.current}
                  showSkeleton={true}
                  showKeypoints={true}
                />
              )}

              {/* Countdown overlay */}
              {captureCountdown > 0 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-9xl font-bold text-white animate-pulse">
                    {captureCountdown}
                  </div>
                </div>
              )}

              {/* Capturing indicator */}
              {isCapturing && captureCountdown === 0 && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                  <Badge variant="destructive" className="animate-pulse">
                    <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                    Recording... {Math.floor((capturedPoses.length / 25) * 100)}%
                  </Badge>
                </div>
              )}
            </div>

            {!isCapturing && (
              <Alert>
                <Info className="w-4 h-4" />
                <AlertDescription>
                  The system will capture your posture for 5 seconds. Stay still and maintain your best posture.
                </AlertDescription>
              </Alert>
            )}
          </div>
        );

      case 'review':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Your Ideal Posture Baseline</h2>
              <p className="text-gray-600">
                Spine Mate will alert you when you deviate from this position
              </p>
            </div>

            <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden max-w-2xl mx-auto">
              {capturedPoses.length > 0 && (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover mirror"
                    style={{ transform: 'scaleX(-1)' }}
                  />

                  <PoseVisualizer
                    pose={capturedPoses[Math.floor(capturedPoses.length / 2)]}
                    videoElement={videoRef.current}
                    showSkeleton={true}
                    showKeypoints={true}
                  />
                </>
              )}

              <div className="absolute top-4 left-4 right-4">
                <Badge className="bg-green-600">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Calibration Complete
                </Badge>
              </div>
            </div>

            {calibrationData && (
              <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Quality Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">
                      {calibrationData.qualityScore}%
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Keypoints Detected</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {Object.keys(calibrationData.keypointConfidences).length}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Baseline Set</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-indigo-600">
                      {new Date(calibrationData.capturedAt).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        );

      case 'tips':
        return (
          <div className="text-center space-y-6 max-w-2xl mx-auto">
            <div>
              <h2 className="text-2xl font-bold mb-2">Pro Tips for Accurate Monitoring</h2>
              <p className="text-gray-600">Follow these tips for the best results</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <RotateCcw className="w-5 h-5 text-indigo-600" />
                    Recalibrate Weekly
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    As your posture improves, recalibrate to set a new baseline
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Camera className="w-5 h-5 text-indigo-600" />
                    Keep Camera Clean
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    A clean lens ensures accurate pose detection
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="w-5 h-5 text-indigo-600" />
                    Consistent Distance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Maintain similar distance from camera during sessions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                    Good Lighting
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Ensure consistent lighting for best detection accuracy
                  </p>
                </CardContent>
              </Card>
            </div>

            <Alert>
              <Info className="w-4 h-4" />
              <AlertDescription>
                You can recalibrate anytime from Settings or when adding a new workstation.
              </AlertDescription>
            </Alert>
          </div>
        );

      default:
        return null;
    }
  };

  /**
   * Check if can proceed to next step
   */
  const canProceed = () => {
    switch (currentStep) {
      case 'introduction':
        return isModelLoaded;
      case 'phone-placement':
        return positioningCorrect;
      case 'sitting-instructions':
        return checklist.headAligned && checklist.shouldersLevel && checklist.backStraight;
      case 'capture':
        return !isCapturing;
      case 'review':
        return calibrationData !== null;
      case 'tips':
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {['introduction', 'phone-placement', 'sitting-instructions', 'capture', 'review', 'tips'].indexOf(currentStep) + 1} of 6
            </span>
            <span className="text-sm text-gray-500">{Math.round(getProgress())}%</span>
          </div>
          <Progress value={getProgress()} className="h-2" />
        </div>

        {/* Main content */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between">
          <div>
            {currentStep !== 'introduction' && (
              <Button
                variant="outline"
                onClick={previousStep}
                disabled={isCapturing}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
          </div>

          <div className="flex gap-3">
            {onCancel && currentStep === 'introduction' && (
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}

            {currentStep === 'review' && (
              <Button variant="outline" onClick={retakeCalibration}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Retake Calibration
              </Button>
            )}

            {currentStep === 'capture' && !isCapturing ? (
              <Button
                onClick={startCapture}
                disabled={!canProceed()}
                size="lg"
              >
                Start Capture
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                disabled={!canProceed() || isCapturing}
                size="lg"
              >
                {currentStep === 'tips' ? 'Complete' : 'Next'}
                {currentStep !== 'tips' && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
