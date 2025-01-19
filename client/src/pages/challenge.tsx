import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import MotionTracker from "@/components/motion-tracker";
import { useChallenges } from "@/hooks/use-challenges";
import { useToast } from "@/hooks/use-toast";
import { Users, Trophy, Timer } from "lucide-react";
import type { Challenge } from "@db/schema";

export default function ChallengePage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { updateProgress } = useChallenges();

  const { data: challenge } = useQuery<Challenge>({
    queryKey: [`/api/challenges/${id}`],
  });

  if (!challenge) {
    return null;
  }

  const handleRepCount = async (count: number) => {
    try {
      await updateProgress({
        challengeId: challenge.id,
        reps: count,
      });
      toast({
        title: "Success",
        description: `Added ${count} reps to your progress!`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold">{challenge.title}</h1>
            <p className="text-muted-foreground">{challenge.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Trophy className="w-5 h-5 text-primary" />
                    <div>
                      <div className="text-sm font-medium">Target</div>
                      <div className="text-2xl font-bold">
                        {challenge.targetReps} {challenge.type}s
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-primary" />
                    <div>
                      <div className="text-sm font-medium">Participants</div>
                      <div className="text-2xl font-bold">3</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Timer className="w-5 h-5 text-primary" />
                    <div>
                      <div className="text-sm font-medium">Time Left</div>
                      <div className="text-2xl font-bold">
                        {new Date(challenge.endDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <MotionTracker
            exerciseType={challenge.type}
            onRepCount={handleRepCount}
          />

          <Card>
            <CardHeader>
              <CardTitle>Participants Progress</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Add participant progress visualization here */}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
