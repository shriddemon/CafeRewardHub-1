import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, Info, Gift, Trophy, Clock } from "lucide-react";
import { Game } from "@/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface GameCardProps {
  game: Game;
  onPlay: () => void;
}

export default function GameCard({ game, onPlay }: GameCardProps) {
  // Calculate if the game can be played today based on maxPlaysPerDay
  const [playsToday, setPlaysToday] = useState(0); // In a real app, this would come from an API
  const canPlay = playsToday < game.maxPlaysPerDay;

  // Choose appropriate icon based on game type
  const getGameIcon = (type: string) => {
    switch (type) {
      case "spin_wheel":
        return (
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="2" x2="12" y2="4"></line>
              <line x1="12" y1="20" x2="12" y2="22"></line>
              <line x1="2" y1="12" x2="4" y2="12"></line>
              <line x1="20" y1="12" x2="22" y2="12"></line>
              <line x1="4.93" y1="4.93" x2="6.34" y2="6.34"></line>
              <line x1="17.66" y1="17.66" x2="19.07" y2="19.07"></line>
              <line x1="4.93" y1="19.07" x2="6.34" y2="17.66"></line>
              <line x1="17.66" y1="6.34" x2="19.07" y2="4.93"></line>
            </svg>
          </div>
        );
      case "scratch_card":
        return (
          <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">
            <Gift className="h-6 w-6" />
          </div>
        );
      case "quiz":
      case "coffee_quiz":
        return (
          <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
        );
      case "memory_card":
        return (
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <rect x="6" y="8" width="4" height="4" />
              <rect x="14" y="8" width="4" height="4" />
              <rect x="6" y="16" width="4" height="0" />
              <rect x="14" y="16" width="4" height="0" />
            </svg>
          </div>
        );
      case "word_scramble":
        return (
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 20l4-16m2 16l4-16" />
              <path d="M3 8h18" />
              <path d="M3 16h18" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            <PlayCircle className="h-6 w-6" />
          </div>
        );
    }
  };

  const getPrizeRangeText = () => {
    if (game.prizes && game.prizes.length > 0) {
      // Find the highest point value prize
      const maxPointsPrize = game.prizes.reduce((max, prize) => 
        prize.type === 'points' && prize.value > max.value ? prize : max, 
        {value: 0}
      );
      
      // See if there are reward-type prizes
      const hasRewards = game.prizes.some(prize => prize.type === 'reward');
      
      switch (game.type) {
        case "spin_wheel":
          return `Spin to win up to ${maxPointsPrize.value} points${hasRewards ? ' and rewards' : ''}!`;
        case "scratch_card":
          return `Scratch to win up to ${maxPointsPrize.value} points${hasRewards ? ' and rewards' : ''}!`;
        case "quiz":
        case "coffee_quiz":
          return `Answer correctly to earn up to ${maxPointsPrize.value} points!`;
        case "memory_card":
          return `Match cards to win up to ${maxPointsPrize.value} points!`;
        case "word_scramble":
          return `Unscramble words to win up to ${maxPointsPrize.value} points!`;
        default:
          return `Play and win up to ${maxPointsPrize.value} points${hasRewards ? ' and rewards' : ''}!`;
      }
    } else {
      // Default texts when no prizes are defined
      switch (game.type) {
        case "spin_wheel":
          return "Spin to win exciting rewards!";
        case "scratch_card":
          return "Scratch and win exciting rewards!";
        case "quiz":
        case "coffee_quiz":
          return "Answer correctly to earn points!";
        case "memory_card":
          return "Match cards to win rewards!";
        case "word_scramble":
          return "Unscramble words to win rewards!";
        default:
          return "Play and win rewards!";
      }
    }
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardContent className="p-0">
        <div className="p-4">
          <div className="flex justify-between items-start">
            <div className="flex items-start">
              {getGameIcon(game.type)}
              <div className="ml-3">
                <div className="flex items-center">
                  <h3 className="font-bold text-lg">{game.name}</h3>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 ml-2 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">{game.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <p className="text-sm text-gray-600 mt-1">{getPrizeRangeText()}</p>
              </div>
            </div>
            
            <Badge variant={canPlay ? "outline" : "secondary"} className={canPlay ? "bg-green-50 text-green-700" : ""}>
              {canPlay ? "Available" : "Played Today"}
            </Badge>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-1" />
              <span>{playsToday}/{game.maxPlaysPerDay} plays today</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-500">
              <Trophy className="h-4 w-4 mr-1" />
              <span>Win up to {game.prizes && game.prizes.length > 0 
                ? Math.max(...game.prizes.filter(p => p.type === 'points').map(p => p.value), 0)
                : 100} points</span>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 border-t">
          <Button 
            onClick={onPlay} 
            className="w-full bg-primary hover:bg-primary/90"
            disabled={!canPlay}
          >
            {canPlay ? (
              <>
                <PlayCircle className="mr-2 h-4 w-4" />
                Play Now
              </>
            ) : (
              <>
                Come Back Tomorrow
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
