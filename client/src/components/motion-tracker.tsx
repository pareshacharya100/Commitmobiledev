import { useMotion } from "@/hooks/use-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Square } from "lucide-react";

interface MotionTrackerProps {
  exerciseType: string;
  onRepCount: (count: number) => void;
}

export default function MotionTracker({ exerciseType, onRepCount }: MotionTrackerProps) {
  const { videoRef, canvasRef, count, isTracking, startTracking, stopTracking } = useMotion(exerciseType);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Motion Tracker</span>
          <div className="text-2xl font-bold">{count}</div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            playsInline
          />
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            width={640}
            height={480}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            {!isTracking && (
              <div className="text-white text-center bg-black/50 p-4 rounded-lg">
                <p className="mb-2">Position yourself in view</p>
                <p className="text-sm mb-4 text-gray-300">
                  {exerciseType === 'pushup' && 'Face the camera from the side for push-ups'}
                  {exerciseType === 'squat' && 'Face the camera from the side for squats'}
                  {exerciseType === 'situp' && 'Position camera to see your full body for sit-ups'}
                </p>
                <Button onClick={startTracking} size="sm">
                  <Play className="w-4 h-4 mr-2" />
                  Start Tracking
                </Button>
              </div>
            )}
          </div>
        </div>
        {isTracking && (
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => {
              stopTracking();
              onRepCount(count);
            }}
          >
            <Square className="w-4 h-4 mr-2" />
            Stop Tracking
          </Button>
        )}
      </CardContent>
    </Card>
  );
}