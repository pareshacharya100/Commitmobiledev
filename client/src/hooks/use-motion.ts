import { useState, useEffect, useRef } from 'react';
import { Camera } from '@mediapipe/camera_utils';
import { Pose, Results } from '@mediapipe/pose';

export function useMotion(exerciseType: string) {
  const [count, setCount] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const poseRef = useRef<Pose | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;

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
      if (!results.poseLandmarks) return;

      switch (exerciseType) {
        case 'pushup':
          detectPushup(results.poseLandmarks);
          break;
        case 'squat':
          detectSquat(results.poseLandmarks);
          break;
        case 'situp':
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

  const detectPushup = (landmarks: any) => {
    // Implement pushup detection logic using landmarks
    // Check elbow angle and body position
    const leftElbow = landmarks[13];
    const leftWrist = landmarks[15];
    const leftShoulder = landmarks[11];

    if (leftElbow && leftWrist && leftShoulder) {
      // Calculate angles and detect pushup motion
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
    // Implement squat detection logic using landmarks
    const leftHip = landmarks[23];
    const leftKnee = landmarks[25];
    const leftAnkle = landmarks[27];

    if (leftHip && leftKnee && leftAnkle) {
      const angle = calculateAngle(leftHip, leftKnee, leftAnkle);
      // Detect squat motion based on knee angle
      if (angle < 90 && !isDown) {
        setIsDown(true);
      } else if (angle > 160 && isDown) {
        setIsDown(false);
        setCount(prev => prev + 1);
      }
    }
  };

  const detectSitup = (landmarks: any) => {
    // Implement situp detection logic using landmarks
    const leftShoulder = landmarks[11];
    const leftHip = landmarks[23];
    const leftKnee = landmarks[25];

    if (leftShoulder && leftHip && leftKnee) {
      const angle = calculateAngle(leftShoulder, leftHip, leftKnee);
      // Detect situp motion based on trunk angle
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

  const [isDown, setIsDown] = useState(false);

  const startTracking = () => {
    setIsTracking(true);
    setCount(0);
  };

  const stopTracking = () => {
    setIsTracking(false);
  };

  return {
    videoRef,
    count,
    isTracking,
    startTracking,
    stopTracking
  };
}