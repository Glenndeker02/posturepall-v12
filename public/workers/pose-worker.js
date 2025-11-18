/**
 * Web Worker for TensorFlow.js Pose Detection
 * Runs pose detection in a background thread to keep UI responsive
 */

// Import TensorFlow.js in worker
importScripts('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js');
importScripts('https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection@2.1.3/dist/pose-detection.min.js');

let detector = null;
let isInitialized = false;

/**
 * Initialize the pose detector
 */
async function initializeDetector(modelType = 'thunder') {
  try {
    // Set backend to WebGL
    await tf.setBackend('webgl');
    await tf.ready();

    const detectorConfig = {
      modelType: modelType === 'thunder'
        ? poseDetection.movenet.modelType.SINGLEPOSE_THUNDER
        : poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
      enableSmoothing: true,
      minPoseScore: 0.3,
    };

    detector = await poseDetection.createDetector(
      poseDetection.SupportedModels.MoveNet,
      detectorConfig
    );

    isInitialized = true;

    // Send success message
    self.postMessage({
      type: 'initialized',
      success: true,
    });
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: error.message,
    });
  }
}

/**
 * Process a single frame
 */
async function processFrame(imageData) {
  if (!detector || !isInitialized) {
    self.postMessage({
      type: 'error',
      error: 'Detector not initialized',
    });
    return;
  }

  try {
    // Create ImageData from the transferred data
    const imgData = new ImageData(
      new Uint8ClampedArray(imageData.data),
      imageData.width,
      imageData.height
    );

    // Create an OffscreenCanvas
    const canvas = new OffscreenCanvas(imageData.width, imageData.height);
    const ctx = canvas.getContext('2d');
    ctx.putImageData(imgData, 0, 0);

    // Run pose estimation
    const poses = await detector.estimatePoses(canvas);

    if (poses.length > 0) {
      // Send pose data back to main thread
      self.postMessage({
        type: 'pose',
        pose: poses[0],
        timestamp: Date.now(),
      });
    } else {
      self.postMessage({
        type: 'pose',
        pose: null,
        timestamp: Date.now(),
      });
    }
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: error.message,
    });
  }
}

/**
 * Message handler
 */
self.onmessage = async function(e) {
  const { type, data } = e.data;

  switch (type) {
    case 'init':
      await initializeDetector(data.modelType);
      break;

    case 'process':
      await processFrame(data.imageData);
      break;

    case 'dispose':
      if (detector) {
        detector.dispose();
        detector = null;
        isInitialized = false;
      }
      self.postMessage({
        type: 'disposed',
        success: true,
      });
      break;

    default:
      self.postMessage({
        type: 'error',
        error: `Unknown message type: ${type}`,
      });
  }
};
