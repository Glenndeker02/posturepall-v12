/**
 * Pose Visualizer Component
 * Renders skeletal overlay on video feed showing detected keypoints and connections
 */

'use client';

import React, { useRef, useEffect } from 'react';
import type { DetectedPose, NamedKeypoint } from '@/lib/ai/types';

interface PoseVisualizerProps {
  pose: DetectedPose | null;
  videoElement: HTMLVideoElement | null;
  showSkeleton?: boolean;
  showKeypoints?: boolean;
  highlightIssues?: boolean;
  className?: string;
}

/**
 * Keypoint connections for drawing skeleton
 */
const POSE_CONNECTIONS = [
  // Face
  ['left_ear', 'left_eye'],
  ['left_eye', 'nose'],
  ['nose', 'right_eye'],
  ['right_eye', 'right_ear'],

  // Torso
  ['left_shoulder', 'right_shoulder'],
  ['left_shoulder', 'left_hip'],
  ['right_shoulder', 'right_hip'],
  ['left_hip', 'right_hip'],

  // Left arm
  ['left_shoulder', 'left_elbow'],
  ['left_elbow', 'left_wrist'],

  // Right arm
  ['right_shoulder', 'right_elbow'],
  ['right_elbow', 'right_wrist'],
];

export function PoseVisualizer({
  pose,
  videoElement,
  showSkeleton = true,
  showKeypoints = true,
  highlightIssues = false,
  className = '',
}: PoseVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    if (!canvas || !ctx || !videoElement || !pose) {
      return;
    }

    // Match canvas size to video
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw skeleton connections
    if (showSkeleton) {
      drawSkeleton(ctx, pose);
    }

    // Draw keypoints
    if (showKeypoints) {
      drawKeypoints(ctx, pose, highlightIssues);
    }
  }, [pose, videoElement, showSkeleton, showKeypoints, highlightIssues]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ mixBlendMode: 'normal' }}
    />
  );
}

/**
 * Draw skeleton connections
 */
function drawSkeleton(ctx: CanvasRenderingContext2D, pose: DetectedPose): void {
  ctx.strokeStyle = '#10b981'; // Emerald green
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';

  POSE_CONNECTIONS.forEach(([start, end]) => {
    const startPoint = pose.keypoints.find((kp) => kp.name === start);
    const endPoint = pose.keypoints.find((kp) => kp.name === end);

    if (
      startPoint &&
      endPoint &&
      startPoint.score &&
      endPoint.score &&
      startPoint.score > 0.3 &&
      endPoint.score > 0.3
    ) {
      // Vary opacity based on confidence
      const minConfidence = Math.min(startPoint.score, endPoint.score);
      ctx.globalAlpha = minConfidence;

      ctx.beginPath();
      ctx.moveTo(startPoint.x, startPoint.y);
      ctx.lineTo(endPoint.x, endPoint.y);
      ctx.stroke();
    }
  });

  ctx.globalAlpha = 1.0;
}

/**
 * Draw keypoints with color coding by confidence
 */
function drawKeypoints(
  ctx: CanvasRenderingContext2D,
  pose: DetectedPose,
  highlightIssues: boolean
): void {
  pose.keypoints.forEach((kp) => {
    if (!kp.score || kp.score < 0.3) {
      return; // Skip low-confidence keypoints
    }

    // Color code by confidence
    let color: string;
    if (kp.score >= 0.7) {
      color = '#10b981'; // Green - high confidence
    } else if (kp.score >= 0.5) {
      color = '#eab308'; // Yellow - medium confidence
    } else {
      color = '#ef4444'; // Red - low confidence
    }

    // Highlight problem areas if enabled
    if (highlightIssues && isProblematicKeypoint(kp)) {
      color = '#f59e0b'; // Orange for problem areas
      drawPulse(ctx, kp.x, kp.y, 12);
    }

    // Draw keypoint
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
    ctx.fill();

    // Draw outline
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw label for important keypoints (in debug mode)
    if (kp.name && shouldShowLabel(kp.name)) {
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px sans-serif';
      ctx.fillText(kp.name, kp.x + 8, kp.y - 8);
    }
  });
}

/**
 * Draw pulsing circle for problem areas
 */
function drawPulse(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number): void {
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.5;

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.stroke();

  ctx.globalAlpha = 1.0;
}

/**
 * Determine if keypoint is in a problematic area
 * (This would ideally use actual posture metrics)
 */
function isProblematicKeypoint(kp: NamedKeypoint): boolean {
  // Placeholder logic - in real implementation, check against posture metrics
  const problematicAreas = ['left_ear', 'right_ear', 'left_shoulder', 'right_shoulder'];
  return problematicAreas.includes(kp.name || '');
}

/**
 * Determine if label should be shown for keypoint
 */
function shouldShowLabel(name: string): boolean {
  const labeledPoints = ['nose', 'left_shoulder', 'right_shoulder'];
  return labeledPoints.includes(name);
}

/**
 * Export canvas as image (for debugging/screenshots)
 */
export function exportPoseVisualization(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL('image/png');
}
