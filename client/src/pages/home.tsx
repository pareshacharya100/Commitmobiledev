import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";
import ChallengeCard from "@/components/challenge-card";
import Leaderboard from "@/components/leaderboard";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { useChallenges } from "@/hooks/use-challenges";
import { useToast } from "@/hooks/use-toast";
import { Watch } from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const { user, logout } = useUser();
  const { challenges, createChallenge } = useChallenges();
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [_, setLocation] = useLocation();

  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      type: "pushup",
      targetReps: 100,
      betAmount: 10
    }
  });

  const onSubmit = async (values: any) => {
    try {
      await createChallenge(values);
      setOpen(false);
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
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button>Create Challenge</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Challenge</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter challenge title" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter challenge description" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Exercise Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select exercise type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="pushup">Push-ups</SelectItem>
                                <SelectItem value="squat">Squats</SelectItem>
                                <SelectItem value="situp">Sit-ups</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="targetReps"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Target Reps</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="betAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bet Amount ($)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full">Create Challenge</Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
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
    </div>
  );
}