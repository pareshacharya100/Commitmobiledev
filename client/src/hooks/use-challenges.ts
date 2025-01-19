import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Challenge } from '@db/schema';

export function useChallenges() {
  const queryClient = useQueryClient();

  const { data: challenges } = useQuery<Challenge[]>({
    queryKey: ['/api/challenges'],
  });

  const createChallenge = useMutation({
    mutationFn: async (challenge: Partial<Challenge>) => {
      const response = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(challenge),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/challenges'] });
    },
  });

  const joinChallenge = useMutation({
    mutationFn: async (challengeId: number) => {
      const response = await fetch(`/api/challenges/${challengeId}/join`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/challenges'] });
    },
  });

  const updateProgress = useMutation({
    mutationFn: async ({ challengeId, reps }: { challengeId: number; reps: number }) => {
      const response = await fetch(`/api/challenges/${challengeId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reps }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/challenges'] });
    },
  });

  return {
    challenges,
    createChallenge: createChallenge.mutateAsync,
    joinChallenge: joinChallenge.mutateAsync,
    updateProgress: updateProgress.mutateAsync,
  };
}
