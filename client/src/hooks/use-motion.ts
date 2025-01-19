import { useState, useEffect, useRef } from 'react';
import { Camera } from '@mediapipe/camera_utils';
import { Pose, Results } from '@mediapipe/pose';

export function useMotion(exerciseType: string) {
  const [count, setCount] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [poseData, setPoseData] = useState<Results | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const poseRef = useRef<Pose | null>(null);

  useEffect(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const pose = new Pose({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
      }
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    poseRef.current = pose;

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        if (poseRef.current && videoRef.current) {
          await poseRef.current.send({ image: videoRef.current });
        }
      },
      width: 640,
      height: 480
    });

    pose.onResults((results: Results) => {
      if (!results.poseLandmarks || !canvasRef.current) return;

      setPoseData(results);
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      // Draw pose landmarks
      drawPoseLandmarks(ctx, results.poseLandmarks);

      // Draw exercise-specific guides
      switch (exerciseType) {
        case 'pushup':
          drawPushupGuides(ctx, results.poseLandmarks);
          detectPushup(results.poseLandmarks);
          break;
        case 'squat':
          drawSquatGuides(ctx, results.poseLandmarks);
          detectSquat(results.poseLandmarks);
          break;
        case 'situp':
          drawSitupGuides(ctx, results.poseLandmarks);
          detectSitup(results.poseLandmarks);
          break;
      }
    });

    camera.start()
      .catch(error => {
        console.error('Failed to start camera:', error);
      });

    return () => {
      camera.stop();
      pose.close();
    };
  }, [exerciseType]);

  const drawPoseLandmarks = (ctx: CanvasRenderingContext2D, landmarks: any[]) => {
    ctx.fillStyle = '#00FF00';
    landmarks.forEach((landmark) => {
      ctx.beginPath();
      ctx.arc(landmark.x * ctx.canvas.width, landmark.y * ctx.canvas.height, 5, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Draw connections between landmarks
    ctx.strokeStyle = '#00FF00';
    ctx.lineWidth = 2;
    drawBodyConnections(ctx, landmarks);
  };

  const drawBodyConnections = (ctx: CanvasRenderingContext2D, landmarks: any[]) => {
    // Define connections for body parts
    const connections = [
      // Torso
      [11, 12], [12, 24], [24, 23], [23, 11],
      // Right arm
      [12, 14], [14, 16],
      // Left arm
      [11, 13], [13, 15],
      // Right leg
      [24, 26], [26, 28],
      // Left leg
      [23, 25], [25, 27]
    ];

    connections.forEach(([start, end]) => {
      ctx.beginPath();
      ctx.moveTo(
        landmarks[start].x * ctx.canvas.width,
        landmarks[start].y * ctx.canvas.height
      );
      ctx.lineTo(
        landmarks[end].x * ctx.canvas.width,
        landmarks[end].y * ctx.canvas.height
      );
      ctx.stroke();
    });
  };

  const drawPushupGuides = (ctx: CanvasRenderingContext2D, landmarks: any[]) => {
    // Draw target zones for proper pushup form
    const leftElbow = landmarks[13];
    const leftShoulder = landmarks[11];
    ctx.strokeStyle = '#FF0000';
    ctx.beginPath();
    ctx.arc(
      leftElbow.x * ctx.canvas.width,
      leftElbow.y * ctx.canvas.height,
      50,
      0,
      2 * Math.PI
    );
    ctx.stroke();

    // Draw angle guide
    const angle = calculateAngle(landmarks[11], landmarks[13], landmarks[15]);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '20px Arial';
    ctx.fillText(`Elbow Angle: ${Math.round(angle)}°`, 10, 30);
  };

  const drawSquatGuides = (ctx: CanvasRenderingContext2D, landmarks: any[]) => {
    // Draw target zones for proper squat form
    const leftHip = landmarks[23];
    const leftKnee = landmarks[25];
    ctx.strokeStyle = '#FF0000';
    ctx.beginPath();
    ctx.arc(
      leftKnee.x * ctx.canvas.width,
      leftKnee.y * ctx.canvas.height,
      50,
      0,
      2 * Math.PI
    );
    ctx.stroke();

    // Draw angle guide
    const angle = calculateAngle(landmarks[23], landmarks[25], landmarks[27]);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '20px Arial';
    ctx.fillText(`Knee Angle: ${Math.round(angle)}°`, 10, 30);
  };

  const drawSitupGuides = (ctx: CanvasRenderingContext2D, landmarks: any[]) => {
    // Draw target zones for proper situp form
    const hip = landmarks[24];
    ctx.strokeStyle = '#FF0000';
    ctx.beginPath();
    ctx.arc(
      hip.x * ctx.canvas.width,
      hip.y * ctx.canvas.height,
      50,
      0,
      2 * Math.PI
    );
    ctx.stroke();

    // Draw angle guide
    const angle = calculateAngle(landmarks[12], landmarks[24], landmarks[26]);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '20px Arial';
    ctx.fillText(`Core Angle: ${Math.round(angle)}°`, 10, 30);
  };

  const [isDown, setIsDown] = useState(false);

  const detectPushup = (landmarks: any) => {
    const leftElbow = landmarks[13];
    const leftWrist = landmarks[15];
    const leftShoulder = landmarks[11];

    if (leftElbow && leftWrist && leftShoulder) {
      const angle = calculateAngle(leftShoulder, leftElbow, leftWrist);
      if (angle < 90 && !isDown) {
        setIsDown(true);
      } else if (angle > 160 && isDown) {
        setIsDown(false);
        setCount(prev => prev + 1);
      }
    }
  };

  const detectSquat = (landmarks: any) => {
    const leftHip = landmarks[23];
    const leftKnee = landmarks[25];
    const leftAnkle = landmarks[27];

    if (leftHip && leftKnee && leftAnkle) {
      const angle = calculateAngle(leftHip, leftKnee, leftAnkle);
      if (angle < 90 && !isDown) {
        setIsDown(true);
      } else if (angle > 160 && isDown) {
        setIsDown(false);
        setCount(prev => prev + 1);
      }
    }
  };

  const detectSitup = (landmarks: any) => {
    const leftShoulder = landmarks[11];
    const leftHip = landmarks[23];
    const leftKnee = landmarks[25];

    if (leftShoulder && leftHip && leftKnee) {
      const angle = calculateAngle(leftShoulder, leftHip, leftKnee);
      if (angle < 45 && !isDown) {
        setIsDown(true);
      } else if (angle > 120 && isDown) {
        setIsDown(false);
        setCount(prev => prev + 1);
      }
    }
  };

  const calculateAngle = (pointA: any, pointB: any, pointC: any) => {
    const radians = Math.atan2(pointC.y - pointB.y, pointC.x - pointB.x) -
                   Math.atan2(pointA.y - pointB.y, pointA.x - pointB.x);
    let angle = Math.abs(radians * 180.0 / Math.PI);
    if (angle > 180.0) {
      angle = 360 - angle;
    }
    return angle;
  };

  const startTracking = () => {
    setIsTracking(true);
    setCount(0);
  };

  const stopTracking = () => {
    setIsTracking(false);
  };

  return {
    videoRef,
    canvasRef,
    count,
    isTracking,
    poseData,
    startTracking,
    stopTracking
  };
}