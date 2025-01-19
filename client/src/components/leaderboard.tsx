import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Medal, Trophy, TrendingUp, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import AchievementBadge from "./achievement-badge";
import type { Achievement } from "@db/schema";

interface LeaderboardEntry {
  id: number;
  username: string;
  points: number;
  level: number;
  rank?: number;
  achievements?: Achievement[];
  completedChallenges: number;
  winRate: number;
}

export default function Leaderboard() {
  const { data: leaderboard } = useQuery<LeaderboardEntry[]>({
    queryKey: ['/api/leaderboard'],
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-semibold">
          <Trophy className="h-5 w-5 text-primary" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {leaderboard?.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <div className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-background to-primary/5 hover:from-primary/10 hover:to-primary/10 transition-colors">
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
                  <div className="flex items-center gap-2">
                    <div className="font-medium">{entry.username}</div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="w-3 h-3" />
                      Level {entry.level}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Trophy className="w-3 h-3" />
                      {entry.completedChallenges} challenges
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {entry.winRate}% win rate
                    </div>
                  </div>
                  {entry.achievements && entry.achievements.length > 0 && (
                    <div className="mt-2 flex gap-2 overflow-x-auto pb-2">
                      {entry.achievements.slice(0, 3).map((achievement) => (
                        <div key={achievement.id} className="flex-shrink-0 w-32">
                          <AchievementBadge achievement={achievement} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-semibold">{entry.points}</div>
                  <div className="text-xs text-muted-foreground">points</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}