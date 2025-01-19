import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";
import ChallengeCard from "@/components/challenge-card";
import Leaderboard from "@/components/leaderboard";
import { useState } from "react";
import ChallengeWizard from "@/components/challenge-wizard";
import { useChallenges } from "@/hooks/use-challenges";
import { useToast } from "@/hooks/use-toast";
import { Watch } from "lucide-react";
import { useLocation } from "wouter";
import { addDays } from "date-fns";

export default function Home() {
  const { user, logout } = useUser();
  const { challenges, createChallenge } = useChallenges();
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const { toast } = useToast();
  const [_, setLocation] = useLocation();

  const handleCreateChallenge = async (values: any) => {
    try {
      await createChallenge(values);
      setIsWizardOpen(false);
      toast({
        title: "Success",
        description: "Challenge created successfully!"
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Commit.ai
          </h1>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setLocation('/devices')}>
              <Watch className="h-4 w-4 mr-2" />
              Devices
            </Button>
            <div className="text-sm text-muted-foreground">
              Level {user?.level} | {user?.points} points
            </div>
            <Button variant="outline" onClick={() => logout()}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Active Challenges</h2>
              <Button onClick={() => setIsWizardOpen(true)}>
                Create Challenge
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {challenges?.map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <Leaderboard />
          </div>
        </div>
      </main>

      <ChallengeWizard
        open={isWizardOpen}
        onOpenChange={setIsWizardOpen}
        onSubmit={handleCreateChallenge}
      />
    </div>
  );
}