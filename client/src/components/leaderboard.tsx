import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Medal } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface LeaderboardEntry {
  id: number;
  username: string;
  points: number;
  level: number;
}

export default function Leaderboard() {
  const { data: leaderboard } = useQuery<LeaderboardEntry[]>({
    queryKey: ['/api/leaderboard'],
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Leaderboard</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {leaderboard?.map((entry, index) => (
            <div
              key={entry.id}
              className="flex items-center gap-4 p-3 rounded-lg bg-gradient-to-r from-background to-primary/5"
            >
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                {index < 3 ? (
                  <Medal className={`w-5 h-5 ${
                    index === 0 ? "text-yellow-500" :
                    index === 1 ? "text-gray-400" :
                    "text-amber-600"
                  }`} />
                ) : (
                  <span className="text-sm font-medium text-muted-foreground">
                    {index + 1}
                  </span>
                )}
              </div>
              <div className="flex-grow">
                <div className="font-medium">{entry.username}</div>
                <div className="text-sm text-muted-foreground">
                  Level {entry.level}
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{entry.points}</div>
                <div className="text-xs text-muted-foreground">points</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
