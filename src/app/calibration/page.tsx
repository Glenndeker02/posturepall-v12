'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Camera, 
  CameraOff, 
  CheckCircle, 
  XCircle, 
  RotateCcw,
  Play,
  ChevronRight,
  ChevronLeft,
  User
} from 'lucide-react'

type CalibrationStep = 'intro' | 'positioning' | 'instructions' | 'capture' | 'review' | 'complete'

export default function Calibration() {
  const [currentStep, setCurrentStep] = useState<CalibrationStep>('intro')
  const [cameraEnabled, setCameraEnabled] = useState(false)
  const [isPositioningCorrect, setIsPositioningCorrect] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  const [captureProgress, setCaptureProgress] = useState(0)
  const [calibrationData, setCalibrationData] = useState<any>(null)
  const [countdown, setCountdown] = useState(0)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const steps = [
    { id: 'intro', title: 'Welcome to Calibration', description: 'Let\'s set up your perfect posture baseline' },
    { id: 'positioning', title: 'Position Your Camera', description: 'Set up your phone for optimal posture detection' },
    { id: 'instructions', title: 'Sit in Your Best Posture', description: 'Follow the instructions for ideal alignment' },
    { id: 'capture', title: 'Capturing Your Baseline', description: 'Hold still while we analyze your posture' },
    { id: 'review', title: 'Review Your Calibration', description: 'Confirm your posture baseline looks correct' },
    { id: 'complete', title: 'Calibration Complete!', description: 'You\'re ready to start monitoring' }
  ]

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setCameraEnabled(true)
      }
    } catch (error) {
      console.error('Camera access denied:', error)
      // Simulate camera for demo
      setCameraEnabled(true)
      setTimeout(() => setIsPositioningCorrect(true), 2000)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setCameraEnabled(false)
  }

  const startCapture = () => {
    setIsCapturing(true)
    setCountdown(3)
    
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval)
          startAnalysis()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const startAnalysis = () => {
    setCaptureProgress(0)
    const analysisInterval = setInterval(() => {
      setCaptureProgress(prev => {
        if (prev >= 100) {
          clearInterval(analysisInterval)
          completeCapture()
          return 100
        }
        return prev + 20
      })
    }, 200)
  }

  const completeCapture = () => {
    setIsCapturing(false)
    // Simulate calibration data
    setCalibrationData({
      headAngle: 2.5,
      shoulderSymmetry: 98.5,
      spineAlignment: 95.2,
      confidence: 92,
      timestamp: new Date().toISOString()
    })
    setCurrentStep('review')
  }

  const retakeCalibration = () => {
    setCalibrationData(null)
    setCaptureProgress(0)
    setCurrentStep('positioning')
  }

  const completeCalibration = () => {
    // Save calibration data and redirect to dashboard
    console.log('Calibration completed:', calibrationData)
    window.location.href = '/'
  }

  const nextStep = () => {
    const stepOrder: CalibrationStep[] = ['intro', 'positioning', 'instructions', 'capture', 'review', 'complete']
    const currentIndex = stepOrder.indexOf(currentStep)
    if (currentIndex < stepOrder.length - 1) {
      const nextStepValue = stepOrder[currentIndex + 1]
      setCurrentStep(nextStepValue)
      
      if (nextStepValue === 'positioning') {
        startCamera()
      } else if (nextStepValue === 'capture') {
        // Auto-start capture after a short delay
        setTimeout(() => startCapture(), 1000)
      }
    }
  }

  const prevStep = () => {
    const stepOrder: CalibrationStep[] = ['intro', 'positioning', 'instructions', 'capture', 'review', 'complete']
    const currentIndex = stepOrder.indexOf(currentStep)
    if (currentIndex > 0) {
      const prevStepValue = stepOrder[currentIndex - 1]
      setCurrentStep(prevStepValue)
      
      if (prevStepValue === 'intro' && cameraEnabled) {
        stopCamera()
      }
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 'intro':
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
              <User className="w-10 h-10 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-4">Let's Calibrate Your Perfect Posture</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                This one-time setup helps Spine Mate learn what good posture looks like for your body. 
                We'll capture your ideal posture and use it as a baseline for real-time monitoring.
              </p>
            </div>
            <div className="bg-blue-50 p-6 rounded-lg max-w-md mx-auto">
              <h3 className="font-semibold text-blue-800 mb-3">What you'll need:</h3>
              <ul className="text-left text-blue-700 space-y-2">
                <li>• A stable surface to prop your phone</li>
                <li>• Position it 1-2 feet away, at eye level</li>
                <li>• Make sure your face and shoulders are visible</li>
                <li>• Good lighting (but not direct sunlight)</li>
              </ul>
            </div>
          </div>
        )

      case 'positioning':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Position Your Camera</h2>
              <p className="text-gray-600">Follow the guides to set up your phone correctly</p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Camera View</h3>
                <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                  {cameraEnabled ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Camera className="w-16 h-16 text-gray-600" />
                    </div>
                  )}
                  
                  {/* AR Overlay Guides */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-4 left-4 right-4">
                      <div className="bg-black/50 backdrop-blur rounded px-3 py-2 text-white text-sm">
                        {isPositioningCorrect ? (
                          <span className="flex items-center">
                            <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                            Perfect positioning!
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <XCircle className="w-4 h-4 mr-2 text-yellow-400" />
                            Adjust camera position
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Face detection frame */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-48 h-48 border-2 border-white rounded-lg opacity-50" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold">Positioning Guidelines</h3>
                <div className="space-y-3">
                  <div className={`flex items-start space-x-3 p-3 rounded-lg ${
                    isPositioningCorrect ? 'bg-green-50' : 'bg-gray-50'
                  }`}>
                    <CheckCircle className={`w-5 h-5 mt-0.5 ${
                      isPositioningCorrect ? 'text-green-600' : 'text-gray-400'
                    }`} />
                    <div>
                      <p className="font-medium">Distance: 1-2 feet</p>
                      <p className="text-sm text-gray-600">Position phone at arm's length</p>
                    </div>
                  </div>
                  
                  <div className={`flex items-start space-x-3 p-3 rounded-lg ${
                    isPositioningCorrect ? 'bg-green-50' : 'bg-gray-50'
                  }`}>
                    <CheckCircle className={`w-5 h-5 mt-0.5 ${
                      isPositioningCorrect ? 'text-green-600' : 'text-gray-400'
                    }`} />
                    <div>
                      <p className="font-medium">Eye Level</p>
                      <p className="text-sm text-gray-600">Camera should be at your eye level</p>
                    </div>
                  </div>
                  
                  <div className={`flex items-start space-x-3 p-3 rounded-lg ${
                    isPositioningCorrect ? 'bg-green-50' : 'bg-gray-50'
                  }`}>
                    <CheckCircle className={`w-5 h-5 mt-0.5 ${
                      isPositioningCorrect ? 'text-green-600' : 'text-gray-400'
                    }`} />
                    <div>
                      <p className="font-medium">Face & Shoulders Visible</p>
                      <p className="text-sm text-gray-600">Ensure both are clearly in frame</p>
                    </div>
                  </div>
                  
                  <div className={`flex items-start space-x-3 p-3 rounded-lg ${
                    isPositioningCorrect ? 'bg-green-50' : 'bg-gray-50'
                  }`}>
                    <CheckCircle className={`w-5 h-5 mt-0.5 ${
                      isPositioningCorrect ? 'text-green-600' : 'text-gray-400'
                    }`} />
                    <div>
                      <p className="font-medium">Good Lighting</p>
                      <p className="text-sm text-gray-600">Even lighting on your face</p>
                    </div>
                  </div>
                </div>
                
                {!isPositioningCorrect && (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Tip:</strong> Prop your phone against a stack of books or use a stand for stability.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )

      case 'instructions':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Sit in Your Best Posture</h2>
              <p className="text-gray-600">Follow these instructions for ideal alignment</p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Live Camera</h3>
                <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                  {cameraEnabled ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-16 h-16 text-gray-600" />
                    </div>
                  )}
                  
                  {/* Posture guides overlay */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-4 left-4 right-4">
                      <div className="bg-black/50 backdrop-blur rounded px-3 py-2 text-white text-sm">
                        Get into your best posture position
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold">Posture Checklist</h3>
                <div className="space-y-3">
                  {[
                    'Feet flat on floor, hip-width apart',
                    'Knees at 90-degree angle',
                    'Back straight against chair',
                    'Shoulders relaxed, not hunched',
                    'Chin parallel to floor',
                    'Screen at eye level'
                  ].map((instruction, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <p className="text-sm">{instruction}</p>
                    </div>
                  ))}
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Perfect!</strong> Hold this position when you're ready to capture.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      case 'capture':
        return (
          <div className="text-center space-y-6">
            <div className="relative">
              <div className="w-32 h-32 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
                {countdown > 0 ? (
                  <span className="text-6xl font-bold text-indigo-600">{countdown}</span>
                ) : (
                  <Camera className="w-16 h-16 text-indigo-600" />
                )}
              </div>
              
              {countdown === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-40 h-40 border-4 border-indigo-300 rounded-full animate-pulse" />
                </div>
              )}
            </div>
            
            <div>
              <h2 className="text-2xl font-bold mb-2">
                {countdown > 0 ? 'Get Ready...' : 'Capturing Your Baseline'}
              </h2>
              <p className="text-gray-600">
                {countdown > 0 
                  ? 'Hold still in your best posture' 
                  : 'Analyzing your posture...'}
              </p>
            </div>
            
            {countdown === 0 && (
              <div className="max-w-md mx-auto">
                <Progress value={captureProgress} className="h-3" />
                <p className="text-sm text-gray-500 mt-2">
                  {captureProgress < 25 && 'Detecting key points...'}
                  {captureProgress >= 25 && captureProgress < 50 && 'Analyzing head position...'}
                  {captureProgress >= 50 && captureProgress < 75 && 'Measuring shoulder alignment...'}
                  {captureProgress >= 75 && captureProgress < 100 && 'Calculating spine curve...'}
                  {captureProgress === 100 && 'Calibration complete!'}
                </p>
              </div>
            )}
          </div>
        )

      case 'review':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Your Ideal Posture Baseline</h2>
              <p className="text-gray-600">Review your calibration results</p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Captured Image</h3>
                <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <User className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Calibration Image</p>
                    </div>
                  </div>
                  
                  {/* Skeletal overlay visualization */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                    </div>
                    <div className="absolute top-1/3 left-1/3">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                    </div>
                    <div className="absolute top-1/3 right-1/3">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold">Calibration Metrics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Head Angle</span>
                    <Badge variant="outline">{calibrationData?.headAngle}°</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Shoulder Symmetry</span>
                    <Badge variant="outline">{calibrationData?.shoulderSymmetry}%</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Spine Alignment</span>
                    <Badge variant="outline">{calibrationData?.spineAlignment}%</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Confidence Score</span>
                    <Badge className="bg-green-100 text-green-800">
                      {calibrationData?.confidence}% accurate
                    </Badge>
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Excellent!</strong> Your baseline has been captured successfully. 
                    Spine Mate will now alert you when you deviate from this position.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      case 'complete':
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-4">Calibration Complete!</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                You're all set to start monitoring your posture! Spine Mate will now track your alignment 
                in real-time and provide gentle reminders when you need to adjust.
              </p>
            </div>
            
            <div className="bg-blue-50 p-6 rounded-lg max-w-md mx-auto">
              <h3 className="font-semibold text-blue-800 mb-3">Pro Tips for Success:</h3>
              <ul className="text-left text-blue-700 space-y-2">
                <li>• Recalibrate weekly as you improve</li>
                <li>• Ensure consistent lighting during sessions</li>
                <li>• Keep camera lens clean</li>
                <li>• Maintain similar distance during sessions</li>
              </ul>
            </div>
            
            <div className="flex justify-center">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                Go to Dashboard
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const currentStepIndex = steps.findIndex(step => step.id === currentStep)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Spine<span className="text-indigo-600">Mate</span></span>
            </div>
            <Badge variant="outline">
              Step {currentStepIndex + 1} of {steps.length}
            </Badge>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Progress value={((currentStepIndex + 1) / steps.length) * 100} className="h-2" />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>{steps[currentStepIndex]?.title}</CardTitle>
            <CardDescription>{steps[currentStepIndex]?.description}</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            {renderStep()}
            
            {/* Navigation */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 'intro'}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                
                {currentStep !== 'complete' && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      stopCamera()
                      window.location.href = '/'
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Skip for now
                  </Button>
                )}
              </div>
              
              {currentStep === 'review' ? (
                <div className="space-x-2">
                  <Button variant="outline" onClick={retakeCalibration}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Retake
                  </Button>
                  <Button
                    onClick={completeCalibration}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Looks Good
                  </Button>
                </div>
              ) : currentStep === 'complete' ? (
                <Button
                  onClick={completeCalibration}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  Go to Dashboard
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : currentStep === 'capture' ? (
                <Button disabled>
                  Capturing...
                </Button>
              ) : (
                <Button
                  onClick={nextStep}
                  disabled={currentStep === 'positioning' && !isPositioningCorrect}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {currentStep === 'instructions' ? (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Start Capture
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRight className="w-4 h-4 mr-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}