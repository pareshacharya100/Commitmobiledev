import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useChallenges } from "@/hooks/use-challenges";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/use-user";
import { CalendarDays, Trophy, Users } from "lucide-react";
import type { Challenge } from "@db/schema";
import { useLocation } from "wouter";

interface ChallengeCardProps {
  challenge: Challenge;
}

export default function ChallengeCard({ challenge }: ChallengeCardProps) {
  const { joinChallenge } = useChallenges();
  const { toast } = useToast();
  const { user } = useUser();
  const [_, setLocation] = useLocation();

  const handleJoin = async () => {
    try {
      await joinChallenge(challenge.id);
      toast({
        title: "Success",
        description: "You've joined the challenge!",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const progressPercentage = (challenge.currentReps || 0) / challenge.targetReps * 100;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 pb-8">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg">{challenge.title}</h3>
            <p className="text-sm text-muted-foreground">{challenge.description}</p>
          </div>
          <div className="bg-background/95 px-2 py-1 rounded text-xs font-medium">
            ${challenge.betAmount}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-primary" />
              <span>{challenge.targetReps} {challenge.type}s</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-primary" />
              <span>{new Date(challenge.endDate).toLocaleDateString()}</span>
            </div>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          <span>3 participants</span>
        </div>
        {challenge.creatorId === user?.id ? (
          <Button variant="secondary" onClick={() => setLocation(`/challenge/${challenge.id}`)}>
            View Details
          </Button>
        ) : (
          <Button onClick={handleJoin}>Join Challenge</Button>
        )}
      </CardFooter>
    </Card>
  );
}
