import { Card, CardContent } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import type { Achievement } from "@db/schema";

interface AchievementBadgeProps {
  achievement: Achievement;
}

export default function AchievementBadge({ achievement }: AchievementBadgeProps) {
  return (
    <Card className="relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 group-hover:opacity-75 transition-opacity" />
      <CardContent className="p-4 flex items-center gap-3">
        <div className="bg-primary/10 p-2 rounded-full">
          <Trophy className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">{achievement.title}</h3>
          <p className="text-xs text-muted-foreground">{achievement.description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
