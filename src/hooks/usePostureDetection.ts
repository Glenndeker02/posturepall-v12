/**
 * Custom hook for real-time posture detection using MoveNet
 * Manages model loading, pose detection, and posture analysis
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  loadMoveNetModel,
  disposeDetector,
  warmUpModel,
  estimateDevicePerformance,
} from '@/lib/ai/movenet-loader';
import {
  detectPoseFromVideo,
  initializeDetectorState,
  setFrameRate,
} from '@/lib/ai/pose-detector';
import { calculatePostureMetrics, getPostureScorePercentage } from '@/lib/ai/posture-metrics';
import { processPostureMetrics, setAlertConfig } from '@/lib/posture/alert-system';
import type { PostureMetrics, DetectedPose, PostureAlert, CalibrationData } from '@/lib/ai/types';

export interface PostureDetectionState {
  isModelLoaded: boolean;
  isDetecting: boolean;
  loadingProgress: number;
  error: string | null;
  currentMetrics: PostureMetrics | null;
  currentPose: DetectedPose | null;
  currentAlert: PostureAlert | null;
}

export function usePostureDetection(
  videoElement: HTMLVideoElement | null,
  calibrationData: CalibrationData | null,
  isActive: boolean
) {
  const [state, setState] = useState<PostureDetectionState>({
    isModelLoaded: false,
    isDetecting: false,
    loadingProgress: 0,
    error: null,
    currentMetrics: null,
    currentPose: null,
    currentAlert: null,
  });

  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const frameCountRef = useRef(0);

  /**
   * Load MoveNet model on mount
   */
  useEffect(() => {
    let isMounted = true;

    const loadModel = async () => {
      try {
        // Estimate device performance and set appropriate FPS
        const recommendedFps = await estimateDevicePerformance();

        setState((prev) => ({ ...prev, loadingProgress: 10 }));

        // Load model with progress callback
        const detector = await loadMoveNetModel(undefined, (progress) => {
          if (isMounted) {
            setState((prev) => ({ ...prev, loadingProgress: progress }));
          }
        });

        // Warm up model
        await warmUpModel(detector);

        // Initialize detector state
        initializeDetectorState(recommendedFps);
        setFrameRate(recommendedFps);

        if (isMounted) {
          setState((prev) => ({
            ...prev,
            isModelLoaded: true,
            loadingProgress: 100,
          }));
        }
      } catch (error) {
        console.error('Failed to load MoveNet model:', error);
        if (isMounted) {
          setState((prev) => ({
            ...prev,
            error: error instanceof Error ? error.message : 'Failed to load model',
          }));
        }
      }
    };

    loadModel();

    return () => {
      isMounted = false;
      disposeDetector();
    };
  }, []);

  /**
   * Perform pose detection and analysis
   */
  const detectAndAnalyze = useCallback(async () => {
    if (!videoElement || !state.isModelLoaded || !isActive) {
      return;
    }

    try {
      setState((prev) => ({ ...prev, isDetecting: true }));

      // Detect pose from video
      const pose = await detectPoseFromVideo(videoElement);

      if (!pose) {
        setState((prev) => ({ ...prev, isDetecting: false }));
        return;
      }

      // Calculate posture metrics
      const metrics = calculatePostureMetrics(pose, calibrationData);

      // Process for alerts
      const alert = processPostureMetrics(metrics);

      // Update state
      setState((prev) => ({
        ...prev,
        currentPose: pose,
        currentMetrics: metrics,
        currentAlert: alert || prev.currentAlert,
        isDetecting: false,
      }));

      frameCountRef.current++;
    } catch (error) {
      console.error('Detection error:', error);
      setState((prev) => ({
        ...prev,
        isDetecting: false,
        error: error instanceof Error ? error.message : 'Detection failed',
      }));
    }
  }, [videoElement, state.isModelLoaded, isActive, calibrationData]);

  /**
   * Start/stop detection loop
   */
  useEffect(() => {
    if (isActive && state.isModelLoaded && videoElement) {
      // Run detection at 10 FPS (100ms intervals)
      // Actual processing will be throttled by pose-detector based on device capability
      detectionIntervalRef.current = setInterval(() => {
        detectAndAnalyze();
      }, 100);
    } else {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
      }
    }

    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, [isActive, state.isModelLoaded, videoElement, detectAndAnalyze]);

  /**
   * Configure alert settings
   */
  const configureAlerts = useCallback((config: Parameters<typeof setAlertConfig>[0]) => {
    setAlertConfig(config);
  }, []);

  /**
   * Dismiss current alert
   */
  const dismissAlert = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentAlert: prev.currentAlert
        ? { ...prev.currentAlert, dismissed: true }
        : null,
    }));
  }, []);

  /**
   * Get user-friendly posture score
   */
  const getScore = useCallback((): number => {
    if (!state.currentMetrics) return 0;
    return getPostureScorePercentage(state.currentMetrics);
  }, [state.currentMetrics]);

  return {
    ...state,
    detectAndAnalyze,
    configureAlerts,
    dismissAlert,
    getScore,
    frameCount: frameCountRef.current,
  };
}
